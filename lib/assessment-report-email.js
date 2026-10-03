'use strict';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CATEGORIES = 10;
const MAX_PRIORITIES = 3;
const MAX_AFFIRMATIONS = 12;
const MAX_PROVIDERS = 6;
const MAX_PRODUCTS = 8;
const STAGES = ['perimenopause', 'menopause', 'post_menopause'];

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

// Only plain web links survive — these end up in href attributes.
function cleanUrl(value) {
  const url = cleanText(value, 300);
  return /^https?:\/\/[^\s"'<>]+$/i.test(url) ? url : '';
}

function cleanRefs(value) {
  return Array.isArray(value)
    ? value.slice(0, 12).map((ref) => cleanText(ref, 120)).filter(Boolean)
    : [];
}

function cleanAffirmation(item) {
  const text = cleanText(typeof item === 'string' ? item : item && item.text, 500);
  if (!text) return null;
  const focus = cleanText(item && item.focus_domain, 80);
  const caption = cleanText(item && item.caption, 200);
  return {
    text,
    focus_domain: focus || undefined,
    evidence_refs: cleanRefs(item && item.evidence_refs),
    ...(caption ? {
      caption,
      description: cleanText(item.description, 400),
      theme: cleanText(item.theme, 40) || undefined,
    } : {}),
  };
}

function cleanClinician(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const label = cleanText(raw.label, 120);
  if (!label) return null;
  return {
    specialty_id: cleanText(raw.specialty_id, 60) || undefined,
    label,
    abbreviation: cleanText(raw.abbreviation, 20) || undefined,
    reason: cleanText(raw.reason, 600),
    find_provider_url: cleanUrl(raw.find_provider_url) || undefined,
    evidence_refs: cleanRefs(raw.evidence_refs),
  };
}

function cleanProvider(raw) {
  const name = cleanText(raw && raw.name, 120);
  if (!name) return null;
  return {
    name,
    qualification: cleanText(raw.qualification, 120) || undefined,
    category: cleanText(raw.category, 80) || undefined,
    state: cleanText(raw.state, 60) || undefined,
    address: cleanText(raw.address, 200) || undefined,
    phone: cleanText(raw.phone, 40) || undefined,
    website: cleanUrl(raw.website) || undefined,
    linkedin: cleanUrl(raw.linkedin) || undefined,
    zip: cleanText(raw.zip, 12) || undefined,
  };
}

function cleanProduct(raw) {
  const name = cleanText(raw && (raw.product_name || raw.name), 160);
  if (!name) return null;
  return {
    product_name: name,
    shopify_handle: cleanText(raw.shopify_handle, 120) || undefined,
    brand: cleanText(raw.brand, 80) || undefined,
    reason: cleanText(raw.reason, 400),
    empress_alts: Array.isArray(raw.empress_alts) ? raw.empress_alts.slice(0, 6).map((a) => cleanText(a, 100)).filter(Boolean) : undefined,
    thorne_alts: Array.isArray(raw.thorne_alts) ? raw.thorne_alts.slice(0, 6).map((a) => cleanText(a, 100)).filter(Boolean) : undefined,
    evidence_refs: cleanRefs(raw.evidence_refs),
  };
}

/**
 * The recommendation payload shared by the email body and the PDF render:
 * affirmations, clinician match, nearby providers, matched products.
 */
function cleanApiResult(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};
  const affirmationSource = Array.isArray(input.affirmations)
    ? input.affirmations
    : (input.affirmations && Array.isArray(input.affirmations.affirmations) ? input.affirmations.affirmations : []);
  return {
    affirmations: affirmationSource.slice(0, MAX_AFFIRMATIONS).map(cleanAffirmation).filter(Boolean),
    recommendations: [],
    products: Array.isArray(input.products)
      ? input.products.slice(0, MAX_PRODUCTS).map((p) => cleanText(typeof p === 'string' ? p : p && p.name, 160)).filter(Boolean)
      : [],
    productsResponse: cleanText(input.productsResponse, 800),
    errors: [],
    clinician: cleanClinician(input.clinician) || undefined,
    poi_flag: input.poi_flag === true ? true : undefined,
    groundedProducts: Array.isArray(input.groundedProducts)
      ? input.groundedProducts.slice(0, MAX_PRODUCTS).map(cleanProduct).filter(Boolean)
      : undefined,
    providers: Array.isArray(input.providers)
      ? input.providers.slice(0, MAX_PROVIDERS).map(cleanProvider).filter(Boolean)
      : undefined,
    providersState: cleanText(input.providersState, 60) || undefined,
    source: cleanText(input.source, 30) || undefined,
  };
}

