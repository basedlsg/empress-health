/**
 * scripts/import-affirmations-xlsx.mjs
 *
 * Turns the team's affirmations workbook ("Affirmations (Positive & Growth
 * States)") into data/affirmations-library.json, the file the app reads at
 * runtime (lib/affirmations-library.js). One sheet per theme; columns are
 * Number, Caption, Description.
 *
 * Run: node scripts/import-affirmations-xlsx.mjs "/path/to/Affirmations.xlsx"
 *
 * Re-run whenever the sheet changes and commit the regenerated JSON.
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const JSZip = require('jszip');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/import-affirmations-xlsx.mjs <workbook.xlsx>');
  process.exit(1);
}

const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, '&');
const clean = (s) => decode(s).replace(/\s+/g, ' ').trim();
const textOf = (xml) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join('');

const zip = await JSZip.loadAsync(readFileSync(input));
const read = (name) => zip.file(name).async('string');

const shared = [...(await read('xl/sharedStrings.xml')).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => clean(textOf(m[1])));
const workbook = await read('xl/workbook.xml');
const rels = Object.fromEntries([...(await read('xl/_rels/workbook.xml.rels')).matchAll(/<Relationship\s[^>]*?Id="([^"]+)"[^>]*?Target="([^"]+)"/g)].map((m) => [m[1], m[2]]));
const sheets = [...workbook.matchAll(/<sheet\s[^>]*?name="([^"]+)"[^>]*?r:id="([^"]+)"/g)].map((m) => ({ name: decode(m[1]), target: rels[m[2]] }));

const themes = {};
const report = [];
for (const sheet of sheets) {
  const xml = await read(`xl/${sheet.target.replace(/^\//, '').replace(/^xl\//, '')}`);
  const rows = new Map();
  for (const cell of xml.matchAll(/<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const attrs = cell[1];
    const ref = /r="([A-Z]+)(\d+)"/.exec(attrs);
    if (!ref || !cell[2]) continue;
    let value = '';
    if (/t="s"/.test(attrs)) {
      const v = /<v>([\s\S]*?)<\/v>/.exec(cell[2]);
      value = v ? shared[Number(v[1])] || '' : '';
    } else if (/t="inlineStr"/.test(attrs)) {
      value = clean(textOf(cell[2]));
    } else {
      const v = /<v>([\s\S]*?)<\/v>/.exec(cell[2]);
      value = v ? clean(v[1]) : '';
    }
    if (!value) continue;
    const r = Number(ref[2]);
    if (!rows.has(r)) rows.set(r, {});
    rows.get(r)[ref[1]] = value;
  }

  const items = [];
  const seen = new Set();
  const uniqueCaptions = new Set();
  let dropped = 0;
  for (const r of [...rows.keys()].sort((a, b) => a - b)) {
    const row = rows.get(r);
    if (r === 1 || !row.B) continue; // header / blank
    const caption = row.B;
    const description = row.C || '';
    const key = `${caption}\u0000${description}`.toLowerCase();
    if (seen.has(key)) { dropped += 1; continue; } // exact repeat of the same caption + description
    seen.add(key);
    uniqueCaptions.add(caption.toLowerCase());
    items.push([Number.parseInt(row.A, 10) || items.length + 1, caption, description]);
  }
  themes[sheet.name] = items;
  report.push({ theme: sheet.name, rows: items.length + dropped, kept: items.length, repeatedRowsDropped: dropped, uniqueCaptions: uniqueCaptions.size });
}

const out = {
  source: path.basename(input),
  generatedAt: new Date().toISOString(),
  format: 'themes[theme] = [[number, caption, description], ...]',
  themes,
};
writeFileSync(path.join(root, 'data', 'affirmations-library.json'), JSON.stringify(out) + '\n');

console.table(report);
console.log(`Wrote data/affirmations-library.json — ${Object.keys(themes).length} themes, ${Object.values(themes).reduce((n, t) => n + t.length, 0)} affirmations`);
