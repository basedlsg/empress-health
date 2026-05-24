/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   EMPRESS HEALTH — HEALTH INTELLIGENCE SCORE (HIS) ENGINE — TS PORT      ║
 * ║   v1.0 — Biostatistics & Data Science Division                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Faithful TypeScript port of empress_his_engine.py. The integer HIS value
 * and every domain score, flag, and band label MUST match the Python
 * reference for identical inputs. Drift is a bug — see scripts/test-his-engine.mjs.
 *
 * REGULATORY NOTICE
 * ─────────────────
 * Produces wellness assessment outputs ONLY. No output constitutes medical
 * diagnosis, clinical assessment, or treatment recommendation.
 * Classification: General Wellness Tool per 21 CFR §880.6310.
 *
 * SCORING ARCHITECTURE
 * ────────────────────
 *   Item scale     : 0–10 (0 = maximum severity, 10 = no symptom)  ← flipped 2026-05-15
 *   Scoring rule   : Items used directly — no reverse-scoring (slider is already
 *                    wellness-aligned). `reverseScore()` is kept as identity for
 *                    backward compatibility with any external callers.
 *   Domain formula : DS_d = [Σ raw_i / (n_d × 10)] × 100   → 0–100
 *   Composite      : HIS = max(1, round(Σ (w_d,stage / 100) × DS_d))  → 1–100
 *   Stage routing  : Driven by the paid intake staging question (1/2/3)
 *
 *   PRE-2026-05-15 NOTE: the slider previously emitted 0 = no symptom / 10 =
 *   severe, and every item was reverse-scored as `10 − raw` so wellness ran
 *   high. After the slider direction was flipped to match the FreeMiniAssessment
 *   convention, the reverse-scoring step was removed (it would now double-invert)
 *   and the item-flag thresholds were inverted from `>= 8` to `<= 2`.
 *
 * DOMAIN ARCHITECTURE (10 domains, 120 items)
 * ───────────────────────────────────────────
 *   D01  Vasomotor & Temperature           Q1–Q12    12 items
 *   D02  Sleep Architecture & Cortisol     Q13–Q23   11 items  ← unequal (normalised)
 *   D03  Cognitive Function & Brain Health Q24–Q35   12 items
 *   D04  Mood, Anxiety & Emotional Health  Q36–Q48   13 items  ← unequal (normalised)
 *   D05  Metabolic Health & Body Comp.     Q49–Q60   12 items
 *   D06  Skin, Hair & Nails                Q61–Q72   12 items
 *   D07  Musculoskeletal & Bone Health     Q73–Q84   12 items
 *   D08  Genitourinary & Sexual Health     Q85–Q96   12 items
 *   D09  Cardiovascular & Whole-Body Energy Q97–Q108  12 items
 *   D10  Lifestyle, Gut Health & Nutrition Q109–Q120 12 items
 */

import type {
  MenopauseStage,
  HISResult,
  HISBandLabel,
  DomainBandLabel,
  ItemFlag,
  DomainFlag,
  FlagPriority,
  ResponseMap,
} from "./assessmentTypes"

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Range generator: [start, end) inclusive of start, exclusive of end. */
function range(start: number, end: number): number[] {
  const out: number[] = []
  for (let i = start; i < end; i += 1) out.push(i)
  return out
}

type DomainConfig = {
  name: string
  items: number[]
  n: number
}

/** Domain metadata: id → { name, items, n }. */
export const DOMAIN_CONFIG: Record<number, DomainConfig> = {
  1:  { name: "Vasomotor & Temperature",              items: range(1,   13),  n: 12 },
  2:  { name: "Sleep Architecture & Cortisol",        items: range(13,  24),  n: 11 },
  3:  { name: "Cognitive Function & Brain Health",    items: range(24,  36),  n: 12 },
  4:  { name: "Mood, Anxiety & Emotional Health",     items: range(36,  49),  n: 13 },
  5:  { name: "Metabolic Health & Body Composition",  items: range(49,  61),  n: 12 },
  6:  { name: "Skin, Hair & Nails",                   items: range(61,  73),  n: 12 },
  7:  { name: "Musculoskeletal & Bone Health",        items: range(73,  85),  n: 12 },
  8:  { name: "Genitourinary & Sexual Health",        items: range(85,  97),  n: 12 },
  9:  { name: "Cardiovascular & Whole-Body Energy",   items: range(97,  109), n: 12 },
  10: { name: "Lifestyle, Gut Health & Nutrition",    items: range(109, 121), n: 12 },
}

