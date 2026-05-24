<!--
DESIGN.md — Single source of truth for Empress Health's visual system.
Stitch-compatible. Read by frontend-design, design-brief, pitch-deck, and
Stitch's `upload_design_md` MCP tool.

REGENERATION: this file is owned by the `design-ready` skill. Re-running the
skill refreshes machine-derived values; sections marked
`<!-- HUMAN EDITED — DO NOT OVERWRITE -->` are preserved.
-->

# Empress Health — Design System

**Version:** 1.0 · **Last refreshed:** 2026-05-24 · **Owner:** `design-ready` skill

> Before any design work in this repo, read this file + `BRAND_BRIEF.md`.
> Don't introduce a font, colour, or component pattern that isn't here.
> If you need to, propose the addition here FIRST, then implement.

**Canonical token source:** `prds/reportDesignSystem.tsx` `reportPalette` (lines 32-63) — used by the React assessment SPA. Static HTML pages duplicate these tokens as `:root` CSS variables (inconsistently — see TODO at § 13).

---

## 1. Voice & visual posture (the one differentiator)

**Every clinical claim cites a Pinecone chunk.** The user remembers Empress Health because it's the only menopause platform that shows its work — every affirmation, product recommendation, and clinician match traces to a chunk ID in the 120-symptom biomarker framework. Design must reinforce this: small "Sources: chunk-XXX" footers under every claim, citation indices at the back of reports, visible "Grounded via {source} · N citations" badges in dev mode. Aesthetics serve the rigour, never disguise it.

**Posture:** clinical-warm. The seriousness of a JAMA layout, softened by the warmth of a wellness magazine. Plum and gold are the chrome of credibility; cream is the breathing room.

---

## 2. Colour tokens

Canonical tokens live in `prds/reportDesignSystem.tsx` (`reportPalette`). Static HTML pages should pull from the same hex values via `:root` CSS variables — TODO consolidate (see § 13).

### Brand
| Token | Hex | Used for |
|---|---|---|
| `--color-plum` / `reportPalette.plum` | `#3f1449` | Primary brand colour; headings, primary buttons, brand chrome |
| `--color-plum-light` / `reportPalette.plumLight` | `#4b2577` | Hover states, secondary headings, sub-emphasis |
| `--color-gold` / `reportPalette.gold` | `#D8A738` | Accent — eyebrow tags, dividers, badge highlights, "Empress" mark |
| `--color-ivory` / `reportPalette.ivory` | `#fffaf1` | Default page background (warm, NOT pure white) |
| `--color-page-bg` / `reportPalette.pageBg` | `#F4E5C8` | Cream/peach background used in PDF print mode |

### Surface
| Token | Hex | Used for |
|---|---|---|
| `--color-card-bg` | `#FFFFFF` | Card surfaces, lifted panels |
| `--color-card-border` | `rgba(63,20,73,0.08)` | Hairline border around cards (8% plum) |
| `--color-card-shadow` | `0 2px 12px rgba(42,15,63,0.05)` | Soft plum-tinted card shadow |
| `--color-soft` | `#faf8ff` | Subtle plum-tinted panel background |
| `--color-border` | `#ececf1` | Generic UI border |

### Semantic — clinical bands
The HIS engine + per-domain scores all map to these three. Never use red/orange/green from outside this set.
| Token | Hex | Used for |
|---|---|---|
| `--color-priority` / `reportPalette.priority` | `#C0392B` | "Priority" band (score 0–49). PRIORITY badges, urgent flag callouts |
| `--color-moderate` / `reportPalette.moderate` | `#D4A017` | "Moderate" band (score 50–64). MODERATE badges |
| `--color-strong` / `reportPalette.strong` | `#27AE60` | "Strong" band (score 65–100). STRONG badges, "Where you're thriving" |

### Semantic — progress fill
| Token | Hex | Used for |
|---|---|---|
| `--color-progress-low` | `#C0392B` | 0–49 fill |
| `--color-progress-mid` | `#F4D2D5` | 50–64 fill (light peach) |
| `--color-progress-mid-high` | `#EBE1C8` | 65–84 fill (light gold) |
| `--color-progress-high` | `#D6E7DC` | 85–100 fill (light mint) |

### Semantic — text
| Token | Hex | Used for |
|---|---|---|
| `--color-ink` | `#1f1b2d` | Primary text on light backgrounds |
| `--color-muted` | `#6e6a7a` | Secondary text, captions, citation footers (11–14px) |
| `--color-text-on-plum` | `#FFFFFF` | Text on plum backgrounds |
| `--color-text-on-gold` | `#3f1449` (plum) | Text on gold (NOT white — readability) |

