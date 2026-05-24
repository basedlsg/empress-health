import { useMemo } from "react"
import { useAssessment } from "./AssessmentProvider"
import { AssessmentSiteNav } from "./AssessmentSiteNav"
import { CATEGORY_HELP_BY_SLUG } from "./assessmentQuestions"

type Props = {
  categoryId: number
  onBack: () => void
  onNext?: () => void
  onComplete?: () => void
}

// Slider direction re-flipped 2026-05-16: 0 now means no-symptom / most mild,
// 10 means most severe. The minLabel/maxLabel pairs in assessmentQuestions.ts
// have been swapped back to match, and this descriptor table is re-inverted
// so the live feedback under the slider matches the new direction
// (0 = "Never / None", 9 = "Always / Debilitating").
const descriptors: [number, string][] = [
  [0, "Never / None"],
  [1, "Rarely / Mild"],
  [3, "Sometimes / Moderate"],
  [5, "Often / Significant"],
  [7, "Frequently / Severe"],
  [9, "Always / Debilitating"],
]

function describe(value: number): string {
  for (let i = descriptors.length - 1; i >= 0; i--) {
    if (value >= descriptors[i][0]) return descriptors[i][1]
  }
  return descriptors[0][1]
}

export function AssessmentCategoryScreen({
  categoryId,
  onBack,
  onNext,
  onComplete,
}: Props) {
  const { categories, getResponse, setResponse, progressPercent } = useAssessment()

  // Flattened list + derived totals are recomputed whenever the tier / question
  // set changes (paid 120 vs. free 30).
  const allQuestions = useMemo(
    () => categories.flatMap((c) => c.questions),
    [categories]
  )
  const totalCount = allQuestions.length
  const totalCategories = categories.length

  const category = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId]
  )

  if (!category) {
    return (
      <div style={s.root}>
        <p style={{ color: "#5a5a5a" }}>Category not found.</p>
      </div>
    )
  }

  const firstDisplayIndex =
    allQuestions.findIndex((q) => q.id === category.questions[0]?.id) + 1

  return (
    <div style={s.root}>
      <div style={s.container}>
        <AssessmentSiteNav variant="light" />
        {/* Header */}
        <div style={s.header}>
          <span style={s.brand}>EMPRESS HEALTH.AI</span>
          <span style={s.progress}>
            Q {firstDisplayIndex}/{totalCount} · Cat {categoryId}/{totalCategories}
          </span>
        </div>

        {/* Progress bar */}
        <div style={s.barTrack}>
          <div style={{ ...s.barFill, width: `${progressPercent}%` }} />
        </div>

        {/* Category meta */}
        <span style={s.catPill}>
          CATEGORY {categoryId} OF {totalCategories}
        </span>
        <h1 style={s.catTitle}>{category.title}</h1>
        {category.description && (
          <p style={s.catDesc}>{category.description}</p>
        )}
        {/* P4 — plain-language "what this measures" hint per category */}
        {CATEGORY_HELP_BY_SLUG[category.slug] && (
          <div style={s.helpHint}>
            <span style={s.helpEyebrow}>What this measures</span>
            <p style={s.helpText}>{CATEGORY_HELP_BY_SLUG[category.slug]}</p>
          </div>
        )}
        <hr style={s.divider} />

        {/* Questions */}
        <div style={s.questions}>
          {category.questions.map((q, i) => {
            const value = getResponse(q.id)
            const displayNum = firstDisplayIndex + i
            return (
              <div key={q.id} style={s.card}>
                <div style={s.cardHeader}>
                  <span style={s.qNum}>{displayNum}</span>
                  <span style={s.shortLabel}>{q.shortLabel}</span>
                </div>
                <p style={s.prompt}>{q.prompt}</p>
                <div style={s.sliderRow}>
                  <span style={s.sliderLabel}>{q.minLabel}</span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={value}
                    onChange={(e) => setResponse(q.id, Number(e.target.value))}
                    style={s.slider}
                  />
                  <span style={s.sliderLabel}>{q.maxLabel}</span>
                </div>
                <div style={s.valueRow}>
                  <span style={s.valueNum}>{value}</span>
                  <span style={s.valueDesc}>{describe(value)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <div style={s.nav}>
          <button type="button" onClick={onBack} style={s.backBtn}>
            ← Back
          </button>
          {onNext && (
            <button type="button" onClick={onNext} style={s.nextBtn}>
              Next Category →
            </button>
          )}
          {!onNext && onComplete && (
            <button type="button" onClick={onComplete} style={s.completeBtn}>
              ✓ Generate My Report →
            </button>
          )}
        </div>
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
    background: ivory,
    fontFamily: "'Inter', sans-serif",
    color: "#1F1F1F",
    padding: "0 0 80px",
  },
  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "0 24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 0 12px",
  },
  brand: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.18em",
    color: plumLight,
    textTransform: "uppercase" as const,
  },
  progress: {
    fontSize: 12,
    fontWeight: 500,
    color: "#888",
  },
  barTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    background: "#e8e4ed",
    marginBottom: 28,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
    background: `linear-gradient(90deg, ${plumLight}, ${gold})`,
    transition: "width 0.3s ease",
  },
  catPill: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: plumLight,
    background: "rgba(58,28,113,0.08)",
    borderRadius: 999,
    padding: "5px 14px",
    marginBottom: 12,
  },
  catTitle: {
    fontFamily: "'Poppins', system-ui, sans-serif",
    fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
    fontWeight: 700,
    color: plum,
    margin: "0 0 8px",
    lineHeight: 1.25,
  },
  catDesc: {
    fontSize: "0.92rem",
    lineHeight: 1.65,
    color: "#5a5a5a",
    margin: "0 0 4px",
    maxWidth: 600,
  },
  /* P4 — plain-language "what this measures" hint */
  helpHint: {
    marginTop: 16,
    background: `${gold}10`,
    border: `1px solid ${gold}40`,
    borderRadius: 12,
    padding: "12px 16px 14px",
  },
  helpEyebrow: {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.18em",
    color: gold,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  helpText: {
    margin: 0,
    fontSize: "0.88rem",
    lineHeight: 1.55,
    color: "#4a4a4a",
    fontFamily: "'Inter', sans-serif",
  },

  divider: {
    border: "none",
    borderTop: `1px solid #e0dce6`,
    margin: "20px 0 28px",
  },
  questions: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: "22px 24px 18px",
    boxShadow: "0 2px 12px rgba(42,15,63,0.06)",
    border: "1px solid #ece8f2",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  qNum: {
    fontSize: 11,
    fontWeight: 700,
    color: gold,
    letterSpacing: "0.04em",
  },
  shortLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: plumLight,
    textTransform: "uppercase" as const,
  },
  prompt: {
    fontSize: "0.95rem",
    lineHeight: 1.55,
    color: "#1F1F1F",
    margin: "0 0 14px",
  },
  sliderRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  sliderLabel: {
    fontSize: 11,
    color: "#888",
    flexShrink: 0,
    maxWidth: 120,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  slider: {
    flex: 1,
    accentColor: plumLight,
    cursor: "pointer",
  },
  valueRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    marginTop: 8,
  },
  valueNum: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: plum,
    fontFamily: "'Poppins', system-ui, sans-serif",
  },
  valueDesc: {
    fontSize: "0.8rem",
    color: "#888",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    paddingTop: 24,
    borderTop: "1px solid #e0dce6",
  },
  backBtn: {
    padding: "12px 24px",
    borderRadius: 10,
    border: `1px solid #d4cfe0`,
    background: "#fff",
    color: plum,
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  nextBtn: {
    padding: "12px 28px",
    borderRadius: 10,
    border: "none",
    background: plumLight,
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  completeBtn: {
    padding: "12px 28px",
    borderRadius: 10,
    border: "none",
    background: gold,
    color: plum,
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
  },
}
