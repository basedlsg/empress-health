<!--
COMPONENT_INVENTORY.md — What already exists in Empress Health.
Owned by the `design-ready` skill. Re-run the skill to refresh.
-->

# Empress Health — Component & Page Inventory

**Version:** 1.0 · **Last refreshed:** 2026-05-24

Read before creating any new page or component. If something here covers your need, extend it — don't fork it.

---

## 1. Pages / routes

### Marketing & content (root-level HTML)
| Route | File | Purpose | Status |
|---|---|---|---|
| `/` | `index.html` | Homepage — hero, value props, social proof, chatbot embed | ✅ |
| `/founderstory` | `founderstory.html` | Founder story (uses Cormorant Garamond — outlier font) | 🟡 |
| `/ourstory` | `ourstory.html` | Brand story | ✅ |
| `/team` | `team.html` | Team page | ✅ |
| `/howitworks` | `howitworks.html` | How the assessment works | ✅ |
| `/whyempresshealth` | `whyempresshealth.html` | Why Empress (alias `/whyempress`) | ✅ |
| `/faq` | `faq.html` | FAQ | ✅ |
| `/contact` | `contact.html` | Contact form — POSTs `/api/contact` (CSRF + rate-limited) | ✅ |
| `/privacypolicy` | `privacypolicy.html` | Privacy policy | ✅ |
| `/cookies` | `cookies.html` | Cookies notice (placeholder) | 🟦 |
| `/accessibility` | `accessibility.html` | Accessibility statement (placeholder) | 🟦 |

### Membership & survey
| Route | File | Purpose | Status |
|---|---|---|---|
| `/signup` | `signup.html` | Signup form — password complexity, CSRF | ✅ |
| `/login` | `login.html` | Login — CSRF, session, rate-limited | ✅ |
| `/membershipoptions` | `membershipoptions.html` | Plan picker — $139 one-time / $12 mo callout + legacy tiers | 🟡 (legacy tiers still visible) |
| `/membershipsurvey` | `membershipsurvey.html` | 30-question survey (free-tier onboarding) | ✅ |

### Marketplace
| Route | File | Purpose | Status |
|---|---|---|---|
| `/market` | `market.html` | Marketplace stub (redirects to `/bundlesandkits`) | 🟦 |
| `/bundlesandkits` | `bundlesandkits.html` | Bundles + Shopify embed | ✅ |
| `/supplements` | `supplements.html` | Supplements catalog | ✅ |
| `/skincare` | `skincare.html` | Skincare catalog | ✅ |
| `/haircare` | `haircare.html` | Haircare catalog | ✅ |
| `/selfcaretools` | `selfcaretools.html` | Self-care tools — **uses different primary `#5B2E90`, Cormorant Garamond** | 🔴 off-system |

### Community & content
| Route | File | Purpose | Status |
|---|---|---|---|
| `/community` | `community.html` | Community landing | ✅ |
| `/communitystories` | `communitystories.html` | Story library | ✅ |
| `/expertblogs` | `expertblogs.html` | Expert blog list (fetches `/public/blogs.json`) | ✅ |
| `/expertguidance` | `expertguidance.html` | Expert guidance hub | ✅ |
| `/events` | `events.html` | Events listing | ✅ |
| `/ebookguides` | `ebookguides.html` | E-book guides | ✅ |
| `/wellnesshub` | `wellnesshub.html` | Wellness hub | ✅ |
| `/symptomsupport` | `symptomsupport.html` | Symptom support hub | ✅ |
| `/dailyaffirmations` | `dailyaffirmations.html` | Daily affirmations landing | ✅ |
| `/menopausemonth` | `menopausemonth.html` | Menopause-awareness campaign | ✅ |
| `/askempress` | `askempress.html` | AI chatbot UI — POSTs `/qa`, shows Sources accordion | ✅ |

### Beta / coming-soon
| Route | File | Purpose | Status |
|---|---|---|---|
| `/betacomingsoon` | `betacomingsoon.html` | Beta coming-soon (canonical) | ✅ |
| `/betaversion` | `betaversion.html` | Beta version (legacy — all nav links migrated to `/betacomingsoon`) | 🟡 |
| `/comingsoon` | (server.js inline) | Generic coming-soon | ✅ |