### Callouts
| Token | Hex | Used for |
|---|---|---|
| `reportPalette.ochre` | `#D4A017` | Pull-quote left border, lifestyle-lever cards |
| `reportPalette.feedbackBg` | `#E9DFEF` | "How does this resonate?" feedback boxes |
| `reportPalette.feedbackBorder` | `#D4C6E0` | Feedback box border |
| `reportPalette.mintCard` | `#E8F1E9` | Affirmation cards background |
| `reportPalette.mhtBannerBg` | `#FFF5DA` | "MHT active" overlay banner |

### Rules
- **Dominant + accent.** Plum is the dominant. Gold is the *single* accent. No third hue without adding it here first.
- **Never introduce a hex literal in components.** Pull from the token. If the colour you need isn't here, add it to `reportPalette` AND register it above.
- **Tints/shades:** use `color-mix(in oklch, var(--color-plum) Y%, var(--color-ivory))` rather than handrolled hex variants.
- **Status colours are tied to band labels.** Never use `#C0392B` for "delete" or "error" — that band == clinical Priority. Use a different muted red.

---

## 3. Typography

### Loaded fonts (Google Fonts, via `<link>` in each HTML page + `prds/index.html`)
- **Poppins** weights 400/600/700/800 — display, headings, brand
- **Inter** weights 300/400/500/600/700 — body
- *Cormorant Garamond* 600/700 — used ONLY on one page (`founderstory.html` or similar). Inconsistent. Either promote to system or remove.
- *Playfair Display* 500/600/700 — used ONLY on one page. Same status as above.

### ⚠️ Banned font in current use: **Inter**
Inter is on the Anthropic `frontend-design` skill's banned list (along with Roboto, Arial, Space Grotesk, system-ui). It's the most generic AI-design tell in modern body copy.

**Proposed replacement:** **Newsreader** (Google Fonts) — distinctive editorial-serif with warm humanist proportions. Reads as clinical-credible without feeling cold. Also viable: **Source Serif 4** (medical-publication clarity) or **Spectral** (already a strong precedent in design-brief examples).

This is a project-wide change (35 HTML pages + the React SPA + the print PDF stylesheet). Don't make it as a one-off; plan it as a single tracked migration. Until then: every new page MAY use Newsreader so the migration consolidates organically.

### Type scale
| Token | Family | Size (rem / px) | Weight | Line-height | Use |
|---|---|---|---|---|---|
| `--font-display` | Poppins | 4rem / 64px | 800 | 1.05 | Hero headline (assessment cover, landing) |
| `--font-h1` | Poppins | 2.5rem / 40px | 700 | 1.15 | Page H1 |
| `--font-h2` | Poppins | 1.75rem / 28px | 700 | 1.2 | Section H2 |
| `--font-h3` | Poppins | 1.25rem / 20px | 600 | 1.3 | Card titles |
| `--font-body` | Inter → **Newsreader (proposed)** | 1rem / 16px | 400 | 1.55 | Paragraph body |
| `--font-body-lg` | Inter → Newsreader | 1.125rem / 18px | 400 | 1.55 | Report body, long-form |
| `--font-small` | Inter → Newsreader | 0.875rem / 14px | 400 | 1.45 | Captions, score labels |
| `--font-eyebrow` | Poppins | 0.75rem / 12px | 700, letter-spacing 0.08em, uppercase | 1.3 | Section eyebrows ("PAGE 02", "EMPRESS HEALTH.AI") |
| `--font-footer` | Inter → Newsreader | 0.6875rem / 11px | 400 | 1.4 | Citation refs, "Sources: chunk-XXX" |

### Rules
- **Pair distinctive display with refined body.** Poppins (display) + Newsreader (body, proposed) is the target pairing.
- **Banned in this project:** Inter (migrating), Roboto, Arial, Space Grotesk, system-ui as primary type.
- **Body text never below 14px on screen, never below 9pt in print/PDF.**
- **Eyebrows are ALWAYS uppercase, letter-spaced.** Never lowercase eyebrows.

---

## 4. Spacing & layout

Base unit: **4px**. All spacing is a multiple. Static HTML uses these named tokens; the React SPA uses raw px or `--space-N` aliases.

| Token | Px | Use |
|---|---|---|
| `--space-1` / 4px | 4 | Inline gap between icon + label |
| `--space-xs` | 16 | Standard paragraph margin, form input padding (medium) |
| `--space-sm` | 24 | Card inner padding, subsection gap |
| `--space-md` | 32 | Section internal gap |
| `--space-lg` | 60 | Section-to-section gap (root HTML pages) |
| `--space-xl` | 80 | Page-level hero padding |

### Report-specific
The paid PDF report has tighter spacing for print pagination — see `prds/AssessmentReportScreen.tsx` `s.section` token (currently `32px 24px 0`).

