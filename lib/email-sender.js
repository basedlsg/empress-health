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
function getEmailDeliveryConfig() {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const configured = required.filter((key) => Boolean(process.env[key]));
  return {
    smtpReady: configured.length === required.length,
    partiallyConfigured: configured.length > 0 && configured.length < required.length,
    sender: process.env.SMTP_FROM || process.env.SMTP_USER || null,
    surface: configured.length === required.length ? 'smtp' : 'file-log',
  };
}

async function sendEmail({ to, subject, html, text = '', unsubToken = '', headers = {} }) {
  // Validate recipient
  if (!to || typeof to !== 'string' || !EMAIL_REGEX.test(to)) {
    throw new Error(`sendEmail: invalid 'to' address: ${JSON.stringify(to)}`);
  }

  const messageId = randomUUID();
  const deliveredAt = new Date().toISOString();

  // Transactional messages (assessment results, contact confirmations) do not
  // need an unsubscribe header. Add it only when a real subscription token is
  // supplied, as the daily-affirmations pipeline does.
  const unsubUrl = unsubToken
    ? `${BASE_URL}/api/affirmations/unsubscribe?token=${encodeURIComponent(unsubToken)}`
    : null;
  const mergedHeaders = { ...headers };
  if (unsubUrl) {
    mergedHeaders['List-Unsubscribe'] = `<${unsubUrl}>`;
    mergedHeaders['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  const delivery = getEmailDeliveryConfig();
  if (delivery.partiallyConfigured) {
    throw new Error('Email delivery is partially configured; SMTP_HOST, SMTP_USER, and SMTP_PASS are all required.');
  }

  if (delivery.smtpReady) {
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
        // The app supplies string bodies only. Disallow nodemailer from reading
        // local files or remote URLs if a future caller accidentally passes a
        // content object.
        disableFileAccess: true,
        disableUrlAccess: true,
      });

      const info = await transporter.sendMail({
        from: delivery.sender,
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

module.exports = { sendEmail, getEmailDeliveryConfig };
