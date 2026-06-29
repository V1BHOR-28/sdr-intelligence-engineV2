import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAnalysis } from "@/lib/analysis-db";
import type { AnalysisResult } from "@/lib/types";

const SYSTEM_PROMPT = `You are a world-class Sales Development Manager with 15+ years of experience analyzing B2B and B2C sales calls. Your job is to analyze raw sales call transcripts and extract actionable intelligence for sales reps.

You MUST respond with ONLY valid JSON (no markdown fences, no commentary before or after) in EXACTLY this schema:

{
  "title": "A short 3-6 word identifier for the prospect (e.g. 'Sarah — Bossco Cafe')",
  "sentiment": "hot | warm | cold | negative",
  "dealStage": "Discovery | Qualified | Demo | Negotiation | Closed Won | Closed Lost | Nurture",
  "summary": "One paragraph (2-3 sentences) summarizing what happened on the call and the prospect's current state.",
  "objections": ["Specific objection 1", "Specific objection 2"],
  "competitors": ["Competitor or alternative mentioned, or empty array if none"],
  "crmSummary": ["3 short professional bullet points suitable for pasting into Salesforce/HubSpot activity log"],
  "actionPlan": ["3-5 specific, prioritized next steps the SDR should take within 48 hours"],
  "keyInsights": ["2-4 non-obvious strategic insights about this prospect — pain points, motivations, buying signals, or risks"],
  "followUpEmail": {
    "subject": "Compelling, specific subject line under 60 chars",
    "body": "A personalized 3-4 sentence follow-up email referencing specific points from the call. Use a professional but warm tone. Sign off as 'Your SDR Team'."
  },
  "nextSteps": ["2-3 longer-term strategic moves for the next 2-4 weeks"],
  "estimatedValue": "Low | Medium | High | Enterprise (estimated deal potential)"
}

Rules:
- Be specific. Reference actual quotes or details from the transcript when possible.
- If a field has no data (e.g. no competitors mentioned), use an empty array — never invent.
- The follow-up email must feel personal, not templated.
- Keep bullets concise (1 sentence each max).
- Output ONLY the JSON object.`;

// Pollinations.ai — 100% free, no API key, no sign-up required.
// Uses OpenAI-compatible message format with jsonMode for guaranteed JSON output.
// Docs: https://github.com/pollinations/pollinations
const POLLINATIONS_URL = "https://text.pollinations.ai/";
// "openai" model = GPT-4o-mini equivalent via Pollinations. Other options:
// "mistral", "llama", "qwen-coder", etc. See: https://text.pollinations.ai/models
const POLLINATIONS_MODEL = "openai";

interface AnalyzeRequest {
  transcript: string;
}

function extractJson(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) {
    throw new Error("No JSON object found in response");
  }
  cleaned = cleaned.slice(first, last + 1);
  return JSON.parse(cleaned);
}

