"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, User as UserIcon, Sparkles, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function AuthModal({
  open,
  onOpenChange,
  title = "Sign in to sync your calls",
  description = "Save your analyses to the cloud and access them from any device. Free, no password required.",
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setEmail("");
      setName("");
      setLoading(false);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("email", {
        email: trimmedEmail,
        name: name.trim() || undefined,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Signed in!", {
        description: "Your calls will now sync to the cloud.",
      });
      onOpenChange(false);

      // Reload to pick up the session cookie + sync
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      toast.error("Sign-in failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="auth-email" className="text-xs font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="auth-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                disabled={loading}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-name" className="text-xs font-medium">
              Name <span className="text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="auth-name"
                type="text"
                placeholder="Alex SDR"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Continue with email"
            )}
          </Button>
        </form>

        <div className="rounded-lg bg-secondary/40 p-3 flex gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          <span>
            No password needed. We use your email as your identity. Your analyses are
            encrypted at rest and never shared.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
