import type { AssessmentCategory, AssessmentQuestion } from "./assessmentQuestions"

export type { AssessmentCategory, AssessmentQuestion }

/**
 * Menopause stage. Drives the HIS domain weight matrix and the choice of
 * narrative template. Captured up-front from the paid staging intake.
 *  - perimenopause  : irregular menstrual cycles or cycle-related symptoms while still menstruating
 *  - menopause      : < 12 months amenorrhoea or surgical/iatrogenic menopause
 *  - post_menopause : >= 12 months amenorrhoea (natural)
 */
export type MenopauseStage = "perimenopause" | "menopause" | "post_menopause"

export type UserProfile = {
  firstName: string
  age: number
  /** Stage selection from the paid intake; optional for the free flow. */
  stage?: MenopauseStage
  /** True if the user is currently on hormone therapy. Triggers MHT overlay on D1 and D8. */
  mhtActive?: boolean
}

export type ResponseMap = Record<number, number>

export type AssessmentState = {
  user: UserProfile | null
  responses: ResponseMap
  completedAt?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// HIS (Health Intelligence Score) result types
//
// These mirror the dataclass returned by the Python reference engine
// (empress_his_engine.py → HISResult). The TS port in hisEngine.ts produces
// one of these per assessment run.
// ─────────────────────────────────────────────────────────────────────────────

/** Composite HIS bands (1–100). Direction: higher = better wellness. */
export type HISBandLabel =
  | "Thriving"
  | "Flourishing"
  | "Managing"
  | "Struggling"
  | "Critical"
  | "Incomplete"

/** Domain-level bands (DS_d on 0–100). */
export type DomainBandLabel = "High" | "Moderate" | "Low" | "Excluded"

/** Priority of an item-level clinical flag. */
export type FlagPriority = "URGENT" | "RECOMMENDED"

/** Item-level clinical flag triggered when a specific question crosses its raw threshold. */
export type ItemFlag = {
  question: number
  label: string
  rawScore: number
  domainId: number
  domainName: string
  priority: FlagPriority
  referralText: string
}

/** Domain-level flag triggered when DS_d falls below the severe-burden threshold. */
export type DomainFlag = {
  domainId: number
  domainName: string
  domainScore: number
  message: string
}

/** Complete output of a single HIS assessment run. */
export type HISResult = {
  stage: MenopauseStage
  mhtActive: boolean

  /** DS_d for each of the 10 domains (0–100), or null if the domain was excluded. */
  domainScores: Record<number, number | null>
  /** "High" / "Moderate" / "Low" / "Excluded" per domain. */
  domainBands: Record<number, DomainBandLabel>
  /** Domains dropped because ≥ 3 items were missing. */
  excludedDomains: number[]
  /** Domains where 1–2 items were mean-imputed. */
  imputedDomains: number[]

  /** Composite HIS (1–100), or null if too many domains excluded. */
  his: number | null
  hisBand: HISBandLabel
  hisColor: string
  /** Weights actually used after renormalisation. Sums to 100. */
  effectiveWeights: Record<number, number>

  itemFlags: ItemFlag[]
  domainFlags: DomainFlag[]
  /** HIS ≤ 39 — triggers critical-band escalation language. */
  compositeFlag: boolean
  /** Mirrors mhtActive — true if D1/D8 overlay text must be shown. */
  mhtFlag: boolean

  nAnswered: number
  nMissing: number
  /** False if ≥ 3 domains were excluded (HIS = null). */
  assessmentValid: boolean
}
