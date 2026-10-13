#!/usr/bin/env node
"use strict";

// Real HTTP integration test for /api/free-score-lead. Postgres is replaced by
// an in-memory fake pool, notify is suppressed, and SMTP is replaced by a
// function that can succeed or fail. This test cannot send email or touch DB.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

for (const key of [
  "DATABASE_URL", "DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD", "DB_PORT", "DB_SSL",
  "PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD", "PGPORT",
  "SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "SMTP_PORT",
  "ZAPIER_CONTACT_WEBHOOK_URL",
]) process.env[key] = "";
process.env.NODE_ENV = "development";
process.env.SESSION_SECRET = "isolated-test-session-secret";
process.env.VERCEL = "1";
process.env.MOCK_LLM = "1";

const require = createRequire(import.meta.url);
// Prevent server.js from reading project .env at all; the HTTP test uses only
// its own safe process.env values and injected adapters.
require("dotenv").config = () => ({ parsed: {} });
const captureStore = require("../lib/capture-store");
const emailSender = require("../lib/email-sender");
const notify = require("../lib/notify");
const dailyAffirmations = require("../lib/daily-affirmations");

const storedEmails = [];
const storedSubmissions = [];
const storedContacts = [];
let failDbWrites = false;
let mailMode = "smtp";
const sent = [];
const subscriptions = [];
const fakePool = {
  async query(sql, values = []) {
    const statement = String(sql);
    if (/INSERT INTO email_captures/i.test(statement)) {
      if (failDbWrites) throw new Error("intercepted database write failure");
      storedEmails.push({ email: values[0], firstName: values[1], lastName: values[2], source: values[3], context: values[5] });
      return { rows: [], rowCount: 1 };
    }
    if (/INSERT INTO assessment_submissions/i.test(statement)) {
      if (failDbWrites) throw new Error("intercepted database write failure");
      storedSubmissions.push({
        kind: values[0], email: values[1], firstName: values[2], lastName: values[3],
        stage: values[5], score: values[6], band: values[7], scores: values[8], responses: values[9],
      });
      return { rows: [{ id: storedSubmissions.length }], rowCount: 1 };
    }
    if (/INSERT INTO contact_messages/i.test(statement)) {
      if (failDbWrites) throw new Error("intercepted database write failure");
      storedContacts.push(values);
      return { rows: [{ id: storedContacts.length }], rowCount: 1 };
    }
    if (/SELECT/i.test(statement)) return { rows: [], rowCount: 0 };
    return { rows: [], rowCount: 0 };
  },
};

notify.notify = async () => ({ filepath: null });
emailSender.sendEmail = async (message) => {
  sent.push(message);
  if (mailMode === "throw") throw new Error("intercepted SMTP failure");
  return { mode: mailMode, messageId: "intercepted-test-id" };
};
emailSender.getEmailDeliveryConfig = () => ({ smtpReady: true, sender: "empresshealthtech@gmail.com", surface: "smtp" });
dailyAffirmations.subscribe = async (profile) => {
  subscriptions.push(profile);
  return { subscriberId: "intercepted-subscriber", nextSendAt: "2030-01-01T00:00:00.000Z" };
};

const app = require("../server");
// server.js initializes this module with its process pool (null in this test),
// so replace that provider after module initialization with our in-memory pool.
captureStore.configure({ getPool: () => fakePool });
const server = createServer(app);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const answers = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
const request = (email) => fetch(`${base}/api/free-score-lead`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email,
    firstName: "Riley",
    lastName: "Nguyen",
    stage: "perimenopause",
    his: 72,
    gcs: 18,
    responses: answers,
    report: { domains: [{ name: "Sleep", score: 72, band: "Managing" }] },
  }),
});
async function csrfHeaders() {
  const response = await fetch(`${base}/api/csrf`);
  assert.equal(response.status, 200);
  const cookies = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie") || ""];
  const cookieHeader = cookies.map((cookie) => cookie.split(";")[0]).filter(Boolean).join("; ");
  const csrfCookie = cookies.map((cookie) => cookie.split(";")[0]).find((cookie) => cookie.startsWith("csrf_token="));
  assert.ok(csrfCookie);
  return { Cookie: cookieHeader, "X-CSRF-Token": csrfCookie.slice("csrf_token=".length), Authorization: "Bearer intercepted-test-token" };
}