### Grid
- **Container max-width:** `--container-width: 1200px` (root pages); the React SPA uses A4-paged layout for print parity, no fixed container width on screen.
- **Columns:** 12-col responsive grid on root HTML; the React SPA uses flex/grid per-section.
- **Gutter:** `var(--space-sm)` = 24px desktop, `var(--space-xs)` = 16px mobile.

### Radius
| Token | Px | Use |
|---|---|---|
| `--radius-sm` | 8 | Inline tags, small chips |
| `--radius` | 12 | Buttons, inputs, status badges |
| `--radius-md` | 14 | Mid-sized cards (root HTML) |
| `--radius-lg` | 20 | Hero cards, modals |
| `--radius-xl` | 28 | Cover/section opener cards (report) |

### Shadow
- `--shadow` = `0 10px 30px rgba(16, 16, 32, 0.08)` — lifted panels, cards on hover
- `reportPalette.cardShadow` = `0 2px 12px rgba(42, 15, 63, 0.05)` — subtle plum-tinted card shadow (report)
- Never use pure-black shadows (`rgba(0,0,0,X)`) — they feel cheap. Always tinted toward ink/plum.

---

## 5. Components

Use existing components from `prds/reportDesignSystem.tsx` (React SPA) and the inline styles in `*.html` (static pages). Don't reinvent. See `COMPONENT_INVENTORY.md` for the full list with file paths.

### Button
- **Primary:** `background var(--color-plum) #3f1449`, text white, `var(--radius)` = 12px, padding `12px 24px`. Used for "Book an appointment →", "Claim my gift", primary form submit.
- **Secondary:** transparent background, `1px solid var(--color-plum)`, plum text.
- **Ghost:** no background, no border, underlined on hover, plum text.
- **Hover:** lift 1px shadow + 6% brightness shift. Never opacity-fade.

### Card (root HTML)
- White background, `1px solid var(--border) #ececf1`, `var(--radius-md) 14px`, padding `14px`, `var(--shadow)` on hover.

### Card (assessment report)
- `reportPalette.cardBg` `#FFFFFF`, `1px solid reportPalette.cardBorder` (8% plum), `var(--radius-xl) 28px` corners, `reportPalette.cardShadow`. Used for the per-domain breakdown cards.

### Form input
- `padding 8px 10px`, `1px solid var(--border)`, `var(--radius) 12px`, background white, ink text. Focus: 2px gold outline.

### Section header band
- Solid plum background, white text. `<NumberedSectionHero>` in `reportDesignSystem.tsx` is the canonical implementation. Used for "01. Menopause Stage & Overview", etc.

### Status badge (PRIORITY / MODERATE / STRONG)
- Always uppercase, always tiny (`--font-eyebrow`). Background matches the band colour at 100%; text white. Pill shape (`border-radius: 999px`), padding `4px 12px`.

### Citation footer (the differentiator)
- `--font-footer` (11px), `var(--color-muted)`, prefix "Sources: ", chunk IDs truncated to last 12 chars and joined by ", ".
- Must appear under every affirmation card, every product card, every clinician card.

---

## 6. Motion

- **Page-level reveal:** one well-orchestrated stagger on first scroll past hero (animation-delay 0 / 80ms / 160ms). NOT scattered micro-interactions.
- **Hover:** ≤ 150ms `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Print/PDF:** ALL animations disabled via `@media print` AND `@media (prefers-reduced-motion: reduce)`.
- **Library:** CSS-only for static HTML pages. Framer Motion is in `package.json` but currently unused — flag if reintroducing.

---

## 7. Iconography

- **Library:** No standard library. Currently a mix of inline SVG, emoji-as-icon (e.g. `&#9776;` for burger), and small PNG icons in `public/`. **TODO:** adopt one set — proposed **Lucide** (lightweight, on-brand for clinical-warm).
- **Default size:** 20px in body context, 16px inline with labels.
- **Never mix icon sets within a single view.**

---

## 8. Imagery

- **Hero photography:** real women in natural light, peri/meno/post-age (40s–60s). Soft skin tones, warm interiors, real moments — not stock-photo handshakes or laptop-by-the-window cliché.
- **Hero assets live in:** `/public/report-heroes/` (paid report sections 01–08), `/public/` (page hero photos like `EmpressHealthlogo.png`, `Symptom_Tracker.jpg`).
- **Illustrations:** mostly SVG fallbacks for hero slots when photography isn't ready.
- **Banned imagery:** stock handshakes, "diverse hands holding objects" overhead shots, purple gradient overlays on photos, AI-generated people with the canonical AI-skin sheen, faded blob backgrounds.

---

## 9. Voice (microcopy)

