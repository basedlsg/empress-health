// Offline checks for membership tiers: Stripe webhook signature verification,
// the Empress Naturals redirect guard, and tier mapping.
// Usage: node scripts/test-membership.mjs
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { verifyWebhook } = require("../lib/stripe-billing.js");
const { safeStorePath } = require("../lib/membership-routes.js");
const { normaliseTier, isPaidTier, tierForLookupKey, TIERS } = require("../lib/tiers.js");
const { newDiscountCode } = require("../lib/shopify-admin.js");

let failed = 0;
function check(name, cond) {
  console.log(`${cond ? "✓" : "✗"} ${name}`);
  if (!cond) failed++;
}
function throws(fn) { try { fn(); return false; } catch { return true; } }

const secret = "whsec_test";
const body = JSON.stringify({ type: "customer.subscription.updated", data: { object: { id: "sub_1" } } });
const now = 1_800_000_000;
const sign = (payload, t = now, s = secret) =>
  `t=${t},v1=${crypto.createHmac("sha256", s).update(`${t}.${payload}`).digest("hex")}`;

check("valid signature accepted", verifyWebhook(Buffer.from(body), sign(body), secret, now).data.object.id === "sub_1");
check("wrong secret rejected", throws(() => verifyWebhook(body, sign(body, now, "whsec_other"), secret, now)));
check("tampered body rejected", throws(() => verifyWebhook(body.replace("sub_1", "sub_2"), sign(body), secret, now)));
check("old timestamp rejected", throws(() => verifyWebhook(body, sign(body, now - 600), secret, now)));
check("missing header rejected", throws(() => verifyWebhook(body, "", secret, now)));
check("missing secret rejected", throws(() => verifyWebhook(body, sign(body), "", now)));

check("store path kept", safeStorePath("/products/serum?variant=1") === "/products/serum?variant=1");
check("protocol-relative blocked", safeStorePath("//evil.com") === "/");
check("absolute URL blocked", safeStorePath("https://evil.com") === "/");
check("backslash blocked", safeStorePath("/\\evil.com") === "/");
check("non-string → /", safeStorePath(undefined) === "/");

check("unknown tier → free", normaliseTier("gold") === "free");
check("premium is paid", isPaidTier("PREMIUM"));
check("free is not paid", !isPaidTier("free"));
check("lookup key → tier", tierForLookupKey("empress_essential_monthly") === "essential");
check("prices: $9 / $19", TIERS.essential.priceMonthlyUSD === 9 && TIERS.premium.priceMonthlyUSD === 19);
check("discounts: 10% / 15%", TIERS.essential.naturalsDiscountPercent === 10 && TIERS.premium.naturalsDiscountPercent === 15);
check("discount code format", /^EMPRESS-[A-HJ-NP-Z2-9]{8}$/.test(newDiscountCode()));

console.log(failed ? `\n${failed} failed` : "\nPASS: membership checks");
process.exit(failed ? 1 : 0);
