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
  } = useAssessment()

  const [step, setStep] = useState<Step>("entry")
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
      symptoms,
      goals: tier === "free" ? "Understand my symptoms" : "Comprehensive symptom relief",
      mood: overall < 50 ? "struggling" : overall <= 65 ? "mixed" : "strong",
      preferences: "natural, clinical",
      affirmation_categories: categoryNames,
      category: categoryNames[0] ?? null,
    }

    const payload = {
      source: "assessment",
      tier,
      user,
      overall,
      categoryScores,
      priorities,
      responses,
      profile,
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
      let apiSource: string | undefined

      // B3 / C2 — Affirmations
      try {
        const res = await fetch("/api/recommendations/affirmations/generate", {
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
      }

      // B4 / C3 — Combined doctor / clinician recommendations
      try {
        const res = await fetch("/api/recommendations/combined", {
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
          if (Array.isArray(data?.groundedProducts)) {
            groundedProducts = data.groundedProducts as ProductRecommendation[]
          }
          // Grounded affirmations — prefer the structured payload when available.
          if (Array.isArray(affirmations) && (affirmations as string[]).length === 0) {
            const fromCombined = data?.affirmations ?? data?.data?.affirmations
            if (
              fromCombined &&
              !Array.isArray(fromCombined) &&
              Array.isArray(fromCombined?.affirmations)
            ) {
              // New grounded shape: { affirmations, citations, legacyStrings }
              affirmations = fromCombined as GroundedAffirmations
            } else if (Array.isArray(fromCombined)) {
              affirmations = (fromCombined as unknown[]).filter(
                (x: unknown): x is string => typeof x === "string"
              )
            }
          }
        } else {
          errors.push(`Recommendations: HTTP ${res.status}`)
        }
      } catch (e) {
        errors.push(`Recommendations: ${(e as Error).message}`)
      }

      // 07 — Recommended Products (paid tier only). Powered by FastAPI's
      // /product-recommendations RAG endpoint; proxied by the Node server at
      // /api/recommendations/products.
      if (tier === "paid") {
        try {
          const res = await fetch("/api/recommendations/products", {
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
      }

      // Chatbot notes — fire-and-forget POST that ships the free-text
      // captures from the post-questions notes screen to the chatbot
      // evaluation endpoint. Errors are non-blocking: the report still
      // renders even if the chatbot endpoint is down. We only send when
      // at least one of the textareas has content.
      if (
        tier === "paid" &&
        (additionalNotes.trim() !== "" || currentMedications.trim() !== "")
      ) {
        try {
          const res = await fetch("/api/chatbot/assessment-notes", {
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
    return <AssessmentEntryScreen onBegin={handleBegin} />
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
const plum = "#3f1449"
const plumLight = "#4b2577"
const ivory = "#fffaf1"

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
