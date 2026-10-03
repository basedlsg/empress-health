/**
 * scripts/test-report-pdf.mjs
 *
 * Renders the sample member's full report to PDF with the same headless
 * browser the results email uses, and checks it is the complete report.
 * Needs the SPA built (npm run build:assessment) and a Playwright Chromium
 * (npx playwright install chromium). Images load from SITE_ORIGIN when a
 * server is running there; without one they are simply skipped.
 *
 * Run: node scripts/test-report-pdf.mjs
 */
import { createRequire } from 'module';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const require = createRequire(import.meta.url);

const { renderReportPdf } = require('../lib/report-pdf.js');
const { buildSampleState } = require('../lib/report-sample-state.js');
const siteOrigin = process.env.SITE_ORIGIN || 'http://localhost:3100';

const normal = await renderReportPdf({ state: buildSampleState(), siteOrigin, largeType: false });
const large = await renderReportPdf({ state: buildSampleState(), siteOrigin, largeType: true });

assert.ok(normal.pages >= 30, `normal report is the full document (${normal.pages} pages)`);
assert.ok(large.pages > normal.pages, `large type is larger (${large.pages} > ${normal.pages} pages)`);
assert.ok(normal.pdf.subarray(0, 5).toString() === '%PDF-', 'output is a PDF');

// Text check via pdftotext when available.
try {
  const dir = mkdtempSync(path.join(tmpdir(), 'report-pdf-'));
  const file = path.join(dir, 'large.pdf');
  writeFileSync(file, large.pdf);
  // Reading order (not -layout): two-column cards would otherwise interleave lines.
  const flat = (t) => t.replace(/\s+/g, ' ');
  const text = flat(execFileSync('pdftotext', [file, '-'], { encoding: 'utf8' }));
  const sample = buildSampleState();
  // Affirmation cards sit in two columns, so reading order interleaves them — match each caption's opening words.
  const captionStarts = sample.apiResult.affirmations.map((a) => a.caption.split(' ').slice(0, 3).join(' '));
  for (const needle of ['Thank You, Maya', 'Menopause-Certified NAMS Practitioner', 'Magnesium Glycinate 400mg', 'Amy M. Stoddard', 'Your sleep domain score',
    ...captionStarts, 'YOU WILL GET A LUXURY GIFT WORTH $30', 'Premium plan receives a luxury gift']) {
    assert.ok(text.includes(flat(needle)), `PDF text contains "${needle}"`);
  }
  assert.ok(!/Something went wrong displaying your report/.test(text), 'report did not hit the error boundary');
  assert.ok(!/How does this report resonate|Tell us in your own words/.test(text), 'interactive feedback boxes are left out of the PDF');
  const free = buildSampleState(); free.memberTier = 'essential';
  const noGift = await renderReportPdf({ state: free, siteOrigin, largeType: false });
  const noGiftFile = path.join(dir, 'essential.pdf'); writeFileSync(noGiftFile, noGift.pdf);
  const essentialText = execFileSync('pdftotext', [noGiftFile, '-'], { encoding: 'utf8' });
  assert.ok(!/LUXURY GIFT/.test(essentialText), 'Essential members do not get the Premium gift page');
} catch (err) {
  if (err.code === 'ENOENT') console.log('  (pdftotext not installed — skipped text checks)');
  else throw err;
}

console.log(`PASS: full report renders to PDF (${normal.pages} pages normal, ${large.pages} pages large type)`);
