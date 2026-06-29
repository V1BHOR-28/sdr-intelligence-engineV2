"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Settings, Cloud, CloudOff } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

function getInitials(name?: string | null, email?: string) {
  if (name && name.trim()) {
    return name.trim().slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export function UserMenu() {
  const user = useAppStore((s) => s.user);
  const sync = useAppStore((s) => s.sync);
  const setView = useAppStore((s) => s.setView);
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut({ redirect: false });
      toast.success("Signed out", {
        description: "Your calls are still saved on this device.",
      });
      setTimeout(() => window.location.reload(), 300);
    } catch {
      toast.error("Couldn't sign out. Try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-semibold">
              {getInitials(user?.name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">
            {user?.name || user?.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="font-medium text-sm truncate">{user?.name || "User"}</span>
          <span className="text-xs text-muted-foreground font-normal truncate">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs flex items-center gap-2">
          {sync.isSyncing ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-muted-foreground">Syncing to cloud...</span>
            </>
          ) : sync.lastSyncedAt ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">
                Synced {new Date(sync.lastSyncedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            </>
          ) : (
            <>
              <CloudOff className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Local only</span>
            </>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setView("settings")}>
          <Settings className="w-3.5 h-3.5 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          {signingOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
