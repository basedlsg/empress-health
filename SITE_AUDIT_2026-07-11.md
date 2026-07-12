# Empress Health — Whole-Site & Application Audit

**Generated:** 2026-07-11
**Method:** 7 parallel domain auditors (Opus on backend / chatbot / security; Sonnet on static frontend / assessment SPA / data-RAG; Haiku on deps-hygiene) reading the live source read-only, plus two NotebookLM deep-research passes for open-source tooling. Top-severity findings were re-verified by hand against the working tree.
**Scope:** `/Users/carlos/Empress-Health-Node.js-master` only. Known bugs already logged in `RELEASE_BUG_REPORT.md` were excluded unless they have regressed.

---

## Overall verdict

The **core engines are genuinely strong** — the HIS clinical scoring engine (`prds/hisEngine.ts`) self-validates at startup with banker's-rounding parity to a Python reference; the grounding pipeline resolves every curated citation; SQL is uniformly parameterized; and the P0/P1 items from the May release report really are fixed *in the source*.

The risk has moved to **three seams**:

1. **The deployment surface undoes the hardening.** `vercel.json` ships `NODE_ENV=development` and a committed `SESSION_SECRET`, which re-opens the exact forgeable-session hole the release report marked "Fixed."
2. **Sensitive health PII is sitting in / next to git.** `data/affirmation-subscribers.json` is tracked; `uploads/*.jsonl` (real leads) is not gitignored.
3. **Money-spending and mail-sending endpoints are wide open.** `/qa`, `/api/free-trial-report`, and `/api/free-score-lead` are unauthenticated with no rate limit; the last will send Empress-branded email to any address on demand.

None of these require a rewrite. The top tier is roughly a day of work. Everything below is prioritized so you can stop at any line and still have shipped the highest-value fixes.

**Severity tally:** 3 critical · 21 high · 30 medium · 14 low (77 findings across 7 dimensions).

---

## TIER 0 — Fix this week (cross-confirmed by multiple auditors, hand-verified)

### 0.1 — CRITICAL · `vercel.json` ships `NODE_ENV=development` + a committed `SESSION_SECRET`
**Verified.** `vercel.json` lines 29 & 33 literally contain `"NODE_ENV": "development"` and `"SESSION_SECRET": "vercel-demo-only-not-a-real-secret-fffffffffffffffff"`. Because `server.js:295` derives `isProduction` from `NODE_ENV==='production'`, the deployed app runs with `secure:false` cookies (session, CSRF, and authToken), emits stack traces to clients, and — because the signing secret is a public string in the repo — **anyone can forge a valid session cookie.** This is the same bug class as `RELEASE_BUG_REPORT.md` #1, reintroduced at the deploy layer.
**Fix (S):** Set `NODE_ENV=production` in `vercel.json`; remove the hardcoded secret and inject it as an encrypted Vercel env var; **rotate the exposed value** (treat it as burned).

### 0.2 — CRITICAL · Subscriber/lead health PII is committed or one `git add` from being committed
**Verified.** `git ls-files` returns `data/affirmation-subscribers.json` (tracked — contains email, stage, age, priority categories, unsubscribe token). `git check-ignore uploads/` returns nothing (not ignored); `uploads/` holds `free-score-leads.jsonl` and `assessment-feedback.jsonl` with real name + email + ZIP + symptom scores. `.gitignore` covers only `.env*`, `*.log`, `artifacts/`, `prds/dist/`. A single `git add -A && commit` publishes customers' menopause-symptom data into history permanently.
**Fix (S→M):** Immediately add `uploads/`, `*.jsonl`, `data/affirmation-subscribers.json` to `.gitignore`; `git rm --cached data/affirmation-subscribers.json`; scrub it from history (git-filter-repo/BFG) before the next push to any shared remote. Then migrate subscriber/lead/feedback storage to Postgres — `pg` + `connect-pg-simple` are already dependencies and already connected for sessions, just unused for this data.

