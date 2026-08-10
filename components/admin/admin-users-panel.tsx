"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  UserPlus
} from "lucide-react";
import { useAdminUsers } from "@/hooks/use-admin-users";
import type { AdminAccountSummary } from "@/lib/admin-types";

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(value));
  } catch {
    return "Unknown";
  }
}

function AccountRow({
  account,
  isMutating,
  pendingRevoke,
  onGrant,
  onRevokeClick
}: {
  account: AdminAccountSummary;
  isMutating: boolean;
  pendingRevoke: boolean;
  onGrant: () => void;
  onRevokeClick: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel-secondary px-4 py-3.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {account.email ?? "(no email)"}
        </p>
        <p className="mt-0.5 text-[0.72rem] text-muted">
          Created {formatDate(account.createdAt)} · Last sign-in{" "}
          {formatDate(account.lastSignInAt)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.65rem] uppercase tracking-eyebrow ${
            account.isAdmin
              ? "bg-success/15 text-success-text"
              : "bg-warning/15 text-warning-text"
          }`}
        >
          {account.isAdmin ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <ShieldOff className="h-3.5 w-3.5" />
          )}
          {account.isAdmin ? "Admin" : "Pending"}
        </span>
        {account.isAdmin ? (
          <button
            type="button"
            onClick={onRevokeClick}
            disabled={isMutating}
            className={`control-pill disabled:cursor-not-allowed disabled:opacity-60 ${
              pendingRevoke ? "border-error bg-error text-white" : ""
            }`}
          >
            {pendingRevoke ? "Confirm revoke?" : "Revoke access"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onGrant}
            disabled={isMutating}
            className="control-pill border-foreground bg-foreground text-background disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            Approve
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Lets an authorized admin see every Supabase auth account and grant or
 * revoke its `admin_users` membership, instead of running SQL by hand for
 * each new teammate.
 */
export function AdminUsersPanel() {
  const {
    accounts,
    loading,
    error,
    mutatingAccount,
    loadAccounts,
    grantAccess,
    revokeAccess
  } = useAdminUsers();
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  async function handleRevokeClick(userId: string) {
    if (pendingRevokeId !== userId) {
      setPendingRevokeId(userId);
      return;
    }

    setPendingRevokeId(null);
    await revokeAccess(userId);
  }

  const pendingAccounts = accounts.filter((account) => !account.isAdmin);
  const adminAccounts = accounts.filter((account) => account.isAdmin);

  return (
    <div className="panel-2xl admin-theme-surface space-y-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold tracking-tight text-foreground">
            Admin access
          </p>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
            Every Supabase account that can sign in still needs explicit
            approval before it can edit projects, site settings, or storage.
            Approve a new account here instead of inserting it into{" "}
            <code className="text-foreground">admin_users</code> by hand.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadAccounts()}
          disabled={loading}
          className="control-pill disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <p
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 text-sm text-error-text"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {loading && accounts.length === 0 ? (
        <p className="text-sm text-muted">Loading Supabase accounts…</p>
      ) : accounts.length === 0 ? (
        <p className="text-sm text-muted">
          No Supabase accounts found yet. New sign-ups will appear here.
        </p>
      ) : (
        <div className="space-y-6">
          {pendingAccounts.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-eyebrow text-muted">
                Waiting for approval ({pendingAccounts.length})
              </p>
              <div className="space-y-2">
                {pendingAccounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    isMutating={mutatingAccount?.id === account.id}
                    pendingRevoke={pendingRevokeId === account.id}
                    onGrant={() => void grantAccess(account.id)}
                    onRevokeClick={() => void handleRevokeClick(account.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-eyebrow text-muted">
              Admins ({adminAccounts.length})
            </p>
            {adminAccounts.length === 0 ? (
              <p className="text-sm text-muted">
                No account has admin access yet.
              </p>
            ) : (
              <div className="space-y-2">
                {adminAccounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    isMutating={mutatingAccount?.id === account.id}
                    pendingRevoke={pendingRevokeId === account.id}
                    onGrant={() => void grantAccess(account.id)}
                    onRevokeClick={() => void handleRevokeClick(account.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
