// lib/shopify-admin.js — carries an Empress Health membership tier over to the
// Empress Naturals Shopify store.
//
// How the discount reaches the member:
//   1. Her Shopify customer record (matched by email, created if missing) is
//      tagged with her tier, e.g. `empress-premium`.
//   2. She gets her own discount code (EMPRESS-XXXXXXXX) worth her tier's
//      percentage, restricted on Shopify's side to that one customer — a
//      leaked code is worthless to anyone checking out with another email.
//   3. /api/naturals/go sends her to empressnaturals.co/discount/<code>, which
//      makes Shopify auto-apply the code at checkout.
// When her tier changes (upgrade, downgrade, cancel) the old code is deleted
// and, for a paid tier, a new one is issued.
//
// Env: SHOPIFY_ADMIN_TOKEN (Admin API access token with read_customers,
// write_customers, write_discounts), SHOPIFY_STORE_DOMAIN (the
// *.myshopify.com domain). SHOPIFY_ADMIN_API_URL overrides the endpoint (tests).

"use strict";

const crypto = require("crypto");
const { TIERS, PAID_TIER_IDS, normaliseTier, isPaidTier } = require("./tiers");

const API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-07";
const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "skincare-solutions-llc.myshopify.com";
const REQUEST_TIMEOUT_MS = 10000;
const TIER_TAG_PREFIX = "empress-";

function isConfigured() {
  return !!process.env.SHOPIFY_ADMIN_TOKEN;
}

function endpoint() {
  return process.env.SHOPIFY_ADMIN_API_URL ||
    `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
}

async function adminGraphql(query, variables) {
  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch {
    throw new Error(`Shopify Admin API returned non-JSON (HTTP ${res.status})`);
  }
  if (!res.ok || body.errors) {
    const detail = body.errors ? JSON.stringify(body.errors).slice(0, 300) : `HTTP ${res.status}`;
    throw new Error(`Shopify Admin API error: ${detail}`);
  }
  return body.data;
}

function throwOnUserErrors(payload, label) {
  const errs = payload && payload.userErrors;
  if (errs && errs.length) {
    throw new Error(`${label}: ${errs.map((e) => e.message).join("; ")}`);
  }
}

// Unambiguous characters only (no 0/O, 1/I/L) — members may type it by hand.
function newDiscountCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(8);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `EMPRESS-${out}`;
}

async function findOrCreateCustomer({ email, firstName, lastName }) {
  const found = await adminGraphql(
    `query($q: String!) { customers(first: 1, query: $q) { nodes { id } } }`,
    { q: `email:"${String(email).replace(/"/g, "")}"` }
  );
  const existing = found.customers && found.customers.nodes[0];
  if (existing) return existing.id;

  const created = await adminGraphql(
    `mutation($input: CustomerInput!) {
       customerCreate(input: $input) { customer { id } userErrors { field message } }
     }`,
    { input: { email, firstName: firstName || undefined, lastName: lastName || undefined } }
  );
  throwOnUserErrors(created.customerCreate, "customerCreate");
  return created.customerCreate.customer.id;
}

async function setTierTag(customerId, tier) {
  const stale = PAID_TIER_IDS.filter((id) => id !== tier).map((id) => TIER_TAG_PREFIX + id);
  const removed = await adminGraphql(
    `mutation($id: ID!, $tags: [String!]!) { tagsRemove(id: $id, tags: $tags) { userErrors { field message } } }`,
    { id: customerId, tags: stale }
  );
  throwOnUserErrors(removed.tagsRemove, "tagsRemove");
  if (isPaidTier(tier)) {
    const added = await adminGraphql(
      `mutation($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { field message } } }`,
      { id: customerId, tags: [TIER_TAG_PREFIX + tier] }
    );
    throwOnUserErrors(added.tagsAdd, "tagsAdd");
  }
}

async function deleteDiscount(discountId) {
  if (!discountId) return;
  const del = await adminGraphql(
    `mutation($id: ID!) { discountCodeDelete(id: $id) { deletedCodeDiscountId userErrors { field message } } }`,
    { id: discountId }
  );
  // Already gone (deleted by staff in the Shopify admin) is fine.
  const errs = (del.discountCodeDelete && del.discountCodeDelete.userErrors) || [];
  if (errs.length && !errs.every((e) => /not exist|not found/i.test(e.message))) {
    throwOnUserErrors(del.discountCodeDelete, "discountCodeDelete");
  }
}

async function createMemberDiscount({ customerId, tier, userId }) {
  const t = TIERS[tier];
  // Retry once on a (vanishingly unlikely) code collision.
  for (let attempt = 0; attempt < 2; attempt++) {
    const code = newDiscountCode();
    const created = await adminGraphql(
      `mutation($d: DiscountCodeBasicInput!) {
         discountCodeBasicCreate(basicCodeDiscount: $d) {
           codeDiscountNode { id }
           userErrors { field message }
         }
       }`,
      {
        d: {
          title: `Empress Health ${t.name} member ${t.naturalsDiscountPercent}% (user ${userId})`,
          code,
          startsAt: new Date().toISOString(),
          customerSelection: { customers: { add: [customerId] } },
          customerGets: {
            value: { percentage: t.naturalsDiscountPercent / 100 },
            items: { all: true },
          },
          appliesOncePerCustomer: false,
          combinesWith: { productDiscounts: false, orderDiscounts: false, shippingDiscounts: true },
        },
      }
    );
    const payload = created.discountCodeBasicCreate;
    const errs = (payload && payload.userErrors) || [];
    if (errs.length && errs.some((e) => /code.*(taken|unique|exists)/i.test(e.message)) && attempt === 0) {
      continue;
    }
    throwOnUserErrors(payload, "discountCodeBasicCreate");
    return { discountId: payload.codeDiscountNode.id, code };
  }
  throw new Error("discountCodeBasicCreate: could not allocate a unique code");
}

/**
 * Bring Shopify in line with the member's tier.
 *   member: { userId, email, firstName, lastName, tier,
 *             shopifyCustomerId?, shopifyDiscountId?, discountCode?, discountTier? }
 * Returns { shopifyCustomerId, shopifyDiscountId, discountCode, discountTier }
 * — the caller persists these on the user row.
 */
async function syncMemberTier(member) {
  if (!isConfigured()) throw new Error("Shopify Admin API is not configured (SHOPIFY_ADMIN_TOKEN).");
  const tier = normaliseTier(member.tier);

  const customerId = member.shopifyCustomerId ||
    await findOrCreateCustomer({ email: member.email, firstName: member.firstName, lastName: member.lastName });
  await setTierTag(customerId, tier);

  // Keep the existing code when it already matches the tier.
  if (isPaidTier(tier) && member.shopifyDiscountId && member.discountCode && member.discountTier === tier) {
    return {
      shopifyCustomerId: customerId,
      shopifyDiscountId: member.shopifyDiscountId,
      discountCode: member.discountCode,
      discountTier: tier,
    };
  }

  await deleteDiscount(member.shopifyDiscountId);
  if (!isPaidTier(tier)) {
    return { shopifyCustomerId: customerId, shopifyDiscountId: null, discountCode: null, discountTier: null };
  }
  const { discountId, code } = await createMemberDiscount({ customerId, tier, userId: member.userId });
  return { shopifyCustomerId: customerId, shopifyDiscountId: discountId, discountCode: code, discountTier: tier };
}

module.exports = { isConfigured, syncMemberTier, newDiscountCode };