/**
 * Validate the client-supplied report state that the server renders to PDF.
 * Returns a PrintRenderState (see prds/printMode.ts) or null when the payload
 * is missing/malformed — the email then goes out without a PDF.
 */
function normaliseReportState(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const responses = {};
  const source = raw.responses && typeof raw.responses === 'object' ? raw.responses : {};
  for (const [key, value] of Object.entries(source)) {
    const id = Number(key);
    const answer = Number(value);
    if (Number.isInteger(id) && id >= 1 && id <= 120 && Number.isFinite(answer) && answer >= 0 && answer <= 10) {
      responses[id] = answer;
    }
  }
  // No minimum: untouched sliders stay at their default and are simply absent,
  // exactly as on screen — the PDF must render the same report the member saw.

  const user = raw.user && typeof raw.user === 'object' ? raw.user : {};
  const age = Number(user.age);
  const completedAt = typeof raw.completedAt === 'string' && !Number.isNaN(Date.parse(raw.completedAt))
    ? new Date(raw.completedAt).toISOString()
    : new Date().toISOString();
  return {
    user: {
      firstName: cleanText(user.firstName, 80),
      age: Number.isFinite(age) && age >= 18 && age <= 120 ? Math.round(age) : 0,
      usState: cleanText(user.usState, 60) || undefined,
      zip: cleanText(user.zip, 12) || undefined,
    },
    stage: STAGES.includes(raw.stage) ? raw.stage : null,
    mhtActive: raw.mhtActive === true,
    responses,
    completedAt,
    apiResult: cleanApiResult(raw.apiResult),
  };
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

  // Full recommendation set comes from report.apiResult; the flat
  // `affirmations` array is the older, summary-only shape.
  const report = normaliseReportState(input.report);
  const apiResult = report ? report.apiResult : cleanApiResult({
    affirmations: Array.isArray(input.affirmations) ? input.affirmations : [],
  });

  return {
    to,
    firstName: cleanText(input.firstName, 80),
    overall,
    band: cleanText(input.band, 40),
    stage: cleanText(input.stage, 40),
    completedAt: cleanText(input.completedAt, 60),
    categoryScores,
    priorities,
    affirmations: apiResult.affirmations.map((item) => item.text),
    affirmationItems: apiResult.affirmations,
    clinician: apiResult.clinician || null,
    providers: apiResult.providers || [],
    providersState: apiResult.providersState || '',
    products: (apiResult.groundedProducts && apiResult.groundedProducts.length
      ? apiResult.groundedProducts.map((p) => ({ name: p.product_name, reason: p.reason, brand: p.brand }))
      : apiResult.products.map((name) => ({ name, reason: '' }))),
    poiFlag: apiResult.poi_flag === true,
    report,
  };
}

// Email type is deliberately large: 18px body, 26px+ headings. The report is
// read on phones, often by women who asked for bigger text.
const FONT = 'Arial,Helvetica,sans-serif';
const HEADING = 'Georgia,serif';