/** Stage-specific domain weight matrices (each row sums to 100). */
export const DOMAIN_WEIGHTS: Record<MenopauseStage, Record<number, number>> = {
  perimenopause:  { 1: 12, 2: 14, 3: 12, 4: 14, 5: 10, 6: 6, 7:  8, 8:  8, 9: 10, 10: 6 },
  menopause:      { 1: 16, 2: 14, 3: 12, 4: 12, 5: 12, 6: 5, 7:  8, 8: 10, 9:  9, 10: 2 },
  post_menopause: { 1:  8, 2: 10, 3: 14, 4: 10, 5: 14, 6: 5, 7: 14, 8: 12, 9: 11, 10: 2 },
}

/** Map from the staging intake answer (1 / 2 / 3) to the stage key. */
export const STAGE_MAPPING: Record<1 | 2 | 3, MenopauseStage> = {
  1: "perimenopause",
  2: "menopause",
  3: "post_menopause",
}

/**
 * Item-level clinical flag definitions: q_num → [threshold, priority, referralText].
 * A flag fires when the RAW response <= threshold, BEFORE composite computation.
 * Independence from HIS: a flag still fires even when overall HIS is high.
 *
 * 2026-05-15: thresholds inverted from `>= 8` to `<= 2` to match the flipped
 * slider direction. Threshold value 2 means "fires when the user answered
 * 0, 1, or 2" — i.e. the worst-symptom end of the new slider. The threshold
 * field is kept on the data row (instead of folded into the comparison) so
 * the value is editable per-question if the clinical team later wants
 * per-item severity tuning.
 */
export const CLINICAL_FLAGS: Record<
  number,
  { threshold: number; priority: FlagPriority; referralText: string }
> = {
  2:   { threshold: 2, priority: "RECOMMENDED", referralText: "Disabling vasomotor symptoms — evaluate for MHT or non-hormonal pharmacotherapy (fezolinetant, SSRIs/SNRIs)" },
  41:  { threshold: 2, priority: "URGENT",      referralText: "Severe depressive episodes — immediate mental health referral; PHQ-9 to be administered by licensed clinician" },
  43:  { threshold: 2, priority: "URGENT",      referralText: "Frequent panic attacks — psychiatric or psychological evaluation required" },
  48:  { threshold: 2, priority: "RECOMMENDED", referralText: "Profound identity disconnection — mental health professional support strongly recommended" },
  57:  { threshold: 2, priority: "RECOMMENDED", referralText: "Waist circumference >4 inch increase — metabolic syndrome screening: fasting glucose, HbA1c, fasting lipids" },
  63:  { threshold: 2, priority: "RECOMMENDED", referralText: "Lateral eyebrow thinning — thyroid function panel (TSH, free T4) to exclude hypothyroidism" },
  82:  { threshold: 2, priority: "RECOMMENDED", referralText: "Perceived physical frailty — functional mobility assessment and DEXA bone density scan referral" },
  83:  { threshold: 2, priority: "RECOMMENDED", referralText: "Height/posture loss — DEXA bone density scan and vertebral fracture assessment recommended" },
  84:  { threshold: 2, priority: "RECOMMENDED", referralText: "High fracture concern — FRAX 10-year risk calculation, DEXA referral; discuss bisphosphonate eligibility" },
  86:  { threshold: 2, priority: "URGENT",      referralText: "Intercourse not possible due to pain — GSM (genitourinary syndrome of menopause) pathway; vaginal estrogen or ospemifene evaluation" },
  93:  { threshold: 2, priority: "RECOMMENDED", referralText: "Severe stress incontinence — pelvic floor physiotherapy and urogynecology referral" },
  99:  { threshold: 2, priority: "URGENT",      referralText: "Daily palpitations — 12-lead ECG and 24-hour Holter monitoring; cardiology referral" },
  104: { threshold: 2, priority: "URGENT",      referralText: "Unexplained dyspnea — cardiac workup (echocardiogram, exercise stress test) and pulmonary evaluation (spirometry)" },
  105: { threshold: 2, priority: "URGENT",      referralText: "Abnormal cardiac response to exercise — exercise stress test and cardiology evaluation required" },
  107: { threshold: 2, priority: "RECOMMENDED", referralText: "Autonomic BP/flushing swings — 24-hour ambulatory blood pressure monitoring; cardiology review" },
}

