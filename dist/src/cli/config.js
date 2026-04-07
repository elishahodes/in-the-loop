import { loadConfig, saveConfig } from "../core/state-manager.js";
const VALID_FREQUENCIES = ["every", "often", "sometimes", "rarely"];
const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"];
/**
 * Configure in-the-loop settings.
 */
export async function configure(args) {
    const config = await loadConfig();
    let changed = false;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--frequency" && args[i + 1]) {
            const value = args[i + 1];
            if (!VALID_FREQUENCIES.includes(value)) {
                console.error(`Invalid frequency: ${value}. Must be one of: ${VALID_FREQUENCIES.join(", ")}`);
                process.exit(1);
            }
            config.frequency = value;
            changed = true;
            i++;
        }
        else if (args[i] === "--difficulty" && args[i + 1]) {
            const value = args[i + 1];
            if (!VALID_DIFFICULTIES.includes(value)) {
                console.error(`Invalid difficulty: ${value}. Must be one of: ${VALID_DIFFICULTIES.join(", ")}`);
                process.exit(1);
            }
            config.difficulty = value;
            changed = true;
            i++;
        }
    }
    if (changed) {
        await saveConfig(config);
        console.log("✓ Configuration updated:");
    }
    else {
        console.log("Current configuration:");
    }
    console.log(`  frequency:  ${config.frequency}`);
    console.log(`  difficulty: ${config.difficulty}`);
}
//# sourceMappingURL=config.js.map