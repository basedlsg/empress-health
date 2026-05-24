import { useState, type FormEvent } from "react"
import { useAssessment } from "./AssessmentProvider"
import { AssessmentSiteNav } from "./AssessmentSiteNav"

type Props = {
  onBegin: () => void
}

export function AssessmentEntryScreen({ onBegin }: Props) {
  const { setUser, totalQuestions, categories, tier } = useAssessment()
  const [firstName, setFirstName] = useState("")
  const [age, setAge] = useState("")

  const parsedAge = Number(age)
  const isValid =
    firstName.trim().length > 0 && age.trim().length > 0 && parsedAge > 0 && Number.isFinite(parsedAge)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setUser({ firstName: firstName.trim(), age: parsedAge })
    onBegin()
  }

  const isFree = tier === "free"
  const categoryCount = categories.length
  const timePill = isFree ? "~5 min" : "~15 min"
  const headlineGold = isFree ? "Free Preview" : "Health Intelligence"

  const supporting = isFree
    ? "A focused 30-question preview of the Empress Health assessment — every symptom category represented."
    : "The most comprehensive menopause assessment available outside a specialist clinic."

  const ctaLabel = isFree ? "BEGIN FREE PREVIEW →" : "BEGIN MY ASSESSMENT →"

  return (
    <div style={styles.root}>
      <style>{scopedCss}</style>
      <AssessmentSiteNav variant="dark" />
      <form onSubmit={handleSubmit} style={styles.card} noValidate>
        <span style={styles.brand}>EMPRESS HEALTH.AI</span>

        <h1 style={styles.headline}>
          Your Peri+ Menopause
          <br />
          <span style={styles.headlineGold}>{headlineGold}</span>
        </h1>

        <p style={styles.supporting}>{supporting}</p>

        <ul style={styles.pills} aria-label="Assessment overview">
          {[`${totalQuestions} Biomarkers`, `${categoryCount} Body Systems`, "0 Blood Draws", timePill].map((label) => (
            <li key={label} style={styles.pill}>{label}</li>
          ))}
        </ul>

        <div className="aes-fields" style={styles.fields}>
          <label className="aes-field" style={styles.field}>
            <span style={styles.fieldLabel}>First name</span>
            <input
              className="aes-input"
              type="text"
              placeholder="e.g. Sarah"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={styles.input}
              autoComplete="given-name"
              required
              aria-label="First name"
            />
          </label>
          <label className="aes-field aes-field-age" style={{ ...styles.field, ...styles.fieldAge }}>
            <span style={styles.fieldLabel}>Age</span>
            <input
              className="aes-input"
              type="number"
              placeholder="50"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={1}
              max={120}
              inputMode="numeric"
              style={styles.input}
              autoComplete="off"
              required
              aria-label="Age"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          style={isValid ? styles.cta : styles.ctaDisabled}
          aria-label={isValid ? ctaLabel : "Enter your first name and age to begin"}
        >
          {ctaLabel}
        </button>

        {isFree && (
          <p style={styles.tierSwitch}>
            Want the full 120-question clinical assessment?{" "}
            <a href="/membershipoptions" style={styles.tierSwitchLink}>
              See membership options →
            </a>
          </p>
        )}

        <p style={styles.disclaimer}>For informational purposes only. Not medical advice.</p>
      </form>
    </div>
  )
}

// Scoped CSS for things inline styles can’t express:
//  - :focus-visible outlines (a11y)
//  - ::placeholder color
//  - hiding native number-input spinners
//  - stacking the name/age row on narrow phones
const scopedCss = `
  .aes-input:focus-visible {
    border-color: #D8A738 !important;
    background: rgba(255,255,255,0.14) !important;
    box-shadow: 0 0 0 3px rgba(216,167,56,0.35);
  }
  .aes-input::placeholder { color: rgba(248,246,242,0.45); }
  .aes-input[type=number]::-webkit-outer-spin-button,
  .aes-input[type=number]::-webkit-inner-spin-button {
    -webkit-appearance: none; margin: 0;
  }
  .aes-input[type=number] { -moz-appearance: textfield; }
  @media (max-width: 460px) {
    .aes-fields { flex-direction: column !important; }
    .aes-field, .aes-field-age { max-width: 100% !important; flex-basis: 100% !important; }
  }
`

// Aligned to site palette from index.html :root
const gold = "#D8A738"
const plum = "#3f1449"
const plumLight = "#4b2577"
const ivory = "#fffaf1"

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: `linear-gradient(160deg, ${plum} 0%, ${plumLight} 100%)`,
    padding: "32px 18px",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 22,
    padding: "32px 24px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 60px -24px rgba(0,0,0,0.55)",
    boxSizing: "border-box" as const,
  },
  brand: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.2em",
    color: gold,
    textTransform: "uppercase" as const,
  },
  headline: {
    fontFamily: "'Poppins', system-ui, sans-serif",
    fontSize: "clamp(1.8rem, 5vw, 3rem)",
    fontWeight: 700,
    lineHeight: 1.2,
    color: ivory,
    margin: 0,
  },
  headlineGold: {
    color: gold,
  },
  supporting: {
    fontSize: "1.05rem",
    lineHeight: 1.55,
    color: "rgba(248,246,242,0.92)",
    maxWidth: 440,
    margin: 0,
  },
  pills: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    gap: 10,
    margin: 0,
    padding: 0,
    listStyle: "none" as const,
  },
  pill: {
    padding: "6px 14px",
    borderRadius: 999,
    border: `1px solid ${gold}`,
    color: gold,
    fontSize: "0.8rem",
    fontWeight: 600,
    letterSpacing: "0.03em",
  },
  fields: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 12,
    width: "100%",
    maxWidth: 400,
    justifyContent: "center",
  },
  field: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start" as const,
    gap: 6,
    flex: "1 1 0",
    minWidth: 0,
  },
  fieldAge: {
    flex: "0 1 130px",
    maxWidth: 140,
  },
  fieldLabel: {
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "rgba(248,246,242,0.7)",
  },
  input: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box" as const,
    padding: "13px 16px",
    borderRadius: 10,
    border: "1px solid rgba(248,246,242,0.25)",
    background: "rgba(255,255,255,0.08)",
    color: ivory,
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
  },
  cta: {
    width: "100%",
    maxWidth: 400,
    padding: "16px 20px",
    borderRadius: 12,
    border: "none",
    background: gold,
    color: plum,
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition: "transform 0.12s, box-shadow 0.12s",
    boxShadow: "0 10px 28px -10px rgba(216,167,56,0.6)",
    boxSizing: "border-box" as const,
  },
  ctaDisabled: {
    width: "100%",
    maxWidth: 400,
    padding: "16px 20px",
    borderRadius: 12,
    border: "1px solid rgba(216,167,56,0.35)",
    background: "rgba(216,167,56,0.18)",
    color: "rgba(248,246,242,0.55)",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    cursor: "not-allowed",
    boxSizing: "border-box" as const,
  },
  tierSwitch: {
    fontSize: "0.85rem",
    color: "rgba(248,246,242,0.78)",
    margin: 0,
  },
  tierSwitchLink: {
    color: gold,
    textDecoration: "none",
    borderBottom: `1px solid ${gold}`,
    paddingBottom: 1,
  },
  disclaimer: {
    fontSize: "0.78rem",
    color: "rgba(248,246,242,0.6)",
    margin: 0,
  },
}