/** Domains that get an MHT overlay note when the user reports current hormone therapy. */
export const MHT_SENSITIVE_DOMAINS: readonly number[] = [1, 8]

/** Domain-level flag threshold: DS ≤ this triggers a mandatory clinical referral note. */
export const DOMAIN_FLAG_THRESHOLD = 20.0

/** Composite critical threshold: HIS ≤ this triggers mandatory escalation language. */
export const COMPOSITE_CRITICAL_THRESHOLD = 39

/** Composite score interpretation bands. Order matters — first matching range wins. */
export const SCORE_BANDS: Array<{
  low: number
  high: number
  label: HISBandLabel
  color: string
}> = [
  { low: 85, high: 100, label: "Thriving",    color: "#1D9E75" },
  { low: 70, high:  84, label: "Flourishing", color: "#639922" },
  { low: 55, high:  69, label: "Managing",    color: "#EF9F27" },
  { low: 40, high:  54, label: "Struggling",  color: "#D85A30" },
  { low:  0, high:  39, label: "Critical",    color: "#A32D2D" },
]

/** Domain-level interpretation bands. */
export const DOMAIN_BANDS: Array<{ low: number; high: number; label: DomainBandLabel }> = [
  { low: 70, high: 100, label: "High" },
  { low: 35, high:  69, label: "Moderate" },
  { low:  0, high:  34, label: "Low" },
]

