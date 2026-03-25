import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import type { SessionState, UserConfig } from "../types.js";
import { DEFAULT_CONFIG } from "../types.js";

const BASE_DIR = join(homedir(), ".in-the-loop");
const SESSIONS_DIR = join(BASE_DIR, "sessions");
const CONFIG_PATH = join(BASE_DIR, "config.json");

export function getBaseDir(): string {
  return BASE_DIR;
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}

/**
 * Ensure the ~/.in-the-loop/ directory structure exists.
 */
export async function ensureDirs(): Promise<void> {
  await mkdir(SESSIONS_DIR, { recursive: true });
}

/**
 * Load user config from ~/.in-the-loop/config.json.
 * Returns defaults if file doesn't exist.
 */
export async function loadConfig(): Promise<UserConfig> {
  try {
    const content = await readFile(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(content);
    return {
      frequency: parsed.frequency ?? DEFAULT_CONFIG.frequency,
      difficulty: parsed.difficulty ?? DEFAULT_CONFIG.difficulty,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Save user config to ~/.in-the-loop/config.json.
 */
export async function saveConfig(config: UserConfig): Promise<void> {
  await ensureDirs();
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

/**
 * Load session state for a given session ID.
 */
export async function loadSessionState(
  sessionId: string,
): Promise<SessionState> {
  const path = join(SESSIONS_DIR, `${sessionId}.json`);
  try {
    const content = await readFile(path, "utf-8");
    const parsed = JSON.parse(content);
    return {
      stop_count: parsed.stop_count ?? 0,
      tool_use_count: parsed.tool_use_count ?? 0,
      questions_shown: parsed.questions_shown ?? 0,
      last_question_time: parsed.last_question_time ?? 0,
    };
  } catch {
    return {
      stop_count: 0,
      tool_use_count: 0,
      questions_shown: 0,
      last_question_time: 0,
    };
  }
}

/**
 * Save session state for a given session ID.
 */
export async function saveSessionState(
  sessionId: string,
  state: SessionState,
): Promise<void> {
  await ensureDirs();
  const path = join(SESSIONS_DIR, `${sessionId}.json`);
  await writeFile(path, JSON.stringify(state, null, 2) + "\n");
}
