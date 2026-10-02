"use strict";

const path = require("path");
const { spawn } = require("child_process");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Set STRIPE_SECRET_KEY in .env first.");
  process.exit(1);
}

const events = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
];
const port = process.env.PORT || 3100;
const child = spawn("npx", [
  "--yes", "@stripe/cli", "listen",
  "--events", events.join(","),
  "--forward-to", `http://localhost:${port}/api/stripe/webhook`,
  "--skip-update",
], {
  stdio: "inherit",
  env: { ...process.env, STRIPE_API_KEY: process.env.STRIPE_SECRET_KEY },
});

child.on("error", (err) => {
  console.error("Could not start the Stripe CLI:", err.message);
  process.exitCode = 1;
});
child.on("exit", (code) => { process.exitCode = code || 0; });
