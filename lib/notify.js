// lib/notify.js
//
// Minimal notification utility used by the assessment feedback (F7) and
// referral (F5) endpoints. Persists every record as a JSONL line under
// uploads/, logs to the console, and returns the saved record. SMTP delivery
// can be layered on later by extending sendIfConfigured().
//
// Each line in the JSONL files is one JSON object — append-only, easy to
// tail, easy to parse later. Files:
//   uploads/assessment-feedback.jsonl
//   uploads/referrals.jsonl

const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

async function appendJsonl(filename, record) {
  ensureUploadsDir();
  const filepath = path.join(UPLOADS_DIR, filename);
  const line = JSON.stringify(record) + "\n";
  await fs.promises.appendFile(filepath, line, { encoding: "utf8" });
  return filepath;
}

/**
 * Hook for future SMTP delivery. Currently a no-op; once SMTP env vars
 * (e.g. SMTP_HOST, SMTP_USER, SMTP_PASS, EMPRESS_TEAM_EMAIL) are set, this
 * is where nodemailer should be wired.
 */
async function sendIfConfigured(/* type, record */) {
  // Intentionally empty until SMTP is configured.
  return null;
}

/**
 * Save a notification of a given type ("feedback" or "referral") with a
 * timestamp, and write to the matching JSONL file. Console-logs a one-line
 * summary so the team has live visibility during development.
 */
async function notify(type, payload) {
  const record = {
    type,
    receivedAt: new Date().toISOString(),
    ...payload,
  };

  const filename =
    type === "referral"
      ? "referrals.jsonl"
      : type === "gift"
      ? "gift-claims.jsonl"
      : "assessment-feedback.jsonl";
  const filepath = appendJsonl(filename, record);

  // Concise console summary
  if (type === "feedback") {
    console.log(
      `[notify:feedback] section=${record.sectionId || "?"} tier=${record.tier || "?"} chars=${(record.comment || "").length}`
    );
  } else if (type === "referral") {
    console.log(
      `[notify:referral] friendName="${record.friendName || ""}" friendEmail=${record.friendEmail || ""}`
    );
  } else if (type === "gift") {
    console.log(
      `[notify:gift] firstName="${record.firstName || ""}" email=${record.email || ""}`
    );
  } else {
    console.log(`[notify:${type}]`, record);
  }

  // Best-effort: try email if configured.
  try {
    await sendIfConfigured(type, record);
  } catch (err) {
    console.warn("[notify] sendIfConfigured failed:", err && err.message);
  }

  return { filepath, record };
}

module.exports = { notify };
