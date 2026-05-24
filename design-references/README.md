# Design References — Empress Health

Screenshots of every key page, refreshed on demand. The visual ground truth that designers (Claude or human) can scan in 10 seconds before proposing a change.

## How to refresh

```bash
# 1. Make sure the server is running on localhost:3100
PORT=3100 NODE_ENV=development SESSION_SECRET=dev-only-test-secret-xxxxxxxxxxxxxxxxxx MOCK_LLM=1 node server.js &

# 2. Run the snapshot
npm run design:snapshot
```

Override the base URL via `DESIGN_SNAPSHOT_BASE=http://localhost:PORT` if you're on a different port (e.g. when Docker squats 3000).

## What's captured

Per page: **one desktop (1440×900) + one mobile (375×812)** screenshot, full-page (scrollable content included).

| Group | Routes |
|---|---|
| 00–09 Marketing & content | `/`, `/howitworks`, `/whyempresshealth`, `/founderstory`, `/ourstory`, `/team`, `/faq`, `/contact` |
| 10–19 Membership flow | `/signup`, `/login`, `/membershipoptions`, `/membershipsurvey` |
| 20–29 Assessment | `/assessment?debug=1` |
| 30–39 Marketplace | `/bundlesandkits`, `/supplements`, `/skincare`, `/haircare`, `/selfcaretools` |
| 40–49 Community & content | `/community`, `/communitystories`, `/expertblogs`, `/expertguidance`, `/events`, `/ebookguides`, `/wellnesshub`, `/symptomsupport`, `/dailyaffirmations`, `/menopausemonth`, `/askempress` |
| 90–99 Trust & footer | `/privacypolicy`, `/cookies`, `/accessibility` |

Filename convention: `NN-slug-{desktop|mobile}.png` (e.g. `00-home-desktop.png`).

## When to refresh

- Right before any redesign sprint (so the "before" is captured)
- Right after a release (so the "current state" is current)
- Before invoking `frontend-design` on a page (so Claude can compare its proposal to the live render)

## What to do with the screenshots

- **Compare proposals to current** — drop both into a side-by-side image for review
- **Spot drift** — once a quarter, scroll through all `*-desktop.png` to catch off-system pages (current known offender: `selfcaretools.html`)
- **Hand off to a human designer** — these are the deliverable "current-state inventory" they need on day 1

## Adding a new page to the snapshot

Edit `scripts/snapshot-design-references.mjs` `PAGES` array. Add a row. Re-run.

## Excluding from git (optional)

The PNGs can be heavy (~5–20 MB total). If you don't want them committed:

```
# .gitignore
design-references/screenshots/*.png
```

Reasonable default: commit them. They're the design ground truth and code review benefits from seeing visual change in PRs.
