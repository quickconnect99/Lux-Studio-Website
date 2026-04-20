"use client";

import Link from "next/link";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { BRIEF_MAX } from "@/lib/inquiry";
import { useInquiryForm } from "@/hooks/use-inquiry-form";
import { FieldError } from "@/components/ui/field-error";
import { cn } from "@/lib/utils";
import type { InquiryServiceType } from "@/lib/types";

export function InquiryForm() {
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
    briefRemaining,
    briefNearLimit,
    briefAtLimit
  } = useInquiryForm();

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn("panel-2xl p-6 sm:p-8", shaking && "shake")}
    >
      <input
        type="hidden"
        name="startedAt"
        value={startedAt}
        readOnly
      />
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-muted">
          <span className="text-xs uppercase tracking-eyebrow">Name</span>
          <input
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
          <span className="text-xs uppercase tracking-eyebrow">Email</span>
          <input
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
        <span className="text-xs uppercase tracking-eyebrow">Company</span>
        <input
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
        <span className="text-xs uppercase tracking-eyebrow">Service Type</span>
        <select
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
          <option value="Commercial Shoot">Commercial Shoot</option>
          <option value="Social Content">Social Content</option>
          <option value="Motion Direction">Motion Direction</option>
          <option value="Event Coverage">Event Coverage</option>
          <option value="Brand Campaign">Brand Campaign</option>
          <option value="Other">Other</option>
        </select>
        {errors.serviceType && (
          <FieldError id="inquiry-service-error" message={errors.serviceType} />
        )}
      </label>

      <label className="mt-4 block space-y-2 text-sm text-muted">
        <span className="text-xs uppercase tracking-eyebrow">Brief</span>
        <textarea
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
        <div className="flex items-start justify-between gap-4">
          <p id="inquiry-brief-hint" className="text-xs leading-6 text-muted">
            Include the subject, deliverables, timing, location, and campaign
            context.
          </p>
          <p
            className={cn(
              "shrink-0 text-xs tabular-nums transition-colors duration-150",
              briefAtLimit
                ? "font-semibold text-error"
                : briefNearLimit
                  ? "text-warning"
                  : "text-muted/60"
            )}
          >
            {briefRemaining} / {BRIEF_MAX}
          </p>
        </div>
        {errors.brief && (
          <FieldError id="inquiry-brief-error" message={errors.brief} />
        )}
      </label>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="action-button"
        >
          {status === "submitting" ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {status === "submitting" ? "Sending..." : "Send Inquiry"}
        </button>
      </div>

      <p className="mt-4 max-w-2xl text-xs leading-6 text-muted">
        Mit dem Absenden wird deine Anfrage ausschliesslich zur Bearbeitung
        deiner Projektanfrage verarbeitet. Details findest du in unserer{" "}
        <Link
          href="/datenschutz"
          className="text-foreground underline underline-offset-4"
        >
          Datenschutzerklaerung
        </Link>
        .
      </p>

      {message && (
        <p
          className={cn(
            "mt-4 text-sm",
            status === "error"
              ? "text-error"
              : status === "success"
                ? "text-success"
                : "text-foreground"
          )}
        >
          {message}
        </p>
      )}
    </form>
  );
}
