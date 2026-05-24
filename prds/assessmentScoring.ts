import { assessmentCategories } from "./assessmentQuestions"
import type { AssessmentCategory, ResponseMap } from "./assessmentTypes"

export type CategoryStatus = "Priority" | "Moderate" | "Strong"

export type CategoryScore = {
  categoryId: number
  slug: string
  title: string
  score: number
  status: CategoryStatus
}

export function getCategoryStatus(score: number): CategoryStatus {
  if (score < 50) return "Priority"
  if (score <= 65) return "Moderate"
  return "Strong"
}

/**
 * All scoring helpers now accept a `categories` argument so they can be reused
 * against either the full 120-question set (paid) or the 30-question abbreviated
 * set (free). Callers that still want the legacy full-set behaviour can omit the
 * argument.
 */
// 2026-05-16 slider re-flip:
//   The slider now emits 0 = most mild / no symptom, 10 = most severe
//   (the pre-2026-05-15 direction, restored on product direction).
//   Each question still opens with a default value of 0 — under the new
//   direction that means "no symptom", so an untouched slider contributes
//   full wellness credit. AssessmentProvider.getResponse returns `?? 0`
//   and we mirror that with the same default here.
//
//   Final 0-100 score is wellness-aligned (high = better wellbeing):
//     all-mild  → avg 0  → score 100 → Strong
//     all-severe → avg 10 → score   0 → Priority
//   That is, score = (10 − avg) × 10. The HIS engine still expects the
//   wellness-aligned convention (post-2026-05-15) for its internal math,
//   so responses are inverted at the boundary in AssessmentReportScreen
//   rather than here — see that file for the transform.
//
//   Implication of the `?? 0` default under the new direction: a question
//   the user never touched contributes a perfect-wellness 10 to the final
//   score. This is the inverse of the previous default behaviour and
//   means score validity again depends on the user actually moving every
//   slider. Consider adding a completion-percentage gate before showing
//   the report if drop-off becomes an issue.
export function calculateCategoryScores(
  responses: ResponseMap,
  categories: AssessmentCategory[] = assessmentCategories
): CategoryScore[] {
  return categories.map((cat) => {
    const values = cat.questions.map((q) => responses[q.id] ?? 0)
    const avg =
      values.length === 0
        ? 0
        : values.reduce((sum, v) => sum + v, 0) / values.length
    // 0 = mild, 10 = severe → wellness = 10 − avg → score = (10 − avg) × 10
    const score = Math.round((10 - avg) * 10)

    return {
      categoryId: cat.id,
      slug: cat.slug,
      title: cat.title,
      score,
      status: getCategoryStatus(score),
    }
  })
}

export function calculateOverallScore(
  responses: ResponseMap,
  categories: AssessmentCategory[] = assessmentCategories
): number {
  const categoryScores = calculateCategoryScores(responses, categories)
  if (categoryScores.length === 0) return 0
  const total = categoryScores.reduce((sum, c) => sum + c.score, 0)
  return Math.round(total / categoryScores.length)
}

export function getPriorityAreas(
  responses: ResponseMap,
  limit = 3,
  categories: AssessmentCategory[] = assessmentCategories
): CategoryScore[] {
  return calculateCategoryScores(responses, categories)
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
}

export function getStrengthAreas(
  responses: ResponseMap,
  limit = 2,
  categories: AssessmentCategory[] = assessmentCategories
): CategoryScore[] {
  return calculateCategoryScores(responses, categories)
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