/** Q1–Q120 short labels for flag rendering and audit logs. */
export const QUESTION_LABELS: Record<number, string> = {
  1: "Hot flash frequency", 2: "Hot flash severity", 3: "Night sweat frequency",
  4: "Hot flash duration", 5: "Palpitations during flashes", 6: "Chills after flash",
  7: "Cold hands & feet", 8: "Heat intolerance", 9: "Alcohol as flash trigger",
  10: "Stress-triggered flashes", 11: "Caffeine as flash trigger", 12: "Facial flushing",
  13: "Sleep onset latency", 14: "Night wakings frequency", 15: "2–4am waking pattern",
  16: "Wired-but-tired paradox", 17: "Sleep satisfaction on waking", 18: "Morning body lag",
  19: "Dream intensity & nightmares", 20: "Restless legs at night",
  21: "Sleep environment sensitivity", 22: "Daytime sleepiness", 23: "Nap dependency",
  24: "Word-finding difficulty", 25: "Short-term memory lapses", 26: "Concentration span",
  27: "Mental processing speed", 28: "Spatial memory loss", 29: "Multi-tasking capacity",
  30: "Decision fatigue", 31: "Reading re-reading", 32: "Mental clarity on waking",
  33: "Number & calculation difficulty", 34: "Professional confidence decline",
  35: "Mental endurance",
  36: "Baseline anxiety level", 37: "Feeling of dread or doom", 38: "Irritability threshold",
  39: "Rage episodes", 40: "Emotional volatility", 41: "Depressive episodes",
  42: "Emotional numbness", 43: "Panic attacks", 44: "Afternoon low / flat spell",
  45: "Loss of motivation / drive", 46: "Crying easily / tearfulness",
  47: "Social withdrawal", 48: "Identity disconnection",
  49: "Unexplained weight gain", 50: "Abdominal bloating", 51: "Sugar & carb cravings",
  52: "Loss of muscle tone", 53: "Inability to lose weight", 54: "Energy crashes after eating",
  55: "Fluid retention / puffiness", 56: "Increased hunger", 57: "Waist circumference change",
  58: "Exercise intolerance", 59: "Afternoon energy collapse", 60: "Perceived metabolic slowdown",
  61: "Hair shedding / thinning", 62: "Hair texture change", 63: "Eyebrow thinning",
  64: "Skin dryness", 65: "Loss of skin elasticity", 66: "Thin / crepey skin",
  67: "Adult acne / breakouts", 68: "Facial hair growth", 69: "Nail brittleness",
  70: "Bruising / skin fragility", 71: "Wound healing slowdown", 72: "Itching / crawling skin",
  73: "Joint pain / stiffness", 74: "Morning stiffness duration", 75: "Muscle aches / heaviness",
  76: "Loss of strength", 77: "Exercise recovery pain", 78: "Foot / heel pain",
  79: "Shoulder / neck tension", 80: "Lower back / hip pain", 81: "Grip strength decline",
  82: "Body frailty feeling", 83: "Height / posture change", 84: "Fear of future fracture",
  85: "Vaginal dryness", 86: "Pain with intercourse", 87: "Loss of libido",
  88: "Reduced arousal response", 89: "Orgasm changes", 90: "Bladder urgency",
  91: "Urinary frequency", 92: "Recurrent UTIs / irritation", 93: "Stress incontinence",
  94: "Nocturia", 95: "Genital discomfort / irritation", 96: "Impact on relationships / self-image",
  97: "Baseline energy level", 98: "Stairs / exertion tolerance", 99: "Heart palpitations",
  100: "Dizziness / lightheadedness", 101: "Afternoon energy drop",
  102: "Exhaustion despite rest", 103: "Body battery recovery",
  104: "Shortness of breath awareness", 105: "Exercise heart rate response",
  106: "Heavy limbs / body drag", 107: "BP / flushing swings", 108: "Capacity for full day",
  109: "Alcohol tolerance decline", 110: "Hangover / recovery intensity",
  111: "Bloated after healthy meals", 112: "Digestive slowdown / constipation",
  113: "Food sensitivity escalation", 114: "Stress recovery time",
  115: "Morning recovery feeling", 116: "Caffeine tolerance change",
  117: "Hydration / electrolyte dependence", 118: "Resilience to busy days",
  119: "Overall system inflammation", 120: "Loss of physiologic resilience",
}

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP VALIDATION (runs once at module load — fails fast on misconfiguration)
// ═══════════════════════════════════════════════════════════════════════════

function validateConfig(): void {
  // Weight sums per stage
  for (const stage of Object.keys(DOMAIN_WEIGHTS) as MenopauseStage[]) {
    const weights = DOMAIN_WEIGHTS[stage]
    const total = Object.values(weights).reduce((a, b) => a + b, 0)
    if (total !== 100) {
      throw new Error(`Weight sum error: ${stage} sums to ${total}, must be 100`)
    }
    const wKeys = Object.keys(weights).map(Number).sort((a, b) => a - b)
    const dKeys = Object.keys(DOMAIN_CONFIG).map(Number).sort((a, b) => a - b)
    if (wKeys.length !== dKeys.length || wKeys.some((k, i) => k !== dKeys[i])) {
      throw new Error(`Weight domain keys mismatch for ${stage}`)
    }
  }

  // Item count must be exactly Q1..Q120 contiguous
  const all: number[] = []
  for (const cfg of Object.values(DOMAIN_CONFIG)) all.push(...cfg.items)
  if (all.length !== 120) {
    throw new Error(`Item count error: ${all.length} items, expected 120`)
  }
  if (new Set(all).size !== 120) {
    throw new Error("Duplicate question numbers in domain config")
  }
  for (let i = 1; i <= 120; i += 1) {
    if (!all.includes(i)) throw new Error(`Question Q${i} missing from domain config`)
  }

  // Every flag item must be a known question
  for (const qStr of Object.keys(CLINICAL_FLAGS)) {
    const q = Number(qStr)
    if (!QUESTION_LABELS[q]) throw new Error(`Flag item Q${q} not found in question labels`)
  }
}

