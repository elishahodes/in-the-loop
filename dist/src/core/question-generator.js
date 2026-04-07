import { spawn } from "node:child_process";
import { getSystemPrompt } from "../prompts/question-system-prompt.js";
/**
 * Generate a quiz question by calling `claude -p --model haiku`.
 * Times out after 15s and returns a fallback tip on failure.
 */
export async function generateQuestion(context, config) {
    const systemPrompt = getSystemPrompt(config.difficulty);
    const userPrompt = buildUserPrompt(context);
    try {
        const response = await callClaude(systemPrompt, userPrompt, 15_000);
        const parsed = JSON.parse(response);
        return validateQuestion(parsed);
    }
    catch {
        return getFallbackQuestion(context);
    }
}
function buildUserPrompt(context) {
    const parts = ["Here's what the coding assistant just did:"];
    if (context.description) {
        parts.push(`\nSummary: ${context.description}`);
    }
    if (context.tools_used.length > 0) {
        parts.push(`\nTools used: ${context.tools_used.join(", ")}`);
    }
    if (context.files_touched.length > 0) {
        parts.push(`\nFiles touched: ${context.files_touched.join(", ")}`);
    }
    if (context.commands_run.length > 0) {
        // Only show last 5 commands, truncated
        const cmds = context.commands_run.slice(-5).map((c) => c.length > 100 ? c.slice(0, 100) + "..." : c);
        parts.push(`\nCommands run: ${cmds.join("; ")}`);
    }
    parts.push("\nGenerate a quiz question about the concepts behind this work.");
    return parts.join("");
}
function callClaude(systemPrompt, userPrompt, timeoutMs) {
    return new Promise((resolve, reject) => {
        const proc = spawn("claude", ["-p", "--model", "haiku", "--system", systemPrompt], {
            stdio: ["pipe", "pipe", "pipe"],
        });
        let stdout = "";
        let stderr = "";
        proc.stdout.on("data", (data) => {
            stdout += data.toString();
        });
        proc.stderr.on("data", (data) => {
            stderr += data.toString();
        });
        const timer = setTimeout(() => {
            proc.kill("SIGTERM");
            reject(new Error("claude command timed out"));
        }, timeoutMs);
        proc.on("close", (code) => {
            clearTimeout(timer);
            if (code === 0 && stdout.trim()) {
                resolve(stdout.trim());
            }
            else {
                reject(new Error(`claude exited with code ${code}: ${stderr}`));
            }
        });
        proc.on("error", (err) => {
            clearTimeout(timer);
            reject(err);
        });
        proc.stdin.write(userPrompt);
        proc.stdin.end();
    });
}
function validateQuestion(data) {
    const q = data;
    if (typeof q.question !== "string" ||
        !Array.isArray(q.choices) ||
        q.choices.length !== 4 ||
        typeof q.correctIndex !== "number" ||
        typeof q.explanation !== "string") {
        throw new Error("Invalid question format");
    }
    if (q.correctIndex < 0 || q.correctIndex > 3) {
        throw new Error("correctIndex out of range");
    }
    return {
        question: q.question,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
    };
}
/**
 * Generate a quiz question for a specific tool use by calling `claude -p --model haiku`.
 * Uses a shorter timeout (12s) since this runs mid-task.
 */
