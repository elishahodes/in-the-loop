import type { ContextSummary, Question, UserConfig } from "../types.js";
/**
 * Generate a quiz question by calling `claude -p --model haiku`.
 * Times out after 15s and returns a fallback tip on failure.
 */
export declare function generateQuestion(context: ContextSummary, config: UserConfig): Promise<Question>;
/**
 * Generate a quiz question for a specific tool use by calling `claude -p --model haiku`.
 * Uses a shorter timeout (12s) since this runs mid-task.
 */
export declare function generateToolUseQuestion(toolName: string, toolInput: Record<string, unknown>, toolResponse: string | undefined, config: UserConfig): Promise<Question>;
export declare function buildToolUsePrompt(toolName: string, toolInput: Record<string, unknown>, toolResponse?: string): string;
