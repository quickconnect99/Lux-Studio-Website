import assert from "node:assert/strict";
import test from "node:test";
import {
  getProjectPrimaryMetaLabel,
  normalizeProjectBusiness,
  parseProjectBusinessParam,
  projectBusinessToParam
} from "../lib/project-business";

test("normalizes legacy and missing project business values", () => {
  assert.equal(normalizeProjectBusiness(), "Automotive");
  assert.equal(normalizeProjectBusiness("  Car  "), "Automotive");
  assert.equal(normalizeProjectBusiness(" Hospitality "), "Hospitality");
});

test("parses project business params without throwing on malformed input", () => {
  assert.equal(parseProjectBusinessParam("hospitality"), "hospitality");
  assert.equal(
    parseProjectBusinessParam(["brand%20work", "ignored"]),
    "brand work"
  );
  assert.equal(parseProjectBusinessParam("%E0%A4%A"), null);
  assert.equal(parseProjectBusinessParam(""), null);
});

test("serializes business filters and keeps the shared metadata label", () => {
  assert.equal(projectBusinessToParam("Brand Work"), "brand%20work");
  assert.equal(getProjectPrimaryMetaLabel("Hospitality"), "Primary Subject");
});