validateConfig()

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Identity passthrough (was reverse-scoring before 2026-05-15).
 *
 * All 120 items are wellness scales where:
 *     0 = maximum severity / worst state
 *    10 = no symptom / best state                ← flipped 2026-05-15
 *
 * HIS direction: higher score = better wellness. Since the slider now emits
 * values already in the wellness direction, no transformation is needed.
 * This function is retained (and returns `raw` unchanged) so external callers
 * — including the Python reference parity tests — keep working without
 * having to plumb a new function name through their pipelines.
 *
 * The input validation is preserved: any value outside [0, 10] is still a bug.
 */
export function reverseScore(raw: number): number {
  if (!Number.isInteger(raw) || raw < 0 || raw > 10) {
    throw new RangeError(`Raw response must be an integer in [0, 10]. Received: ${raw}`)
  }
  return raw
}

/** Return the domain ID for a given question number. */
export function getItemDomain(qNum: number): number {
  for (const [dIdStr, cfg] of Object.entries(DOMAIN_CONFIG)) {
    if (cfg.items.includes(qNum)) return Number(dIdStr)
  }
  throw new RangeError(`Question Q${qNum} not found in any domain`)
}

/** Return the composite score band metadata for a numeric score. */
export function getScoreBand(score: number): { label: HISBandLabel; color: string } {
  for (const row of SCORE_BANDS) {
    if (score >= row.low && score <= row.high) {
      return { label: row.label, color: row.color }
    }
  }
  return { label: "Incomplete", color: "#888888" }
}

/** Return the domain-level band label for a 0–100 score. */
export function getDomainBand(score: number): DomainBandLabel {
  for (const row of DOMAIN_BANDS) {
    if (score >= row.low && score <= row.high) return row.label
  }
  return "Excluded"
}

// ═══════════════════════════════════════════════════════════════════════════
// MISSING DATA HANDLER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Empress missing-data protocol applied within a single domain:
 *   0 missing   → return as-is
 *   1–2 missing → mean-impute from completed items (rounded to integer)
 *   3+ missing  → return null (domain excluded from composite)
 *
 * Imputation is applied to RAW values, before reverse-scoring, matching the
 * Python reference. Note: Python's `round()` uses banker's rounding; we use
 * the same convention to match output exactly.
 */
function bankerRound(x: number): number {
  // Python's built-in round() rounds half-to-even ("banker's rounding"):
  //   round(0.5)  == 0, round(1.5) == 2, round(2.5) == 2, round(-0.5) == 0
  const floor = Math.floor(x)
  const diff = x - floor
  if (diff < 0.5) return floor
  if (diff > 0.5) return floor + 1
  // Exactly 0.5 → round to even
  return floor % 2 === 0 ? floor : floor + 1
}

