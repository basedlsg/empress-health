import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { assessmentCategories } from "./assessmentQuestions"
import type {
  AssessmentCategory,
  MenopauseStage,
  ResponseMap,
  UserProfile,
} from "./assessmentTypes"

/**
 * Tier the user is taking the assessment under. Determined by the URL
 * query string `?tier=free|paid` in AssessmentFlow.
 *  - "paid": full 120-question (10-category) clinical assessment
 *  - "free": abbreviated 30-question subset (≥2 per category)
 */
export type AssessmentTier = "free" | "paid"

type AssessmentContextValue = {
  /** The category set this session is operating against (full or abbreviated). */
  categories: AssessmentCategory[]
  tier: AssessmentTier
  user: UserProfile | null
  responses: ResponseMap
  completedAt?: string
  /**
   * Paid-tier intake selections. Captured by the staging screen before the
   * 120 items begin and consumed by the HIS engine when the report renders.
   */
  stage: MenopauseStage | null
  mhtActive: boolean
  /** Free-text answers from the post-questions notes screen (paid tier).
   *  Sent alongside the assessment payload to the chatbot evaluation
   *  endpoint so the chatbot has user-supplied context the slider items
   *  don't capture. Both default to empty strings (optional). */
  additionalNotes: string
  currentMedications: string
  setUser: (user: UserProfile) => void
  setResponse: (questionId: number, value: number) => void
  setStage: (stage: MenopauseStage | null) => void
  setMhtActive: (active: boolean) => void
  setAdditionalNotes: (text: string) => void
  setCurrentMedications: (text: string) => void
  markCompleted: () => void
  resetAssessment: () => void
  totalQuestions: number
  answeredCount: number
  progressPercent: number
  getResponse: (questionId: number) => number
}

const AssessmentContext = createContext<AssessmentContextValue | undefined>(
  undefined
)

type ProviderProps = {
  children: ReactNode
  /** Optional override of which question set to render. Defaults to the full 120-Q paid set. */
  categories?: AssessmentCategory[]
  /** Tier label propagated through context for downstream UI conditionals. */
  tier?: AssessmentTier
}

export function AssessmentProvider({
  children,
  categories = assessmentCategories,
  tier = "paid",
}: ProviderProps) {
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [responses, setResponses] = useState<ResponseMap>({})
  const [completedAt, setCompletedAt] = useState<string | undefined>(undefined)
  const [stage, setStageState] = useState<MenopauseStage | null>(null)
  const [mhtActive, setMhtActiveState] = useState<boolean>(false)
  const [additionalNotes, setAdditionalNotesState] = useState<string>("")
  const [currentMedications, setCurrentMedicationsState] = useState<string>("")

  const totalQuestions = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.questions.length, 0),
    [categories]
  )

  // fix #48: every question has a default-0 response (most-mild), so the
  // progress bar should advance as the user moves through screens, not stay
  // at 0% until they touch a slider. Use totalQuestions so progressPercent
  // reflects screen completion rather than slider interactions.
  const answeredCount = totalQuestions

  const progressPercent = useMemo(() => {
    if (totalQuestions === 0) return 0
    return Math.round((answeredCount / totalQuestions) * 100)
  }, [answeredCount, totalQuestions])

  // 2026-05-16 slider re-flip: each question still opens with a default
  // value of 0, but under the restored direction the LEFT end of the
  // slider now means "no symptom / most mild" and the RIGHT end means
  // "most severe". So an unanswered question registers as MILD in scoring
  // (full wellness credit). `assessmentScoring.ts` mirrors this default
  // with `?? 0` and computes `(10 - avg) * 10` so all-mild → 100.
  const getResponse = useCallback(
    (questionId: number) => responses[questionId] ?? 0,
    [responses]
  )

  const setUser = useCallback((next: UserProfile) => {
    setUserState(next)
  }, [])

  const setResponse = useCallback((questionId: number, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
  }, [])

  const setStage = useCallback((next: MenopauseStage | null) => {
    setStageState(next)
  }, [])

  const setMhtActive = useCallback((next: boolean) => {
    setMhtActiveState(next)
  }, [])

  const setAdditionalNotes = useCallback((text: string) => {
    setAdditionalNotesState(text)
  }, [])

  const setCurrentMedications = useCallback((text: string) => {
    setCurrentMedicationsState(text)
  }, [])

  const markCompleted = useCallback(() => {
    setCompletedAt(new Date().toISOString())
  }, [])

  const resetAssessment = useCallback(() => {
    setUserState(null)
    setResponses({})
    setCompletedAt(undefined)
    setStageState(null)
    setMhtActiveState(false)
    setAdditionalNotesState("")
    setCurrentMedicationsState("")
  }, [])

  const value = useMemo<AssessmentContextValue>(
    () => ({
      categories,
      tier,
      user,
      responses,
      completedAt,
      stage,
      mhtActive,
      additionalNotes,
      currentMedications,
      setUser,
      setResponse,
      setStage,
      setMhtActive,
      setAdditionalNotes,
      setCurrentMedications,
      markCompleted,
      resetAssessment,
      totalQuestions,
      answeredCount,
      progressPercent,
      getResponse,
    }),
    [
      categories,
      tier,
      user,
      responses,
      completedAt,
      stage,
      mhtActive,
      additionalNotes,
      currentMedications,
      setUser,
      setResponse,
      setStage,
      setMhtActive,
      setAdditionalNotes,
      setCurrentMedications,
      markCompleted,
      resetAssessment,
      totalQuestions,
      answeredCount,
      progressPercent,
      getResponse,
    ]
  )

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext)
  if (ctx === undefined) {
    throw new Error("useAssessment must be used within an AssessmentProvider")
  }
  return ctx
}
