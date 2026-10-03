import { useCallback, useEffect, useState } from "react"
import { AssessmentProvider, useAssessment, type AssessmentTier } from "./AssessmentProvider"
import { AssessmentEntryScreen } from "./AssessmentEntryScreen"
import { AssessmentStagingScreen } from "./AssessmentStagingScreen"
import { AssessmentCategoryScreen } from "./AssessmentCategoryScreen"
import { AssessmentNotesScreen } from "./AssessmentNotesScreen"
import { AssessmentReportScreen } from "./AssessmentReportScreen"
import { AssessmentSiteNav } from "./AssessmentSiteNav"
// Free tier is temporarily disabled. Import retained so re-enabling only
// requires uncommenting the `return <FreeMiniAssessment />` branch below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FreeMiniAssessment } from "./FreeMiniAssessment"
import { assessmentCategories } from "./assessmentQuestions"
import { readPrintState } from "./printMode"
import {
  calculateCategoryScores,
  calculateOverallScore,
  getPriorityAreas,
} from "./assessmentScoring"

type Step = "entry" | "staging" | "questions" | "notes" | "loading" | "report"

export type RecommendedPerson = {
  name?: string
  title?: string
  specialty?: string
  reason?: string
  [key: string]: unknown
}

/** Grounded affirmation item with optional evidence refs. */
export type AffirmationItem = {
  text: string
  focus_domain?: string
  evidence_refs?: string[]
  /** From the curated affirmations library: short statement + supporting line. */
  caption?: string
  description?: string
  theme?: string
}

/** Grounded clinician match returned by /api/recommendations/combined. */
export type ClinicianMatch = {
  specialty_id?: string
  label?: string
  abbreviation?: string
  reason?: string
  find_provider_url?: string
  evidence_refs?: string[]
}

/** A real provider from the menopause directory, matched to the user's
 *  state / ZIP and shown in the report's clinician section. */
export type Provider = {
  name: string
  qualification?: string
  category?: string
  state?: string
  address?: string
  phone?: string
  website?: string
  linkedin?: string
  zip?: string
}

/** Grounded product recommendation. */
export type ProductRecommendation = {
  product_id?: string
  product_name?: string
  shopify_handle?: string
  price_tier?: string
  reason?: string
  evidence_refs?: string[]
  [key: string]: unknown
}

/** Grounded affirmations payload returned by /api/recommendations/combined. */
export type GroundedAffirmations = {
  affirmations: AffirmationItem[]
  citations: string[]
  legacyStrings: string[]
}

export type AssessmentApiResult = {
  /** May be a plain string[] (legacy) or a GroundedAffirmations object (new API). */
  affirmations: string[] | GroundedAffirmations
  recommendations: RecommendedPerson[]
  /** Curated product names returned by FastAPI /product-recommendations.
   *  Paid tier only; always empty on free. */
  products: string[]
  /** Short LLM-generated preamble that accompanies the products list. */
  productsResponse: string
  errors: string[]
  /** Grounded clinician match (new API). */
  clinician?: ClinicianMatch
  /** Whether POI evaluation is recommended based on profile. */
  poi_flag?: boolean
  /** Grounded product recommendations (new API, replaces `products`). */
  groundedProducts?: ProductRecommendation[]
  /** Real providers from the menopause directory, matched to the user's
   *  state / ZIP. Rendered in the report's clinician section. */
  providers?: Provider[]
  /** State the providers were matched against (for the section heading). */
  providersState?: string
  /** Data source: "catalog" or "fastapi". */
  source?: string
}

/** Read `?tier=free|paid` from the URL, defaulting to paid. */
function readTierFromUrl(): AssessmentTier {
  if (typeof window === "undefined") return "paid"
  const params = new URLSearchParams(window.location.search)
  const raw = params.get("tier")
  return raw === "free" ? "free" : "paid"
}

/** True when the URL carries ?demo=1 — renders a pre-filled sample report. */
function isDemoFromUrl(): boolean {
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).get("demo") === "1"
}

/* Pre-filled demo persona + grounded report payload for ?demo=1 previews.
   Perimenopause profile with a realistic mix of priority / moderate / strong
   domains. raw 0=mild .. 10=severe → category score = (10 − avg) × 10. */
