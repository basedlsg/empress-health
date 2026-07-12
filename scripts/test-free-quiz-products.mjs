#!/usr/bin/env node
/**
 * test-free-quiz-products.mjs — GUARDRAIL
 *
 * Asserts that every supplement/product recommended by the free 12-question
 * quiz (the `PRODUCTS` map in free-assessment.html) is a verbatim entry in
 * data/product_catalog.json — our Pinecone-grounded curated marketplace.
 *
 * This is the enforcement behind "only recommend vitamins from our Pinecone":
 * if someone adds an off-catalog name to the quiz, CI fails here.
 *
 * Run: node scripts/test-free-quiz-products.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const catalog = JSON.parse(readFileSync(join(root, "data", "product_catalog.json"), "utf8"));
const catalogArr = Array.isArray(catalog) ? catalog : (catalog.products || Object.values(catalog)[0]);
const catalogNames = new Set(catalogArr.map((p) => p.name));

// Every symptom-score page that recommends products. Each page lists products
// as `{n:"…",w:"…"}` objects (menopause: `const PRODUCTS={…}`; the config-driven
// track pages: `products:{…}` inside TRACK). The `{n:"…"` shape is unique to
// product entries in all of them, so a global match is safe and future-proof.
const QUIZ_PAGES = ["free-assessment.html", "sleep-assessment.html"];

let totalChecked = 0;
let anyFail = false;

for (const page of QUIZ_PAGES) {
  const html = readFileSync(join(root, page), "utf8");
  const names = [...html.matchAll(/\{n:"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1].replace(/\\"/g, '"'));

  if (names.length === 0) {
    console.error(`FAIL: no product names parsed from ${page}`);
    anyFail = true;
    continue;
  }

  const offCatalog = names.filter((n) => !catalogNames.has(n));
  if (offCatalog.length) {
    console.error(`FAIL: ${offCatalog.length} product(s) in ${page} are NOT in the Pinecone-grounded catalog:`);
    for (const n of offCatalog) console.error(`  ✗ ${n}`);
    anyFail = true;
    continue;
  }

  totalChecked += names.length;
  console.log(`  ✓ ${page}: ${names.length} product recommendation(s) catalog-grounded`);
}

if (anyFail) {
  console.error("\nEvery quiz recommendation must match a name in data/product_catalog.json verbatim.");
  process.exit(1);
}

console.log(`PASS: all ${totalChecked} product recommendations across ${QUIZ_PAGES.length} score pages are catalog-grounded (${catalogNames.size} catalog products).`);
