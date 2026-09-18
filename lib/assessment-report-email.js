'use strict';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CATEGORIES = 10;
const MAX_PRIORITIES = 3;
const MAX_AFFIRMATIONS = 5;

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function cleanScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > 100) return null;
  return Math.round(score);
}

function normaliseAssessmentEmailPayload(body) {
  const input = body && typeof body === 'object' ? body : {};
  const to = cleanText(input.email, 200).toLowerCase();
  if (!EMAIL_REGEX.test(to)) {
    throw new Error('A valid email address is required.');
  }

  const overall = cleanScore(input.overall);
  if (overall === null) {
    throw new Error('A valid Health Intelligence score is required.');
  }

  const categoryScores = Array.isArray(input.categoryScores)
    ? input.categoryScores.slice(0, MAX_CATEGORIES).map((item) => ({
        title: cleanText(item && (item.title || item.categoryTitle), 100),
        score: cleanScore(item && item.score),
        status: cleanText(item && item.status, 30),
      })).filter((item) => item.title && item.score !== null)
    : [];

  const priorities = Array.isArray(input.priorities)
    ? input.priorities.slice(0, MAX_PRIORITIES).map((item) => ({
        title: cleanText(item && (item.title || item.categoryTitle), 100),
        score: cleanScore(item && item.score),
      })).filter((item) => item.title)
    : [];

  const affirmations = Array.isArray(input.affirmations)
    ? input.affirmations.slice(0, MAX_AFFIRMATIONS)
        .map((item) => cleanText(typeof item === 'string' ? item : item && item.text, 500))
        .filter(Boolean)
    : [];

  return {
    to,
    firstName: cleanText(input.firstName, 80),
    overall,
    band: cleanText(input.band, 40),
    stage: cleanText(input.stage, 40),
    completedAt: cleanText(input.completedAt, 60),
    categoryScores,
    priorities,
    affirmations,
  };
}

function renderAssessmentResultEmail(payload) {
  const hello = payload.firstName ? `Hi ${payload.firstName},` : 'Hi there,';
  const band = payload.band || 'Your personalised result';
  const categoryRows = payload.categoryScores.map((item) => `
    <tr>
      <td style="padding:9px 10px;border-bottom:1px solid #eadfdf;">${escapeHtml(item.title)}</td>
      <td style="padding:9px 10px;border-bottom:1px solid #eadfdf;text-align:right;font-weight:700;">${item.score}/100</td>
    </tr>`).join('');
  const priorityItems = payload.priorities.map((item) =>
    `<li style="margin:0 0 8px;">${escapeHtml(item.title)}${item.score === null ? '' : ` — ${item.score}/100`}</li>`
  ).join('');
  const affirmationItems = payload.affirmations.map((item) =>
    `<li style="margin:0 0 8px;">${escapeHtml(item)}</li>`
  ).join('');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto;color:#3f144a;line-height:1.55;">
      <div style="background:#3f144a;padding:30px 24px;text-align:center;border-radius:14px 14px 0 0;">
        <div style="color:#d8a738;letter-spacing:.18em;font-size:11px;font-weight:700;">EMPRESS HEALTH.AI</div>
        <h1 style="color:#fff;font-family:Georgia,serif;font-size:24px;margin:10px 0 0;">Your Health Intelligence Results</h1>
      </div>
      <div style="background:#fefcf8;padding:28px 24px;border:1px solid #eadfdf;border-top:0;border-radius:0 0 14px 14px;">
        <p>${escapeHtml(hello)}</p>
        <p>You completed the Peri+ Menopause Health Intelligence Assessment. Here is a concise copy of your results for your records.</p>
        <div style="background:#f3e5d3;border-radius:12px;padding:20px;text-align:center;margin:22px 0;">
          <div style="font-size:48px;font-family:Georgia,serif;font-weight:700;line-height:1;">${payload.overall}<span style="font-size:17px;color:#705177;">/100</span></div>
          <div style="margin-top:8px;font-weight:700;">${escapeHtml(band)}</div>
        </div>
        ${payload.stage ? `<p><strong>Menopause stage:</strong> ${escapeHtml(payload.stage.replace(/_/g, ' '))}</p>` : ''}
        ${categoryRows ? `<h2 style="font-family:Georgia,serif;font-size:19px;">Your 10 body systems</h2><table style="width:100%;border-collapse:collapse;background:#fff;">${categoryRows}</table>` : ''}
        ${priorityItems ? `<h2 style="font-family:Georgia,serif;font-size:19px;margin-top:26px;">Priority areas</h2><ul>${priorityItems}</ul>` : ''}
        ${affirmationItems ? `<h2 style="font-family:Georgia,serif;font-size:19px;margin-top:26px;">Personalised affirmations</h2><ul>${affirmationItems}</ul>` : ''}
        <p style="margin-top:28px;">Your full report remains available in the browser where you completed the assessment. Use <strong>Print / Save as PDF</strong> at the end of the report to keep the complete version.</p>
        <p style="font-size:12px;color:#705177;background:#fff;border:1px solid #eadfdf;border-radius:8px;padding:14px;margin-top:24px;"><strong>Important:</strong> This wellness assessment is not a medical diagnosis or treatment recommendation. Discuss symptoms, medicines, supplements, and treatment decisions with a qualified healthcare professional.</p>
        <p style="font-size:13px;">Questions? <a href="mailto:hello@empresshealth.ai" style="color:#6b2d5e;">hello@empresshealth.ai</a></p>
      </div>
    </div>`;

  const lines = [
    hello,
    '',
    'You completed the Peri+ Menopause Health Intelligence Assessment.',
    `Health Intelligence Score: ${payload.overall}/100 (${band})`,
    payload.stage ? `Menopause stage: ${payload.stage.replace(/_/g, ' ')}` : '',
    '',
    payload.priorities.length ? 'Priority areas:' : '',
    ...payload.priorities.map((item) => `- ${item.title}${item.score === null ? '' : ` — ${item.score}/100`}`),
    '',
    payload.affirmations.length ? 'Personalised affirmations:' : '',
    ...payload.affirmations.map((item) => `- ${item}`),
    '',
    'Your full report remains available in the browser where you completed the assessment. Use Print / Save as PDF to keep the complete version.',
    '',
    'Important: This wellness assessment is not a medical diagnosis or treatment recommendation.',
    'Questions? hello@empresshealth.ai',
  ].filter((line, index, all) => line !== '' || (index > 0 && all[index - 1] !== ''));

  return {
    subject: `${payload.firstName ? `${payload.firstName}, y` : 'Y'}our Empress Health assessment results`,
    html,
    text: lines.join('\n'),
  };
}

module.exports = {
  normaliseAssessmentEmailPayload,
  renderAssessmentResultEmail,
};
