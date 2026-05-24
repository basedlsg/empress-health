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

  const isValid = localStage !== null && localMht !== null

  function handleSubmit() {
    if (!isValid || localStage === null || localMht === null) return
    setStage(localStage)
    setMhtActive(localMht)
    onContinue()
  }

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

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Menopause stage</legend>
          <div style={styles.optionList}>
            {STAGE_OPTIONS.map((opt) => {
              const selected = localStage === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLocalStage(opt.value)}
                  style={selected ? styles.optionSelected : styles.option}
                  aria-pressed={selected}
                >
                  <span style={styles.optionTitle}>{opt.title}</span>
                  <span style={styles.optionDesc}>{opt.description}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>
            Are you currently taking hormone therapy (HRT / MHT)?
          </legend>
          <p style={styles.helper}>
            This includes systemic estrogen, progesterone, or combined therapy.
            We use this to flag domains where your scores reflect a treated
            state rather than your underlying biology.
          </p>
          <div style={styles.mhtRow}>
            <button
              type="button"
              onClick={() => setLocalMht(true)}
              style={localMht === true ? styles.mhtSelected : styles.mhtBtn}
              aria-pressed={localMht === true}
            >
              Yes, I'm on MHT
            </button>
            <button
              type="button"
              onClick={() => setLocalMht(false)}
              style={localMht === false ? styles.mhtSelected : styles.mhtBtn}
              aria-pressed={localMht === false}
            >
              No
            </button>
          </div>
        </fieldset>

        <div style={styles.ctaRow}>
          <button type="button" onClick={onBack} style={styles.backBtn}>
            ← Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            style={isValid ? styles.cta : styles.ctaDisabled}
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
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    gap: 4,
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
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    gap: 4,
    padding: "16px 18px",
    borderRadius: 12,
    border: `2px solid ${gold}`,
    background: "rgba(216,167,56,0.14)",
    color: ivory,
    fontFamily: "inherit",
    cursor: "pointer",
    boxShadow: "0 8px 22px -12px rgba(216,167,56,0.5)",
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
  ctaDisabled: {
    padding: "14px 28px",
    borderRadius: 12,
    border: "1px solid rgba(216,167,56,0.35)",
    background: "rgba(216,167,56,0.18)",
    color: "rgba(248,246,242,0.55)",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    cursor: "not-allowed",
    fontFamily: "inherit",
  },
  disclaimer: {
    fontSize: "0.76rem",
    color: "rgba(248,246,242,0.5)",
    margin: 0,
    textAlign: "center",
  },
}
