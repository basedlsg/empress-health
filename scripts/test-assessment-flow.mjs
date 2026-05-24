/**
 * End-to-end smoke test for the Peri+ Assessment flow (paid tier).
 *
 * Drives /assessment/?tier=paid from the Entry screen all the way through
 * Staging → 10 category screens → Loading → Report. Captures:
 *   - console messages (errors / warnings)
 *   - uncaught page errors
 *   - failed network requests
 *   - HTTP responses >= 400 from /api/recommendations/*
 *   - screenshot at each step
 *   - per-step timings
 *
 * Usage:
 *   node scripts/test-assessment-flow.mjs
 *   node scripts/test-assessment-flow.mjs --baseUrl=http://localhost:3000 --headless
 *
 * Output:
 *   artifacts/assessment-test/screenshots/*.png
 *   artifacts/assessment-test/report.json
 *   artifacts/assessment-test/report.html
 *
 * The server must already be running on baseUrl. The script does NOT spawn it.
 *
 * Note: The paid flow calls /api/recommendations/{affirmations,combined,products}
 * which require an authenticated session. Running this script unauthenticated
 * is expected — those calls will return 401/503 and the script records them
 * as "expected" rather than failures.
 */

import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, "..")
const outDir = join(repoRoot, "artifacts", "assessment-test")
const shotDir = join(outDir, "screenshots")
mkdirSync(shotDir, { recursive: true })

const args = process.argv.slice(2)
const getArg = (name, def) => {
  const hit = args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return def
  if (hit.includes("=")) return hit.split("=").slice(1).join("=")
  return true
}

const baseUrl = String(getArg("baseUrl", "http://localhost:3000")).replace(/\/$/, "")
const headless = Boolean(getArg("headless", false))
const slowMo = Number(getArg("slowMo", 50)) || 0

const consoleMessages = []
const pageErrors = []
const failedRequests = []
const apiResponses = []
const steps = []

function pushStep(name, status, extra = {}) {
  const at = new Date().toISOString()
  const ms = Date.now() - t0
  steps.push({ name, status, at, sinceStartMs: ms, ...extra })
  const icon = status === "pass" ? "✓" : status === "fail" ? "✗" : "•"
  // eslint-disable-next-line no-console
  console.log(`${icon} [+${(ms / 1000).toFixed(2)}s] ${name}${extra.note ? " — " + extra.note : ""}`)
}

async function shot(page, name) {
  const file = join(shotDir, `${String(steps.length).padStart(2, "0")}-${name}.png`)
  try {
    await page.screenshot({ path: file, fullPage: true })
    return file
  } catch (e) {
    return null
  }
}

const t0 = Date.now()
console.log(`[+0.00s] Launching browser (headless=${headless}, baseUrl=${baseUrl})`)

const browser = await chromium.launch({ headless, slowMo })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()

page.on("console", (msg) => {
  consoleMessages.push({
    type: msg.type(),
    text: msg.text(),
    location: msg.location(),
  })
})
page.on("pageerror", (err) => {
  pageErrors.push({ message: err.message, stack: err.stack })
})
page.on("requestfailed", (req) => {
  failedRequests.push({
    url: req.url(),
    method: req.method(),
    failure: req.failure()?.errorText,
  })
})
page.on("response", async (res) => {
  const url = res.url()
  if (!url.startsWith(baseUrl)) return
  if (!url.includes("/api/")) return
  apiResponses.push({
    url: url.replace(baseUrl, ""),
    method: res.request().method(),
    status: res.status(),
  })
})

let overallPass = true
let fatal = null

