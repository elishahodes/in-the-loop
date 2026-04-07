const STOP_INTERVALS = {
    every: 1,
    often: 2,
    sometimes: 3,
    rarely: 5,
};
const TOOL_USE_INTERVALS = {
    every: 5,
    often: 8,
    sometimes: 12,
    rarely: 20,
};
/**
 * Determine whether to show a question based on frequency settings and session state.
 */
export function shouldShowQuestion(frequency, state, isTrivial, trigger = "stop") {
    const isStop = trigger === "stop";
    const count = isStop ? state.stop_count : state.tool_use_count;
    // Always show on first stop of a session (but not first tool use)
    if (isStop && count === 0) {
        return true;
    }
    // Skip trivial responses
    if (isTrivial) {
        return false;
    }
    const intervals = isStop ? STOP_INTERVALS : TOOL_USE_INTERVALS;
    const interval = intervals[frequency];
    const number = count + 1;
    return number % interval === 0;
}
//# sourceMappingURL=frequency-controller.js.map