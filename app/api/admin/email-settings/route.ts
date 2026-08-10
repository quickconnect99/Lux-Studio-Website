import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  fetchStoredEmailSettings,
  saveEmailSettings,
  toPublicEmailSettings
} from "@/lib/email-settings";
import type {
  EmailSettingsInput,
  EmailSettingsRow,
  PublicEmailSettings
} from "@/lib/email-settings";
import { sendTestInquiryEmail } from "@/lib/email";
import type { SmtpConfig } from "@/lib/email";
import { isAllowedRequestOrigin } from "@/lib/request-security";
import { getRequestId, logServerEvent } from "@/lib/server-observability";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIN_SMTP_PORT = 1;
const MAX_SMTP_PORT = 65_535;

type CheckResult = { data: unknown; error: unknown };

type EmailSettingsDependencies = {
  checkAdmin: (accessToken: string) => Promise<CheckResult>;
  getSettings: () => Promise<EmailSettingsRow | null>;
  saveSettings: (
    input: EmailSettingsInput
  ) => Promise<{ data: EmailSettingsRow | null; error: unknown }>;
  sendTest: (config: SmtpConfig) => Promise<void>;
};

function createDefaultDependencies(): EmailSettingsDependencies | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminClient = createAdminSupabaseClient();

  if (!supabaseUrl || !supabaseAnonKey || !adminClient) {
    return null;
  }

  return {
    async checkAdmin(accessToken) {
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      }).rpc("is_admin");
    },
    getSettings: () => fetchStoredEmailSettings(adminClient),
    async saveSettings(input) {
      const { data, error } = await saveEmailSettings(adminClient, input);
      return { data: data as EmailSettingsRow | null, error };
    },
    sendTest: (config) => sendTestInquiryEmail(config)
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  requestId: string
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-request-id": requestId
    }
  });
}

async function requireAdmin(
  request: Request,
  dependencies: EmailSettingsDependencies,
  requestId: string
) {
  if (!isAllowedRequestOrigin(request)) {
    logServerEvent({
      level: "warn",
      event: "admin_email_settings.origin_rejected",
      requestId
    });
    return {
      ok: false as const,
      response: jsonResponse(
        { message: "This origin is not allowed." },
        403,
        requestId
      )
    };
  }

  const accessToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  if (!accessToken) {
    return {
      ok: false as const,
      response: jsonResponse({ message: "Missing admin session." }, 401, requestId)
    };
  }

  const { data: isAdmin, error } = await dependencies.checkAdmin(accessToken);

  if (error || isAdmin !== true) {
    logServerEvent({
      level: "warn",
      event: "admin_email_settings.forbidden",
      requestId,
      error
    });
    return {
      ok: false as const,
      response: jsonResponse(
        { message: "This session is not authorized to manage email settings." },
        403,
        requestId
      )
    };
  }

  return { ok: true as const };
}

function readString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function validateSettingsInput(body: Record<string, unknown>) {
  const smtpHost = readString(body, "smtpHost");
  const smtpUser = readString(body, "smtpUser");
  const smtpPassword = readString(body, "smtpPassword");
  const inquiryEmailTo = readString(body, "inquiryEmailTo");
  const inquiryEmailFrom = readString(body, "inquiryEmailFrom");
  const smtpSecure = body.smtpSecure === true;
  const smtpPort = Number(body.smtpPort);

  const errors: Record<string, string> = {};

  if (!smtpHost) {
    errors.smtpHost = "Enter the SMTP host.";
  }
  if (!smtpUser) {
    errors.smtpUser = "Enter the SMTP username.";
  }
  if (
    !Number.isInteger(smtpPort) ||
    smtpPort < MIN_SMTP_PORT ||
    smtpPort > MAX_SMTP_PORT
  ) {
    errors.smtpPort = "Enter a port between 1 and 65535.";
  }
  if (!inquiryEmailTo) {
    errors.inquiryEmailTo = "Enter the notification recipient address.";
  }

  return {
    errors,
    input: {
      smtpHost,
      smtpPort: Number.isInteger(smtpPort) ? smtpPort : 587,
      smtpSecure,
      smtpUser,
      ...(smtpPassword ? { smtpPassword } : {}),
      inquiryEmailTo,
      inquiryEmailFrom: inquiryEmailFrom || smtpUser
    } satisfies EmailSettingsInput
  };
}

