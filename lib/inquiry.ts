import type { Inquiry, InquiryServiceType } from "@/lib/types";

export const BRIEF_MAX = 1500;
export const INQUIRY_MIN_SUBMIT_MS = 3500;
export const INQUIRY_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const INQUIRY_RATE_LIMIT_MAX_REQUESTS = 5;
export const inquiryServiceTypes: InquiryServiceType[] = [
  "Commercial Shoot",
  "Social Content",
  "Motion Direction",
  "Event Coverage",
  "Brand Campaign",
  "Other"
];

export type InquiryErrors = Partial<Record<keyof Inquiry, string>>;

export function sanitizeInquiry(values: Inquiry): Inquiry {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    company: values.company.trim(),
    serviceType: values.serviceType,
    brief: values.brief.trim()
  };
}

export function validateInquiry(values: Inquiry): InquiryErrors {
  const errors: InquiryErrors = {};

  if (!values.name) {
    errors.name = "Please enter your name.";
  } else if (values.name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (values.name.length > 80) {
    errors.name = "Name must be 80 characters or fewer.";
  }

  if (!values.email) {
    errors.email = "Please enter an email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  } else if (values.email.length > 160) {
    errors.email = "Email must be 160 characters or fewer.";
  }

  if (values.company.length > 80) {
    errors.company = "Company must be 80 characters or fewer.";
  }

  if (!values.serviceType) {
    errors.serviceType = "Please select a service type.";
  } else if (!inquiryServiceTypes.includes(values.serviceType)) {
    errors.serviceType = "Please select a valid service type.";
  }

  if (!values.brief) {
    errors.brief = "Please add a short project brief.";
  } else if (values.brief.length < 30) {
    errors.brief = "Brief must be at least 30 characters.";
  } else if (values.brief.length > BRIEF_MAX) {
    errors.brief = `Brief must be ${BRIEF_MAX} characters or fewer.`;
  }

  return errors;
}

export function parseInquiryServiceType(value: unknown): Inquiry["serviceType"] {
  if (typeof value !== "string") {
    return "";
  }

  return inquiryServiceTypes.includes(value as InquiryServiceType)
    ? (value as InquiryServiceType)
    : "";
}

export function getInquiryProtectionIssue({
  website,
  startedAt,
  now = Date.now()
}: {
  website?: string;
  startedAt?: number;
  now?: number;
}) {
  if (website?.trim()) {
    return "The inquiry could not be submitted.";
  }

  if (
    typeof startedAt === "number" &&
    Number.isFinite(startedAt) &&
    now - startedAt < INQUIRY_MIN_SUBMIT_MS
  ) {
    return "Please wait a moment and submit the inquiry again.";
  }

  return null;
}
