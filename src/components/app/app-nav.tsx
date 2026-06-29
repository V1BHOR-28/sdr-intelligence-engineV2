"use client";

import { useState } from "react";
import { Zap, Moon, Sun, LayoutDashboard, History, Settings, Home, Cloud, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ViewName } from "@/lib/types";
import { AuthModal } from "./auth-modal";
import { UserMenu } from "./user-menu";

const NAV_ITEMS: { view: ViewName; label: string; icon: typeof Home }[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "analyze", label: "Analyze", icon: Zap },
  { view: "history", label: "History", icon: History },
  { view: "settings", label: "Settings", icon: Settings },
];

export function AppNav() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const user = useAppStore((s) => s.user);
  const sync = useAppStore((s) => s.sync);
  const [authOpen, setAuthOpen] = useState(false);

  // Hide nav entirely on landing view
  if (view === "landing") return null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo */}
            <button
              onClick={() => setView("landing")}
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-md group-hover:bg-primary/50 transition-colors" />
                <div className="relative w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" fill="currentColor" />
                </div>
              </div>
              <span className="font-semibold text-sm tracking-tight hidden sm:inline">
                SDR Intelligence
              </span>
            </button>

            {/* Center nav */}
            <nav className="flex items-center gap-1 rounded-full border border-border bg-card/40 p-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    view === item.view || (view === "result" && item.view === "analyze")
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Sync indicator */}
              {user && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground px-2">
                  {sync.isSyncing ? (
                    <>
                      <Cloud className="w-3 h-3 text-primary animate-pulse" />
                      <span>Syncing</span>
                    </>
                  ) : sync.lastSyncedAt ? (
                    <>
                      <Cloud className="w-3 h-3 text-primary" />
                      <span>Synced</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3 h-3" />
                      <span>Local</span>
                    </>
                  )}
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              {user ? (
                <UserMenu />
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAuthOpen(true)}
                  className="h-8"
                >
                  Sign in
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setView("analyze")}
                className="hidden sm:flex h-8"
              >
                <Zap className="w-3.5 h-3.5 mr-1" />
                New analysis
              </Button>
            </div>
          </div>
        </div>
      </header>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
