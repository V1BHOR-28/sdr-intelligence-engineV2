"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Trash2,
  Save,
  Github,
  Zap,
  Shield,
  Database,
  Palette,
  AlertTriangle,
  Heart,
  Cloud,
  CloudOff,
  User as UserIcon,
  LogOut,
  LogIn,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { AuthModal } from "./auth-modal";

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  delay,
}: {
  icon: typeof Sun;
  title: string;
  description: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="bg-card/40 backdrop-blur border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="inline-flex p-2 rounded-lg bg-secondary/60 text-primary">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

export function SettingsView() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const analyses = useAppStore((s) => s.analyses);
  const clearAll = useAppStore((s) => s.clearAll);
  const autoSave = useAppStore((s) => s.autoSaveAnalyses);
  const setAutoSave = useAppStore((s) => s.setAutoSaveAnalyses);
  const user = useAppStore((s) => s.user);
  const sync = useAppStore((s) => s.sync);
  const [authOpen, setAuthOpen] = useState(false);

  function handleClearAll() {
    clearAll();
    toast.success("All analyses cleared");
  }

  async function handleExportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: user ? { email: user.email, name: user.name } : null,
      analyses,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sdr-analyses-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${analyses.length} analyses`);
  }

  async function handleManualSync() {
    if (!user) return;
    // Re-trigger the sync by reloading — the useAuthSync hook will pick it up
    window.location.reload();
  }

  async function handleSignOut() {
    const { signOut } = await import("next-auth/react");
    await signOut({ redirect: false });
    toast.success("Signed out", {
      description: "Your calls are still saved on this device.",
    });
    setTimeout(() => window.location.reload(), 300);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
          <Palette className="w-3 h-3 text-primary" />
          Settings
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
          Settings &amp; preferences
        </h1>
        <p className="text-muted-foreground">
          Customize how the engine works for you. Everything stays in your browser.
        </p>
      </motion.div>

      <div className="space-y-4">
        {/* Account section — shown to logged-in users, sign-in CTA otherwise */}
        <SettingsSection
          icon={user ? Cloud : CloudOff}
          title={user ? "Account & cloud sync" : "Sign in for cloud sync"}
          description={
            user
              ? "Your analyses are synced to the cloud and accessible from any device"
              : "Sign in to save your analyses to the cloud and access them anywhere"
          }
          delay={0.05}
        >
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                  {(user.name || user.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user.name || "User"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                </div>
                <div className="text-xs text-right">
                  {sync.isSyncing ? (
                    <div className="flex items-center gap-1 text-primary">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Syncing
                    </div>
                  ) : sync.lastSyncedAt ? (
                    <div className="flex items-center gap-1 text-primary">
                      <Cloud className="w-3 h-3" />
                      Synced
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CloudOff className="w-3 h-3" />
                      Local
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSync}
                  disabled={sync.isSyncing}
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${sync.isSyncing ? "animate-spin" : ""}`} />
                  Sync now
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportData} disabled={analyses.length === 0}>
                  <Database className="w-3.5 h-3.5 mr-1.5" />
                  Export ({analyses.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-destructive hover:text-destructive"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-chart-2/30 bg-chart-2/5 p-3">
                <CloudOff className="w-5 h-5 text-chart-2 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">You&apos;re using local-only mode</div>
                  <div className="text-xs text-muted-foreground">
                    Analyses are stored in your browser. Sign in to sync them to the cloud.
                  </div>
                </div>
              </div>
              <Button onClick={() => setAuthOpen(true)} className="w-full sm:w-auto">
                <LogIn className="w-4 h-4 mr-2" />
                Sign in to sync
              </Button>
            </div>
          )}
        </SettingsSection>

        <SettingsSection
          icon={Palette}
          title="Appearance"
          description="Choose how the engine looks"
          delay={0.1}
        >
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4" />
                <span className="font-medium text-sm">Dark</span>
              </div>
              <div className="w-full h-12 rounded-md bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700" />
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <span className="font-medium text-sm">Light</span>
              </div>
              <div className="w-full h-12 rounded-md bg-gradient-to-br from-white to-zinc-100 border border-zinc-200" />
            </button>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Save}
          title="Auto-save analyses"
          description="Automatically save every analysis to your local history"
          delay={0.15}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm">
                {autoSave
                  ? "Every analysis is saved automatically. You can find them in History."
                  : "Analyses are kept only for your current session unless you save them manually."}
              </p>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Database}
          title="Your data"
          description="Manage locally stored analyses"
          delay={0.2}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
              <div>
                <p className="text-sm font-medium">Saved analyses</p>
                <p className="text-xs text-muted-foreground">Stored in your browser&apos;s localStorage</p>
              </div>
              <span className="text-2xl font-semibold tabular-nums">{analyses.length}</span>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={analyses.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all {analyses.length > 0 ? `(${analyses.length})` : ""}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Delete all analyses?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes all {analyses.length} saved analyses from your browser.
                    This action cannot be undone.
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
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Shield}
          title="Privacy &amp; security"
          description="How your data is handled"
          delay={0.25}
        >
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="text-primary mt-0.5">✓</span>
              <span>
                <strong className="font-medium">Analyses are stored locally</strong> in your
                browser&apos;s localStorage. We never run a database of your calls.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary mt-0.5">✓</span>
              <span>
                <strong className="font-medium">Transcripts are sent to the AI model</strong> only
                for the duration of analysis. They are not stored on the server.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary mt-0.5">✓</span>
              <span>
                <strong className="font-medium">No accounts, no tracking.</strong> There&apos;s no
                login, no cookies, no analytics. You&apos;re anonymous.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary mt-0.5">✓</span>
              <span>
                <strong className="font-medium">Free forever.</strong> This tool is built and
                maintained as a public good for the SDR community.
              </span>
            </li>
          </ul>
        </SettingsSection>

        <SettingsSection
          icon={Heart}
          title="About"
          description="The SDR Intelligence Engine"
          delay={0.3}
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">SDR Intelligence Engine</strong> is a free,
              open tool built to help sales development reps turn call transcripts into actionable
              playbooks in seconds.
            </p>
            <p>
              Built with Next.js, Tailwind CSS, and AI. No paywalls, no usage limits, no
              upsells — ever.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  <Github className="w-3.5 h-3.5 mr-1.5" />
                  Star on GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" className="pointer-events-none">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                v1.0.0
              </Button>
            </div>
          </div>
        </SettingsSection>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