async function resolveTestConfig(
  body: Record<string, unknown>,
  dependencies: EmailSettingsDependencies
): Promise<{ config: SmtpConfig } | { error: string }> {
  const { errors, input } = validateSettingsInput(body);

  if (Object.keys(errors).length > 0) {
    return { error: Object.values(errors)[0] };
  }

  let password = input.smtpPassword;

  if (!password) {
    const stored = await dependencies.getSettings();
    password = stored?.smtp_password ?? undefined;
  }

  if (!password) {
    return {
      error: "Enter a password to send a test email, or save one first."
    };
  }

  return {
    config: {
      host: input.smtpHost,
      port: input.smtpPort,
      secure: input.smtpSecure,
      user: input.smtpUser,
      password,
      to: input.inquiryEmailTo,
      from: input.inquiryEmailFrom
    }
  };
}

export function createEmailSettingsGetHandler(
  dependencies?: EmailSettingsDependencies
) {
  return async function GET(request: Request) {
    const requestId = getRequestId(request.headers);
    const resolvedDependencies = dependencies ?? createDefaultDependencies();

    if (!resolvedDependencies) {
      return jsonResponse({ message: "Email settings are unavailable." }, 503, requestId);
    }

    const auth = await requireAdmin(request, resolvedDependencies, requestId);
    if (!auth.ok) {
      return auth.response;
    }

    const row = await resolvedDependencies.getSettings();
    const settings: PublicEmailSettings = toPublicEmailSettings(row);

    return jsonResponse({ settings }, 200, requestId);
  };
}

export function createEmailSettingsPostHandler(
  dependencies?: EmailSettingsDependencies
) {
  return async function POST(request: Request) {
    const requestId = getRequestId(request.headers);
    const resolvedDependencies = dependencies ?? createDefaultDependencies();

    if (!resolvedDependencies) {
      return jsonResponse({ message: "Email settings are unavailable." }, 503, requestId);
    }

    const auth = await requireAdmin(request, resolvedDependencies, requestId);
    if (!auth.ok) {
      return auth.response;
    }

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!body || typeof body !== "object") {
      return jsonResponse({ message: "A JSON body is required." }, 400, requestId);
    }

    if (body.action === "test") {
      const resolved = await resolveTestConfig(body, resolvedDependencies);

      if ("error" in resolved) {
        return jsonResponse({ message: resolved.error }, 400, requestId);
      }

      try {
        await resolvedDependencies.sendTest(resolved.config);
      } catch (error) {
        logServerEvent({
          level: "warn",
          event: "admin_email_settings.test_failed",
          requestId,
          error
        });
        return jsonResponse(
          {
            message:
              "The test email could not be sent. Double-check the host, port, username, and password."
          },
          502,
          requestId
        );
      }

      logServerEvent({
        level: "info",
        event: "admin_email_settings.test_sent",
        requestId
      });
      return jsonResponse(
        { message: `Test email sent to ${resolved.config.to}.` },
        200,
        requestId
      );
    }

    const { errors, input } = validateSettingsInput(body);

    if (Object.keys(errors).length > 0) {
      return jsonResponse({ message: "Please review the highlighted fields.", errors }, 400, requestId);
    }

    const { data, error } = await resolvedDependencies.saveSettings(input);

    if (error || !data) {
      logServerEvent({
        level: "error",
        event: "admin_email_settings.save_failed",
        requestId,
        error
      });
      return jsonResponse(
        { message: "The email settings could not be saved." },
        500,
        requestId
      );
    }

    logServerEvent({
      level: "info",
      event: "admin_email_settings.saved",
      requestId
    });
    return jsonResponse(
      { settings: toPublicEmailSettings(data) },
      200,
      requestId
    );
  };
}

export const GET = createEmailSettingsGetHandler();
export const POST = createEmailSettingsPostHandler();
