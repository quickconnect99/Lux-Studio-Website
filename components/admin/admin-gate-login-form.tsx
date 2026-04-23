"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminGateLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  const redirectTo = searchParams.get("next") ?? "/admin";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin-gate/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password,
          redirectTo
        })
      });

      const payload = (await response
        .json()
        .catch(() => null)) as { message?: string; redirectTo?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Admin gate login failed.");
      }

      router.replace(payload?.redirectTo ?? "/admin");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Admin gate login failed."
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="panel-2xl grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:p-10"
    >
      <div className="space-y-5">
        <p className="text-xs uppercase tracking-eyebrow text-muted">
          Admin gate
        </p>
        <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none text-foreground sm:text-5xl lg:text-6xl">
          Internal
          <span className="block pl-8 text-accent sm:pl-12">Access</span>
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
          This entry gate protects the admin route before the Supabase login is
          shown. After this step, you still sign in with your Supabase editor
          account inside the admin workspace.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-line bg-panel-secondary p-5">
            <p className="text-xs uppercase tracking-eyebrow text-accent">
              Step 01
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Use the internal gate credentials to unlock the protected route.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-line bg-panel-secondary p-5">
            <p className="text-xs uppercase tracking-eyebrow text-accent">
              Step 02
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Continue with your Supabase email and password to manage projects
              and site settings.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-[1.75rem] border border-line bg-panel-secondary p-5 sm:p-6">
        <div className="grid gap-4">
          <label className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">Gate user</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="input-field"
              autoComplete="username"
            />
          </label>

          <label className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">
              Gate password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-field"
              autoComplete="current-password"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={working}
            className="action-button disabled:opacity-70"
          >
            {working ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {working ? "Checking..." : "Continue"}
          </button>
        </div>

        {message ? (
          <p className={cn("text-sm text-error")}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}
