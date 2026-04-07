/** Base hook input from Claude Code stdin */
export interface HookInput {
    session_id: string;
    transcript_path: string;
    cwd: string;
    hook_event_name: string;
    tool_name?: string;
    tool_input?: Record<string, unknown>;
    tool_response?: string;
}
/** Hook output to Claude Code stdout */
export interface HookOutput {
    systemMessage?: string;
    decision?: "block" | "approve";
}
/** A generated quiz question */
export interface Question {
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
}
/** User configuration stored in ~/.in-the-loop/config.json */
export interface UserConfig {
    frequency: Frequency;
    difficulty: Difficulty;
}
export type Frequency = "every" | "often" | "sometimes" | "rarely";
export type Difficulty = "beginner" | "intermediate" | "advanced";
/** Per-session state stored in ~/.in-the-loop/sessions/{session_id}.json */
export interface SessionState {
    stop_count: number;
    tool_use_count: number;
    questions_shown: number;
    last_question_time: number;
}
export type HookTrigger = "stop" | "tool_use";
/** A parsed transcript entry */
export interface TranscriptEntry {
    role: string;
    type?: string;
    content?: string;
    tool_name?: string;
    tool_input?: Record<string, unknown>;
    tool_result?: string;
}
/** Summary of what Claude just did */
export interface ContextSummary {
    tools_used: string[];
    files_touched: string[];
    commands_run: string[];
    description: string;
    is_trivial: boolean;
}
export declare const DEFAULT_CONFIG: UserConfig;