### 0.3 — HIGH (critical-adjacent) · Unauthenticated, un-rate-limited endpoints spend money and send mail
**Verified.** `app.post("/qa")` exists at `server.js:729` with no `app.use("/qa", limiter)` and no auth; it runs Pinecone + Gemini per call. `/api/free-trial-report` (`server.js:3324`, comment: "No auth, no completion gate") also hits Gemini unthrottled. `/api/free-score-lead` (`server.js:2910`, CSRF-exempt) calls `sendEmail({to: <caller-supplied>})` with a branded template and interpolates `firstName`/`stage` **unescaped** into the HTML. Net: cost-DoS on the LLM budget + an open email-spam relay off Empress's sender reputation.
**Fix (S):** Add an `express-rate-limit` instance (e.g. 20/min/IP for LLM routes; 3/hr/IP for the email route) — the limiter pattern already exists for `/api/login|/signup|/contact|/chat`. HTML-escape `firstName`/`stage`. Gate the "email me my score" send behind confirmation rather than firing on any anonymous POST.

### 0.4 — HIGH · Email delivery is silently non-functional — `nodemailer` isn't installed
**Verified.** `ls node_modules/nodemailer` → absent; `grep -c nodemailer package.json` → 0. `lib/email-sender.js` only sends when `require('nodemailer')` succeeds, else it warns and falls back to writing `email_outbox.log`. So even with SMTP env vars set in prod, **every** message (score emails, daily affirmations) is logged and never delivered.
**Fix (S):** Add `nodemailer` to dependencies, or hard-fail when `SMTP_*` is configured but the module is missing, so a real send can never silently degrade to log-only.

---

## TIER 1 — High priority (before/around public launch)

### Backend & security
- **No global Express error handler** (`server.js` end) — with `NODE_ENV=development` forced, the default handler leaks stack traces; several handlers also echo `err.message` to clients. Add a terminal `app.use((err,req,res,next)=>…)` that logs server-side and returns a generic message. *(S)*
- **No security headers** — `helmet` absent from `package.json`; no CSP, X-Frame-Options, HSTS, nosniff on a health app that serves login forms and an embedded chatbot. Add `helmet` with a tuned CSP (start report-only). *(S)*
- **MemoryStore session fallback** (`server.js:306`) — the pg session store is only created when `DB_*` env vars are present; on Vercel (no DB env) sessions fall back to in-process MemoryStore, so **logins don't persist** across serverless invocations and memory leaks. Require a real store in prod and fail fast otherwise. *(M)*
- **CSRF exemptions use prefix matching** (`lib/csrf.js:77`) — `req.path.startsWith(exempt)` means a future `/api/loginhistory` silently inherits `/api/login`'s exemption; `/api/checkout` is exempted wholesale. Switch to exact-path `Set.has`. *(S)*
- **Expensive PDF render endpoint unthrottled** (`server.js:3221`) — `/api/report/pdf` is session-gated (good) but spawns a headless-browser render per call with no limiter; a single user can exhaust memory. Add a per-session limiter. *(S)*
- **`lib/notify.js` writes leads without `await`** (line 62) — `appendJsonl` returns a pending Promise that's never awaited; a write failure on read-only serverless FS becomes an unhandled rejection and the lead is lost silently (and `/api/free-score-lead` returns `{ok:true}` regardless). *(S)*

