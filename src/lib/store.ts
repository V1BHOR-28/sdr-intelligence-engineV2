"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedAnalysis, ViewName, AnalysisResult } from "./types";

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

interface SyncStatus {
  // Whether we've fetched the user's analyses from the DB after login
  hasFetchedFromServer: boolean;
  // Whether a sync/push to the server is currently in progress
  isSyncing: boolean;
  // Last sync timestamp
  lastSyncedAt: number | null;
  // Count of items pending push to server (created locally while offline)
  pendingPushCount: number;
}

interface AppState {
  // Navigation
  view: ViewName;
  setView: (view: ViewName) => void;

  // Theme
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;

  // Auth
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: () => boolean;

  // Saved analyses
  analyses: SavedAnalysis[];
  currentAnalysisId: string | null;
  saveAnalysis: (transcript: string, result: AnalysisResult, serverId?: string, serverCreatedAt?: number) => string;
  upsertAnalysis: (analysis: SavedAnalysis) => void;
  deleteAnalysis: (id: string) => void;
  clearAll: () => void;
  setCurrentAnalysisId: (id: string | null) => void;
  replaceAnalyses: (analyses: SavedAnalysis[]) => void;

  // Sync
  sync: SyncStatus;
  setSyncing: (isSyncing: boolean) => void;
  markSynced: () => void;
  markPendingPush: (count: number) => void;

  // Settings
  preferredIndustry: string;
  setPreferredIndustry: (industry: string) => void;
  autoSaveAnalyses: boolean;
  setAutoSaveAnalyses: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: "landing",
      setView: (view) => {
        set({ view });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },

      theme: "dark",
      setTheme: (theme) => {
        set({ theme });
        // If logged in, push to server
        const state = get();
        if (state.user) {
          fetch("/api/preferences", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ theme }),
          }).catch(() => {});
        }
      },
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        get().setTheme(newTheme);
      },

      user: null,
      setUser: (user) => set({ user }),
      isAuthenticated: () => get().user !== null,

      analyses: [],
      currentAnalysisId: null,
      saveAnalysis: (transcript, result, serverId, serverCreatedAt) => {
        const id = serverId ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const saved: SavedAnalysis = {
          id,
          createdAt: serverCreatedAt ?? Date.now(),
          transcript,
          result,
        };
        const wasLocal = !serverId;
        set({
          analyses: [saved, ...get().analyses],
          sync: wasLocal
            ? { ...get().sync, pendingPushCount: get().sync.pendingPushCount + 1 }
            : get().sync,
        });
        return id;
      },
      upsertAnalysis: (analysis) => {
        const existing = get().analyses.find((a) => a.id === analysis.id);
        if (existing) {
          set({
            analyses: get().analyses.map((a) => (a.id === analysis.id ? analysis : a)),
          });
        } else {
          set({ analyses: [analysis, ...get().analyses] });
        }
      },
      deleteAnalysis: (id) => {
        set({
          analyses: get().analyses.filter((a) => a.id !== id),
          currentAnalysisId: get().currentAnalysisId === id ? null : get().currentAnalysisId,
        });
        // If logged in, also delete from server (only if id isn't a "local-" prefixed one)
        const user = get().user;
        if (user && !id.startsWith("local-")) {
          fetch(`/api/analyses?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
        }
      },
      clearAll: () => {
        set({ analyses: [], currentAnalysisId: null, sync: { ...get().sync, pendingPushCount: 0 } });
        const user = get().user;
        if (user) {
          fetch("/api/analyses?all=1", { method: "DELETE" }).catch(() => {});
        }
      },
      setCurrentAnalysisId: (id) => set({ currentAnalysisId: id }),
      replaceAnalyses: (analyses) => set({ analyses }),

      sync: {
        hasFetchedFromServer: false,
        isSyncing: false,
        lastSyncedAt: null,
        pendingPushCount: 0,
      },
      setSyncing: (isSyncing) => set({ sync: { ...get().sync, isSyncing } }),
      markSynced: () =>
        set({
          sync: {
            hasFetchedFromServer: true,
            isSyncing: false,
            lastSyncedAt: Date.now(),
            pendingPushCount: 0,
          },
        }),
      markPendingPush: (count) =>
        set({ sync: { ...get().sync, pendingPushCount: count } }),

      preferredIndustry: "Any",
      setPreferredIndustry: (preferredIndustry) => {
        set({ preferredIndustry });
        const user = get().user;
        if (user) {
          fetch("/api/preferences", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ preferredIndustry }),
          }).catch(() => {});
        }
      },
      autoSaveAnalyses: true,
      setAutoSaveAnalyses: (autoSaveAnalyses) => {
        set({ autoSaveAnalyses });
        const user = get().user;
        if (user) {
          fetch("/api/preferences", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ autoSaveAnalyses }),
          }).catch(() => {});
        }
      },
    }),
    {
      name: "sdr-intelligence-engine",
      partialize: (state) => ({
        theme: state.theme,
        analyses: state.analyses,
        preferredIndustry: state.preferredIndustry,
        autoSaveAnalyses: state.autoSaveAnalyses,
        // We deliberately do NOT persist `user` to localStorage —
        // the NextAuth session cookie is the source of truth.
      }),
    }
  )
);
