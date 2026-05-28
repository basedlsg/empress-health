import { useMemo, useState } from "react"
import { useAssessment } from "./AssessmentProvider"
import { AssessmentSiteNav } from "./AssessmentSiteNav"
import {
  calculateCategoryScores,
  calculateOverallScore,
  getPriorityAreas,
  getStrengthAreas,
  getCategoryStatus,
  type CategoryScore,
  type CategoryStatus,
} from "./assessmentScoring"
import {
  runAssessment,
  STAGE_MAPPING,
  DOMAIN_CONFIG,
  MHT_SENSITIVE_DOMAINS,
} from "./hisEngine"
import { getNarrative, MHT_OVERLAY } from "./hisNarratives"
import type {
  AssessmentApiResult,
  RecommendedPerson,
  AffirmationItem,
  ClinicianMatch,
  ProductRecommendation,
  GroundedAffirmations,
} from "./AssessmentFlow"
import type {
  AssessmentCategory,
  AssessmentQuestion,
  HISResult,
  ResponseMap,
} from "./assessmentTypes"
import {
  InterludeHero,
  NumberedSectionHero,
  DoDontTable,
  SLEEP_HYGIENE_BODY,
  SLEEP_HYGIENE_ROWS,
  BRAIN_FOG_BODY,
  BRAIN_FOG_ROWS,
  ANTI_INFLAMMATION_INTRO,
  ANTI_INFLAMMATION_ROWS_NONVEG,
  ANTI_INFLAMMATION_ROWS_VEG,
  ANTI_INFLAMMATION_ROWS_GUT,
} from "./reportDesignSystem"

type Props = {
  onRetake: () => void
  apiResult: AssessmentApiResult
}

/* ───── Grounding metadata ─────
 * Static map of chunk_id → first ~85 chars of content. Built once from
 * pinecone_data/empress-120-symptom-biomarker-framework-records.enriched.json
 * so the Sources section can display a human-readable description per chunk
 * without a runtime fetch. */
const CHUNK_DESCRIPTIONS: Record<string, string> = {
  "empress-120-symptom-biomarker-framework-chunk-000": "EMPRESS HEALTH.AI  Symptom-Based Biomarker Framework — 120 Markers. Physical · Psych …",
  "empress-120-symptom-biomarker-framework-chunk-001": "worsens brain fog, metabolism, mood,  and cortisol rhythm the following day  — a comp …",
  "empress-120-symptom-biomarker-framework-chunk-002": "thermoneutral zone. When estrogen is  low AND cortisol is high, the triggers  become  …",
  "empress-120-symptom-biomarker-framework-chunk-003": "0=Fully rested · 1=Mostly rested ·  2=Somewhat tired · 3=Very tired ·  4=Exhausted —  …",
  "empress-120-symptom-biomarker-framework-chunk-004": "nap is non-negotiable, skip it and I  cannot function  New-onset nap dependency in mi …",
  "empress-120-symptom-biomarker-framework-chunk-005": "have been obvious to you before?  0=No more than before · 4=Multiple  times per day,  …",
  "empress-120-symptom-biomarker-framework-chunk-006": "Confidence  Decline  Has your confidence in your ability  to perform professionally d …",
  "empress-120-symptom-biomarker-framework-chunk-007": "— it is the emotional buffer between a  stimulus and a reaction. Estrogen  upregulate …",
  "empress-120-symptom-biomarker-framework-chunk-008": "(both hypo and hyper) is a non-  negotiable rule-out for panic. Score ≥2  = TSH + NP  …",
  "empress-120-symptom-biomarker-framework-chunk-009": "gain, bloating, and fatigue are not willpower failures — they are predictable  conseq …",
  "empress-120-symptom-biomarker-framework-chunk-010": "means the body actively defends its  new fat mass. Severe calorie  restriction raises …",
  "empress-120-symptom-biomarker-framework-chunk-011": "dramatically reduces oxygen-carrying  capacity. Post-exertional malaise  lasting >24  …",
  "empress-120-symptom-biomarker-framework-chunk-012": "the dermis overreact, and the  inflammatory threshold drops. This is  everything nowo …",
  "empress-120-symptom-biomarker-framework-chunk-013": "Slow Wound  Healing  Have you noticed that cuts,  scratches, or skin injuries take  s …",
  "empress-120-symptom-biomarker-framework-chunk-014": "accumulate overnight. Stiffness  lasting over 60 minutes warrants  rheumatological as …",
  "empress-120-symptom-biomarker-framework-chunk-015": "Headaches /  Migraines  Have you developed new  headaches or migraines, or found  exi …",
  "empress-120-symptom-biomarker-framework-chunk-016": "thickness, rugation, glycogen content  (which feeds protective Lactobacillus),  and n …",
  "empress-120-symptom-biomarker-framework-chunk-017": "Recurring UTIs in menopause are a  direct consequence of GSM: estrogen  loss depletes …",
  "empress-120-symptom-biomarker-framework-chunk-018": "#Symptom BiomarkerQuestion We AskClinical Mechanism — Why It Matters  93  Heart Palpi …",
  "empress-120-symptom-biomarker-framework-chunk-019": "Recovery capacity is a composite  marker of mitochondrial efficiency,  muscle glycoge …",
  "empress-120-symptom-biomarker-framework-chunk-020": "factors — they are clinical modulators with measurable effects on every biomarker  ab …",
  "empress-120-symptom-biomarker-framework-chunk-021": "0=Over 90 mins screen-free · 1=60–90  mins · 2=30–60 mins · 3=Under 30  mins · 4=Usin …",
  "empress-120-symptom-biomarker-framework-chunk-022": "Social Connection  Quality  How connected, supported, and  understood do you feel by  …",
  "empress-120-symptom-biomarker-framework-chunk-023": "Do you maintain consistent sleep  and wake times — within 30  minutes — even on weeke …",
  "empress-120-symptom-biomarker-framework-chunk-024": "advice — this is clinical architecture for AI-assisted NP-reviewed care  Medicine gas …",
}

/** Shorten a chunk ID to its last 12 chars for compact display. */
function shortChunk(id: string): string {
  return id.length > 12 ? id.slice(-12) : id
}

/** Adapter: normalise the polymorphic affirmations payload into a typed array. */
function normaliseAffirmations(
  raw: string[] | GroundedAffirmations | undefined,
): AffirmationItem[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((s) => ({ text: typeof s === "string" ? s : (s as AffirmationItem).text }))
  }
  if (Array.isArray(raw.affirmations)) return raw.affirmations
  if (Array.isArray(raw.legacyStrings)) return raw.legacyStrings.map((text) => ({ text }))
  return []
}

/* ───── Helpers ───── */