### Mock / dev
21 files under `mockpages/*.html` — design-iteration drafts, not all routed. Treat as scratch/reference. The handful routed via `app.get("/mock*")` are listed in `server.js` lines ~2930-2960.

### Assessment SPA (React + Vite)
| Route | File | Purpose | Status |
|---|---|---|---|
| `/assessment` (302 → SPA) | `prds/dist/index.html` (built) | Vite-built React app | ✅ |
| Built from: | `prds/main.tsx` + `prds/AssessmentFlow.tsx` | | |

> Status legend: ✅ shipped · 🟡 partial · 🔴 broken/off-system · 🟦 placeholder

---

## 2. Layout shells

Empress doesn't have a formal layout-shell abstraction (each HTML page inlines its own nav + footer). This is a **gap** — every page duplicates ~200 lines of nav/footer markup. Refactor candidate.

| Pattern | Where it's duplicated | Notes |
|---|---|---|
| Top nav with logo + drawer | every root HTML page | Hamburger drawer is the standard mobile pattern. `id="drawer"` is one-per-page now (was duplicated; fixed in earlier wave). |
| Footer with social + links | every root HTML page | Identical block; consolidate into a shared partial in a future refactor. |
| Assessment SPA wrapper | `prds/main.tsx` → `<AssessmentFlow>` | Provides the SPA shell + theme. |

---

## 3. Primitive components (assessment SPA)

All in `prds/reportDesignSystem.tsx`:

| Name | Tokens it consumes | Variants | Notes |
|---|---|---|---|
| `<ScoreBadge>` | `reportPalette.priority/moderate/strong` | PRIORITY / MODERATE / STRONG | Uppercase tiny pill |
| `<BandedProgressBar>` | `progressLow/mid/midHigh/high` | 0-100 input | Used for all per-domain score bars |
| `<NumberedSectionHero>` | plum bg, white text | section number + title | "01. Menopause Stage & Overview" etc. |
| `<InterludeHero>` | hero photo + title | Used for Sleep / Brain Fog / Diet section intros | |
| `<CalloutCard>` | ochre left border + body | "Lifestyle lever" / "Clinician conversation" | |
| `<DoDontTable>` | two-col Do's / Don'ts | Sleep hygiene + brain fog + diet sections | `wordBreak: normal; overflowWrap: anywhere` applied |
| `<SectionFeedback>` | `feedbackBg/feedbackBorder` | "How does this resonate?" | Now consolidated to ONE at end of report |
| `<LuxuryGiftHero>` | gift image + body | "Free with your $139 report — or $12/mo plan" | |
| `<RecommendationListItem>` | white card + plum heading | Product card + clinician card | Includes citation footer |

### Static HTML primitives (per-page)
- **Button** — `.btn.primary` (plum bg, white text) and `.btn` (white bg, ink text). Inline-styled per page.
- **Card** — `.card` (white bg, `--border` outline, `--radius-md`)
- **Input** — bare `<input>` with `padding: 8px 10px; border-radius: var(--radius)`
- **Drawer** — burger button (`.burger`) + slide-in `<nav id="drawer">`
- **Menu link** — `.menu-link` (used in mobile drawer)

> Gap: these primitives are inlined per-page with style drift. Candidates for extraction to a shared `assets/site.css`.

---

## 4. Composite components

### Assessment report (paid tier)
Built in `prds/AssessmentReportScreen.tsx` (~2400 lines). Notable composites:

