"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Users,
  FileText,
  ListChecks,
  Mail,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Clock,
  AlertCircle,
  CheckCircle2,
  Flame,
  Snowflake,
  Smile,
  Frown,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import type { AnalysisResult, SavedAnalysis, Sentiment } from "@/lib/types";

const SENTIMENT_CONFIG: Record<
  Sentiment,
  { label: string; icon: typeof Flame; color: string; bg: string }
> = {
  hot: { label: "Hot", icon: Flame, color: "text-chart-3", bg: "bg-chart-3/15" },
  warm: { label: "Warm", icon: Smile, color: "text-chart-2", bg: "bg-chart-2/15" },
  cold: { label: "Cold", icon: Snowflake, color: "text-chart-5", bg: "bg-chart-5/15" },
  negative: { label: "Negative", icon: Frown, color: "text-chart-4", bg: "bg-chart-4/15" },
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={copy}
      className="h-7 text-xs text-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 mr-1" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 mr-1" />
          Copy
        </>
      )}
    </Button>
  );
}

function ResultCard({
  icon: Icon,
  iconColor,
  title,
  children,
  copyText,
  delay,
}: {
  icon: typeof Target;
  iconColor: string;
  title: string;
  children: React.ReactNode;
  copyText?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-border bg-card/40 backdrop-blur p-5 md:p-6 hover:border-primary/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`inline-flex p-2 rounded-lg bg-secondary/60 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm uppercase tracking-wider">{title}</h3>
        </div>
        {copyText && <CopyButton text={copyText} label={title} />}
      </div>
      {children}
    </motion.div>
  );
}

function BulletList({ items, color = "text-primary" }: { items: string[]; color?: string }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">None detected in this call.</p>
    );
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
          <span className={`mt-1.5 w-1 h-1 rounded-full ${color.replace("text-", "bg-")} shrink-0`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items, color = "text-primary" }: { items: string[]; color?: string }) {
  return (
    <ol className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed">
          <span
            className={`shrink-0 w-5 h-5 rounded-full ${color.replace("text-", "bg-")}/15 ${color} flex items-center justify-center text-xs font-semibold`}
          >
            {i + 1}
          </span>
          <span className="pt-0.5">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function ResultView() {
  const setView = useAppStore((s) => s.setView);
  const currentAnalysisId = useAppStore((s) => s.currentAnalysisId);
  const analyses = useAppStore((s) => s.analyses);
  const saveAnalysis = useAppStore((s) => s.saveAnalysis);
  const autoSave = useAppStore((s) => s.autoSaveAnalyses);
  const setCurrentAnalysisId = useAppStore((s) => s.setCurrentAnalysisId);

  // Derive the active analysis directly from the store, with a sessionStorage
  // fallback for analyses that weren't auto-saved.
  const analysis = useMemo<SavedAnalysis | null>(() => {
    const found = analyses.find((a) => a.id === currentAnalysisId);
    if (found) return found;
    if (typeof window !== "undefined") {
      const temp = sessionStorage.getItem("sdr-temp-analysis");
      if (temp) {
        try {
          const parsed = JSON.parse(temp) as SavedAnalysis;
          if (parsed.id === currentAnalysisId) return parsed;
        } catch {
          // ignore
        }
      }
    }
    return null;
  }, [currentAnalysisId, analyses]);

  if (!analysis) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No analysis found</h2>
        <p className="text-muted-foreground mb-6">
          Your analysis may have expired. Run a new one to see the results.
        </p>
        <Button onClick={() => setView("analyze")}>
          <Sparkles className="w-4 h-4 mr-2" />
          Analyze a call
        </Button>
      </div>
    );
  }

  const r: AnalysisResult = analysis.result;
  const sentimentCfg = SENTIMENT_CONFIG[r.sentiment];

  function handleSaveToHistory() {
    if (!analysis) return;
    if (analyses.some((a) => a.id === analysis.id)) {
      toast.info("Already in your history");
      return;
    }
    const newId = saveAnalysis(analysis.transcript, analysis.result);
    setCurrentAnalysisId(newId);
    toast.success("Saved to history");
  }

  const fullEmail = `Subject: ${r.followUpEmail.subject}\n\n${r.followUpEmail.body}`;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <button
          onClick={() => setView("analyze")}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          New analysis
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
              {r.title}
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">{r.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Badge variant="outline" className={`${sentimentCfg.bg} ${sentimentCfg.color} border-0 gap-1`}>
              <sentimentCfg.icon className="w-3 h-3" />
              {sentimentCfg.label}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="w-3 h-3" />
              {r.dealStage}
            </Badge>
            {r.estimatedValue && (
              <Badge variant="outline" className="gap-1">
                <Target className="w-3 h-3" />
                {r.estimatedValue}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </Badge>
          </div>
        </div>

        {!autoSave && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-chart-2/30 bg-chart-2/5 p-3">
            <AlertCircle className="w-4 h-4 text-chart-2 shrink-0" />
            <p className="text-xs text-muted-foreground flex-1">
              This analysis is only saved in your current session. Save it to history to keep it.
            </p>
            <Button size="sm" variant="outline" onClick={handleSaveToHistory} className="h-7 text-xs">
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        )}
      </motion.div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Objections */}
        <ResultCard
          icon={Target}
          iconColor="text-chart-1"
          title="Key Objections"
          copyText={r.objections.map((o, i) => `${i + 1}. ${o}`).join("\n")}
          delay={0.05}
        >
          <BulletList items={r.objections} color="text-chart-1" />
        </ResultCard>

        {/* Competitors */}
        <ResultCard
          icon={Users}
          iconColor="text-chart-2"
          title="Competitors Mentioned"
          copyText={r.competitors.join(", ")}
          delay={0.1}
        >
          {r.competitors.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No competitors mentioned on this call.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {r.competitors.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-chart-2/10 text-chart-2 text-xs font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </ResultCard>

        {/* CRM Summary */}
        <ResultCard
          icon={FileText}
          iconColor="text-chart-3"
          title="CRM Summary"
          copyText={r.crmSummary.map((s, i) => `${i + 1}. ${s}`).join("\n")}
          delay={0.15}
        >
          <NumberedList items={r.crmSummary} color="text-chart-3" />
        </ResultCard>

        {/* Action Plan */}
        <ResultCard
          icon={ListChecks}
          iconColor="text-chart-4"
          title="Action Plan (48h)"
          copyText={r.actionPlan.map((a, i) => `${i + 1}. ${a}`).join("\n")}
          delay={0.2}
        >
          <NumberedList items={r.actionPlan} color="text-chart-4" />
        </ResultCard>

        {/* Key Insights */}
        <ResultCard
          icon={Lightbulb}
          iconColor="text-chart-1"
          title="Key Insights"
          copyText={r.keyInsights.map((k, i) => `${i + 1}. ${k}`).join("\n")}
          delay={0.25}
        >
          <BulletList items={r.keyInsights} color="text-chart-1" />
        </ResultCard>

        {/* Next Steps (longer term) */}
        <ResultCard
          icon={ArrowRight}
          iconColor="text-chart-5"
          title="Next Steps (2-4 weeks)"
          copyText={r.nextSteps.map((n, i) => `${i + 1}. ${n}`).join("\n")}
          delay={0.3}
        >
          <NumberedList items={r.nextSteps} color="text-chart-5" />
        </ResultCard>
      </div>

      {/* Follow-up email — full width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="mt-4 rounded-2xl border border-border bg-card/40 backdrop-blur p-5 md:p-6 hover:border-primary/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex p-2 rounded-lg bg-secondary/60 text-chart-5">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm uppercase tracking-wider">Magic Follow-Up Email</h3>
          </div>
          <CopyButton text={fullEmail} label="Follow-up email" />
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-4 md:p-5">
          <div className="flex items-start gap-2 pb-3 mb-3 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0 pt-0.5">
              Subject
            </span>
            <span className="text-sm font-medium">{r.followUpEmail.subject}</span>
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-line font-sans">
            {r.followUpEmail.body}
          </div>
        </div>
      </motion.div>

      {/* Footer actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button variant="outline" onClick={() => setView("history")}>
          <Clock className="w-4 h-4 mr-2" />
          View history
        </Button>
        <Button onClick={() => setView("analyze")} className="group">
          <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          Analyze another call
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Transcript reference (collapsible-feel section) */}
      <details className="mt-12 group">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          View original transcript
        </summary>
        <div className="mt-3 rounded-xl border border-border bg-background/40 p-4 max-h-72 overflow-y-auto">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
            {analysis.transcript}
          </pre>
        </div>
      </details>
    </div>
  );
}