export function handleMissingItems(
  domainResponses: Record<number, number | null | undefined>,
): Record<number, number> | null {
  const entries = Object.entries(domainResponses).map(
    ([k, v]) => [Number(k), v ?? null] as [number, number | null],
  )
  const missingCount = entries.filter(([, v]) => v === null).length

  if (missingCount === 0) {
    const out: Record<number, number> = {}
    for (const [q, v] of entries) out[q] = v as number
    return out
  }

  if (missingCount >= 3) return null

  // Mean imputation: integer-round mean of the answered raw values
  const completed = entries.filter(([, v]) => v !== null).map(([, v]) => v as number)
  const imputed = bankerRound(completed.reduce((a, b) => a + b, 0) / completed.length)

  const out: Record<number, number> = {}
  for (const [q, v] of entries) out[q] = v === null ? imputed : v
  return out
}

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN SCORE COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute normalised domain score DS_d on a 0–100 scale.
 *
 *     DS_d = [ Σ raw_i / (n_d × 10) ] × 100        (slider is wellness-aligned)
 *
 * Pre-2026-05-15: this formula was `Σ(10 - raw_i)` because the old slider
 * emitted 0=no-symptom / 10=severe. After the slider flip, raw values are
 * already in the wellness direction so `reverseScore()` collapses to identity
 * and the visible math is the simple sum.
 *
 * Returns null when the domain is excluded due to ≥3 missing items.
 */
