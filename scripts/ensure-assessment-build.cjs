/**
 * Runs before `npm start` when prds/dist is missing so /assessment/ works after a fresh clone.
 * Skips when index.html already exists (fast restarts).
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const index = path.join(root, "prds", "dist", "index.html");

if (fs.existsSync(index)) {
  process.exit(0);
}

console.log("[prestart] Building assessment SPA…");
const r = spawnSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["run", "build:assessment"],
  { cwd: root, stdio: "inherit", shell: true }
);
if (r.status !== 0) {
  console.warn(
    "[prestart] build:assessment failed (install devDependencies or run npm run build:assessment). Server will still start; /assessment/ may show 503."
  );
}
process.exit(0);
