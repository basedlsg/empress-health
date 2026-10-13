import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, test } from 'node:test';
import { readdir, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

// Exercise real HTTP routes and browser controls while intercepting every
// delivery and storage write. Never use .env credentials or send a real email.
Object.assign(process.env, {
  VERCEL: '1', NODE_ENV: 'development', MOCK_LLM: '0', SESSION_SECRET: 'ask-empress-flow-test-only',
  DATABASE_URL: '', DB_HOST: '', DB_NAME: '', DB_USER: '', DB_PASSWORD: '',
  PINECONE_API_KEY: '', GOOGLE_API_KEY: '', SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '',
});
const require = createRequire(import.meta.url);
require('dotenv').config = () => ({ parsed: {} });
let modelFails = false;
let smtpReady = true;
let smtpFails = false;
let storageReady = true;
const emails = [];
const captures = [];
const modelPrompts = [];
require('../lib/ask-empress-model').callAskEmpressModel = async (system, question) => {
  if (modelFails) throw new Error('Test provider unavailable');
  modelPrompts.push(question);
  return system.includes('--- CLINICAL EVIDENCE ---')
    ? 'This test answer uses retrieved library passages. Discuss personal health decisions with your clinician.'
    : 'The Chapter Chasers could be fun. Would you like more ideas in a particular style?';
};
const sender = require('../lib/email-sender');
sender.getEmailDeliveryConfig = () => ({ smtpReady, sender: 'empresshealthtech@gmail.com', surface: 'smtp' });
sender.sendEmail = async (email) => {
  if (smtpFails) throw new Error('Test SMTP unavailable');
  emails.push(email);
  return { mode: 'smtp', messageId: 'intercepted-test-message' };
};
require('../lib/capture-store').captureEmail = async (capture) => {
  if (!storageReady) return false;
  captures.push(capture);
  return true;
};
const app = require('../server');
const server = await new Promise(resolve => {
  const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
});
const base = `http://127.0.0.1:${server.address().port}`;
after(() => new Promise(resolve => server.close(resolve)));

let cookie = '';
async function request(path, body, csrf) {
  const headers = { Cookie: cookie };
  if (body) headers['Content-Type'] = 'application/json';
  if (csrf) headers['X-CSRF-Token'] = csrf;
  const response = await fetch(base + path, { method: body ? 'POST' : 'GET', headers, body: body ? JSON.stringify(body) : undefined });
  const session = response.headers.getSetCookie().find(value => value.startsWith('connect.sid='));
  if (session) cookie = session.split(';')[0];
  return { status: response.status, body: await response.json() };
}

test('email delivers the server-owned answer and full matching article with consent capture', async () => {
  const answer = await request('/qa', { query: 'What causes skin changes during perimenopause?' });
  assert.equal(answer.status, 200);
  assert.ok(answer.body.blog && answer.body.emailToken);
  assert.equal(answer.body.products[0].category, 'skin');
  const next = await request('/qa', { query: 'What causes hot flashes?' });
  assert.equal(next.body.blog, null);
  assert.equal(next.body.products.length, 6, 'Products must not depend on a blog match');
  const csrf = (await request('/api/csrf')).body.csrfToken;
  const payload = { email: 'flow-test@example.invalid', answerToken: answer.body.emailToken, blogSlug: answer.body.blog.slug, answer: 'Forged client answer' };
  assert.equal((await request('/api/ask-empress/email-answer', payload)).status, 403);
  assert.equal((await request('/api/ask-empress/email-answer', { ...payload, answerToken: 'forged' }, csrf)).status, 400);
  const sent = await request('/api/ask-empress/email-answer', payload, csrf);
  assert.equal(sent.status, 200, 'Asking a second question must not expire the first email form');
  assert.equal(emails.length, 1);
  assert.ok(emails[0].text.includes(answer.body.answer));
  assert.ok(emails[0].text.includes(answer.body.blog.url));
  assert.ok(emails[0].text.length > 3000, 'Email must include the guide, not just a link');
  assert.ok(!emails[0].text.includes('Forged client answer'));
  assert.ok(!emails[0].html.includes('<script'));
  assert.equal(captures[0].source, 'ask-empress-answer');
  assert.equal(captures[0].context.consent, 'requested-answer-email');
  assert.equal((await request('/api/ask-empress/email-answer', payload, csrf)).status, 400, 'Token is consumed after success');
  const copyOnly = await request('/api/ask-empress/email-answer', { email: 'flow-test@example.invalid', answerToken: next.body.emailToken, blogSlug: '' }, csrf);
  assert.equal(copyOnly.status, 200, 'Questions without a guide can still be emailed');
});

test('delivery, storage and model failures cannot report false success', async () => {
  const answer = (await request('/qa', { query: 'Why do I get night sweats?' })).body;
  const csrf = (await request('/api/csrf')).body.csrfToken;
  const payload = { email: 'flow-test@example.invalid', answerToken: answer.emailToken, blogSlug: '' };
  const initialEmails = emails.length;
  const initialCaptures = captures.length;
  smtpReady = false;
  assert.equal((await request('/api/ask-empress/email-answer', payload, csrf)).status, 503);
  assert.equal(captures.length, initialCaptures + 1, 'A valid email opt-in must be saved even when SMTP is unavailable');
  smtpReady = true;
  storageReady = false;
  assert.equal((await request('/api/ask-empress/email-answer', payload, csrf)).status, 503);
  storageReady = true;
  smtpFails = true;
  assert.equal((await request('/api/ask-empress/email-answer', payload, csrf)).status, 503);
  smtpFails = false;
  assert.equal(emails.length, initialEmails);
  modelFails = true;
  const failed = await request('/qa', { query: 'Why do I get night sweats?' });
  modelFails = false;
  assert.equal(failed.status, 503);
  assert.equal(failed.body.emailToken, null);
  assert.deepEqual(failed.body.products, []);
  const noEvidence = await request('/qa', { query: 'zzzzzzzzzz' });
  assert.equal(noEvidence.body.status, 'no_evidence');
  assert.equal(noEvidence.body.emailToken, null);
  assert.deepEqual(noEvidence.body.products, []);
});

test('anonymous history endpoints cannot save or read an account conversation', async () => {
  const state = await request('/api/ask-empress/history');
  assert.equal(state.body.authenticated, false);
  assert.deepEqual(state.body.history, []);
  const csrf = (await request('/api/csrf')).body.csrfToken;
  const response = await fetch(base + '/api/ask-empress/history', { method: 'PUT', headers: { Cookie: cookie, 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify({ userId: 999, remember: true, history: [{ question: 'Question', answer: 'Answer' }] }) });
  assert.equal(response.status, 401);
});

test('greeting responds warmly without fabricating sources or product recommendations', async () => {
  const before = modelPrompts.length;
  const greeting = await request('/qa', { query: 'Hello -- testing' });
  assert.equal(greeting.status, 200);
  assert.equal(greeting.body.status, 'conversation');
  assert.match(greeting.body.answer, /Hello/);
  assert.match(greeting.body.answer, /Ask Empress/);
  assert.equal(greeting.body.emailToken, null);
  assert.deepEqual(greeting.body.sources, []);
  assert.deepEqual(greeting.body.products, []);
  assert.equal(modelPrompts.length, before);
});

test('general requests get a real chat response without irrelevant product or email actions', async () => {
  const conversation = await request('/qa', { query: 'Can you suggest a whimsical name for my neighborhood book club?' });
  assert.equal(conversation.status, 200);
  assert.equal(conversation.body.status, 'general');
  assert.match(conversation.body.answer, /Chapter Chasers/);
  assert.deepEqual(conversation.body.sources, []);
  assert.equal(conversation.body.blog, null);
  assert.equal(conversation.body.emailToken, null);
  assert.deepEqual(conversation.body.products, []);
});

test('browser email, carousel, memory, clear and mobile layouts work together', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 1100 } });
  await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(base + '/ask-empress');
    assert.equal(await page.locator('#ask-empress-shortcut').getAttribute('href'), '/ask-empress');
    assert.match(await page.locator('.phone-avatar img').getAttribute('src'), /logo\.png$/);
    assert.match(await page.locator('#ask-empress-shortcut img').getAttribute('src'), /logo\.png$/);
    assert.equal(await page.locator('#ask-remember').isChecked(), false);
    await page.locator('#ask-question').fill('What causes skin changes during perimenopause?');
    await page.locator('#ask-send').click();
    await page.locator('.ask-email-form').waitFor();
    assert.equal(await page.locator('.ask-save-prompt').textContent(), 'Want to keep this? Get a copy of this answer, plus a deeper guide on what can help, sent to your inbox');
    assert.equal(await page.locator('.ask-product').count(), 6);
    await page.locator('#ask-empress-shortcut').click();
    assert.equal(await page.locator('#ask-messages .bubble').count(), 3, 'Shortcut must preserve the current chat');
    assert.equal(await page.locator('#ask-question').evaluate(input => input === document.activeElement), true);
    assert.equal(await page.evaluate(() => localStorage.getItem('empress.ask.chat.v1')), null);
    await page.getByRole('button', { name: 'Next products', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.ask-product-track').scrollLeft > 0);
    assert.ok(await page.locator('.ask-product img').first().evaluate(img => img.complete && img.naturalWidth > 0));
    await page.locator('.ask-email-form input').fill('browser-test@example.invalid');
    smtpReady = false;
    await page.locator('.ask-email-form button').click();
    await page.getByText('Email delivery is temporarily unavailable. Please try again later.', { exact: true }).waitFor();
    assert.equal(await page.locator('.ask-email-form button').isDisabled(), false);
    smtpReady = true;
    await page.locator('.ask-email-form button').click();
    await page.getByText('Your answer and guide are on their way to your inbox.', { exact: true }).waitFor();
    await page.locator('#ask-remember').check();
    await page.reload();
    await page.getByText('Your saved chat is ready.', { exact: false }).waitFor();
    assert.ok((await page.locator('#ask-messages').innerText()).includes('skin changes'));
    await page.locator('#ask-question').fill('What can help with that?');
    await page.locator('#ask-send').click();
    await page.locator('.ask-email-form').waitFor();
    assert.match(modelPrompts.at(-1), /skin changes/);
    assert.match(modelPrompts.at(-1), /What can help with that/);
    await mkdir('artifacts/ask-empress-checklist', { recursive: true });
    await page.locator('.ask-phone').screenshot({ path: 'artifacts/ask-empress-checklist/desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Page must not overflow horizontally on mobile');
    const phoneBounds = await page.locator('.ask-phone').boundingBox();
    assert.ok(phoneBounds.x >= 0 && phoneBounds.x + phoneBounds.width <= 390, 'The complete chat must fit inside the mobile viewport');
    await page.locator('.ask-phone').screenshot({ path: 'artifacts/ask-empress-checklist/mobile.png' });
    await page.locator('#ask-clear').click();
    assert.equal(await page.locator('#ask-messages .bubble').count(), 1);
    assert.equal(await page.locator('.ask-product').count(), 0);
    await page.reload();
    assert.equal(await page.locator('#ask-messages .bubble').count(), 1);
    await page.locator('#ask-remember').uncheck();
    assert.equal(await page.evaluate(() => localStorage.getItem('empress.ask.chat.v1')), null);
    await page.evaluate(() => localStorage.setItem('empress.ask.chat.v1', JSON.stringify({ savedAt: Date.now() - 31 * 86400000, exchanges: [{ question: 'Expired chat', answer: 'Old answer' }] })));
    await page.reload();
    assert.equal(await page.locator('#ask-remember').isChecked(), false);
    assert.equal(await page.evaluate(() => localStorage.getItem('empress.ask.chat.v1')), null);
    for (const path of ['/index.html', '/account.html', '/marketplace.html', '/free-assessment.html', '/pages/community.html', '/askempress.html']) {
      await page.goto(base + path);
      await page.locator('#ask-empress-shortcut').waitFor();
      assert.equal(await page.locator('#ask-empress-shortcut').count(), 1);
      assert.equal(await page.locator('#ask-empress-shortcut').getAttribute('href'), '/ask-empress');
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});

test('homepage product carousel renders on desktop and mobile with working controls', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(base + '/index.html');
    const section = page.locator('#homepage-marketplace');
    const track = page.locator('#featured-products');
    await section.scrollIntoViewIfNeeded();
    assert.equal(await section.locator('.product-card').count(), 5);
    await page.waitForFunction(() => [...document.querySelectorAll('#featured-products img')].every(img => img.complete && img.naturalWidth > 0));
    assert.equal(await section.locator('[data-carousel-prev]').isDisabled(), true);
    await section.locator('[data-carousel-next]').click();
    await page.waitForFunction(() => document.querySelector('#featured-products').scrollLeft > 10);
    await page.waitForFunction(() => document.querySelector('[data-carousel-next]').disabled);
    assert.equal(await section.locator('[data-carousel-prev]').isDisabled(), false);
    await section.locator('[data-carousel-prev]').click();
    await page.waitForFunction(() => document.querySelector('#featured-products').scrollLeft <= 2.5);
    await track.focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('#featured-products').scrollLeft > 10);
    await page.waitForFunction(() => document.querySelector('[data-carousel-next]').disabled);
    await mkdir('artifacts/red-checklist', { recursive: true });
    await track.evaluate(el => el.blur());
    await section.locator('[data-carousel-prev]').click();
    await page.waitForFunction(() => document.querySelector('[data-carousel-prev]').disabled);
    await section.screenshot({ path: 'artifacts/red-checklist/homepage-carousel-desktop.png', animations: 'disabled', style: '#site-header{visibility:hidden}' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await section.scrollIntoViewIfNeeded();
    await page.locator('#nav').waitFor({ state: 'hidden' });
    await page.waitForFunction(() => [...document.querySelectorAll('#featured-products img')].every(img => img.complete && img.naturalWidth > 0));
    await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth + 1);
    await section.screenshot({ path: 'artifacts/red-checklist/homepage-carousel-mobile.png', animations: 'disabled', style: '#site-header{visibility:hidden}' });
    await section.locator('[data-carousel-next]').click();
    await page.waitForFunction(() => document.querySelector('#featured-products').scrollLeft > 100);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

test('signed-in browser memory restores account history and clears it without uploading guest history', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  let history = [];
  let remember = false;
  const writes = [];
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== base) return route.abort();
    if (url.pathname !== '/api/ask-empress/history') return route.continue();
    if (request.method() === 'PUT') {
      const body = request.postDataJSON();
      assert.ok(request.headers()['x-csrf-token']);
      writes.push(body);
      remember = body.remember;
      history = remember ? body.history : [];
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({ json: { authenticated: true, remember, history } });
  });
  const page = await context.newPage();
  try {
    await page.goto(base + '/ask-empress');
    await page.evaluate(() => localStorage.setItem('empress.ask.chat.v1', JSON.stringify({ savedAt: Date.now(), exchanges: [{ question: 'Guest conversation', answer: 'Private guest answer' }] })));
    await page.reload();
    await page.getByText('Remember this chat in my account', { exact: true }).waitFor();
    assert.equal(await page.locator('#ask-remember').isChecked(), false);
    assert.equal(await page.locator('#ask-messages').getByText('Guest conversation', { exact: true }).count(), 0);
    assert.equal(writes.length, 0);
    await page.locator('#ask-remember').check();
    await page.waitForFunction(() => !document.querySelector('#ask-send').disabled);
    await page.locator('#ask-question').fill('Hello -- testing');
    await page.locator('#ask-send').click();
    await page.waitForFunction(() => document.querySelector('#ask-question').value === '' && !document.querySelector('#ask-send').disabled);
    assert.equal(history.length, 1);
    assert.equal(history[0].question, 'Hello -- testing');
    assert.equal(writes.some(body => body.history.some(entry => entry.question === 'Guest conversation')), false);
    const otherDevice = await context.newPage();
    await otherDevice.goto(base + '/ask-empress');
    await otherDevice.getByText('Your saved chat is ready.', { exact: false }).waitFor();
    assert.equal(await otherDevice.locator('#ask-remember').isChecked(), true);
    assert.match(await otherDevice.locator('#ask-messages').innerText(), /Hello -- testing/);
    const cleared = otherDevice.waitForResponse(response => response.url().endsWith('/api/ask-empress/history') && response.request().method() === 'PUT');
    await otherDevice.locator('#ask-clear').click();
    await cleared;
    await otherDevice.waitForFunction(() => document.querySelector('#ask-status').textContent === 'Chat cleared.');
    await otherDevice.reload();
    await otherDevice.getByText('Remember this chat in my account', { exact: true }).waitFor();
    assert.equal(await otherDevice.locator('#ask-messages .bubble').count(), 1);
    const disabled = otherDevice.waitForResponse(response => response.url().endsWith('/api/ask-empress/history') && response.request().method() === 'PUT');
    await otherDevice.locator('#ask-remember').uncheck();
    await disabled;
    await otherDevice.reload();
    await otherDevice.getByText('Remember this chat in my account', { exact: true }).waitFor();
    assert.equal(await otherDevice.locator('#ask-remember').isChecked(), false);
  } finally { await browser.close(); }
});

