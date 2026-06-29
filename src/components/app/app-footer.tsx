"use client";

import { Zap, Heart } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function AppFooter() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  return (
    <footer className="mt-auto border-t border-border bg-background/50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-primary" fill="currentColor" />
            </div>
            <span>SDR Intelligence Engine · Free forever</span>
          </div>

          <div className="flex items-center gap-4">
            {view !== "landing" && (
              <button
                onClick={() => setView("landing")}
                className="hover:text-foreground transition-colors"
              >
                Home
              </button>
            )}
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-chart-4" fill="currentColor" /> for SDRs
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
