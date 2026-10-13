#!/usr/bin/env node
"use strict";

// Isolated persistence-contract check. This uses a fake pg pool and never
// loads project .env values, opens a database connection, or invokes SMTP.
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const captureStore = require("../lib/capture-store");
const calls = [];
const fakePool = {
  async query(sql, values = []) {
    calls.push({ sql: String(sql), values });
    if (/SELECT first_name, last_name, context/i.test(sql)) {
      return { rows: [{ first_name: "Sarah", last_name: "Mitchell", context: { age: 47, state: "CA", zip: "90210" } }], rowCount: 1 };
    }
    if (/INSERT INTO assessment_submissions/i.test(sql)) return { rows: [{ id: 42 }], rowCount: 1 };
    return { rows: [], rowCount: 1 };
  },
};

captureStore.configure({ getPool: () => fakePool });

assert.equal(await captureStore.captureEmail({
  email: "Sarah.Example@example.com",
  firstName: "Sarah",
  lastName: "Mitchell",
  source: "free-12q-screener",
}), true);
const emailInsert = calls.find((call) => /INSERT INTO email_captures/i.test(call.sql));
assert.ok(emailInsert);
assert.match(emailInsert.sql, /last_name/);
assert.equal(emailInsert.values[0], "sarah.example@example.com");
assert.equal(emailInsert.values[1], "Sarah");
assert.equal(emailInsert.values[2], "Mitchell");

const handoffToken = await captureStore.createIntakeHandoff({
  email: "sarah.example@example.com",
  firstName: "Sarah",
  lastName: "Mitchell",
  age: 47,
  state: "CA",
  zip: "90210",
});
assert.match(handoffToken, /^[a-f0-9]{64}$/);
const handoff = await captureStore.getIntakeHandoff({ token: handoffToken, email: "sarah.example@example.com" });
assert.equal(handoff.lastName, "Mitchell");

const answers = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
assert.equal(await captureStore.saveSubmission({
  kind: "free-12q-screener",
  email: "sarah.example@example.com",
  firstName: "Sarah",
  lastName: "Mitchell",
  stage: "perimenopause",
  score: 72,
  band: "Flourishing",
  scores: { burden: 18 },
  responses: answers,
}), 42);
const assessmentInsert = calls.find((call) => /INSERT INTO assessment_submissions/i.test(call.sql));
assert.ok(assessmentInsert);
assert.match(assessmentInsert.sql, /last_name/);
assert.equal(assessmentInsert.values[3], "Mitchell");
assert.deepEqual(JSON.parse(assessmentInsert.values[9]), answers);

const { normaliseAssessmentEmailPayload } = require("../lib/assessment-report-email");
const emailPayload = normaliseAssessmentEmailPayload({
  email: "sarah.example@example.com",
  firstName: "Sarah",
  lastName: "Mitchell",
  overall: 72,
  report: { user: { firstName: "Sarah", lastName: "Mitchell", age: 47 }, responses: { 1: 2 } },
});
assert.equal(emailPayload.firstName, "Sarah");
assert.equal(emailPayload.lastName, "Mitchell");
assert.equal(emailPayload.report.user.firstName, "Sarah");
assert.equal(emailPayload.report.user.lastName, "Mitchell");

console.log("capture-store payload contract: PASS");
