// lib/tiers.js — Empress Health membership tiers (single source of truth).
//
// Each paid tier carries a member discount on Empress Naturals (the Shopify
// store at empressnaturals.co). The discount is enforced on Shopify's side by
// a per-member discount code restricted to that member's Shopify customer
// record — see lib/shopify-admin.js.

"use strict";

const TIERS = {
  free: {
    id: "free",
    name: "Free",
    priceMonthlyUSD: 0,
    naturalsDiscountPercent: 0,
  },
  essential: {
    id: "essential",
    name: "Essential",
    priceMonthlyUSD: 9,
    naturalsDiscountPercent: 10,
    // Stripe price lookup key — the price is created on first use if missing.
    stripeLookupKey: "empress_essential_monthly",
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceMonthlyUSD: 19,
    naturalsDiscountPercent: 15,
    stripeLookupKey: "empress_premium_monthly",
  },
};

const PAID_TIER_IDS = ["essential", "premium"];

function normaliseTier(value) {
  const id = String(value || "").toLowerCase();
  return TIERS[id] ? id : "free";
}

function isPaidTier(value) {
  return PAID_TIER_IDS.includes(normaliseTier(value));
}

function tierForLookupKey(lookupKey) {
  const hit = PAID_TIER_IDS.find((id) => TIERS[id].stripeLookupKey === lookupKey);
  return hit || null;
}

// Public shape for the browser (no internals).
function publicTiers() {
  return Object.values(TIERS).map(({ id, name, priceMonthlyUSD, naturalsDiscountPercent }) => ({
    id, name, priceMonthlyUSD, naturalsDiscountPercent,
  }));
}

module.exports = { TIERS, PAID_TIER_IDS, normaliseTier, isPaidTier, tierForLookupKey, publicTiers };
