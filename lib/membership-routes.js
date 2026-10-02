// lib/membership-routes.js — membership tiers, Stripe billing, and the
// Empress Naturals hand-off.
//
// Routes:
//   GET  /api/account                 — who am I, my tier, my Naturals discount
//   POST /api/subscription/checkout   — { tier } → Stripe Checkout URL (or in-place tier change)
//   POST /api/subscription/portal     — Stripe billing portal URL (cancel / card update)
//   POST /api/stripe/webhook          — Stripe → tier updates (raw body, signature-verified)
//   GET  /api/naturals/go?to=/path    — send the member to empressnaturals.co with her
//                                       discount code auto-applied
//
// Tier changes flow one way: Stripe webhook → users row → Shopify sync.
// Registered BEFORE the app-wide express.json() so the webhook sees the raw
// body its signature covers; the JSON routes parse their own bodies.

"use strict";

const express = require("express");
const { TIERS, normaliseTier, isPaidTier, tierForLookupKey, publicTiers } = require("./tiers");
const stripe = require("./stripe-billing");
const shopify = require("./shopify-admin");

const NATURALS_ORIGIN = (process.env.NATURALS_STORE_URL || "https://empressnaturals.co").replace(/\/$/, "");

function siteUrl() {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, "");
  return process.env.NODE_ENV === "production"
    ? "https://empresshealth.ai"
    : `http://localhost:${process.env.PORT || 3000}`;
}

// Store paths only: "/", "/collections/x", "/products/y?variant=1".
function safeStorePath(value) {
  const p = typeof value === "string" ? value : "";
  if (!p.startsWith("/") || p.startsWith("//") || /[\s\\@]/.test(p) || p.includes(":")) return "/";
  return p.slice(0, 300);
}

