/**
 * test-retrieval.mjs
 * Runs 6 fixed clinical queries through lib/retrieval.js and reports results.
 * Run: node scripts/test-retrieval.mjs
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);
const retrieval = require("../lib/retrieval.js");

// ─── Test cases ───────────────────────────────────────────────────────────────
// Each: { query, expectedDomain, label }
const TEST_CASES = [
  {
    query:          "severe hot flashes night sweats menopause",
    expectedDomain: 1,
    label:          "Vasomotor (D1)",
  },
  {
    query:          "brain fog word finding cognitive decline",
    expectedDomain: 3,
    label:          "Cognitive (D3)",
  },
  {
    query:          "vaginal dryness intercourse pain GSM",
    expectedDomain: 8,
    label:          "Genitourinary (D8)",
  },
  {
    query:          "weight gain visceral fat insulin resistance",
    expectedDomain: 5,
    label:          "Metabolic (D5)",
  },
  {
    query:          "bone density fracture risk DEXA",
    expectedDomain: 7,
    label:          "Musculoskeletal/Bone (D7)",
  },
  {
    query:          "panic attacks anxiety emotional volatility",
    expectedDomain: 4,
    label:          "Mood/Anxiety (D4)",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RESET  = "\x1b[0m";
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";

function pass(msg) { return `${GREEN}PASS${RESET} ${msg}`; }
function fail(msg) { return `${RED}FAIL${RESET} ${msg}`; }
function warn(msg) { return `${YELLOW}WARN${RESET} ${msg}`; }

function truncate(str, n = 120) {
  const flat = str.replace(/\n+/g, " ").trim();
  return flat.length <= n ? flat : flat.slice(0, n) + "…";
}

// ─── Run ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${BOLD}Empress Retrieval Test Harness${RESET}`);
  console.log(`Mode: ${retrieval.MODE}`);
  console.log("─".repeat(78));

  await retrieval.init();

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    console.log(`\n${BOLD}Query: "${tc.query}"${RESET}`);
    console.log(`Expected top result domain: ${tc.label}`);

    const chunks = await retrieval.retrieve({ query: tc.query, k: 3 });

    if (chunks.length === 0) {
      console.log(fail("No results returned."));
      failed++;
      continue;
    }

    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const domains = c.metadata?.domain_ids || [];
      const domainStr = domains.length ? `D[${domains.join(",")}]` : "D[]";
      console.log(
        `  #${i + 1} score=${c.score.toFixed(4)} ${domainStr} ` +
        `${DIM}${truncate(c.content, 120)}${RESET}`
      );
    }

    const topDomains = new Set(chunks[0].metadata?.domain_ids || []);
    if (topDomains.has(tc.expectedDomain)) {
      console.log(pass(`Top result includes expected domain ${tc.expectedDomain}`));
      passed++;
    } else {
      console.log(
        warn(
          `Top result domains [${[...topDomains].join(",")}] do not include expected domain ${tc.expectedDomain}. ` +
          "Metadata enrichment may need adjustment for this query."
        )
      );
      // Count as warning, not hard fail — local n-gram fallback is approximate
      failed++;
    }
  }

  console.log("\n" + "─".repeat(78));
  console.log(
    `${BOLD}Results: ${passed}/${TEST_CASES.length} passed${RESET}` +
    (failed > 0 ? ` (${failed} warning/miss)` : "")
  );

  if (failed > 0 && retrieval.MODE === "local") {
    console.log(
      `\n${YELLOW}Note:${RESET} Using local hashed n-gram embeddings. ` +
      "Domain misses are expected for some queries — the local fallback is\n" +
      "not semantically aware. Set OPENAI_API_KEY and re-run 'npm run seed:embed'\n" +
      "for production-quality retrieval."
    );
  }

  // Also run retrieveContext on first query to verify that path
  console.log("\n─".repeat(78));
  console.log(`${BOLD}retrieveContext smoke test:${RESET}`);
  const { context, citations } = await retrieval.retrieveContext({
    query: TEST_CASES[0].query,
    k: 2,
    maxChars: 800,
  });
  console.log(`  Context length: ${context.length} chars`);
  console.log(`  Citations: ${citations.map((c) => `${c.id.replace("empress-120-symptom-biomarker-framework-","").replace("chunk-","")} (${c.score.toFixed(3)})`).join(", ")}`);
  console.log("  Context preview:", truncate(context, 200));

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Test harness error:", err);
  process.exit(1);
});
