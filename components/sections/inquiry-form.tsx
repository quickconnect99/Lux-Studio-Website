"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { BRIEF_MAX } from "@/lib/inquiry";
import { useInquiryForm } from "@/hooks/use-inquiry-form";
import { FieldError } from "@/components/ui/field-error";
import { cn } from "@/lib/utils";
import type { InquiryServiceType } from "@/lib/types";
import type { InquiryServiceOption } from "@/components/sections/service-inquiry-options";

export function InquiryForm({
  label = "Project inquiry",
  submitLabel = "Send Inquiry",
  serviceOptions,
  initialServiceType = ""
}: {
  label?: string;
  submitLabel?: string;
  serviceOptions: InquiryServiceOption[];
  initialServiceType?: InquiryServiceType | "";
}) {
  const {
    formState,
    errors,
    status,
    message,
    shaking,
    website,
    setWebsite,
    startedAt,
    updateField,
    handleSubmit,
    resetInquiry,
    briefRemaining,
    briefNearLimit,
    briefAtLimit
  } = useInquiryForm();
  const initialServiceApplied = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const announcedMessage = useRef("");

  useEffect(() => {
    if (!message || announcedMessage.current === message) return;
    announcedMessage.current = message;
    if (
      status === "success" ||
      (status === "error" && Object.keys(errors).length === 0)
    ) {
      feedbackRef.current?.focus({ preventScroll: true });
      feedbackRef.current?.scrollIntoView({
        block: "center",
        behavior: "instant"
      });
    }
  }, [status, message, errors]);

  useEffect(() => {
    if (initialServiceApplied.current || !initialServiceType) return;
    initialServiceApplied.current = true;
    updateField("serviceType", initialServiceType);
  }, [initialServiceType, updateField]);

  if (status === "success") {
    return (
      <div
        ref={feedbackRef}
        tabIndex={-1}
        role="status"
        className="panel-2xl space-y-5 p-5 sm:p-8"
      >
        <CheckCircle2
          className="h-10 w-10 text-success-text"
          aria-hidden="true"
        />
        <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase">
          Inquiry received
        </h2>
        <p className="description-copy text-foreground">{message}</p>
        <button
          type="button"
          className="action-button"
          onClick={() => {
            announcedMessage.current = "";
            resetInquiry(initialServiceType);
          }}
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn("panel-2xl p-5 sm:p-8", shaking && "shake")}
    >
      <input type="hidden" name="startedAt" value={startedAt} readOnly />
      <label className="hidden" aria-hidden="true">
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          name="website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </label>

      <p className="mb-5 text-xs uppercase tracking-eyebrow text-muted">
        {label}
      </p>
      <p className="mb-4 text-sm text-muted">
        Fields marked <span aria-hidden="true">*</span> are required.
      </p>
      {status === "error" && message ? (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role="alert"
          className="mb-5 flex gap-3 rounded-xl border border-error-text bg-panel px-4 py-4 text-sm text-error-text"
        >
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase leading-none">
              {Object.keys(errors).length
                ? "Check your inquiry"
                : "Unable to send"}
            </h2>
            <p className="mt-2">{message}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-muted">
          <span className="text-xs uppercase tracking-eyebrow">
            Name <span aria-hidden="true">*</span>
          </span>
          <input
            data-inquiry-field="name"
            required
            autoComplete="name"
            value={formState.name}
            maxLength={80}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "inquiry-name-error" : undefined}
            onChange={(event) => updateField("name", event.target.value)}
            className={cn("input-field", errors.name && "field-error")}
            placeholder="Your name"
          />
          {errors.name && (
            <FieldError id="inquiry-name-error" message={errors.name} />
          )}
        </label>

        <label className="space-y-2 text-sm text-muted">
          <span className="text-xs uppercase tracking-eyebrow">
            Email <span aria-hidden="true">*</span>
          </span>
          <input
            data-inquiry-field="email"
            required
            type="email"
            autoComplete="email"
            value={formState.email}
            maxLength={160}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "inquiry-email-error" : undefined}
            onChange={(event) => updateField("email", event.target.value)}
            className={cn("input-field", errors.email && "field-error")}
            placeholder="name@company.com"
          />
          {errors.email && (
            <FieldError id="inquiry-email-error" message={errors.email} />
          )}
        </label>
      </div>

      <label className="mt-4 block space-y-2 text-sm text-muted">
        <span className="text-xs uppercase tracking-eyebrow">
          Company{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </span>
        <input
          data-inquiry-field="company"
          autoComplete="organization"
          value={formState.company}
          maxLength={80}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={
            errors.company ? "inquiry-company-error" : undefined
          }
          onChange={(event) => updateField("company", event.target.value)}
          className={cn("input-field", errors.company && "field-error")}
          placeholder="Brand, agency, or production partner"
        />
        {errors.company && (
          <FieldError id="inquiry-company-error" message={errors.company} />
        )}
      </label>

      <label className="mt-4 block space-y-2 text-sm text-muted">
        <span className="text-xs uppercase tracking-eyebrow">
          Service Type <span aria-hidden="true">*</span>
        </span>
        <select
          data-inquiry-field="serviceType"
          required
          value={formState.serviceType}
          aria-invalid={Boolean(errors.serviceType)}
          aria-describedby={
            errors.serviceType ? "inquiry-service-error" : undefined
          }
          onChange={(event) =>
            updateField(
              "serviceType",
              event.target.value as InquiryServiceType | ""
            )
          }
          className={cn("input-field", errors.serviceType && "field-error")}
        >
          <option value="" disabled>
            Select a service type
          </option>
          {serviceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.serviceType && (
          <FieldError id="inquiry-service-error" message={errors.serviceType} />
        )}
      </label>

      <label className="mt-4 block space-y-2 text-sm text-muted">
        <span className="text-xs uppercase tracking-eyebrow">
          Brief <span aria-hidden="true">*</span>
        </span>
        <textarea
          data-inquiry-field="brief"
          required
          value={formState.brief}
          maxLength={BRIEF_MAX}
          aria-invalid={Boolean(errors.brief)}
          aria-describedby={
            errors.brief ? "inquiry-brief-error" : "inquiry-brief-hint"
          }
          onChange={(event) => updateField("brief", event.target.value)}
          className={cn(
            "textarea-field min-h-40",
            errors.brief && "field-error"
          )}
          placeholder="Tell us about the project, deliverables, timing, location, and campaign context."
        />
        <div className="grid gap-2 sm:flex sm:items-start sm:justify-between sm:gap-4">
          <p id="inquiry-brief-hint" className="text-xs leading-6 text-muted">
            Include the subject, deliverables, timing, location, and campaign
            context.
          </p>
          <p
            className={cn(
              "shrink-0 text-xs tabular-nums transition-colors duration-150",
              briefAtLimit
                ? "font-semibold text-error-text"
                : briefNearLimit
                  ? "text-warning-text"
                  : "text-muted"
            )}
          >
            {briefRemaining} / {BRIEF_MAX}
          </p>
        </div>
        {errors.brief && (
          <FieldError id="inquiry-brief-error" message={errors.brief} />
        )}
      </label>

      <div className="mt-6">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="action-button w-full sm:w-auto"
        >
          {status === "submitting" ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {status === "submitting" ? "Sending..." : submitLabel}
        </button>
      </div>

      <p className="mt-4 max-w-2xl text-xs leading-6 text-muted">
        By submitting this form, your information is processed solely to review
        and respond to your project inquiry. Details are available in our{" "}
        <Link
          href="/datenschutz"
          className="text-foreground underline underline-offset-4"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