function registerMembershipRoutes(app, { getPool }) {
  let schemaReady = null;
  function ensureSchema() {
    const pool = getPool();
    if (!pool) return Promise.reject(new Error("No database configured"));
    if (!schemaReady) {
      schemaReady = pool.query(`
        ALTER TABLE users
          ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free',
          ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(40),
          ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
          ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
          ADD COLUMN IF NOT EXISTS tier_updated_at TIMESTAMP,
          ADD COLUMN IF NOT EXISTS shopify_customer_id VARCHAR(255),
          ADD COLUMN IF NOT EXISTS shopify_discount_id VARCHAR(255),
          ADD COLUMN IF NOT EXISTS naturals_discount_code VARCHAR(64),
          ADD COLUMN IF NOT EXISTS naturals_discount_tier VARCHAR(20),
          ADD COLUMN IF NOT EXISTS shopify_synced_at TIMESTAMP;
        CREATE INDEX IF NOT EXISTS users_stripe_customer_idx ON users (stripe_customer_id);
      `).catch((err) => { schemaReady = null; throw err; });
    }
    return schemaReady;
  }

  async function loadUser(userId) {
    await ensureSchema();
    const r = await getPool().query(`SELECT * FROM users WHERE id = $1`, [userId]);
    return r.rows[0] || null;
  }

  // Push the user's current tier to Shopify and persist the result. Never
  // throws — a Shopify outage must not break billing; /api/naturals/go
  // retries lazily when the stored code is missing or stale.
  async function syncShopify(user) {
    if (!shopify.isConfigured()) return user;
    try {
      const out = await shopify.syncMemberTier({
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        tier: user.subscription_tier,
        shopifyCustomerId: user.shopify_customer_id,
        shopifyDiscountId: user.shopify_discount_id,
        discountCode: user.naturals_discount_code,
        discountTier: user.naturals_discount_tier,
      });
      const r = await getPool().query(
        `UPDATE users SET shopify_customer_id = $2, shopify_discount_id = $3,
                naturals_discount_code = $4, naturals_discount_tier = $5, shopify_synced_at = NOW()
          WHERE id = $1 RETURNING *`,
        [user.id, out.shopifyCustomerId, out.shopifyDiscountId, out.discountCode, out.discountTier]
      );
      return r.rows[0] || user;
    } catch (err) {
      console.error(`[membership] Shopify sync failed for user ${user.id}:`, err.message);
      return user;
    }
  }

  async function setTier(userId, fields) {
    const tier = normaliseTier(fields.tier);
    const r = await getPool().query(
      `UPDATE users SET subscription_tier = $2,
              subscription_status = $3,
              stripe_customer_id = COALESCE($4, stripe_customer_id),
              stripe_subscription_id = $5,
              tier_updated_at = NOW(), updated_at = NOW()
        WHERE id = $1 RETURNING *`,
      [userId, tier, fields.status || null, fields.stripeCustomerId || null, fields.stripeSubscriptionId || null]
    );
    const user = r.rows[0];
    if (!user) return null;
    console.log(`[membership] user ${userId} → ${tier} (${fields.status || "no status"})`);
    return syncShopify(user);
  }

  function discountView(user) {
    const tier = normaliseTier(user.subscription_tier);
    if (!isPaidTier(tier)) return null;
    const ready = user.naturals_discount_code && user.naturals_discount_tier === tier;
    return {
      percent: TIERS[tier].naturalsDiscountPercent,
      code: ready ? user.naturals_discount_code : null,
      shopUrl: "/api/naturals/go",
      pending: !ready,
    };
  }

  const RESULT_LABELS = {
    "free-12q-screener": "Menopause Health Intelligence Score",
    "free-sleep-score": "Sleep Score",
    "paid-120": "Full Health Intelligence Assessment",
  };
  async function savedResults(userId) {
    const rows = await require("./capture-store").listSubmissionsForUser({ userId, limit: 10 });
    return rows.map((r) => ({
      kind: r.kind,
      label: RESULT_LABELS[r.kind] || "Assessment",
      score: r.score,
      band: r.band,
      stage: r.stage,
      completedAt: r.created_at,
    }));
  }

  function requireUser(req, res) {
    if (!req.session || !req.session.userId) {
      res.status(401).json({ error: "Please sign in first." });
      return null;
    }
    if (!getPool()) {
      res.status(503).json({ error: "Accounts are temporarily unavailable." });
      return null;
    }
    return req.session.userId;
  }

  /* ---------- Stripe webhook (must see the raw body) ---------- */
  app.post("/api/stripe/webhook", express.raw({ type: "*/*", limit: "1mb" }), async (req, res) => {
    let event;
    try {
      event = stripe.verifyWebhook(req.body, req.get("stripe-signature"));
    } catch (err) {
      console.warn("[stripe-webhook] rejected:", err.message);
      return res.status(400).json({ error: "Invalid signature" });
    }
    if (!getPool()) return res.status(503).json({ error: "No database" });

    try {
      await ensureSchema();
      const obj = event.data && event.data.object;
      if (!obj || typeof obj !== "object") return res.status(400).json({ error: "Malformed event" });
      let subscription = null;
      let userId = null;

      if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type) && obj.mode === "subscription") {
        // A redirect or completed Checkout Session can precede settlement for
        // asynchronous payment methods. Stripe sends a later success event.
        if (!["paid", "no_payment_required"].includes(obj.payment_status)) {
          return res.json({ received: true, pending: true });
        }
        userId = Number(obj.client_reference_id || (obj.metadata && obj.metadata.user_id)) || null;
        if (obj.subscription) subscription = await stripe.getSubscription(obj.subscription);
      } else if (/^customer\.subscription\.(created|updated|deleted)$/.test(event.type)) {
        // Events can arrive out of order. Read the latest state for active
        // subscriptions so an old snapshot cannot undo a newer payment.
        subscription = event.type === "customer.subscription.deleted"
          ? obj : await stripe.getSubscription(obj.id);
      } else if (["invoice.paid", "invoice.payment_failed"].includes(event.type)) {
        const subscriptionId = obj.subscription || (obj.parent && obj.parent.subscription_details && obj.parent.subscription_details.subscription);
        if (subscriptionId) subscription = await stripe.getSubscription(subscriptionId);
      } else {
        return res.json({ received: true, ignored: event.type });
      }
      if (!subscription) return res.json({ received: true });

      if (!userId) userId = Number(subscription.metadata && subscription.metadata.user_id) || null;
      if (!userId && subscription.customer) {
        const r = await getPool().query(`SELECT id FROM users WHERE stripe_customer_id = $1 LIMIT 1`, [subscription.customer]);
        userId = r.rows[0] ? r.rows[0].id : null;
      }
      if (!userId) {
        console.warn(`[stripe-webhook] ${event.type}: no matching user for subscription ${subscription.id}`);
        return res.json({ received: true, unmatched: true });
      }

      // Ignore events about an older subscription once the user has moved on.
      const current = await loadUser(userId);
      if (current && current.stripe_subscription_id && current.stripe_subscription_id !== subscription.id &&
          event.type !== "checkout.session.completed" && current.subscription_tier !== "free") {
        return res.json({ received: true, stale: true });
      }

      const item = subscription.items && subscription.items.data && subscription.items.data[0];
      const pricedTier = item && item.price && tierForLookupKey(item.price.lookup_key);
      const tier = stripe.ENTITLED_STATUSES.has(subscription.status) && event.type !== "customer.subscription.deleted"
        ? (pricedTier || normaliseTier(subscription.metadata && subscription.metadata.tier))
        : "free";

      await setTier(userId, {
        tier,
        status: event.type === "customer.subscription.deleted" ? "canceled" : subscription.status,
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: tier === "free" ? null : subscription.id,
      });
      return res.json({ received: true });
    } catch (err) {
      console.error("[stripe-webhook] handling failed:", err.message);
      // 500 → Stripe retries the event.
      return res.status(500).json({ error: "Webhook handling failed" });
    }
  });

  /* ---------- Account ---------- */
  app.get("/api/account", async (req, res) => {
    res.set("Cache-Control", "no-store");
    const base = {
      tiers: publicTiers(),
      billingConfigured: stripe.isConfigured(),
      billingTestMode: stripe.isTestMode(),
      naturalsConfigured: shopify.isConfigured(),
    };
    if (!req.session || !req.session.userId) return res.json({ authenticated: false, ...base });
    if (!getPool()) return res.json({ authenticated: true, ...base, user: { email: req.session.userEmail }, tier: "free" });
    try {
      const user = await loadUser(req.session.userId);
      if (!user) return res.json({ authenticated: false, ...base });
      return res.json({
        authenticated: true,
        ...base,
        user: { firstName: user.first_name, lastName: user.last_name, email: user.email },
        tier: normaliseTier(user.subscription_tier),
        subscriptionStatus: user.subscription_status || null,
        canManageBilling: !!user.stripe_customer_id && stripe.isConfigured(),
        naturalsDiscount: discountView(user),
        results: await savedResults(user.id),
      });
    } catch (err) {
      console.error("[account] load failed:", err.message);
      return res.status(500).json({ error: "Could not load your account." });
    }
  });

  /* ---------- Start / change a subscription ---------- */
  app.post("/api/subscription/checkout", express.json({ limit: "10kb" }), async (req, res) => {
    const userId = requireUser(req, res);
    if (!userId) return;
    const tier = normaliseTier(req.body && req.body.tier);
    if (!isPaidTier(tier)) return res.status(400).json({ error: "Choose Essential or Premium." });
    if (!stripe.isConfigured()) {
      return res.status(503).json({ error: "Online payments are being set up. Please check back soon." });
    }
    try {
      const user = await loadUser(userId);
      if (!user) return res.status(401).json({ error: "Please sign in again." });
      const current = normaliseTier(user.subscription_tier);

      if (current === tier) return res.json({ ok: true, unchanged: true });

      // Already paying → switch the existing subscription instead of opening a second one.
      if (isPaidTier(current) && user.stripe_subscription_id) {
        const updated = await stripe.changeSubscriptionTier({ subscriptionId: user.stripe_subscription_id, tier });
        // A pending update can require payment. The verified webhook is the
        // only place that changes the member's entitlement.
        return res.json({ ok: true, pending: !!updated.pending_update, tier });
      }

      const url = await stripe.createCheckoutSession({
        tier,
        userId,
        email: user.email,
        stripeCustomerId: user.stripe_customer_id,
        successUrl: `${siteUrl()}/account?checkout=success`,
        cancelUrl: `${siteUrl()}/account?checkout=cancelled`,
      });
      return res.json({ ok: true, url });
    } catch (err) {
      console.error("[subscription] checkout failed:", err.message);
      return res.status(502).json({ error: "We couldn't reach our payment provider. Please try again." });
    }
  });

  app.post("/api/subscription/portal", express.json({ limit: "10kb" }), async (req, res) => {
    const userId = requireUser(req, res);
    if (!userId) return;
    try {
      const user = await loadUser(userId);
      if (!user || !user.stripe_customer_id || !stripe.isConfigured()) {
        return res.status(400).json({ error: "No billing account yet." });
      }
      const url = await stripe.createPortalSession({
        stripeCustomerId: user.stripe_customer_id, returnUrl: `${siteUrl()}/account`,
      });
      return res.json({ ok: true, url });
    } catch (err) {
      console.error("[subscription] portal failed:", err.message);
      return res.status(502).json({ error: "We couldn't open billing right now. Please try again." });
    }
  });

  /* ---------- Empress Naturals hand-off ---------- */
  app.get("/api/naturals/go", async (req, res) => {
    const to = safeStorePath(req.query && req.query.to);
    const plain = `${NATURALS_ORIGIN}${to}`;
    if (!req.session || !req.session.userId || !getPool()) return res.redirect(302, plain);
    try {
      let user = await loadUser(req.session.userId);
      if (!user || !isPaidTier(user.subscription_tier)) return res.redirect(302, plain);
      if (!user.naturals_discount_code || user.naturals_discount_tier !== normaliseTier(user.subscription_tier)) {
        user = await syncShopify(user);
      }
      const view = discountView(user);
      if (!view || !view.code) return res.redirect(302, plain);
      // Shopify's /discount/<code> stores the code for checkout, then redirects.
      return res.redirect(302, `${NATURALS_ORIGIN}/discount/${encodeURIComponent(view.code)}?redirect=${encodeURIComponent(to)}`);
    } catch (err) {
      console.error("[naturals] hand-off failed:", err.message);
      return res.redirect(302, plain);
    }
  });
}

module.exports = { registerMembershipRoutes, safeStorePath };