### Chatbot (owner's #1 improvement target)
- **`/qa` is simultaneously CSRF-exempt, rate-limit-exempt, and unauthenticated** while calling a paid LLM — the single biggest abuse vector (same as 0.3). *(S)*
- **Local-mode retrieval is hand-rolled TF-IDF over only 25 chunks, no reranking** (`lib/retrieval.js`) — purely lexical, `MIN_SCORE_THRESHOLD` 0.10 is very permissive. If `PINECONE_API_KEY` is unset in prod, every clinical answer is keyword-matched against 25 docs. Ensure Pinecone (llama-text-embed-v2) is the prod path and fail loudly if not; add a reranking stage. *(M)*
- **Chat is fully stateless** (`lib/qa.js:27`) — `handleQA` takes no history; follow-up questions ("why does that happen?") retrieve with zero prior context. `trimHistory` is defined (`server.js:561`) but never called. Thread a bounded history into retrieval + generation. *(M)*
- **The brand's visible-citation invariant is undercut** (`lib/qa.js:120`) — `sources[].snippet` is always `""`, the system prompt forbids inline citations, and the UI (`askempress.html`) renders only the last 12 chars of an opaque chunk ID with no evidence text. This is the literal inverse of `BRAND_BRIEF.md §5`. Populate `snippet` from retrieved chunk content and render it. *(M — but the snippet population is a quick win)*

### Assessment SPA
- **No completion gate on the 120-question screen → contradictory report** (`AssessmentReportScreen.tsx:436`) — when enough sliders are skipped, `computeHis` returns `his:null`, `overall` falls through to a *legacy* numeric score while `overallBandLabel` still reads `'Incomplete'`; the paid report cover can show e.g. "72" directly above an "Incomplete" badge. **Previously unreported.** Derive overall/band/color as one unit that falls back together, and add a completion indicator. *(S)*
- **Zero React error boundaries** (`main.tsx`) — a single null-deref anywhere in the 4,311-line `AssessmentReportScreen` white-screens the whole page at the moment a paying customer expects their report. Add `react-error-boundary` at the flow root and around the report. *(S)*
- **120 range sliders have no accessible name; no focus management / aria-live in the wizard** (`AssessmentCategoryScreen.tsx:115`) — a screen reader announces only "slider, 0 to 10" for every paid-tier question. The staging screen two steps earlier does this correctly, so the pattern is known. Add `aria-label`, an `aria-live` progress region, and focus-move on step change. *(S)*
- **Post-assessment fetch fan-out has no timeout and runs sequentially** (`AssessmentFlow.tsx:406`) — 4 awaited fetches gate report reveal; if one hangs, `Promise.all` never resolves and the paying user is stuck on an infinite spinner with no escape. Add `AbortSignal.timeout(15000)` to each and switch to `Promise.allSettled`; add a "Continue anyway" affordance. *(M; the timeout itself is a quick win)*

### Static frontend
- **Primary CTA on the free-assessment funnel fails WCAG AA contrast** (`free-assessment.html:71`) — white on gold `#D8A738` = 2.21:1, violating `DESIGN.md`'s own rule ("Text on gold — NOT white"). This is the most actively developed page in the repo. Change `color:#fff` → `color:var(--plum)`. *(S — quick win)*
- **Split-brain deploy: two live paths read different HTML trees** (`scripts/copy-legacy-html-to-public.mjs:44`) — Docker (`node server.js`) serves root `*.html`; Vercel serves a build-time copy in `public/`, synced by an **mtime-only** guard with no content hash. Any direct edit to a `public/` file permanently blocks future syncs — which has already happened to `public/expertblogs.html` (408 diverged lines, broken `og:url`). Pick one canonical tree. *(L)*
- **A third undocumented ~40-page redesign is live** at `/pages/*` and `/r/<slug>` with its *own* design system ("Empathetic Elegance," different plum/gold hexes and fonts), shipping unminified dev React + in-browser Babel. Not mentioned in any brand doc; reachable only by direct URL. Decide: adopt or noindex/remove. *(L)*
- **Live pricing shows $129; documented price is $139** (`pricing.html:380`, `server.js:3927` sets `priceUSD`) — reconcile before Stripe is wired in, because whatever sits in `session.priceUSD` is what a real integration charges. *(S)*
- **Homepage & pricing load fonts they never use and use fonts they never load** (`index.html:25`) — headings reference Poppins/Inter but only Playfair/Nunito are linked, so they render in system fallback. *(M)*

