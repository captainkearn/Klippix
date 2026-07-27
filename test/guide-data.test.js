import assert from "node:assert/strict";
import test from "node:test";
import { guideSteps, initialFiles } from "../src/data.js";

test("guide steps have stable identifiers and supported workspaces", () => {
  const ids = new Set();

  for (const step of guideSteps) {
    assert.match(step.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(ids.has(step.id), false, `duplicate step id: ${step.id}`);
    assert.ok(["terminal", "files"].includes(step.workspace));
    assert.ok(step.title);
    assert.ok(step.description);
    assert.ok(step.path);
    assert.ok(step.command);
    ids.add(step.id);
  }
});

test("preview files have unique names and valid types", () => {
  const names = new Set();

  for (const file of initialFiles) {
    assert.equal(names.has(file.name), false, `duplicate file name: ${file.name}`);
    assert.ok(["file", "folder"].includes(file.type));
    if (file.type === "file") assert.equal(typeof file.content, "string");
    names.add(file.name);
  }
});
