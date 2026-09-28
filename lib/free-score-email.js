// lib/free-score-email.js — the emailed copy of a free 12-question score
// (menopause Health Intelligence screener or Sleep Score).
//
// It carries the same substance as the results page: both scores, the four
// domain scores, her top concern with its actions, clinical flags, and the
// matched products — so the email is a report she can keep and show her
// provider, not just a number.

"use strict";

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));
const clip = (v, n) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, n) : "");
const num = (v, lo, hi) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= lo && n <= hi ? Math.round(n) : null;
};

/** Validate/limit the client-built report block. Unknown shapes → empty sections. */
function normaliseReport(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const list = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);
  return {
    domains: list(r.domains, 4).map((d) => ({
      name: clip(d && d.name, 60), score: num(d && d.score, 0, 100), band: clip(d && d.band, 30),
    })).filter((d) => d.name && d.score !== null),
    topConcern: r.topConcern && typeof r.topConcern === "object" ? {
      name: clip(r.topConcern.name, 60),
      summary: clip(r.topConcern.summary, 600),
      actions: list(r.topConcern.actions, 4).map((a) => clip(a, 300)).filter(Boolean),
    } : null,
    strongest: clip(r.strongest, 60),
    flags: list(r.flags, 6).map((f) => ({
      label: clip(f && f.label, 80), note: clip(f && f.note, 300), response: num(f && f.response, 0, 3),
    })).filter((f) => f.label),
    products: list(r.products, 6).map((p) => ({
      name: clip(p && p.name, 120), why: clip(p && p.why, 200), for: clip(p && p.for, 40),
    })).filter((p) => p.name),
  };
}