### Data / RAG
- **Second product catalog ships with `evidence_refs: []`** (`server.js:990`) — `products-matrix.json` (100 records) is blended into the same recommendations array as grounded products with citations hardcoded empty, and `validate-catalog.mjs` never checks it. Direct violation of the citation invariant. Ground it, or relabel those cards as "editorial pick" so the UI doesn't imply a citation. *(M)*
- **`seed:upsert` writes to the wrong index/namespace/dimension than retrieval reads** (`scripts/upsert-pinecone.mjs`) — the npm-wired script pushes 1255-dim local TF-IDF vectors to index `empress-clinical-framework` (default namespace), but `lib/retrieval.js` queries index `empress`, namespace `clinical-framework`, using Pinecone's hosted 768-dim `llama-text-embed-v2`. The correct script (`upsert-pinecone-inference.mjs`) isn't wired anywhere → grounded retrieval risks being silently empty. Repoint the script. *(S — quick win)*
- **Sitewide HRT→MHT rename never reached the corpus** (`lib/retrieval.js:61`) — "MHT" appears 0× in the chunks and isn't in the TF-IDF vocab or synonym map, so queries using the site's current term can't find the 3 HRT chunks. Add the `mht↔hrt` synonym and re-embed. *(S — quick win)*

---

## TIER 2 — Medium (quality, maintainability, correctness-adjacent)