test('saved full assessment restores names and results without emailing again', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const sample = require('../lib/report-sample-state').buildSampleState();
  sample.user.email = 'restore-test@example.invalid';
  let reportEmailAttempts = 0;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== base) return route.abort();
    if (url.pathname === '/assessment/') return route.fulfill({ contentType: 'text/html', body: await readFile('prds/dist/index.html', 'utf8') });
    if (url.pathname.startsWith('/assessment/assets/')) {
      const name = url.pathname.split('/').at(-1);
      return route.fulfill({ path: join('prds/dist/assets', name), contentType: name.endsWith('.js') ? 'text/javascript' : 'text/css' });
    }
    if (url.pathname === '/api/account') return route.fulfill({ json: { authenticated: true, user: sample.user, tier: 'essential', giftClaimed: false } });
    if (url.pathname === '/api/account/continuity') return route.fulfill({ json: {
      authenticated: true, assessment: { kind: 'paid-120', user: sample.user, stage: sample.stage, responses: sample.responses, completedAt: sample.completedAt,
        scores: { mhtActive: sample.mhtActive, apiResult: sample.apiResult } },
    } });
    if (url.pathname === '/api/assessment/report-email') { reportEmailAttempts++; return route.fulfill({ json: { ok: true } }); }
    return route.continue();
  });
  try {
    await page.goto(base + '/assessment/?tier=paid&restore=latest');
    await page.getByText('Maya Patel', { exact: false }).first().waitFor();
    await page.getByText('Thank You, Maya', { exact: false }).waitFor();
    assert.match(await page.locator('body').innerText(), /Your Peri \+ Menopause/);
    assert.match(await page.locator('body').innerText(), /Health Intelligence/);
    assert.equal(new URL(page.url()).searchParams.has('restore'), false);
    assert.equal(reportEmailAttempts, 0, 'Restoring results must not resend the report email');
    await page.getByRole('button', { name: /retake/i }).click();
    await page.getByLabel('First name', { exact: true }).waitFor();
    assert.equal(reportEmailAttempts, 0);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

test('all published HTML pages and the assessment include the site shortcut', async () => {
  const entries = await readdir('public', { recursive: true, withFileTypes: true });
  let checked = 0;
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const path = join(entry.parentPath || entry.path, entry.name);
    const html = await readFile(path, 'utf8');
    assert.ok(html.includes('src="/site-email-capture.js"'), path);
    checked++;
  }
  assert.ok(checked > 60);
  assert.ok((await readFile('prds/dist/index.html', 'utf8')).includes('src="/site-email-capture.js"'));
  assert.equal(await readFile('public/askempress.html', 'utf8'), await readFile('public/ask-empress.html', 'utf8'));
  console.log(`Verified shortcut inclusion on ${checked} published HTML pages and the assessment.`);
});
