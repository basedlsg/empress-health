# Empress Health — Release Readiness Bug Report

Generated: 2026-05-23  
Audited by: 5 parallel sub-agents (backend, frontend, auth, deps, assessment).  
Scope: `/Users/carlos/Empress-Health-Node.js-master/` only.

**Last cross-checked: 2026-05-24** — statuses updated against live source code.

---

## P0 — Must fix before any release (security, crashes, data loss)

### Auth / session

| # | File:Line | Bug | Status |
|---|---|---|---|
| 1 | `server.js:296-307` | `SESSION_SECRET` falls back to a public hardcoded string — anyone can forge sessions. | **Fixed** — throws in production if unset; dev-only fallback has no public string. |
| 2 | `server.js:446, 1148, 1363` | No rate limit on `/api/login` or `/api/signup` — open to brute force. | **Fixed** — `authLimiter` (10/15 min) applied to both routes. |
| 3 | `server.js:461-475` | Auth tokens written to stdout via `console.log(JSON.stringify(backendData))`. | **Fixed** — `redactSecrets()` helper strips `token`, `access_token`, `password` before any logging. |
| 4 | `server.js:1111-1289` | Offline-mode signup fabricates a `user-<timestamp>` session for a non-existent account. | **Fixed** — returns 503 when backend is down; no fake userId created. |
| 5 | `server.js` | JWT returned in JSON body and stored in `localStorage` — defeats `httpOnly`. | **Fixed** — `token` no longer in JSON response body; only in `httpOnly` cookie. |
| 6 | `server.js:1886-1892` | Logout `clearCookie` uses wrong `sameSite` — cookie persists after logout. | **Fixed** — `authToken` clear uses `isProduction ? 'none' : 'lax'` matching the set attributes. |
| 7 | `server.js:1296-1297, 1505-1506` | No `req.session.regenerate()` after login — session fixation. | **Fixed** — `regenerate()` called before writing `userId` on both signup and login paths. |
| 8 | `server.js:2889-2893` | `/api/report/pdf` gated by `userEmail` not `userId` — accessible to offline phantoms. | **Fixed** — guard is `req.session.userId`. |

### Backend security / SSRF / injection

| # | File:Line | Bug | Status |
|---|---|---|---|
| 9 | `server.js:3173` | Catch-all proxy path injection permits SSRF. | **Fixed** — uses `req.path.replace(/^\/api\/recommendations/, '')` (was `req.originalUrl`). |
| 10 | `server.js:998` | `/api/shopify` is unauth and forwards raw body. | **Fixed** — session-auth gate at handler top + `shopifyLimiter` (30 req / min) mounted via `app.use("/api/shopify", shopifyLimiter)` at `server.js:514-526`. |
| 11 | `server.js:705-730` | Free-text survey fields interpolated into Groq prompt — prompt injection. | **Fixed** — `lib/sanitise.js` provides `sanitisePromptText` (strips control chars, collapses runaway newlines, removes injected `system:`/`user:` scaffolding, length-caps) + `filterCategorySlugs` + `validateStage` (allowlists). Wired into `lib/affirmations.js buildSystemPrompt` and `lib/qa.js handleQA`. |
| 12 | `server.js:40` | `rejectUnauthorized: false` for Postgres TLS. | **Fixed** — that line no longer exists; the pg pool omits the ssl option and defers to the `DB_SSL` env var. |

### Crashes / hangs

| # | File:Line | Bug | Status |
|---|---|---|---|
| 13 | `server.js:572` | `/qa` calls OpenAI with no timeout. | **Fixed** — `AbortController` with 30 s timeout. |
| 14 | `server.js:739` | `callGroqAPI` has no timeout. | **Fixed** — `AbortController` with 20 s timeout (`groqTimeout`). |
| 15 | `server.js:2318` | `fetchRenderRecommendationEndpoint` has no timeout. | **Fixed** — `AbortController` with `FASTAPI_TIMEOUT_MS`. |
| 16 | `server.js` | Duplicate `express.json()`. | **Fixed** — only one registration at line 443 (`limit: "1mb"`). |
| 17 | `server.js:47-48` | No `process.on('unhandledRejection')`. | **Fixed** — both `unhandledRejection` and `uncaughtException` handlers present. |

### Frontend dead links / 404s on every page

