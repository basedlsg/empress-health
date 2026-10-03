import assert from "node:assert/strict"
import emailModule from "../lib/assessment-report-email.js"
import sampleModule from "../lib/report-sample-state.js"

const { buildSampleState } = sampleModule
const escapeForHtml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const { normaliseAssessmentEmailPayload, normaliseReportState, renderAssessmentResultEmail } = emailModule

const payload = normaliseAssessmentEmailPayload({
  email: "  TEST@example.com ",
  firstName: "Sarah <script>alert(1)</script>",
  overall: 63.6,
  band: "Managing",
  stage: "perimenopause",
  categoryScores: [
    { title: "Sleep & recovery", score: 48, status: "Priority" },
    { title: "Mood", score: 72, status: "Strong" },
  ],
  priorities: [{ title: "Sleep & recovery", score: 48 }],
  affirmations: ["My body is communicating — not failing."],
})

assert.equal(payload.to, "test@example.com")
assert.equal(payload.overall, 64)
assert.equal(payload.categoryScores.length, 2)

const message = renderAssessmentResultEmail(payload)
assert.match(message.subject, /Sarah/)
assert.match(message.text, /Health Intelligence Score: 64\/100/)
assert.match(message.html, /Sleep &amp; recovery/)
assert.doesNotMatch(message.html, /<script>/)
assert.match(message.html, /&lt;script&gt;/)

assert.throws(
  () => normaliseAssessmentEmailPayload({ email: "not-an-email", overall: 70 }),
  /valid email address/i,
)
assert.throws(
  () => normaliseAssessmentEmailPayload({ email: "test@example.com", overall: 101 }),
  /valid Health Intelligence score/i,
)

console.log("PASS: assessment result email payload validation and rendering")

// ── Full report payload: affirmations, clinician, providers, products ─────────
const sample = buildSampleState()
const full = normaliseAssessmentEmailPayload({
  email: "maya@example.test",
  firstName: "Maya",
  overall: 52,
  band: "Struggling",
  stage: "perimenopause",
  categoryScores: [{ title: "Sleep", score: 29, status: "Severe" }],
  priorities: [{ title: "Sleep", score: 29 }],
  report: {
    user: sample.user, stage: sample.stage, mhtActive: false,
    responses: sample.responses, completedAt: sample.completedAt,
    apiResult: {
      ...sample.apiResult,
      poi_flag: true,
      // hostile values must not survive into href attributes
      providers: [{ name: "Dr. <b>X</b>", website: "javascript:alert(1)" }, ...sample.apiResult.providers],
    },
  },
})
assert.equal(full.affirmations.length, 6)
assert.ok(full.affirmationItems.every((a) => a.caption && a.description && a.theme), 'library affirmations keep caption, description and theme')
assert.equal(full.providers.length, 3)
assert.equal(full.products.length, 2)
assert.equal(full.clinician.label, "Menopause-Certified NAMS Practitioner")
assert.ok(full.report, "report state kept for PDF rendering")
assert.equal(Object.keys(full.report.responses).length, 120)

const withPdf = renderAssessmentResultEmail(full, { pdfName: "Empress-Report.pdf", pdfPages: 49 })
assert.match(withPdf.html, /attached to this\s+email as a PDF/)
assert.match(withPdf.html, /49 pages/)
assert.match(withPdf.html, /Magnesium Glycinate/)
assert.ok(withPdf.html.includes(escapeForHtml(full.affirmationItems[0].caption)) && withPdf.html.includes(escapeForHtml(full.affirmationItems[0].description)), 'email shows each affirmation caption and its supporting line')
assert.match(withPdf.html, /Amy M\. Stoddard/)
assert.match(withPdf.html, /Menopause-Certified NAMS Practitioner/)
assert.match(withPdf.html, /Premature Ovarian Insufficiency/)
assert.doesNotMatch(withPdf.html, /javascript:/)
assert.doesNotMatch(withPdf.html, /<b>X<\/b>/)
assert.match(withPdf.text, /attached as a PDF/)
assert.match(withPdf.text, /Clinician match: Menopause-Certified/)

// Large type: no body text under 14px, base text 18px.
const sizes = [...withPdf.html.matchAll(/font-size:(\d+)px/g)].map((m) => Number(m[1]))
assert.ok(sizes.every((px) => px >= 14), `smallest email font is ${Math.min(...sizes)}px`)
assert.match(withPdf.html, /font-size:18px;max-width:660px/)

// Without a PDF the body says where the full report lives instead.
const noPdf = renderAssessmentResultEmail(full)
assert.doesNotMatch(noPdf.html, /attached to this/)
assert.match(noPdf.html, /Print \/ Save as PDF/)

// Report-state validation for the PDF renderer
assert.equal(normaliseReportState(null), null)
assert.equal(normaliseReportState({ responses: "nope" }).stage, null)
const clamped = normaliseReportState({ responses: { 1: 4, 999: 5, 2: 11, 3: "x" }, stage: "bogus", user: { firstName: "A", age: 5 } })
assert.deepEqual(clamped.responses, { 1: 4 })
assert.equal(clamped.stage, null)
assert.equal(clamped.user.age, 0)

console.log("PASS: full-report email (affirmations, clinician, providers, products, PDF note, large type) and report-state validation")
