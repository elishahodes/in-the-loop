import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { writeFile, unlink, mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readTranscript, buildContextSummary } from "../src/core/transcript-reader.js";

describe("readTranscript", () => {
  it("parses JSONL transcript", async () => {
    const dir = await mkdtemp(join(tmpdir(), "itl-test-"));
    const path = join(dir, "test.jsonl");
    await writeFile(
      path,
      ['{"role":"assistant","content":"hello"}', '{"role":"user","content":"hi"}'].join(
        "\n",
      ),
    );

    const entries = await readTranscript(path);
    assert.equal(entries.length, 2);

    await unlink(path);
  });

  it("skips malformed lines", async () => {
    const dir = await mkdtemp(join(tmpdir(), "itl-test-"));
    const path = join(dir, "test.jsonl");
    await writeFile(path, '{"valid":true}\nnot json\n{"also":"valid"}');

    const entries = await readTranscript(path);
    assert.equal(entries.length, 2);

    await unlink(path);
  });
});

describe("buildContextSummary", () => {
  it("extracts tools and files from entries", () => {
    const entries = [
      {
        type: "tool_use",
        tool_name: "Write",
        tool_input: { file_path: "/tmp/test.ts" },
      },
      {
        type: "tool_use",
        tool_name: "Bash",
        tool_input: { command: "npm test" },
      },
      {
        role: "assistant",
        content: "I created a test file and ran the tests.",
      },
    ];

    const summary = buildContextSummary(entries);
    assert.ok(summary.tools_used.includes("Write"));
    assert.ok(summary.tools_used.includes("Bash"));
    assert.ok(summary.files_touched.includes("/tmp/test.ts"));
    assert.ok(summary.commands_run.includes("npm test"));
    assert.equal(summary.is_trivial, false);
  });

  it("marks empty responses as trivial", () => {
    const summary = buildContextSummary([]);
    assert.equal(summary.is_trivial, true);
  });

  it("handles content array format", () => {
    const entries = [
      {
        role: "assistant",
        content: [{ type: "text", text: "I did something complex." }],
      },
    ];

    const summary = buildContextSummary(entries);
    assert.ok(summary.description.includes("complex"));
  });
});
