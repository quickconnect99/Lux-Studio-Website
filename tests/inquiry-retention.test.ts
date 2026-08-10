import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_INQUIRY_RETENTION_DAYS,
  getInquiryRetentionDays
} from "../lib/inquiry-retention";

test("uses a bounded and configurable inquiry retention period", () => {
  assert.equal(getInquiryRetentionDays("90"), 90);
  assert.equal(getInquiryRetentionDays("29"), DEFAULT_INQUIRY_RETENTION_DAYS);
  assert.equal(getInquiryRetentionDays("3651"), DEFAULT_INQUIRY_RETENTION_DAYS);
  assert.equal(getInquiryRetentionDays("90.5"), DEFAULT_INQUIRY_RETENTION_DAYS);
});