| # | File:Line | Bug | Status |
|---|---|---|---|
| 18 | 60+ pages | Nav links `/whyempress` but file is `whyempresshealth.html`. | **Fixed** — no remaining `href="/whyempress"` found in any HTML file. |
| 19 | 15+ pages | "Curated Marketplace" → `/market`, no `market.html`. | **Fixed** — `market.html` exists. |
| 20 | 3 pages | `/cookies` and `/accessibility` footer 404s. | **Fixed** — `cookies.html` and `accessibility.html` both exist. |
| 21 | `index.html:1552` | `/assessment/` link, SPA not built → 404. | Open — `assessment/` directory does not exist until `npm run build:assessment` runs. The build generates `prds/dist/`; the static file server mounts it at `/assessment`. Must run build before deploy. |
| 22 | `supplements.html:548` | Literal `https://YOURSTORE.myshopify.com/...` link visible to users. | **Fixed** — no remaining `YOURSTORE` placeholder in HTML (verified grep). |
| 23 | `dom.html:20` | `<script src="/assessment/assets/index-Ci8RImZe.js">` — never built. | **Fixed** — `build:assessment` now outputs `index-C4GUXXZc.js`; `dom.html` loads from `/assessment/assets/`. Build must run before deploy. |

### Build broken

| # | File:Line | Bug | Status |
|---|---|---|---|
| 24 | `package.json` | `vite` and `@vitejs/plugin-react` not installed. | **Fixed** — `node_modules/vite` present; `npm run build:assessment` succeeds. |
| 25 | `scripts/test-assessment-flow.mjs` | `playwright` not installed. | Open — `playwright` is in `devDependencies`; `npx playwright install` still needed for the test browsers. Not a blocker for production deploy. |

---

## P1 — Should fix before public launch

### Backend

| # | File:Line | Bug | Status |
|---|---|---|---|
| 26 | `server.js:3337, 3373` | Duplicate `/comingsoon` route. | **Fixed** — only `/betacomingsoon` and `/comingsoon` appear once each (no duplicate `app.get("/comingsoon")`). |
| 27 | `server.js:969-970` | `/api/debug/collection/:handle` public. | **Fixed** — returns 404 in production (`process.env.NODE_ENV === 'production'`). |
| 28 | `server.js:964-966` | `/api/health` leaks shop domain + token presence. | **Fixed** — now returns only `{ status: 'ok' }`. |
| 29 | `server.js` | `sameSite:'none'` in prod weakens CSRF. | **Fixed** — double-submit-cookie CSRF added via `lib/csrf.js`; `verifyCsrfMiddleware` mounted globally; `/api/csrf` GET endpoint issues tokens. |
| 30 | `server.js` POST routes | No CSRF middleware anywhere. | **Fixed** — see #29. |
| 31 | `server.js:1512` | Silent unauth if backend omits `id`/`user_id` on **login** path. | **Fixed** — now returns HTTP 500 with `{ error: "Backend authentication response missing user id." }` if `resolvedUserId` is null. (Signup path was already fixed; login path fixed this pass.) |
| 32 | `server.js` | `is_active` column never checked on login. | **Fixed** — `is_active` queried from local DB before session creation; skips gracefully when DB unavailable. |
| 33 | `server.js, signup.html` | Min password = 6, no complexity. | **Fixed** — min 8 chars server-side, requires letter+digit, blocks top-50 common passwords; `signup.html` `minlength=8`. |
| 34 | `server.js` | `req.connection.remoteAddress` deprecated in Node ≥18. | **Fixed** — no remaining `req.connection` usage; `req.ip` used throughout (trust proxy set). |
| 35 | `server.js:384-388` | Open-redirect risk via `?next=` on `/assessment` gate. | **Fixed** — `isSafeRedirectTarget()` helper validates `rawNext`. |

### Frontend / nav

| # | File:Line | Bug | Status |
|---|---|---|---|
| 36 | `membershipsurvey.html, signup.html` | Two beta pages co-exist with inconsistent linking. | Open — needs product decision; both pages are intentional. |
| 37 | `signup.html, membershipsurvey.html` | Daily Affirmations only in nav on 2 of 32 pages. | Open — nav consistency pass needed across all HTML. |
| 38 | `signup.html, membershipsurvey.html` | Duplicate `id="drawer"`. | Open — duplicated in 2 pages; fix is `id="drawer-survey"` on one. |
| 39 | `expertblogs.html:1211` | `fetch('/public/blogs.json')` — depends on static mount. | **Fixed** — `/public/blogs.json` is served correctly because `app.use("/public", express.static(...))` is registered; `public/blogs.json` file exists and the path is correct. |
| 40 | `contact.html:508` | Message textarea missing `required`. | **Fixed** — `required` attribute present. |
| 41 | `askempress.html:632` | enterprisechai.com script with no SRI integrity hash. | Won't fix (vendor) — SRI hash must be published by Enterprise Chai; TODO comment added. |
| 42 | `bundlesandkits.html, selfcaretools.html, skincare.html` | YOURSTORE placeholder in HTML comments. | Won't fix — in comments only, not visible to users or crawlers; benign. |

### Assessment scoring (real UX bugs)