export async function generateToolUseQuestion(toolName, toolInput, toolResponse, config) {
    const systemPrompt = getSystemPrompt(config.difficulty, "tool_use");
    const userPrompt = buildToolUsePrompt(toolName, toolInput, toolResponse);
    try {
        const response = await callClaude(systemPrompt, userPrompt, 12_000);
        const parsed = JSON.parse(response);
        return validateQuestion(parsed);
    }
    catch {
        return getToolUseFallbackQuestion(toolName);
    }
}
export function buildToolUsePrompt(toolName, toolInput, toolResponse) {
    const parts = ["The coding assistant just performed this action:"];
    switch (toolName) {
        case "Bash": {
            const command = typeof toolInput.command === "string" ? toolInput.command : "";
            const truncatedCmd = command.length > 200 ? command.slice(0, 200) + "..." : command;
            parts.push(`\nTool: Bash (ran a shell command)`);
            parts.push(`\nCommand: ${truncatedCmd}`);
            if (toolResponse) {
                const truncatedResponse = toolResponse.length > 300 ? toolResponse.slice(0, 300) + "..." : toolResponse;
                parts.push(`\nOutput: ${truncatedResponse}`);
            }
            break;
        }
        case "Edit": {
            const filePath = typeof toolInput.file_path === "string" ? toolInput.file_path : "unknown file";
            const oldStr = typeof toolInput.old_string === "string" ? toolInput.old_string : "";
            const newStr = typeof toolInput.new_string === "string" ? toolInput.new_string : "";
            parts.push(`\nTool: Edit (modified a file)`);
            parts.push(`\nFile: ${filePath}`);
            if (oldStr) {
                const truncatedOld = oldStr.length > 150 ? oldStr.slice(0, 150) + "..." : oldStr;
                const truncatedNew = newStr.length > 150 ? newStr.slice(0, 150) + "..." : newStr;
                parts.push(`\nChanged: "${truncatedOld}" → "${truncatedNew}"`);
            }
            break;
        }
        case "Write": {
            const filePath = typeof toolInput.file_path === "string" ? toolInput.file_path : "unknown file";
            parts.push(`\nTool: Write (created/overwrote a file)`);
            parts.push(`\nFile: ${filePath}`);
            break;
        }
        default: {
            parts.push(`\nTool: ${toolName}`);
            const inputStr = JSON.stringify(toolInput);
            const truncatedInput = inputStr.length > 300 ? inputStr.slice(0, 300) + "..." : inputStr;
            parts.push(`\nInput: ${truncatedInput}`);
            break;
        }
    }
    parts.push("\nGenerate a quick quiz question about the concepts behind this action.");
    return parts.join("");
}
function getToolUseFallbackQuestion(toolName) {
    switch (toolName) {
        case "Bash":
            return {
                question: "Why is it important to review shell commands before running them?",
                choices: [
                    "Shell commands are always dangerous",
                    "They can have unintended side effects on your system",
                    "They run slower than other tools",
                    "Shell commands can't be undone",
                ],
                correctIndex: 1,
                explanation: "Shell commands can modify files, install packages, or change system state in ways that may be hard to reverse.",
            };
        case "Edit":
            return {
                question: "What's a key benefit of editing files with targeted replacements?",
                choices: [
                    "It's faster than rewriting the whole file",
                    "It preserves the rest of the file unchanged",
                    "It creates automatic backups",
                    "It validates syntax automatically",
                ],
                correctIndex: 1,
                explanation: "Targeted edits minimize risk by only changing what's needed, leaving the rest of the file intact.",
            };
        default:
            return {
                question: "Why should you understand each change an AI assistant makes?",
                choices: [
                    "AI-generated code is always wrong",
                    "To impress your team in code review",
                    "You'll maintain and debug this code later",
                    "It's not important if tests pass",
                ],
                correctIndex: 2,
                explanation: "You own the code once it's in your project. Understanding it is key for maintenance and debugging.",
            };
    }
}
function getFallbackQuestion(context) {
    if (context.files_touched.length > 0) {
        return {
            question: "What's a good practice when modifying multiple files in a single change?",
            choices: [
                "Change as many files as possible at once",
                "Ensure changes are atomic and related",
                "Always modify tests last",
                "Avoid touching configuration files",
            ],
            correctIndex: 1,
            explanation: "Atomic, related changes are easier to review, test, and revert if something goes wrong.",
        };
    }
    return {
        question: "Why is it valuable to understand the code an AI assistant writes for you?",
        choices: [
            "To impress your coworkers",
            "AI-generated code is always buggy",
            "You'll need to maintain, debug, and extend it",
            "It's not valuable — just trust the AI",
        ],
        correctIndex: 2,
        explanation: "You own the code once it's in your project. Understanding it is essential for maintenance and debugging.",
    };
}
//# sourceMappingURL=question-generator.js.map