// scripts/build-pages-jsx.mjs
// Pre-compile every pages/*.jsx → pages/*.js using esbuild's transform API.
// We use TRANSFORM (not BUILD) so top-level function declarations stay
// global — same semantics as the Babel-in-browser flow we're replacing.
// Run via: npm run build:pages

import { transform } from "esbuild";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const PAGES_DIR = path.resolve("pages");
const files = (await readdir(PAGES_DIR)).filter((f) => f.endsWith(".jsx"));

console.log(`Building ${files.length} JSX files in pages/`);

let totalIn = 0;
let totalOut = 0;

for (const f of files) {
  const inPath = path.join(PAGES_DIR, f);
  const outPath = path.join(PAGES_DIR, f.replace(/\.jsx$/, ".js"));
  const source = await readFile(inPath, "utf8");
  totalIn += source.length;

  const result = await transform(source, {
    loader: "jsx",
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    target: ["es2019"],
    minify: true,
    sourcemap: false,
    legalComments: "none",
  });

  await writeFile(outPath, result.code);
  totalOut += result.code.length;
}

const pct = Math.round((1 - totalOut / totalIn) * 100);
console.log(
  `Done. ${(totalIn / 1024).toFixed(1)} KB JSX → ${(totalOut / 1024).toFixed(1)} KB JS (-${pct}%)`
);