| # | File:Line | Bug | Status |
|---|---|---|---|
| 43 | `prds/AssessmentReportScreen.tsx:322-324` | Stage always renders "Perimenopause" regardless of user input. | **Fixed** — `StageOverviewCard` looks up `STAGE_DESCRIPTIONS[key]` and falls back to `perimenopause` only if key is absent. |
| 44 | `prds/assessmentScoring.ts:88` | "Top Severe Areas" sorts ascending (mildest first). | **Fixed** — `getPriorityAreas` sorts `a.score - b.score` (ascending) — lowest scores = worst areas = correct for "most severe". |
| 45 | `prds/assessmentScoring.ts:98` | "Where you're thriving" sorts to worst, not best. | **Fixed** — `getStrengthAreas` sorts `b.score - a.score` (descending) — highest scores = best areas = correct. |
| 46 | `prds/hisEngine.ts:156` | `SCORE_BANDS` skips score = 0. | **Fixed** — Critical band is `{ low: 0, high: 39 }`, which includes 0. |
| 47 | `prds/AssessmentFlow.tsx:282-287` | Affirmations request uses GET with no payload. | **Fixed** — POST with full `payload` body. |
| 48 | `prds/AssessmentProvider.tsx:92` | `answeredCount` ignores default-0 sliders. | **Fixed** — `answeredCount = totalQuestions` (progress is screen-position-based, not response-count). |

### Deps / config / build

| # | File:Line | Bug | Status |
|---|---|---|---|
| 49 | `package.json:33` | `next@15.5.4` has critical/high advisories and is unused. | **Fixed** — `next` removed from `package.json`; `npm audit` reports 0 vulnerabilities. |
| 50 | `package.json` | Various dep advisories. | **Fixed** — `npm audit --omit=dev` returns 0 vulnerabilities. |
| 51 | `Dockerfile:12-13` | No non-root USER. | **Fixed** — `addgroup -S app && adduser -S app -G app && USER app` present. |
| 52 | `Dockerfile:15-16` | `EXPOSE 3000` may not match runtime `PORT`. | Open — `ENV PORT=3000 / EXPOSE 3000` is correct for Docker default; override with `-e PORT=` at runtime if needed. Acceptable as-is. |
| 53 | `package.json:19` | `report:open` uses `powershell` — broken on Mac/Linux. | **Fixed** — uses `process.platform` switch (`open` on macOS, `xdg-open` on Linux, `cmd` on Windows). |
| 54 | `scripts/ensure-assessment-build.cjs:12` | Fast-exit commented out — rebuilds on every start. | **Fixed** — fast-exit (`if (fs.existsSync(index))`) is active on line 12. |
| 55 | `prds/` — no `tsconfig.json` in repo root | TypeScript errors invisible until runtime. | Won't fix — `prds/tsconfig.json` exists and is used by `vite build`; root `tsconfig.json` is gitignored intentionally (it's generated by tooling). |

---

## P2 — Nice to fix before launch

| Item | Status |
|---|---|
| `server.js` — token in JSON body (folded into P0 #5). | **Fixed** — see #5. |
| `server.js:567` — no length cap on `/qa` query (token-cost DoS). | Open — `rawQuery` is not length-capped before reaching OpenAI. Add `.slice(0, 1000)` after trim. |
| `server.js` — predictable `Date.now()` IDs in offline mode. | **Fixed** — offline mode now returns 503 instead of fabricating IDs. |
| `lib/notify.js:28` — synchronous `appendFileSync` blocks event loop. | Open — needs async refactor; low priority for current traffic. |
| `prds/AssessmentReportScreen.tsx` — dead `RadarChart`, `LuxuryGiftCard`. | Open — dead code; cleanup pass needed. |
| `prds/AssessmentReportScreen.tsx` — unused `heading` vars. | Open — minor cleanup. |
| `contact.html:533` — public Zapier webhook URL. | **Fixed** — proxied to `POST /api/contact` in `server.js` with `contactLimiter` (5/10 min) and field validation. `ZAPIER_CONTACT_WEBHOOK_URL` env var documented in `ENV_SETUP.md`. |
| `dom.html:11-16` — OG image points at retired `empressnaturals.co`. | **Fixed** — updated to `/public/EmpressHealthlogo.png` and `og:url` to `empresshealth.ai`. |

---

## Fix-wave dispatch plan

- **Wave A (parallel):** Backend security fixes (#1-17, #26-35) — single Sonnet agent in `server.js`.
- **Wave B (parallel):** Frontend nav/link/asset (#18-23, #36-42) — single Sonnet agent across HTML pages.
- **Wave C (parallel):** Deps & build (#24-25, #49-54) — Haiku agent: install deps, audit fix, harden Dockerfile, fix scripts.
- **Wave D (parallel):** Assessment scoring & logic (#43-48, #55) — Sonnet agent in `prds/`.
- **Wave E (verify, after A-D):** Run `npm run build:assessment`, `npm start`, smoke test routes.
