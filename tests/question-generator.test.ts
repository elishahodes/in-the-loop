import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildToolUsePrompt } from "../src/core/question-generator.js";

describe("buildToolUsePrompt", () => {
  it("includes command for Bash tool", () => {
    const prompt = buildToolUsePrompt(
      "Bash",
      { command: "npm test" },
      "all tests passed",
    );
    assert.ok(prompt.includes("Bash"));
    assert.ok(prompt.includes("npm test"));
    assert.ok(prompt.includes("all tests passed"));
  });

  it("truncates long Bash commands", () => {
    const longCommand = "x".repeat(300);
    const prompt = buildToolUsePrompt("Bash", { command: longCommand });
    assert.ok(prompt.includes("..."));
    assert.ok(!prompt.includes(longCommand));
  });

  it("includes file path for Edit tool", () => {
    const prompt = buildToolUsePrompt("Edit", {
      file_path: "/src/index.ts",
      old_string: "const x = 1",
      new_string: "const x = 2",
    });
    assert.ok(prompt.includes("Edit"));
    assert.ok(prompt.includes("/src/index.ts"));
    assert.ok(prompt.includes("const x = 1"));
    assert.ok(prompt.includes("const x = 2"));
  });

  it("includes file path for Write tool", () => {
    const prompt = buildToolUsePrompt("Write", {
      file_path: "/src/new-file.ts",
    });
    assert.ok(prompt.includes("Write"));
    assert.ok(prompt.includes("/src/new-file.ts"));
  });

  it("handles unknown tools with JSON input", () => {
    const prompt = buildToolUsePrompt("CustomTool", { key: "value" });
    assert.ok(prompt.includes("CustomTool"));
    assert.ok(prompt.includes("value"));
  });

  it("handles missing tool_input fields gracefully", () => {
    const prompt = buildToolUsePrompt("Bash", {});
    assert.ok(prompt.includes("Bash"));
  });

  it("truncates long tool responses", () => {
    const longResponse = "y".repeat(500);
    const prompt = buildToolUsePrompt("Bash", { command: "echo hi" }, longResponse);
    assert.ok(prompt.includes("..."));
    assert.ok(!prompt.includes(longResponse));
  });
});
