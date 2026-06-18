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

const html = readFileSync(join(root, "free-assessment.html"), "utf8");
const catalog = JSON.parse(readFileSync(join(root, "data", "product_catalog.json"), "utf8"));
const catalogArr = Array.isArray(catalog) ? catalog : (catalog.products || Object.values(catalog)[0]);
const catalogNames = new Set(catalogArr.map((p) => p.name));

// Isolate the PRODUCTS object literal.
const start = html.indexOf("const PRODUCTS={");
if (start === -1) {
  console.error("FAIL: could not find `const PRODUCTS={` in free-assessment.html");
  process.exit(1);
}
const block = html.slice(start, html.indexOf("\n};", start) + 3);

// Pull every recommended product name: {n:"..."
const names = [...block.matchAll(/\{n:"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1].replace(/\\"/g, '"'));

if (names.length === 0) {
  console.error("FAIL: no product names parsed from the PRODUCTS map");
  process.exit(1);
}

const offCatalog = names.filter((n) => !catalogNames.has(n));

if (offCatalog.length) {
  console.error(`FAIL: ${offCatalog.length} quiz product(s) are NOT in the Pinecone-grounded catalog:`);
  for (const n of offCatalog) console.error(`  ✗ ${n}`);
  console.error("\nEvery quiz recommendation must match a name in data/product_catalog.json verbatim.");
  process.exit(1);
}

console.log(`PASS: all ${names.length} free-quiz product recommendations are catalog-grounded (${catalogNames.size} catalog products).`);