const DEMO = {
  firstName: "Maya",
  age: 47,
  rawBySlug: {
    "vasomotor-temperature":             7,  // ~Priority (hot flashes, night sweats)
    "sleep-architecture-cortisol":       7,  // ~Priority
    "cognitive-function-brain-health":   4,  // ~Moderate (brain fog)
    "mood-anxiety-emotional-health":     4,  // ~Moderate
    "metabolic-health-body-composition": 6,  // ~Priority
    "skin-hair-nails":                   2,  // ~Strong
    "musculoskeletal-bone-health":       4,  // ~Moderate
    "genitourinary-sexual-health":       6,  // ~Priority
    "cardiovascular-whole-body-energy":  2,  // ~Strong
    "lifestyle-gut-health-nutrition":    3,  // ~Strong
  } as Record<string, number>,
  apiResult: {
    affirmations: {
      affirmations: [
        { text: "My body is moving through a powerful transition, and I am listening with compassion.", focus_domain: "mood-anxiety-emotional-health", evidence_refs: ["empress-120-symptom-biomarker-framework-chunk-002"] },
        { text: "Restorative sleep is an act of physiological preservation — not a luxury I have to earn.", focus_domain: "sleep-architecture-cortisol", evidence_refs: ["empress-120-symptom-biomarker-framework-chunk-003"] },
        { text: "Every symptom I name today is information, not a verdict.", focus_domain: "vasomotor-temperature", evidence_refs: ["empress-120-symptom-biomarker-framework-chunk-001"] },
      ],
      citations: ["empress-120-symptom-biomarker-framework-chunk-001", "empress-120-symptom-biomarker-framework-chunk-002", "empress-120-symptom-biomarker-framework-chunk-003"],
      legacyStrings: [],
    },
    recommendations: [
      { name: "Menopause-Certified NAMS Practitioner", title: "Certified Menopause Practitioner (CMP)", reason: "For evidence-based hormone therapy evaluation and personalised symptom management." },
      { name: "Pelvic Floor Physical Therapist", title: "Women's Health PT", reason: "For genitourinary symptoms, bladder control, and intimate-health support." },
    ],
    products: [],
    productsResponse: "",
    errors: [],
    clinician: {
      specialty_id: "nams_certified_mp",
      label: "Menopause-Certified NAMS Practitioner",
      abbreviation: "CMP",
      reason: "Your vasomotor, sleep, and genitourinary scores point to a hormonal driver best evaluated by a NAMS-certified clinician for HRT suitability.",
      find_provider_url: "https://www.menopause.org/for-women/find-a-menopause-practitioner",
      evidence_refs: ["empress-120-symptom-biomarker-framework-chunk-006"],
    },
    poi_flag: false,
    source: "catalog",
    groundedProducts: [
      { product_name: "Magnesium Glycinate 400mg", shopify_handle: "magnesium-glycinate-400mg", reason: "Supports GABA-A activity for deeper sleep onset and reduced 2–4am waking.", evidence_refs: ["empress-120-symptom-biomarker-framework-chunk-014"] },
      { product_name: "Adaptogen Blend (Ashwagandha KSM-66 + Rhodiola)", shopify_handle: "adaptogen-blend-ashwagandha-rhodiola", reason: "Blunts the HPA-axis cortisol surge that amplifies hot flashes and night sweats.", evidence_refs: ["empress-120-symptom-biomarker-framework-chunk-002"] },
      { product_name: "Triple Lipid Restore 2:4:2", brand: "SkinCeuticals", reason: "Recommended for: dry, thinning skin, loss of elasticity.", empress_alts: ["Rosehip Seed Oil", "Moroccan Gold Oil", "Argan Oil"], thorne_alts: ["Vitamin D + K2 Liquid", "Advanced Bone Support"], source: "marsha-matrix", evidence_refs: [] },
    ],
    providersState: "California",
    providers: [
      { name: "Amy M. Stoddard, MD", qualification: "Doctor — MD", state: "California", address: "Los Angeles, CA", zip: "90024", phone: "(310) 794-7274", website: "https://www.uclahealth.org/medical-services/obgyn/menopause" },
      { name: "Mary Jane Minkin, MD", qualification: "OB/GYN — Menopause Specialist", state: "California", address: "San Francisco, CA", zip: "94115", phone: "(415) 600-1234", website: "https://www.menopause.org" },
    ],
  } as unknown as AssessmentApiResult,
}