function validateResult(obj: unknown): AnalysisResult {
  const r = obj as Record<string, unknown>;
  const fue = (r.followUpEmail as { subject?: string; body?: string } | undefined) ?? {};
  return {
    title:
      typeof r.title === "string" && r.title.trim()
        ? r.title.trim()
        : "Untitled Prospect",
    sentiment: ["hot", "warm", "cold", "negative"].includes(r.sentiment as string)
      ? (r.sentiment as AnalysisResult["sentiment"])
      : "warm",
    dealStage: [
      "Discovery",
      "Qualified",
      "Demo",
      "Negotiation",
      "Closed Won",
      "Closed Lost",
      "Nurture",
    ].includes(r.dealStage as string)
      ? (r.dealStage as AnalysisResult["dealStage"])
      : "Discovery",
    summary: typeof r.summary === "string" ? r.summary : "",
    objections: Array.isArray(r.objections)
      ? r.objections.filter((x): x is string => typeof x === "string")
      : [],
    competitors: Array.isArray(r.competitors)
      ? r.competitors.filter((x): x is string => typeof x === "string")
      : [],
    crmSummary: Array.isArray(r.crmSummary)
      ? r.crmSummary.filter((x): x is string => typeof x === "string")
      : [],
    actionPlan: Array.isArray(r.actionPlan)
      ? r.actionPlan.filter((x): x is string => typeof x === "string")
      : [],
    keyInsights: Array.isArray(r.keyInsights)
      ? r.keyInsights.filter((x): x is string => typeof x === "string")
      : [],
    followUpEmail: {
      subject: typeof fue.subject === "string" ? fue.subject : "Following up on our call",
      body: typeof fue.body === "string" ? fue.body : "",
    },
    nextSteps: Array.isArray(r.nextSteps)
      ? r.nextSteps.filter((x): x is string => typeof x === "string")
      : [],
    estimatedValue:
      typeof r.estimatedValue === "string" ? r.estimatedValue : "Medium",
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalyzeRequest;
    const transcript = body?.transcript?.trim();

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required." }, { status: 400 });
    }
    if (transcript.length < 30) {
      return NextResponse.json(
        { error: "Transcript is too short. Paste at least a couple of sentences." },
        { status: 400 }
      );
    }
    if (transcript.length > 20000) {
      return NextResponse.json(
        { error: "Transcript is too long (max 20,000 characters)." },
        { status: 400 }
      );
    }

    const maxAttempts = 3;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Call Pollinations.ai — no API key needed
        const pollinationsRes = await fetch(POLLINATIONS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Analyze this sales call transcript:\n\n${transcript}`,
              },
            ],
            model: POLLINATIONS_MODEL,
            jsonMode: true, // guarantees JSON output
            temperature: 0.1,
            seed: 42, // deterministic output for the same input
          }),
        });

        if (!pollinationsRes.ok) {
          const errText = await pollinationsRes.text().catch(() => "");
          throw new Error(
            `Pollinations API error ${pollinationsRes.status}: ${errText.slice(0, 200)}`
          );
        }

        // Pollinations returns the content as plain text (the model's response)
        const content = await pollinationsRes.text();
        if (!content || !content.trim()) {
          throw new Error("Empty response from Pollinations API");
        }

        const parsed = extractJson(content);
        const result = validateResult(parsed);

        // If the user is authenticated AND autoSave is enabled, persist to DB.
        let savedId: string | null = null;
        let savedAt: number | null = null;
        try {
          const session = await getServerSession(authOptions);
          if (session?.user?.id) {
            // Read autoSave preference
            const { getPreferences } = await import("@/lib/analysis-db");
            const prefs = await getPreferences(session.user.id);
            if (prefs.autoSaveAnalyses) {
              const saved = await createAnalysis(session.user.id, transcript, result);
              savedId = saved.id;
              savedAt = saved.createdAt;
            }
          }
        } catch (dbErr) {
          // DB failures should never break the analysis response
          console.error("Failed to persist analysis to DB:", dbErr);
        }

        return NextResponse.json({ success: true, result, savedId, savedAt });
      } catch (err) {
        lastError = err;
        if (attempt < maxAttempts - 1) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    console.error("Analyze API failed after retries:", lastError);

    // Surface a clear, actionable error for the most common failure modes
    const errMsg = lastError instanceof Error ? lastError.message : "Unknown error";
    if (errMsg.includes("Pollinations API error 429") || errMsg.includes("rate limit")) {
      return NextResponse.json(
        {
          error:
            "The free AI service is busy right now. Please try again in 30 seconds.",
          detail: errMsg,
        },
        { status: 503 }
      );
    }
    if (errMsg.includes("Pollinations API error 5")) {
      return NextResponse.json(
        {
          error: "The free AI service is temporarily down. Please try again in a minute.",
          detail: errMsg,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "The AI service is busy. Please try again in a few seconds.",
        detail: errMsg,
      },
      { status: 503 }
    );
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 }
    );
  }
}
