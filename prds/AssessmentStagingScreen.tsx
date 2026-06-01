import { useState } from "react"
import { useAssessment } from "./AssessmentProvider"
import { AssessmentSiteNav } from "./AssessmentSiteNav"
import type { MenopauseStage } from "./assessmentTypes"

type Props = {
  onContinue: () => void
  onBack: () => void
}

type StageOption = {
  value: MenopauseStage
  numericId: 1 | 2 | 3
  title: string
  description: string
}

// Wording mirrors the staging intake described in the HIS validation plan and
// the comments next to STAGE_MAPPING in hisEngine.ts.
const STAGE_OPTIONS: StageOption[] = [
  {
    value: "perimenopause",
    numericId: 1,
    title: "Perimenopause",
    description:
      "My cycles have become irregular, or I'm still menstruating but experiencing menopause-related symptoms.",
  },
  {
    value: "menopause",
    numericId: 2,
    title: "Menopause",
    description:
      "I haven't had a period for less than 12 months, or I'm in surgical / medically-induced menopause.",
  },
  {
    value: "post_menopause",
    numericId: 3,
    title: "Menopause and Longevity",
    description:
      "It's been 12 months or more since my last natural menstrual period.",
  },
]

export function AssessmentStagingScreen({ onContinue, onBack }: Props) {
  const { setStage, setMhtActive, stage, mhtActive, user } = useAssessment()
  const [localStage, setLocalStage] = useState<MenopauseStage | null>(stage)
  const [localMht, setLocalMht] = useState<boolean | null>(
    stage === null ? null : mhtActive,
  )
  // When the user taps Continue before answering both questions, we surface a
  // pointed message instead of leaving a dead, greyed-out button (which read as
  // "Continue isn't going forward").
  const [showError, setShowError] = useState(false)

  const isValid = localStage !== null && localMht !== null

  function handleSubmit() {
    if (!isValid || localStage === null || localMht === null) {
      // Don't silently no-op — tell the user exactly what's missing and bring
      // the unanswered question into view.
      setShowError(true)
      if (typeof document !== "undefined") {
        const targetId = localStage === null ? "staging-stage" : "staging-mht"
        const el = document.getElementById(targetId)
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
      return
    }
    setShowError(false)
    setStage(localStage)
    setMhtActive(localMht)
    onContinue()
  }

  const errorMessage =
    localStage === null && localMht === null
      ? "Please choose where you are in your transition and whether you're taking hormone therapy (HRT) to continue."
      : localStage === null
        ? "Please choose where you are in your transition to continue."
        : "Please tell us whether you're currently taking hormone therapy (HRT) to continue."

  return (
    <div style={styles.root}>
      <style>{scopedCss}</style>
      <AssessmentSiteNav variant="dark" />
      <div style={styles.card}>
        <span style={styles.brand}>EMPRESS HEALTH.AI</span>
        <h1 style={styles.headline}>
          {user?.firstName ? `${user.firstName}, ` : ""}where are you in your transition?
        </h1>
        <p style={styles.supporting}>
          Your stage determines how each body system is weighted in your Health
          Intelligence Score. Different domains carry different clinical risk at
          different points in the menopause continuum.
        </p>

        <fieldset id="staging-stage" style={styles.fieldset}>
          <legend style={styles.legend}>
            Menopause stage <span style={styles.legendHint}>— click one</span>
          </legend>
          <div style={styles.optionList} role="radiogroup" aria-label="Menopause stage — click one">
            {STAGE_OPTIONS.map((opt) => {
              const selected = localStage === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  onClick={() => { setLocalStage(opt.value); setShowError(false) }}
                  style={selected ? styles.optionSelected : styles.option}
                  aria-checked={selected}
                >
                  <span
                    aria-hidden="true"
                    style={selected ? styles.radioDotSelected : styles.radioDot}
                  >
                    {selected && <span style={styles.radioDotInner} />}
                  </span>
                  <span style={styles.optionTextCol}>
                    <span style={styles.optionTitle}>{opt.title}</span>
                    <span style={styles.optionDesc}>{opt.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset id="staging-mht" style={styles.fieldset}>
          <legend style={styles.legend}>
            Are you currently taking hormone therapy (HRT)?
          </legend>
          <p style={styles.helper}>
            This includes systemic estrogen, progesterone, or combined therapy.
            We use this to flag domains where your scores reflect a treated
            state rather than your underlying biology.
          </p>
          <div style={styles.mhtRow}>
            <button
              type="button"
              onClick={() => { setLocalMht(true); setShowError(false) }}
              style={localMht === true ? styles.mhtSelected : styles.mhtBtn}
              aria-pressed={localMht === true}
            >
              Yes, I'm on HRT
            </button>
            <button
              type="button"
              onClick={() => { setLocalMht(false); setShowError(false) }}
              style={localMht === false ? styles.mhtSelected : styles.mhtBtn}
              aria-pressed={localMht === false}
            >
              No
            </button>
          </div>
        </fieldset>

        {showError && !isValid && (
          <p role="alert" style={styles.validationError}>
            {errorMessage}
          </p>
        )}
        <div style={styles.ctaRow}>
          <button type="button" onClick={onBack} style={styles.backBtn}>
            ← Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            aria-disabled={!isValid}
            style={isValid ? styles.cta : styles.ctaNeedsInput}
          >
            Continue →
          </button>
        </div>
        <p style={styles.disclaimer}>
          For informational purposes only. Not medical advice.
        </p>
      </div>
    </div>
  )
}

// Aligned to site palette from index.html :root
const gold = "#D8A738"
const plum = "#3f1449"
const plumLight = "#4b2577"
const ivory = "#fffaf1"

const scopedCss = `
  .ass-staging-opt:hover { border-color: ${gold} !important; }
`

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: `linear-gradient(160deg, ${plum} 0%, ${plumLight} 100%)`,
    padding: "32px 18px",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 620,
    display: "flex",
    flexDirection: "column",
    gap: 22,
    padding: "36px 28px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 60px -24px rgba(0,0,0,0.55)",
    boxSizing: "border-box",
  },
  brand: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.2em",
    color: gold,
    textTransform: "uppercase",
  },
  headline: {
    fontFamily: "'Poppins', system-ui, sans-serif",
    fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
    fontWeight: 700,
    lineHeight: 1.25,
    color: ivory,
    margin: 0,
  },
  supporting: {
    fontSize: "1rem",
    lineHeight: 1.55,
    color: "rgba(248,246,242,0.85)",
    margin: 0,
  },
  fieldset: {
    border: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  legend: {
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: gold,
    padding: 0,
  },
  helper: {
    fontSize: "0.88rem",
    lineHeight: 1.5,
    color: "rgba(248,246,242,0.65)",
    margin: 0,
  },
  optionList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  option: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    textAlign: "left",
    gap: 14,
    padding: "16px 18px",
    borderRadius: 12,
    border: "1px solid rgba(248,246,242,0.18)",
    background: "rgba(255,255,255,0.04)",
    color: ivory,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
  },
  optionSelected: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    textAlign: "left",
    gap: 14,
    padding: "16px 18px",
    borderRadius: 12,
    border: `2px solid ${gold}`,
    background: "rgba(216,167,56,0.14)",
    color: ivory,
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "0 8px 22px -12px rgba(216,167,56,0.5)",
  },
  legendHint: {
    fontWeight: 600,
    color: "rgba(248,246,242,0.6)",
    textTransform: "none",
    letterSpacing: "normal",
  },
  // Radio circle that makes it obvious each stage is a single-select choice.
  radioDot: {
    flex: "0 0 auto",
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "2px solid rgba(248,246,242,0.45)",
    background: "transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  radioDotSelected: {
    flex: "0 0 auto",
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: `2px solid ${gold}`,
    background: "transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  radioDotInner: {
    width: 11,
    height: 11,
    borderRadius: "50%",
    background: gold,
  },
  optionTextCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    minWidth: 0,
  },
  optionTitle: {
    fontSize: "1rem",
    fontWeight: 700,
  },
  optionDesc: {
    fontSize: "0.88rem",
    lineHeight: 1.45,
    color: "rgba(248,246,242,0.75)",
  },
  mhtRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  mhtBtn: {
    flex: "1 1 0",
    minWidth: 130,
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid rgba(248,246,242,0.25)",
    background: "rgba(255,255,255,0.06)",
    color: ivory,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  mhtSelected: {
    flex: "1 1 0",
    minWidth: 130,
    padding: "12px 16px",
    borderRadius: 10,
    border: `2px solid ${gold}`,
    background: "rgba(216,167,56,0.18)",
    color: ivory,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  ctaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
    flexWrap: "wrap",
  },
  backBtn: {
    padding: "12px 22px",
    borderRadius: 10,
    border: "1px solid rgba(248,246,242,0.3)",
    background: "transparent",
    color: ivory,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  cta: {
    padding: "14px 28px",
    borderRadius: 12,
    border: "none",
    background: gold,
    color: plum,
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    cursor: "pointer",
    boxShadow: "0 10px 28px -10px rgba(216,167,56,0.6)",
    fontFamily: "inherit",
  },
  // "Needs input" state: still clearly a clickable gold button (never a dead,
  // greyed-out control). Clicking it surfaces a validation message.
  ctaNeedsInput: {
    padding: "14px 28px",
    borderRadius: 12,
    border: `1px solid ${gold}`,
    background: "rgba(216,167,56,0.85)",
    color: plum,
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  validationError: {
    margin: "0 0 2px",
    padding: "11px 15px",
    borderRadius: 10,
    background: "rgba(216,167,56,0.14)",
    border: "1px solid rgba(216,167,56,0.55)",
    color: ivory,
    fontSize: "0.9rem",
    lineHeight: 1.45,
  },
  disclaimer: {
    fontSize: "0.76rem",
    color: "rgba(248,246,242,0.5)",
    margin: 0,
    textAlign: "center",
  },
}
