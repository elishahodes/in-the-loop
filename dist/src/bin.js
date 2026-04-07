#!/usr/bin/env node
import { setup, uninstall } from "./cli/setup.js";
import { configure } from "./cli/config.js";
const command = process.argv[2];
switch (command) {
    case "setup":
        await setup();
        break;
    case "config":
        await configure(process.argv.slice(3));
        break;
    case "uninstall":
        await uninstall();
        break;
    default:
        console.log(`🧠 in-the-loop — Stay engaged while Claude Code works

Usage:
  in-the-loop setup       Install Claude Code hooks (Stop + PostToolUse)
  in-the-loop config      View/set configuration
  in-the-loop uninstall   Remove all hooks

Options for config:
  --frequency <every|often|sometimes|rarely>
  --difficulty <beginner|intermediate|advanced>

Examples:
  in-the-loop setup
  in-the-loop config --frequency every --difficulty advanced
  in-the-loop uninstall`);
        break;
}
//# sourceMappingURL=bin.js.map