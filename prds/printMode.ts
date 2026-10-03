import type { AssessmentApiResult } from "./AssessmentFlow"
import type { MenopauseStage } from "./assessmentTypes"

/**
 * State the server injects as `window.__EMPRESS_PRINT_STATE__` when it renders
 * the report headlessly (lib/report-pdf.js) to attach the full PDF to the
 * results email. When present, the assessment flow skips straight to the
 * report screen with this data and the report must not email anything itself.
 */
export type PrintRenderState = {
  user: { firstName: string; age: number; usState?: string; zip?: string }
  stage: MenopauseStage | null
  mhtActive: boolean
  responses: Record<number, number>
  completedAt?: string
  /** Set by the server from the member's real plan — never from the browser. */
  memberTier?: "free" | "essential" | "premium" | null
  apiResult: AssessmentApiResult
}

export function readPrintState(): PrintRenderState | null {
  if (typeof window === "undefined") return null
  const state = (window as unknown as { __EMPRESS_PRINT_STATE__?: PrintRenderState })
    .__EMPRESS_PRINT_STATE__
  return state && typeof state === "object" ? state : null
}
