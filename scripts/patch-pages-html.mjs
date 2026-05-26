// scripts/patch-pages-html.mjs
// Patches every pages/*.html so it loads the pre-built .js (not .jsx),
// uses React production CDN, and drops Babel-standalone entirely.

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const PAGES_DIR = path.resolve("pages");
const files = (await readdir(PAGES_DIR)).filter((f) => f.endsWith(".html"));
let touched = 0;

for (const f of files) {
  const fp = path.join(PAGES_DIR, f);
  let src = await readFile(fp, "utf8");
  const before = src;

  // 1. Switch React + ReactDOM CDN to production.min (smaller, faster).
  src = src.replace(
    /https:\/\/unpkg\.com\/react@18\.3\.1\/umd\/react\.development\.js/g,
    "https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  );
  src = src.replace(
    /https:\/\/unpkg\.com\/react-dom@18\.3\.1\/umd\/react-dom\.development\.js/g,
    "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  );
  // The integrity hashes are wrong for production builds. Strip them.
  src = src.replace(/\sintegrity="sha384-[A-Za-z0-9+/=]+"/g, "");

  // 2. Remove the Babel-standalone script tag entirely (no longer needed).
  src = src.replace(
    /\s*<script\s+src="https:\/\/unpkg\.com\/@babel\/standalone[^>]*><\/script>/g,
    ""
  );

  // 3. Change every `<script type="text/babel" src="/pages/X.jsx">` to
  //    `<script src="/pages/X.js">`. Also covers the bare `src="X.jsx"`.
  src = src.replace(
    /<script\s+type="text\/babel"\s+src="(\/pages\/[a-z0-9_-]+)\.jsx"\s*><\/script>/g,
    '<script src="$1.js"></script>'
  );

  // 4. Convert the inline mount script. Replace JSX `<Component />` with
  //    `React.createElement(Component)` and drop type="text/babel".
  src = src.replace(
    /<script\s+type="text\/babel"\s*>([\s\S]*?)<\/script>/g,
    (_m, inner) => {
      const converted = inner.replace(
        /<([A-Z][A-Za-z0-9_]*)\s*\/>/g,
        "React.createElement($1)"
      );
      return `<script>${converted}</script>`;
    }
  );

  if (src !== before) {
    await writeFile(fp, src);
    touched++;
  }
}

console.log(`Patched ${touched} of ${files.length} HTML shells`);
