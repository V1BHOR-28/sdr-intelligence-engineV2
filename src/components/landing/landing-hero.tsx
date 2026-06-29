"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight, Sparkles, Shield, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { LandingFeatures } from "./landing-features";
import { LandingHowItWorks } from "./landing-how-it-works";
import { LandingPreview } from "./landing-preview";

export function LandingHero() {
  const setView = useAppStore((s) => s.setView);

  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-60 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-chart-2/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Free forever · No sign-up · No API key needed
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-6"
        >
          Turn sales calls into
          <br />
          <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent animate-gradient">
            closable deals
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Paste any sales call transcript and instantly extract objections, competitors,
          CRM-ready summaries, action plans, and personalized follow-up emails — powered by AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={() => setView("analyze")}
            className="h-12 px-8 text-base font-medium group"
          >
            <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Analyze a call
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setView("dashboard")}
            className="h-12 px-8 text-base font-medium"
          >
            View dashboard
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-10 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Nothing leaves your browser
          </div>
          <div className="flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5" />
            Open and free
          </div>
        </motion.div>
      </div>

      <LandingPreview />
      <LandingFeatures />
      <LandingHowItWorks />

      {/* Final CTA */}
      <section className="relative max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            Stop guessing.
            <br />
            Start closing.
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Your next deal is hiding in your last call. Find it in 10 seconds.
          </p>
          <Button
            size="lg"
            onClick={() => setView("analyze")}
            className="h-12 px-8 text-base font-medium group"
          >
            <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Analyze your first call — free
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </section>
  );
}
