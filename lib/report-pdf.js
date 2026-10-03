'use strict';

/**
 * lib/report-pdf.js — render the member's full Health Intelligence Report
 * (the same React report they see on screen, ~33 pages) to a PDF buffer so it
 * can be attached to the results email.
 *
 * How it works: headless Chromium opens the assessment SPA, the SPA is served
 * straight from prds/dist on disk (no network round-trip, no membership gate),
 * and the member's saved answers + recommendation payload are injected as
 * window.__EMPRESS_PRINT_STATE__. The SPA seeds itself from that and renders
 * the report screen, which already carries the print stylesheet. Everything
 * else (hero photos, logo) loads from the public site as usual.
 *
 * Browser: Playwright's bundled Chromium in development; @sparticuz/chromium
 * (a Chromium build sized for serverless) on Vercel/Lambda.
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'prds', 'dist');
const ASSET_TYPES = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.map': 'application/json',
};
const FONT_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);

// The section hero photos are ~3 MB each (300 dpi). Embedded as-is they make a
// 26 MB PDF — too big to email. public/report-heroes/print/ holds 150 dpi
// copies (≈300 KB each); the emailed PDF swaps them in. Originals are untouched.
const PRINT_IMAGES = require('./report-print-images.json');

// Email copies are read on phones and by readers who asked for bigger type, so
// the attached PDF is rendered ~20% larger than the print-at-home layout.
const LARGE_TYPE_SCALE = 1.2;

// Each render holds a Chromium (~300-500 MB). Past this many at once on one
// instance, callers get an error and fall back to the email without a PDF.
const MAX_CONCURRENT_RENDERS = 2;
let activeRenders = 0;

const isServerless = () => Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

async function launchBrowser() {
  const { chromium } = require('playwright-core');
  if (isServerless()) {
    // @sparticuz/chromium is ESM-only, hence the dynamic import from CJS.
    const { default: sparticuz } = await import('@sparticuz/chromium');
    return chromium.launch({
      args: sparticuz.args,
      executablePath: await sparticuz.executablePath(),
      headless: true,
    });
  }
  return chromium.launch({ headless: true, args: ['--disable-dev-shm-usage', '--no-sandbox'] });
}

function assetResponse(pathname) {
  const rel = pathname.replace(/^\/assessment\/assets\//, '');
  const file = path.resolve(DIST_DIR, 'assets', rel);
  // Never serve outside prds/dist/assets (path traversal).
  if (!file.startsWith(path.join(DIST_DIR, 'assets') + path.sep)) return null;
  if (!fs.existsSync(file)) return null;
  return {
    status: 200,
    contentType: ASSET_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
    body: fs.readFileSync(file),
  };
}

/**
 * @param {object} opts
 * @param {object} opts.state       PrintRenderState (see prds/printMode.ts)
 * @param {string} opts.siteOrigin  e.g. "https://empresshealth.ai" — where images are fetched from
 * @param {boolean} [opts.largeType=true]
 * @param {number} [opts.timeoutMs=45000]
 * @returns {Promise<{ pdf: Buffer, pages: number, ms: number }>}
 */
async function renderReportPdf({ state, siteOrigin, largeType = true, timeoutMs = 45_000 }) {
  if (!state || typeof state !== 'object') throw new Error('renderReportPdf: state is required');
  if (!siteOrigin) throw new Error('renderReportPdf: siteOrigin is required');
  const indexFile = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexFile)) throw new Error('renderReportPdf: assessment build (prds/dist) is missing');

  if (activeRenders >= MAX_CONCURRENT_RENDERS) throw new Error('renderReportPdf: too many renders in progress');
  activeRenders += 1;
  try {
    return await renderOnce({ state, siteOrigin, largeType, timeoutMs, indexFile });
  } finally {
    activeRenders -= 1;
  }
}

async function renderOnce({ state, siteOrigin, largeType, timeoutMs, indexFile }) {
  const started = Date.now();
  const origin = new URL(siteOrigin).origin;
  const scale = largeType ? LARGE_TYPE_SCALE : 1;
  const browser = await launchBrowser();

  try {
    const context = await browser.newContext({
      viewport: { width: 1000, height: 1400 },
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
    });
    await context.addInitScript((printState) => {
      window.__EMPRESS_PRINT_STATE__ = printState;
    }, state);

    const page = await context.newPage();
    page.setDefaultTimeout(timeoutMs);

    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) {
        // Only web fonts may leave the box; nothing else needs the network.
        return FONT_HOSTS.has(url.hostname) ? route.continue() : route.abort();
      }
      if (url.pathname === '/assessment' || url.pathname === '/assessment/') {
        return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: fs.readFileSync(indexFile) });
      }
      if (url.pathname.startsWith('/assessment/assets/')) {
        const asset = assetResponse(url.pathname);
        return asset ? route.fulfill(asset) : route.fulfill({ status: 404, body: 'not found' });
      }
      // The report never needs the API in print mode (and must stay hermetic).
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 204, body: '' });
      const hero = /^\/report-heroes\/([^/]+)$/.exec(url.pathname);
      if (hero && PRINT_IMAGES[hero[1]]) {
        return route.continue({ url: `${origin}/report-heroes/print/${PRINT_IMAGES[hero[1]]}` });
      }
      return route.continue();
    });

    await page.goto(`${origin}/assessment/?tier=paid&print=1`, { waitUntil: 'load' });
    await page.waitForSelector('[data-empress-report="ready"]');

    // Hero photos and web fonts must be decoded before printing, otherwise the
    // PDF gets blank rectangles / fallback type.
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
              }),
        ),
      );
    });

    if (scale !== 1) {
      // Chromium scales the whole page; the cover/thank-you pages have fixed
      // millimetre heights that must shrink by the same factor to still fit.
      await page.addStyleTag({
        content: `@media print {
          .empress-cover, .empress-thankyou { height: calc(240mm / ${scale}) !important; }
          .empress-thankyou img { max-height: calc(232mm / ${scale}) !important; }
        }`,
      });
    }

    // Interactive-only blocks (feedback boxes, claim forms) cannot work in a PDF.
    await page.evaluate(() => document.documentElement.classList.add('empress-emailed-pdf'));
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      scale,
    });

    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    const ms = Date.now() - started;
    console.log(`[report-pdf] rendered ${pages} pages, ${pdf.length} bytes in ${ms}ms (scale ${scale})`);
    return { pdf, pages, ms };
  } finally {
    await browser.close();
  }
}

module.exports = { renderReportPdf, LARGE_TYPE_SCALE };
