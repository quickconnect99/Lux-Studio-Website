import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const EMAIL_SETTINGS_ID = "global";
const DEFAULT_SMTP_PORT = 587;

export type EmailSettingsRow = {
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_secure: boolean;
  smtp_user: string | null;
  smtp_password: string | null;
  inquiry_email_to: string | null;
  inquiry_email_from: string | null;
  verified_at: string | null;
  updated_at: string;
};

const EMAIL_SETTINGS_COLUMNS =
  "smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, inquiry_email_to, inquiry_email_from, verified_at, updated_at";

/** The subset of email settings that is safe to send to the browser. */
export type PublicEmailSettings = {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  hasSmtpPassword: boolean;
  inquiryEmailTo: string;
  inquiryEmailFrom: string;
  /** True only when a test send has succeeded since the last save. */
  isVerified: boolean;
  verifiedAt: string | null;
  updatedAt: string | null;
};

export type EmailSettingsInput = {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword?: string;
  inquiryEmailTo: string;
  inquiryEmailFrom: string;
};

/** Fetches the stored SMTP row, or `null` when unconfigured/unavailable. */
export async function fetchStoredEmailSettings(
  supabase: SupabaseClient | null = createAdminSupabaseClient()
): Promise<EmailSettingsRow | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("email_settings")
    .select(EMAIL_SETTINGS_COLUMNS)
    .eq("id", EMAIL_SETTINGS_ID)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as EmailSettingsRow;
}

/** Strips the password before a settings row leaves the server. */
export function toPublicEmailSettings(
  row: EmailSettingsRow | null
): PublicEmailSettings {
  return {
    smtpHost: row?.smtp_host ?? "",
    smtpPort: row?.smtp_port ?? DEFAULT_SMTP_PORT,
    smtpSecure: row?.smtp_secure ?? false,
    smtpUser: row?.smtp_user ?? "",
    hasSmtpPassword: Boolean(row?.smtp_password),
    inquiryEmailTo: row?.inquiry_email_to ?? "",
    inquiryEmailFrom: row?.inquiry_email_from ?? "",
    isVerified: Boolean(row?.verified_at),
    verifiedAt: row?.verified_at ?? null,
    updatedAt: row?.updated_at ?? null
  };
}

/**
 * Saves the singleton SMTP settings row.
 *
 * An empty/omitted `smtpPassword` keeps whichever password is already
 * stored, so the admin panel never has to redisplay (or resend) the secret
 * just to change an unrelated field. Every save clears `verified_at`: the
 * saved configuration is only "working" again once it passes a fresh test.
 */
export async function saveEmailSettings(
  supabase: SupabaseClient,
  input: EmailSettingsInput
) {
  const changes: Record<string, unknown> = {
    smtp_host: input.smtpHost,
    smtp_port: input.smtpPort,
    smtp_secure: input.smtpSecure,
    smtp_user: input.smtpUser,
    inquiry_email_to: input.inquiryEmailTo,
    inquiry_email_from: input.inquiryEmailFrom,
    verified_at: null
  };

  if (input.smtpPassword) {
    changes.smtp_password = input.smtpPassword;
  }

  return supabase
    .from("email_settings")
    .upsert(
      { id: EMAIL_SETTINGS_ID, ...changes },
      { onConflict: "id" }
    )
    .select(EMAIL_SETTINGS_COLUMNS)
    .single();
}

/** Marks the current configuration as verified after a successful test send. */
export async function markEmailSettingsVerified(supabase: SupabaseClient) {
  return supabase
    .from("email_settings")
    .update({ verified_at: new Date().toISOString() })
    .eq("id", EMAIL_SETTINGS_ID)
    .select(EMAIL_SETTINGS_COLUMNS)
    .single();
}