function renderFreeScoreEmail({ track, firstName, stage, score, scoreBand, burden, burdenBand, report, siteUrl }) {
  const R = normaliseReport(report);
  const hello = firstName ? `Hi ${esc(firstName)},` : "Hi there,";
  const stageLabel = stage ? esc(String(stage).replace(/_/g, " ")) : "";
  const h2 = (t) => `<h2 style="font-family:Georgia,serif;font-size:18px;color:#3f144a;margin:26px 0 10px;">${t}</h2>`;
  const site = (siteUrl || "https://empresshealth.ai").replace(/\/$/, "");

  const domainRows = R.domains.map((d) => `
      <tr>
        <td style="padding:9px 10px;border-bottom:1px solid #eadfdf;">${esc(d.name)}</td>
        <td style="padding:9px 10px;border-bottom:1px solid #eadfdf;text-align:right;white-space:nowrap;"><strong>${d.score}</strong>/100</td>
        <td style="padding:9px 10px;border-bottom:1px solid #eadfdf;text-align:right;color:#7B3F63;white-space:nowrap;">${esc(d.band)}</td>
      </tr>`).join("");

  const top = R.topConcern;
  const topHtml = top && top.name ? `
      ${h2(`Your top concern: ${esc(top.name)}`)}
      ${top.summary ? `<p style="margin:0 0 12px;">${esc(top.summary)}</p>` : ""}
      ${top.actions.length ? `<p style="margin:0 0 6px;font-weight:700;">What to do next</p>
      <ol style="margin:0;padding-left:20px;">${top.actions.map((a) => `<li style="margin:0 0 6px;">${esc(a)}</li>`).join("")}</ol>` : ""}` : "";

  const flagsHtml = R.flags.length ? `
      ${h2("Worth raising with your provider")}
      ${R.flags.map((f) => `<div style="background:#fff;border:1px solid #eadfdf;border-left:3px solid #D8A738;border-radius:8px;padding:10px 12px;margin:0 0 8px;">
        <strong>${esc(f.label)}</strong>${f.response !== null ? ` — your answer ${f.response}/3` : ""}<br>
        <span style="color:#5b4a60;">${esc(f.note)}</span></div>`).join("")}` : "";

  const productsHtml = R.products.length ? `
      ${h2("Products matched to your results")}
      <ul style="margin:0;padding-left:20px;">${R.products.map((p) => `<li style="margin:0 0 8px;"><strong>${esc(p.name)}</strong>${p.for ? ` <span style="color:#7B3F63;">(${esc(p.for)})</span>` : ""}<br><span style="color:#5b4a60;">${esc(p.why)}</span></li>`).join("")}</ul>
      <p style="font-size:12px;color:#705177;margin:8px 0 0;">Educational only — check with your doctor before starting a supplement.</p>` : "";

  const html = `
  <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#3a2030;line-height:1.55;">
    <div style="background:#3f144a;padding:28px 24px;border-radius:12px 12px 0 0;text-align:center;">
      <p style="color:#D8A738;letter-spacing:.18em;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 6px;font-family:Arial,sans-serif;">Empress Health</p>
      <p style="color:#ffffff;font-size:20px;margin:0;">Your ${esc(track.screener)} Results</p>
    </div>
    <div style="background:#FEFCF8;padding:24px;border:1px solid #eadfdf;border-top:0;border-radius:0 0 12px 12px;">
      <p>${hello}</p>
      <p>Here is your full results report. Keep it for your records or share it with your healthcare provider.</p>
      <table style="width:100%;border-collapse:separate;border-spacing:8px 0;margin:18px 0;">
        <tr>
          <td style="padding:14px;background:#fff;border:1px solid #eadfdf;border-radius:10px;width:50%;text-align:center;">
            <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#7B3F63;font-family:Arial,sans-serif;">${esc(track.scoreLabel)}</div>
            <div style="font-size:40px;font-weight:700;color:#3f144a;line-height:1.1;">${score != null ? score : "—"}<span style="font-size:15px;color:#999;">/100</span></div>
            <div style="font-size:13px;color:#7B3F63;">${esc(scoreBand)} · higher is better</div>
          </td>
          <td style="padding:14px;background:#fff;border:1px solid #eadfdf;border-radius:10px;width:50%;text-align:center;">
            <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#7B3F63;font-family:Arial,sans-serif;">${esc(track.burdenLabel)}</div>
            <div style="font-size:40px;font-weight:700;color:#3f144a;line-height:1.1;">${burden != null ? burden : "—"}<span style="font-size:15px;color:#999;">/36</span></div>
            <div style="font-size:13px;color:#7B3F63;">${esc(burdenBand)} · lower is better</div>
          </td>
        </tr>
      </table>
      ${stageLabel ? `<p style="font-size:14px;margin:0 0 4px;">Life stage: <strong style="text-transform:capitalize;">${stageLabel}</strong></p>` : ""}
      ${R.strongest ? `<p style="font-size:14px;margin:0;">Your strongest area: <strong>${esc(R.strongest)}</strong></p>` : ""}
      ${domainRows ? `${h2("Your four areas")}<table style="width:100%;border-collapse:collapse;background:#fff;font-size:14px;">${domainRows}</table>` : ""}
      ${topHtml}
      ${flagsHtml}
      ${productsHtml}
      <div style="background:#f3e5d3;border-radius:10px;padding:18px;margin:28px 0 0;text-align:center;">
        <p style="margin:0 0 10px;">This 12-question screener is a snapshot. The full 120-question Health Intelligence assessment maps all 10 body systems and matches you with clinicians near you.</p>
        <a href="${site}/assessment/?tier=paid" style="display:inline-block;background:#3f144a;color:#fff;text-decoration:none;padding:11px 22px;border-radius:10px;font-family:Arial,sans-serif;font-weight:700;font-size:14px;">Take the full assessment</a>
        <p style="margin:12px 0 0;font-size:13px;"><a href="${site}/account" style="color:#3f144a;">Create a free account</a> to keep your results in one place.</p>
      </div>
      <p style="font-size:12px;color:#777;line-height:1.7;background:#fff;border:1px solid #eee;border-radius:8px;padding:14px;margin-top:22px;">
        <strong>Disclaimer:</strong> This is a wellness assessment tool only — not a medical diagnosis,
        clinical assessment, or treatment recommendation. Always talk to your doctor before starting a new
        supplement or treatment.
      </p>
      <p style="font-size:13px;">Questions? <a href="mailto:hello@empresshealth.ai" style="color:#7B3F63;">hello@empresshealth.ai</a></p>
    </div>
  </div>`;

  const lines = [
    firstName ? `Hi ${firstName},` : "Hi there,",
    "",
    `Your ${track.screener} results`,
    `${track.scoreLabel}: ${score != null ? score : "—"}/100 (${scoreBand}) — higher is better`,
    `${track.burdenLabel}: ${burden != null ? burden : "—"}/36 (${burdenBand}) — lower is better`,
    stage ? `Life stage: ${String(stage).replace(/_/g, " ")}` : "",
    R.strongest ? `Strongest area: ${R.strongest}` : "",
    "",
    ...(R.domains.length ? ["Your four areas:", ...R.domains.map((d) => `- ${d.name}: ${d.score}/100 (${d.band})`), ""] : []),
    ...(top && top.name ? [`Top concern: ${top.name}`, top.summary, ...top.actions.map((a, i) => `${i + 1}. ${a}`), ""] : []),
    ...(R.flags.length ? ["Worth raising with your provider:", ...R.flags.map((f) => `- ${f.label}: ${f.note}`), ""] : []),
    ...(R.products.length ? ["Products matched to your results:", ...R.products.map((p) => `- ${p.name} — ${p.why}`), ""] : []),
    `Take the full 120-question assessment: ${site}/assessment/?tier=paid`,
    "",
    "Disclaimer: This is a wellness assessment tool only — not a medical diagnosis.",
    "Questions? hello@empresshealth.ai",
  ].filter((l) => l !== undefined && l !== null);

  return { subject: track.subject, html, text: lines.join("\n").replace(/\n{3,}/g, "\n\n") };
}

module.exports = { renderFreeScoreEmail, normaliseReport };
