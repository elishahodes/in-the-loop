import { readFile } from "node:fs/promises";
/**
 * Read the JSONL transcript and parse the last ~50 lines for efficiency.
 */
export async function readTranscript(transcriptPath) {
    const content = await readFile(transcriptPath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);
    // Only parse last 50 lines for performance
    const recentLines = lines.slice(-50);
    const entries = [];
    for (const line of recentLines) {
        try {
            entries.push(JSON.parse(line));
        }
        catch {
            // Skip malformed lines
        }
    }
    return entries;
}
/**
 * Build a concise summary of what Claude just did from transcript entries.
 */
export function buildContextSummary(entries) {
    const tools_used = new Set();
    const files_touched = new Set();
    const commands_run = [];
    const descriptions = [];
    for (const entry of entries) {
        if (!entry || typeof entry !== "object")
            continue;
        const e = entry;
        // Extract tool usage
        if (e.type === "tool_use" || e.tool_name) {
            const toolName = e.tool_name || e.name || "";
            if (toolName)
                tools_used.add(toolName);
            const input = e.tool_input ??
                e.input;
            if (input) {
                // Extract file paths from common tool input fields
                for (const key of ["file_path", "path", "filePath"]) {
                    if (typeof input[key] === "string") {
                        files_touched.add(input[key]);
                    }
                }
                // Extract commands
                if (typeof input["command"] === "string") {
                    commands_run.push(input["command"]);
                }
            }
        }
        // Extract assistant text for description
        if (e.role === "assistant" && typeof e.content === "string") {
            descriptions.push(e.content);
        }
        // Handle content array format
        if (e.role === "assistant" && Array.isArray(e.content)) {
            for (const block of e.content) {
                if (block &&
                    typeof block === "object" &&
                    block.type === "text") {
                    descriptions.push(block.text);
                }
            }
        }
    }
    // Take last description as the summary
    const lastDescription = descriptions[descriptions.length - 1] ?? "";
    const description = lastDescription.length > 500
        ? lastDescription.slice(0, 500) + "..."
        : lastDescription;
    // Consider trivial if very little happened
    const is_trivial = tools_used.size === 0 && commands_run.length === 0 && description.length < 50;
    return {
        tools_used: [...tools_used],
        files_touched: [...files_touched],
        commands_run,
        description,
        is_trivial,
    };
}
//# sourceMappingURL=transcript-reader.js.map