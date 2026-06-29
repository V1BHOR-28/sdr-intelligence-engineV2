"use client";

import { motion } from "framer-motion";
import {
  Target,
  Users,
  FileText,
  ListChecks,
  Mail,
  Lightbulb,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Objection detection",
    description:
      "Surfaces every objection — spoken or implied — so you can prepare the right response before the next touchpoint.",
    color: "text-chart-1",
  },
  {
    icon: Users,
    title: "Competitor intelligence",
    description:
      "Flags every alternative tool, vendor, or workaround the prospect mentioned. Never walk into a blind comparison again.",
    color: "text-chart-2",
  },
  {
    icon: FileText,
    title: "CRM-ready summary",
    description:
      "Three crisp bullet points written for Salesforce, HubSpot, or Pipedrive. Paste in, move on, log the call in seconds.",
    color: "text-chart-3",
  },
  {
    icon: ListChecks,
    title: "Action plan",
    description:
      "A prioritized, time-bound list of next steps. No more post-it notes, no more 'what should I do next?' paralysis.",
    color: "text-chart-4",
  },
  {
    icon: Mail,
    title: "Magic follow-up email",
    description:
      "A personalized, send-ready follow-up referencing specific points from the call — written in your prospect's context.",
    color: "text-chart-5",
  },
  {
    icon: Lightbulb,
    title: "Strategic insights",
    description:
      "The non-obvious stuff — buying signals, hidden motivations, risks. The intel that turns a cold lead into a warm one.",
    color: "text-chart-1",
  },
  {
    icon: TrendingUp,
    title: "Deal stage & sentiment",
    description:
      "Auto-classifies each call by stage and sentiment so you can forecast accurately and prioritize your pipeline.",
    color: "text-chart-2",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "Analyses are stored locally in your browser. Nothing is sent to a database. Your calls stay yours, period.",
    color: "text-chart-3",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
          Everything you need
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          One transcript in.
          <br />
          A complete deal playbook out.
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          What used to take a sales manager 30 minutes per call now takes 10 seconds.
          Built by SDRs, for SDRs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
            className="group relative rounded-2xl border border-border bg-card/40 backdrop-blur p-6 hover:border-primary/40 hover:bg-card/60 transition-all"
          >
            <div className={`mb-4 inline-flex p-2.5 rounded-xl bg-secondary/60 ${feature.color}`}>
              <feature.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
