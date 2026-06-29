"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useAuthSync } from "@/hooks/use-auth-sync";
import { LandingNav } from "@/components/app/landing-nav";
import { AppNav } from "@/components/app/app-nav";
import { AppFooter } from "@/components/app/app-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { AnalyzeView } from "@/components/app/analyze-view";
import { ResultView } from "@/components/app/result-view";
import { DashboardView } from "@/components/app/dashboard-view";
import { HistoryView } from "@/components/app/history-view";
import { SettingsView } from "@/components/app/settings-view";

export default function Home() {
  const view = useAppStore((s) => s.view);
  // Hydrate user from NextAuth session + sync analyses with the server.
  useAuthSync();

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <AppNav />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {view === "landing" && <LandingHero />}
            {view === "analyze" && <AnalyzeView />}
            {view === "result" && <ResultView />}
            {view === "dashboard" && <DashboardView />}
            {view === "history" && <HistoryView />}
            {view === "settings" && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AppFooter />
    </div>
  );
}
