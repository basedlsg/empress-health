// scripts/copy-legacy-html-to-public.mjs
// Vercel deploy helper. Stages legacy account pages and the public redesign.
// The paid Vite assessment is served by Express behind the membership gate.
// Run by vercel.json's buildCommand.

import { readdir, readFile, writeFile, copyFile, mkdir, cp, rm } from "node:fs/promises";
import path from "node:path";
import fs from "node:fs";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");

await mkdir(PUBLIC_DIR, { recursive: true });

// Older builds copied the paid Vite SPA into public/assessment. Vercel serves
// outputDirectory files before rewrites, so that copy bypasses the membership
// gate. It is generated output; the current build lives in prds/dist instead.
await rm(path.join(PUBLIC_DIR, "assessment"), { recursive: true, force: true });

// 1. Stage the Empathetic Elegance redesign bundle at /public/pages/
const pagesDir = path.join(ROOT, "pages");
if (fs.existsSync(pagesDir)) {
  await mkdir(path.join(PUBLIC_DIR, "pages"), { recursive: true });
  await cp(pagesDir, path.join(PUBLIC_DIR, "pages"), { recursive: true });
  console.log("staged pages/ → public/pages/");
}

// 2. Stage the report-heroes (already at public/report-heroes — no-op here).

const KEEP_PUBLIC_VERSION = new Set(["expertblogs.html"]);

const entries = await readdir(ROOT, { withFileTypes: true });
let copied = 0;
let skipped = 0;

for (const e of entries) {
  if (!e.isFile()) continue;
  if (!e.name.endsWith(".html")) continue;
  // public/expertblogs.html is a separately maintained (committed) version and
  // is what the live Education page serves; the root file is an older variant.
  if (KEEP_PUBLIC_VERSION.has(e.name)) { skipped++; continue; }
  const src = path.join(ROOT, e.name);
  const dst = path.join(PUBLIC_DIR, e.name);
  try {
    // Always copy: the root file is the source of truth. An mtime "newer"
    // check skipped every file on Vercel (a fresh checkout gives all files the
    // same mtime), so a stale committed public/ copy was served instead.
    await copyFile(src, dst);
    copied++;
  } catch (err) {
    console.warn(`  copy fail ${e.name}: ${err.message}`);
  }
}

console.log(`copy-legacy-html: ${copied} copied, ${skipped} skipped, ${entries.filter(e=>e.isFile()&&e.name.endsWith(".html")).length} total *.html`);

// The public redesign lives in its own preview project in source control.
// Overlay its pages and assets at the site root after staging legacy pages.
// /assessment is the paid, gated flow on this project; the redesigned free
// quiz is published from its own free-assessment.html source file.
const REDESIGN_DIR = path.join(ROOT, "redesign-preview");
const FREE_ASSESSMENT_LINK = /(?<![A-Za-z0-9_-])assessment\.html/g;
for (const entry of await readdir(REDESIGN_DIR, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name === "assets") {
    await cp(path.join(REDESIGN_DIR, "assets"), path.join(PUBLIC_DIR, "assets"), { recursive: true });
    continue;
  }
  if (!entry.isFile() || !/\.(html|css|js)$/.test(entry.name)) continue;
  // Roshni's repository now has a dedicated 12-question free assessment.
  // Keep the older eight-question prototype and logo review page internal.
  if (entry.name === "assessment.html" || entry.name === "logo-options.html") continue;
  const destination = entry.name;
  const content = await readFile(path.join(REDESIGN_DIR, entry.name), "utf8");
  await writeFile(path.join(PUBLIC_DIR, destination), content.replace(FREE_ASSESSMENT_LINK, "free-assessment.html"));
}
// Older builds may have left this static file behind. Never allow it to
// shadow the paid /assessment route when Vercel applies clean URLs.
await rm(path.join(PUBLIC_DIR, "assessment.html"), { force: true });
console.log("staged redesign-preview/ → public/ (free quiz at /free-assessment)");
