/**
 * test-improve.js — validates the full 2-pass pipeline end to end.
 *
 * Run from the project root:
 *   node src/prompts/test-improve.js
 */

import { callGroq } from "../api.js";
import { ANALYSIS_SYSTEM } from "./analysis.js";
import { IMPROVE_SYSTEM } from "./improve.js";

const EXPECTED_STRATEGIES = [
  "Clarity & Precision",
  "Role + Context",
  "Chain of Thought",
];

const TEST_PROMPT = "write me a blog post about AI";

console.log(`Testing full pipeline with: "${TEST_PROMPT}"\n`);

// ── Pass 1: Analysis ──────────────────────────────────────────────────────────
console.log("Pass 1: Analyzing...");
let analysis;
try {
  analysis = await callGroq(
    ANALYSIS_SYSTEM,
    `Analyze this prompt:\n\n${TEST_PROMPT}`
  );
  console.log(`✅  score: ${analysis.score}/10`);
  console.log(`   issues: ${analysis.issues?.map((i) => i.type).join(", ") || "(none)"}`);
} catch (e) {
  console.log("❌ Analysis pass failed:", e.message);
  process.exit(1);
}

// ── Pass 2: Improvement ───────────────────────────────────────────────────────
console.log("\nPass 2: Generating improvements...");
let result;
try {
  result = await callGemini(
    IMPROVE_SYSTEM,
    `Original prompt:\n${TEST_PROMPT}\n\nAnalysis:\n${JSON.stringify(analysis)}\n\nGenerate 3 improved versions.`
  );
} catch (e) {
  console.log("❌ Improvement pass failed:", e.message);
  process.exit(1);
}

// ── Validate schema ───────────────────────────────────────────────────────────
const errors = [];
if (!Array.isArray(result.versions)) {
  errors.push("versions is not an array");
} else {
  if (result.versions.length !== 3)
    errors.push(`expected 3 versions, got ${result.versions.length}`);

  result.versions.forEach((v, i) => {
    if (v.strategy !== EXPECTED_STRATEGIES[i])
      errors.push(`v${i + 1} strategy mismatch: "${v.strategy}"`);
    if (typeof v.prompt !== "string" || v.prompt.length < 10)
      errors.push(`v${i + 1} prompt too short or missing`);
    if (!Array.isArray(v.changes) || v.changes.length < 2)
      errors.push(`v${i + 1} changes array too short`);
    if (typeof v.tagline !== "string")
      errors.push(`v${i + 1} tagline missing`);
  });
}

if (errors.length > 0) {
  console.log("❌ Schema errors:", errors);
} else {
  console.log(`✅  ${result.versions.length} versions returned`);
  result.versions.forEach((v, i) => {
    console.log(`\n   v${i + 1}: ${v.strategy}`);
    console.log(`   tagline: ${v.tagline}`);
    console.log(`   changes: ${v.changes.join(" | ")}`);
  });
}

console.log("\n══════════════════════════════");
if (errors.length === 0) {
  console.log("✅  Both passes validated — ready for Day 2");
} else {
  console.log("❌  Fix errors above before continuing");
}
