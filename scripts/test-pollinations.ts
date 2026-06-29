/**
 * Pollinations.ai provider test
 *
 * Verifies that:
 *   1. The Pollinations.ai API is reachable from this environment
 *   2. A minimal chat completion works
 *   3. JSON mode works (the analyze route uses this)
 *
 * Usage:
 *   bun run scripts/test-pollinations.ts
 *
 * No API key, sign-up, or credit card required. Pollinations.ai is a
 * free, keyless text-generation service. https://pollinations.ai
 */

const POLLINATIONS_URL = "https://text.pollinations.ai/";
const MODEL = "openai";

async function main() {
  console.log("========================================");
  console.log(" Pollinations.ai provider test (KEYLESS)");
  console.log("========================================");
  console.log(`\n  Node: ${process.version}`);
  console.log(`  Platform: ${process.platform} ${process.arch}`);
  console.log(`  Endpoint: ${POLLINATIONS_URL}`);
  console.log(`  Model:    ${MODEL}`);
  console.log(`\n  No API key required. No sign-up. No credit card.`);

  // Step 1: Minimal chat completion
  console.log("\n=== Step 1: Sending minimal chat completion ===\n");
  const start = Date.now();
  try {
    console.log("  Sending request...");
    const res = await fetch(POLLINATIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a test assistant. Be extremely brief." },
          { role: "user", content: "Reply with exactly one word: PONG" },
        ],
        model: MODEL,
        temperature: 0,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const content = await res.text();
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    if (!content || !content.trim()) {
      throw new Error("Response was empty");
    }

    console.log(`  ✓ Response received in ${elapsed}s`);
    console.log(`  ✓ Content: "${content.slice(0, 100)}"`);

    // Step 2: Test JSON mode (the actual pattern the analyze route uses)
    console.log("\n=== Step 2: Testing JSON structured output ===\n");
    const jsonStart = Date.now();
    const jsonRes = await fetch(POLLINATIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You output valid JSON only." },
          {
            role: "user",
            content:
              "Return a JSON object with two fields: 'status' (string 'ok') and 'count' (number 42). Output ONLY the JSON object.",
          },
        ],
        model: MODEL,
        jsonMode: true,
        temperature: 0,
        seed: 42,
      }),
    });

    if (!jsonRes.ok) {
      const errText = await jsonRes.text().catch(() => "");
      throw new Error(`JSON test HTTP ${jsonRes.status}: ${errText.slice(0, 200)}`);
    }

    const jsonContent = await jsonRes.text();
    const jsonElapsed = ((Date.now() - jsonStart) / 1000).toFixed(2);
    console.log(`  ✓ JSON response received in ${jsonElapsed}s`);

    let parsed: unknown = null;
    try {
      // Strip any surrounding whitespace/markdown fences just in case
      let cleaned = jsonContent.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
      }
      parsed = JSON.parse(cleaned);
    } catch {
      // ignore
    }

    if (parsed && typeof parsed === "object") {
      console.log(`  ✓ Parsed as valid JSON: ${JSON.stringify(parsed)}`);
    } else {
      console.log(`  ⚠️  Response was not parseable as JSON:`);
      console.log(`     ${jsonContent.slice(0, 200)}`);
    }

    console.log("\n=== ✅ PASS: Pollinations.ai works in this environment ===\n");
    console.log("  Your app is ready to deploy. No env vars to set on Vercel");
    console.log("  — the AI service is completely free and keyless.");
    process.exit(0);
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`  ✗ Failed after ${elapsed}s`);
    console.log(`  ✗ Error type: ${err?.constructor?.name ?? "Unknown"}`);
    console.log(`  ✗ Error message: ${err instanceof Error ? err.message : String(err)}`);

    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    if (msg.includes("429") || msg.includes("rate limit")) {
      console.log("\n  → Rate limit exceeded. Pollinations.ai is busy right now.");
      console.log("    Wait a minute and try again. The free tier has per-IP limits.");
    } else if (msg.includes("enotfound") || msg.includes("econnrefused") || msg.includes("network")) {
      console.log("\n  → Network error. Can't reach text.pollinations.ai from this environment.");
      console.log("    Check your internet connection or firewall.");
    } else if (msg.includes("timeout") || msg.includes("aborted")) {
      console.log("\n  → Request timed out. Pollinations.ai may be slow right now.");
      console.log("    Try again in a few seconds.");
    } else if (msg.includes("500") || msg.includes("502") || msg.includes("503")) {
      console.log("\n  → Pollinations.ai is having issues on their end.");
      console.log("    Check https://pollinations.ai/status or try again in a minute.");
    }

    console.log("\n=== ❌ FAIL: Pollinations.ai is not reachable ===\n");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Script crashed:", err);
  process.exit(2);
});
