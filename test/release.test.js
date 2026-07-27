import assert from "node:assert/strict";
import test from "node:test";
import { formatReleaseLabel } from "../src/release.js";

test("formats beta and stable release labels", () => {
  assert.equal(formatReleaseLabel("0.510.0-beta.2"), ".510 BETA");
  assert.equal(formatReleaseLabel("1.2.3"), "v1.2.3");
  assert.equal(formatReleaseLabel("development"), "Development build");
});