| Section | What it renders |
|---|---|
| Section 01 — Menopause Stage & Overview | Cover + stage card + radar chart + 10 domain score cards |
| Section 02 — All 10 Domain Scores Detailed | Per-domain narrative cards (10 of them) |
| Section 03 — Your Top Priority Areas | Top 3 lowest-scoring domains with "What drove this score", "Lifestyle lever", "Clinician conversation" |
| Section 04 — Your Strongest Domains | Top 3 highest-scoring (fixed in earlier wave — was rendering weakest) |
| Section 05 — Personalised Affirmations | 3 grounded affirmations from `lib/affirmations.js` with `focus_domain` + `evidence_refs` |
| Section 06 — Clinician Recommendations | Single best-match from `data/clinician_taxonomy.json` + "Book an appointment →" CTA |
| Section 07 — Recommended Products | Up to 5 products from `data/product_catalog.json` with grounded reasons + citation footers |
| Section 08 — Next Steps | 3 numbered next-steps |
| Educational interludes | Sleep Hygiene · Brain Fog · Anti-inflammation Diet (Do's/Don'ts tables) |
| Citation Sources index | All unique chunk IDs cited in the report |
| Thank You slide | `support@empresshealth.ai` mailto, brand line |

### Chatbot
`askempress.html` — single-page chat UI, POSTs `/qa`, renders "Sources (N) ▸" accordion under each bot answer.

---

## 5. Section / hero blocks

| Name | File | Where it's seen | What it does |
|---|---|---|---|
| Homepage hero | `index.html` (top of file) | `/` | Smart Support for Every Stage of Menopause + CTA |
| Founder hero | `founderstory.html` | `/founderstory` | Founder portrait + bio |
| Marketplace hero | `bundlesandkits.html` | `/bundlesandkits` + variants | Bundle showcase |
| Assessment cover | `prds/AssessmentReportScreen.tsx` (top) | `/assessment` paid | Plum cover with crown logo + HIS score + band badge |
| Section hero photos | `public/report-heroes/01–08.{jpg,svg}` | each report section | Full-page hero with overlaid plum section-number band |

---

## 6. Form patterns

| Form | File | Submit endpoint | Validation | CSRF |
|---|---|---|---|---|
| Signup | `signup.html` | `POST /api/signup` | min 8 chars, letter+digit, blocklist | ✅ |
| Login | `login.html` | `POST /api/login` | email + password ≥8 | ✅ |
| Contact | `contact.html` | `POST /api/contact` (proxies Zapier) | required fields, length caps | ✅ |
| Membership survey | `membershipsurvey.html` | `POST /api/survey` (per-section) | client-side only | ✅ |
| Assessment feedback | inside React SPA | `POST /api/assessment/feedback` | optional sectionId | ✅ |
| Affirmations subscribe | (not yet UI) | `POST /api/affirmations/subscribe` | email format | ✅ |
| Chatbot question | `askempress.html` | `POST /qa` | length-cap 800 chars | exempt |

---

## 7. Print / PDF deliverables

| Deliverable | Generator | Notes |
|---|---|---|
| Free-tier .docx report (6 pages) | `lib/freeReportGenerator.js` | Served via `POST /api/assessment/free-report`. Uses CATEGORY_LEVERS + optional Page 6 sources appendix. |
| Paid-tier PDF report (34 pages) | `lib/reportPdfGenerator.js` | Playwright screenshots `/assessment?tier=paid&print=1`. Hero photos in `public/report-heroes/`. |

---

## 8. Empty / loading / error states

| Surface | Empty | Loading | Error |
|---|---|---|---|
| Assessment report | rare (gate at 60% completion) | spinner + "preparing your report…" | falls to fallback narrative |
| Chatbot answer | "Ask a question to get started." | typing indicator | "I don't have specific information on that — please ask your NAMS-certified provider." |
| Product recommendations | "No product recommendations available right now." | (rendered server-side) | falls back to product `blurb` field |
| Affirmations | hardcoded 20 fallbacks in `data/fallback_affirmations.json` | (rendered server-side) | uses fallback set |
| Daily affirmation email | (skipped if no subscribers due) | n/a | logs to `email_outbox.log` |
| Login / signup | (none) | button disabled during submit | inline error under input |
| Contact form | (none) | button disabled | red error banner above form |

> Strong here. Audit found no missing empty/loading/error states for the primary surfaces.

---

## 9. Iconography in use

| Icon | Source | Used where |
|---|---|---|
| Burger menu (☰) | HTML entity `&#9776;` | every page nav drawer |
| Logo crown | embedded in `EmpressHealthlogo.png` | cover, header |
| Section icons (radar) | inline SVG in `AssessmentReportScreen.tsx` | radar chart on report page 3 |
| Misc lifestyle icons | small PNG in `public/` | drawer menu, section badges |

