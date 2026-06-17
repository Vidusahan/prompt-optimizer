/**
 * test-analysis.js — validates ANALYSIS_SYSTEM against 4 bad prompts.
 *
 * Run from the project root:
 *   node src/prompts/test-analysis.js
 */

import { callGroq } from "../api.js";
import { ANALYSIS_SYSTEM } from "./analysis.js";

const VALID_ISSUE_TYPES = new Set([
  "vagueness", "no_context", "no_format", "no_role",
  "no_constraints", "ambiguous_goal", "no_examples", "too_long", "too_short",
]);

const BAD_PROMPTS = [
  "write me a blog post about AI",
  "help me with my code",
  "summarize this",
  "make it better",
];

let passed = 0;

for (const prompt of BAD_PROMPTS) {
  console.log(`\n─── Testing: "${prompt}" ───`);
  try {
    const result = await callGemini(
      ANALYSIS_SYSTEM,
      `Analyze this prompt:\n\n${prompt}`
    );

    const errors = [];
    if (typeof result.score !== "number" || result.score < 1 || result.score > 10)
      errors.push("score out of range or wrong type");
    if (!Array.isArray(result.issues))
      errors.push("issues is not an array");
    if (!Array.isArray(result.strengths))
      errors.push("strengths is not an array");
    if (typeof result.summary !== "string")
      errors.push("summary is not a string");

    const badTypes = result.issues
      .map((i) => i.type)
      .filter((t) => !VALID_ISSUE_TYPES.has(t));
    if (badTypes.length > 0)
      errors.push(`unknown issue types: ${badTypes.join(", ")}`);

    if (errors.length > 0) {
      console.log("❌ Schema errors:", errors);
    } else {
      console.log(`✅  score: ${result.score}/10`);
      console.log(`   issues: ${result.issues.map((i) => i.type).join(", ") || "(none)"}`);
      console.log(`   strengths: ${result.strengths.join(", ") || "(none)"}`);
      passed++;
    }
  } catch (e) {
    console.log("❌ Threw:", e.message);
  }
}

console.log(`\n══════════════════════════════`);
console.log(`Result: ${passed}/${BAD_PROMPTS.length} passed`);
if (passed === BAD_PROMPTS.length) {
  console.log("✅  Analysis prompt validated — ready for Day 2");
} else {
  console.log("❌  Fix errors above before continuing");
}
