import assert from "node:assert/strict"
import emailModule from "../lib/assessment-report-email.js"

const { normaliseAssessmentEmailPayload, renderAssessmentResultEmail } = emailModule

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