export function computeDomainScore(
  domainId: number,
  fullResponses: Record<number, number | null | undefined>,
): number | null {
  const cfg = DOMAIN_CONFIG[domainId]
  if (!cfg) throw new RangeError(`Unknown domain id ${domainId}`)

  const domainResps: Record<number, number | null | undefined> = {}
  for (const q of cfg.items) domainResps[q] = fullResponses[q] ?? null

  const imputed = handleMissingItems(domainResps)
  if (imputed === null) return null

  let reversedSum = 0
  for (const v of Object.values(imputed)) reversedSum += reverseScore(v)

  // Round to 2 decimal places to match Python's `round(x, 2)` (which is
  // also banker's, but for 2dp the float error rarely lands on a tie).
  const ds = (reversedSum / (cfg.n * 10)) * 100
  return Math.round(ds * 100) / 100
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSITE HIS COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute composite Health Intelligence Score (HIS).
 *
 *     HIS = max(1, round( Σ_{d=1..10} (w_{d,stage} / 100) × DS_d ))
 *
 * Excluded domains have their weights renormalised proportionally across the
 * surviving domains so the effective weights still sum to 100. If ≥ 3 domains
 * are excluded, HIS cannot be computed reliably and null is returned.
 */
export function computeHis(
  domainScores: Record<number, number | null>,
  stage: MenopauseStage,
): { his: number | null; effectiveWeights: Record<number, number> } {
  const baseWeights = DOMAIN_WEIGHTS[stage]
  if (!baseWeights) {
    throw new RangeError(`Unknown stage: ${stage}`)
  }

  const valid: Record<number, number> = {}
  const excluded: number[] = []
  for (const [dStr, s] of Object.entries(domainScores)) {
    const d = Number(dStr)
    if (s === null) excluded.push(d)
    else valid[d] = s
  }

  if (excluded.length >= 3) {
    return { his: null, effectiveWeights: {} }
  }

  let effectiveWeights: Record<number, number>
  if (excluded.length > 0) {
    const totalValidWeight = Object.keys(valid)
      .map((d) => baseWeights[Number(d)])
      .reduce((a, b) => a + b, 0)
    effectiveWeights = {}
    for (const dStr of Object.keys(valid)) {
      const d = Number(dStr)
      effectiveWeights[d] = Math.round((baseWeights[d] / totalValidWeight) * 100 * 10000) / 10000
    }
  } else {
    effectiveWeights = {}
    for (const [dStr, w] of Object.entries(baseWeights)) {
      effectiveWeights[Number(dStr)] = w
    }
  }

  let weightedSum = 0
  for (const [dStr, score] of Object.entries(valid)) {
    weightedSum += (effectiveWeights[Number(dStr)] / 100) * score
  }

  const his = Math.max(1, Math.min(100, bankerRound(weightedSum)))
  return { his, effectiveWeights }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLINICAL FLAG DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect item-level clinical flags. Fires when a raw response on a flagged
 * item meets or exceeds the item-specific threshold. Applied BEFORE composite
 * computation. A flag fires even if the overall HIS is high.
 *
 * Sorted URGENT before RECOMMENDED, then by question number ascending —
 * matching the Python reference's sort key.
 */
export function detectItemFlags(
  responses: Record<number, number | null | undefined>,
): ItemFlag[] {
  const out: ItemFlag[] = []
  for (const [qStr, spec] of Object.entries(CLINICAL_FLAGS)) {
    const q = Number(qStr)
    const raw = responses[q]
    if (raw !== null && raw !== undefined && raw <= spec.threshold) {
      const dId = getItemDomain(q)
      out.push({
        question: q,
        label: QUESTION_LABELS[q],
        rawScore: raw,
        domainId: dId,
        domainName: DOMAIN_CONFIG[dId].name,
        priority: spec.priority,
        referralText: spec.referralText,
      })
    }
  }
  out.sort((a, b) => {
    const pa = a.priority === "URGENT" ? 0 : 1
    const pb = b.priority === "URGENT" ? 0 : 1
    if (pa !== pb) return pa - pb
    return a.question - b.question
  })
  return out
}

/**
 * Detect domain-level clinical flags: DS_d ≤ DOMAIN_FLAG_THRESHOLD (20.0).
 * A domain score at this level represents severe symptom burden across the
 * entire clinical area — equivalent to an average raw severity of ≥ 8 per item.
 */
export function detectDomainFlags(
  domainScores: Record<number, number | null>,
): DomainFlag[] {
  const out: DomainFlag[] = []
  for (const [dStr, score] of Object.entries(domainScores)) {
    if (score === null) continue
    if (score <= DOMAIN_FLAG_THRESHOLD) {
      const d = Number(dStr)
      out.push({
        domainId: d,
        domainName: DOMAIN_CONFIG[d].name,
        domainScore: Math.round(score * 10) / 10,
        message:
          `Domain score ${score.toFixed(1)}/100 at or below the severe-burden ` +
          `threshold of ${DOMAIN_FLAG_THRESHOLD.toFixed(1)}. This clinical area requires ` +
          `professional evaluation.`,
      })
    }
  }
  return out
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════════════

export type RunAssessmentInput = {
  /** Q1..Q120 → raw value (0–10) or null for missing. Omitted keys treated as null. */
  responses: ResponseMap | Record<number, number | null | undefined>
  /** Staging intake answer: 1 = peri, 2 = meno, 3 = post. */
  stagingResponse: 1 | 2 | 3
  /** True if the user is currently on MHT — triggers D1/D8 overlay flag. */
  mhtActive?: boolean
}

/**
 * Execute the complete Empress HIS assessment pipeline.
 *
 * Pipeline order (matches the Python reference):
 *   1. Input validation
 *   2. Stage determination
 *   3. Domain score computation (with missing data handling)
 *   4. Item-level clinical flag detection    ← BEFORE composite
 *   5. Domain-level clinical flag detection  ← BEFORE composite
 *   6. Composite HIS computation
 *   7. Score interpretation
 *   8. MHT flag determination
 */
export function runAssessment(input: RunAssessmentInput): HISResult {
  const { responses, stagingResponse, mhtActive = false } = input

  // ── 1. Validate inputs ─────────────────────────────────────────────────
  const unknownQs: number[] = []
  for (const qStr of Object.keys(responses)) {
    const q = Number(qStr)
    if (!Number.isInteger(q) || q < 1 || q > 120) unknownQs.push(q)
  }
  if (unknownQs.length > 0) {
    throw new RangeError(`Invalid question numbers: ${unknownQs.sort((a, b) => a - b).join(", ")}`)
  }
  for (const [qStr, v] of Object.entries(responses)) {
    if (v === null || v === undefined) continue
    if (!Number.isInteger(v) || v < 0 || v > 10) {
      throw new RangeError(`Q${qStr}: raw response must be integer 0–10, got ${v}`)
    }
  }
  if (stagingResponse !== 1 && stagingResponse !== 2 && stagingResponse !== 3) {
    throw new RangeError(`stagingResponse must be 1, 2, or 3. Got: ${stagingResponse}`)
  }

  // ── 2. Stage determination ─────────────────────────────────────────────
  const stage = STAGE_MAPPING[stagingResponse]

  // Normalise into a full Q1..Q120 map with null for missing
  const full: Record<number, number | null> = {}
  let nAnswered = 0
  for (let q = 1; q <= 120; q += 1) {
    const raw = (responses as Record<number, number | null | undefined>)[q]
    if (raw === null || raw === undefined) {
      full[q] = null
    } else {
      full[q] = raw
      nAnswered += 1
    }
  }
  const nMissing = 120 - nAnswered

  // ── 3. Domain score computation ────────────────────────────────────────
  const domainScores: Record<number, number | null> = {}
  const excludedDomains: number[] = []
  const imputedDomains: number[] = []

  for (const dStr of Object.keys(DOMAIN_CONFIG)) {
    const d = Number(dStr)
    const cfg = DOMAIN_CONFIG[d]
    let nDomMissing = 0
    for (const q of cfg.items) {
      if (full[q] === null) nDomMissing += 1
    }
    if (nDomMissing >= 1 && nDomMissing <= 2) imputedDomains.push(d)

    const score = computeDomainScore(d, full)
    domainScores[d] = score
    if (score === null) excludedDomains.push(d)
  }

  const domainBands: Record<number, DomainBandLabel> = {}
  for (const [dStr, s] of Object.entries(domainScores)) {
    domainBands[Number(dStr)] = s === null ? "Excluded" : getDomainBand(s)
  }

  // ── 4 + 5. Clinical flags (BEFORE composite) ───────────────────────────
  const itemFlags = detectItemFlags(full)
  const domainFlags = detectDomainFlags(domainScores)

  // ── 6. Composite HIS ───────────────────────────────────────────────────
  const { his, effectiveWeights } = computeHis(domainScores, stage)

  // ── 7. Score interpretation ────────────────────────────────────────────
  let hisBand: HISBandLabel
  let hisColor: string
  let compositeFlag: boolean
  let assessmentValid: boolean
  if (his !== null) {
    const band = getScoreBand(his)
    hisBand = band.label
    hisColor = band.color
    compositeFlag = his <= COMPOSITE_CRITICAL_THRESHOLD
    assessmentValid = true
  } else {
    hisBand = "Incomplete"
    hisColor = "#888888"
    compositeFlag = false
    assessmentValid = false
  }

  // ── 8. MHT flag ────────────────────────────────────────────────────────
  const mhtFlag = mhtActive

  return {
    stage,
    mhtActive,
    domainScores,
    domainBands,
    excludedDomains,
    imputedDomains,
    his,
    hisBand,
    hisColor,
    effectiveWeights,
    itemFlags,
    domainFlags,
    compositeFlag,
    mhtFlag,
    nAnswered,
    nMissing,
    assessmentValid,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Convenience helpers for the report UI
// ═══════════════════════════════════════════════════════════════════════════

/** Urgent item flags only, in priority/question order. */
export function urgentFlags(result: HISResult): ItemFlag[] {
  return result.itemFlags.filter((f) => f.priority === "URGENT")
}

/** Recommended item flags only, in priority/question order. */
export function recommendedFlags(result: HISResult): ItemFlag[] {
  return result.itemFlags.filter((f) => f.priority === "RECOMMENDED")
}

/** Domain IDs with Low band score, sorted by score ascending. */
export function topConcernDomains(result: HISResult): number[] {
  const low: Array<[number, number]> = []
  for (const [dStr, s] of Object.entries(result.domainScores)) {
    if (s !== null && s <= 34) low.push([Number(dStr), s])
  }
  low.sort((a, b) => a[1] - b[1])
  return low.map(([d]) => d)
}

/** Human-readable stage label, e.g. "Peri-Menopause". */
export function stageDisplay(stage: MenopauseStage): string {
  return stage
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("-")
}
