import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const captureStore = require("../lib/capture-store.js");
const { registerMembershipRoutes } = require("../lib/membership-routes.js");

const paidAssessment = {
  id: 41,
  kind: "paid-120",
  email: "member@example.test",
  first_name: "Maya",
  last_name: "Sample",
  stage: "perimenopause",
  score: 72,
  band: "Managing",
  scores: { mhtActive: true, user: { age: 47, usState: "California", zip: "90024" }, apiResult: { source: "catalog" } },
  responses: { "1": 3, "2": 0 },
  created_at: new Date("2026-10-01T12:00:00Z"),
};

let latestQuery;
captureStore.configure({
  getPool: () => ({
    async query(sql, params) {
      if (/CREATE TABLE|CREATE INDEX|ALTER TABLE/.test(sql)) return { rows: [], rowCount: 0 };
      latestQuery = { sql, params };
      return { rows: [paidAssessment], rowCount: 1 };
    },
  }),
});

const stored = await captureStore.getLatestPaidAssessmentForUser({ userId: 73 });
assert.equal(stored.id, paidAssessment.id);
assert.match(latestQuery.sql, /WHERE user_id = \$1 AND kind = 'paid-120'/);
assert.deepEqual(latestQuery.params, [73]);
assert.match(latestQuery.sql, /responses/);

const getRoutes = new Map();
const postRoutes = new Map();
const app = {
  get(path, handler) { getRoutes.set(path, handler); },
  post(path, ...handlers) { postRoutes.set(path, handlers.at(-1)); },
};
const userRow = { id: 73, first_name: "Maya", last_name: "Sample", email: "member@example.test", subscription_tier: "essential" };
let savedTier = null;
const db = {
  async query(sql, params = []) {
    if (/ALTER TABLE users/.test(sql)) return { rows: [], rowCount: 0 };
    if (/SELECT \* FROM users/.test(sql)) return { rows: [userRow], rowCount: 1 };
    if (/UPDATE users SET subscription_tier/.test(sql)) {
      savedTier = params[1];
      return { rows: [{ ...userRow, subscription_tier: params[1], subscription_status: params[2], stripe_customer_id: params[3], stripe_subscription_id: params[4] }], rowCount: 1 };
    }
    throw new Error("Unexpected continuity query");
  },
};
registerMembershipRoutes(app, { getPool: () => db });
const continuity = getRoutes.get("/api/account/continuity");
assert.equal(typeof continuity, "function");

function responseStub() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    set(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

const anonymousRes = responseStub();
await continuity({ session: {} }, anonymousRes);
assert.equal(anonymousRes.statusCode, 401);
assert.equal(anonymousRes.body.assessment, undefined);
assert.equal(anonymousRes.headers["Cache-Control"], "no-store");

const memberRes = responseStub();
await continuity({ session: { userId: 73 } }, memberRes);
assert.equal(memberRes.statusCode, 200);
assert.equal(memberRes.body.authenticated, true);
assert.equal(memberRes.body.assessment.responses["1"], 3);
assert.equal(memberRes.body.assessment.user.lastName, "Sample");
assert.equal(memberRes.body.assessment.user.age, 47);
assert.equal(memberRes.body.assessment.user.email, "member@example.test");

// Synthetic webhook: exercise the actual signature verifier and entitlement
// route while stubbing only the read-only Stripe subscription lookup.
const stripe = require("../lib/stripe-billing.js");
const originalGetSubscription = stripe.getSubscription;
const webhookSecret = "whsec_synthetic_membership_test";
process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
stripe.getSubscription = async (id) => ({
  id,
  customer: "cus_synthetic_73",
  status: "active",
  metadata: { user_id: "73", tier: "essential" },
  items: { data: [{ price: { lookup_key: "empress_essential_monthly" } }] },
});
try {
  const eventBody = Buffer.from(JSON.stringify({
    type: "checkout.session.completed",
    data: { object: {
      mode: "subscription", payment_status: "paid", client_reference_id: "73",
      subscription: "sub_synthetic_73", metadata: { user_id: "73" },
    } },
  }));
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${eventBody.toString("utf8")}`).digest("hex");
  const webhookRes = responseStub();
  await postRoutes.get("/api/stripe/webhook")({
    body: eventBody,
    get(name) { return name === "stripe-signature" ? `t=${timestamp},v1=${signature}` : undefined; },
  }, webhookRes);
  assert.equal(webhookRes.statusCode, 200);
  assert.deepEqual(webhookRes.body, { received: true });
  assert.equal(savedTier, "essential");
} finally {
  stripe.getSubscription = originalGetSubscription;
}

console.log("PASS: member continuity and synthetic Stripe webhook restore/activate only the session-owned account");
