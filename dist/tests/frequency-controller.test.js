import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldShowQuestion } from "../src/core/frequency-controller.js";
function makeState(stop_count, tool_use_count = 0) {
    return { stop_count, tool_use_count, questions_shown: 0, last_question_time: 0 };
}
describe("shouldShowQuestion (stop trigger)", () => {
    it("always shows on first stop", () => {
        assert.equal(shouldShowQuestion("rarely", makeState(0), false), true);
    });
    it("skips trivial responses", () => {
        assert.equal(shouldShowQuestion("every", makeState(1), true), false);
    });
    it("shows every time with 'every' frequency", () => {
        assert.equal(shouldShowQuestion("every", makeState(1), false), true);
        assert.equal(shouldShowQuestion("every", makeState(5), false), true);
    });
    it("shows every 2nd with 'often' frequency", () => {
        assert.equal(shouldShowQuestion("often", makeState(1), false), true);
        assert.equal(shouldShowQuestion("often", makeState(2), false), false);
        assert.equal(shouldShowQuestion("often", makeState(3), false), true);
    });
    it("shows every 3rd with 'sometimes' frequency", () => {
        assert.equal(shouldShowQuestion("sometimes", makeState(2), false), true);
        assert.equal(shouldShowQuestion("sometimes", makeState(3), false), false);
        assert.equal(shouldShowQuestion("sometimes", makeState(4), false), false);
        assert.equal(shouldShowQuestion("sometimes", makeState(5), false), true);
    });
    it("shows every 5th with 'rarely' frequency", () => {
        assert.equal(shouldShowQuestion("rarely", makeState(4), false), true);
        assert.equal(shouldShowQuestion("rarely", makeState(5), false), false);
        assert.equal(shouldShowQuestion("rarely", makeState(9), false), true);
    });
});
describe("shouldShowQuestion (tool_use trigger)", () => {
    it("does NOT show on first tool use", () => {
        assert.equal(shouldShowQuestion("every", makeState(0, 0), false, "tool_use"), false);
    });
    it("skips trivial responses", () => {
        assert.equal(shouldShowQuestion("every", makeState(0, 5), true, "tool_use"), false);
    });
    it("shows every 5th with 'every' frequency", () => {
        assert.equal(shouldShowQuestion("every", makeState(0, 4), false, "tool_use"), true);
        assert.equal(shouldShowQuestion("every", makeState(0, 9), false, "tool_use"), true);
        assert.equal(shouldShowQuestion("every", makeState(0, 3), false, "tool_use"), false);
    });
    it("shows every 8th with 'often' frequency", () => {
        assert.equal(shouldShowQuestion("often", makeState(0, 7), false, "tool_use"), true);
        assert.equal(shouldShowQuestion("often", makeState(0, 15), false, "tool_use"), true);
        assert.equal(shouldShowQuestion("often", makeState(0, 6), false, "tool_use"), false);
    });
    it("shows every 12th with 'sometimes' frequency", () => {
        assert.equal(shouldShowQuestion("sometimes", makeState(0, 11), false, "tool_use"), true);
        assert.equal(shouldShowQuestion("sometimes", makeState(0, 23), false, "tool_use"), true);
        assert.equal(shouldShowQuestion("sometimes", makeState(0, 10), false, "tool_use"), false);
    });
    it("shows every 20th with 'rarely' frequency", () => {
        assert.equal(shouldShowQuestion("rarely", makeState(0, 19), false, "tool_use"), true);
        assert.equal(shouldShowQuestion("rarely", makeState(0, 39), false, "tool_use"), true);
        assert.equal(shouldShowQuestion("rarely", makeState(0, 18), false, "tool_use"), false);
    });
    it("uses tool_use_count not stop_count", () => {
        // stop_count is high but tool_use_count is not at interval
        assert.equal(shouldShowQuestion("every", makeState(100, 2), false, "tool_use"), false);
        // tool_use_count is at interval regardless of stop_count
        assert.equal(shouldShowQuestion("every", makeState(0, 4), false, "tool_use"), true);
    });
});
//# sourceMappingURL=frequency-controller.test.js.map