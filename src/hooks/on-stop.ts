import type { HookInput, HookOutput } from "../types.js";
import { readTranscript, buildContextSummary } from "../core/transcript-reader.js";
import { generateQuestion } from "../core/question-generator.js";
import { formatQuestion } from "../core/question-formatter.js";
import { shouldShowQuestion } from "../core/frequency-controller.js";
import {
  loadConfig,
  loadSessionState,
  saveSessionState,
  ensureDirs,
} from "../core/state-manager.js";

async function main(): Promise<void> {
  try {
    // Read hook input from stdin
    const inputData = await readStdin();
    const input: HookInput = JSON.parse(inputData);

    await ensureDirs();

    // Load config and session state
    const config = await loadConfig();
    const state = await loadSessionState(input.session_id);

    // Read transcript and build context
    const entries = await readTranscript(input.transcript_path);
    const context = buildContextSummary(entries);

    // Check frequency
    if (!shouldShowQuestion(config.frequency, state, context.is_trivial)) {
      state.stop_count++;
      await saveSessionState(input.session_id, state);
      // Output empty JSON so hook doesn't error
      process.stdout.write(JSON.stringify({}));
      return;
    }

    // Generate and format question
    const question = await generateQuestion(context, config);
    const formatted = formatQuestion(question);

    const output: HookOutput = {
      systemMessage: formatted,
    };

    // Update state
    state.stop_count++;
    state.questions_shown++;
    state.last_question_time = Date.now();
    await saveSessionState(input.session_id, state);

    // Output to stdout
    process.stdout.write(JSON.stringify(output));
  } catch (err) {
    // On any error, output empty JSON so we don't break the hook chain
    process.stderr.write(
      `in-the-loop error: ${err instanceof Error ? err.message : String(err)}\n`,
    );
    process.stdout.write(JSON.stringify({}));
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk: string) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

main();
