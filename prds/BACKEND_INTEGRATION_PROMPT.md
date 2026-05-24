# Backend integration prompt — paid report RAG against Pinecone_Data

Paste this into a fresh Claude session opened on the **FastAPI backend repo** (the service that already hosts `/product-recommendations`). It contains everything the backend Claude needs about the Node side, the Drive corpus, and the paid report so it can plan and implement without re-asking.

---

## Role and goal

You are a senior backend engineer working on the Empress Health FastAPI service. The Node.js front-end (`Empress-Health-Node.js`) calls into this service for any retrieval-augmented work. Today only one endpoint is live: `POST /product-recommendations`, which does RAG against a curated product knowledge base and returns `{ response, products, retrieved_documents_count }`.

The product team wants the upcoming **paid 20-page Health Intelligence Report** to be grounded in a curated clinical corpus (the Empress "Pinecone_Data" Google Drive folder) — not just product picks. Your job is to extend this FastAPI service so the Node side can call new endpoints to retrieve grounded narrative content, biomarker flags, and clinician-question suggestions for every section of the report.

Treat this as: scope the work, propose the endpoint contracts, ship the ingestion pipeline, then implement the endpoints. Stop and ask before guessing on anything that touches index naming, embedding model, or namespacing — those decisions outlive this task.

---

## What lives on the Node side (do not duplicate)

Repo: `Empress-Health-Node.js`. Relevant files:

- `prds/PAID_REPORT_SCOPE.md` — the 20-page report spec. Status: not yet built. Inputs already computed in `AssessmentFlow.tsx`:
  - `user: { firstName, age }`
  - `responses: ResponseMap` — 120 `{ questionId → 0–10 }`
  - `categories: AssessmentCategory[]` — 10 categories × 12 questions
  - `overall: number` — 0-100 score from `calculateOverallScore`
  - `categoryScores: CategoryScore[]` — per-category 0-100 + `Priority | Moderate | Strong`
  - `priorities: CategoryScore[]` — top-3 lowest categories
  - `affirmations: string[]` (from B3, already wired)
  - `recommendations: RecommendedPerson[]` (from B4, already wired)
- `server.js` — existing `callFastAPIProductRecommendations` (around line 2566) and `handleProductRecommendations` (around line 2616). These define the calling pattern: fetch with `AbortController` timeout, JSON in, JSON out, 503 fallback when FastAPI is down. **Follow this same pattern for the new endpoints** so the Node integration stays uniform.
- `lib/freeReportGenerator.js` — the free-tier 5-page `.docx` builder. The paid builder will live alongside it as `services/reportBuilder.js` (does not exist yet). The paid builder will call your new endpoints and stitch results into the docx template.
- `pinecone_data/empress-120-symptom-biomarker-framework-records.json` and `data/pinecone-seed/empress-120-symptom-biomarker-framework-records.json` — the only corpus file already in the Node repo. Naming implies a seed file for a Pinecone index. Confirm whether this is the canonical ingestion artifact or a stale copy.

The 10 paid-tier categories (slugs used everywhere — keep them consistent in metadata):

1. `vasomotor-temperature`
2. `sleep-architecture-cortisol`
3. `cognitive-function-brain-health`
4. `mood-anxiety-emotional-health`
5. `metabolic-health-body-composition`
6. `skin-hair-nails`
7. `musculoskeletal-bone-health`
8. `genitourinary-sexual-health`
9. `cardiovascular-whole-body-energy`
10. `lifestyle-gut-nutrition`

---

## The corpus — Pinecone_Data Google Drive folder

Owned by `empresshealthtech@gmail.com`. Folder ID `1WJN_UM3VYwlbmCoF6ei48skZBlo7sI9j`. Contents as of 2026-05-13:

**Curated Q&A spreadsheets (these are the highest-signal documents — already in question-answer form, perfect for retrieval):**

- `Chatbot_QA_All_Combined_augmented.xlsx` — the master combined Q&A set
- `Empress_Naturals_Blog_QA_Combined.xlsx`
- `Articles on Menopausal Symptoms Q&A.xlsx`
- `Second combined articles on Menopause.xlsx`
- `Supplements for menopausal women.xlsx`
- `menopause directory by category.xlsx`
- `5 Blood Tests Every Woman Should Ask For - QA 20.xlsx`
- `Targeted vibrations for bone health.xlsx`
- `Shah_VitaminD_QA_50.xlsx`
- `Patel_AgeYounger_QA_50.xlsx`
- `Abdominal_Obesity_QA_20.xlsx`
- `GLP1_Report_QA_100.xlsx`
- Subfolder `Empress_Naturals_Combined_QA_and_metadata` — likely the latest combined set with metadata columns; treat as canonical when present.

**Reference research PDFs (use for citations, not bulk retrieval — chunk and tag with `source_type=research_pdf`):**

- `Bone and the Perimenopause.pdf`
- `The Role of Follicle-Stimulating Hormone in Bone Loss During Menopause Transition.pdf`
- `estrogen_and_metabolism__navigating_hormonal.pdf`
- `Relationship between bone mineral density and ovarian function and thyroid function in perimenopausal women with endometriosis.pdf`
- `Management of perimenopausal and menopausal symptoms.pdf`
- `Osteoporosis Due to Hormone Imbalance.pdf`
- `Perimenopausal Bone Loss Is Associated with Ovulatory Activity.pdf`
- `The association of endogenous hormone concentrations.pdf`
- `the_role_of_menopausal_hormone_therapy.pdf`
- `J of Bone & Mineral Res - 2019 - Shieh - Predictors of Onset of Menopause.pdf`
- `haziran2020_3.pdf`

