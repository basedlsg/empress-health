'use strict';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));
}

function normalisePaidAccessEmailPayload(body) {
  const input = body && typeof body === 'object' ? body : {};
  const to = String(input.email || '').trim().toLowerCase().slice(0, 200);
  if (!EMAIL_REGEX.test(to)) {
    throw new Error('A valid email address is required.');
  }
  const firstName = String(input.firstName || '').trim().slice(0, 80);
  const code = String(input.code || '').trim().toUpperCase().slice(0, 16);
  if (!code) {
    throw new Error('An access code is required.');
  }
  return { to, firstName, code };
}

function renderPaidAccessEmail(payload) {
  const hello = payload.firstName ? `Hi ${payload.firstName},` : 'Hi there,';
  const helloHtml = payload.firstName ? `Hi ${escapeHtml(payload.firstName)},` : 'Hi there,';

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#3f144a;line-height:1.55;">
      <div style="background:#3f144a;padding:30px 24px;text-align:center;border-radius:14px 14px 0 0;">
        <div style="color:#d8a738;letter-spacing:.18em;font-size:11px;font-weight:700;">EMPRESS HEALTH.AI</div>
        <h1 style="color:#fff;font-family:Georgia,serif;font-size:22px;margin:10px 0 0;">Your Full Report Access Code</h1>
      </div>
      <div style="background:#fefcf8;padding:28px 24px;border:1px solid #eadfdf;border-top:0;border-radius:0 0 14px 14px;">
        <p>${helloHtml}</p>
        <p>Here is your access code for the full 120-question Health Intelligence Assessment and detailed report.</p>
        <div style="background:#f3e5d3;border-radius:12px;padding:22px;text-align:center;margin:22px 0;">
          <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#7B3F63;">Access Code</div>
          <div style="font-size:30px;font-family:Georgia,serif;font-weight:700;letter-spacing:.06em;margin-top:6px;">${escapeHtml(payload.code)}</div>
        </div>
        <p>To use it: go to <strong>empresshealth.ai/pricing</strong>, enter this code in the promo code field, and your full report unlocks immediately — no payment needed.</p>
        <p style="font-size:13px;">Questions? <a href="mailto:hello@empresshealth.ai" style="color:#6b2d5e;">hello@empresshealth.ai</a></p>
      </div>
    </div>`;

  const text = `${hello}\n\nHere is your access code for the full 120-question Health Intelligence Assessment and detailed report.\n\nAccess Code: ${payload.code}\n\nTo use it: go to empresshealth.ai/pricing, enter this code in the promo code field, and your full report unlocks immediately — no payment needed.\n\nQuestions? hello@empresshealth.ai`;

  return {
    subject: 'Your Empress Health full-report access code',
    html,
    text,
  };
}

module.exports = { normalisePaidAccessEmailPayload, renderPaidAccessEmail };
