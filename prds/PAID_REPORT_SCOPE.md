# Paid-Tier 20-Page Health Intelligence Report — Scoping Note

**Status:** Not yet built. This is the scoping document for step **B2** of the paid assessment flow.

**Author:** Empress Health engineering.
**Last updated:** 2026-04-20.

---

## 1. Where this fits in the flow

The full paid assessment flow (after signup → `/membershipoptions` → purchase) is:

| Step | Name                                | Status        | Notes |
|------|-------------------------------------|---------------|-------|
| B1   | 120-question clinical assessment    | ✅ Built       | `prds/assessmentQuestions.ts` + `AssessmentCategoryScreen` |
| **B2** | **20-page Health Intelligence Report** | 🚧 **This doc** | Fired after the user clicks "Generate My Report" |
| B3   | Affirmations API                    | ✅ Wired       | `GET /api/recommendations/affirmations/generate` |
| B4   | Doctor / Clinician Recommendations  | ✅ Wired       | `POST /api/recommendations/combined` |

B3 + B4 already run in parallel on the `loading` step of `AssessmentFlow.tsx`. B2 is the missing deliverable that turns the in-browser report screen into a downloadable ~20-page document.

---

## 2. Inputs

Everything needed is already computed inside `AssessmentFlow.tsx` before the loading effect fires:

- `user`: `{ firstName: string, age: number }` — captured on the entry screen.
- `responses: ResponseMap` — 120 `{ questionId → 0–10 }` entries.
- `categories: AssessmentCategory[]` — the full paid category set (10 categories × 12 questions each).
- `overall: number` — 0-100 Health Intelligence Score from `calculateOverallScore(responses, categories)`.
- `categoryScores: CategoryScore[]` — per-category 0-100 score + `Priority | Moderate | Strong` status from `calculateCategoryScores(...)`.
- `priorities: CategoryScore[]` — top-3 lowest scoring categories from `getPriorityAreas(responses, 3, categories)`.
- `affirmations: string[]` — from B3 (up to 6).
- `recommendations: RecommendedPerson[]` — from B4 (doctors + therapists).

These are already assembled as the POST body for `/api/recommendations/combined`; the same payload is sufficient for the report generator.

---

## 3. Output format

**Primary:** `.docx` via the `docx` skill already installed at `/sessions/.claude/skills/docx`. Empress Health is a Windows + Word shop; .docx gives the team edit-in-place control and prints cleanly to PDF.

**Secondary:** server-side print-to-PDF from the existing `AssessmentReportScreen` HTML is a cheaper stopgap if .docx is delayed. The screen already has a dedicated `print` CSS block that hides navigation / buttons / the "pending report" banner.

Delivery options, in priority order:
1. **Email attachment**, triggered automatically when B2 finishes. Reuses the existing `nodemailer` transport that sends signup / welcome mail from `server.js`.
2. **In-app download link** on the report screen: replaces the current "Your full 20-page Health Intelligence Report is being prepared" banner with a "Download your report (PDF)" CTA once generated.
3. **Persisted in S3 / local `uploads/reports/`**, keyed by `userId + assessmentCompletedAt`, so the Member Dashboard can show historical reports.

---

## 4. ~20-page structure

Proposed page budget, one section per logical unit. Page counts are rough; `docx` pagination will set the actual count.

| Pg  | Section                                        | Content |
|-----|------------------------------------------------|---------|
| 1   | Cover                                          | Member name, date, Empress branding, "Health Intelligence Report — Comprehensive Edition" |
| 2   | Executive Summary                              | Overall score with interpretation band, top-3 priority areas, 2 strengths, headline paragraph |
| 3   | How to Read This Report                        | Score bands (Priority / Moderate / Strong), what 0-10 sliders mean, disclaimer |
| 4–5 | Category 1 — Vasomotor & Temperature           | Narrative, per-question table, interpretation, flagged biomarkers |
| 6–7 | Category 2 — Sleep Architecture & Cortisol     | Same structure |
| 8–9 | Category 3 — Cognitive Function & Brain Health | Same structure |
| 10  | Category 4 — Mood, Anxiety & Emotional Health  | Compressed (single page) |
| 11  | Category 5 — Metabolic Health & Body Comp.     | Compressed |
| 12  | Category 6 — Skin, Hair & Nails                | Compressed |
| 13  | Category 7 — Musculoskeletal & Bone Health     | Compressed |
| 14  | Category 8 — Genitourinary & Sexual Health     | Compressed |
| 15  | Category 9 — Cardiovascular & Whole-Body Energy| Compressed |
| 16  | Category 10 — Lifestyle, Gut & Nutrition       | Compressed |
| 17  | Personalized Affirmations                      | All 6 B3 affirmations, styled as blockquotes |
| 18  | Clinician & Therapist Recommendations          | All B4 recommendations as cards: name, specialty, reason |
| 19  | Your 90-Day Protocol                           | Synthesized next-steps derived from priorities + recommendations |
| 20  | Resources, Methodology, Disclaimers            | Methodology note, citations to the 10 category descriptions, full medical disclaimer |