try {
  /* ───── Step 1 — Entry screen ───── */
  pushStep("Navigate to /assessment/?tier=paid", "info")
  const resp = await page.goto(`${baseUrl}/assessment/?tier=paid`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  })
  if (!resp || !resp.ok()) {
    throw new Error(`Initial navigation returned HTTP ${resp ? resp.status() : "no response"}`)
  }
  // Wait for the SPA to mount and the Begin button to appear.
  const beginBtn = page.getByRole("button", { name: /BEGIN MY ASSESSMENT/i })
  await beginBtn.waitFor({ timeout: 15000 })
  await shot(page, "entry-loaded")
  pushStep("Entry screen rendered", "pass")

  await page.getByLabel(/First name/i).fill("Test Sarah")
  await page.getByLabel(/^Age$/i).fill("48")
  await shot(page, "entry-filled")
  await beginBtn.click()
  pushStep("Submit entry form (firstName=Test Sarah, age=48)", "pass")

  /* ───── Step 2 — Staging screen ───── */
  const periBtn = page.getByRole("button", { name: /^Perimenopause/ })
  await periBtn.waitFor({ timeout: 10000 })
  await shot(page, "staging-loaded")
  pushStep("Staging screen rendered", "pass")

  await periBtn.click()
  await page.getByRole("button", { name: /No$/ }).first().click()
  await shot(page, "staging-filled")

  const continueBtn = page.getByRole("button", { name: /Continue/ })
  await continueBtn.click()
  pushStep("Staging submitted (Perimenopause, no MHT)", "pass")

  /* ───── Step 3 — Walk all 10 category screens ───── */
  for (let cat = 1; cat <= 10; cat++) {
    // Wait until we're on the category screen — look for the "CATEGORY N OF 10" pill.
    await page
      .getByText(new RegExp(`CATEGORY\\s+${cat}\\s+OF\\s+10`, "i"))
      .waitFor({ timeout: 15000 })

    // Set every range slider on this category to 5 (mid value). React uses a
    // controlled input, so we must go through the native setter and dispatch
    // an "input" event that React's synthetic system will pick up.
    const sliderCount = await page.$$eval('input[type="range"]', (els) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set
      els.forEach((el) => {
        setter.call(el, "5")
        el.dispatchEvent(new Event("input", { bubbles: true }))
        el.dispatchEvent(new Event("change", { bubbles: true }))
      })
      return els.length
    })

    await shot(page, `category-${String(cat).padStart(2, "0")}-answered`)

    if (cat < 10) {
      await page.getByRole("button", { name: /Next Category/ }).click()
      pushStep(`Category ${cat} answered (${sliderCount} sliders set to 5)`, "pass")
    } else {
      await page.getByRole("button", { name: /Generate My Report/ }).click()
      pushStep(`Category 10 answered (${sliderCount} sliders set to 5)`, "pass")
    }
  }

  /* ───── Step 4 — Loading screen ───── */
  await page
    .getByText(/Building your Health Intelligence/i)
    .waitFor({ timeout: 10000 })
  await shot(page, "loading-screen")
  pushStep("Loading screen rendered", "pass")

  /* ───── Step 5 — Report screen ───── */
  await page
    .getByText(/Health Intelligence Score/i)
    .waitFor({ timeout: 30000 })
  await shot(page, "report-screen")
  pushStep("Report screen rendered (Health Intelligence Score visible)", "pass")

  // Scroll through the report and snap a full-page shot for visual review.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(500)
  await shot(page, "report-bottom")
  await page.evaluate(() => window.scrollTo(0, 0))
} catch (err) {
  overallPass = false
  fatal = { message: err.message, stack: err.stack }
  pushStep(`Fatal error: ${err.message}`, "fail")
  try {
    await shot(page, "fatal-state")
  } catch {}
}

await ctx.close()
await browser.close()

/* ───── Reporting ───── */

const consoleErrors = consoleMessages.filter((m) => m.type === "error")
const consoleWarnings = consoleMessages.filter((m) => m.type === "warning")
const apiErrors = apiResponses.filter((r) => r.status >= 400)
const apiOk = apiResponses.filter((r) => r.status < 400)

// The /api/recommendations/* 401s are expected when running unauthenticated.
// Anything else >=400 is suspicious.
const EXPECTED_AUTH_GATED = /^\/api\/recommendations\/(affirmations|combined|products)/
const unexpectedApiErrors = apiErrors.filter(
  (r) => !(EXPECTED_AUTH_GATED.test(r.url) && (r.status === 401 || r.status === 403))
)

const summary = {
  pass: overallPass && pageErrors.length === 0 && unexpectedApiErrors.length === 0,
  baseUrl,
  durationMs: Date.now() - t0,
  steps,
  fatal,
  consoleErrors,
  consoleWarnings: consoleWarnings.slice(0, 50),
  pageErrors,
  failedRequests,
  apiResponses,
  apiErrors,
  unexpectedApiErrors,
  apiOkCount: apiOk.length,
}

writeFileSync(join(outDir, "report.json"), JSON.stringify(summary, null, 2))

const esc = (s) =>
  String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))

