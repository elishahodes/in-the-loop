import type { Question } from "../types.js";

const MAX_WIDTH = 49;
const LABEL = ["A", "B", "C", "D"];

/**
 * Format a question for terminal display with Unicode box-drawing characters.
 */
export function formatQuestion(question: Question): string {
  const lines: string[] = [];
  const inner = MAX_WIDTH - 2; // space inside the box (excluding │ and │)

  const top = `┌${"─".repeat(inner)}┐`;
  const bottom = `└${"─".repeat(inner)}┘`;
  const separator = `│  ${"─ ".repeat(Math.floor((inner - 4) / 2))}  │`;

  lines.push(top);
  lines.push(padLine("🧠 In The Loop", inner));
  lines.push(`├${"─".repeat(inner)}┤`);
  lines.push(padLine("", inner));

  // Question text — word wrap
  for (const wl of wordWrap(question.question, inner - 4)) {
    lines.push(padLine(wl, inner));
  }

  lines.push(padLine("", inner));

  // Choices
  for (let i = 0; i < question.choices.length; i++) {
    const isCorrect = i === question.correctIndex;
    const prefix = `${LABEL[i]}) `;
    const suffix = isCorrect ? "  ✓" : "";
    const choiceLines = wordWrap(
      question.choices[i],
      inner - 4 - prefix.length - (isCorrect ? 4 : 0),
    );

    for (let j = 0; j < choiceLines.length; j++) {
      const linePrefix = j === 0 ? prefix : " ".repeat(prefix.length);
      const lineSuffix = j === choiceLines.length - 1 ? suffix : "";
      lines.push(padLine(linePrefix + choiceLines[j] + lineSuffix, inner));
    }
  }

  lines.push(padLine("", inner));
  lines.push(separator);

  // Explanation — word wrap
  for (const wl of wordWrap(question.explanation, inner - 4)) {
    lines.push(padLine(wl, inner));
  }

  lines.push(bottom);

  return lines.join("\n");
}

function padLine(text: string, inner: number): string {
  // Account for emoji taking 2 character widths
  const emojiCount = (text.match(/[\u{1F000}-\u{1FFFF}]|[✓]/gu) ?? []).length;
  const visualLen = text.length + emojiCount;
  const padding = Math.max(0, inner - 2 - visualLen);
  return `│  ${text}${" ".repeat(padding)}│`;
}

function wordWrap(text: string, maxLen: number): string[] {
  if (maxLen <= 0) maxLen = 40;
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= maxLen) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  return lines.length > 0 ? lines : [""];
}
