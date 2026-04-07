import type { SessionState, UserConfig } from "../types.js";
export declare function getBaseDir(): string;
export declare function getConfigPath(): string;
/**
 * Ensure the ~/.in-the-loop/ directory structure exists.
 */
export declare function ensureDirs(): Promise<void>;
/**
 * Load user config from ~/.in-the-loop/config.json.
 * Returns defaults if file doesn't exist.
 */
export declare function loadConfig(): Promise<UserConfig>;
/**
 * Save user config to ~/.in-the-loop/config.json.
 */
export declare function saveConfig(config: UserConfig): Promise<void>;
/**
 * Load session state for a given session ID.
 */
export declare function loadSessionState(sessionId: string): Promise<SessionState>;
/**
 * Save session state for a given session ID.
 */
export declare function saveSessionState(sessionId: string, state: SessionState): Promise<void>;
