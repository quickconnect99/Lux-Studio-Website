"use client";

import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Mail, Send } from "lucide-react";
import { useAdminEmailSettings } from "@/hooks/use-admin-email-settings";

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return null;
  }
}

/**
 * Lets an authorized admin configure the SMTP mailbox used to email inquiry
 * notifications, and send a live test message before saving. All reads and
 * writes go through `/api/admin/email-settings`; the stored password is
 * never sent back to the browser.
 */
export function AdminEmailSettingsPanel() {
  const {
    formState,
    hasStoredPassword,
    updatedAt,
    loading,
    saving,
    testing,
    error,
    statusMessage,
    updateField,
    load,
    save,
    sendTest
  } = useAdminEmailSettings();

  useEffect(() => {
    void load();
  }, [load]);

  const formattedUpdatedAt = formatUpdatedAt(updatedAt);
  const busy = saving || testing;

  return (
    <div className="panel-2xl admin-theme-surface space-y-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold tracking-tight text-foreground">
            Inquiry email notifications
          </p>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
            Configure the SMTP mailbox used to notify you by email when a new
            inquiry is submitted. Inquiries are always saved to the database
            first, regardless of this configuration.
          </p>
          {formattedUpdatedAt ? (
            <p className="mt-1.5 text-[0.72rem] text-muted">
              Last saved {formattedUpdatedAt}
            </p>
          ) : null}
        </div>
        <Mail className="h-6 w-6 shrink-0 text-muted" />
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading email settings…</p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-xs uppercase tracking-meta text-muted sm:col-span-2">
              SMTP host
              <input
                type="text"
                value={formState.smtpHost}
                onChange={(e) => updateField("smtpHost", e.target.value)}
                placeholder="smtp.example.com"
                className="input-field text-sm normal-case tracking-normal"
                autoComplete="off"
              />
            </label>
            <label className="space-y-2 text-xs uppercase tracking-meta text-muted">
              Port
              <input
                type="number"
                min={1}
                max={65535}
                value={formState.smtpPort}
                onChange={(e) => updateField("smtpPort", e.target.value)}
                className="input-field text-sm normal-case tracking-normal"
              />
            </label>
            <label className="toggle-row mt-6 sm:mt-0">
              <input
                type="checkbox"
                checked={formState.smtpSecure}
                onChange={(e) => updateField("smtpSecure", e.target.checked)}
                className="h-4 w-4"
              />
              Use implicit TLS (usually port 465)
            </label>
            <label className="space-y-2 text-xs uppercase tracking-meta text-muted">
              SMTP username
              <input
                type="text"
                value={formState.smtpUser}
                onChange={(e) => updateField("smtpUser", e.target.value)}
                placeholder="you@yourdomain.com"
                className="input-field text-sm normal-case tracking-normal"
                autoComplete="off"
              />
            </label>
            <label className="space-y-2 text-xs uppercase tracking-meta text-muted">
              SMTP password
              <input
                type="password"
                value={formState.smtpPassword}
                onChange={(e) => updateField("smtpPassword", e.target.value)}
                placeholder={
                  hasStoredPassword
                    ? "Leave blank to keep the current password"
                    : "Required"
                }
                className="input-field text-sm normal-case tracking-normal"
                autoComplete="new-password"
              />
            </label>
            <label className="space-y-2 text-xs uppercase tracking-meta text-muted">
              Send notifications to
              <input
                type="email"
                value={formState.inquiryEmailTo}
                onChange={(e) => updateField("inquiryEmailTo", e.target.value)}
                placeholder="team@yourdomain.com"
                className="input-field text-sm normal-case tracking-normal"
                autoComplete="off"
              />
            </label>
            <label className="space-y-2 text-xs uppercase tracking-meta text-muted">
              From address
              <input
                type="text"
                value={formState.inquiryEmailFrom}
                onChange={(e) =>
                  updateField("inquiryEmailFrom", e.target.value)
                }
                placeholder="Defaults to the SMTP username"
                className="input-field text-sm normal-case tracking-normal"
                autoComplete="off"
              />
            </label>
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

          {statusMessage ? (
            <p
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 text-sm text-success-text"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {statusMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="control-pill border-foreground bg-foreground text-background disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save settings"}
            </button>
            <button
              type="button"
              onClick={() => void sendTest()}
              disabled={busy}
              className="control-pill disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {testing ? "Sending test…" : "Send test email"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
