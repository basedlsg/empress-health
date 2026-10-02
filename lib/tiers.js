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
    affirmations: null,
  },
  essential: {
    id: "essential",
    name: "Essential",
    priceMonthlyUSD: 9,
    priceYearlyUSD: 90, // two months free
    naturalsDiscountPercent: 10,
    // Personalised affirmations by email: two a week (Monday and Thursday).
    affirmations: { cadence: "twice-weekly", perWeek: 2, label: "2 personalised affirmations a week" },
    // Stripe price lookup key — the price is created on first use if missing.
    stripeLookupKey: "empress_essential_monthly",
    stripeLookupKeyYearly: "empress_essential_yearly",
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceMonthlyUSD: 19,
    priceYearlyUSD: 190, // two months free
    naturalsDiscountPercent: 15,
    // A fresh personalised affirmation by email every day.
    affirmations: { cadence: "daily", perWeek: 7, label: "A personalised affirmation every day" },
    stripeLookupKey: "empress_premium_monthly",
    stripeLookupKeyYearly: "empress_premium_yearly",
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
  const hit = PAID_TIER_IDS.find((id) =>
    TIERS[id].stripeLookupKey === lookupKey || TIERS[id].stripeLookupKeyYearly === lookupKey);
  return hit || null;
}

// Billing interval Stripe uses for each ("month" | "year").
function normaliseInterval(value) {
  return String(value || "").toLowerCase() === "year" ? "year" : "month";
}

// Public shape for the browser (no internals).
function publicTiers() {
  return Object.values(TIERS).map(({ id, name, priceMonthlyUSD, priceYearlyUSD, naturalsDiscountPercent, affirmations }) => ({
    id, name, priceMonthlyUSD, priceYearlyUSD: priceYearlyUSD || 0, naturalsDiscountPercent,
    affirmationsPerWeek: affirmations ? affirmations.perWeek : 0,
    affirmationsLabel: affirmations ? affirmations.label : null,
  }));
}

// Affirmation delivery cadence for a tier id, or null when the tier gets none.
function affirmationCadence(value) {
  const tier = TIERS[normaliseTier(value)];
  return tier.affirmations ? tier.affirmations.cadence : null;
}

module.exports = { TIERS, PAID_TIER_IDS, normaliseTier, normaliseInterval, isPaidTier, tierForLookupKey, publicTiers, affirmationCadence };
