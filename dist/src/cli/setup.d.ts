/**
 * Install the in-the-loop hooks into ~/.claude/settings.json
 * and create the ~/.in-the-loop/ directory with default config.
 */
export declare function setup(): Promise<void>;
/**
 * Remove the in-the-loop hooks from ~/.claude/settings.json
 */
export declare function uninstall(): Promise<void>;
