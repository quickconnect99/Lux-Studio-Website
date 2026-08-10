"use client";

import { useCallback, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { PublicEmailSettings } from "@/lib/email-settings";

export type EmailSettingsFormState = {
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  inquiryEmailTo: string;
  inquiryEmailFrom: string;
};

const emptyFormState: EmailSettingsFormState = {
  smtpHost: "",
  smtpPort: "587",
  smtpSecure: false,
  smtpUser: "",
  smtpPassword: "",
  inquiryEmailTo: "",
  inquiryEmailFrom: ""
};

function toFormState(settings: PublicEmailSettings): EmailSettingsFormState {
  return {
    smtpHost: settings.smtpHost,
    smtpPort: String(settings.smtpPort),
    smtpSecure: settings.smtpSecure,
    smtpUser: settings.smtpUser,
    smtpPassword: "",
    inquiryEmailTo: settings.inquiryEmailTo,
    inquiryEmailFrom: settings.inquiryEmailFrom
  };
}

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
 * Loads and saves the admin-panel SMTP settings used for inquiry email
 * notifications, and lets an admin send a live test email before saving. All
 * reads and writes go through `/api/admin/email-settings`, which is the only
 * place holding the service-role key and the stored SMTP password.
 */
export function useAdminEmailSettings() {
  const [formState, setFormState] = useState<EmailSettingsFormState>(
    emptyFormState
  );
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof EmailSettingsFormState>(
      key: K,
      value: EmailSettingsFormState[K]
    ) => {
      setStatusMessage(null);
      setFormState((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError("Missing admin session.");
        return;
      }

      const response = await fetch("/api/admin/email-settings", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.message ?? "Could not load email settings.");
        return;
      }

      const settings = body?.settings as PublicEmailSettings | undefined;
      if (settings) {
        setFormState(toFormState(settings));
        setHasStoredPassword(settings.hasSmtpPassword);
        setUpdatedAt(settings.updatedAt);
      }
    } catch {
      setError("Could not load email settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    setStatusMessage(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError("Missing admin session.");
        return false;
      }

      const response = await fetch("/api/admin/email-settings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          smtpHost: formState.smtpHost,
          smtpPort: Number(formState.smtpPort),
          smtpSecure: formState.smtpSecure,
          smtpUser: formState.smtpUser,
          smtpPassword: formState.smtpPassword,
          inquiryEmailTo: formState.inquiryEmailTo,
          inquiryEmailFrom: formState.inquiryEmailFrom
        })
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.message ?? "The email settings could not be saved.");
        return false;
      }

      const settings = body?.settings as PublicEmailSettings | undefined;
      if (settings) {
        setFormState(toFormState(settings));
        setHasStoredPassword(settings.hasSmtpPassword);
        setUpdatedAt(settings.updatedAt);
      }
      setStatusMessage("Email settings saved.");
      return true;
    } catch {
      setError("The email settings could not be saved.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [formState]);

  const sendTest = useCallback(async () => {
    setTesting(true);
    setError(null);
    setStatusMessage(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError("Missing admin session.");
        return false;
      }

      const response = await fetch("/api/admin/email-settings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "test",
          smtpHost: formState.smtpHost,
          smtpPort: Number(formState.smtpPort),
          smtpSecure: formState.smtpSecure,
          smtpUser: formState.smtpUser,
          smtpPassword: formState.smtpPassword,
          inquiryEmailTo: formState.inquiryEmailTo,
          inquiryEmailFrom: formState.inquiryEmailFrom
        })
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.message ?? "The test email could not be sent.");
        return false;
      }

      setStatusMessage(body?.message ?? "Test email sent.");
      return true;
    } catch {
      setError("The test email could not be sent.");
      return false;
    } finally {
      setTesting(false);
    }
  }, [formState]);

  return {
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
  };
}
