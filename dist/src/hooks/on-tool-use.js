import { generateToolUseQuestion } from "../core/question-generator.js";
import { formatQuestion } from "../core/question-formatter.js";
import { shouldShowQuestion } from "../core/frequency-controller.js";
import { loadConfig, loadSessionState, saveSessionState, ensureDirs, } from "../core/state-manager.js";
async function main() {
    try {
        // Read hook input from stdin
        const inputData = await readStdin();
        const input = JSON.parse(inputData);
        // PostToolUse must have tool_name
        if (!input.tool_name) {
            process.stdout.write(JSON.stringify({}));
            return;
        }
        await ensureDirs();
        // Load config and session state
        const config = await loadConfig();
        const state = await loadSessionState(input.session_id);
        // Check frequency (tool_use trigger, never trivial since we match specific tools)
        if (!shouldShowQuestion(config.frequency, state, false, "tool_use")) {
            state.tool_use_count++;
            await saveSessionState(input.session_id, state);
            process.stdout.write(JSON.stringify({}));
            return;
        }
        // Generate and format question from the specific tool use
        const question = await generateToolUseQuestion(input.tool_name, input.tool_input ?? {}, input.tool_response, config);
        const formatted = formatQuestion(question);
        const output = {
            systemMessage: formatted,
        };
        // Update state
        state.tool_use_count++;
        state.questions_shown++;
        state.last_question_time = Date.now();
        await saveSessionState(input.session_id, state);
        // Output to stdout
        process.stdout.write(JSON.stringify(output));
    }
    catch (err) {
        // On any error, output empty JSON so we don't break the hook chain
        process.stderr.write(`in-the-loop error: ${err instanceof Error ? err.message : String(err)}\n`);
        process.stdout.write(JSON.stringify({}));
    }
}
function readStdin() {
    return new Promise((resolve, reject) => {
        let data = "";
        process.stdin.setEncoding("utf-8");
        process.stdin.on("data", (chunk) => {
            data += chunk;
        });
        process.stdin.on("end", () => resolve(data));
        process.stdin.on("error", reject);
    });
}
main();
//# sourceMappingURL=on-tool-use.js.map