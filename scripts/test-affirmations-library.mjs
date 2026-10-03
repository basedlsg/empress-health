/**
 * scripts/test-affirmations-library.mjs
 *
 * The curated affirmations workbook is the default affirmation source.
 * Run: node scripts/test-affirmations-library.mjs
 */
import { createRequire } from 'module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);

delete process.env.AFFIRMATIONS_SOURCE;
process.env.MOCK_LLM = '1';
const lib = require('../lib/affirmations-library.js');
const { generateAffirmations } = require('../lib/affirmations.js');

let passed = 0;
const ok = (cond, label) => { assert.ok(cond, label); console.log(`  PASS  ${label}`); passed += 1; };

console.log('\n=== test-affirmations-library ===\n');

const stats = lib.stats();
ok(stats && Object.keys(stats.themes).length === 13, '13 themes loaded from the workbook');
const total = Object.values(stats.themes).reduce((n, c) => n + c, 0);
ok(total >= 3000, `thousands of affirmations available (${total})`);
for (const theme of ['Self-Confidence', 'Hope', 'Power', 'Gratitude', 'Peace', 'Energy', 'Balance', 'Joy', 'Connection', 'Resilience', 'Compassion', 'Purpose', 'Healing']) {
  ok(stats.themes[theme] > 50, `${theme} has affirmations (${stats.themes[theme]})`);
}

const slugs = ['sleep-architecture-cortisol', 'vasomotor-temperature', 'metabolic-health-body-composition'];
const a = lib.pickAffirmations({ slugs, seed: 'maya@example.test|2026-10-03' });
ok(a.length === 6, 'six affirmations picked');
ok(a.every((x) => x.caption && x.description && x.theme && x.focus_domain && x.source === 'affirmations-library'), 'each has caption, description, theme and focus domain');
ok(new Set(a.map((x) => x.caption.toLowerCase())).size === a.length, 'no repeated caption in one set');
ok(slugs.every((s) => a.some((x) => x.focus_domain === s)), 'every priority area is represented');
ok(a.every((x) => lib.DOMAIN_THEMES[x.focus_domain].includes(x.theme)), "each theme is one mapped to its domain");
const again = lib.pickAffirmations({ slugs, seed: 'maya@example.test|2026-10-03' });
ok(JSON.stringify(again) === JSON.stringify(a), 'same member and day → same picks');
const tomorrow = lib.pickAffirmations({ slugs, seed: 'maya@example.test|2026-10-04' });
ok(tomorrow.map((x) => x.caption).join() !== a.map((x) => x.caption).join(), 'next day → different picks');
const other = lib.pickAffirmations({ slugs, seed: 'someone-else@example.test|2026-10-03' });
ok(other.map((x) => x.caption).join() !== a.map((x) => x.caption).join(), 'different member → different picks');
ok(lib.pickAffirmations({ slugs: [], seed: 'x' }).length === 6, 'no priorities → still six, from the default domains');
ok(lib.pickAffirmations({ slugs: ['not-a-domain'], seed: 'x' }).length === 6, 'unknown domains are ignored');

// The app-wide generator uses the library by default and needs no LLM.
const gen = await generateAffirmations({ email: 'maya@example.test', priorityCategorySlugs: slugs }, 'test');
ok(gen.affirmations.length === 6 && gen.affirmations[0].source === 'affirmations-library', 'generateAffirmations serves the library by default');
ok(gen.citations.length === 0 && gen.legacyStrings.length === 6 && gen.legacyStrings[0].includes(gen.affirmations[0].caption), 'legacy strings carry caption + description');

console.log(`\n=== ${passed} passed, 0 failed ===`);