- **`server.js` is a 4,220-line monolith** mixing DB bootstrap, middleware, ~40 APIs, and ~90 page routes, with a large commented-out duplicate `/api/chat` handler and dead redesign blocks. Split into `express.Router` modules by domain. *(L)*
- **`/api/chat` proxies to a hardcoded external service** (`https://empress-mvp-ai.onrender.com/qa`) that can diverge from the local grounded pipeline; a full second copy is dead-commented; CORS `allowedOrigins` contains malformed path-bearing entries that can never match. *(S)*
- **Hallucination guardrails are prompt-only** (`lib/qa.js:84`) — "no product names / no invented stats / no citations" is enforced solely by prompt text with no output verification, unlike the recommendations path which validates `evidence_refs` against retrieved IDs. Add an output validator. *(M)*
- **Metadata filters exist but are unused in chat** (`lib/qa.js:38`) — `retrieveContext` is called with no domain/category filter though the machinery exists; precision signal is discarded. *(M)*
- **No streaming** — `callGemini` walks a 4-model × 3-retry fallback chain (up to ~13s) then returns one JSON blob; the UI shows a static typing dot. Stream tokens (Gemini `streamGenerateContent` / Vercel AI SDK). *(M)*
- **MOCK_LLM bypasses the real prompt path** (`lib/qa.js:68`) — `test-qa.mjs` only asserts a non-empty string + real source IDs; faithfulness, forbidden-content, and Gemini parsing are never tested. *(M)*
- **Corpus quality** (`scripts/embed-pinecone-seed.mjs:190`) — 25 chunks total (one is a 134-char marketing tagline); local embeddings are built from only the **first 200 chars** of each ~3,500-char chunk, several starting mid-sentence. Re-chunk on semantic boundaries and embed full content. *(M)*
- **Enrichment review-flag uses AND not OR** (`scripts/enrich-pinecone-seed.mjs:363`) — chunk-023 has real content but empty `domain_ids`, so it's unreachable by category-filtered retrieval and was never flagged for review. *(S)*
- **Provider directory covers 10 states; 84% missing phone, 81% missing email, no freshness/provenance metadata** (`data/menopause-directory.json`). *(M)*
- **No CI enforcement of any data/RAG validation** — the only GitHub Actions workflow runs Playwright UI smoke tests; `validate:catalog`, `retrieval:test`, and the grounding suites never run in CI. *(S)*
- **SPA: two non-cross-validated sources of truth** for the 120-question taxonomy (`assessmentQuestions.ts` vs `hisEngine.ts` `DOMAIN_CONFIG`) — they agree today but nothing catches future drift. Have `validateConfig()` assert they match at startup. *(M)*
- **SPA: dead free-tier code ships in the prod bundle** — `FreeMiniAssessment.tsx` (43KB) has no call site; the live free quiz is the standalone `free-assessment.html`. Delete or `React.lazy()`. *(S)*
- **SPA: brand colors hand-copied into 7 files, 2 drifted to different hexes** — a canonical `reportPalette` already exists; import it. *(S)*
- **SPA: single unsplit 424KB (131KB gz) bundle**, no code-splitting; the report screen + dead free quiz load before the entry form paints. Add `React.lazy()` boundaries. *(M)*
- **SPA: `test-his-engine.ts` never exercises the domain-exclusion / Incomplete-band path** through `runAssessment()` — exactly the path reachable by the completion-gate bug above. Add coverage. *(S)*
- **Static: `public/` is 1.1GB** — 664MB is `blogsv2/` loaded via runtime string-substitution to 3840px originals (a 13MB hero) with no `srcset`/width/height (sitewide CLS risk); multi-MB `.zip` archives sit in the unauthenticated static mount. *(M)*
- **Static: 314MB of Illustrator/temp design source** (`Hero Image/`, `Hero Image New/`) sits untracked at repo root referenced by nothing — gitignore it before a `git add -A`. *(S — quick win)*
- **Static: canonical tags absent sitewide; `og:url` points at retired `empressnaturals.co`** on 7/7 sampled pages. *(S)*
- **Static: dead/orphan pages** — `dom.html` plus 8 `public/`-only pages (blog variants, `mobile-test.html`, a 320KB saved "Canva AI - Canva.html") with zero inbound links, deployed to Vercel. *(S)*
- **Static: DESIGN.md's own a11y floor unmet** — skip-links on 6/37 pages, no `<main>` landmark on 17/37 (incl. home, login, pricing, contact). *(M)*
- **`expertblogs.html` innerHTML sinks** un-sanitized (`public/expertblogs.html:1236`) — first-party today, stored-XSS the moment `blogs.json` becomes CMS-editable, with no CSP backstop. *(S)*
- **Full emails/names logged in plaintext** to stdout and `email_outbox.log` (`lib/notify.js:79`, `lib/email-sender.js:99`) incl. live unsubscribe tokens — compliance gap for a health app. *(S)*
- **`npm test` is a broken placeholder** (`package.json:16`) and nothing tests the Express surface (auth/session/CSRF/404). *(M)*

---

## TIER 3 — Low (polish, latent risk, hygiene)

- Vite ≤6.4.2 has two high-severity advisories (`GHSA-v6wh-96g9-6wx3`, `GHSA-fx2h-pf6j-xcff`) and `@babel/core` a low one — `npm audit fix`. *(S — quick win)*
- No `engines` field / `.nvmrc`; CI pins Node 20, docs say Node 22, local is 20.19.0 — declare the contract. *(S)*
- No ESLint/Prettier/editorconfig anywhere; add `eslint-plugin-jsx-a11y` to catch the slider-label class of bug in CI. *(M)*
- Identical HTML duplicated across root + `public/` (+ `public/pages/`); duplicate `Empress_Health_FAQ.pdf` at root and in `prds/`. *(M)*
- Major dep lags: TypeScript 5→7, Vite 6→8, `@types/node` 24→26 — evaluate in a spike, not a blind bump. *(M)*
- TypeScript `strict:false` repo-wide (passes plain `tsc` today, so latent not live). *(L)*
- `AssessmentReportScreen.tsx` is one 4,311-line file with 20+ components — split into a `report/` dir (natural `React.lazy` boundaries). *(L)*
- No response caching on `/qa`; add a small LRU on normalized query. *(S)*
- `test-retrieval.mjs` can't fail CI (domain misses are warnings, never `exit 1`). *(S)*
- 39 orphaned reference docs (`mock*_prd.md`, `*_extract.md`) sit inside `prds/` alongside the real source of truth. *(S)*
- Orphaned byte-identical duplicate seed file in unused `data/pinecone-seed/`. *(S)*
- CSRF body-token fallback is dead because `express.json` is registered after the CSRF middleware (`lib/csrf.js:83`). *(S)*

