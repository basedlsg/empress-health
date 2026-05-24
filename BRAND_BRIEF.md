<!--
BRAND_BRIEF.md — The 6-field design brief for Empress Health.
Owned by the `design-ready` skill. Read by Claude BEFORE any design task.

REGENERATION: re-running `design-ready` refreshes machine-derived bits
(constraints, output spec). Human-judgement fields (purpose, audience, tone,
differentiator) are marked HUMAN EDITED to preserve fine-tuning.
-->

# Empress Health — Brand Brief

**Version:** 1.0 · **Last refreshed:** 2026-05-24

---

## 1. Purpose

<!-- HUMAN EDITED — DO NOT OVERWRITE -->

Empress Health is a menopause support platform — a wellness brand, clinical assessment engine, content library, community, and supplement/skincare marketplace, all serving women through perimenopause, menopause, and post-menopause.

**The core success moment:** a 40–60-year-old woman completes the 120-question assessment, sees her grounded Health Intelligence Report (~$139 one-time or $12/month), and either (a) books an appointment with a NAMS-certified provider via the matched-clinician CTA, OR (b) subscribes to daily affirmations + the curated product marketplace.

Success in 90 seconds of attention: she scrolls past the cover, sees her stage classification + composite score + the radar of 10 domains, and feels *seen* — the report is specific to her symptoms in a way no menopause platform she's seen has been. That feeling carries her to the "Book appointment" CTA.

---

## 2. Audience

<!-- HUMAN EDITED — DO NOT OVERWRITE -->

**Primary:** Women aged 40–60, in or approaching menopause. Most are in active perimenopause (45–55). They:
- Have spent 2–10 years being dismissed by general practitioners ("you're fine, it's just stress")
- Read `nytimes.com Well`, `Goop` (skeptically), `Hello Sunshine` book club picks, JAMA patient pages
- Trust visual registers that feel like *Architectural Digest* or *Harper's Bazaar* meets *Mayo Clinic* — refined, considered, clinical-credible
- Bounce instantly from anything that looks like Silicon Valley SaaS (Inter + purple gradient + smiling-woman-stock-photo)
- Are skeptical of "wellness journey" copy and supplement upsells without evidence
- Are SOLD the moment they see a real journal citation next to a real product recommendation

