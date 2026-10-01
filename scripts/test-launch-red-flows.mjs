import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = pathname.startsWith('/assessment/assets/')
      ? resolve(root, 'prds/dist/assets', pathname.slice('/assessment/assets/'.length))
      : pathname === '/assessment/' || pathname === '/assessment'
        ? resolve(root, 'prds/dist/index.html')
        : resolve(root, '.' + pathname);
    if (!path.startsWith(root + '/')) throw new Error('Invalid path');
    const body = await readFile(path);
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' })[extname(path)] || 'application/octet-stream');
    res.end(body);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

function check(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await page.goto(`${base}/free-assessment.html`);
  await page.getByRole('button', { name: /Get My Free Score/ }).click();
  await page.getByRole('button', { name: /Perimenopause/ }).click();
  await page.locator('#s1n').click();
  for (let i = 0; i < 12; i++) await page.locator(`#r${i} .op`).first().click();
  await page.locator('#bsub').click();
  await page.locator('#se-email').fill('launch-test@example.invalid');
  await page.locator('#se-zip').fill('10001');
  await page.route('**/api/free-score-lead', (route) => route.fulfill({
    status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Store unavailable' }),
  }));
  await page.locator('#se-go').click();
  await page.locator('#se-err').getByText('Store unavailable').waitFor();
  check(await page.locator('#se').evaluate((el) => el.classList.contains('on')), 'Free result appeared before storage confirmation');
  await page.unroute('**/api/free-score-lead');
  await page.route('**/api/free-score-lead', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, emailSent: false }),
  }));
  await page.locator('#se-go').click();
  await page.locator('#story').getByText(/no symptoms across these 12 questions/i).waitFor();
  check((await page.locator('#prodSection').innerText()).includes('did not identify a priority'), 'Zero-symptom product state is incorrect');

  await page.goto(`${base}/redesign-preview/assessment.html`);
  for (let i = 0; i < 8; i++) {
    await page.locator('#stage .opt').first().click();
    if (i === 2 || i === 6) await page.locator('#stage .q-foot button').click();
    else await page.waitForTimeout(260);
  }
  await page.locator('input[name=firstName]').fill('Taylor');
  await page.locator('input[name=email]').fill('launch-test@example.invalid');
  await page.route('**/api/preview-assessment', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }),
  }));
  await page.getByRole('button', { name: /Save and view my snapshot/ }).click();
  await page.getByRole('heading', { name: /Your appointment summary/ }).waitFor();
  check((await page.locator('#stage').innerText()).includes('Taylor'), 'Preview name missing from result');
  check((await page.locator('#stage').innerText()).includes('Age range'), 'Preview appointment summary missing');

  await page.goto(`${base}/redesign-preview/health-intelligence.html`);
  await page.locator('#hi-name').fill('Taylor');
  await page.locator('#hi-age').fill('48');
  await page.locator('#hi-email').fill('launch-test@example.invalid');
  await page.locator('#hi-state').selectOption('California');
  await page.locator('#hi-zip').fill('10001');
  await page.route('**/api/csrf', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ csrfToken: 'test-csrf' }) }));
  await page.route('**/api/assessment/intake-handoff', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, token: 'a'.repeat(64) }) }));
  await page.route('https://empresshealth.ai/assessment**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Member assessment</title>' }));
  await page.getByRole('button', { name: /Save details and continue/ }).click();
  await page.waitForURL('https://empresshealth.ai/assessment**');
  check(new URL(page.url()).searchParams.get('intake') === 'a'.repeat(64), 'Preview intake handoff token missing from redirect');

  const next = `/assessment?tier=paid&intake=${'a'.repeat(64)}`;
  await page.route('**/api/account', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    authenticated: false, tiers: [], billingConfigured: false, naturalsConfigured: false,
  }) }));
  await page.goto(`${base}/account.html?next=${encodeURIComponent(next)}`);
  check(await page.evaluate(() => sessionStorage.getItem('empress-assessment-next')) === next,
    'Account did not preserve the assessment handoff through sign-in and checkout');

  await page.route('**/api/assessment/intake-handoff?token=*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    ok: true, intake: { firstName: 'Taylor', age: 48, email: 'launch-test@example.invalid', usState: 'California', zip: '10001' },
  }) }));
  await page.goto(`${base}/assessment/?tier=paid&intake=${'a'.repeat(64)}`);
  await page.getByRole('heading', { name: /Taylor, where are you in your transition/ }).waitFor();
  check(!new URL(page.url()).searchParams.has('intake'), 'Handoff token was not removed from browser URL');
  console.log('PASS: free save gate, zero-symptom result, preview summary, intake handoff');
} finally {
  await browser.close();
  server.close();
}
