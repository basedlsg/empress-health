// Offline checks for membership tiers: Stripe webhook signature verification,
// the Empress Naturals redirect guard, and tier mapping.
// Usage: node scripts/test-membership.mjs
import crypto from "node:crypto";
import http from "node:http";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const stripeBilling = require("../lib/stripe-billing.js");
const { verifyWebhook } = stripeBilling;
const { safeStorePath } = require("../lib/membership-routes.js");
const { normaliseTier, normaliseInterval, isPaidTier, tierForLookupKey, TIERS, publicTiers } = require("../lib/tiers.js");
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
check("yearly lookup key → tier", tierForLookupKey("empress_premium_yearly") === "premium" && tierForLookupKey("empress_essential_yearly") === "essential");
check("yearly prices: $90 / $190 (two months free)", TIERS.essential.priceYearlyUSD === 90 && TIERS.premium.priceYearlyUSD === 190 &&
  TIERS.essential.priceYearlyUSD === TIERS.essential.priceMonthlyUSD * 10 && TIERS.premium.priceYearlyUSD === TIERS.premium.priceMonthlyUSD * 10);
check("interval normalised", normaliseInterval("YEAR") === "year" && normaliseInterval("weekly") === "month" && normaliseInterval(undefined) === "month");
check("public tiers carry yearly price", publicTiers().find((t) => t.id === "premium").priceYearlyUSD === 190);
check("discount code format", /^EMPRESS-[A-HJ-NP-Z2-9]{8}$/.test(newDiscountCode()));

// ── Yearly checkout against a mock Stripe API ───────────────────────────────
const seen = [];
const mock = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => { raw += c; });
  req.on("end", () => {
    const url = new URL(req.url, "http://x");
    const form = Object.fromEntries(new URLSearchParams(req.method === "GET" ? url.search : raw));
    seen.push({ method: req.method, path: url.pathname, form });
    res.setHeader("Content-Type", "application/json");
    if (req.method === "GET" && url.pathname === "/v1/prices") return res.end(JSON.stringify({ data: [] }));
    if (req.method === "POST" && url.pathname === "/v1/prices") return res.end(JSON.stringify({ id: `price_${form.lookup_key}` }));
    if (req.method === "POST" && url.pathname === "/v1/checkout/sessions") return res.end(JSON.stringify({ url: "https://checkout.example/session" }));
    res.statusCode = 404; res.end("{}");
  });
});
await new Promise((resolve) => mock.listen(0, "127.0.0.1", resolve));
process.env.STRIPE_API_BASE = `http://127.0.0.1:${mock.address().port}`;
process.env.STRIPE_SECRET_KEY = "sk_test_mock";
try {
  const urlYear = await stripeBilling.createCheckoutSession({ tier: "premium", interval: "year", userId: 7, email: "a@example.test", successUrl: "https://x/s", cancelUrl: "https://x/c" });
  const priceCreate = seen.find((r) => r.method === "POST" && r.path === "/v1/prices");
  check("yearly checkout creates a $190/year price", priceCreate && priceCreate.form.unit_amount === "19000" && priceCreate.form["recurring[interval]"] === "year" && priceCreate.form.lookup_key === "empress_premium_yearly");
  const session = seen.find((r) => r.path === "/v1/checkout/sessions");
  check("yearly checkout line item uses the yearly price", session && session.form["line_items[0][price]"] === "price_empress_premium_yearly" && session.form["metadata[interval]"] === "year" && urlYear.startsWith("https://checkout.example"));
  seen.length = 0;
  await stripeBilling.createCheckoutSession({ tier: "essential", userId: 7, email: "a@example.test", successUrl: "https://x/s", cancelUrl: "https://x/c" });
  const monthly = seen.find((r) => r.method === "POST" && r.path === "/v1/prices");
  check("default checkout stays monthly ($9/month)", monthly && monthly.form.unit_amount === "900" && monthly.form["recurring[interval]"] === "month" && monthly.form.lookup_key === "empress_essential_monthly");
} catch (err) {
  check(`mock checkout threw: ${err.message}`, false);
}
mock.close();

console.log(failed ? `\n${failed} failed` : "\nPASS: membership checks");
process.exit(failed ? 1 : 0);