/** Pull the auth token signup/login stashed in localStorage. */
function readAuthToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem("authToken")
  } catch {
    return null
  }
}

function AssessmentFlowInner({ tier }: { tier: AssessmentTier }) {
  const {
    markCompleted,
    responses,
    categories,
    user,
    stage,
    mhtActive,
    additionalNotes,
    currentMedications,
    setUser,
    setStage,
    setMhtActive,
    setResponse,
  } = useAssessment()

  const [step, setStep] = useState<Step>("entry")
  const [handoffLoading, setHandoffLoading] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("intake"),
  )
  const [handoffError, setHandoffError] = useState("")

  // The redesign intake was saved on the preview host. Once the same-email
  // member reaches this gated page, load it and go straight to the first
  // assessment questions rather than ask for their contact details again.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("intake")
    if (!token) return
    let cancelled = false
    fetch("/api/assessment/intake-handoff?token=" + encodeURIComponent(token), { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load your saved details.")
        const data = await response.json()
        if (!data?.ok || !data.intake) throw new Error("Could not load your saved details.")
        return data.intake
      })
      .then((intake) => {
        if (cancelled) return
        setUser({ firstName: intake.firstName, age: Number(intake.age), email: intake.email,
          usState: intake.usState, zip: intake.zip, phone: intake.phone || undefined })
        setStep("staging")
        params.delete("intake")
        window.history.replaceState(null, "", window.location.pathname + (params.toString() ? "?" + params.toString() : ""))
      })
      .catch(() => {
        if (!cancelled) setHandoffError("Your saved details could not be restored. Please enter them below to continue.")
      })
      .finally(() => { if (!cancelled) setHandoffLoading(false) })
    return () => { cancelled = true }
  }, [setUser])

  // ── DEMO MODE (?demo=1) ───────────────────────────────────────────────────
  // Renders a fully pre-filled sample report without taking the assessment,
  // so the report layout can be previewed at a shareable URL. Seeds a realistic
  // perimenopause persona + grounded apiResult, then jumps straight to the
  // report screen (skipping the loading fetch fan-out).
  useEffect(() => {
    if (!isDemoFromUrl()) return
    // Persona
    setUser({ firstName: DEMO.firstName, age: DEMO.age, stage: "perimenopause", mhtActive: false })
    setStage("perimenopause")
    setMhtActive(false)
    // Seed all 120 responses by category target (0=mild .. 10=severe; score=(10-avg)*10)
    for (const cat of categories) {
      const base = DEMO.rawBySlug[cat.slug] ?? 4
      cat.questions.forEach((q, i) => {
        // small deterministic ±1 jitter so radar/bars aren't perfectly flat
        const jitter = (q.id + i) % 3 === 0 ? 1 : (q.id % 2 === 0 ? -1 : 0)
        const v = Math.max(0, Math.min(10, base + jitter))
        setResponse(q.id, v)
      })
    }
    setApiResult(DEMO.apiResult)
    setStep("report")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // ── PRINT-RENDER MODE (window.__EMPRESS_PRINT_STATE__) ────────────────────
  // The server renders the finished report headlessly to attach the full PDF
  // to the results email (lib/report-pdf.js). It injects the member's saved
  // answers and recommendation payload; we seed them and jump to the report.
  useEffect(() => {
    const printState = readPrintState()
    if (!printState) return
    setUser({ ...printState.user, stage: printState.stage ?? undefined, mhtActive: printState.mhtActive })
    setStage(printState.stage)
    setMhtActive(printState.mhtActive)
    for (const [qid, value] of Object.entries(printState.responses)) {
      setResponse(Number(qid), value)
    }
    markCompleted(printState.completedAt)
    // Defaults first: the report reads these arrays unconditionally.
    setApiResult({
      affirmations: [],
      recommendations: [],
      products: [],
      productsResponse: "",
      errors: [],
      ...printState.apiResult,
    })
    setStep("report")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [currentCategoryId, setCurrentCategoryId] = useState(categories[0]?.id ?? 1)
  const [apiResult, setApiResult] = useState<AssessmentApiResult>({
    affirmations: [],
    recommendations: [],
    products: [],
    productsResponse: "",
    errors: [],
  })


  const firstCategoryId = categories[0]?.id ?? 1
  const lastCategoryId = categories[categories.length - 1]?.id ?? 1

  const handleBegin = useCallback(() => {
    setCurrentCategoryId(firstCategoryId)
    // Paid tier goes through the staging intake before the 120 items.
    // Free tier (currently disabled) skips it.
    if (tier === "paid") {
      setStep("staging")
    } else {
      setStep("questions")
    }
  }, [firstCategoryId, tier])

  const handleStagingContinue = useCallback(() => {
    setCurrentCategoryId(firstCategoryId)
    setStep("questions")
  }, [firstCategoryId])

  const handleStagingBack = useCallback(() => {
    setStep("entry")
  }, [])

  const handleBack = useCallback(() => {
    const idx = categories.findIndex((c) => c.id === currentCategoryId)
    if (idx > 0) {
      setCurrentCategoryId(categories[idx - 1].id)
    } else {
      // From Q1, paid tier returns to the staging intake; free skips back to entry.
      setStep(tier === "paid" ? "staging" : "entry")
    }
  }, [categories, currentCategoryId, tier])

  const handleNext = useCallback(() => {
    const idx = categories.findIndex((c) => c.id === currentCategoryId)
    const next = categories[idx + 1]
    if (next) setCurrentCategoryId(next.id)
  }, [categories, currentCategoryId])

  // Paid tier inserts a "notes" step between the last category and loading.
  // Free tier (currently disabled anyway) skips notes and goes straight to
  // the loading fan-out.
  const handleComplete = useCallback(() => {
    if (tier === "paid") {
      setStep("notes")
    } else {
      markCompleted()
      setStep("loading")
    }
  }, [tier, markCompleted])

  // Advance out of the notes step. The notes textareas live on
  // AssessmentProvider state and are picked up by the loading-step
  // fetch fan-out (chatbot endpoint).
  const handleNotesContinue = useCallback(() => {
    markCompleted()
    setStep("loading")
  }, [markCompleted])

  const handleNotesBack = useCallback(() => {
    // Send the user back into the last category so they can revise answers
    // before re-submitting via the notes screen.
    setCurrentCategoryId(lastCategoryId)
    setStep("questions")
  }, [lastCategoryId])

  // Scroll to the top whenever the user advances to a new category or moves
  // between assessment steps. Without this, the new page inherits the prior
  // scroll position and the user lands somewhere in the middle of the next
  // question set instead of at its heading.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [currentCategoryId, step])

  const handleRetake = useCallback(() => {
    setStep("entry")
    setCurrentCategoryId(firstCategoryId)
    setApiResult({
      affirmations: [],
      recommendations: [],
      products: [],
      productsResponse: "",
      errors: [],
      clinician: undefined,
      poi_flag: undefined,
      groundedProducts: undefined,
      source: undefined,
    })
  }, [firstCategoryId])

  /**
   * Mirror of the Join Us flow: once the user completes the assessment,
   * fetch personalized affirmations and combined doctor/therapist
   * recommendations. Fires for both free (C2/C3) and paid (B3/B4) tiers.
   * Errors are surfaced non-fatally so the report still renders.
   */
  useEffect(() => {
    if (step !== "loading") return

    let cancelled = false
    const token = readAuthToken()

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) headers.Authorization = `Bearer ${token}`

    const categoryScores = calculateCategoryScores(responses, categories)
    const overall = calculateOverallScore(responses, categories)
    const priorities = getPriorityAreas(responses, 3, categories)

    // A slider the member never touched stays at its default 0 ("no symptom")
    // and is not stored in `responses`. The recommendation endpoints reject a
    // submission with fewer than 60% of the 120 items present (422), which
    // silently dropped the affirmations, clinician match, providers and
    // products for anyone who left 49+ sliders at 0. Send every item.
    const completeResponses: Record<number, number> = {}
    for (const cat of categories) {
      for (const q of cat.questions) completeResponses[q.id] = responses[q.id] ?? 0
    }

    // Top 10 high-pain question IDs (descending response score). Drives the
    // MARSHA matrix product matcher on the server (lib/catalog.js →
    // getMatrixProductsByQuestions). Scores ≥6 only — answers below that
    // are not strong-enough signals to count as a priority symptom.
    const priorityQuestionIds = Object.entries(responses)
      .filter(([, score]) => typeof score === "number" && score >= 6)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([qid]) => Number(qid))
      .filter(Number.isFinite)

    // The server's /api/recommendations/* handlers read `req.body.profile`
    // first, then fall back to the session. Supplying a profile derived from
    // the assessment (priority symptoms, tier, overall score) means even users
    // with minimal session data still get personalised affirmations + recs
    // instead of a 503 fallback.
    const symptoms = priorities.map((p) => p.title).join(", ")
    const categoryNames = priorities.map((p) => p.slug)
    const profile = {
      user_id: undefined as string | undefined,
      name: user?.firstName ?? "",
      age: user?.age ?? null,
      email: user?.email ?? null,
      phone: user?.phone ?? null,
      // Location → drives doctor recommendations matched to the user's area.
      state: user?.usState ?? null,
      zip: user?.zip ?? null,
      symptoms,
      goals: tier === "free" ? "Understand my symptoms" : "Comprehensive symptom relief",
      mood: overall < 50 ? "struggling" : overall <= 65 ? "mixed" : "strong",
      preferences: "natural, clinical",
      affirmation_categories: categoryNames,
      category: categoryNames[0] ?? null,
      priorityCategorySlugs: categoryNames,
      priorityQuestionIds,
    }

    const payload = {
      source: "assessment",
      tier,
      user,
      overall,
      categoryScores,
      priorities,
      responses: completeResponses,
      profile,
      // Server reads these top-level too (server.js line 2734-2744 catalogProfile)
      state: user?.usState ?? null,
      zip: user?.zip ?? null,
      priorityCategorySlugs: categoryNames,
      priority_question_ids: priorityQuestionIds,
      priorityQuestionIds,
    }

    // Each enrichment call gets a hard cap. The score itself is computed
    // client-side, so a slow or overloaded upstream must never hold the
    // report hostage — past the cap we render without that section. The cap
    // is generous (the combined call can take 25s+ on a cold start) because
    // a timeout silently drops the affirmations, clinician match, providers
    // and products from both the report and the emailed PDF.
    const FETCH_TIMEOUT_MS = 45000
    const fetchWithTimeout = (url: string, init: RequestInit) => {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
      return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(timer))
    }

    async function fetchAll() {
      const errors: string[] = []
      let affirmations: string[] | GroundedAffirmations = []
      let recommendations: RecommendedPerson[] = []
      let products: string[] = []
      let productsResponse = ""
      let clinician: ClinicianMatch | undefined
      let poi_flag: boolean | undefined
      let groundedProducts: ProductRecommendation[] | undefined
      let providers: Provider[] | undefined
      let providersState: string | undefined
      let apiSource: string | undefined
      let combinedAffirmations: string[] | GroundedAffirmations | undefined

      // The calls below are independent, so they run in parallel — run
      // sequentially, slow LLM upstreams stacked into minutes of loading.

      // B3 / C2 — Affirmations
      const affirmationsTask = (async () => { try {
        const res = await fetchWithTimeout("/api/recommendations/affirmations/generate", {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const data = await res.json()
          const raw = data?.data?.affirmations ?? data?.affirmations ?? []
          if (Array.isArray(raw)) {
            affirmations = raw.filter((x): x is string => typeof x === "string")
          }
        } else {
          errors.push(`Affirmations: HTTP ${res.status}`)
        }
      } catch (e) {
        errors.push(`Affirmations: ${(e as Error).message}`)
      } })()

      // B4 / C3 — Combined doctor / clinician recommendations
      const combinedTask = (async () => { try {
        const res = await fetchWithTimeout("/api/recommendations/combined", {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const data = await res.json()
          const raw = data?.recommendations ?? data?.data?.recommendations ?? []
          if (Array.isArray(raw)) {
            recommendations = raw as RecommendedPerson[]
          }
          // Capture grounded fields from the new combined API shape.
          if (data?.clinician) clinician = data.clinician as ClinicianMatch
          if (data?.poi_flag === true) poi_flag = true
          if (data?.source) apiSource = data.source as string
          // Location-matched providers from the menopause directory.
          if (Array.isArray(data?.providers)) providers = data.providers as Provider[]
          if (typeof data?.providersState === "string") providersState = data.providersState
          if (Array.isArray(data?.groundedProducts)) {
            groundedProducts = data.groundedProducts as ProductRecommendation[]
          }
          // Grounded affirmations — used below when the dedicated
          // affirmations call came back empty.
          const fromCombined = data?.affirmations ?? data?.data?.affirmations
          if (
            fromCombined &&
            !Array.isArray(fromCombined) &&
            Array.isArray(fromCombined?.affirmations)
          ) {
            // New grounded shape: { affirmations, citations, legacyStrings }
            combinedAffirmations = fromCombined as GroundedAffirmations
          } else if (Array.isArray(fromCombined)) {
            combinedAffirmations = (fromCombined as unknown[]).filter(
              (x: unknown): x is string => typeof x === "string"
            )
          }
        } else {
          errors.push(`Recommendations: HTTP ${res.status}`)
        }
      } catch (e) {
        errors.push(`Recommendations: ${(e as Error).message}`)
      } })()

      // 07 — Recommended Products (paid tier only). Powered by FastAPI's
      // /product-recommendations RAG endpoint; proxied by the Node server at
      // /api/recommendations/products.
      const productsTask = (async () => { if (tier === "paid") {
        try {
          const res = await fetchWithTimeout("/api/recommendations/products", {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            const data = await res.json()
            const rawProducts = data?.products ?? data?.data?.products ?? []
            if (Array.isArray(rawProducts)) {
              products = rawProducts.filter(
                (x: unknown): x is string => typeof x === "string"
              )
            }
            const rawResponse = data?.response ?? data?.data?.response ?? ""
            if (typeof rawResponse === "string") {
              productsResponse = rawResponse
            }
          } else {
            errors.push(`Products: HTTP ${res.status}`)
          }
        } catch (e) {
          errors.push(`Products: ${(e as Error).message}`)
        }
      } })()

      // Chatbot notes — fire-and-forget POST that ships the free-text
      // captures from the post-questions notes screen to the chatbot
      // evaluation endpoint. Errors are non-blocking: the report still
      // renders even if the chatbot endpoint is down. We only send when
      // at least one of the textareas has content.
      const notesTask = (async () => { if (
        tier === "paid" &&
        (additionalNotes.trim() !== "" || currentMedications.trim() !== "")
      ) {
        try {
          const res = await fetchWithTimeout("/api/chatbot/assessment-notes", {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({
              source: "assessment",
              tier,
              user,
              stage,
              mhtActive,
              additionalNotes: additionalNotes.trim(),
              currentMedications: currentMedications.trim(),
              overall,
              categoryScores,
              priorities,
              responses,
            }),
          })
          if (!res.ok) {
            errors.push(`ChatbotNotes: HTTP ${res.status}`)
          }
        } catch (e) {
          errors.push(`ChatbotNotes: ${(e as Error).message}`)
        }
      } })()

      await Promise.all([affirmationsTask, combinedTask, productsTask, notesTask])

      if (
        combinedAffirmations &&
        Array.isArray(affirmations) &&
        (affirmations as string[]).length === 0
      ) {
        affirmations = combinedAffirmations
      }

      if (!cancelled) {
        setApiResult({
          affirmations,
          recommendations,
          products,
          productsResponse,
          errors,
          clinician,
          poi_flag,
          groundedProducts,
          providers,
          providersState,
          source: apiSource,
        })
        // NOTE: we no longer flip to the report here. The transition is gated
        // below on BOTH the fan-out finishing AND the 15-second minimum-load
        // timer, so the loading screen always shows for at least 15 seconds.
      }
    }

    // Keep the loading screen visible for a minimum of 15 seconds so the
    // affirmations + clinician-match + product fan-out feels considered and
    // completes even on fast networks. The report is revealed only once both
    // the fetch fan-out and this timer have resolved.
    const minLoad = new Promise<void>((resolve) => setTimeout(resolve, 15000))
    Promise.all([fetchAll(), minLoad])
      .then(() => {
        if (!cancelled) setStep("report")
      })
      .catch(() => {
        if (!cancelled) setStep("report")
      })

    return () => {
      cancelled = true
    }
  }, [
    step,
    categories,
    responses,
    tier,
    user,
    stage,
    mhtActive,
    additionalNotes,
    currentMedications,
  ])

  if (step === "entry") {
    if (handoffLoading) return <div role="status" style={{ padding: 40, textAlign: "center" }}>Loading your saved details…</div>
    return <AssessmentEntryScreen onBegin={handleBegin} initialError={handoffError} />
  }

  if (step === "staging") {
    return (
      <AssessmentStagingScreen
        onContinue={handleStagingContinue}
        onBack={handleStagingBack}
      />
    )
  }

  if (step === "questions") {
    return (
      <AssessmentCategoryScreen
        categoryId={currentCategoryId}
        onBack={handleBack}
        onNext={currentCategoryId < lastCategoryId ? handleNext : undefined}
        onComplete={currentCategoryId === lastCategoryId ? handleComplete : undefined}
      />
    )
  }

  if (step === "notes") {
    return (
      <AssessmentNotesScreen
        onBack={handleNotesBack}
        onContinue={handleNotesContinue}
      />
    )
  }

  if (step === "loading") {
    return <LoadingScreen tier={tier} />
  }

  return <AssessmentReportScreen onRetake={handleRetake} apiResult={apiResult} />
}

export function AssessmentFlow() {
  // Tier + category-set are read once on mount; switching tiers requires a page
  // reload (e.g. navigating from /assessment/?tier=free to /?tier=paid).
  const [tier] = useState<AssessmentTier>(() => readTierFromUrl())

  // Free tier (self-contained 10-question Mini Health Assessment) is
  // TEMPORARILY DISABLED. If a stale link still lands here with ?tier=free,
  // bounce the browser to the paid flow. The server already redirects this
  // case, but we keep the client-side fallback as a safety net.
  // To re-enable: restore the original `return <FreeMiniAssessment />` block.
  useEffect(() => {
    if (tier === "free" && typeof window !== "undefined") {
      window.location.replace("/assessment/?tier=paid")
    }
  }, [tier])
  if (tier === "free") {
    return null
  }

  const categories = assessmentCategories

  return (
    <AssessmentProvider categories={categories} tier={tier}>
      <AssessmentFlowInner tier={tier} />
    </AssessmentProvider>
  )
}

/* ───── Loading screen ───── */

const loadingBulletsPaid = [
  "Scoring vasomotor & hormonal markers",
  "Analysing sleep architecture patterns",
  "Mapping cognitive & mood biomarkers",
  "Calculating metabolic risk profile",
  "Generating personalised affirmations",
  "Matching clinician & therapist recommendations",
]

const loadingBulletsFree = [
  "Scoring your 30-question preview",
  "Identifying priority symptom areas",
  "Generating personalised affirmations",
  "Matching clinician & therapist recommendations",
]

function LoadingScreen({ tier }: { tier: AssessmentTier }) {
  const bullets = tier === "free" ? loadingBulletsFree : loadingBulletsPaid
  const subtitle =
    tier === "free"
      ? "Mapping 30 biomarker responses across 10 body systems."
      : "Mapping 120 biomarker responses across 10 body systems."
  return (
    <div style={s.root}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <AssessmentSiteNav variant="dark" />
      <div style={s.center}>
        <h1 style={s.loadTitle}>Building your Health Intelligence</h1>
        <p style={s.loadSub}>{subtitle}</p>
        <ul style={s.bullets}>
          {bullets.map((b) => (
            <li key={b} style={s.bullet}>• {b}</li>
          ))}
        </ul>
        <div style={s.spinner} />
      </div>
    </div>
  )
}

/* ───── Styles ───── */

// Aligned to site palette from index.html :root
const gold = "#D8A738"
const plum = "#3F144A"
const plumLight = "#472052"
const ivory = "#F3E5D3"

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    background: `linear-gradient(160deg, ${plum} 0%, ${plumLight} 100%)`,
    padding: 24,
    fontFamily: "'Inter', sans-serif",
    color: ivory,
  },
  center: {
    maxWidth: 560,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  loadTitle: {
    fontFamily: "'Poppins', system-ui, sans-serif",
    fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
    fontWeight: 700,
    margin: 0,
    color: ivory,
  },
  loadSub: {
    fontSize: "0.95rem",
    color: "rgba(248,246,242,0.7)",
    margin: 0,
  },
  bullets: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    textAlign: "left",
  },
  bullet: {
    fontSize: "0.9rem",
    color: "rgba(248,246,242,0.6)",
  },
  spinner: {
    marginTop: 16,
    width: 36,
    height: 36,
    border: `3px solid rgba(248,246,242,0.15)`,
    borderTopColor: gold,
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
  },
}
