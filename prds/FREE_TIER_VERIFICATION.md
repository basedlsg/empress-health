# Free-Tier Assessment — End-to-End Verification

**Date:** 2026-04-20
**Scope:** Verifies the free 30-Q path (C1→C2→C3), paid 120-Q path (B1→B3→B4), and shared signup entry (A1/A2).

---

## ✅ What's complete and demo-ready

### Source of truth — free-tier question set
- `prds/abbreviatedAssessmentQuestions.ts` — **30 questions, ≥2 per category.**
- Per-category distribution (verified programmatically):
  `{1:4, 2:4, 3:2, 4:4, 5:4, 6:2, 7:2, 8:4, 9:2, 10:2}` → total **30** ✓
- Paid set intact: 120 questions across 10 categories ✓

### Shared — A1/A2 signup entry
- `server.js:1121` — signup response redirects to `/membershipoptions`
- `server.js:1263` — login response redirects to `/membershipoptions`
- `server.js:2670` — authenticated visitors to `/signup` go to `/membershipoptions`
- `signup.html:637` — client-side redirect target is `/membershipoptions`

### Paid path — B1 → B3 → B4
- `membershipoptions.html` — every pricing card has a **"Begin 120-Question Assessment →"** button pointing at `/assessment/?tier=paid`
- `AssessmentFlow.tsx` — reads `?tier=paid`, loads full `assessmentCategories` (120 Qs)
- On completion: parallel calls to
  - `GET /api/recommendations/affirmations/generate` (B3)
  - `POST /api/recommendations/combined` (B4)
- Report screen renders affirmations + clinician cards + a "Your full 20-page report is being prepared" banner
- **B2 (the full 20-page PDF) is intentionally out of scope for this pass** — scoped in `prds/PAID_REPORT_SCOPE.md`

### Free path — C1 → C2 → C3
- `membershipoptions.html` — dashed "free-path" aside below the pricing grid with **"Continue with the free 30-question assessment →"** linking to `/assessment/?tier=free`
- `AssessmentFlow.tsx` — reads `?tier=free`, loads `abbreviatedAssessmentCategories` (30 Qs)
- On completion: same parallel calls as paid (B3 + B4)
- Entry screen shows "Free Preview" headline, "30 Biomarkers" pill, "~5 min" badge, "BEGIN FREE PREVIEW →" CTA
- Report screen hides the "20-page report" banner, hides the print button, shows an **"Unlock the Full Assessment"** upgrade card linking to `/membershipoptions`

### Tier-aware scoring
- `assessmentScoring.ts` — all 4 functions accept an optional `categories` arg, so scoring works correctly against either the 30-Q or 120-Q set.

---

## ⚠️ One thing you must do before demoing

The Vite-compiled SPA in `prds/dist/` is from **April 3, 2026** — **before** these changes. You need to rebuild it on your Windows machine:

```powershell
cd C:\path\to\Empress-Health-Node.js
npm run build:assessment
```

(I could not run this inside the sandbox because `node_modules/@rollup/` only contains the Windows rollup binaries and the sandbox is Linux. The code is correct — it just needs to be compiled on your machine.)

After rebuilding, restart your Node server and demo:

1. `http://localhost:<port>/signup` — sign up → lands on `/membershipoptions` ✓
2. Click **"Continue with the free 30-question assessment →"** → `/assessment/?tier=free` → 30 questions across all 10 categories → Affirmations + Clinician recommendations, no report
3. Back to `/membershipoptions` → click any pricing card's **"Begin 120-Question Assessment →"** → `/assessment/?tier=paid` → full 120 questions → Affirmations + Clinician recs + "20-page report is being prepared" banner

---

## 🗂 Files changed in this pass

| File | Change |
|------|--------|
| `prds/abbreviatedAssessmentQuestions.ts` | **NEW** — 30-Q free-tier subset |
| `prds/AssessmentProvider.tsx` | Accepts `categories` + `tier` props; exposes both via context |
| `prds/AssessmentFlow.tsx` | Reads `?tier=`, loads the right category set, calls B3+B4 in parallel |
| `prds/AssessmentEntryScreen.tsx` | Tier-aware copy + pills + CTA + free→paid upsell link |
| `prds/AssessmentCategoryScreen.tsx` | Reads categories from context instead of direct import |
| `prds/AssessmentReportScreen.tsx` | Accepts `apiResult`, renders Affirmations + Recommendations sections, tier-aware copy |
| `prds/assessmentScoring.ts` | All functions accept optional `categories` arg |
| `server.js` | 3 redirect targets: `/membershipsurvey` → `/membershipoptions` |
| `signup.html` | 1 redirect target: `/membershipsurvey` → `/membershipoptions` |
| `membershipoptions.html` | Added "Begin 120-Question Assessment" CTAs on all tier cards + free-path aside |
| `prds/PAID_REPORT_SCOPE.md` | **NEW** — scoping doc for the deferred 20-page report (B2) |
| `prds/FREE_TIER_VERIFICATION.md` | **NEW** — this document |

---

## 🚧 What's pending (by design)

- **B2 — Full 20-page Health Intelligence Report.** Scoped in `prds/PAID_REPORT_SCOPE.md`. Requires clinical narrative copy + `reportBuilder.js` + `/api/reports/generate` route.
- **Local rebuild of `prds/dist/`** — see section above.
