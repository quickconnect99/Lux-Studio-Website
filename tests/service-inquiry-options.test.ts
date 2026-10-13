import assert from "node:assert/strict";
import test from "node:test";
import { getRelatedProjectCategory } from "../components/sections/service-inquiry-options";
import type { Project, Service } from "../lib/types";

const service = (number: string): Service => ({
  number,
  title: "Service",
  description: "",
  deliverables: []
});
const projects = [
  "Brand Film",
  "Social Content",
  "Event Coverage",
  "Launch Campaign"
].map((category) => ({ category }) as Project);

test("service links select portfolio categories rather than inquiry labels", () => {
  assert.equal(
    getRelatedProjectCategory(service("01"), projects),
    "Brand Film"
  );
  assert.equal(
    getRelatedProjectCategory(service("02"), projects),
    "Social Content"
  );
  assert.equal(
    getRelatedProjectCategory(service("03"), projects),
    "Event Coverage"
  );
  assert.equal(
    getRelatedProjectCategory(service("04"), projects),
    "Launch Campaign"
  );
});

test("services without matching published work use the portfolio fallback", () => {
  assert.equal(getRelatedProjectCategory(service("01"), []), null);
  assert.equal(getRelatedProjectCategory(service("05"), projects), null);
});