function renderAssessmentResultEmail(payload, options = {}) {
  const { pdfName = '', pdfPages = 0 } = options;
  const hasPdf = Boolean(pdfName);
  const hello = payload.firstName ? `Hi ${payload.firstName},` : 'Hi there,';
  const band = payload.band || 'Your personalised result';
  const h2 = (text) => `<h2 style="font-family:${HEADING};font-size:26px;line-height:1.3;margin:34px 0 12px;color:#3f144a;">${text}</h2>`;
  const card = (inner) => `<div style="background:#ffffff;border:1px solid #eadfdf;border-radius:10px;padding:16px 18px;margin:0 0 12px;">${inner}</div>`;

  const categoryRows = payload.categoryScores.map((item) => `
    <tr>
      <td style="padding:12px 12px;border-bottom:1px solid #eadfdf;font-size:18px;">${escapeHtml(item.title)}</td>
      <td style="padding:12px 12px;border-bottom:1px solid #eadfdf;text-align:right;font-weight:700;font-size:18px;white-space:nowrap;">${item.score}/100</td>
    </tr>`).join('');
  const priorityItems = payload.priorities.map((item) =>
    `<li style="margin:0 0 10px;">${escapeHtml(item.title)}${item.score === null ? '' : ` — ${item.score}/100`}</li>`
  ).join('');
  // Library affirmations carry a caption + supporting line; older ones are one string.
  const affirmationItems = (payload.affirmationItems && payload.affirmationItems.length
    ? payload.affirmationItems
    : payload.affirmations.map((text) => ({ text }))
  ).map((item) => item.caption
    ? `<li style="margin:0 0 18px;line-height:1.5;"><span style="font-family:${HEADING};font-style:italic;font-size:21px;font-weight:700;">&ldquo;${escapeHtml(item.caption)}&rdquo;</span>${item.theme ? ` <span style="font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#705177;">· ${escapeHtml(item.theme)}</span>` : ''}<br><span style="font-size:18px;">${escapeHtml(item.description)}</span></li>`
    : `<li style="margin:0 0 14px;font-family:${HEADING};font-style:italic;font-size:20px;line-height:1.5;">&ldquo;${escapeHtml(item.text)}&rdquo;</li>`
  ).join('');

  const clinician = payload.clinician;
  const clinicianHtml = clinician ? card(`
      <div style="font-size:22px;font-weight:700;font-family:${HEADING};">${escapeHtml(clinician.label)}${clinician.abbreviation ? ` <span style="font-size:17px;color:#705177;">(${escapeHtml(clinician.abbreviation)})</span>` : ''}</div>
      ${clinician.reason ? `<p style="margin:8px 0 0;">${escapeHtml(clinician.reason)}</p>` : ''}
      ${clinician.find_provider_url ? `<p style="margin:12px 0 0;"><a href="${escapeHtml(clinician.find_provider_url)}" style="color:#6b2d5e;font-weight:700;">Find a ${escapeHtml(clinician.abbreviation || 'specialist')} near you &rarr;</a></p>` : ''}`) : '';
  const providerCards = payload.providers.map((p) => card(`
      <div style="font-size:20px;font-weight:700;">${escapeHtml(p.name)}</div>
      ${p.qualification ? `<div style="color:#705177;">${escapeHtml(p.qualification)}</div>` : ''}
      ${p.address ? `<div>${escapeHtml(p.address)}</div>` : ''}
      ${p.phone ? `<div>${escapeHtml(p.phone)}</div>` : ''}
      ${p.website ? `<div><a href="${escapeHtml(p.website)}" style="color:#6b2d5e;">Visit website</a></div>` : ''}`)).join('');
  const productCards = payload.products.map((p) => card(`
      <div style="font-size:20px;font-weight:700;">${escapeHtml(p.name)}${p.brand ? ` <span style="font-size:16px;color:#705177;font-weight:400;">· ${escapeHtml(p.brand)}</span>` : ''}</div>
      ${p.reason ? `<div style="margin-top:4px;">${escapeHtml(p.reason)}</div>` : ''}`)).join('');

  const intro = hasPdf
    ? `Your complete Health Intelligence Report${pdfPages ? ` (${pdfPages} pages)` : ''} is attached to this email as a PDF &mdash; keep it, print it, or bring it to your next appointment. The highlights are below.`
    : 'You completed the Peri+ Menopause Health Intelligence Assessment. Here are your results for your records.';

  const html = `
    <div style="font-family:${FONT};font-size:18px;max-width:660px;margin:0 auto;color:#3f144a;line-height:1.6;">
      <div style="background:#3f144a;padding:34px 24px;text-align:center;border-radius:14px 14px 0 0;">
        <div style="color:#d8a738;letter-spacing:.18em;font-size:14px;font-weight:700;">EMPRESS HEALTH.AI</div>
        <h1 style="color:#fff;font-family:${HEADING};font-size:30px;line-height:1.25;margin:12px 0 0;">Your Health Intelligence Results</h1>
      </div>
      <div style="background:#fefcf8;padding:30px 24px;border:1px solid #eadfdf;border-top:0;border-radius:0 0 14px 14px;">
        <p style="margin:0 0 14px;">${escapeHtml(hello)}</p>
        <p style="margin:0 0 14px;">${intro}</p>
        <div style="background:#f3e5d3;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
          <div style="font-size:64px;font-family:${HEADING};font-weight:700;line-height:1;">${payload.overall}<span style="font-size:24px;color:#705177;">/100</span></div>
          <div style="margin-top:10px;font-weight:700;font-size:20px;">${escapeHtml(band)}</div>
        </div>
        ${payload.stage ? `<p style="margin:0 0 6px;"><strong>Menopause stage:</strong> ${escapeHtml(payload.stage.replace(/_/g, ' '))}</p>` : ''}
        ${categoryRows ? `${h2('Your 10 body systems')}<table style="width:100%;border-collapse:collapse;background:#fff;">${categoryRows}</table>` : ''}
        ${priorityItems ? `${h2('Priority areas')}<ul style="padding-left:24px;margin:0;">${priorityItems}</ul>` : ''}
        ${payload.poiFlag ? `<div style="background:#f3e5d3;border-radius:10px;padding:16px 18px;margin:22px 0 0;"><strong>Worth a conversation:</strong> your profile suggests asking about Premature Ovarian Insufficiency (POI) evaluation. A NAMS-certified practitioner or endocrinologist can confirm with an FSH/estradiol panel.</div>` : ''}
        ${affirmationItems ? `${h2('Your personalised affirmations')}<ul style="padding-left:24px;margin:0;">${affirmationItems}</ul>` : ''}
        ${clinicianHtml || providerCards ? `${h2('Clinicians matched to you')}${clinicianHtml}${providerCards ? `<p style="margin:16px 0 10px;font-weight:700;">Menopause-trained providers${payload.providersState ? ` in ${escapeHtml(payload.providersState)}` : ' near you'}</p>${providerCards}` : ''}` : ''}
        ${productCards ? `${h2('Products matched to your results')}${productCards}<p style="font-size:15px;color:#705177;margin:8px 0 0;">Educational only &mdash; check with your doctor before starting a supplement.</p>` : ''}
        <p style="margin:30px 0 0;">${hasPdf
          ? 'Everything above, with the full body-system breakdown, your do&rsquo;s and don&rsquo;ts, and next steps, is in the attached PDF.'
          : 'Your full report remains available in the browser where you completed the assessment. Use <strong>Print / Save as PDF</strong> at the end of the report to keep the complete version.'}</p>
        <p style="font-size:15px;color:#705177;background:#fff;border:1px solid #eadfdf;border-radius:8px;padding:16px;margin:26px 0 0;line-height:1.55;"><strong>Important:</strong> This wellness assessment is not a medical diagnosis or treatment recommendation. Discuss symptoms, medicines, supplements, and treatment decisions with a qualified healthcare professional.</p>
        <p style="font-size:16px;margin:18px 0 0;">Questions? <a href="mailto:hello@empresshealth.ai" style="color:#6b2d5e;">hello@empresshealth.ai</a></p>
      </div>
    </div>`;

  const lines = [
    hello,
    '',
    hasPdf
      ? `Your complete Health Intelligence Report${pdfPages ? ` (${pdfPages} pages)` : ''} is attached as a PDF. The highlights are below.`
      : 'You completed the Peri+ Menopause Health Intelligence Assessment.',
    `Health Intelligence Score: ${payload.overall}/100 (${band})`,
    payload.stage ? `Menopause stage: ${payload.stage.replace(/_/g, ' ')}` : '',
    '',
    payload.categoryScores.length ? 'Your 10 body systems:' : '',
    ...payload.categoryScores.map((item) => `- ${item.title}: ${item.score}/100`),
    '',
    payload.priorities.length ? 'Priority areas:' : '',
    ...payload.priorities.map((item) => `- ${item.title}${item.score === null ? '' : ` — ${item.score}/100`}`),
    '',
    payload.affirmations.length ? 'Personalised affirmations:' : '',
    ...payload.affirmations.map((item) => `- ${item}`),
    '',
    clinician ? `Clinician match: ${clinician.label}${clinician.abbreviation ? ` (${clinician.abbreviation})` : ''}` : '',
    clinician && clinician.reason ? clinician.reason : '',
    clinician && clinician.find_provider_url ? `Find one: ${clinician.find_provider_url}` : '',
    payload.providers.length ? `Menopause-trained providers${payload.providersState ? ` in ${payload.providersState}` : ''}:` : '',
    ...payload.providers.map((p) => `- ${[p.name, p.qualification, p.address, p.phone].filter(Boolean).join(' · ')}`),
    '',
    payload.products.length ? 'Products matched to your results:' : '',
    ...payload.products.map((p) => `- ${p.name}${p.reason ? ` — ${p.reason}` : ''}`),
    '',
    hasPdf ? '' : 'Your full report remains available in the browser where you completed the assessment. Use Print / Save as PDF to keep the complete version.',
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
  normaliseReportState,
  renderAssessmentResultEmail,
};
