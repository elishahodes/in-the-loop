import type { Frequency, HookTrigger, SessionState } from "../types.js";
/**
 * Determine whether to show a question based on frequency settings and session state.
 */
export declare function shouldShowQuestion(frequency: Frequency, state: SessionState, isTrivial: boolean, trigger?: HookTrigger): boolean;
