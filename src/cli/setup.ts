import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { ensureDirs, saveConfig } from "../core/state-manager.js";
import { DEFAULT_CONFIG } from "../types.js";

const CLAUDE_SETTINGS_PATH = join(homedir(), ".claude", "settings.json");

const TOOL_USE_MATCHERS = ["Edit", "Write", "Bash"];

interface ClaudeSettings {
  hooks?: Record<string, HookConfig[]>;
  [key: string]: unknown;
}

interface HookConfig {
  matcher?: string;
  command: string;
}

/**
 * Install the in-the-loop hooks into ~/.claude/settings.json
 * and create the ~/.in-the-loop/ directory with default config.
 */
export async function setup(): Promise<void> {
  // 1. Ensure our state directory exists with default config
  await ensureDirs();
  await saveConfig(DEFAULT_CONFIG);
  console.log("✓ Created ~/.in-the-loop/ with default config");

  // 2. Find hook script paths
  const stopHookScript = getHookScriptPath("on-stop.js");
  const toolUseHookScript = getHookScriptPath("on-tool-use.js");

  // 3. Read existing Claude settings
  let settings: ClaudeSettings;
  try {
    const content = await readFile(CLAUDE_SETTINGS_PATH, "utf-8");
    settings = JSON.parse(content);
  } catch {
    settings = {};
  }

  if (!settings.hooks) {
    settings.hooks = {};
  }

  // 4. Add Stop hook if not already present
  if (!settings.hooks["Stop"]) {
    settings.hooks["Stop"] = [];
  }

  const stopCommand = `node ${stopHookScript}`;
  const stopInstalled = settings.hooks["Stop"].some(
    (h) => h.command === stopCommand,
  );

  if (stopInstalled) {
    console.log("✓ Stop hook already installed");
  } else {
    settings.hooks["Stop"].push({ command: stopCommand });
    console.log("✓ Installed Stop hook");
  }

  // 5. Add PostToolUse hooks with matchers
  if (!settings.hooks["PostToolUse"]) {
    settings.hooks["PostToolUse"] = [];
  }

  const toolUseCommand = `node ${toolUseHookScript}`;
  let toolUseAdded = 0;

  for (const matcher of TOOL_USE_MATCHERS) {
    const alreadyInstalled = settings.hooks["PostToolUse"].some(
      (h) => h.command === toolUseCommand && h.matcher === matcher,
    );

    if (!alreadyInstalled) {
      settings.hooks["PostToolUse"].push({ matcher, command: toolUseCommand });
      toolUseAdded++;
    }
  }

  if (toolUseAdded > 0) {
    console.log(`✓ Installed PostToolUse hooks for: ${TOOL_USE_MATCHERS.join(", ")}`);
  } else {
    console.log("✓ PostToolUse hooks already installed");
  }

  // 6. Write settings
  await writeFile(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n");

  console.log("\n🧠 in-the-loop is ready! Start a Claude Code session to see quiz questions.");
  console.log("   Questions appear when Claude stops AND while it works (after edits, writes, commands).");
  console.log("   Configure with: in-the-loop config --frequency <every|often|sometimes|rarely>");
}

/**
 * Remove the in-the-loop hooks from ~/.claude/settings.json
 */
export async function uninstall(): Promise<void> {
  const stopCommand = `node ${getHookScriptPath("on-stop.js")}`;
  const toolUseCommand = `node ${getHookScriptPath("on-tool-use.js")}`;

  try {
    const content = await readFile(CLAUDE_SETTINGS_PATH, "utf-8");
    const settings: ClaudeSettings = JSON.parse(content);

    if (settings.hooks?.["Stop"]) {
      settings.hooks["Stop"] = settings.hooks["Stop"].filter(
        (h) => h.command !== stopCommand,
      );
      if (settings.hooks["Stop"].length === 0) {
        delete settings.hooks["Stop"];
      }
    }

    if (settings.hooks?.["PostToolUse"]) {
      settings.hooks["PostToolUse"] = settings.hooks["PostToolUse"].filter(
        (h) => h.command !== toolUseCommand,
      );
      if (settings.hooks["PostToolUse"].length === 0) {
        delete settings.hooks["PostToolUse"];
      }
    }

    if (Object.keys(settings.hooks ?? {}).length === 0) {
      delete settings.hooks;
    }

    await writeFile(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n");

    console.log("✓ Removed in-the-loop hooks from ~/.claude/settings.json");
  } catch {
    console.log("No Claude settings found — nothing to uninstall.");
  }
}

function getProjectRoot(): string {
  // This file compiles to dist/src/cli/setup.js
  // Go up 3 levels (cli -> src -> dist) to reach the project root
  return new URL("../../../", import.meta.url).pathname;
}

function getHookScriptPath(filename: string): string {
  return join(getProjectRoot(), "dist", "src", "hooks", filename);
}
