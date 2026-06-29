"use client";

import { motion } from "framer-motion";
import { Target, Users, FileText, Mail, ListChecks, Lightbulb } from "lucide-react";

const PREVIEW_ITEMS = [
  {
    icon: Target,
    label: "Key Objections",
    value: "Budget tight this quarter · No bandwidth for new software",
    color: "text-chart-1",
    badge: "warm",
  },
  {
    icon: Users,
    label: "Competitors Mentioned",
    value: "Yelp — evaluated but not adopted",
    color: "text-chart-2",
  },
  {
    icon: FileText,
    label: "CRM Summary",
    value: "Prospect is Sarah, manager at Bossco Cafe. Currently relying on organic walk-ins, no local SEO tooling. Open to receiving case study via email — sarah@bosscocafe.com.",
    color: "text-chart-3",
  },
  {
    icon: ListChecks,
    label: "Action Plan",
    value: "Send case study within 1 hour · Follow up Thursday 2pm · Frame value as 'no manual work required'",
    color: "text-chart-4",
  },
  {
    icon: Mail,
    label: "Magic Follow-Up",
    value: "Subject: The 12% revenue lift I promised — no extra work\n\nHi Sarah, as discussed, here's how Bossco Cafe neighbor The Daily Grind lifted monthly reviews by 47% without lifting a finger...",
    color: "text-chart-5",
  },
  {
    icon: Lightbulb,
    label: "Key Insight",
    value: "Sarah's 'no bandwidth' objection is really a 'no confidence' objection — lead with case studies that prove zero effort, not features.",
    color: "text-chart-1",
  },
];

export function LandingPreview() {
  return (
    <section className="relative max-w-6xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="relative"
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-chart-2/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
        <div className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-chart-4/60" />
              <div className="w-3 h-3 rounded-full bg-chart-2/60" />
              <div className="w-3 h-3 rounded-full bg-chart-1/60" />
            </div>
            <div className="flex-1 text-center text-xs text-muted-foreground font-mono">
              sdr-intelligence.app — Analysis Result
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 md:p-6">
            {PREVIEW_ITEMS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="rounded-xl border border-border bg-background/40 p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-chart-2/15 text-chart-2">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3 whitespace-pre-line">
                  {item.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
