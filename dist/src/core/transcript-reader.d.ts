import type { ContextSummary } from "../types.js";
/**
 * Read the JSONL transcript and parse the last ~50 lines for efficiency.
 */
export declare function readTranscript(transcriptPath: string): Promise<unknown[]>;
/**
 * Build a concise summary of what Claude just did from transcript entries.
 */
export declare function buildContextSummary(entries: unknown[]): ContextSummary;
