"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  ArrowRight,
  Flame,
  Smile,
  Clock,
  Target,
  Inbox,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import type { Sentiment } from "@/lib/types";

const SENTIMENT_META: Record<Sentiment, { icon: typeof Flame; color: string; bg: string }> = {
  hot: { icon: Flame, color: "text-chart-3", bg: "bg-chart-3/15" },
  warm: { icon: Smile, color: "text-chart-2", bg: "bg-chart-2/15" },
  cold: { icon: Clock, color: "text-chart-5", bg: "bg-chart-5/15" },
  negative: { icon: Target, color: "text-chart-4", bg: "bg-chart-4/15" },
};

export function HistoryView() {
  const analyses = useAppStore((s) => s.analyses);
  const deleteAnalysis = useAppStore((s) => s.deleteAnalysis);
  const clearAll = useAppStore((s) => s.clearAll);
  const setView = useAppStore((s) => s.setView);
  const setCurrentAnalysisId = useAppStore((s) => s.setCurrentAnalysisId);

  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return analyses.filter((a) => {
      const matchesSearch =
        search.trim() === "" ||
        a.result.title.toLowerCase().includes(search.toLowerCase()) ||
        a.result.summary.toLowerCase().includes(search.toLowerCase()) ||
        a.result.objections.some((o) => o.toLowerCase().includes(search.toLowerCase())) ||
        a.result.competitors.some((c) => c.toLowerCase().includes(search.toLowerCase()));

      const matchesSentiment =
        sentimentFilter === "all" || a.result.sentiment === sentimentFilter;

      return matchesSearch && matchesSentiment;
    });
  }, [analyses, search, sentimentFilter]);

  function open(id: string) {
    setCurrentAnalysisId(id);
    setView("result");
  }

  function handleDelete(id: string) {
    deleteAnalysis(id);
    toast.success("Analysis deleted");
  }

  function handleClearAll() {
    clearAll();
    toast.success("All analyses cleared");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Inbox className="w-3 h-3 text-primary" />
            History
          </div>
          {analyses.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all analyses?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove all {analyses.length} saved analyses from your
                    browser. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Delete all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
          Call history
        </h1>
        <p className="text-muted-foreground">
          {analyses.length === 0
            ? "Your analyzed calls will appear here."
            : `${analyses.length} saved call${analyses.length === 1 ? "" : "s"} · stored locally in your browser`}
        </p>
      </motion.div>

      {analyses.length === 0 ? (
        <EmptyHistory />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, objection, competitor..."
                className="pl-9 bg-background/60"
              />
            </div>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-background/60">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sentiments</SelectItem>
                <SelectItem value="hot">🔥 Hot</SelectItem>
                <SelectItem value="warm">🙂 Warm</SelectItem>
                <SelectItem value="cold">❄️ Cold</SelectItem>
                <SelectItem value="negative">😕 Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Search className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">No matches found</h3>
              <p className="text-sm text-muted-foreground">Try a different search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence>
                {filtered.map((a, i) => {
                  const meta = SENTIMENT_META[a.result.sentiment];
                  return (
                    <motion.div
                      key={a.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="group rounded-2xl border border-border bg-card/40 backdrop-blur p-4 md:p-5 hover:border-primary/30 hover:bg-card/60 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`shrink-0 inline-flex p-2.5 rounded-xl ${meta.bg} ${meta.color}`}>
                          <meta.icon className="w-5 h-5" />
                        </div>

                        <button
                          onClick={() => open(a.id)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{a.result.title}</h3>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                              {a.result.dealStage}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {a.result.summary}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(a.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            {a.result.competitors.length > 0 && (
                              <span>
                                {a.result.competitors.length} competitor
                                {a.result.competitors.length === 1 ? "" : "s"}
                              </span>
                            )}
                            <span>
                              {a.result.objections.length} objection
                              {a.result.objections.length === 1 ? "" : "s"}
                            </span>
                          </div>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => open(a.id)}
                            className="h-8 w-8 group-hover:bg-secondary"
                            aria-label="Open analysis"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                aria-label="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this analysis?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  &ldquo;{a.result.title}&rdquo; will be permanently removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(a.id)}
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyHistory() {
  const setView = useAppStore((s) => s.setView);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-dashed border-border bg-card/20 p-12 text-center"
    >
      <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-4">
        <Inbox className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No history yet</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        Once you analyze calls, they&apos;ll appear here. Your history is stored locally in your
        browser — nothing leaves your device.
      </p>
      <Button size="lg" onClick={() => setView("analyze")} className="group">
        Analyze your first call
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.div>
  );
}
