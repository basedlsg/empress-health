// scripts/copy-legacy-html-to-public.mjs
// Vercel deploy helper. Copies every *.html at the repo root into public/
// so Vercel serves them as static assets at canonical URLs (/signup, etc.).
// Also stages the Vite assessment SPA build into public/assessment/.
// Also stages the redesign bundle into public/pages/.
// Run by vercel.json's buildCommand.

import { readdir, copyFile, mkdir, stat, cp } from "node:fs/promises";
import path from "node:path";
import fs from "node:fs";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");

await mkdir(PUBLIC_DIR, { recursive: true });

// 1. Stage Vite-built assessment SPA at /public/assessment/
const assessmentDist = path.join(ROOT, "prds", "dist");
if (fs.existsSync(assessmentDist)) {
  await mkdir(path.join(PUBLIC_DIR, "assessment"), { recursive: true });
  await cp(assessmentDist, path.join(PUBLIC_DIR, "assessment"), { recursive: true });
  console.log("staged prds/dist/ → public/assessment/");
}

// 2. Stage the Empathetic Elegance redesign bundle at /public/pages/
const pagesDir = path.join(ROOT, "pages");
if (fs.existsSync(pagesDir)) {
  await mkdir(path.join(PUBLIC_DIR, "pages"), { recursive: true });
  await cp(pagesDir, path.join(PUBLIC_DIR, "pages"), { recursive: true });
  console.log("staged pages/ → public/pages/");
}

// 3. Stage the report-heroes (already at public/report-heroes — no-op here).

const entries = await readdir(ROOT, { withFileTypes: true });
let copied = 0;
let skipped = 0;

for (const e of entries) {
  if (!e.isFile()) continue;
  if (!e.name.endsWith(".html")) continue;
  const src = path.join(ROOT, e.name);
  const dst = path.join(PUBLIC_DIR, e.name);
  try {
    // Skip if the public/ version is already newer (idempotent re-runs).
    const sSrc = await stat(src);
    let needCopy = true;
    try {
      const sDst = await stat(dst);
      if (sDst.mtimeMs >= sSrc.mtimeMs) needCopy = false;
    } catch {}
    if (!needCopy) { skipped++; continue; }
    await copyFile(src, dst);
    copied++;
  } catch (err) {
    console.warn(`  copy fail ${e.name}: ${err.message}`);
  }
}

console.log(`copy-legacy-html: ${copied} copied, ${skipped} skipped, ${entries.filter(e=>e.isFile()&&e.name.endsWith(".html")).length} total *.html`);