try {
  mailMode = "smtp";
  const successResponse = await request("riley-success@example.test");
  const success = await successResponse.json();
  assert.equal(successResponse.status, 200);
  assert.deepEqual(success, { ok: true, emailSent: true });
  assert.equal(storedEmails[0].email, "riley-success@example.test");
  assert.equal(storedEmails[0].firstName, "Riley");
  assert.equal(storedEmails[0].lastName, "Nguyen");
  assert.equal(storedSubmissions[0].email, storedEmails[0].email);
  assert.equal(storedSubmissions[0].firstName, "Riley");
  assert.equal(storedSubmissions[0].lastName, "Nguyen");
  assert.deepEqual(JSON.parse(storedSubmissions[0].responses), answers);
  assert.equal(sent[0].to, "riley-success@example.test");

  mailMode = "throw";
  const failureResponse = await request("riley-mail-failure@example.test");
  const failure = await failureResponse.json();
  assert.equal(failureResponse.status, 200);
  assert.deepEqual(failure, { ok: true, emailSent: false });
  assert.ok(storedEmails.some((row) => row.email === "riley-mail-failure@example.test"));
  assert.ok(storedSubmissions.some((row) => row.email === "riley-mail-failure@example.test"));

  const invalid = await fetch(`${base}/api/free-score-lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "riley-invalid@example.test", responses: [0, 1] }),
  });
  assert.equal(invalid.status, 400);
  assert.equal(storedEmails.length, 2);
  assert.equal(sent.length, 2);

  failDbWrites = true;
  const beforeEmailWrites = storedEmails.length;
  const beforeSubmissions = storedSubmissions.length;
  const dbFailureResponse = await request("riley-store-failure@example.test");
  const dbFailure = await dbFailureResponse.json();
  assert.equal(dbFailureResponse.status, 503);
  assert.equal(dbFailure.ok, false);
  assert.equal(storedEmails.length, beforeEmailWrites);
  assert.equal(storedSubmissions.length, beforeSubmissions);
  assert.equal(sent.length, 2, "SMTP must not run when durable persistence fails");

  failDbWrites = true;
  const authHeaders = await csrfHeaders();
  const blockedSubscriptionResponse = await fetch(`${base}/api/affirmations/subscribe`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "member@example.test", profile: { name: "Member" } }),
  });
  assert.equal(blockedSubscriptionResponse.status, 503);
  assert.equal(subscriptions.length, 0, "subscription must not be acknowledged before email persistence");

  failDbWrites = false;
  const savedSubscriptionResponse = await fetch(`${base}/api/affirmations/subscribe`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "Member@example.test", profile: { name: "Member" } }),
  });
  assert.equal(savedSubscriptionResponse.status, 200);
  assert.equal(subscriptions.length, 1);
  assert.equal(subscriptions[0].email, "member@example.test");

  const formCases = [
    ["/api/contact", { name: "Form Test", email: "forms@example.test", message: "Please keep this message." }],
    ["/api/survey/submit", { age: "45-49", email: "forms@example.test", symptoms_experiencing: ["Sleep"] }],
    ["/api/feedback/submit", { email: "forms@example.test", interest_level: "High", valuable_features: ["Reports"], likelihood_to_register: "4", would_recommend: "Yes", willingness_to_pay: "$9/month – Essential" }],
    ["/api/assessment/feedback", { sectionId: "sleep", email: "forms@example.test", comment: "Helpful report." }],
    ["/api/referral/submit", { friendName: "Form Friend", friendEmail: "Friend@example.test" }],
  ];
  async function postForm(path, body) {
    return fetch(base + path, { method: "POST", headers: { ...authHeaders, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }
  for (const [path, body] of formCases) {
    failDbWrites = true;
    const beforeDelivery = sent.length;
    const blocked = await postForm(path, body);
    assert.equal(blocked.status, 503, path + " must report persistence failure");
    assert.equal(sent.length, beforeDelivery, path + " must not send before persistence");
    failDbWrites = false;
    const beforeCapture = storedEmails.length;
    const saved = await postForm(path, body);
    assert.equal(saved.status, 200, path + " saves successfully");
    assert.equal(storedEmails.length, beforeCapture + 1, path + " saves submitted email");
  }
  assert.equal(storedEmails.at(-1).email, "friend@example.test");
  assert.equal(sent.some(message => message.to === "friend@example.test"), false, "Referrals never email the friend");
  for (const path of ["/api/survey/submit", "/api/feedback/submit"]) {
    const body = { ...formCases.find(item => item[0] === path)[1], email: "invalid" };
    assert.equal((await postForm(path, body)).status, 400, path + " rejects malformed supplied email");
    delete body.email;
    assert.equal((await postForm(path, body)).status, 200, path + " still supports anonymous answers");
  }

  const ui = await readFile(new URL("../redesign-preview/free-assessment.html", import.meta.url), "utf8");
  assert.match(ui, /id="deliveryStatus"/);
  assert.match(ui, /saved\.emailSent\s*\?\s*'Your personalised report is ready and a copy was emailed to you\.'/);
  assert.match(ui, /'Your personalised report is ready\. Email delivery is unavailable; please save a PDF copy\.'/);
  console.log("PASS: free score, split names, quiz answers, SMTP outcomes, affirmation guard, contact, survey, feedback, reflection and referral persistence");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await new Promise((resolve) => server.close(resolve));
}
