"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Loader2,
  Trash2,
  FileText,
  ChevronDown,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import { SAMPLE_TRANSCRIPTS } from "@/lib/samples";
import { toast } from "sonner";
import type { AnalysisResult } from "@/lib/types";

const LOADING_STEPS = [
  { label: "Reading transcript", duration: 600 },
  { label: "Detecting objections", duration: 800 },
  { label: "Identifying competitors", duration: 700 },
  { label: "Generating CRM summary", duration: 800 },
  { label: "Drafting follow-up email", duration: 900 },
  { label: "Finalizing playbook", duration: 600 },
];

export function AnalyzeView() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const setView = useAppStore((s) => s.setView);
  const saveAnalysis = useAppStore((s) => s.saveAnalysis);
  const setCurrentAnalysisId = useAppStore((s) => s.setCurrentAnalysisId);
  const autoSave = useAppStore((s) => s.autoSaveAnalyses);

  const charCount = transcript.length;
  const maxChars = 20000;
  const minChars = 30;
  const isValid = charCount >= minChars && charCount <= maxChars;

  async function handleAnalyze() {
    if (!isValid) {
      setError(
        charCount < minChars
          ? `Transcript is too short. Add at least ${minChars} characters.`
          : `Transcript is too long. Trim to under ${maxChars.toLocaleString()} characters.`
      );
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStep(0);

    // Animate loading steps
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    LOADING_STEPS.forEach((step, i) => {
      cumulative += step.duration;
      stepTimers.push(
        setTimeout(() => setLoadingStep(i), cumulative)
      );
    });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze transcript.");
      }

      const result: AnalysisResult = data.result;
      const serverId: string | undefined = data.savedId;
      const serverCreatedAt: number | undefined = data.savedAt;

      let id: string;
      if (autoSave) {
        // If the server already saved it (logged-in user), use the server ID.
        // Otherwise save it locally.
        if (serverId) {
          saveAnalysis(transcript, result, serverId, serverCreatedAt);
          id = serverId;
        } else {
          id = saveAnalysis(transcript, result);
        }
        setCurrentAnalysisId(id);
      } else {
        // Create a temporary ID for the session
        id = `temp-${Date.now()}`;
        setCurrentAnalysisId(id);
        // Store the latest result in sessionStorage as a fallback
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "sdr-temp-analysis",
            JSON.stringify({ id, transcript, result, createdAt: Date.now() })
          );
        }
      }

      toast.success("Analysis complete!", {
        description: `${result.title} · ${result.dealStage} · ${result.sentiment}`,
      });

      setView("result");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error("Analysis failed", { description: message });
    } finally {
      stepTimers.forEach(clearTimeout);
      setLoading(false);
      setLoadingStep(0);
    }
  }

  function loadSample(id: string) {
    const sample = SAMPLE_TRANSCRIPTS.find((s) => s.id === id);
    if (sample) {
      setTranscript(sample.transcript);
      setError(null);
      toast.success(`Loaded sample: ${sample.label}`);
      textareaRef.current?.focus();
    }
  }

  function clearAll() {
    setTranscript("");
    setError(null);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            <Sparkles className="w-3 h-3 text-primary" />
            New analysis
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Paste your call transcript
          </h1>
          <p className="text-muted-foreground">
            Drop in any sales call — your own, a teammate's, or one of our samples. The engine
            does the rest.
          </p>
        </div>

        {/* Input card */}
        <div className="relative rounded-2xl border border-border bg-card/40 backdrop-blur p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Transcript
            </label>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Try a sample
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Sample transcripts</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SAMPLE_TRANSCRIPTS.map((sample) => (
                    <DropdownMenuItem
                      key={sample.id}
                      onClick={() => loadSample(sample.id)}
                      className="flex-col items-start py-2"
                    >
                      <div className="font-medium text-sm">{sample.label}</div>
                      <div className="text-xs text-muted-foreground">{sample.description}</div>
                      <div className="text-[10px] uppercase tracking-wider text-primary mt-0.5">
                        {sample.industry}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {transcript && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                  onClick={clearAll}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <Textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              if (error) setError(null);
            }}
            placeholder={`Example:\n\nSDR: Hi, this is Alex from Acme. Am I speaking with the manager?\nClient: Yes, this is Jordan. I'm a bit busy right now.\nSDR: I'll be brief...`}
            className="min-h-[280px] md:min-h-[340px] resize-y font-mono text-sm leading-relaxed bg-background/60 border-border/60 focus-visible:ring-primary/30"
            disabled={loading}
          />

          <div className="flex items-center justify-between mt-3 text-xs">
            <div className="text-muted-foreground">
              <span className={charCount > maxChars ? "text-destructive" : ""}>
                {charCount.toLocaleString()}
              </span>
              {" / "}
              {maxChars.toLocaleString()} characters
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-destructive">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left max-w-md">
            {autoSave
              ? "Your analysis will be saved locally to your browser history."
              : "Auto-save is off — your analysis won't be saved to history."}
          </p>
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={loading || !transcript.trim()}
            className="w-full sm:w-auto h-12 px-8 font-medium group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" />
                Analyze call
              </>
            )}
          </Button>
        </div>

        {/* Loading overlay with steps */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="rounded-2xl border border-border bg-card/40 backdrop-blur p-6">
                <div className="space-y-3">
                  {LOADING_STEPS.map((step, i) => {
                    const isDone = loadingStep > i;
                    const isActive = loadingStep === i;
                    return (
                      <div
                        key={step.label}
                        className={`flex items-center gap-3 text-sm transition-all ${
                          isDone
                            ? "text-foreground"
                            : isActive
                            ? "text-foreground"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          {isDone ? (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          ) : isActive ? (
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                          )}
                        </div>
                        {step.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
