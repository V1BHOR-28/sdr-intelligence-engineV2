"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/lib/store";
import type { SavedAnalysis } from "@/lib/types";

/**
 * Hydrates app state from the NextAuth session and syncs analyses
 * bidirectionally with the server.
 *
 * Behavior:
 * 1. When the user logs in, fetch their saved analyses from the DB.
 * 2. Merge them with any locally-stored analyses that haven't been pushed yet
 *    (those prefixed with `local-`). Push the local ones to the server.
 * 3. Replace the local store with the merged list.
 * 4. When the user logs out, just clear the in-memory user — analyses
 *    persist in localStorage so the user can come back later (logged out)
 *    and still see them.
 */
export function useAuthSync() {
  const { data: session, status } = useSession();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const replaceAnalyses = useAppStore((s) => s.replaceAnalyses);
  const upsertAnalysis = useAppStore((s) => s.upsertAnalysis);
  const analyses = useAppStore((s) => s.analyses);
  const sync = useAppStore((s) => s.sync);
  const setSyncing = useAppStore((s) => s.setSyncing);
  const markSynced = useAppStore((s) => s.markSynced);
  const markPendingPush = useAppStore((s) => s.markPendingPush);

  const lastSyncedUserId = useRef<string | null>(null);

  // 1. Sync `user` in store with the session
  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.id && session.user.email) {
      const sessionUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      };
      // Only update if changed (avoid spamming)
      if (
        !user ||
        user.id !== sessionUser.id ||
        user.email !== sessionUser.email
      ) {
        setUser(sessionUser);
      }
    } else if (status === "unauthenticated" && user) {
      setUser(null);
      lastSyncedUserId.current = null;
    }
  }, [session, status, user, setUser]);

  // 2. When user logs in, fetch + merge + push
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    if (lastSyncedUserId.current === session.user.id) return;
    if (sync.isSyncing) return;

    lastSyncedUserId.current = session.user.id;
    void doSync();

    async function doSync() {
      setSyncing(true);
      try {
        // Step 1: fetch server analyses
        const fetchRes = await fetch("/api/analyses", { method: "GET" });
        let serverAnalyses: SavedAnalysis[] = [];
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          serverAnalyses = (data.analyses ?? []) as SavedAnalysis[];
        }

        // Step 2: identify local-only analyses (not yet pushed)
        const serverIds = new Set(serverAnalyses.map((a) => a.id));
        const localOnly = analyses.filter((a) => !serverIds.has(a.id));

        // Step 3: push local-only to server
        let pushed: SavedAnalysis[] = [];
        if (localOnly.length > 0) {
          try {
            const pushRes = await fetch("/api/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: localOnly.map((a) => ({
                  transcript: a.transcript,
                  result: a.result,
                  createdAt: a.createdAt,
                })),
              }),
            });
            if (pushRes.ok) {
              const pushData = await pushRes.json();
              pushed = (pushData.items ?? []) as SavedAnalysis[];
            }
          } catch (err) {
            console.error("Push to server failed:", err);
          }
        }

        // Step 4: merge — server analyses first, then any pushed (with new server IDs)
        // For pushed items, we need to replace the old local- IDs with server IDs
        const mergedMap = new Map<string, SavedAnalysis>();
        for (const a of serverAnalyses) mergedMap.set(a.id, a);
        for (const a of pushed) mergedMap.set(a.id, a);

        // If push succeeded, drop the local- versions
        const finalAnalyses = Array.from(mergedMap.values()).sort(
          (a, b) => b.createdAt - a.createdAt
        );

        replaceAnalyses(finalAnalyses);
        markSynced();
        markPendingPush(0);
      } catch (err) {
        console.error("Sync failed:", err);
        setSyncing(false);
      }
    }
  }, [status, session?.user?.id]);
}
