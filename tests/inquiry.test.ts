import assert from "node:assert/strict";
import test from "node:test";
import {
  BRIEF_MAX,
  INQUIRY_MIN_SUBMIT_MS,
  getInquiryProtectionIssue,
  parseInquiryServiceType,
  sanitizeInquiry,
  validateInquiry
} from "../lib/inquiry";
import type { Inquiry } from "../lib/types";

const validInquiry: Inquiry = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Studio",
  serviceType: "Brand Campaign",
  brief: "We need a complete campaign with film and still photography."
};

test("sanitizes inquiry text without changing the selected service", () => {
  assert.deepEqual(
    sanitizeInquiry({
      ...validInquiry,
      name: "  Ada Lovelace ",
      email: " ada@example.com ",
      company: " Analytical Studio ",
      brief: "  A sufficiently detailed project brief for the campaign. "
    }),
    {
      ...validInquiry,
      brief: "A sufficiently detailed project brief for the campaign."
    }
  );
});

test("accepts a complete inquiry and validates every bounded field", () => {
  assert.deepEqual(validateInquiry(validInquiry), {});

  assert.deepEqual(
    validateInquiry({
      name: "A",
      email: "invalid",
      company: "x".repeat(81),
      serviceType: "Unknown" as Inquiry["serviceType"],
      brief: "short"
    }),
    {
      name: "Name must be at least 2 characters.",
      email: "Enter a valid email address.",
      company: "Company must be 80 characters or fewer.",
      serviceType: "Please select a valid service type.",
      brief: "Brief must be at least 30 characters."
    }
  );

  assert.deepEqual(
    validateInquiry({
      name: "x".repeat(81),
      email: `${"x".repeat(150)}@example.com`,
      company: "",
      serviceType: "",
      brief: "x".repeat(BRIEF_MAX + 1)
    }),
    {
      name: "Name must be 80 characters or fewer.",
      email: "Email must be 160 characters or fewer.",
      serviceType: "Please select a service type.",
      brief: `Brief must be ${BRIEF_MAX} characters or fewer.`
    }
  );
});

test("reports required inquiry fields", () => {
  assert.deepEqual(
    validateInquiry({
      name: "",
      email: "",
      company: "",
      serviceType: "",
      brief: ""
    }),
    {
      name: "Please enter your name.",
      email: "Please enter an email address.",
      serviceType: "Please select a service type.",
      brief: "Please add a short project brief."
    }
  );
});

test("narrows service values to the public allowlist", () => {
  assert.equal(parseInquiryServiceType("Commercial Shoot"), "Commercial Shoot");
  assert.equal(parseInquiryServiceType("Unknown"), "");
  assert.equal(parseInquiryServiceType(null), "");
});

test("rejects honeypot and implausibly fast submissions", () => {
  const now = 20_000;

  assert.equal(
    getInquiryProtectionIssue({ website: "bot.example", now }),
    "The inquiry could not be submitted."
  );
  assert.equal(
    getInquiryProtectionIssue({
      startedAt: now - INQUIRY_MIN_SUBMIT_MS + 1,
      now
    }),
    "Please wait a moment and submit the inquiry again."
  );
  assert.equal(
    getInquiryProtectionIssue({
      startedAt: now - INQUIRY_MIN_SUBMIT_MS,
      now
    }),
    null
  );
  assert.equal(getInquiryProtectionIssue({ now }), null);
});