**Secondary:** Practitioners (NAMS-certified MPs, endocrinologists, women's health PTs) who Empress will route appointments to — design should make sense to clinicians too, which means citations and clinical mechanism names visible in the UI.

**NOT the audience:** general-wellness women aged 25–35 looking for cycle-tracking; men; anyone looking for a "menopause-positive" lifestyle aesthetic without rigor.

---

## 3. Tone — the aesthetic direction

<!-- HUMAN EDITED — DO NOT OVERWRITE -->

**Pick one (specific, extreme):** **Editorial-clinical, with Hermès quietness.**

**With specifics:** The visual register of a *Harper's Bazaar* feature crossed with a *NEJM* clinical brief. Cream pages (NOT pure white), plum chrome (NOT Silicon-Valley purple), gold restrained to single accents (NEVER overlay gradients), refined editorial serif body (Newsreader proposed; Inter being phased out), Poppins display for the brand voice. Hero photography is real women in real natural light — *Kinfolk* or *Cereal* magazine, not Shutterstock.

**Reference register:**
- Layout: Hermès `.com` product pages, *Architectural Digest* feature spreads
- Typography: *The New York Times* Well section, *Aeon* essay pages, NEJM patient handouts
- Photography: *Kinfolk*, *Cereal*, *Apartamento*
- Imagery restraint: every photo earns its place; no decoration

**Banned tone:** generic-pretty. "Modern, clean, premium" rounds to AI slop every time. "Empowering wellness journey" is a four-word red flag.

---

## 4. Constraints

### Framework / tech
- **Stack:** Node.js + Express 5 (server), static HTML for marketing/content pages, React 19 + Vite 6 (assessment SPA in `prds/`)
- **Component library:** none (custom). The React SPA has shared design tokens in `prds/reportDesignSystem.tsx`.
- **CSS approach:** inline `<style>` in HTML pages (root pages) + React `CSSProperties` objects in TSX (assessment SPA). No Tailwind, no CSS-in-JS library. `:root { --token: value }` pattern.
- **Build:** `npm run build:assessment` (Vite → `prds/dist/`); root HTML pages served as-is.

### Palette / type
- **Colour tokens:** see `DESIGN.md` § 2
- **Fonts:** see `DESIGN.md` § 3
  - Currently: **Poppins** display + **Inter** body
  - Migrating to: **Poppins** display + **Newsreader** body
  - Banned: Inter (in active migration), Roboto, Arial, Space Grotesk, system-ui
- **Loaded font budget:** ≤ 2 families, ≤ 8 weights total

### Must preserve
- The **grounded-pipeline contract** — every clinical claim cites a Pinecone chunk; every product is from `data/product_catalog.json`; every clinician is from `data/clinician_taxonomy.json`. Design must surface this (citation footers, source indices).
- The **HIS scoring math** in `prds/hisEngine.ts` and the 90 hand-authored narratives in `prds/hisNarratives.ts`. Don't rewrite the engine or the clinical copy.
- The **server endpoints** (`/api/recommendations/combined`, `/api/affirmations/*`, `/qa`, `/api/csrf`, `/api/contact`) and their CSRF + auth wiring.
- The **34-page report structure** (cover, sections 01–08, educational interludes, thank-you) per the current layout (`Health Assessment Report (1).pdf`).
- The **$139 / $12-mo pricing** model. Don't reintroduce the old $29 subscription copy.
- The **CSRF middleware** behaviour — new forms must use `fetchWithCsrf`.

### Cannot change
- Backend `lib/*` modules (`affirmations.js`, `catalog.js`, `qa.js`, `retrieval.js`, `daily-affirmations.js`, `email-sender.js`, `freeReportGenerator.js`, `reportPdfGenerator.js`, `notify.js`, `csrf.js`, `sanitise.js`)
- `server.js` core routes
- `data/product_catalog.json` and `data/clinician_taxonomy.json` schemas (extend, don't reshape)
- `prds/hisEngine.ts`, `prds/hisNarratives.ts`, `prds/assessmentQuestions.ts`, `prds/assessmentScoring.ts`

### Performance / accessibility floor
- Mobile-first; design at 375px first, scale up
- Lighthouse ≥ **85** mobile (no aggressive image-weight regressions)
- WCAG AA contrast minimum
- Total initial-load page weight ≤ **400 KB** (the React SPA bundle is currently 417 KB minified + gzipped 129 KB — close to ceiling)
- `prefers-reduced-motion` honoured
- All animations disabled in `@media print`

### Browser / device support
- Modern evergreen (last 2 versions Chrome / Safari / Firefox / Edge)
- iOS Safari 16+, Android Chrome
- IE / legacy Edge: **not supported** (we use CSS color-mix, `:has()`, etc.)
- Print: paged via Playwright headless Chromium (the report PDF generator)

---

## 5. The one differentiator

<!-- HUMAN EDITED — DO NOT OVERWRITE -->

**Every clinical claim cites a Pinecone chunk — visibly, in the UI, on every card.**

That's the one thing a woman remembers in 24 hours. She finishes the report, closes the tab, opens it later to send to her sister, and says: *"This one shows you exactly where it gets its information. Every supplement, every recommendation has a source."*

Design serves this. Citation footers are not optional polish — they are the brand. The "Sources: chunk-014, chunk-019" line under each affirmation is what Hermès' orange watermark is to a scarf. Don't visually downgrade citations to look "minor" — they're the proof.

---

## 6. Output convention

### File / location
- **New full pages (marketing/content):** root-level `*.html`, with a server route in `server.js` (`app.get("/newpage", ...)` → `res.sendFile(path.join(__dirname, "newpage.html"))`)
- **New components (assessment SPA):** `prds/<ComponentName>.tsx`, import shared tokens from `prds/reportDesignSystem.tsx`
- **New CSS tokens:** add to `prds/reportDesignSystem.tsx` `reportPalette` AND register in `DESIGN.md` § 2-4
- **New fonts:** add `<link>` in the page's `<head>` AND register in `DESIGN.md` § 3
- **New imagery:** drop into `public/` (or `public/report-heroes/` for paid-report sections)

### Framework conventions
- Static HTML pages: self-contained, inline `<style>`, no external CSS, no JS framework
- React SPA: functional components, hooks only, no class components. TypeScript strict-off (per `prds/tsconfig.json`)
- Server routes: explicit `app.get("/route", handler)` — no catch-all dynamic routing for new pages
- All new POST routes go through `verifyCsrfMiddleware` (default — only `/api/signup`, `/api/login`, `/qa`, `/api/affirmations/unsubscribe` are exempt)

### Done means
- ✅ Compiles clean (`node --check server.js`, `npm run build:assessment`)
- ✅ Renders without console errors at `http://localhost:3100`
- ✅ Lighthouse mobile ≥ 85
- ✅ Passes the banned-patterns checklist in `DESIGN.md` § 12
- ✅ Snapshot added to `design-references/screenshots/` via `npm run design:snapshot`
- ✅ All 7 test suites still green (`MOCK_LLM=1`): retrieval / recommendations / affirmations / qa / daily-affirmations / his / pipeline-e2e

### Don't touch
- Other components / pages not in scope
- The build pipeline (`vite.config.mjs`, `package.json` scripts)
- Backend `server.js` (except adding a route) or `lib/*`
- `node_modules/`, `prds/dist/`, `pinecone_data/`, `data/pinecone-embeddings.json`

---

## Quick brief — copy this when invoking frontend-design

```
PURPOSE  — Empress Health menopause platform: women 40–60 complete a 120-question assessment and get a grounded clinical report with citations, plus product/clinician recommendations.
AUDIENCE — Women 40–60 in peri/meno/post-menopause. Skeptical of Silicon Valley SaaS aesthetics; trust the visual register of Harper's Bazaar × NEJM. Bounce instantly from purple-gradient + smiling-stock-photo.
TONE     — Editorial-clinical with Hermès quietness. Cream pages, plum chrome, gold accents (restrained). Poppins display + Newsreader body (NOT Inter). Real women in real natural light, never stock handshakes.
CONSTRAINTS
  - Stack: Node/Express + static HTML + React 19/Vite SPA at /assessment
  - Palette / fonts: see DESIGN.md
  - Must preserve: grounded-pipeline contract (every claim cites Pinecone), HIS engine, $139/$12mo pricing, CSRF wiring
  - Output: new page = root .html + server route OR new SPA component in prds/. Cite tokens, never hardcode hex.
THE ONE DIFFERENTIATOR — Every clinical claim cites a Pinecone chunk visibly in the UI. Citation footers are not polish; they're the brand.
```

---

## Failure modes to watch for

If any of these appear in a draft, the brief got ignored — push back and re-read § 3 and § 5:

- Purple gradient over white background
- Inter / Roboto / system-ui used as primary type (we're migrating AWAY from Inter)
- Three-column "Feature 1 / 2 / 3" with icon + heading + lorem
- "Trusted by X / Y / Z" logo row that doesn't actually exist
- Hero with centred big text + CTA + faded blob behind
- Stock photography of a smiling woman holding a tablet
- "Premium" / "Modern" / "Best-in-class" / "Cutting-edge" / "Wellness journey" in copy
- Citations hidden in tooltips or buried in a separate page (they must be visible inline)
- Pure-white page backgrounds (use `--color-ivory #fffaf1`)
- Generic emoji-as-icon instead of the canonical icon library