---

## Recommended open-source toolkit

Deduplicated across all auditors and the NotebookLM research, scoped to your Node 22 / Express 5 / React 19 / Vite stack. Ordered by leverage.

| Tool | Where it plugs in | What it replaces / fixes here |
|---|---|---|
| **helmet** | `server.js` before routes | The complete absence of security headers (CSP/HSTS/frameguard/nosniff). One `app.use`. |
| **nodemailer** | `lib/email-sender.js` | Already `require`d but not installed — makes email actually send instead of silently logging. |
| **zod** + a validate middleware | POST handlers | Ad-hoc per-handler string checks on `signup` / `free-score-lead` / `free-trial-report`. Runtime validation + types in one. |
| **pino** + **pino-http** (with `redact`) | replace `console.log` | Structured logging with automatic email/phone/token redaction — fixes the plaintext-PII-in-logs finding directly. |
| **connect-redis** or a pooled pg session store | `express-session` | The MemoryStore fallback that breaks logins on serverless. |
| **@pinecone-database** rerank *or* a `@xenova/transformers` cross-encoder | `lib/retrieval.js` | The missing reranking stage — biggest single retrieval-quality lever. |
| **Vercel AI SDK** (`ai`, Google provider) | chat endpoint + `askempress.html` | Streams Gemini tokens → kills the fully-blocking response + static typing dot. |
| **promptfoo** (Ragas-style config) | new CI job | A real RAG eval harness (faithfulness, answer relevance, forbidden-content) — today `MOCK_LLM` short-circuits all of it. |
| **react-error-boundary** | `prds/main.tsx` | The zero-error-boundary white-screen risk on the paid report. |
| **isomorphic-dompurify** | blog innerHTML sinks | Stored-XSS surface with no CSP backstop. |
| **sharp** | build-time image step | The 664MB `blogsv2/` dump + 314MB Hero folders → real AVIF/WebP variants with width/height. |
| **Astro** | the 3-way HTML duplication | One templated source + shared header/footer partial, hosting the existing React as islands — the definitive fix for split-brain deploy. |
| **@axe-core/playwright** + **Lighthouse CI** | CI gate | Automates the contrast/landmark/CLS checks this audit did by hand, so AA-contrast regressions can't ship silently. |
| **vitest** + **@testing-library/react** | `npm test` | Unified runner (native to Vite 6) + the first component-level tests; backs a real `npm test`. |
| **ESLint** + **eslint-plugin-jsx-a11y** + **Prettier** | repo root + CI | No linting exists; catches the unlabeled-slider class before it ships. |
| **node-pg-migrate** | data layer | Versioned Postgres tables for subscribers/leads/feedback (replacing committable JSON files) without adopting an ORM. |
| **gitleaks** | pre-commit / CI | Would have caught `affirmation-subscribers.json` before it was committed. |
| **supertest** | Express tests | HTTP-level auth/CSRF/session tests the current node scripts don't cover. |

---

## Chatbot deep-dive (research-backed) — the owner's #1 target

NotebookLM deep research (94 sources, 2025-2026) on production RAG maps cleanly onto the gaps found in code. The upgrade path, in order:

