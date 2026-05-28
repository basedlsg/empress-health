/**
 * Empress Health — Paid Report PDF Generator (B2 deliverable)
 *
 * Renders /assessment/?tier=paid in a headless Chromium and returns a
 * print-faithful PDF buffer. Reuses the existing AssessmentReportScreen
 * (which already has print CSS) so the on-screen layout and the downloaded
 * PDF stay byte-aligned forever.
 *
 * Why Playwright instead of pdf-lib / docx?
 *   - The screen and the PDF are visually identical by construction —
 *     we render the same React tree.
 *   - The team's "make all reports look like this" template is a paged
 *     print of this exact URL, so reproducing it in any other engine
 *     means rebuilding 3,100 lines of layout twice. Not worth it.
 *
 * The route in server.js authenticates the user and either:
 *   (a) opens the URL with the user's session cookie attached, or
 *   (b) passes a short-lived signed token query param that the report
 *       screen can validate (recommended for cross-domain Playwright).
 *
 * Image hero assets live in /public/report-heroes/ and are loaded as
 * relative URLs — Playwright's networkidle wait ensures they finish
 * loading before page.pdf() snapshots the layout.
 *
 * Usage:
 *   const { generatePaidReportPdf } = require("./lib/reportPdfGenerator");
 *   const pdfBuf = await generatePaidReportPdf({
 *     baseUrl: "http://localhost:3000",
 *     sessionCookie: req.headers.cookie,  // pass-through user session
 *     userId: req.session.userId,
 *   });
 *
 * Returns: Buffer (raw PDF bytes, A4)
 */

const { chromium } = require("playwright");

/**
 * @param {object} opts
 * @param {string} opts.baseUrl       - e.g. "http://localhost:3000"
 * @param {string} [opts.sessionCookie] - Full cookie header string from the user's request
 * @param {string} [opts.userId]      - For logging / filename only
 * @param {number} [opts.timeoutMs]   - Default 60s; the paid report is heavy
 * @returns {Promise<Buffer>}
 */
async function generatePaidReportPdf({
  baseUrl,
  sessionCookie,
  userId = "anonymous",
  timeoutMs = 60_000,
} = {}) {
  if (!baseUrl) throw new Error("generatePaidReportPdf: baseUrl is required");

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox"],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1800 },
      deviceScaleFactor: 2, // Sharp hero photos in the PDF
      reducedMotion: "reduce",
    });

    // Forward the user's session so the assessment page can fetch their
    // stored responses, affirmations, and clinician matches.
    if (sessionCookie) {
      const url = new URL(baseUrl);
      // Parse "key=value; key2=value2" into Playwright cookie objects.
      const cookies = sessionCookie
        .split(";")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((pair) => {
          const eq = pair.indexOf("=");
          if (eq < 0) return null;
          return {
            name: pair.slice(0, eq).trim(),
            value: pair.slice(eq + 1).trim(),
            domain: url.hostname,
            path: "/",
            httpOnly: false,
            secure: url.protocol === "https:",
            sameSite: "Lax",
          };
        })
        .filter(Boolean);
      if (cookies.length) await context.addCookies(cookies);
    }

    const page = await context.newPage();
    page.setDefaultTimeout(timeoutMs);

    // The report page must end up with all hero images decoded before we
    // snapshot — otherwise the PDF gets blank rectangles where photos
    // should be. networkidle waits for the last network roundtrip.
    const reportUrl = `${baseUrl.replace(/\/$/, "")}/assessment/?tier=paid&print=1`;
    await page.goto(reportUrl, { waitUntil: "networkidle" });

    // Belt-and-braces: wait for any explicit "report ready" marker the
    // screen sets. AssessmentReportScreen renders an `.empress-report-page`
    // wrapper after the API result loads.
    await page.waitForSelector(".empress-report-page, .empress-report-section", {
      timeout: timeoutMs,
    });

    // Ensure all section hero photos in /public/report-heroes/ have finished
    // loading or hit their onError fallback before we print. Browsers can
    // also leave decoded images in a stale layout state for a tick.
    await page.evaluate(async () => {
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              }),
        ),
      );
    });

    // Trigger @media print so the cream-and-burgundy theme prints
    // exactly as designed (some browsers strip backgrounds otherwise).
    await page.emulateMedia({ media: "print" });

    // Tighter margins for the continuous-flow report. The print CSS in
    // AssessmentReportScreen.tsx has eliminated forced page-breaks between
    // sections, so reducing the outer margin lets the content breathe
    // without inserting visible gaps.
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "8mm", right: "10mm", bottom: "8mm", left: "10mm" },
    });

    console.log(
      `[report-pdf] generated paid report PDF for user=${userId}, bytes=${pdfBuffer.length}`,
    );
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generatePaidReportPdf };
