"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Sun, Moon, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { AuthModal } from "./auth-modal";
import { UserMenu } from "./user-menu";

export function LandingNav() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const user = useAppStore((s) => s.user);
  const [authOpen, setAuthOpen] = useState(false);

  if (view !== "landing") return null;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => setView("landing")}
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-md group-hover:bg-primary/50 transition-colors" />
                <div className="relative w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" fill="currentColor" />
                </div>
              </div>
              <span className="font-semibold tracking-tight">
                SDR Intelligence
              </span>
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                asChild
              >
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  <Github className="w-4 h-4 mr-1.5" />
                  Star
                </a>
              </Button>
              {user ? (
                <UserMenu />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthOpen(true)}
                  className="h-9"
                >
                  Sign in
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setView("analyze")}
                className="h-9"
              >
                <Zap className="w-3.5 h-3.5 mr-1" fill="currentColor" />
                Get started
              </Button>
            </div>
          </div>
        </div>
      </motion.header>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
