"use client";

import { motion } from "framer-motion";
import {
  Zap,
  TrendingUp,
  Flame,
  Smile,
  Clock,
  ArrowRight,
  Target,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import type { Sentiment } from "@/lib/types";

const SENTIMENT_META: Record<Sentiment, { icon: typeof Flame; color: string; bg: string; label: string }> = {
  hot: { icon: Flame, color: "text-chart-3", bg: "bg-chart-3/15", label: "Hot" },
  warm: { icon: Smile, color: "text-chart-2", bg: "bg-chart-2/15", label: "Warm" },
  cold: { icon: Clock, color: "text-chart-5", bg: "bg-chart-5/15", label: "Cold" },
  negative: { icon: Target, color: "text-chart-4", bg: "bg-chart-4/15", label: "Negative" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
  delay,
}: {
  icon: typeof Zap;
  label: string;
  value: string | number;
  sublabel?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-border bg-card/40 backdrop-blur p-5 hover:border-primary/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className={`inline-flex p-1.5 rounded-lg bg-secondary/60 ${color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
      {sublabel && <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>}
    </motion.div>
  );
}

export function DashboardView() {
  const analyses = useAppStore((s) => s.analyses);
  const setView = useAppStore((s) => s.setView);
  const setCurrentAnalysisId = useAppStore((s) => s.setCurrentAnalysisId);

  const totalCalls = analyses.length;
  const hotCount = analyses.filter((a) => a.result.sentiment === "hot").length;
  const warmCount = analyses.filter((a) => a.result.sentiment === "warm").length;
  const objectionsTotal = analyses.reduce((sum, a) => sum + a.result.objections.length, 0);
  const competitorsTotal = analyses.reduce((sum, a) => sum + a.result.competitors.length, 0);

  // Compute most common competitors
  const competitorCounts = new Map<string, number>();
  analyses.forEach((a) => {
    a.result.competitors.forEach((c) => {
      const key = c.trim().toLowerCase();
      competitorCounts.set(key, (competitorCounts.get(key) ?? 0) + 1);
    });
  });
  const topCompetitors = Array.from(competitorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Stage distribution
  const stages = ["Discovery", "Qualified", "Demo", "Negotiation", "Closed Won", "Closed Lost", "Nurture"];
  const stageCounts = stages
    .map((stage) => ({
      stage,
      count: analyses.filter((a) => a.result.dealStage === stage).length,
    }))
    .filter((s) => s.count > 0);
  const maxStageCount = Math.max(1, ...stageCounts.map((s) => s.count));

  function openAnalysis(id: string) {
    setCurrentAnalysisId(id);
    setView("result");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
          <BarChart3 className="w-3 h-3 text-primary" />
          Dashboard
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
              Your sales pipeline at a glance
            </h1>
            <p className="text-muted-foreground">
              {totalCalls > 0
                ? `${totalCalls} call${totalCalls === 1 ? "" : "s"} analyzed. Keep the momentum going.`
                : "Analyze your first call to start building your pipeline."}
            </p>
          </div>
          <Button size="lg" onClick={() => setView("analyze")} className="group shrink-0">
            <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" />
            New analysis
          </Button>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          icon={Zap}
          label="Calls Analyzed"
          value={totalCalls}
          sublabel={totalCalls === 0 ? "Get started" : "All-time"}
          color="text-primary"
          delay={0.05}
        />
        <StatCard
          icon={Flame}
          label="Hot Leads"
          value={hotCount}
          sublabel={totalCalls > 0 ? `${Math.round((hotCount / totalCalls) * 100)}% of pipeline` : "—"}
          color="text-chart-3"
          delay={0.1}
        />
        <StatCard
          icon={Smile}
          label="Warm Leads"
          value={warmCount}
          sublabel={totalCalls > 0 ? `${Math.round((warmCount / totalCalls) * 100)}% of pipeline` : "—"}
          color="text-chart-2"
          delay={0.15}
        />
        <StatCard
          icon={Target}
          label="Objections Found"
          value={objectionsTotal}
          sublabel={totalCalls > 0 ? `${(objectionsTotal / totalCalls).toFixed(1)} per call avg` : "—"}
          color="text-chart-4"
          delay={0.2}
        />
      </div>

      {totalCalls === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent calls */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/40 backdrop-blur p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Recent Calls
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setView("history")} className="h-7 text-xs">
                View all
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {analyses.slice(0, 8).map((a, i) => {
                const meta = SENTIMENT_META[a.result.sentiment];
                return (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    onClick={() => openAnalysis(a.id)}
                    className="w-full flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 hover:border-primary/30 hover:bg-background/60 transition-all text-left group"
                  >
                    <div className={`shrink-0 inline-flex p-2 rounded-lg ${meta.bg} ${meta.color}`}>
                      <meta.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{a.result.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {a.result.dealStage} · {new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Side: stage distribution + competitors */}
          <div className="space-y-4">
            {stageCounts.length > 0 && (
              <div className="rounded-2xl border border-border bg-card/40 backdrop-blur p-5">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  Pipeline Stages
                </h3>
                <div className="space-y-2.5">
                  {stageCounts.map((s) => (
                    <div key={s.stage}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground/80">{s.stage}</span>
                        <span className="text-muted-foreground tabular-nums">{s.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(s.count / maxStageCount) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {topCompetitors.length > 0 && (
              <div className="rounded-2xl border border-border bg-card/40 backdrop-blur p-5">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  Top Competitors
                </h3>
                <div className="space-y-2">
                  {topCompetitors.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{name}</span>
                      <Badge variant="outline" className="text-xs">
                        {count}×
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  const setView = useAppStore((s) => s.setView);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-dashed border-border bg-card/20 p-12 text-center"
    >
      <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No calls analyzed yet</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        Paste your first sales call transcript and the engine will instantly extract objections,
        competitors, action plans, and a personalized follow-up email.
      </p>
      <Button size="lg" onClick={() => setView("analyze")} className="group">
        <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" />
        Analyze your first call
      </Button>
    </motion.div>
  );
}
