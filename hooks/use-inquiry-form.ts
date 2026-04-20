"use client";

import { useState } from "react";
import type { Inquiry } from "@/lib/types";
import {
  BRIEF_MAX,
  type InquiryErrors,
  getInquiryProtectionIssue,
  sanitizeInquiry,
  validateInquiry
} from "@/lib/inquiry";

const initialState: Inquiry = {
  name: "",
  email: "",
  company: "",
  serviceType: "",
  brief: ""
};

export type InquiryStatus = "idle" | "submitting" | "success" | "error";

/**
 * All state and submit logic for the inquiry form.
 *
 * Separating logic from JSX keeps InquiryForm as a pure render layer
 * and allows the validation + Supabase flow to be tested independently.
 *
 * @example
 * const form = useInquiryForm();
 * <input value={form.formState.name} onChange={(e) => form.updateField("name", e.target.value)} />
 */
export function useInquiryForm() {
  const [formState, setFormState] = useState<Inquiry>(initialState);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<InquiryStatus>("idle");
  const [message, setMessage] = useState("");
  const [shaking, setShaking] = useState(false);
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());

  function updateField<Key extends keyof Inquiry>(
    field: Key,
    value: Inquiry[Key]
  ) {
    setFormState((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function triggerShake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  }

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setMessage("");

    const sanitized = sanitizeInquiry(formState);
    const nextErrors = validateInquiry(sanitized);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("error");
      setMessage(
        "Please review the highlighted fields before sending the inquiry."
      );
      triggerShake();
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const protectionIssue = getInquiryProtectionIssue({ website, startedAt });

      if (protectionIssue) {
        throw new Error(protectionIssue);
      }

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...sanitized,
          website,
          startedAt
        })
      });

      const payload = (await response
        .json()
        .catch(() => null)) as
        | { message?: string; errors?: InquiryErrors }
        | null;

      if (!response.ok) {
        if (payload?.errors) {
          setErrors(payload.errors);
        }

        throw new Error(
          payload?.message ?? "The inquiry could not be submitted."
        );
      }

      setStatus("success");
      setMessage(
        payload?.message ?? "Inquiry received - we'll be in touch within 24-48 hours."
      );
      setFormState(initialState);
      setWebsite("");
      setStartedAt(Date.now());
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The inquiry could not be submitted."
      );
      triggerShake();
    }
  }

  const briefRemaining = BRIEF_MAX - formState.brief.length;
  const briefNearLimit = briefRemaining <= 150;
  const briefAtLimit = briefRemaining <= 0;

  return {
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
  };
}