Per-category page pattern (sections 4-16):

- Score badge (0-100) and status band
- Narrative interpretation (tone: warm clinician, not marketing)
- Response table — one row per question in that category — with `Q#`, short label, response value, descriptor
- "What this means for you" — a 1-2 paragraph synthesis
- "What to ask your clinician" — 3-5 bullet points

---

## 5. Integration point

Current code in `AssessmentFlow.tsx` runs B3 + B4 inside one `useEffect` tied to `step === "loading"`:

```ts
Promise.all([fetchAll(), minLoad]).catch(...)
```

B2 slots in as a **third parallel request** inside that effect:

```ts
// B2 — Full report generation (paid tier only)
if (tier === "paid") {
  try {
    const res = await fetch("/api/reports/generate", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      reportUrl = data?.reportUrl ?? data?.data?.reportUrl ?? null
    } else {
      errors.push(`Report: HTTP ${res.status}`)
    }
  } catch (e) {
    errors.push(`Report: ${(e as Error).message}`)
  }
}
```

`AssessmentApiResult` grows a `reportUrl?: string | null` field; `AssessmentReportScreen` swaps the "pending" banner for a download link when present.

New server route:

- `POST /api/reports/generate` in `server.js` (auth-required).
- Handler reads the payload, calls `buildHealthIntelligenceReport(payload)` (new module in `services/reportBuilder.js`), saves to `uploads/reports/{userId}-{timestamp}.docx`, returns `{ reportUrl, expiresAt }`.
- Background job emails the report via the existing nodemailer transport.

---

## 6. Open questions

1. **Who writes the per-category narrative copy?** Needs a clinical writer (Empress existing content team or a contracted menopause NP). ~10-15 pages of prose at target tone.
2. **Affirmation + recommendation persistence.** Today they're fetched on every completion. For the report to be reproducible, the payload at completion time should be snapshotted alongside the generated file.
3. **Design system.** The docx template needs Empress brand assets (plum `#2A0F3F`, gold `#C6A75E`, Cormorant Garamond headers). Ideally ship a `.dotx` template and fill it via `docx` skill.
4. **PDF vs docx as primary.** If members expect "report as PDF" more than "report I can edit," flip the defaults.
5. **Retry / failure UX.** If report generation fails mid-flow, should the report screen still render with affirmations + recs and a "we'll email your report when ready" banner? (Recommendation: yes.)

---

## 7. Out of scope for this pass

- Free tier gets **no** 20-page report (confirmed). Free ends at B3 + B4 only.
- Historical comparison across multiple completions — deferred to a later Member Dashboard story.
- Non-English output — deferred.

---

## 8. Rough effort estimate

| Work item                                                  | Rough size |
|------------------------------------------------------------|-----------|
| Clinical narrative copy (10 categories × 1-2 pages)        | 1-2 weeks writer time |
| `services/reportBuilder.js` + docx template                | 3-5 engineering days |
| `/api/reports/generate` route + queue + nodemailer hookup  | 2 engineering days |
| `AssessmentFlow.tsx` + `AssessmentReportScreen.tsx` wire-up| 1 engineering day |
| QA — full paid flow with real user data                    | 2 days |

---

*Next action: spec review with the clinical lead to lock narrative copy scope, then kick off template design in parallel with `reportBuilder` implementation.*
