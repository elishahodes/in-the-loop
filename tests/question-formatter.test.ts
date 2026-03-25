import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatQuestion } from "../src/core/question-formatter.js";
import type { Question } from "../src/types.js";

describe("formatQuestion", () => {
  const sampleQuestion: Question = {
    question: "Why should JWT tokens have an expiration time?",
    choices: [
      "Performance optimization",
      "Reduces database load",
      "Limits the window of compromise if a token is stolen",
      "Required by the JWT specification",
    ],
    correctIndex: 2,
    explanation:
      "If a token is stolen, expiration ensures it can only be used for a limited time.",
  };

  it("produces a string with box-drawing characters", () => {
    const result = formatQuestion(sampleQuestion);
    assert.ok(result.includes("┌"));
    assert.ok(result.includes("┘"));
    assert.ok(result.includes("│"));
  });

  it("includes the question text", () => {
    const result = formatQuestion(sampleQuestion);
    assert.ok(result.includes("JWT tokens"));
  });

  it("marks the correct answer with a checkmark", () => {
    const result = formatQuestion(sampleQuestion);
    assert.ok(result.includes("✓"));
    // The checkmark should be on the line with choice C
    const lines = result.split("\n");
    const checkLine = lines.find((l) => l.includes("✓"));
    assert.ok(checkLine?.includes("token is stolen") || checkLine?.includes("compromise"));
  });

  it("includes the explanation", () => {
    const result = formatQuestion(sampleQuestion);
    assert.ok(result.includes("expiration ensures"));
  });

  it("includes the header", () => {
    const result = formatQuestion(sampleQuestion);
    assert.ok(result.includes("In The Loop"));
  });

  it("has all four choices labeled A-D", () => {
    const result = formatQuestion(sampleQuestion);
    assert.ok(result.includes("A)"));
    assert.ok(result.includes("B)"));
    assert.ok(result.includes("C)"));
    assert.ok(result.includes("D)"));
  });
});