const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Assessment flow test report</title>
<style>
  body { font: 14px/1.5 system-ui, sans-serif; background:#fafafa; color:#222; max-width:1100px; margin:24px auto; padding:0 16px; }
  h1 { margin:0 0 8px; }
  .pill { display:inline-block; padding:2px 10px; border-radius:999px; font-weight:600; font-size:12px; }
  .pass { background:#d6f5dd; color:#0a6b22; }
  .fail { background:#fde2e2; color:#8a0a0a; }
  table { border-collapse: collapse; width:100%; margin:12px 0 24px; background:white; }
  th, td { border:1px solid #eee; padding:6px 10px; text-align:left; vertical-align:top; }
  th { background:#f3f3f3; }
  .step-pass td:first-child { color:#0a6b22; font-weight:600; }
  .step-fail td:first-child { color:#8a0a0a; font-weight:700; }
  pre { background:#f5f5f5; padding:8px; overflow:auto; border-radius:6px; }
  .shots { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:10px; }
  .shots a { display:block; border:1px solid #ddd; padding:4px; background:white; }
  .shots img { width:100%; display:block; }
</style></head><body>
<h1>Assessment flow test
  <span class="pill ${summary.pass ? "pass" : "fail"}">${summary.pass ? "PASS" : "FAIL"}</span>
</h1>
<p><b>Base URL:</b> ${esc(baseUrl)} &nbsp; <b>Duration:</b> ${(summary.durationMs / 1000).toFixed(2)}s</p>

${
  fatal
    ? `<h2>Fatal error</h2><pre>${esc(fatal.message)}\n\n${esc(fatal.stack || "")}</pre>`
    : ""
}

<h2>Steps</h2>
<table><thead><tr><th>Status</th><th>Step</th><th>At (s)</th></tr></thead><tbody>
${steps
  .map(
    (s) =>
      `<tr class="step-${s.status}"><td>${s.status.toUpperCase()}</td><td>${esc(
        s.name
      )}</td><td>${(s.sinceStartMs / 1000).toFixed(2)}</td></tr>`
  )
  .join("")}
</tbody></table>

<h2>API responses (${apiResponses.length})</h2>
<table><thead><tr><th>Method</th><th>URL</th><th>Status</th></tr></thead><tbody>
${apiResponses
  .map(
    (r) =>
      `<tr style="color:${r.status >= 400 ? "#8a0a0a" : "#222"}"><td>${esc(
        r.method
      )}</td><td><code>${esc(r.url)}</code></td><td>${r.status}</td></tr>`
  )
  .join("") || `<tr><td colspan="3"><i>none</i></td></tr>`}
</tbody></table>

<h2>Console errors (${consoleErrors.length})</h2>
${
  consoleErrors.length
    ? `<pre>${esc(consoleErrors.map((m) => m.text).join("\n"))}</pre>`
    : "<p><i>none</i></p>"
}

<h2>Page errors (${pageErrors.length})</h2>
${
  pageErrors.length
    ? `<pre>${esc(pageErrors.map((e) => e.message + "\n" + (e.stack || "")).join("\n\n"))}</pre>`
    : "<p><i>none</i></p>"
}

<h2>Failed network requests (${failedRequests.length})</h2>
${
  failedRequests.length
    ? `<pre>${esc(failedRequests.map((r) => `${r.method} ${r.url} — ${r.failure}`).join("\n"))}</pre>`
    : "<p><i>none</i></p>"
}

<h2>Unexpected API errors (${unexpectedApiErrors.length})</h2>
${
  unexpectedApiErrors.length
    ? `<pre>${esc(unexpectedApiErrors.map((r) => `${r.method} ${r.url} → ${r.status}`).join("\n"))}</pre>`
    : "<p><i>none — auth-gated 401s are expected when running unauthenticated</i></p>"
}

<h2>Screenshots</h2>
<div class="shots">
${steps
  .map((s, i) => {
    const name = `${String(i + 1).padStart(2, "0")}-${s.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}.png`
    return ""
  })
  .join("")}
</div>
<p>Screenshots are in <code>artifacts/assessment-test/screenshots/</code>.</p>

</body></html>`

writeFileSync(join(outDir, "report.html"), html)

console.log("")
console.log(`Wrote ${join(outDir, "report.json")}`)
console.log(`Wrote ${join(outDir, "report.html")}`)
console.log("")
if (summary.pass) {
  console.log("RESULT: PASS")
  process.exit(0)
} else {
  console.log("RESULT: FAIL")
  process.exit(1)
}
