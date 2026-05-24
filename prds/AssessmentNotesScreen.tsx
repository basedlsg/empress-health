import { useAssessment } from "./AssessmentProvider"
import { AssessmentSiteNav } from "./AssessmentSiteNav"

type Props = {
  onBack: () => void
  /** Triggered when the user submits — even with both fields empty.
   *  AssessmentFlow uses this to advance into the loading/report steps. */
  onContinue: () => void
}

/**
 * Post-questions notes screen — sits between the last category and the
 * loading/report step on the PAID tier. Both fields are optional;
 * submitting empty is a valid action.
 *
 * The captured values live on AssessmentProvider (additionalNotes,
 * currentMedications). AssessmentFlow forwards them to the chatbot
 * evaluation endpoint as part of the loading step's fetch fan-out.
 */
export function AssessmentNotesScreen({ onBack, onContinue }: Props) {
  const {
    additionalNotes,
    currentMedications,
    setAdditionalNotes,
    setCurrentMedications,
    progressPercent,
  } = useAssessment()

  return (
    <div style={s.root}>
      <div style={s.container}>
        <AssessmentSiteNav variant="light" />

        <div style={s.header}>
          <span style={s.brand}>EMPRESS HEALTH.AI</span>
          <span style={s.progress}>Almost there — last step</span>
        </div>

        {/* Full progress bar — every category is complete by this point */}
        <div style={s.barTrack}>
          <div style={{ ...s.barFill, width: `${Math.max(progressPercent, 100)}%` }} />
        </div>

        <h1 style={s.title}>Before we build your report</h1>
        <p style={s.lede}>
          Two optional questions. Anything you share here goes to the Empress
          chatbot alongside your scores so its guidance reflects context the
          sliders can't capture. Skip either field if it doesn't apply.
        </p>

        <label style={s.field}>
          <span style={s.fieldLabel}>Anything else you'd like to share?</span>
          <span style={s.fieldHelp}>
            New diagnoses, recent life changes, family history, things the
            sliders didn't ask about — whatever feels relevant.
          </span>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Optional — leave blank if nothing comes to mind."
            style={s.textarea}
          />
          <span style={s.counter}>
            {additionalNotes.length} / 2000
          </span>
        </label>

        <label style={s.field}>
          <span style={s.fieldLabel}>Current medications &amp; supplements</span>
          <span style={s.fieldHelp}>
            List anything you take regularly, including dosages if you know
            them. We do not share this with anyone — it only informs the
            chatbot's recommendations.
          </span>
          <textarea
            value={currentMedications}
            onChange={(e) => setCurrentMedications(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="e.g. Estradiol patch 0.05mg, magnesium glycinate 400mg, vitamin D3 2000 IU"
            style={s.textarea}
          />
          <span style={s.counter}>
            {currentMedications.length} / 2000
          </span>
        </label>

        <div style={s.nav}>
          <button type="button" onClick={onBack} style={s.backBtn}>
            ← Back
          </button>
          <button type="button" onClick={onContinue} style={s.continueBtn}>
            ✓ Generate My Report →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ───── Styles ───── */

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
  title: {
    fontFamily: "'Poppins', system-ui, sans-serif",
    fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
    fontWeight: 700,
    color: plum,
    margin: "0 0 10px",
    lineHeight: 1.25,
  },
  lede: {
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "#5a5a5a",
    margin: "0 0 28px",
    maxWidth: 600,
  },
  field: {
    display: "block" as const,
    marginBottom: 24,
  },
  fieldLabel: {
    display: "block" as const,
    fontSize: "0.95rem",
    fontWeight: 700,
    color: plum,
    marginBottom: 4,
  },
  fieldHelp: {
    display: "block" as const,
    fontSize: "0.85rem",
    color: "#6a6a6a",
    lineHeight: 1.5,
    marginBottom: 10,
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box" as const,
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.95rem",
    lineHeight: 1.55,
    color: "#1f1f1f",
    background: "#fff",
    border: "1px solid #d4cfe0",
    borderRadius: 10,
    padding: "12px 14px",
    resize: "vertical" as const,
    outline: "none",
  },
  counter: {
    display: "block" as const,
    textAlign: "right" as const,
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
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
  continueBtn: {
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