- **Tone:** warm + clinical-credible. "Smart, expert-backed support" — never breezy ("Hey friend!"), never sterile ("Patient protocol initiated").
- **Person:** second-person "you" addressing the user directly. First-person plural "we" for Empress.
- **Sentence length:** mostly 12–22 words. Mix one short punchy sentence into every paragraph. Never run-on.
- **Avoid:** "modern", "premium", "best-in-class", "cutting-edge", "transformative", "journey", "wellness journey", "empowering" (all AI-slop tells). "Holistic" only if used precisely.
- **Preferred phrases:** "every stage", "see your work", "rooted in clinical evidence", "your priorities", "we've got you".

Examples from production copy:
> "Smart, expert-backed support for every stage of menopause — from symptom relief to community and trusted clinical guidance." (homepage hero)
> "Every clinical claim in this report traces to a chunk in the Empress 120-Symptom Biomarker Framework." (report intro)
> "This is the start of a conversation, not the end." (thank-you slide)

---

## 10. Print / PDF conventions

The paid Health Intelligence Report is **34 pages**, rendered server-side via Playwright screenshotting `/assessment?tier=paid&print=1` (see `lib/reportPdfGenerator.js`).

- **Page size:** Letter (cover) + A4 (interior pages) — confirm and consolidate
- **Margins:** `14mm top / bottom · 12mm left / right`
- **Print stylesheet:** inline `@media print` block in `prds/AssessmentReportScreen.tsx` (search `@media print`)
- **Hero photos** must finish loading before `page.pdf()` snapshots — handled in `reportPdfGenerator.js` `page.evaluate` block
- **Always test the rendered PDF, not just screen.** Print-CSS drift is the #1 source of report layout bugs.

---

## 11. Accessibility floor

- WCAG AA contrast minimum: 4.5:1 body, 3:1 UI controls / large text
- All interactive elements have `:focus-visible` outlines using `var(--color-gold)` 2px
- All images have non-empty `alt` (decorative use `alt=""`)
- Skip-to-content link on every page with `<header>`
- `prefers-reduced-motion` honoured
- Form labels associated via `<label for="...">` — no placeholder-as-label

---

## 12. Banned patterns (the don't-do list)

- Purple gradient on white background (the canonical AI-slop tell)
- Inter / Roboto / Arial / system-ui as primary type (migration in progress for body)
- Three-column "Feature 1 / Feature 2 / Feature 3" with icon + heading + lorem ipsum
- Auto-scrolling carousels
- Cookie banners that block content above the fold
- "Premium" / "Modern" / "Best-in-class" / "Wellness journey" in copy
- Stock-photo handshakes; AI-generated smiling-woman-with-tablet
- Hero photos with the centred-text-on-blurred-background cliché
- Pure-white page backgrounds (use `--color-ivory #fffaf1` instead)
- Pure-black text (`#000`) on white — use `--color-ink #1f1b2d`

---

## 13. Known design-system gaps (TODO surface)

These are honest inconsistencies the next design sprint should close. **Don't fix as one-offs** — fix as system migrations.

<!-- TODO: needs human input -->
- **Token sprawl:** root HTML pages duplicate the same brand colours as `:root` CSS vars with subtle variations (`--primary: #3f1449` vs `--primary: #5B2E90` on `selfcaretools.html`). Source of truth should be one CSS file imported by all pages, OR Tailwind config, OR (current) `prds/reportDesignSystem.tsx`'s `reportPalette` cited everywhere.
- **Inter migration:** body font swap from Inter → Newsreader across 35 HTML pages + React SPA + print CSS. Not a one-off; needs single tracked migration.
- **Font-family inconsistency:** `selfcaretools.html` brings in `#5B2E90` (a different purple) and `Cormorant Garamond` — likely a sub-page from a different template. Either upgrade to the canonical or document why it differs.
- **Icon set:** no standard library. Adopt Lucide (proposed).
- **Logo cohesion:** the new report cover (`Health Assessment Report (1).pdf`) uses a different logo lockup ("empress health.ai" with crown + "Be You Again!" script) than `/public/EmpressHealthlogo.png`. Decide which is canonical and consolidate.
- **Sub-app overrides:** `prds/` (assessment SPA) maintains its own design tokens in `reportDesignSystem.tsx` rather than extending the root system. This is fine as long as both files cite the same hex values.

---

## How to use this file (for Claude)

When the user requests any visual change in this project:
1. Read this file first.
2. Read `BRAND_BRIEF.md` for the 6-field context.
3. Check `COMPONENT_INVENTORY.md` — does the thing already exist? Reuse it.
4. If introducing a new token, pattern, or component — propose adding it here FIRST, then implement.
5. Verify against the banned-patterns list before shipping.