**Empress proprietary frameworks:**

- `Empress 120 Symptom Biomarker Framework.pdf` — maps symptoms to biomarkers. Likely the source for `empress-120-symptom-biomarker-framework-records.json` already in the Node repo. This is the spine of the report's "flagged biomarkers" section.
- `Empress_Health_FAQ42226.pdf`
- `Empress_mvp.pdf` — product/positioning doc, low signal for clinical retrieval.

---

## Deliverables

### 1. Ingestion pipeline

A script (or scheduled job) that pulls every file from the Drive folder, chunks/normalises, embeds, and upserts into Pinecone with consistent metadata. Required metadata on every vector:

- `source_file` (string)
- `source_type` — one of `qa_spreadsheet`, `research_pdf`, `framework`, `faq`, `product`
- `category` — one of the 10 slugs above, or `general` if cross-cutting. Q&A spreadsheets often map cleanly to a category by filename; PDFs may need an LLM-assisted tagging pass.
- `topic` — finer-grained tag (e.g. `vitamin-d`, `glp1`, `bone-density`, `vasomotor`)
- `chunk_id` and `parent_doc_id` so the report can cite back to the source file + section
- `ingested_at` (ISO timestamp)

Open question for the Empress team: one index with metadata filters, or one namespace per category? Default recommendation: **one index, filter by metadata** — simpler reindexing, and most queries will need cross-category context anyway.

The ingestion should be **idempotent and re-runnable** so the corpus can be refreshed when the clinical writer adds new Q&A.

### 2. New endpoints

All endpoints follow the same shape as `/product-recommendations`:

- POST, JSON body, JSON response
- Always return `retrieved_documents_count` so the Node side can log retrieval health
- Include a `citations` array on every response: `[{ source_file, chunk_id, snippet }]` — the docx builder will render these as footnotes on the methodology page (page 20 of the report)
- Bounded latency: target p95 under 4s, hard timeout 8s — the Node side runs three of these in parallel and the user is staring at a loading screen

Required endpoints:

**`POST /report/category-narrative`**
- Body: `{ category_slug, category_score, status, response_summary, user: { age, firstName } }`
  - `response_summary` is a short string the Node side will assemble from the 12 question responses in that category (e.g. "Hot flashes: 8/10, night sweats: 7/10, …")
- Response: `{ narrative, what_this_means, citations, retrieved_documents_count }`
  - `narrative` ≈ 150-250 words, warm-clinician tone
  - `what_this_means` ≈ 80-120 words

**`POST /report/clinical-questions`**
- Body: `{ category_slug, category_score, status, response_summary }`
- Response: `{ questions: string[], citations, retrieved_documents_count }`
  - 3-5 questions the member should bring to their clinician, grounded in the corpus

**`POST /report/biomarker-flags`**
- Body: `{ priorities: CategoryScore[], responses: ResponseMap, profile?: { symptoms?, goals? } }`
- Response: `{ flags: [{ biomarker, rationale, related_symptoms, suggested_test, citations }], retrieved_documents_count }`
- Grounded primarily against `Empress 120 Symptom Biomarker Framework` chunks (filter `source_type=framework`)

**`POST /report/protocol`**
- Body: full report payload (user, priorities, recommendations, affirmations)
- Response: `{ ninety_day_protocol: [{ phase: "0-30" | "31-60" | "61-90", focus, actions: string[] }], citations, retrieved_documents_count }`
- Powers page 19 of the report ("Your 90-Day Protocol")

Keep `/product-recommendations` untouched — Section 07 of the report already calls it and the contract is shipped.

### 3. Failure mode

Every endpoint must return useful content even when Pinecone is unreachable. Pattern: if retrieval returns zero documents or the vector DB throws, fall back to an LLM-only response with `retrieved_documents_count: 0` and `citations: []`, and set a `degraded: true` flag on the response. The Node side will log `degraded` responses but still render the report — the alternative (failing the whole report) is worse than ungrounded prose.

### 4. Out of scope for this pass

- Streaming responses (the docx builder needs full responses anyway)
- Per-user personalization beyond what's in the request payload (no user history, no learning)
- Non-English output
- Anything touching the free tier — the free 5-page report is fully implemented in `lib/freeReportGenerator.js` on the Node side and does not call FastAPI

---

## How to start

1. Confirm the current FastAPI repo layout, Python version, and how `/product-recommendations` is structured today — re-use its router, embedding model, Pinecone client, and config patterns.
2. Confirm with the Empress team: which embedding model is in use, what the Pinecone index name and dimension are, and whether the existing index is shared with `/product-recommendations` or separate.
3. Propose the ingestion script's shape (single CLI entry point that takes a Drive folder ID or a local mirror) before writing it.
4. Draft the four new endpoint signatures as FastAPI route stubs returning canned responses, so the Node side can wire against them in parallel with your retrieval work.
5. Implement retrieval one endpoint at a time, starting with `/report/category-narrative` since it's the highest-volume call (10 per report).

Ask before assuming anything about the embedding model, index name, or where the corpus should live in cloud storage. Those decisions need a human in the loop.
