/**
 * Unit tests for the HIS engine (Health Intelligence Score).
 * Run via: npx tsx scripts/test-his-engine.mjs
 *
 * Tests the edge cases and core behaviors documented in prds/hisEngine.ts.
 */

import {
  getScoreBand,
  computeHis,
  computeDomainScore,
  handleMissingItems,
  runAssessment,
} from '../prds/hisEngine.ts'

// ─────────────────────────────────────────────────────────────────────
// Test harness
// ─────────────────────────────────────────────────────────────────────

let passed = 0
let failed = 0

function assert(name, condition, got, expected) {
  if (condition) {
    console.log(`✓ ${name}`)
    passed += 1
  } else {
    console.log(`✗ ${name} (got ${JSON.stringify(got)}, expected ${JSON.stringify(expected)})`)
    failed += 1
  }
}

// ─────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────

// Test 1: Score band edges
console.log("\n=== Test 1: Score band edges ===")
const band0 = getScoreBand(0)
assert("getScoreBand(0) → Critical", band0.label === "Critical", band0.label, "Critical")

const band39 = getScoreBand(39)
assert("getScoreBand(39) → Critical", band39.label === "Critical", band39.label, "Critical")

const band40 = getScoreBand(40)
assert("getScoreBand(40) → Struggling", band40.label === "Struggling", band40.label, "Struggling")

const band85 = getScoreBand(85)
assert("getScoreBand(85) → Thriving", band85.label === "Thriving", band85.label, "Thriving")

const band100 = getScoreBand(100)
assert("getScoreBand(100) → Thriving", band100.label === "Thriving", band100.label, "Thriving")

// Test 2: Stage weighting changes composite
console.log("\n=== Test 2: Stage weighting changes composite ===")
// Domain 1 (vasomotor) vs Domain 7 (musculoskeletal) have opposite weights across stages:
// Peri: D1=12%, D7=8%; Post: D1=8%, D7=14%.
// Set D1 high and D7 low to see the difference.
const sampleDomainScores = {
  1: 90, 2: 50, 3: 50, 4: 50, 5: 50,
  6: 50, 7: 10, 8: 50, 9: 50, 10: 50,
}

const hisPeri = computeHis(sampleDomainScores, "perimenopause")
const hisPost = computeHis(sampleDomainScores, "post_menopause")
const scoreDiff = Math.abs((hisPeri.his || 0) - (hisPost.his || 0))
assert(
  "Different stages produce different HIS for same domain scores",
  scoreDiff > 0,
  scoreDiff,
  "> 0",
)

// Test 3: Missing data handling
console.log("\n=== Test 3: Missing data handling ===")
// 3+ missing → null
const missing3 = handleMissingItems({
  1: 5, 2: 6, 3: null, 4: null, 5: null, 6: 7, 7: 8, 8: 9,
})
assert("3+ missing items → null", missing3 === null, missing3, null)

// 1-2 missing → mean imputation
const missing1 = handleMissingItems({
  1: 2, 2: 4, 3: null, 4: 6, 5: 8,
})
// Mean of [2, 4, 6, 8] = 5, so missing item 3 should be imputed to 5
const hasMissing1 = missing1 !== null && missing1[3] === 5
assert("1 missing item → mean imputation (result: 5)", hasMissing1, missing1 ? missing1[3] : null, 5)

// 0 missing → as-is
const missing0 = handleMissingItems({
  1: 10, 2: 9, 3: 8, 4: 7, 5: 6,
})
const allPresent = missing0 !== null && Object.keys(missing0).length === 5
assert("0 missing items → all present", allPresent, Object.keys(missing0 || {}).length, 5)

// Test 4: All-zero responses (worst case)
console.log("\n=== Test 4: All-zero responses (worst case) ===")
const allZeroResp = {}
for (let q = 1; q <= 120; q++) allZeroResp[q] = 0
const allZeroRes = runAssessment({ responses: allZeroResp, stagingResponse: 1 })
assert("All-zero HIS ≥ 1", (allZeroRes.his || 0) >= 1, allZeroRes.his, ">= 1")
assert("All-zero band is Critical", allZeroRes.hisBand === "Critical", allZeroRes.hisBand, "Critical")
assert("All-zero composite flag is true", allZeroRes.compositeFlag === true, allZeroRes.compositeFlag, true)

// Test 5: All-ten responses (best case)
console.log("\n=== Test 5: All-ten responses (best case) ===")
const allTenResp = {}
for (let q = 1; q <= 120; q++) allTenResp[q] = 10
const allTenRes = runAssessment({ responses: allTenResp, stagingResponse: 1 })
assert("All-ten HIS === 100", allTenRes.his === 100, allTenRes.his, 100)
assert("All-ten band is Thriving", allTenRes.hisBand === "Thriving", allTenRes.hisBand, "Thriving")

// Test 6: Stage validation
console.log("\n=== Test 6: Stage validation ===")
try {
  const minimalResp = { 1: 5 }
  runAssessment({ responses: minimalResp, stagingResponse: 4 })
  assert("Invalid stage throws", false, "no error", "should throw RangeError")
  failed += 1
} catch (e) {
  assert("Invalid stage throws RangeError", e instanceof RangeError, e.constructor.name, "RangeError")
}

// Test 7: Item flag fires when raw ≤ threshold
console.log("\n=== Test 7: Item flag fires when raw ≤ threshold ===")
const flagTestResp = {}
for (let q = 1; q <= 120; q++) flagTestResp[q] = 10 // all high
flagTestResp[2] = 1 // Q2 (vasomotor severity); threshold=2, so 1 triggers RECOMMENDED flag
const flagTestRes = runAssessment({ responses: flagTestResp, stagingResponse: 1 })
const q2Flag = flagTestRes.itemFlags.find((f) => f.question === 2)
assert("Q2 with raw=1 triggers RECOMMENDED vasomotor flag", q2Flag !== undefined && q2Flag.priority === "RECOMMENDED", q2Flag?.priority, "RECOMMENDED")

// Test 8: Banker's rounding via mean imputation
// (bankerRound is not exported, but is tested indirectly via handleMissingItems which calls it)
console.log("\n=== Test 8: Mean imputation rounding correctness ===")
// Mean of [1, 2] = 1.5, banker's round should give 2
const impute1 = handleMissingItems({
  1: 1, 2: 2, 3: null,
})
const correctRound1 = impute1 !== null && impute1[3] === 2
assert("Mean imputation banker's round (1.5 → 2)", correctRound1, impute1?.[3], 2)

// Mean of [1, 3] = 2.0, exact
const impute2 = handleMissingItems({
  1: 1, 2: 3, 3: null,
})
const correctRound2 = impute2 !== null && impute2[3] === 2
assert("Mean imputation exact (2.0 → 2)", correctRound2, impute2?.[3], 2)

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log(`\n=== ${passed} passed, ${failed} failed ===\n`)
process.exit(failed ? 1 : 0)
