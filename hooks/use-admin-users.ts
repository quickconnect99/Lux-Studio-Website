"use client";

import { useCallback, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { AdminAccountSummary } from "@/lib/admin-types";

type MutationState = { id: string; kind: "grant" | "revoke" } | null;

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

/**
 * Loads Supabase auth accounts and their `admin_users` membership, and lets
 * an already-authorized admin grant or revoke workspace access for other
 * accounts. All reads and writes go through `/api/admin/users`, which is the
 * only place holding the service-role key.
 */
export function useAdminUsers() {
  const [accounts, setAccounts] = useState<AdminAccountSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mutatingAccount, setMutatingAccount] = useState<MutationState>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError("Missing admin session.");
        return;
      }

      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.message ?? "Could not load Supabase accounts.");
        return;
      }

      setAccounts(Array.isArray(body?.accounts) ? body.accounts : []);
    } catch {
      setError("Could not load Supabase accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  const setAccountAdminState = useCallback(
    async (userId: string, kind: "grant" | "revoke") => {
      setMutatingAccount({ id: userId, kind });
      setError(null);

      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          setError("Missing admin session.");
          return false;
        }

        const response = await fetch("/api/admin/users", {
          method: kind === "grant" ? "POST" : "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId })
        });
        const body = await response.json().catch(() => null);

        if (!response.ok) {
          setError(body?.message ?? "The request failed.");
          return false;
        }

        setAccounts((current) =>
          current.map((account) =>
            account.id === userId
              ? { ...account, isAdmin: kind === "grant" }
              : account
          )
        );
        return true;
      } catch {
        setError("The request failed.");
        return false;
      } finally {
        setMutatingAccount(null);
      }
    },
    []
  );

  const grantAccess = useCallback(
    (userId: string) => setAccountAdminState(userId, "grant"),
    [setAccountAdminState]
  );
  const revokeAccess = useCallback(
    (userId: string) => setAccountAdminState(userId, "revoke"),
    [setAccountAdminState]
  );

  return {
    accounts,
    loading,
    error,
    mutatingAccount,
    loadAccounts,
    grantAccess,
    revokeAccess
  };
}