1. **Close the abuse hole first** (Tier 0.3) — rate-limit `/qa`. Nothing else matters if the endpoint can be drained.
2. **Guarantee the real retrieval path in prod** — fail loudly if `PINECONE_API_KEY` is unset so you never silently serve 25-chunk TF-IDF answers; fix the `seed:upsert` index/namespace mismatch so the corpus is actually there.
3. **Add hybrid search + reranking.** The research is emphatic that dense-only retrieval misses exact clinical terms ("Type 1" vs "Type 2", drug names). Because **Postgres is already a dependency**, the lowest-friction path is `pgvector` + BM25 with Reciprocal Rank Fusion (RRF, k≈60) — a documented "hybrid search in ~100 lines" pattern on your exact stack — rather than standing up a second datastore. Then a reranking pass: `FlashRank` (≈4MB ONNX, ~0.1–0.4s/100 docs on CPU) or `@xenova/transformers` running a `bge-reranker-v2-m3` cross-encoder in-process, no GPU service.
4. **Stream responses** via SSE + Gemini `streamGenerateContent` (the `@google/genai` SDK exposes a step-based event stream). Set `X-Accel-Buffering: no` so Vercel/proxies don't buffer tokens.
5. **Make the citation visible** (the brand promise) — populate `sources[].snippet` and render evidence text, not a truncated ID.
6. **Add output guardrails** — a claim-vs-context faithfulness check + a deny-list for product names/citations at the output stage, not just in the prompt.
7. **Wire `promptfoo`/Ragas into CI** as a quality gate so retrieval regressions and hallucinations fail the build.

The prototype in `fwd1012…/empress_engine.py` was reviewed: its value is the 12-question Greene Climacteric scoring, **not** a chatbot (its "chat" is just a hyperlink to an external service). Nothing there is worth porting into the Node app.

**Longer horizon (optional):** for a clinical KB, the research points to ontology-aware retrieval (SNOMED-CT / UMLS synonym mapping) and semantic/section-aware chunking, which measurably beat fixed-size chunks in biomedical RAG. That's a corpus-expansion project, not a launch blocker.

## Frontend consolidation path (research-backed)

The three-tree duplication is the single biggest maintainability drag on the site. Recommended path (NotebookLM, 2026 SSG comparison):

- **Adopt Astro**, not Eleventy or hand-rolled templating. Astro gives you a real component model (one shared header/footer, killing the ~40-page nav drift) *and* native React islands, so the existing assessment SPA embeds directly via `client:load` while the marketing pages ship as static HTML. Migrate incrementally.
- **Images:** AVIF-first with WebP fallback via Astro's `<Image>` (or `sharp` at build) — defaults AVIF q60 / WebP q80. Encode once, serve forever; ~70% smaller than the current JPGs.
- **Express hardening order:** `helmet` (security, immediate) → `zod` (input validation) → `pino` (observability). Test CSP in report-only mode first because of the inline SPA assets.
- **CI quality gates:** Lighthouse CI as a *blocking* Core-Web-Vitals budget; axe-core/Playwright a11y as a *non-blocking* report-to-GitHub-Issue check (you have existing a11y debt, so don't block deploys on it yet — track it down instead).

---

## Suggested sequencing

- **This week (≈1 day):** Tier 0 in full — fix `vercel.json`, gitignore + purge PII, rate-limit the three open endpoints, install `nodemailer`. Add `helmet` and a global error handler while you're in `server.js`. Bank the sub-hour quick wins (CTA contrast, `mht` synonym, `seed:upsert` repoint, `.gitignore` the Hero folders, `npm audit fix`).
- **Next 2 weeks:** SPA correctness (completion gate, error boundary, slider a11y, fetch timeouts), chatbot citation snippet + rate limit, session store, CSRF exact-match, CI running the existing grounding + HIS suites.
- **This quarter:** the chatbot retrieval upgrade (hybrid + rerank + streaming), the Astro consolidation, image pipeline, `server.js` modularization, and a real `npm test` with vitest + supertest.

---

*Full per-dimension findings with evidence and line numbers are preserved in the audit working files; this document is the prioritized synthesis. Research notebook: "Empress Health — Audit Research 2026-07" (NotebookLM, 104 imported sources).*