function formatCompletedDate(iso?: string): string | null {
  if (!iso) return null
  const d = new Date(iso)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

function statusColor(status: CategoryStatus): string {
  if (status === "Priority") return "#C0392B"
  if (status === "Moderate") return "#D4A017"
  return "#27AE60"
}

/**
 * Paid-report display label for a CategoryStatus.
 *
 * 2026-05-16 relabel: the paid report surface presents the status bands
 * in symptom-severity language rather than wellness language. The
 * underlying CategoryStatus type ("Priority" | "Moderate" | "Strong")
 * is preserved so the scoring engine, free-tier code paths, and
 * freeReportGenerator.js continue to compile and behave unchanged.
 *   Priority → Severe   (low score / high symptom burden)
 *   Strong   → Mild     (high score / low symptom burden)
 *   Moderate → Moderate (unchanged)
 */
function statusDisplayLabel(status: CategoryStatus): string {
  if (status === "Priority") return "Severe"
  if (status === "Strong") return "Mild"
  return "Moderate"
}

/**
 * Map the HIS composite band (5 levels) onto the legacy CategoryStatus
 * (3 levels) used by the existing UI components. The HIS color hex is
 * preserved separately on the hero — this mapping just keeps the
 * radar / breakdown / status pills working.
 */
function hisBandToCategoryStatus(
  band: HISResult["hisBand"],
): CategoryStatus {
  switch (band) {
    case "Thriving":
    case "Flourishing":
      return "Strong"
    case "Managing":
      return "Moderate"
    case "Struggling":
    case "Critical":
    case "Incomplete":
    default:
      return "Priority"
  }
}

/** Human-readable stage label for inline rendering ("Perimenopause", etc). */
function stageLabel(stage: HISResult["stage"] | null): string | null {
  if (!stage) return null
  if (stage === "perimenopause") return "Perimenopause"
  if (stage === "menopause") return "Menopause"
  if (stage === "post_menopause") return "Menopause and Longevity"
  return null
}

/* Category-level clinical commentary shown on the paid report. Content is
 * based on standard peri+ menopause literature (NAMS position statements,
 * IMS guidance). Keep each field concise — these render inside compact
 * cards in the deep-dive sections. */
type CategoryCommentary = {
  mechanism: string   // 2–3 sentence clinical mechanism / why scores behave this way
  lifestyle: string   // one actionable lifestyle lever
  clinical: string    // one conversation starter for the clinician
}

const CATEGORY_COMMENTARY: Record<string, CategoryCommentary> = {
  "vasomotor-temperature": {
    mechanism:
      "Hot flashes and night sweats are driven by estradiol decline destabilising hypothalamic thermoregulation. They are the most-studied menopausal symptom, affecting 60–80% of perimenopausal women, and respond well to hormone therapy, SSRIs/SNRIs, and lifestyle modification.",
    lifestyle:
      "Keep a cool bedroom (65–67°F), wear moisture-wicking layered sleepwear, and track triggers like alcohol, caffeine, and spicy food for two weeks.",
    clinical:
      "Ask: Am I a candidate for systemic hormone therapy? If not, is a non-hormonal option like fezolinetant, paroxetine, or gabapentin appropriate for my symptom burden?",
  },
  "sleep-architecture-cortisol": {
    mechanism:
      "Declining progesterone (a GABA agonist) and elevated cortisol reactivity combine to fragment sleep, particularly in the 2–4am window. Loss of slow-wave sleep compounds brain fog, metabolic dysregulation, and mood, making sleep the single highest-leverage symptom to address.",
    lifestyle:
      "Fixed wake time every day, morning daylight exposure within 30 minutes of rising, and a carb-forward dinner to support evening serotonin.",
    clinical:
      "Ask for a sleep-focused workup: morning and evening cortisol, ferritin, B12, and screening for sleep apnea — prevalence rises sharply after menopause.",
  },
  "cognitive-function-brain-health": {
    mechanism:
      "Estradiol supports cerebral blood flow, synaptic plasticity, and neuronal glucose metabolism. Declines here produce the 'brain fog' that women most fear — word-finding gaps, working-memory dips, and executive fatigue. The majority of these changes are reversible with hormonal stabilisation.",
    lifestyle:
      "Protect sleep first; layer in 150 minutes/week of zone-2 cardio plus twice-weekly resistance training. Creatine monohydrate 3–5g/day has emerging evidence for cognitive support in menopause.",
    clinical:
      "Ask: Does my cognitive profile warrant an estradiol trial? Can we rule out thyroid (TSH + free T4), B12, and iron deficiency as modifiable contributors?",
  },
  "mood-anxiety-emotional-health": {
    mechanism:
      "Estradiol and progesterone modulate serotonin, GABA, and HPA-axis reactivity. Perimenopausal mood shifts are biochemical, not characterological. Women with a history of PMS, PMDD, postpartum depression, or prior major depression are at highest risk.",
    lifestyle:
      "Regular protein-forward meals stabilise blood glucose and reduce irritability; daily omega-3 (EPA ≥1g) and morning sunlight both have RCT support for peri-mood.",
    clinical:
      "Ask: Would estradiol alone, or combined with a short SSRI trial, be appropriate? Screen for PMDD-spectrum patterns even if cycles are irregular.",
  },
  "metabolic-health-body-composition": {
    mechanism:
      "Falling estradiol accelerates visceral fat deposition, insulin resistance, and loss of lean mass. The midsection shift is predictable, measurable, and highly responsive to resistance training + protein-forward nutrition (1.6–2.2g/kg/day).",
    lifestyle:
      "Prioritise progressive resistance training 3x/week over cardio. Anchor every meal with 30–40g of protein. Limit continuous snacking to let insulin fall between meals.",
    clinical:
      "Ask for fasting insulin + glucose (HOMA-IR), ApoB, HbA1c, and a DEXA body-composition scan. These numbers change earlier than weight does and are more actionable.",
  },
  "skin-hair-nails": {
    mechanism:
      "Collagen loss of ~30% in the first five postmenopausal years is tied to dropping estradiol. Skin thins, wound healing slows, hair thins from the crown, and nail brittleness emerges. Topical retinoids, peptides, hydrolysed collagen, and systemic HRT all have evidence bases.",
    lifestyle:
      "Daily topical retinoid + SPF 30+, 10–20g hydrolysed collagen peptides with vitamin C, and silk or satin pillowcase to reduce hair friction.",
    clinical:
      "Ask: Are my hair changes nutritional (ferritin, vitamin D, zinc) or hormonal? A dermatology consult with trichoscopy is appropriate if crown thinning is visible.",
  },
  "musculoskeletal-bone-health": {
    mechanism:
      "Peri-menopause is when bone density loss accelerates — up to 2% per year in early menopause. Joint inflammation rises with oestrogen decline, producing the classic 'menopausal arthralgia'. Weight-bearing exercise, adequate protein, vitamin D, and DEXA screening are protective.",
    lifestyle:
      "Impact and resistance training (not just walking) drive bone adaptation. Calcium 1000–1200mg/day (food first), vitamin D3 2000 IU, and magnesium glycinate 300–400mg/day at night.",
    clinical:
      "Ask for a baseline DEXA scan at menopause onset if not already done, vitamin D 25-OH level, and discuss whether your fracture-risk profile warrants early intervention.",
  },
  "genitourinary-sexual-health": {
    mechanism:
      "Genitourinary syndrome of menopause (GSM) is progressive and chronically under-treated. Vaginal atrophy, urinary urgency, recurrent UTIs, and painful intimacy are highly treatable with local estrogen — which has an excellent safety profile — plus hyaluronic-acid-based moisturisers.",
    lifestyle:
      "Daily non-hormonal vaginal moisturiser; silicone-based lubricant for intimacy; pelvic-floor strengthening for urinary urgency and sexual sensation.",
    clinical:
      "Ask explicitly about low-dose vaginal estrogen (cream, ring, or tablet). It is systemic-exposure-minimal and appropriate for most women, including many breast cancer survivors after oncologist review.",
  },
  "cardiovascular-whole-body-energy": {
    mechanism:
      "Estrogen is cardioprotective. After menopause LDL rises, HDL falls, and vascular elasticity drops. Cardiovascular disease becomes the leading cause of death in women. Screening lipids, tracking blood pressure, and considering the 'timing window' for HRT (before age 60 or within 10 years of menopause) are key.",
    lifestyle:
      "Zone-2 cardio 150 min/week plus two resistance sessions, DASH- or Mediterranean-pattern eating, and home BP monitoring 2–3x/week if you have any family history.",
    clinical:
      "Ask for ApoB, Lp(a) (once in a lifetime), fasting lipid panel, and a coronary calcium score if you have risk factors. Discuss the HRT timing hypothesis.",
  },
  "lifestyle-gut-health-nutrition": {
    mechanism:
      "The gut microbiome shifts in menopause; lower diversity correlates with worse vasomotor and metabolic symptoms. Estrogen metabolism partly occurs via the estrobolome (specific gut bacteria). Fiber diversity, polyphenols, and fermented foods have evidence for both mood and hormone support.",
    lifestyle:
      "Target 30+ different plant foods per week, a daily fermented food (kefir, kimchi, sauerkraut, yogurt), and 25–35g of fiber across a mix of soluble and insoluble sources.",
    clinical:
      "Ask about GI symptoms explicitly — bloating, reflux, and bowel changes are often dismissed as 'menopausal' when they have specific workups. Consider a basic comprehensive stool panel if chronic.",
  },
}

function getCommentary(slug: string): CategoryCommentary {
  return (
    CATEGORY_COMMENTARY[slug] ?? {
      mechanism:
        "This body system is influenced by the hormonal fluctuations of peri+ menopause. Your responses reveal the specific pattern of disruption to discuss with a menopause-informed clinician.",
      lifestyle:
        "Track your symptoms for two weeks to identify your top two triggers before changing protocol.",
      clinical:
        "Bring this section of your report to your next appointment as a starting point for the conversation.",
    }
  )
}

/* Given a category and the user's responses, return the lowest- or highest-
 * scoring questions that drove the category score. Slider values are 0–10. */
function getContributingQuestions(
  category: AssessmentCategory | undefined,
  responses: ResponseMap,
  direction: "low" | "high",
  limit = 4
): Array<{ q: AssessmentQuestion; value: number }> {
  if (!category) return []
  const rows = category.questions.map((q) => ({
    q,
    value: Number(responses[q.id] ?? 0),
  }))
  rows.sort((a, b) =>
    direction === "low" ? a.value - b.value : b.value - a.value
  )
  return rows.slice(0, limit)
}

/* ───── Stage descriptions map (fix #43) ───── */

const STAGE_DESCRIPTIONS: Record<string, { title: string; body: string }> = {
  perimenopause: {
    title: "Perimenopause — Active Transition Phase",
    body: "Your responses indicate you are in an active perimenopause transition. Hormonal fluctuations across estradiol, progesterone, and FSH are driving symptoms across multiple body systems. The scores below reflect how each domain is responding to this shift.",
  },
  menopause: {
    title: "Menopause — Stabilizing Phase",
    body: "Your responses indicate you are in the menopause stabilization phase. Estrogen and progesterone levels are at their lowest sustained point, and many symptoms peak then begin to level out. The scores below reflect how each domain is adapting to your new hormonal baseline.",
  },
  postmenopause: {
    title: "Post-Menopause — Long-Term Wellness Phase",
    body: "Your responses indicate you are in the post-menopause phase. Hormone levels have stabilized at their lower baseline, and focus shifts to long-term cardiovascular, bone, and cognitive health. The scores below reflect your current wellness across each domain.",
  },
  post_menopause: {
    title: "Post-Menopause — Long-Term Wellness Phase",
    body: "Your responses indicate you are in the post-menopause phase. Hormone levels have stabilized at their lower baseline, and focus shifts to long-term cardiovascular, bone, and cognitive health. The scores below reflect your current wellness across each domain.",
  },
  premenopause: {
    title: "Pre-Menopause — Early Signals",
    body: "Your responses indicate you are in the pre-menopause phase. Cycles remain regular but early hormonal shifts may be producing subtle signals across sleep, mood, and energy. The scores below reflect how each domain is responding to these early changes.",
  },
}

function StageOverviewCard({ stage }: { stage: string | null | undefined }) {
  const key = (stage ?? "perimenopause").toLowerCase().replace(/[\s-]/g, "")
  const info = STAGE_DESCRIPTIONS[key] ?? STAGE_DESCRIPTIONS.perimenopause
  return (
    <div style={s.stageCard}>
      <h3 style={s.stageTitle}>{info.title}</h3>
      <p style={s.stageText}>{info.body}</p>
    </div>
  )
}

/* ───── Component ───── */

export function AssessmentReportScreen({ onRetake, apiResult }: Props) {
  const {
    user,
    responses,
    completedAt,
    resetAssessment,
    categories,
    tier,
    stage,
    mhtActive,
  } = useAssessment()

  const isFree = tier === "free"

  // HIS computation runs on the paid tier whenever a stage has been
  // captured by the staging intake. If the user landed on the report
  // without going through staging (legacy bookmark / dev shortcut) we
  // fall back to the legacy simple math so the page still renders.
  //
  // 2026-05-16 slider re-flip boundary:
  //   The slider now stores 0 = most mild, 10 = most severe. The HIS
  //   engine (and its Python parity reference) was last calibrated on
  //   2026-05-15 to consume the OPPOSITE convention (0 = severe,
  //   10 = no symptom — wellness-aligned). Rather than re-derive the
  //   engine and break parity, we invert each response at this single
  //   boundary: engineRaw = 10 − storedRaw. The engine's internal
  //   `reverseScore()` identity, its CLINICAL_FLAGS `<= threshold`
  //   comparisons, and the Python reference all stay untouched.
  const hisResult: HISResult | null = useMemo(() => {
    if (isFree || stage === null) return null
    // Map our stage string back to the engine's 1/2/3 input. Lookup is
    // the inverse of STAGE_MAPPING in hisEngine.ts.
    const stagingResponse: 1 | 2 | 3 = (() => {
      for (const [key, value] of Object.entries(STAGE_MAPPING)) {
        if (value === stage) return Number(key) as 1 | 2 | 3
      }
      return 2
    })()
    // Flip each response into the engine's wellness-aligned convention.
    // Missing/undefined values stay missing — they get null-handled inside
    // the engine's missing-data protocol.
    const engineResponses: Record<number, number | null> = {}
    for (const [qStr, v] of Object.entries(responses)) {
      const q = Number(qStr)
      if (v === null || v === undefined) {
        engineResponses[q] = null
      } else {
        engineResponses[q] = 10 - (v as number)
      }
    }
    try {
      return runAssessment({
        responses: engineResponses,
        stagingResponse,
        mhtActive,
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[HIS] runAssessment failed, falling back to legacy scoring", e)
      return null
    }
  }, [isFree, stage, mhtActive, responses])

  // Legacy scores power the radar, breakdown cards, and the API payload's
  // priorities/strengths. We keep these for backward compatibility with the
  // recommendations endpoints; the visible composite is replaced by HIS
  // when available.
  const legacyOverall = useMemo(
    () => calculateOverallScore(responses, categories),
    [responses, categories]
  )
  const categoryScores = useMemo(
    () => calculateCategoryScores(responses, categories),
    [responses, categories]
  )
  const priorities = useMemo(() => {
    // Bug C fix: deduplicate by categoryId in case the scoring engine
    // returns the same domain more than once (off-by-one / stale render).
    const seen = new Set<number>()
    return getPriorityAreas(responses, 3, categories).filter((cs) => {
      if (seen.has(cs.categoryId)) return false
      seen.add(cs.categoryId)
      return true
    })
  }, [responses, categories])
  const strengths = useMemo(() => {
    // Bug B fix: use top-3 highest-scoring domains (was limit 2).
    // Deduplicate defensively like priorities above.
    const seen = new Set<number>()
    return getStrengthAreas(responses, 3, categories).filter((cs) => {
      if (seen.has(cs.categoryId)) return false
      seen.add(cs.categoryId)
      return true
    })
  }, [responses, categories])

  // Visible composite: prefer HIS when computed, otherwise legacy.
  const overall = hisResult?.his ?? legacyOverall
  const overallStatus: CategoryStatus = hisResult
    ? hisBandToCategoryStatus(hisResult.hisBand)
    : getCategoryStatus(overall)
  const overallBandLabel = hisResult ? hisResult.hisBand : null
  const overallBandColor = hisResult ? hisResult.hisColor : null
  const completedLabel = formatCompletedDate(completedAt)
  const totalCategories = categoryScores.length

  const findCategory = (id: number): AssessmentCategory | undefined =>
    categories.find((c) => c.id === id)

  const handleRetake = () => {
    resetAssessment()
    onRetake()
  }

  // Shared context for the per-section feedback boxes (F7).
  const feedbackCtx: FeedbackCtx = {
    firstName: user?.firstName ?? null,
    tier: isFree ? "free" : "paid",
    completedAt: completedAt ?? null,
  }

  return (
    <div style={s.page}>
      <style>{printCSS}</style>

      {/* ─── COVER (page 1) ───
       * Full-page centered cover that matches the team template:
       * crown logo → brand → title → name/age/date → big score →
       * HEALTH INTELLIGENCE SCORE label → status badge, all centered on a
       * full burgundy page. The on-screen site nav is hidden in print. */}
      <section style={s.cover} className="empress-cover">
        <div style={s.coverNav} className="empress-cover-nav">
          <AssessmentSiteNav variant="dark" />
        </div>
        <div style={s.coverInner}>
          <img
            src="/public/EmpressHealthlogo.png"
            alt="Empress Health.ai"
            style={s.coverLogo}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = "none"
            }}
          />
          <span style={s.coverBrand}>EMPRESS HEALTH.AI</span>
          <h1 style={s.coverTitle}>
            Your Peri + Menopause
            <br />
            Health Intelligence Report
          </h1>
          <p style={s.coverMeta}>
            {[
              user?.firstName ?? null,
              user?.age ? `Age ${user.age}` : null,
              completedLabel,
              isFree ? "Free Preview" : null,
            ]
              .filter(Boolean)
              .join("  ·  ")}
          </p>
          <div style={s.coverScoreBlock}>
            <span style={s.coverScoreNum}>{overall}</span>
            <span style={s.coverScoreLabel}>Health Intelligence Score</span>
            <span
              style={{
                ...s.coverBadge,
                background: overallBandColor ?? statusColor(overallStatus),
              }}
            >
              {overallBandLabel ?? overallStatus}
            </span>
            {hisResult && (
              <span style={s.coverStageMeta}>
                {stageLabel(hisResult.stage)}
                {hisResult.mhtActive ? " · MHT active" : ""}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ─── MHT BANNER (paid only, MHT active) ─── */}
      {!isFree && hisResult?.mhtFlag && (
        <section style={s.section}>
          <div style={s.mhtBanner}>
            <strong style={s.mhtBannerTitle}>MHT overlay in effect</strong>
            <p style={s.mhtBannerText}>
              You reported active hormone therapy. Your Vasomotor (Domain 1) and
              Genitourinary &amp; Sexual Health (Domain 8) scores reflect a
              treated state — the underlying biology may differ from what these
              numbers show. We've called this out in those deep-dive sections.
            </p>
          </div>
        </section>
      )}

      {/* ─── CLINICAL FLAGS (paid only, when any flag fired) ─── */}
      {!isFree && hisResult && (hisResult.itemFlags.length > 0 || hisResult.domainFlags.length > 0) && (
        <section style={s.section} className="empress-report-section">
          <h2 style={s.sectionHeading}>00 Clinical Flags</h2>
          <p style={s.sectionLede}>
            Items at or above their clinical threshold or domains in the
            severe-burden range. Surface these to your clinician at your next
            appointment — they fire independently of your overall HIS.
          </p>
          <ClinicalFlagsSection hisResult={hisResult} />
        </section>
      )}

      {/* ─── PAID-ONLY banner ─── */}
      {!isFree && (
        <section style={s.section}>
          <div style={s.reportPending} className="empress-report-pending">
            <strong style={s.reportPendingTitle}>
              Your Health Intelligence Report is ready.
            </strong>
            <p style={s.reportPendingText}>
              Scores, charts, deep-dives, affirmations, clinician matches, and
              product recommendations — all visible below. Click the button to
              save the full report as a PDF.
            </p>
            <div style={s.reportPendingActions}>
              <button
                type="button"
                onClick={() => window.print()}
                style={s.reportPendingBtn}
              >
                ↓ Download PDF
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─── BRAND HEADER ─── */}
      <div style={s.brandHeader} className="empress-brand-header">
        <img
          src="/public/EmpressHealthlogo.png"
          alt="Empress Health"
          style={s.brandHeaderLogo}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = "none"
          }}
        />
        <p style={s.brandHeaderTagline}>Smart Support for Every Stage of Menopause</p>
      </div>

      {/* ─── 01 OVERVIEW + RADAR ─── */}
      <section style={s.section} className="empress-report-section">
        <NumberedSectionHero
          number="01"
          title="Menopause Stage & Overview"
          slug="report1"
        />
        <StageOverviewCard stage={hisResult?.stage ?? stage} />

        {!isFree && (
          <div style={s.radarWrap}>
            <DomainWheel scores={categoryScores} />
          </div>
        )}

        <div style={s.catGrid}>
          {categoryScores.map((cs) => (
            <ScoreCard key={cs.categoryId} data={cs} />
          ))}
        </div>
      </section>

      {/* ─── 02 PER-CATEGORY BREAKDOWN (paid) or ALL DOMAIN SCORES (free) ─── */}
      {isFree ? (
        <section style={s.section} className="empress-report-section">
          <NumberedSectionHero
            number="02"
            title={`All ${totalCategories} Domain Scores`}
            slug="report2"
          />
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Domain</th>
                <th style={{ ...s.th, textAlign: "center" }}>HI Score</th>
                <th style={{ ...s.th, textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {categoryScores.map((cs) => (
                <tr key={cs.categoryId}>
                  <td style={s.td}>{cs.title}</td>
                  <td style={{ ...s.td, textAlign: "center", fontWeight: 700 }}>
                    {cs.score}
                  </td>
                  <td style={{ ...s.td, textAlign: "center" }}>
                    <span
                      style={{
                        ...s.inlineStatus,
                        color: statusColor(cs.status),
                      }}
                    >
                      {statusDisplayLabel(cs.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section style={s.section} className="empress-report-section">
          <NumberedSectionHero
            number="02"
            title={`All ${totalCategories} Domain Scores — Detailed Breakdown`}
            slug="report2"
          />
          <p style={s.sectionLede}>
            Each domain is scored 0–100 and compared against the Severe /
            Moderate / Mild bands. Brief clinical context is included for each.
          </p>
          <div style={s.breakdownList}>
            {categoryScores.map((cs) => (
              <CategoryBreakdown
                key={cs.categoryId}
                cs={cs}
                commentary={getCommentary(cs.slug)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── 03 TOP SEVERE AREAS — DEEP DIVE (paid) or short (free) ─── */}
      <section style={s.section} className="empress-report-section">
        <NumberedSectionHero
          number="03"
          title="Your Top Severe Areas"
          slug="report3"
        />

        {isFree ? (
          <div style={s.areaList}>
            {priorities.map((cs) => (
              <AreaRow key={cs.categoryId} data={cs} />
            ))}
          </div>
        ) : (
          <div style={s.deepDiveList}>
            {priorities.map((cs) => (
              <PriorityDeepDive
                key={cs.categoryId}
                cs={cs}
                category={findCategory(cs.categoryId)}
                responses={responses}
                commentary={getCommentary(cs.slug)}
                hisNarrative={
                  hisResult && hisResult.domainBands[cs.categoryId] !== "Excluded"
                    ? getNarrative(
                        cs.categoryId,
                        hisResult.stage,
                        hisResult.domainBands[cs.categoryId],
                      )
                    : null
                }
                mhtOverlay={
                  hisResult?.mhtFlag && MHT_SENSITIVE_DOMAINS.includes(cs.categoryId)
                    ? MHT_OVERLAY[cs.categoryId] ?? null
                    : null
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── 04 STRONGEST DOMAINS — DEEP DIVE (paid) or short (free) ─── */}
      <section style={s.section} className="empress-report-section">
        <NumberedSectionHero
          number="04"
          title="Your Strongest Domains"
          slug="report4"
        />

        {isFree ? (
          <div style={s.areaList}>
            {strengths.map((cs) => (
              <AreaRow key={cs.categoryId} data={cs} />
            ))}
          </div>
        ) : (
          <div style={s.deepDiveList}>
            {strengths.map((cs) => (
              <StrengthDeepDive
                key={cs.categoryId}
                cs={cs}
                category={findCategory(cs.categoryId)}
                responses={responses}
                commentary={getCommentary(cs.slug)}
                hisNarrative={
                  hisResult && hisResult.domainBands[cs.categoryId] !== "Excluded"
                    ? getNarrative(
                        cs.categoryId,
                        hisResult.stage,
                        hisResult.domainBands[cs.categoryId],
                      )
                    : null
                }
                mhtOverlay={
                  hisResult?.mhtFlag && MHT_SENSITIVE_DOMAINS.includes(cs.categoryId)
                    ? MHT_OVERLAY[cs.categoryId] ?? null
                    : null
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* INTERLUDE PAGES (Sleep Hygiene, Brain Fog, Anti-inflammation Diet)
       * were moved to AFTER the "08 Next Steps" section — see the
       * EducationalInterludes() block below the Next Steps section. */}

      {/* ─── POI CALLOUT (paid only, when poi_flag is true) ─── */}
      {!isFree && apiResult.poi_flag === true && (
        <section style={s.section} className="empress-report-section">
          <div style={{
            background: "#FEF3C7",
            color: "#3F144A",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "8px",
          }}>
            <strong>Premature Ovarian Insufficiency (POI) Evaluation Recommended</strong>
            <p style={{ margin: "6px 0 0", fontSize: "0.9rem" }}>
              Your profile (age, stage, and vasomotor severity) suggests POI evaluation is warranted. A NAMS-certified practitioner or endocrinologist can confirm with an FSH/estradiol panel.
            </p>
          </div>
        </section>
      )}

      {/* ─── 05 AFFIRMATIONS ─── */}
      {/* Free tier shows only 1 to preview the experience and encourage upgrade. */}
      <AffirmationsSection
        affirmations={normaliseAffirmations(apiResult.affirmations)}
        limit={isFree ? 1 : undefined}
        feedbackCtx={feedbackCtx}
      />

      {/* ─── 06 CLINICIAN RECOMMENDATIONS ─── */}
      {/* Free tier shows only 1 to preview the experience and encourage upgrade. */}
      <RecommendationsSection
        recommendations={apiResult.recommendations}
        clinician={apiResult.clinician}
        limit={isFree ? 1 : undefined}
        feedbackCtx={feedbackCtx}
      />

      {/* ─── 07 RECOMMENDED PRODUCTS (paid only) ─── */}
      {!isFree && (
        <RecommendedProductsSection
          products={apiResult.products}
          groundedProducts={apiResult.groundedProducts}
          intro={apiResult.productsResponse}
          feedbackCtx={feedbackCtx}
        />
      )}

      {/* Non-fatal API errors: only surface when BOTH affirmations and recs are empty. */}
      {apiResult.errors.length > 0 &&
        normaliseAffirmations(apiResult.affirmations).length === 0 &&
        apiResult.recommendations.length === 0 && (
          <section style={s.section}>
            <p style={s.errorNote}>
              Your personalised affirmations and clinician matches will arrive in your inbox shortly.
            </p>
          </section>
        )}

      {/* ─── DOWNLOAD .DOCX (free tier only — 5-page personable report) ─── */}
      {isFree && (
        <DownloadFreeReportCard
          payload={{
            user,
            overall,
            categoryScores,
            priorities,
            strengths,
            affirmations: normaliseAffirmations(apiResult.affirmations).map((a) => a.text),
            recommendations: apiResult.recommendations,
            completedAt,
          }}
        />
      )}

      {/* ─── REFER A FRIEND (free tier only) ─── */}
      {isFree && (
        <ReferAFriendCard referrerFirstName={user?.firstName ?? null} tier="free" />
      )}

      {/* PRICING BLOCK REMOVED — readers of the paid report have already
       * purchased ($129/yr or $12/mo). Surfacing pricing inside their
       * report adds zero value and feels like a re-pitch. Paywall lives
       * upstream at /pricing instead, before the 120-Q assessment. */}

      {/* ─── 08 ACTIONS / UPGRADE ─── */}
      <section style={s.section} className="empress-report-section">
        {isFree ? (
          <h2 style={s.sectionHeading}>05 Unlock the Full Assessment</h2>
        ) : (
          <>
            <NumberedSectionHero
              number="08"
              title="Next Steps"
              slug="report8"
            />
            {/* Progress visual — full-width image directly after the report8
             * hero banner. Hides itself if the asset is missing. */}
            <img
              src="/report-heroes/eprogress.png"
              alt="Your progress over the next 90 days"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = "none"
              }}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: 18,
                margin: "0 0 24px",
              }}
            />
          </>
        )}

        {isFree ? (
          <div style={s.upgradeCard}>
            <h3 style={s.upgradeTitle}>
              Ready for the complete 120-question clinical assessment?
            </h3>
            <p style={s.upgradeText}>
              The free preview gives you a snapshot. The full assessment scores
              every body system in depth and unlocks your downloadable 20-page
              Health Intelligence Report.
            </p>
            <a href="/assessment/?tier=paid" style={s.upgradeBtn}>
              Begin Full Assessment →
            </a>
          </div>
        ) : (
          <div style={s.nextSteps}>
            <div style={s.stepCard}>
              <span style={s.stepNum}>1</span>
              <div style={s.stepBody}>
                <p style={s.stepText}>
                  Bring this report to a menopause-informed clinician and walk
                  through your top three priority sections first.
                </p>
                <a href="/expertguidance" style={s.stepLink}>
                  Explore Expert Guidance →
                </a>
              </div>
            </div>
            <div style={s.stepCard}>
              <span style={s.stepNum}>2</span>
              <div style={s.stepBody}>
                <p style={s.stepText}>
                  Re-take the assessment in 90 days to see how your scores move
                  after lifestyle or clinical interventions.
                </p>
                <a href="/membershipoptions" style={s.stepLink}>
                  Manage your membership →
                </a>
              </div>
            </div>
            <div style={s.stepCard}>
              <span style={s.stepNum}>3</span>
              <div style={s.stepBody}>
                <p style={s.stepText}>
                  Layer in the recommended products and supplements from Section
                  07 once your clinical plan is in place.
                </p>
                <a href="/symptomsupport" style={s.stepLink}>
                  Symptom support resources →
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── EDUCATIONAL INTERLUDES (paid only) — AFTER Next Steps ───
       * Moved here per the team template: Sleep Hygiene + Brain Fog follow
       * the Next Steps page, then the Anti-inflammation Diet for Peri +
       * Menopause closes the educational run. They still fire conditionally
       * on the user's priority domains; each degrades gracefully if its
       * /public/report-heroes/<slug> photo is missing. */}
      {!isFree && priorities.some((p) => p.slug === "sleep-architecture-cortisol") && (
        <>
          <InterludeHero
            title="Sleep Hygiene"
            slug="esleep"
            attribution="Empress Health.ai Clinical Team"
            body={SLEEP_HYGIENE_BODY.split("\n\n").map((para, i) => (
              <p key={i} style={{ margin: i === 0 ? "0 0 14px" : "0 0 14px" }}>
                {para}
              </p>
            ))}
          />
          <section
            className="empress-report-section"
            style={{ maxWidth: 860, margin: "0 auto", padding: "20px 24px 0" }}
          >
            <DoDontTable rows={SLEEP_HYGIENE_ROWS} />
          </section>
        </>
      )}

      {!isFree && priorities.some((p) => p.slug === "cognitive-function-brain-health") && (
        <>
          <InterludeHero
            title="Brain Fog"
            slug="ebrainfog"
            attribution="Empress Health.ai Clinical Team"
            body={BRAIN_FOG_BODY.split("\n\n").map((para, i) => (
              <p key={i} style={{ margin: "0 0 14px" }}>
                {para}
              </p>
            ))}
          />
          <section
            className="empress-report-section"
            style={{ maxWidth: 860, margin: "0 auto", padding: "20px 24px 0" }}
          >
            <DoDontTable rows={BRAIN_FOG_ROWS} />
          </section>
        </>
      )}

      {!isFree && priorities.some(
        (p) =>
          p.slug === "metabolic-health-body-composition" ||
          p.slug === "lifestyle-gut-health-nutrition",
      ) && (
        <>
          <InterludeHero
            title="Anti-inflammation Diet for Peri + Menopause"
            slug="ediet"
            attribution="Empress Health.ai Clinical Team"
            body={
              <p style={{ margin: 0 }}>{ANTI_INFLAMMATION_INTRO}</p>
            }
          />
          <section
            className="empress-report-section"
            style={{ maxWidth: 860, margin: "0 auto", padding: "20px 24px 0" }}
          >
            <h3
              style={{
                fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: plum,
                margin: "0 0 14px",
              }}
            >
              Non-Vegetarian
            </h3>
            <DoDontTable rows={ANTI_INFLAMMATION_ROWS_NONVEG} />
            <h3
              style={{
                fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: plum,
                margin: "32px 0 14px",
              }}
            >
              Vegetarian
            </h3>
            <DoDontTable rows={ANTI_INFLAMMATION_ROWS_VEG} />
            <h3
              style={{
                fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: plum,
                margin: "32px 0 14px",
              }}
            >
              Gut Health, Fermented Foods & Supplements
            </h3>
            <DoDontTable rows={ANTI_INFLAMMATION_ROWS_GUT} />
          </section>
        </>
      )}

      {/* ─── CONSOLIDATED FEEDBACK (Bug J fix: replaces 7 per-section boxes) ─── */}
      <ConsolidatedFeedbackSection feedbackCtx={feedbackCtx} />

      {/* ─── CITATION SOURCES INDEX (paid only) ─── */}
      {!isFree && (
        <CitationSourcesSection apiResult={apiResult} />
      )}

      {/* ─── DEBUG GROUNDING BADGE (localhost or ?debug=1 only) ─── */}
      <GroundingDebugBadge apiResult={apiResult} />

      {/* ─── THANK YOU (paid only) — final page ─── */}
      {!isFree && <ThankYouPage firstName={user?.firstName ?? null} />}

      {/* ─── ACTIONS ─── */}
      <section style={s.ctaSection} className="empress-report-cta">
        <div style={s.ctaRow}>
          {!isFree && (
            <button type="button" onClick={() => window.print()} style={s.printBtn}>
              ↓ Print / Save as PDF
            </button>
          )}
          <button type="button" onClick={handleRetake} style={s.retakeBtn}>
            ← Retake Assessment
          </button>
        </div>
        {!isFree && (
          <div style={s.printHint}>
            <strong style={s.printHintTitle}>How to save this report as a PDF</strong>
            <ol style={s.printHintList}>
              <li>Click <em>Print / Save as PDF</em> above (or press <kbd style={s.kbd}>Ctrl</kbd>+<kbd style={s.kbd}>P</kbd> on Windows, <kbd style={s.kbd}>⌘</kbd>+<kbd style={s.kbd}>P</kbd> on Mac).</li>
              <li>In the print dialog, set <strong>Destination</strong> to <strong>Save as PDF</strong>.</li>
              <li>Open <strong>More settings</strong> and turn on <strong>Background graphics</strong> — otherwise the radar chart and score bars will print blank.</li>
              <li>Paper size <strong>Letter</strong>, margins <strong>Default</strong>, then click <strong>Save</strong>.</li>
            </ol>
            <p style={s.printHintNote}>
              Chrome and Edge give the cleanest output. Safari also works. If the PDF looks empty, it's almost always the <em>Background graphics</em> checkbox.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

/* ───── Sub-components ───── */

/**
 * Renders a stage-and-band specific HIS narrative paragraph. The Python
 * reference templates contain "\n\n" paragraph breaks; we split on those
 * and emit a <p> per paragraph so the layout breathes.
 */
function HISNarrativeBlock({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0)
  return (
    <div style={s.hisNarrative}>
      {paragraphs.map((p, i) => (
        <p key={i} style={s.hisNarrativeP}>
          {p}
        </p>
      ))}
    </div>
  )
}

/**
 * Renders item-level (URGENT / RECOMMENDED) and domain-level clinical flags
 * from the HIS engine. Priority: URGENT first, then RECOMMENDED, then
 * domain-level. Matches the priority order in detectItemFlags().
 */
function ClinicalFlagsSection({ hisResult }: { hisResult: HISResult }) {
  const urgent = hisResult.itemFlags.filter((f) => f.priority === "URGENT")
  const recommended = hisResult.itemFlags.filter((f) => f.priority === "RECOMMENDED")
  const domainFlags = hisResult.domainFlags

  return (
    <div style={s.flagsList}>
      {urgent.length > 0 && (
        <div style={s.flagGroupUrgent}>
          <h3 style={s.flagGroupTitleUrgent}>
            ⚠ Urgent — immediate action recommended
          </h3>
          {urgent.map((f) => (
            <div key={f.question} style={s.flagItem}>
              <div style={s.flagItemHead}>
                <span style={s.flagItemQ}>Q{f.question}</span>
                <span style={s.flagItemLabel}>{f.label}</span>
                {/* 2026-05-16 slider re-flip: f.rawScore is in the engine's
                    wellness-aligned convention (after the 10−v boundary
                    transform). Invert it back so the user sees the value
                    they actually picked on the slider. */}
                <span style={s.flagItemRaw}>Raw {10 - f.rawScore}/10</span>
              </div>
              <div style={s.flagItemDomain}>{f.domainName}</div>
              <p style={s.flagItemText}>{f.referralText}</p>
            </div>
          ))}
        </div>
      )}

      {recommended.length > 0 && (
        <div style={s.flagGroupRecommended}>
          <h3 style={s.flagGroupTitleRecommended}>
            • Recommended — clinical evaluation advised
          </h3>
          {recommended.map((f) => (
            <div key={f.question} style={s.flagItem}>
              <div style={s.flagItemHead}>
                <span style={s.flagItemQ}>Q{f.question}</span>
                <span style={s.flagItemLabel}>{f.label}</span>
                {/* 2026-05-16 slider re-flip — see urgent block above. */}
                <span style={s.flagItemRaw}>Raw {10 - f.rawScore}/10</span>
              </div>
              <div style={s.flagItemDomain}>{f.domainName}</div>
              <p style={s.flagItemText}>{f.referralText}</p>
            </div>
          ))}
        </div>
      )}

      {domainFlags.length > 0 && (
        <div style={s.flagGroupDomain}>
          <h3 style={s.flagGroupTitleDomain}>
            • Domain-level — severe symptom burden across an entire body system
          </h3>
          {domainFlags.map((f) => (
            <div key={f.domainId} style={s.flagItem}>
              <div style={s.flagItemHead}>
                <span style={s.flagItemQ}>D{String(f.domainId).padStart(2, "0")}</span>
                <span style={s.flagItemLabel}>{f.domainName}</span>
                <span style={s.flagItemRaw}>DS {f.domainScore.toFixed(1)}/100</span>
              </div>
              <p style={s.flagItemText}>{f.message}</p>
            </div>
          ))}
        </div>
      )}

      {hisResult.compositeFlag && (
        <div style={s.flagComposite}>
          <strong style={s.flagCompositeTitle}>
            Composite HIS in Critical range
          </strong>
          <p style={s.flagCompositeText}>
            Your Health Intelligence Score indicates a high symptom burden
            across multiple body systems. We strongly recommend discussing
            these results with your doctor or a menopause specialist before
            making any new lifestyle or supplement changes on your own.
          </p>
        </div>
      )}
    </div>
  )
}

function ScoreCard({ data }: { data: CategoryScore }) {
  return (
    <div style={s.catCard}>
      <span style={{ ...s.catScore, color: statusColor(data.status) }}>
        {data.score}
      </span>
      <span style={s.catCardTitle}>{data.title}</span>
      <span
        style={{
          ...s.catCardStatus,
          color: statusColor(data.status),
        }}
      >
        {statusDisplayLabel(data.status)}
      </span>
    </div>
  )
}

function AreaRow({ data }: { data: CategoryScore }) {
  return (
    <div style={s.areaRow}>
      <span style={s.areaTitle}>{data.title}</span>
      <span style={s.areaScore}>{data.score}/100</span>
      <span
        style={{
          ...s.areaStatus,
          color: statusColor(data.status),
        }}
      >
        {statusDisplayLabel(data.status)}
      </span>
    </div>
  )
}

/* ───── Score bar with threshold bands ───── */

function ScoreBar({ score, status }: { score: number; status: CategoryStatus }) {
  const clamped = Math.max(0, Math.min(100, score))
  return (
    <div style={s.barWrap} aria-label={`Score ${clamped} of 100, ${statusDisplayLabel(status)}`}>
      <div style={s.barTrack}>
        {/* Band shading: 0-50 priority (red), 50-65 moderate (amber), 65-100 strong (green) */}
        <div style={{ ...s.barBand, left: "0%", width: "50%", background: "rgba(192,57,43,0.12)" }} />
        <div style={{ ...s.barBand, left: "50%", width: "15%", background: "rgba(212,160,23,0.15)" }} />
        <div style={{ ...s.barBand, left: "65%", width: "35%", background: "rgba(39,174,96,0.12)" }} />
        {/* Fill */}
        <div
          style={{
            ...s.barFill,
            width: `${clamped}%`,
            background: statusColor(status),
          }}
        />
        {/* Thresholds */}
        <div style={{ ...s.barTick, left: "50%" }} />
        <div style={{ ...s.barTick, left: "65%" }} />
      </div>
      <div style={s.barScale}>
        <span>0</span>
        <span>50</span>
        <span>65</span>
        <span>100</span>
      </div>
    </div>
  )
}

/* ───── Per-category breakdown (Section 02, paid) ───── */

function CategoryBreakdown({
  cs,
  commentary,
}: {
  cs: CategoryScore
  commentary: CategoryCommentary
}) {
  return (
    <article style={s.breakdownCard}>
      <header style={s.breakdownHeader}>
        <div>
          <h3 style={s.breakdownTitle}>{cs.title}</h3>
          <span style={{ ...s.inlineStatus, color: statusColor(cs.status) }}>
            {statusDisplayLabel(cs.status)}
          </span>
        </div>
        <div style={s.breakdownScore}>
          <span
            style={{
              ...s.breakdownScoreNum,
              color: statusColor(cs.status),
            }}
          >
            {cs.score}
          </span>
          <span style={s.breakdownScoreLabel}>/ 100</span>
        </div>
      </header>
      <ScoreBar score={cs.score} status={cs.status} />
      <p style={s.breakdownText}>{commentary.mechanism}</p>
    </article>
  )
}

/* ───── Severe-band deep-dive (Section 03, paid) ───── */

function PriorityDeepDive({
  cs,
  category,
  responses,
  commentary,
  hisNarrative,
  mhtOverlay,
}: {
  cs: CategoryScore
  category: AssessmentCategory | undefined
  responses: ResponseMap
  commentary: CategoryCommentary
  /** Stage-and-band specific HIS narrative for this domain. Paid + staged only. */
  hisNarrative?: string | null
  /** MHT overlay copy (D1 / D8 only when user is on MHT). */
  mhtOverlay?: string | null
}) {
  // 2026-05-16 slider re-flip: slider 0 = most-mild, 10 = most-severe.
  // Priority (severe) deep-dive wants the user's *most-symptomatic* responses,
  // which are the HIGHEST raw values.
  const contributing = getContributingQuestions(category, responses, "high", 4)
  return (
    <article style={s.deepDive}>
      <header style={s.deepDiveHeader}>
        <div>
          <h3 style={s.deepDiveTitle}>{cs.title}</h3>
          <span
            style={{
              ...s.inlineStatus,
              color: statusColor(cs.status),
              marginTop: 4,
              display: "inline-block",
            }}
          >
            {statusDisplayLabel(cs.status)} · Severe Focus
          </span>
        </div>
        <div style={s.breakdownScore}>
          <span
            style={{
              ...s.breakdownScoreNum,
              color: statusColor(cs.status),
            }}
          >
            {cs.score}
          </span>
          <span style={s.breakdownScoreLabel}>/ 100</span>
        </div>
      </header>

      <ScoreBar score={cs.score} status={cs.status} />

      {mhtOverlay && (
        <div style={s.mhtBanner}>
          <p style={s.mhtBannerText}>{mhtOverlay}</p>
        </div>
      )}

      {hisNarrative && <HISNarrativeBlock text={hisNarrative} />}

      <p style={s.deepDiveLede}>{commentary.mechanism}</p>

      {contributing.length > 0 && (
        <div style={s.contribWrap}>
          <h4 style={s.contribHeading}>What drove this score</h4>
          <ul style={s.contribList}>
            {contributing.map(({ q, value }) => (
              <li key={q.id} style={s.contribItem}>
                <span style={s.contribLabel}>{q.shortLabel}</span>
                <span style={s.contribPrompt}>{q.prompt}</span>
                <span style={s.contribValue}>
                  Your response: <strong>{value} / 10</strong> ({q.minLabel} ↔ {q.maxLabel})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={s.leversGrid}>
        <div style={s.leverCard}>
          <h5 style={s.leverHeading}>Lifestyle lever</h5>
          <p style={s.leverText}>{commentary.lifestyle}</p>
        </div>
        <div style={s.leverCard}>
          <h5 style={s.leverHeading}>Clinician conversation</h5>
          <p style={s.leverText}>{commentary.clinical}</p>
        </div>
      </div>
    </article>
  )
}

/* ───── Strength deep-dive (Section 04, paid) ───── */

function StrengthDeepDive({
  cs,
  category,
  responses,
  commentary,
  hisNarrative,
  mhtOverlay,
}: {
  cs: CategoryScore
  category: AssessmentCategory | undefined
  responses: ResponseMap
  commentary: CategoryCommentary
  hisNarrative?: string | null
  mhtOverlay?: string | null
}) {
  // 2026-05-16 slider re-flip: slider 0 = most-mild, 10 = most-severe.
  // Strength deep-dive wants the user's *least-symptomatic* responses,
  // which are the LOWEST raw values (the best scores).
  const contributing = getContributingQuestions(category, responses, "low", 4)
  return (
    <article style={s.deepDive}>
      <header style={s.deepDiveHeader}>
        <div>
          <h3 style={s.deepDiveTitle}>{cs.title}</h3>
          <span
            style={{
              ...s.inlineStatus,
              color: statusColor(cs.status),
              marginTop: 4,
              display: "inline-block",
            }}
          >
            {statusDisplayLabel(cs.status)}{cs.status === "Strong" ? " · Protect & Preserve" : ""}
          </span>
        </div>
        <div style={s.breakdownScore}>
          <span
            style={{
              ...s.breakdownScoreNum,
              color: statusColor(cs.status),
            }}
          >
            {cs.score}
          </span>
          <span style={s.breakdownScoreLabel}>/ 100</span>
        </div>
      </header>

      <ScoreBar score={cs.score} status={cs.status} />

      {mhtOverlay && (
        <div style={s.mhtBanner}>
          <p style={s.mhtBannerText}>{mhtOverlay}</p>
        </div>
      )}

      {hisNarrative && <HISNarrativeBlock text={hisNarrative} />}

      <p style={s.deepDiveLede}>{commentary.mechanism}</p>

      {contributing.length > 0 && (
        <div style={s.contribWrap}>
          <h4 style={s.contribHeading}>Where you're thriving</h4>
          <ul style={s.contribList}>
            {contributing.map(({ q, value }) => (
              <li key={q.id} style={s.contribItem}>
                <span style={s.contribLabel}>{q.shortLabel}</span>
                <span style={s.contribPrompt}>{q.prompt}</span>
                <span style={s.contribValue}>
                  Your response: <strong>{value} / 10</strong> ({q.minLabel} ↔ {q.maxLabel})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={s.leversGrid}>
        <div style={s.leverCard}>
          <h5 style={s.leverHeading}>Keep doing</h5>
          <p style={s.leverText}>{commentary.lifestyle}</p>
        </div>
        <div style={s.leverCard}>
          <h5 style={s.leverHeading}>Preserve with your clinician</h5>
          <p style={s.leverText}>{commentary.clinical}</p>
        </div>
      </div>
    </article>
  )
}

/* ───── Affirmations (Section 05) ───── */

const fallbackAffirmations: AffirmationItem[] = [
  { text: "My body is moving through a powerful transition, and I am listening with compassion." },
  { text: "Every symptom I've named today is information — not a verdict." },
  { text: "I deserve clinicians who take my menopause seriously." },
  { text: "Rest, nourishment, and hormonal balance are my right, not a reward." },
  { text: "I am the expert on my own body. This assessment is a tool I own." },
  { text: "Tomorrow's version of me is already being shaped by the care I give today." },
]

function AffirmationsSection({
  affirmations,
  limit,
  feedbackCtx,
}: {
  affirmations: AffirmationItem[]
  limit?: number
  feedbackCtx?: FeedbackCtx
}) {
  const source = affirmations && affirmations.length > 0 ? affirmations : fallbackAffirmations
  const list = typeof limit === "number" ? source.slice(0, limit) : source
  return (
    <section style={s.section} className="empress-report-section">
      <NumberedSectionHero
        number="05"
        title={list.length === 1 ? "Personalised Affirmation" : "Personalised Affirmations"}
        slug="report5"
      />
      <div style={s.affirmationGrid}>
        {list.map((item, i) => (
          <blockquote key={i} style={s.affirmation}>
            {/* Bug E: show focus_domain eyebrow when present (grounded affirmations) */}
            {item.focus_domain && (
              <span style={{
                display: "block",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#8a6a9a",
                marginBottom: "8px",
                fontStyle: "normal",
              }}>
                {item.focus_domain}
              </span>
            )}
            {item.text}
            {item.evidence_refs && item.evidence_refs.length > 0 && (
              <footer className="empress-evidence-refs" style={{
                fontSize: "11px",
                color: "#6e6a7a",
                marginTop: "6px",
                fontStyle: "normal",
              }}>
                Sourced from: {item.evidence_refs.map(shortChunk).join(", ")}
              </footer>
            )}
          </blockquote>
        ))}
      </div>
    </section>
  )
}

/* ───── Clinician recommendations (Section 06) ───── */

const fallbackRecommendations: RecommendedPerson[] = [
  {
    name: "Menopause-Certified NAMS Practitioner",
    specialty: "Certified Menopause Practitioner (CMP)",
    reason:
      "For evidence-based hormone therapy evaluation and personalised symptom management.",
  },
  {
    name: "Functional Medicine Physician",
    specialty: "IFMCP / MD with menopause focus",
    reason:
      "For root-cause investigation of metabolic, sleep, and cognitive changes.",
  },
  {
    name: "Pelvic Floor Physical Therapist",
    specialty: "Women's health PT",
    reason:
      "For genitourinary symptoms, bladder control, and intimate health support.",
  },
  {
    name: "Menopause-Aware Therapist",
    specialty: "Licensed clinical psychologist (PhD / PsyD)",
    reason:
      "For mood, anxiety, and the identity shifts that accompany perimenopause.",
  },
]

function RecommendationsSection({
  recommendations,
  clinician,
  limit,
  feedbackCtx,
}: {
  recommendations: RecommendedPerson[]
  clinician?: ClinicianMatch
  limit?: number
  feedbackCtx?: FeedbackCtx
}) {
  const source =
    recommendations && recommendations.length > 0
      ? recommendations
      : fallbackRecommendations
  // Default cap was 6; honour explicit `limit` (e.g. free tier passes 1) otherwise keep the 6 cap.
  const effectiveLimit = typeof limit === "number" ? limit : 6
  const list = source.slice(0, effectiveLimit)
  return (
    <section style={s.section} className="empress-report-section">
      <NumberedSectionHero
        number="06"
        title={list.length === 1 ? "Clinician Recommendation" : "Clinician Recommendations"}
        slug="report6"
      />
      {/* Grounded clinician card — shown when the API returns a clinician match. */}
      {clinician && clinician.label && (
        <article style={{
          ...s.recCard,
          border: "1.5px solid #c4a4d0",
          background: "linear-gradient(135deg, #f9f4fc 0%, #fdf8ff 100%)",
          marginBottom: "20px",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
            <h3 style={s.recName}>{clinician.label}</h3>
            {clinician.abbreviation && (
              <span style={{ fontSize: "13px", color: "#6e6a7a" }}>({clinician.abbreviation})</span>
            )}
          </div>
          {clinician.reason && <p style={s.recReason}>{clinician.reason}</p>}
          {clinician.find_provider_url && (
            <div style={{ marginTop: "14px" }}>
              <a
                href={clinician.find_provider_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  background: "#3F144A",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  letterSpacing: "0.01em",
                }}
              >
                Book an appointment →
              </a>
              <p style={{
                margin: "8px 0 0",
                fontSize: "12px",
                color: "#6e6a7a",
              }}>
                Opens the {clinician.label} directory to find a vetted provider near you
              </p>
            </div>
          )}
          {clinician.evidence_refs && clinician.evidence_refs.length > 0 && (
            <p className="empress-evidence-refs" style={{
              fontSize: "11px",
              color: "#6e6a7a",
              marginTop: "10px",
            }}>
              <span style={{ fontWeight: 600 }}>Why this match — </span>
              Sources: {clinician.evidence_refs.map(shortChunk).join(", ")}
            </p>
          )}
        </article>
      )}

      {/* Bug F: only show the generic fallback list when no grounded clinician was returned */}
      {!(clinician && clinician.label) && (
        <div style={s.recList}>
          {list.map((rec, i) => {
            const name = (rec.name as string) || (rec.title as string) || "Recommended specialist"
            const sub =
              (rec.specialty as string) ||
              (rec.title as string) ||
              ""
            const reason = (rec.reason as string) || ""
            return (
              <article key={i} style={s.recCard}>
                <h3 style={s.recName}>{name}</h3>
                {sub && <p style={s.recSub}>{sub}</p>}
                {reason && <p style={s.recReason}>{reason}</p>}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

/* ───── Download free .docx report (free tier only) ───── */

type FreeReportPayload = {
  user: { firstName?: string; age?: number } | null
  overall: number
  categoryScores: CategoryScore[]
  priorities: CategoryScore[]
  strengths: CategoryScore[]
  affirmations: string[]
  recommendations: RecommendedPerson[]
  completedAt?: string | null
}

function DownloadFreeReportCard({ payload }: { payload: FreeReportPayload }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const firstName = (payload.user?.firstName || "").trim()

  async function handleDownload() {
    setStatus("loading")
    setErrorMsg(null)
    try {
      const res = await fetch("/api/assessment/free-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const safeName = firstName.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40)
      a.download = safeName ? `Empress-Report-${safeName}.docx` : "Empress-Personal-Report.docx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // Give the download a beat to start before revoking.
      setTimeout(() => URL.revokeObjectURL(url), 500)
      setStatus("idle")
    } catch (e) {
      setErrorMsg((e as Error).message || "Could not generate your report.")
      setStatus("error")
    }
  }

  return (
    <section style={s.section} className="empress-report-section">
      <div style={s.downloadCard}>
        <h3 style={s.downloadTitle}>
          {firstName ? `${firstName}, take your report with you.` : "Take your report with you."}
        </h3>
        <p style={s.downloadText}>
          We've put your scores, priorities, strengths, and one specialist match
          into a 5-page personalised document — written like a friend explaining
          what your answers mean. Yours to keep, share, or bring to a clinician.
        </p>
        <button
          type="button"
          onClick={handleDownload}
          disabled={status === "loading"}
          style={status === "loading" ? s.downloadBtnDisabled : s.downloadBtn}
        >
          {status === "loading" ? "Preparing your report…" : "Download your personalised report (.docx)"}
        </button>
        {status === "error" && errorMsg && (
          <p style={s.downloadError}>
            Something went wrong: {errorMsg}. Please try again, or refresh the page.
          </p>
        )}
      </div>
    </section>
  )
}

/* ───── Pricing block (paid report — replaces the Luxury Gift section) ─────
 * Two side-by-side cards: a Free tier and a $29/month Subscription tier.
 * The subscription card is visually highlighted as the recommended choice.
 * Both CTAs deep-link to /membershipoptions so the existing checkout flow
 * remains the source of truth for payment.
 */

function ReportPricingBlock({
  firstName,
}: {
  firstName: string | null
}) {
  const greeting = firstName ? `${firstName}, here's how to keep going` : "Keep going"
  return (
    <section
      style={s.section}
      className="empress-report-section empress-no-print"
    >
      <h2 style={s.sectionHeading}>{greeting}</h2>
      <p style={s.sectionLede}>
        Your report stays available either way. A subscription adds ongoing
        access to the Empress chatbot, quarterly re-takes, and curated
        product drops as your scores evolve.
      </p>
      <div style={s.pricingGrid}>
        {/* Free column */}
        <div style={s.pricingCardFree}>
          <span style={s.pricingTier}>Free</span>
          <div style={s.pricingPriceRow}>
            <span style={s.pricingPrice}>$0</span>
          </div>
          <ul style={s.pricingFeatures}>
            <li style={s.pricingFeatureItem}>This Health Intelligence Report</li>
            <li style={s.pricingFeatureItem}>Downloadable PDF copy</li>
            <li style={s.pricingFeatureItem}>One affirmation pack</li>
            <li style={s.pricingFeatureItem}>One clinician match</li>
          </ul>
          <a href="/membershipoptions" style={s.pricingBtnFree}>
            Keep the free version
          </a>
        </div>

        {/* Paid report column (highlighted as recommended) */}
        <div style={s.pricingCardPaid}>
          <span style={s.pricingRecommended}>Recommended</span>
          <span style={s.pricingTier}>Full Report</span>
          <div style={s.pricingPriceRow}>
            <span style={s.pricingPrice}>$139</span>
            <span style={s.pricingPriceUnit}>one-time</span>
          </div>
          <ul style={s.pricingFeatures}>
            <li style={s.pricingFeatureItem}>Your full personalised report + 12 months of daily support</li>
            <li style={s.pricingFeatureItem}>
              Unlimited Ask&nbsp;Empress chatbot — 24/7 personalised guidance
            </li>
            <li style={s.pricingFeatureItem}>
              Quarterly re-takes with progress tracking
            </li>
            <li style={s.pricingFeatureItem}>
              Curated product drops tied to your evolving scores
            </li>
            <li style={s.pricingFeatureItem}>
              Priority clinician matching & follow-up
            </li>
          </ul>
          <a href="/membershipoptions" style={s.pricingBtnPaid}>
            Get full report — $139
          </a>
          <p style={{ margin: "10px 0 0", fontSize: "12px", color: "rgba(248,246,242,0.65)", textAlign: "center" as const }}>
            or <strong>$12/month</strong> — 12-month installment plan, same access
          </p>
          <p style={{ margin: "6px 0 0", fontSize: "11px", color: "rgba(248,246,242,0.45)", textAlign: "center" as const }}>
            No subscription auto-renews. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ───── F5: Refer a friend (free tier card on report screen) ───── */

function ReferAFriendCard({
  referrerFirstName,
  tier,
}: {
  referrerFirstName: string | null
  tier: "free" | "paid"
}) {
  const [friendName, setFriendName] = useState("")
  const [friendEmail, setFriendEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isValid =
    friendName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail.trim())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setStatus("sending")
    setErrorMsg(null)
    try {
      const res = await fetch("/api/referral/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          friendName: friendName.trim(),
          friendEmail: friendEmail.trim(),
          referrerFirstName: referrerFirstName || null,
          tier,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error((data && data.error) || `HTTP ${res.status}`)
      }
      setStatus("sent")
    } catch (e) {
      setErrorMsg((e as Error).message || "Something went wrong.")
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <section style={s.section} className="empress-report-section empress-no-print">
        <div style={s.referThanks}>
          Thank you{referrerFirstName ? `, ${referrerFirstName}` : ""}. We'll
          reach out to {friendName.trim()} from the Empress team — and we're
          grateful you thought of them.
        </div>
      </section>
    )
  }

  return (
    <section style={s.section} className="empress-report-section empress-no-print">
      <div style={s.referCard}>
        <span style={s.referEyebrow}>SHARE THE LOVE</span>
        <h3 style={s.referTitle}>
          Know someone who'd benefit from this?
        </h3>
        <p style={s.referText}>
          {referrerFirstName ? `${referrerFirstName}, ` : ""}drop a friend's name and
          email below and our team will reach out personally with an invite to
          take the assessment. We won't email her without you knowing.
        </p>
        <form onSubmit={handleSubmit} style={s.referForm}>
          <input
            type="text"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            placeholder="Friend's first name"
            style={s.referInput}
            maxLength={120}
            autoComplete="off"
          />
          <input
            type="email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            placeholder="Friend's email"
            style={s.referInput}
            maxLength={200}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!isValid || status === "sending"}
            style={!isValid || status === "sending" ? s.referBtnDisabled : s.referBtn}
          >
            {status === "sending" ? "Sending…" : "Send referral"}
          </button>
        </form>
        {status === "error" && errorMsg && (
          <p style={s.referError}>Couldn't send: {errorMsg}</p>
        )}
      </div>
    </section>
  )
}

/* ───── F7: Per-section friendly comment box ───── */

type FeedbackCtx = {
  firstName?: string | null
  tier: "free" | "paid"
  completedAt?: string | null
}

function FeedbackBox({
  sectionId,
  sectionTitle,
  ctx,
}: {
  sectionId: string
  sectionTitle: string
  ctx: FeedbackCtx
}) {
  const [text, setText] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const firstName = (ctx.firstName || "").trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setStatus("sending")
    setErrorMsg(null)
    try {
      const res = await fetch("/api/assessment/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sectionId,
          sectionTitle,
          comment: trimmed,
          tier: ctx.tier,
          firstName: firstName || null,
          completedAt: ctx.completedAt || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error((data && data.error) || `HTTP ${res.status}`)
      }
      setStatus("sent")
    } catch (e) {
      setErrorMsg((e as Error).message || "Something went wrong.")
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div style={s.feedbackThanks} className="empress-no-print">
        Thank you{firstName ? `, ${firstName}` : ""}. We hear you.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={s.feedbackBox} className="empress-no-print">
      <label style={s.feedbackLabel} htmlFor={`fb-${sectionId}`}>
        How does this resonate{firstName ? `, ${firstName}` : ""}? Tell us in your own words.
      </label>
      <textarea
        id={`fb-${sectionId}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={4000}
        placeholder="What stands out — or what doesn't quite fit?"
        style={s.feedbackTextarea}
      />
      <div style={s.feedbackActions}>
        <button
          type="submit"
          disabled={!text.trim() || status === "sending"}
          style={
            !text.trim() || status === "sending"
              ? s.feedbackBtnDisabled
              : s.feedbackBtn
          }
        >
          {status === "sending" ? "Sending…" : "Send"}
        </button>
        {status === "error" && errorMsg && (
          <span style={s.feedbackError}>Couldn't send: {errorMsg}</span>
        )}
      </div>
    </form>
  )
}

/* ───── Consolidated Feedback Section (Bug J: one form at end of report) ───── */

const SECTION_OPTIONS = [
  { value: "overall", label: "Overall report" },
  { value: "01-overview", label: "01 — Menopause Stage & Overview" },
  { value: "02-domain-scores", label: "02 — Domain Scores" },
  { value: "03-priorities", label: "03 — Top Severe Areas" },
  { value: "04-strengths", label: "04 — Strongest Domains" },
  { value: "05-affirmation", label: "05 — Personalised Affirmations" },
  { value: "06-recommendation", label: "06 — Clinician Recommendation" },
  { value: "07-recommended-products", label: "07 — Recommended Products" },
]

function ConsolidatedFeedbackSection({ feedbackCtx }: { feedbackCtx: FeedbackCtx }) {
  const [text, setText] = useState("")
  const [section, setSection] = useState("overall")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const firstName = (feedbackCtx.firstName || "").trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setStatus("sending")
    setErrorMsg(null)
    const selectedOption = SECTION_OPTIONS.find((o) => o.value === section)
    try {
      const res = await fetch("/api/assessment/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sectionId: section,
          sectionTitle: selectedOption?.label ?? "Overall",
          comment: trimmed,
          tier: feedbackCtx.tier,
          firstName: firstName || null,
          completedAt: feedbackCtx.completedAt || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error((data && data.error) || `HTTP ${res.status}`)
      }
      setStatus("sent")
    } catch (e) {
      setErrorMsg((e as Error).message || "Something went wrong.")
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <section style={s.section} className="empress-report-section empress-no-print">
        <div style={s.feedbackThanks}>
          Thank you{firstName ? `, ${firstName}` : ""}. We hear you.
        </div>
      </section>
    )
  }

  return (
    <section style={s.section} className="empress-report-section empress-no-print">
      <h2 style={s.sectionHeading}>
        How does this report resonate{firstName ? `, ${firstName}` : ""}?
      </h2>
      <form onSubmit={handleSubmit} style={{ ...s.feedbackBox, background: "transparent", border: "none", padding: 0, gap: 12 }}>
        <div>
          <label
            htmlFor="consolidated-section"
            style={{ ...s.feedbackLabel, display: "block", marginBottom: 6 }}
          >
            Which section are you commenting on?
          </label>
          <select
            id="consolidated-section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "0.92rem",
              fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
              color: "#1F1F1F",
              background: "#fff",
              border: "1px solid #ddd5e2",
              borderRadius: 10,
              outline: "none",
            }}
          >
            {SECTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ ...s.feedbackLabel, display: "block", marginBottom: 6 }} htmlFor="consolidated-comment">
            Your thoughts
          </label>
          <textarea
            id="consolidated-comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            maxLength={4000}
            placeholder="What stands out — or what doesn't quite fit?"
            style={s.feedbackTextarea}
          />
        </div>
        <div style={s.feedbackActions}>
          <button
            type="submit"
            disabled={!text.trim() || status === "sending"}
            style={
              !text.trim() || status === "sending"
                ? s.feedbackBtnDisabled
                : s.feedbackBtn
            }
          >
            {status === "sending" ? "Sending…" : "Send"}
          </button>
          {status === "error" && errorMsg && (
            <span style={s.feedbackError}>Couldn't send: {errorMsg}</span>
          )}
        </div>
      </form>
    </section>
  )
}

/* ───── Recommended products (Section 07 — paid only) ───── */

const fallbackProducts: string[] = [
  "Empress Naturals Anti-Aging Serum — nightly, collagen-supporting retinoid-free formula.",
  "Empress Naturals Relaxing Body Oil — post-shower, for sleep onset and skin barrier support.",
  "Magnesium Glycinate 300–400mg — 1 hour before bed, for sleep architecture and muscle relaxation.",
  "Vitamin D3 + K2 2000 IU — morning, for bone density and immune support.",
  "Omega-3 EPA/DHA 1–2g — with food, for mood, cardiovascular, and cognitive support.",
]

function RecommendedProductsSection({
  products,
  groundedProducts,
  intro,
  feedbackCtx,
}: {
  products: string[]
  groundedProducts?: ProductRecommendation[]
  intro: string
  feedbackCtx?: FeedbackCtx
}) {
  // Bug G: prefer grounded products; suppress the generic fallback list.
  const hasGrounded = groundedProducts && groundedProducts.length > 0
  const hasLegacy = products && products.length > 0
  // Shopify store base URL
  const SHOPIFY_BASE = "https://skincare-solutions-llc.myshopify.com/products"

  return (
    <section style={s.section} className="empress-report-section">
      <NumberedSectionHero
        number="07"
        title="Recommended Products"
        slug="report7"
      />
      {intro && hasGrounded && (
        <p style={s.productsIntro}>{intro}</p>
      )}
      <div style={s.productList}>
        {hasGrounded
          ? groundedProducts!.map((p, i) => (
              <article key={i} style={s.productCard}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" as const }}>
                  <span style={s.productIndex}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ ...s.productText, flex: 1 }}>
                    {p.shopify_handle
                      ? (
                          <a
                            href={`${SHOPIFY_BASE}/${p.shopify_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#3F144A", fontWeight: 700, textDecoration: "underline" }}
                          >
                            {p.product_name || String(p)}
                          </a>
                        )
                      : <strong>{p.product_name || String(p)}</strong>
                    }
                    {p.price_tier && (
                      <span style={{
                        marginLeft: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "#f3e8ff",
                        color: "#3F144A",
                        padding: "2px 8px",
                        borderRadius: "999px",
                      }}>
                        {p.price_tier}
                      </span>
                    )}
                    {p.reason && (
                      <span style={{ display: "block", fontSize: "13px", color: "#6e6a7a", marginTop: "4px", fontWeight: 400 }}>
                        {p.reason}
                      </span>
                    )}
                  </span>
                </div>
                {p.evidence_refs && p.evidence_refs.length > 0 && (
                  <p className="empress-evidence-refs" style={{
                    fontSize: "11px",
                    color: "#6e6a7a",
                    marginTop: "8px",
                  }}>
                    Sources: {p.evidence_refs.map(shortChunk).join(", ")}
                  </p>
                )}
              </article>
            ))
          : hasLegacy
            ? products.map((p, i) => (
                <article key={i} style={s.productCard}>
                  <span style={s.productIndex}>{String(i + 1).padStart(2, "0")}</span>
                  <p style={s.productText}>{p}</p>
                </article>
              ))
            : (
                <p style={s.sectionLede}>No product recommendations available right now.</p>
              )
        }
      </div>
    </section>
  )
}

/* ───── Citation Sources Index ─────
 * Lists all unique evidence_refs used across affirmations, clinician, and
 * grounded products alongside a 1-line description from the chunk map. */
function CitationSourcesSection({ apiResult }: { apiResult: AssessmentApiResult }) {
  const allRefs = new Set<string>()

  // Collect from affirmations
  const affItems = normaliseAffirmations(apiResult.affirmations)
  affItems.forEach((a) => (a.evidence_refs ?? []).forEach((r) => allRefs.add(r)))

  // Collect from clinician
  ;(apiResult.clinician?.evidence_refs ?? []).forEach((r) => allRefs.add(r))

  // Collect from grounded products
  ;(apiResult.groundedProducts ?? []).forEach((p) =>
    (p.evidence_refs ?? []).forEach((r) => allRefs.add(r))
  )

  if (allRefs.size === 0) return null

  const sorted = Array.from(allRefs).sort()

  return (
    <section style={s.section} className="empress-report-section empress-no-print">
      <h2 style={{ ...s.sectionHeading, marginBottom: "12px" }}>Citation Sources</h2>
      <p style={{ ...s.sectionLede, marginBottom: "16px" }}>
        The following clinical framework chunks were retrieved to ground your personalised
        recommendations and affirmations.
      </p>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: "8px" }}>
        {sorted.map((chunkId) => (
          <div key={chunkId} style={{
            display: "flex",
            gap: "12px",
            padding: "10px 14px",
            background: "#faf8fc",
            borderRadius: "6px",
            borderLeft: "3px solid #c4a4d0",
          }}>
            <code style={{
              fontSize: "11px",
              color: "#3F144A",
              fontWeight: 700,
              whiteSpace: "nowrap" as const,
              minWidth: "80px",
            }}>
              {shortChunk(chunkId)}
            </code>
            <span style={{ fontSize: "13px", color: "#6e6a7a" }}>
              {CHUNK_DESCRIPTIONS[chunkId] ?? chunkId}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ───── Grounding debug badge (localhost or ?debug=1 only) ─────
 * Click-to-expand badge showing source + citation count + chunk IDs.
 * Never renders in real production. */
function GroundingDebugBadge({ apiResult }: { apiResult: AssessmentApiResult }) {
  const [open, setOpen] = useState(false)

  const isDebug =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.search.includes("debug=1"))

  if (!isDebug) return null

  const allRefs = new Set<string>()
  const affItems = normaliseAffirmations(apiResult.affirmations)
  affItems.forEach((a) => (a.evidence_refs ?? []).forEach((r) => allRefs.add(r)))
  ;(apiResult.clinician?.evidence_refs ?? []).forEach((r) => allRefs.add(r))
  ;(apiResult.groundedProducts ?? []).forEach((p) =>
    (p.evidence_refs ?? []).forEach((r) => allRefs.add(r))
  )

  const count = allRefs.size
  const source = apiResult.source ?? "unknown"

  return (
    <div
      onClick={() => setOpen((v) => !v)}
      style={{
        position: "fixed",
        top: "12px",
        right: "12px",
        zIndex: 9999,
        cursor: "pointer",
        background: "#3F144A",
        color: "#fff",
        borderRadius: "8px",
        padding: open ? "12px 16px" : "6px 12px",
        fontSize: "12px",
        fontFamily: "monospace",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        maxWidth: open ? "320px" : "auto",
        lineHeight: 1.5,
      }}
    >
      <div>Grounded via {source} · {count} citation{count !== 1 ? "s" : ""}</div>
      {open && count > 0 && (
        <div style={{ marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "8px" }}>
          {Array.from(allRefs).sort().map((id) => (
            <div key={id} style={{ fontSize: "11px", opacity: 0.85 }}>{shortChunk(id)}</div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ───── Thank You (final page) ─────
 * Closing page for the paid report. Renders a branded burgundy slide with
 * the required heading, body, contact email, and brand line. The optional
 * hero image is loaded above the text if available. */
function ThankYouPage({ firstName }: { firstName?: string | null }) {
  const [imgFailed, setImgFailed] = useState(false)
  return (
    <section className="empress-report-section empress-thankyou" style={s.thankYou}>
      {!imgFailed && (
        <img
          src={`/report-heroes/thankyouimage.jpeg`}
          alt=""
          onError={() => setImgFailed(true)}
          style={s.thankYouImg}
        />
      )}
      <div style={s.thankYouInner}>
        <div style={s.thankYouDivider} />
        <h2 style={s.thankYouTitle}>
          Thank you for trusting Empress Health
        </h2>
        <p style={s.thankYouText}>
          This report is the start of a conversation, not the end. We're here
          when you have questions — and we'll be checking in with you with
          personalised daily support.
        </p>
        <p style={{ ...s.thankYouText, marginTop: "18px" }}>
          Contact us:{" "}
          <a
            href="mailto:support@empresshealth.ai"
            style={{ color: gold, textDecoration: "underline" }}
          >
            support@empresshealth.ai
          </a>
        </p>
        <p style={s.thankYouBrandLine}>
          Empress Health · Smart Support for Every Stage of Menopause
        </p>
      </div>
    </section>
  )
}

/* ───── Domain Wheel (Section 01 infographic) ─────
 * Recreation of the team's 10-domain wheel: icon badges + descriptions
 * around a score-driven radar polygon, dashed 0–100 rings, and a
 * Severe / Moderate / Mild legend. Built as an SVG string and injected so
 * it renders identically on screen and in the print PDF. Scores are looked
 * up per slug from categoryScores, so layout is independent of data order. */
function DomainWheel({ scores }: { scores: CategoryScore[] }) {
  const bySlug: Record<string, number> = {}
  scores.forEach((cs) => {
    bySlug[cs.slug] = cs.score
  })

  const W = 1440,
    H = 1180,
    CX = 720,
    CY = 560,
    R = 210,
    RB = R + 104
  const RINGS = [20, 40, 60, 80, 100]

  type WheelDomain = {
    slug: string
    name: string
    l1: string
    l2: string
    color: string
    icon: string
    side: "top" | "right" | "bottom" | "left"
  }
  const DOMAINS: WheelDomain[] = [
    { slug: "vasomotor-temperature", name: "Vasomotor", l1: "Hot flashes,", l2: "night sweats", color: "#E0392B", icon: "flame", side: "top" },
    { slug: "sleep-architecture-cortisol", name: "Sleep Architecture", l1: "Sleep quality", l2: "and patterns", color: "#6B3FA0", icon: "moon", side: "right" },
    { slug: "cognitive-function-brain-health", name: "Cognitive Function", l1: "Focus, memory", l2: "and clarity", color: "#3B4DA0", icon: "brain", side: "right" },
    { slug: "mood-anxiety-emotional-health", name: "Mood", l1: "Emotional", l2: "well-being", color: "#2E9BD6", icon: "smiley", side: "right" },
    { slug: "metabolic-health-body-composition", name: "Metabolic Health", l1: "Weight, energy", l2: "and metabolism", color: "#3DA84A", icon: "apple", side: "right" },
    { slug: "skin-hair-nails", name: "Skin", l1: "Hydration,", l2: "elasticity, glow", color: "#16A6A0", icon: "droplet", side: "bottom" },
    { slug: "musculoskeletal-bone-health", name: "Musculoskeletal", l1: "Joint comfort", l2: "and mobility", color: "#F39200", icon: "bone", side: "left" },
    { slug: "genitourinary-sexual-health", name: "Genitourinary", l1: "Vaginal, bladder", l2: "and urinary health", color: "#E6357F", icon: "genito", side: "left" },
    { slug: "cardiovascular-whole-body-energy", name: "Cardiovascular", l1: "Heart health", l2: "and circulation", color: "#E0392B", icon: "heart", side: "left" },
    { slug: "lifestyle-gut-health-nutrition", name: "Lifestyle", l1: "Activity, nutrition", l2: "and habits", color: "#4CAF50", icon: "leaf", side: "left" },
  ]

  const bandColor = (s: number) => (s < 50 ? "#E8412B" : s < 65 ? "#F5A623" : "#3FA845")
  const pt = (a: number, r: number): [number, number] => {
    const t = (a * Math.PI) / 180
    return [CX + r * Math.sin(t), CY - r * Math.cos(t)]
  }

  const icon = (kind: string, cx: number, cy: number, c: string): string => {
    const s: string[] = []
    if (kind === "flame") {
      s.push(`<path d="M${cx},${cy - 26} C${cx + 16},${cy - 6} ${cx + 18},${cy + 6} ${cx + 8},${cy + 16} C${cx + 14},${cy + 8} ${cx + 6},${cy} ${cx + 4},${cy + 6} C${cx + 2},${cy - 6} ${cx - 6},${cy - 2} ${cx - 14},${cy + 12} C${cx - 22},${cy + 2} ${cx - 14},${cy - 14} ${cx},${cy - 26} Z" fill="#fff"/>`)
      s.push(`<path d="M${cx - 1},${cy - 6} C${cx + 8},${cy + 2} ${cx + 8},${cy + 12} ${cx},${cy + 18} C${cx - 8},${cy + 12} ${cx - 8},${cy + 2} ${cx - 1},${cy - 6} Z" fill="${c}"/>`)
    } else if (kind === "moon") {
      s.push(`<path d="M${cx + 8},${cy - 22} A24,24 0 1 0 ${cx + 8},${cy + 22} A19,19 0 1 1 ${cx + 8},${cy - 22} Z" fill="#fff"/>`)
      const st: string[] = []
      for (let k = 0; k < 4; k++) {
        const a = (k * 90 * Math.PI) / 180
        st.push(`${cx + 18 + 10 * Math.sin(a)},${cy - 16 - 10 * Math.cos(a)}`)
        const a2 = ((k * 90 + 45) * Math.PI) / 180
        st.push(`${cx + 18 + 3.5 * Math.sin(a2)},${cy - 16 - 3.5 * Math.cos(a2)}`)
      }
      s.push(`<polygon points="${st.join(" ")}" fill="#fff"/>`)
    } else if (kind === "brain") {
      s.push(`<path d="M${cx},${cy - 22} C${cx - 20},${cy - 24} ${cx - 26},${cy - 4} ${cx - 20},${cy + 6} C${cx - 24},${cy + 18} ${cx - 8},${cy + 24} ${cx},${cy + 18} C${cx + 8},${cy + 24} ${cx + 24},${cy + 18} ${cx + 20},${cy + 6} C${cx + 26},${cy - 4} ${cx + 20},${cy - 24} ${cx},${cy - 22} Z" fill="#fff"/>`)
      s.push(`<path d="M${cx},${cy - 20} L${cx},${cy + 18}" stroke="${c}" stroke-width="2.4" fill="none"/>`)
      s.push(`<path d="M${cx - 10},${cy - 8} C${cx - 4},${cy - 6} ${cx - 4},${cy} ${cx - 10},${cy + 4}" stroke="${c}" stroke-width="2.4" fill="none"/>`)
      s.push(`<path d="M${cx + 10},${cy - 8} C${cx + 4},${cy - 6} ${cx + 4},${cy} ${cx + 10},${cy + 4}" stroke="${c}" stroke-width="2.4" fill="none"/>`)
    } else if (kind === "smiley") {
      s.push(`<circle cx="${cx}" cy="${cy}" r="24" fill="#fff"/>`)
      s.push(`<circle cx="${cx - 8}" cy="${cy - 5}" r="3.6" fill="${c}"/>`)
      s.push(`<circle cx="${cx + 8}" cy="${cy - 5}" r="3.6" fill="${c}"/>`)
      s.push(`<path d="M${cx - 10},${cy + 6} Q${cx},${cy + 16} ${cx + 10},${cy + 6}" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`)
    } else if (kind === "apple") {
      s.push(`<path d="M${cx},${cy - 12} C${cx - 6},${cy - 20} ${cx - 22},${cy - 18} ${cx - 22},${cy - 2} C${cx - 22},${cy + 14} ${cx - 10},${cy + 24} ${cx},${cy + 20} C${cx + 10},${cy + 24} ${cx + 22},${cy + 14} ${cx + 22},${cy - 2} C${cx + 22},${cy - 18} ${cx + 6},${cy - 20} ${cx},${cy - 12} Z" fill="#fff"/>`)
      s.push(`<path d="M${cx},${cy - 12} C${cx + 2},${cy - 22} ${cx + 12},${cy - 26} ${cx + 18},${cy - 24} C${cx + 14},${cy - 16} ${cx + 6},${cy - 14} ${cx},${cy - 13} Z" fill="#fff"/>`)
      s.push(`<rect x="${cx - 1.5}" y="${cy - 22}" width="3" height="10" rx="1.5" fill="${c}"/>`)
    } else if (kind === "droplet" || kind === "genito") {
      s.push(`<path d="M${cx},${cy - 24} C${cx + 16},${cy - 2} ${cx + 18},${cy + 8} ${cx + 12},${cy + 16} A16,16 0 1 1 ${cx - 12},${cy + 16} C${cx - 18},${cy + 8} ${cx - 16},${cy - 2} ${cx},${cy - 24} Z" fill="#fff"/>`)
      if (kind === "genito") s.push(`<path d="M${cx},${cy + 2} C${cx + 6},${cy + 8} ${cx + 6},${cy + 15} ${cx},${cy + 19} C${cx - 6},${cy + 15} ${cx - 6},${cy + 8} ${cx},${cy + 2} Z" fill="${c}"/>`)
    } else if (kind === "bone") {
      let g = `<g transform="rotate(45 ${cx} ${cy})"><rect x="${cx - 16}" y="${cy - 5}" width="32" height="10" rx="5" fill="#fff"/>`
      ;[-16, 16].forEach((dx) => {
        g += `<circle cx="${cx + dx}" cy="${cy - 7}" r="7.5" fill="#fff"/><circle cx="${cx + dx}" cy="${cy + 7}" r="7.5" fill="#fff"/>`
      })
      g += `</g>`
      s.push(g)
    } else if (kind === "heart") {
      s.push(`<path d="M${cx},${cy + 18} C${cx - 22},${cy + 2} ${cx - 22},${cy - 16} ${cx - 10},${cy - 16} C${cx - 3},${cy - 16} ${cx},${cy - 9} ${cx},${cy - 9} C${cx},${cy - 9} ${cx + 3},${cy - 16} ${cx + 10},${cy - 16} C${cx + 22},${cy - 16} ${cx + 22},${cy + 2} ${cx},${cy + 18} Z" fill="#fff"/>`)
      s.push(`<path d="M${cx - 13},${cy - 1} L${cx - 6},${cy - 1} L${cx - 2},${cy - 8} L${cx + 3},${cy + 6} L${cx + 7},${cy - 1} L${cx + 13},${cy - 1}" stroke="${c}" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`)
    } else if (kind === "leaf") {
      s.push(`<path d="M${cx + 18},${cy - 20} C${cx - 18},${cy - 18} ${cx - 22},${cy + 14} ${cx - 14},${cy + 20} C${cx + 10},${cy + 22} ${cx + 22},${cy + 2} ${cx + 18},${cy - 20} Z" fill="#fff"/>`)
      s.push(`<path d="M${cx - 12},${cy + 18} C${cx - 2},${cy + 4} ${cx + 8},${cy - 8} ${cx + 16},${cy - 18}" stroke="${c}" stroke-width="2.4" fill="none"/>`)
    }
    return s.join("")
  }

  const el: string[] = []
  el.push(`<rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="34" fill="#FFFCF6" stroke="#D8A738" stroke-width="5"/>`)
  const ringClr: Record<number, string> = { 20: "#F2C6B8", 40: "#F4D7A0", 60: "#F6E0A6", 80: "#CFE0F2", 100: "#E7A6B8" }
  RINGS.forEach((v) => el.push(`<circle cx="${CX}" cy="${CY}" r="${((R * v) / 100).toFixed(1)}" fill="none" stroke="${ringClr[v]}" stroke-width="2" stroke-dasharray="5 6" opacity="0.9"/>`))
  DOMAINS.forEach((d, i) => {
    const [x, y] = pt(i * 36, R)
    el.push(`<line x1="${CX}" y1="${CY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e3dcea" stroke-width="1" stroke-dasharray="3 4"/>`)
  })
  const poly = DOMAINS.map((d, i) => {
    const sc = bySlug[d.slug] ?? 0
    const [x, y] = pt(i * 36, (R * sc) / 100)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(" ")
  el.push(`<polygon points="${poly}" fill="url(#blob)" stroke="#9B6FB0" stroke-width="2.5" stroke-linejoin="round"/>`)
  DOMAINS.forEach((d, i) => {
    const sc = bySlug[d.slug] ?? 0
    const [x, y] = pt(i * 36, (R * sc) / 100)
    el.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8.5" fill="${bandColor(sc)}" stroke="#fff" stroke-width="3"/>`)
  })
  ;[0, 20, 40, 60, 80, 100].forEach((v) => {
    const [x, y] = pt(0, (R * v) / 100)
    el.push(`<text x="${x}" y="${y + 8}" font-family="'The Seasons', 'Playfair Display',Arial" font-size="30" font-weight="700" fill="#2b2440" text-anchor="middle">${v}</text>`)
  })
  DOMAINS.forEach((d, i) => {
    const [bx, by] = pt(i * 36, RB)
    const [rx, ry] = pt(i * 36, R)
    el.push(`<line x1="${rx.toFixed(1)}" y1="${ry.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${d.color}" stroke-width="2.5" opacity="0.55"/>`)
    el.push(`<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="44" fill="${d.color}" stroke="#fff" stroke-width="4" filter="url(#sh)"/>`)
    el.push(icon(d.icon, +bx.toFixed(1), +by.toFixed(1), d.color))
    let tx: number, anchor: string, ny: number
    if (d.side === "right") {
      tx = bx + 62
      anchor = "start"
      ny = by - 14
    } else if (d.side === "left") {
      tx = bx - 62
      anchor = "end"
      ny = by - 14
    } else if (d.side === "top") {
      tx = bx
      anchor = "middle"
      ny = by - 78
    } else {
      tx = bx
      anchor = "middle"
      ny = by + 64
    }
    el.push(`<text x="${tx.toFixed(1)}" y="${ny.toFixed(1)}" font-family="'The Seasons', 'Playfair Display',Arial" font-size="29" font-weight="700" fill="${d.color}" text-anchor="${anchor}">${d.name}</text>`)
    el.push(`<text x="${tx.toFixed(1)}" y="${(ny + 30).toFixed(1)}" font-family="'Avenir', 'Avenir Next', 'Nunito Sans',Arial" font-size="20" fill="#555" text-anchor="${anchor}">${d.l1}</text>`)
    el.push(`<text x="${tx.toFixed(1)}" y="${(ny + 54).toFixed(1)}" font-family="'Avenir', 'Avenir Next', 'Nunito Sans',Arial" font-size="20" fill="#555" text-anchor="${anchor}">${d.l2}</text>`)
  })
  const ly = H - 110,
    segW = (W - 120) / 3
  const segs: Array<[string, string, string, string, string]> = [
    ["#E8412B", "Severe", "— &lt;50", "Needs attention", "#FCEDE9"],
    ["#F5A623", "Moderate", "— 50–65", "Monitor &amp; support", "#FCF4E4"],
    ["#3FA845", "Mild", "— 65-100", "Well supported", "#EAF5EC"],
  ]
  el.push(`<rect x="60" y="${ly}" width="${W - 120}" height="78" rx="20" fill="#fff" stroke="#eadfca" stroke-width="1.5"/>`)
  segs.forEach((seg, k) => {
    const [c, t1, t2, t3, bg] = seg
    const x0 = 60 + k * segW
    el.push(`<rect x="${x0 + (k ? 6 : 0)}" y="${ly}" width="${segW - (k ? 6 : 0)}" height="78" rx="20" fill="${bg}"/>`)
    el.push(`<circle cx="${x0 + 40}" cy="${ly + 30}" r="11" fill="${c}"/>`)
    el.push(`<text x="${x0 + 62}" y="${ly + 30}" font-family="'The Seasons', 'Playfair Display',Arial" font-size="24" font-weight="700" fill="#2b2440">${t1} <tspan font-weight="400" fill="#6b6478">${t2}</tspan></text>`)
    el.push(`<text x="${x0 + 62}" y="${ly + 58}" font-family="'Avenir', 'Avenir Next', 'Nunito Sans',Arial" font-size="20" fill="#6b6478">${t3}</text>`)
  })
  const defs = `<defs><linearGradient id="blob" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F8D55F" stop-opacity="0.9"/><stop offset="32%" stop-color="#F39BB6" stop-opacity="0.85"/><stop offset="62%" stop-color="#93B8EC" stop-opacity="0.85"/><stop offset="100%" stop-color="#8FDCB0" stop-opacity="0.9"/></linearGradient><filter id="sh" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#3a2350" flood-opacity="0.28"/></filter></defs>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Your ten domain scores plotted on a wheel">${defs}${el.join("")}</svg>`
  return <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }} dangerouslySetInnerHTML={{ __html: svg }} />
}

/* ───── Print stylesheet ───── */

const printCSS = `
@page {
  size: letter;
  /* Tightened from 15mm to 10mm top/bottom — the 15mm gutter combined
   * with section padding-top was producing ~120px of blank space at the
   * top of every continuation page (notably page 20 of the recommended
   * products section). 10mm still leaves room for the print header. */
  margin: 10mm 14mm;
}

@media print {
  /* Ensure backgrounds + colors render in PDFs (Chromium + WebKit + Firefox). */
  html, body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background: #fff !important;
  }

  /* Continuation-page fix: the 32px section padding-top + 24px hero
   * bottom-margin compounded with the @page margin to leave a large
   * empty gap at the top of every continuation page (page 20 etc.).
   * Drop both in print — visual breathing is already provided by the
   * hero card's own internal 18px padding and the @page margin. */
  .empress-report-section {
    padding-top: 0 !important;
  }
  .empress-numbered-hero,
  .empress-section-hero {
    margin-bottom: 8px !important;
  }

  /* Hide on-screen controls + the site nav in the printed output */
  .empress-report-cta { display: none !important; }
  .empress-report-pending { display: none !important; }
  .empress-cover-nav { display: none !important; }

  /* Cover fills exactly one Letter page (279.4mm − 2×15mm margins ≈ 249mm)
   * and forces the next section onto a fresh page. We override the on-screen
   * min-height:100vh, which overflows the printable area and would otherwise
   * spill a near-blank second cover page. */
  .empress-cover {
    box-sizing: border-box;
    min-height: 0 !important;
    height: 240mm;
    overflow: hidden;
    break-after: page;
    page-break-after: always;
  }

  /* Thank-you closing page fills its own page (same fix as the cover).
   * box-sizing:border-box + overflow:hidden keep the section's padding
   * INSIDE the 240mm box so it never spills a trailing blank page (the
   * previous 247mm height was content-box, so the 24px padding pushed the
   * total past the printable area and bled an empty page after each). */
  .empress-thankyou {
    box-sizing: border-box;
    min-height: 0 !important;
    height: 240mm;
    overflow: hidden;
  }
  .empress-thankyou img {
    max-height: 232mm;
    object-fit: contain;
  }

  /* Start each major numbered section on a fresh page. We intentionally do
   * NOT set break-inside on sections — they span many pages each and forcing
   * them onto a single page makes Chrome truncate or blank-page. */
  .empress-report-section {
    break-before: page;
    page-break-before: always;
  }
  .empress-report-section:first-of-type {
    break-before: avoid;
    page-break-before: avoid;
  }

  /* Keep only SMALL atomic blocks intact. We deliberately do NOT apply
   * break-inside:avoid to the tall deep-dive / breakdown <article> cards:
   * when an element is taller than the printable page, break-inside:avoid
   * forces Chromium to push it to the next page and leave a BLANK page
   * behind it. That was the source of the blank pages reported between the
   * domain cards (Sleep, Mood, Cognitive, Vasomotor, Musculoskeletal) and
   * before "03 Your Top Priority Areas". Letting tall articles flow across
   * page boundaries removes those blanks; headings still stay with their
   * content via break-after:avoid below. */
  table,
  tr,
  blockquote {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* The radar chart + hero gradient both depend on color-adjust */
  svg, .empress-hero, section[style*="gradient"] {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Prevent headings from being stranded at page bottom */
  h1, h2, h3 {
    break-after: avoid;
    page-break-after: avoid;
  }
}
`

/* ───── Styles ───── */

// Aligned to site palette from index.html :root
//   --empress-gold #D8A738   --primary #3F144A   --primary-600 #472052   --bg #F3E5D3
const gold = "#D8A738"
const plum = "#3F144A"
const plumLight = "#472052"
const ivory = "#F3E5D3"

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: ivory,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    color: "#1F1F1F",
  },

  /* Hero */
  hero: {
    background: `linear-gradient(160deg, ${plum} 0%, ${plumLight} 100%)`,
    color: ivory,
    padding: "24px 24px 56px",
  },
  heroNavWrap: { maxWidth: 860, margin: "0 auto 8px" },
  heroInner: {
    maxWidth: 860,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 32,
  },
  heroLeft: { flex: "1 1 360px" },
  brand: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.2em",
    color: gold,
    display: "block",
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: "0 0 12px",
    color: ivory,
  },
  heroMeta: { fontSize: "0.9rem", color: "rgba(248,246,242,0.6)", margin: 0 },
  scoreBlock: {
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 6,
  },
  scoreNum: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "4.5rem",
    fontWeight: 700,
    lineHeight: 1,
    color: gold,
  },
  scoreLabel: {
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "rgba(248,246,242,0.55)",
  },
  statusBadge: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: "#fff",
    padding: "4px 14px",
    borderRadius: 999,
    textTransform: "uppercase" as const,
  },

  /* Cover (page 1) — centered full-page */
  cover: {
    background: `linear-gradient(165deg, ${plum} 0%, ${plumLight} 100%)`,
    color: ivory,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    padding: 24,
  },
  coverNav: { width: "100%", maxWidth: 860, margin: "0 auto" },
  coverInner: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    maxWidth: 680,
    margin: "0 auto",
    padding: "40px 0",
  },
  coverLogo: {
    width: 132,
    height: "auto",
    marginBottom: 28,
    // The brand PNG is dark plum on a transparent background; recolour it to
    // solid white so the crown + wordmark read clearly on the burgundy cover.
    filter: "brightness(0) invert(1)",
  },
  coverBrand: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.28em",
    color: gold,
    marginBottom: 22,
    textTransform: "uppercase" as const,
  },
  coverTitle: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
    fontWeight: 700,
    lineHeight: 1.25,
    margin: "0 0 22px",
    color: ivory,
  },
  coverMeta: {
    fontSize: "1rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    color: gold,
    margin: "0 0 64px",
  },
  coverScoreBlock: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 8,
  },
  coverScoreNum: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "5rem",
    fontWeight: 700,
    lineHeight: 1,
    color: gold,
  },
  coverScoreLabel: {
    fontSize: "0.8rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: "rgba(248,246,242,0.7)",
  },
  coverBadge: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#fff",
    padding: "6px 22px",
    borderRadius: 999,
    textTransform: "uppercase" as const,
  },
  coverStageMeta: {
    marginTop: 10,
    fontSize: "0.8rem",
    color: "rgba(248,246,242,0.6)",
  },

  /* Thank You (final page) */
  thankYou: {
    background: `linear-gradient(165deg, ${plum} 0%, ${plumLight} 100%)`,
    color: ivory,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  thankYouImg: {
    width: "100%",
    height: "auto",
    maxWidth: 820,
    display: "block",
    margin: "0 auto",
  },
  thankYouInner: {
    maxWidth: 620,
    margin: "0 auto",
    textAlign: "center" as const,
    padding: "40px 0",
  },
  thankYouTitle: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
    fontWeight: 700,
    color: ivory,
    margin: "14px 0 18px",
  },
  thankYouText: {
    fontSize: "1rem",
    lineHeight: 1.7,
    color: "rgba(248,246,242,0.82)",
    margin: 0,
  },
  thankYouDivider: {
    width: 56,
    height: 2,
    background: gold,
    margin: "0 auto 24px",
    borderRadius: 2,
  },
  thankYouBrandLine: {
    marginTop: 28,
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: `${gold}99`,
  },

  /* Brand header (shown above section 01 on screen + in print) */
  brandHeader: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
    gap: 10,
  },
  brandHeaderLogo: {
    height: 48,
    width: "auto",
    display: "block",
  },
  brandHeaderTagline: {
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: gold,
    margin: 0,
  },

  /* Sections */
  section: { maxWidth: 860, margin: "0 auto", padding: "32px 24px 0" },
  sectionHeading: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "clamp(1.2rem, 3vw, 1.7rem)",
    fontWeight: 700,
    color: plum,
    margin: "0 0 20px",
  },
  sectionLede: {
    margin: "0 0 18px",
    fontSize: "0.92rem",
    color: "#555",
    lineHeight: 1.6,
  },
  subHeading: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.15rem",
    fontWeight: 700,
    color: plum,
    margin: "32px 0 14px",
  },

  /* Paid-only banner */
  reportPending: {
    background: "#FFF5DA",
    border: `1px solid ${gold}`,
    borderRadius: 14,
    padding: "18px 22px",
  },
  reportPendingTitle: {
    display: "block",
    color: plum,
    fontSize: "1.05rem",
    marginBottom: 6,
  },
  reportPendingText: {
    margin: 0,
    fontSize: "0.92rem",
    lineHeight: 1.55,
    color: "#5a4a14",
  },
  reportPendingActions: {
    marginTop: 14,
    display: "flex",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  reportPendingBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: plum,
    color: "#fff",
    border: 0,
    borderRadius: 999,
    padding: "10px 22px",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(63,20,73,0.25)",
  },

  /* Stage */
  stageCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "24px 28px",
    border: `1px solid ${gold}44`,
    marginBottom: 28,
    boxShadow: "0 2px 12px rgba(42,15,63,0.05)",
  },
  stageTitle: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.15rem",
    fontWeight: 700,
    color: plum,
    margin: "0 0 8px",
  },
  stageText: { fontSize: "0.9rem", lineHeight: 1.65, color: "#555", margin: 0 },

  /* Radar */
  radarWrap: {
    background: "#fff",
    borderRadius: 14,
    padding: "24px 16px 16px",
    boxShadow: "0 2px 12px rgba(42,15,63,0.05)",
    border: "1px solid #ece8f2",
    marginBottom: 28,
  },
  radarLegend: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    gap: 14,
    marginTop: 8,
  },
  legendDot: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.78rem",
    color: "#5a5a5a",
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    display: "inline-block",
  },

  /* Category grid */
  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 14,
  },
  catCard: {
    background: "#fff",
    borderRadius: 12,
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
    boxShadow: "0 1px 8px rgba(42,15,63,0.05)",
    border: "1px solid #ece8f2",
  },
  catScore: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.8rem",
    fontWeight: 700,
    lineHeight: 1,
  },
  catCardTitle: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#333",
    lineHeight: 1.3,
    marginTop: 2,
  },
  catCardStatus: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    marginTop: 2,
  },

  /* Per-category breakdown */
  breakdownList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
  },
  breakdownCard: {
    background: "#fff",
    borderRadius: 12,
    padding: "18px 22px",
    border: "1px solid #ece8f2",
    boxShadow: "0 1px 8px rgba(42,15,63,0.05)",
  },
  breakdownHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 10,
  },
  breakdownTitle: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: plum,
    margin: "0 0 2px",
  },
  breakdownScore: {
    display: "flex",
    alignItems: "baseline",
    gap: 2,
    flexShrink: 0,
  },
  breakdownScoreNum: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.8rem",
    fontWeight: 700,
    lineHeight: 1,
  },
  breakdownScoreLabel: {
    fontSize: "0.7rem",
    color: "#888",
    letterSpacing: "0.04em",
  },
  breakdownText: {
    margin: "12px 0 0",
    fontSize: "0.88rem",
    lineHeight: 1.6,
    color: "#444",
  },

  /* Score bar */
  barWrap: { margin: "4px 0 6px" },
  barTrack: {
    position: "relative" as const,
    height: 18,
    background: "#f3f1f6",
    borderRadius: 4,
    overflow: "hidden" as const,
  },
  barBand: {
    position: "absolute" as const,
    top: 0,
    bottom: 0,
    height: "100%",
  },
  barFill: {
    position: "absolute" as const,
    top: 2,
    bottom: 2,
    left: 0,
    borderRadius: 3,
    transition: "width 0.4s ease",
  },
  barTick: {
    position: "absolute" as const,
    top: 0,
    bottom: 0,
    width: 1,
    background: "rgba(0,0,0,0.25)",
  },
  barScale: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.66rem",
    color: "#888",
    marginTop: 4,
    padding: "0 1px",
  },

  /* Deep dive */
  deepDiveList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 20,
  },
  deepDive: {
    background: "#fff",
    borderRadius: 14,
    padding: "22px 24px",
    border: "1px solid #ece8f2",
    boxShadow: "0 2px 14px rgba(42,15,63,0.06)",
  },
  deepDiveHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 12,
  },
  deepDiveTitle: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.25rem",
    fontWeight: 700,
    color: plum,
    margin: "0 0 2px",
  },
  deepDiveLede: {
    margin: "14px 0 16px",
    fontSize: "0.92rem",
    lineHeight: 1.65,
    color: "#444",
  },
  contribWrap: {
    background: "#faf8fd",
    border: "1px solid #ece8f2",
    borderRadius: 10,
    padding: "14px 18px",
    marginBottom: 14,
  },
  contribHeading: {
    margin: "0 0 10px",
    fontSize: "0.82rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: plum,
  },
  contribList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  contribItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
    paddingBottom: 8,
    borderBottom: "1px dashed #e4e0ef",
  },
  contribLabel: {
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#888",
    textTransform: "uppercase" as const,
  },
  contribPrompt: {
    fontSize: "0.88rem",
    color: "#333",
    lineHeight: 1.45,
  },
  contribValue: {
    fontSize: "0.8rem",
    color: "#5a5a5a",
  },
  leversGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  leverCard: {
    background: "#fff",
    border: `1px solid ${gold}55`,
    borderLeft: `3px solid ${gold}`,
    borderRadius: 8,
    padding: "12px 14px",
  },
  leverHeading: {
    margin: "0 0 4px",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: plum,
  },
  leverText: { margin: 0, fontSize: "0.85rem", lineHeight: 1.55, color: "#444" },

  /* Area rows (free-tier fallback presentation) */
  areaList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  areaRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "#fff",
    borderRadius: 10,
    padding: "14px 20px",
    border: "1px solid #ece8f2",
  },
  areaTitle: {
    flex: 1,
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#1F1F1F",
  },
  areaScore: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: plum,
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    minWidth: 56,
    textAlign: "right" as const,
  },
  areaStatus: {
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    minWidth: 72,
    textAlign: "right" as const,
  },

  /* Table (free tier 02) */
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 8px rgba(42,15,63,0.05)",
  },
  th: {
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#888",
    padding: "12px 16px",
    borderBottom: "1px solid #ece8f2",
    textAlign: "left" as const,
  },
  td: {
    fontSize: "0.88rem",
    padding: "11px 16px",
    borderBottom: "1px solid #f3f1f6",
    color: "#1F1F1F",
  },
  inlineStatus: {
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },

  /* Affirmations */
  affirmationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  affirmation: {
    margin: 0,
    background: "#fff",
    borderLeft: `3px solid ${gold}`,
    borderRadius: 10,
    padding: "16px 18px",
    fontSize: "0.95rem",
    lineHeight: 1.55,
    color: "#1F1F1F",
    boxShadow: "0 1px 8px rgba(42,15,63,0.05)",
    fontStyle: "italic" as const,
  },

  /* Recommendations */
  recList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },
  recCard: {
    background: "#fff",
    borderRadius: 12,
    padding: "18px 20px",
    border: "1px solid #ece8f2",
    boxShadow: "0 1px 8px rgba(42,15,63,0.05)",
  },
  recName: {
    margin: "0 0 4px",
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: plum,
  },
  recSub: {
    margin: "0 0 10px",
    fontSize: "0.82rem",
    color: plumLight,
    fontWeight: 600,
  },
  recReason: { margin: 0, fontSize: "0.9rem", lineHeight: 1.55, color: "#5a5a5a" },

  /* Products */
  productsIntro: {
    margin: "0 0 18px",
    fontSize: "0.92rem",
    lineHeight: 1.6,
    color: "#444",
    fontStyle: "italic" as const,
  },
  productList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  productCard: {
    display: "flex",
    gap: 14,
    background: "#fff",
    borderRadius: 12,
    padding: "16px 20px",
    border: "1px solid #ece8f2",
    boxShadow: "0 1px 8px rgba(42,15,63,0.05)",
    alignItems: "flex-start",
  },
  productIndex: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.25rem",
    fontWeight: 700,
    color: gold,
    minWidth: 34,
    letterSpacing: "0.02em",
  },
  productText: {
    margin: 0,
    fontSize: "0.93rem",
    lineHeight: 1.55,
    color: "#333",
    flex: 1,
  },

  /* Empty / error */
  emptyNote: {
    background: "#fff",
    border: "1px dashed #d4cfe0",
    borderRadius: 10,
    padding: "16px 20px",
    fontSize: "0.9rem",
    color: "#777",
    margin: "0 0 16px",
  },
  errorNote: {
    background: "#FDF1ED",
    border: "1px solid #E9C5B6",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: "0.85rem",
    color: "#8B3A1B",
    margin: 0,
  },

  /* Upgrade (free tier only) */
  upgradeCard: {
    background: `linear-gradient(160deg, ${plum} 0%, ${plumLight} 100%)`,
    color: ivory,
    borderRadius: 16,
    padding: "28px 32px",
    boxShadow: "0 6px 22px rgba(42,15,63,0.18)",
  },
  upgradeTitle: {
    margin: "0 0 10px",
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.35rem",
    fontWeight: 700,
    color: ivory,
  },
  upgradeText: {
    margin: "0 0 18px",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "rgba(248,246,242,0.85)",
  },
  upgradeBtn: {
    display: "inline-block",
    background: gold,
    color: plum,
    fontWeight: 700,
    letterSpacing: "0.04em",
    padding: "12px 24px",
    borderRadius: 999,
    textDecoration: "none",
  },

  /* P1 — Luxury gift card (paid tier) */
  giftCard: {
    background: `linear-gradient(160deg, ${gold}25 0%, ${ivory} 100%)`,
    border: `1px solid ${gold}`,
    borderRadius: 16,
    padding: "26px 30px",
    boxShadow: "0 3px 16px rgba(216,167,56,0.16)",
  },
  giftEyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.18em",
    color: gold,
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: 8,
  },
  giftTitle: {
    margin: "0 0 8px",
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.4rem",
    fontWeight: 700,
    color: plum,
  },
  giftText: {
    margin: "0 0 18px",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "#4a4a4a",
  },
  giftForm: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  giftInput: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "0.95rem",
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    color: "#1F1F1F",
    background: "#fff",
    border: "1px solid #ddd5e2",
    borderRadius: 10,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  giftTextarea: {
    width: "100%",
    minHeight: 60,
    padding: "12px 16px",
    fontSize: "0.92rem",
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    lineHeight: 1.5,
    color: "#1F1F1F",
    background: "#fff",
    border: "1px solid #ddd5e2",
    borderRadius: 10,
    resize: "vertical" as const,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  giftBtn: {
    background: gold,
    color: plum,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.98rem",
    fontWeight: 800,
    letterSpacing: "0.04em",
    padding: "12px 22px",
    borderRadius: 999,
    border: `1px solid ${gold}`,
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  giftBtnDisabled: {
    background: `${gold}66`,
    color: plum,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.98rem",
    fontWeight: 800,
    letterSpacing: "0.04em",
    padding: "12px 22px",
    borderRadius: 999,
    border: `1px solid ${gold}66`,
    cursor: "not-allowed",
    alignSelf: "flex-start",
  },
  giftError: {
    margin: "10px 0 0",
    fontSize: "0.85rem",
    color: "#C0392B",
  },
  giftThanks: {
    background: `linear-gradient(160deg, ${gold}30 0%, ${ivory} 100%)`,
    border: `1px solid ${gold}`,
    borderRadius: 14,
    padding: "20px 24px",
    color: plum,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.98rem",
    fontWeight: 600,
    fontStyle: "italic" as const,
  },

  /* F5 — Refer-a-friend card (free tier) */
  referCard: {
    background: "#fff",
    border: `1px solid ${gold}55`,
    borderRadius: 16,
    padding: "26px 30px",
    boxShadow: "0 2px 14px rgba(63,20,73,0.06)",
  },
  referEyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.18em",
    color: gold,
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: 8,
  },
  referTitle: {
    margin: "0 0 8px",
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: plum,
  },
  referText: {
    margin: "0 0 16px",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "#4a4a4a",
  },
  referForm: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 10,
    alignItems: "stretch",
  },
  referInput: {
    flex: "1 1 200px",
    minWidth: 0,
    padding: "10px 14px",
    fontSize: "0.95rem",
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    color: "#1F1F1F",
    background: "#fff",
    border: "1px solid #ddd5e2",
    borderRadius: 10,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  referBtn: {
    background: plum,
    color: ivory,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.92rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    padding: "10px 22px",
    borderRadius: 999,
    border: `1px solid ${plum}`,
    cursor: "pointer",
    flex: "0 0 auto",
  },
  referBtnDisabled: {
    background: "rgba(63,20,73,0.3)",
    color: ivory,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.92rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    padding: "10px 22px",
    borderRadius: 999,
    border: "1px solid rgba(63,20,73,0.3)",
    cursor: "not-allowed",
    flex: "0 0 auto",
  },
  referError: {
    margin: "10px 0 0",
    fontSize: "0.85rem",
    color: "#C0392B",
  },
  referThanks: {
    background: `${gold}1a`,
    border: `1px solid ${gold}66`,
    borderRadius: 14,
    padding: "20px 24px",
    color: plum,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.98rem",
    fontWeight: 600,
    fontStyle: "italic" as const,
  },

  /* F7 — Per-section friendly feedback box */
  feedbackBox: {
    marginTop: 28,
    padding: "20px 22px",
    borderRadius: 14,
    background: "rgba(63,20,73,0.04)",
    border: "1px solid #ece8f2",
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  feedbackLabel: {
    fontSize: "0.92rem",
    fontWeight: 600,
    color: plum,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    lineHeight: 1.4,
  },
  feedbackTextarea: {
    width: "100%",
    minHeight: 70,
    padding: "10px 12px",
    fontSize: "0.92rem",
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    lineHeight: 1.5,
    color: "#1F1F1F",
    background: "#fff",
    border: "1px solid #ddd5e2",
    borderRadius: 10,
    resize: "vertical" as const,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  feedbackActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  feedbackBtn: {
    background: plum,
    color: ivory,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    padding: "8px 18px",
    borderRadius: 999,
    border: `1px solid ${plum}`,
    cursor: "pointer",
  },
  feedbackBtnDisabled: {
    background: "rgba(63,20,73,0.3)",
    color: ivory,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    padding: "8px 18px",
    borderRadius: 999,
    border: "1px solid rgba(63,20,73,0.3)",
    cursor: "not-allowed",
  },
  feedbackError: {
    fontSize: "0.82rem",
    color: "#C0392B",
  },
  feedbackThanks: {
    marginTop: 28,
    padding: "16px 20px",
    borderRadius: 14,
    background: `${gold}1a`,
    border: `1px solid ${gold}66`,
    color: plum,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.95rem",
    fontWeight: 600,
    fontStyle: "italic" as const,
  },

  /* F6 — Download free .docx report (free tier only) */
  downloadCard: {
    background: "#fff",
    border: `1px solid ${gold}55`,
    borderRadius: 16,
    padding: "26px 30px",
    boxShadow: "0 2px 14px rgba(63,20,73,0.06)",
  },
  downloadTitle: {
    margin: "0 0 8px",
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: plum,
  },
  downloadText: {
    margin: "0 0 18px",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "#4a4a4a",
  },
  downloadBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: plum,
    color: ivory,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.95rem",
    fontWeight: 700,
    letterSpacing: "0.03em",
    padding: "12px 22px",
    borderRadius: 999,
    border: `1px solid ${plum}`,
    cursor: "pointer",
    textDecoration: "none",
  },
  downloadBtnDisabled: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(63,20,73,0.4)",
    color: ivory,
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.95rem",
    fontWeight: 700,
    letterSpacing: "0.03em",
    padding: "12px 22px",
    borderRadius: 999,
    border: "1px solid rgba(63,20,73,0.4)",
    cursor: "wait",
  },
  downloadError: {
    marginTop: 12,
    fontSize: "0.85rem",
    color: "#C0392B",
    margin: "12px 0 0",
  },

  /* Next steps */
  nextSteps: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  stepCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    background: "#fff",
    borderRadius: 10,
    padding: "16px 20px",
    border: "1px solid #ece8f2",
  },
  stepNum: {
    flexShrink: 0,
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: plumLight,
    color: "#fff",
    fontSize: "0.8rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: "0.9rem", lineHeight: 1.55, color: "#333", margin: 0 },
  stepBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    minWidth: 0,
  },
  stepLink: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: plumLight,
    textDecoration: "none",
    alignSelf: "flex-start",
    borderBottom: `1px solid ${gold}`,
    paddingBottom: 1,
  },

  /* CTA */
  ctaSection: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "40px 24px 80px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 20,
  },
  ctaRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap" as const,
  },
  printBtn: {
    padding: "14px 28px",
    borderRadius: 10,
    border: `1px solid #d4cfe0`,
    background: "#fff",
    color: plum,
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  retakeBtn: {
    padding: "14px 28px",
    borderRadius: 10,
    border: "none",
    background: plumLight,
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },

  /* HIS — MHT overlay banner */
  mhtBanner: {
    background: `${gold}1a`,
    border: `1px solid ${gold}66`,
    borderRadius: 14,
    padding: "16px 22px",
    color: plum,
  },
  mhtBannerTitle: {
    display: "block",
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1rem",
    fontWeight: 700,
    marginBottom: 6,
  },
  mhtBannerText: {
    margin: 0,
    fontSize: "0.92rem",
    lineHeight: 1.55,
    color: "#4a4a4a",
  },

  /* HIS — Clinical flags */
  scoreStageMeta: {
    marginTop: 6,
    fontSize: "0.78rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "rgba(248,246,242,0.7)",
  },
  flagsList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 18,
  },
  flagGroupUrgent: {
    background: "#fff",
    border: "1px solid #E5B5B0",
    borderLeft: "5px solid #A32D2D",
    borderRadius: 12,
    padding: "18px 22px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  flagGroupTitleUrgent: {
    margin: 0,
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#A32D2D",
  },
  flagGroupRecommended: {
    background: "#fff",
    border: "1px solid #E5D2B0",
    borderLeft: `5px solid ${gold}`,
    borderRadius: 12,
    padding: "18px 22px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  flagGroupTitleRecommended: {
    margin: 0,
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#8A6A1F",
  },
  flagGroupDomain: {
    background: "#fff",
    border: "1px solid #d4cfe0",
    borderLeft: `5px solid ${plumLight}`,
    borderRadius: 12,
    padding: "18px 22px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  flagGroupTitleDomain: {
    margin: 0,
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.05rem",
    fontWeight: 700,
    color: plum,
  },
  flagItem: {
    background: "rgba(63,20,73,0.03)",
    borderRadius: 8,
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  flagItemHead: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap" as const,
  },
  flagItemQ: {
    fontFamily: "'Avenir', 'Avenir Next', 'Nunito Sans', sans-serif",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: plum,
    background: `${gold}33`,
    padding: "2px 8px",
    borderRadius: 999,
  },
  flagItemLabel: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: plum,
  },
  flagItemRaw: {
    fontSize: "0.78rem",
    color: "#6a6173",
    marginLeft: "auto",
  },
  flagItemDomain: {
    fontSize: "0.78rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "#6a6173",
  },
  flagItemText: {
    margin: 0,
    fontSize: "0.92rem",
    lineHeight: 1.55,
    color: "#3a3543",
  },
  flagComposite: {
    background: "#A32D2D",
    color: "#fff",
    borderRadius: 12,
    padding: "18px 22px",
  },
  flagCompositeTitle: {
    display: "block",
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "1.05rem",
    fontWeight: 700,
    marginBottom: 6,
  },
  flagCompositeText: {
    margin: 0,
    fontSize: "0.92rem",
    lineHeight: 1.55,
  },
  hisNarrative: {
    background: `linear-gradient(160deg, ${plum}06 0%, ${gold}10 100%)`,
    border: `1px solid ${gold}33`,
    borderRadius: 12,
    padding: "18px 22px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  hisNarrativeP: {
    margin: 0,
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "#3a3543",
    whiteSpace: "pre-wrap" as const,
  },

  /* ───── Pricing block (replaces former luxury gift section) ───── */
  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
    marginTop: 8,
  },
  pricingCardFree: {
    position: "relative" as const,
    background: "#fff",
    border: "1px solid #e2dceb",
    borderRadius: 16,
    padding: "26px 24px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
  },
  pricingCardPaid: {
    position: "relative" as const,
    background: `linear-gradient(160deg, ${plum}08 0%, ${gold}12 100%)`,
    border: `2px solid ${gold}`,
    borderRadius: 16,
    padding: "26px 24px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
    boxShadow: `0 8px 28px ${plum}1a`,
  },
  pricingRecommended: {
    position: "absolute" as const,
    top: -12,
    right: 18,
    background: gold,
    color: plum,
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    padding: "5px 12px",
    borderRadius: 999,
  },
  pricingTier: {
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: plum,
  },
  pricingPriceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
  },
  pricingPrice: {
    fontFamily: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
    fontSize: "2.4rem",
    fontWeight: 700,
    color: plum,
    lineHeight: 1,
  },
  pricingPriceUnit: {
    fontSize: "0.9rem",
    color: "#5a5a5a",
  },
  pricingFeatures: {
    listStyle: "none" as const,
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },
  pricingFeatureItem: {
    fontSize: "0.9rem",
    lineHeight: 1.5,
    color: "#3a3543",
    paddingLeft: 18,
    position: "relative" as const,
  },
  pricingBtnFree: {
    marginTop: 6,
    display: "inline-block" as const,
    textAlign: "center" as const,
    background: "#fff",
    color: plum,
    border: `1px solid ${plum}`,
    borderRadius: 10,
    padding: "12px 18px",
    fontSize: "0.92rem",
    fontWeight: 600,
    textDecoration: "none" as const,
  },
  pricingBtnPaid: {
    marginTop: 6,
    display: "inline-block" as const,
    textAlign: "center" as const,
    background: plum,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 18px",
    fontSize: "0.95rem",
    fontWeight: 700,
    textDecoration: "none" as const,
    boxShadow: `0 6px 16px ${plum}33`,
  },
}
