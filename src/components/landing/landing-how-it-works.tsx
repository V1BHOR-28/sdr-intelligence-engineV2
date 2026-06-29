"use client";

import { motion } from "framer-motion";
import { ClipboardPaste, Sparkles, Copy } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardPaste,
    step: "01",
    title: "Paste your transcript",
    description:
      "Drop in any sales call transcript — your own, a teammate's, or one of our built-in samples. No formatting required.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI does the heavy lifting",
    description:
      "The engine reads the call, extracts every signal, and structures it into a complete sales playbook in seconds.",
  },
  {
    icon: Copy,
    step: "03",
    title: "Copy, paste, close",
    description:
      "Send the follow-up, log the CRM notes, run the action plan. Every output is copy-paste ready for your workflow.",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="relative max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
          How it works
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          Three steps. Ten seconds.
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          No setup, no learning curve. If you can paste text, you can use this.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border bg-card/40 backdrop-blur p-8 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary">
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="text-5xl font-bold text-border tabular-nums">{step.step}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-border">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14m0 0l-6-6m6 6l-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
