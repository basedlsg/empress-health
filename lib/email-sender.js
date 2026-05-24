'use strict';

/**
 * lib/email-sender.js — SMTP wrapper with file-log stub
 *
 * When SMTP_HOST + SMTP_USER + SMTP_PASS are set: sends via nodemailer.
 * Otherwise appends a JSONL record to ./email_outbox.log for dev/CI verification.
 */

const fs   = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const LOG_PATH = path.join(__dirname, '..', 'email_outbox.log');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BASE_URL = (process.env.RENDER_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

/**
 * sendEmail — sends an email via SMTP or falls back to file log.
 *
 * @param {object} opts
 * @param {string} opts.to           — recipient address
 * @param {string} opts.subject      — email subject
 * @param {string} opts.html         — HTML body
 * @param {string} [opts.text]       — plaintext body
 * @param {string} [opts.unsubToken] — token for List-Unsubscribe header
 * @param {object} [opts.headers]    — extra headers to merge
 *
 * @returns {Promise<{ mode: 'smtp'|'log', messageId: string, deliveredAt: string }>}
 */
async function sendEmail({ to, subject, html, text = '', unsubToken = '', headers = {} }) {
  // Validate recipient
  if (!to || typeof to !== 'string' || !EMAIL_REGEX.test(to)) {
    throw new Error(`sendEmail: invalid 'to' address: ${JSON.stringify(to)}`);
  }

  const messageId = randomUUID();
  const deliveredAt = new Date().toISOString();

  // Build List-Unsubscribe header
  const unsubUrl = `${BASE_URL}/api/affirmations/unsubscribe?token=${encodeURIComponent(unsubToken)}`;
  const listUnsubscribe = `<${unsubUrl}>`;
  const mergedHeaders = {
    'List-Unsubscribe': listUnsubscribe,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    ...headers,
  };

  const smtpReady =
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (smtpReady) {
    // Attempt to load nodemailer — fall through to log mode if unavailable
    let nodemailer;
    try {
      nodemailer = require('nodemailer');
    } catch (_) {
      console.warn('[email-sender] nodemailer not installed — falling back to log mode');
    }

    if (nodemailer) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        text,
        headers: mergedHeaders,
        messageId: `<${messageId}@empress.health>`,
      });

      console.log(`[email-sender] SMTP sent to ${to}: ${info.messageId}`);
      return { mode: 'smtp', messageId, deliveredAt };
    }
  }

  // ── File-log mode ────────────────────────────────────────────────────────────
  const record = {
    timestamp: deliveredAt,
    to,
    subject,
    snippet: text.slice(0, 120),
    messageId,
    mode: 'log',
    unsubUrl,
  };

  fs.appendFileSync(LOG_PATH, JSON.stringify(record) + '\n', 'utf8');
  console.log(`[email-sender] LOG → ${LOG_PATH} | to:${to} | ${subject}`);

  return { mode: 'log', messageId, deliveredAt };
}

module.exports = { sendEmail };