> **Gap:** no standard library. Proposed: Lucide (see `DESIGN.md` § 7).

---

## 10. Imagery / photography in repo

| Asset | Path | Used by | Status |
|---|---|---|---|
| Empress logo | `public/EmpressHealthlogo.png` | every page header | ✅ |
| Brand crown logo (new) | (in `Health Assessment Report (1).pdf` cover) | report cover | 🟡 needs file |
| Founder photo (Amehta) | `public/amehta.jpg` + `amehtaborder.jpg` | `/founderstory` | ✅ |
| Symptom tracker mock | `public/Symptom_Tracker.jpg` | homepage feature | ✅ |
| Report section heroes | `public/report-heroes/01-08.{jpg,svg}` | paid report sections | ✅ |
| Empress products | `public/empressKWandFace.jpg`, `empressKansaWand.jpg`, etc. | marketplace pages | ✅ |
| Ask-empress chatbot icons | `public/askempress*.png` (5 variants) | chatbot embed | ✅ |
| Mobile mockup | `public/mockmobileempress.jpg` | homepage hero | ✅ |
| Calming oil | `public/empressCalmingOil.jpg` | product imagery | ✅ |

---

## 11. Animations / motion in use

| Pattern | File | Trigger | Duration / easing |
|---|---|---|---|
| Header shadow on scroll | header sticky CSS | scroll past 0 | `0.2s ease` |
| Menu link hover lift | `.menu-link:hover` | hover | `translateY(-1px)` + shadow |
| Drawer slide-in | mobile drawer | burger click | CSS transform |
| Fade-in on load (assessment SPA) | various | mount | CSS keyframes |

> No JS animation library currently in use. Framer Motion is in `package.json` but unused — flag if reintroducing.

---

## 12. Gaps the next designer should know

These are surfaces where a component is missing, inconsistent, or copy-pasted across files. Fixing these = the highest-leverage design work.

- **No shared CSS partial.** Every HTML page inlines ~200 lines of nav + footer + style. A single `assets/empress.css` imported by all pages would prevent the kind of `selfcaretools.html`-style drift (different primary, different fonts).
- **`selfcaretools.html` is OFF-SYSTEM.** Uses `#5B2E90` (a different purple) and `Cormorant Garamond`. Either upgrade to the canonical or document why it differs.
- **Multiple beta pages.** `/betacomingsoon` is canonical; `/betaversion` still exists but isn't linked. Decide whether to delete `betaversion.html`.
- **`/cookies` and `/accessibility` are placeholders.** Have real content written.
- **No icon library.** Adopt Lucide (proposed in `DESIGN.md` § 7).
- **No Modal pattern.** Three different ad-hoc modals exist (signup confirm, membership confirm, askempress error). Build a single `<Modal>` component.
- **No Toast pattern.** Notifications today go to `lib/notify.js` server-side; nothing surfaces to the user inline. Build a single Toast.
- **Logo lockup divergence.** `Health Assessment Report (1).pdf` cover uses a new crown-logo with "Be You Again!" script — `/public/EmpressHealthlogo.png` is the older lockup. Decide which is canonical and consolidate.
- **Layout shell extraction.** Every root HTML page duplicates the nav + footer + sticky-header CSS. Extract into a partial or move to a static-site generator for the marketing pages.
- **The 35 root HTML pages drift in spacing tokens.** Some use `--space-xs: 16px`, others use `--space-1: 4px`. Consolidate.
- **Print-screen parity gap.** The paid report renders fine on-screen but the print PDF sometimes shows hero photos partially loaded (mitigated by `page.waitForSelector` in `reportPdfGenerator.js`). Always test the PDF, never just screen.

---

## How to use this file (for Claude)

When asked to build a new page or component:
1. Search this inventory first — does something close already exist?
2. If yes — extend it, don't fork it.
3. If no — confirm it should exist by checking `BRAND_BRIEF.md` § 4 (constraints).
4. Once built, ADD it to this inventory in the right section.
