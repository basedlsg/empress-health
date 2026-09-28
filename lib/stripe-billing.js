// lib/stripe-billing.js — monthly membership billing via Stripe (REST, no SDK).
//
// Checkout: a Stripe-hosted Checkout Session in subscription mode. The price
// for each tier is looked up by its lookup_key and created on first use, so
// no manual setup in the Stripe dashboard is needed beyond the API key.
// Entitlement is granted ONLY from verified webhooks — never from the
// browser returning to the success URL.
//
// Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET. STRIPE_API_BASE overrides the
// endpoint (tests).

"use strict";

const crypto = require("crypto");
const { TIERS } = require("./tiers");

const REQUEST_TIMEOUT_MS = 15000;
const WEBHOOK_TOLERANCE_SECONDS = 300;

function isConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}

function apiBase() {
  return process.env.STRIPE_API_BASE || "https://api.stripe.com";
}

// Stripe's form encoding: nested objects/arrays as bracketed keys.
function formEncode(obj, prefix, out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") formEncode(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function stripeRequest(method, path, params) {
  const url = new URL(path, apiBase());
  const init = {
    method,
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  };
  if (params && method === "GET") {
    url.search = formEncode(params).toString();
  } else if (params) {
    init.headers["Content-Type"] = "application/x-www-form-urlencoded";
    init.body = formEncode(params).toString();
  }
  const res = await fetch(url, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body.error && body.error.message) || `HTTP ${res.status}`;
    throw new Error(`Stripe ${method} ${path}: ${msg}`);
  }
  return body;
}

const priceIdCache = new Map();

async function priceIdForTier(tier) {
  const t = TIERS[tier];
  if (!t || !t.stripeLookupKey) throw new Error(`No Stripe price for tier "${tier}"`);
  if (priceIdCache.has(tier)) return priceIdCache.get(tier);

  const list = await stripeRequest("GET", "/v1/prices", {
    lookup_keys: [t.stripeLookupKey], active: "true", limit: 1,
  });
  let price = list.data && list.data[0];
  if (!price) {
    price = await stripeRequest("POST", "/v1/prices", {
      currency: "usd",
      unit_amount: t.priceMonthlyUSD * 100,
      recurring: { interval: "month" },
      lookup_key: t.stripeLookupKey,
      product_data: { name: `Empress Health ${t.name}` },
      metadata: { tier },
    });
  }
  priceIdCache.set(tier, price.id);
  return price.id;
}

async function createCheckoutSession({ tier, userId, email, stripeCustomerId, successUrl, cancelUrl }) {
  const price = await priceIdForTier(tier);
  const session = await stripeRequest("POST", "/v1/checkout/sessions", {
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: String(userId),
    ...(stripeCustomerId ? { customer: stripeCustomerId } : { customer_email: email }),
    metadata: { user_id: String(userId), tier },
    subscription_data: { metadata: { user_id: String(userId), tier } },
    allow_promotion_codes: "true",
  });
  return session.url;
}

// Move an existing subscription to another paid tier (prorated).
async function changeSubscriptionTier({ subscriptionId, tier }) {
  const sub = await stripeRequest("GET", `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`);
  const item = sub.items && sub.items.data && sub.items.data[0];
  if (!item) throw new Error("Subscription has no items");
  const price = await priceIdForTier(tier);
  return stripeRequest("POST", `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    items: [{ id: item.id, price }],
    proration_behavior: "create_prorations",
    metadata: { tier },
  });
}

async function getSubscription(subscriptionId) {
  return stripeRequest("GET", `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

async function createPortalSession({ stripeCustomerId, returnUrl }) {
  const session = await stripeRequest("POST", "/v1/billing_portal/sessions", {
    customer: stripeCustomerId, return_url: returnUrl,
  });
  return session.url;
}

/**
 * Verify a webhook's Stripe-Signature header against the raw request body.
 * Returns the parsed event, or throws.
 */
function verifyWebhook(rawBody, signatureHeader, secret = process.env.STRIPE_WEBHOOK_SECRET, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  const parts = String(signatureHeader || "").split(",").map((p) => p.trim().split("="));
  const timestamp = Number((parts.find(([k]) => k === "t") || [])[1]);
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!timestamp || signatures.length === 0) throw new Error("Malformed Stripe-Signature header");
  if (Math.abs(nowSeconds - timestamp) > WEBHOOK_TOLERANCE_SECONDS) throw new Error("Webhook timestamp outside tolerance");

  const payload = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : String(rawBody);
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const ok = signatures.some((sig) => {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
  if (!ok) throw new Error("Webhook signature mismatch");
  return JSON.parse(payload);
}

// Statuses that keep member benefits. past_due keeps them during Stripe's
// retry window; canceled / unpaid / incomplete_expired drop to Free.
const ENTITLED_STATUSES = new Set(["active", "trialing", "past_due"]);

module.exports = {
  isConfigured,
  createCheckoutSession,
  changeSubscriptionTier,
  getSubscription,
  createPortalSession,
  verifyWebhook,
  ENTITLED_STATUSES,
};
