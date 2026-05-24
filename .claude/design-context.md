<!--
.claude/design-context.md — the short index Claude reads FIRST when starting
any design-related work in this repo. Owned by the `design-ready` skill.
-->

# Design Context — Empress Health

> This project is design-ready. Before ANY visual work, read the three
> canonical files in this order:

1. **`/BRAND_BRIEF.md`** — purpose, audience, tone, constraints, the one differentiator
2. **`/DESIGN.md`** — colour, typography, spacing, components, motion, voice
3. **`/COMPONENT_INVENTORY.md`** — what already exists (reuse before reinvent)

## Quick reference

- **Stack:** Node.js + Express 5 server, static HTML for marketing, React 19 + Vite 6 for the assessment SPA in `prds/`
- **Brand colour anchor:** `var(--color-plum)` (`#3f1449`) + `var(--color-gold)` accent (`#D8A738`) on cream (`#fffaf1`)
- **Display font:** Poppins (400/600/700/800)
- **Body font:** Inter today, **migrating to Newsreader** (Inter is banned per `frontend-design` skill)
- **Banned fonts:** Inter (in migration), Roboto, Arial, Space Grotesk, system-ui
- **The one differentiator:** every clinical claim shows its Pinecone chunk citation visibly in the UI
- **Banned patterns:** purple-on-white gradients · three-column feature grids · "modern/premium/wellness journey" copy · stock-photo handshakes · pure-white page bg

## Visual references

PNG snapshots of every key page live in `/design-references/screenshots/`. Refresh them with:
```
npm run design:snapshot
```
(Server must be running on `localhost:3100`. See `design-references/README.md`.)

## Canonical token source

Tokens live in `prds/reportDesignSystem.tsx` `reportPalette` (React SPA). Static HTML pages duplicate as `:root { --token: value }` — there's known drift (see `DESIGN.md` § 13).

## Skills to invoke

- For a new page or component → use **`frontend-design`** (it auto-reads DESIGN.md)
- For a brief on a redesign → use **`design-brief`** (the 6-field framework)
- For slides / one-pagers → use **`pitch-deck`** (consumes BRAND_BRIEF.md)
- To re-prep after a major design change → re-run **`design-ready`**

## How to add to the design system

If you need a new token, font, or component pattern:
1. Propose the addition in `DESIGN.md` FIRST (open the file, add the row).
2. Then implement.
3. Then re-run `design-ready` to refresh the inventory.

Never introduce a value (colour, font, spacing) that isn't in `DESIGN.md`. If it must exist, register it FIRST.

## Backend constraints (do NOT touch when designing)

- `server.js` (except adding a new route)
- `lib/*` (retrieval, catalog, affirmations, qa, daily-affirmations, email-sender, csrf, sanitise, freeReportGenerator, reportPdfGenerator, notify)
- `prds/hisEngine.ts`, `prds/hisNarratives.ts`, `prds/assessmentQuestions.ts`, `prds/assessmentScoring.ts`
- `data/product_catalog.json`, `data/clinician_taxonomy.json`, `data/pinecone-embeddings.json` (schema)
- `pinecone_data/*`
