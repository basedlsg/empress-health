import { useState, type FormEvent } from "react"
import { useAssessment } from "./AssessmentProvider"
import { AssessmentSiteNav } from "./AssessmentSiteNav"

type Props = {
  onBegin: () => void
}

// Full US states (+ DC) so anyone can self-identify. Provider matching covers
// a subset today; unmatched states fall back gracefully in the report.
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
]

export function AssessmentEntryScreen({ onBegin }: Props) {
  const { setUser, totalQuestions, categories, tier } = useAssessment()
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [age, setAge] = useState("")
  const [usState, setUsState] = useState("")
  const [zip, setZip] = useState("")

  // Promo code (CEOOFFER2026 unlocks the full report free).
  const [promo, setPromo] = useState("")
  const [promoStatus, setPromoStatus] = useState<"idle" | "checking" | "ok" | "err">("idle")
  const [promoMsg, setPromoMsg] = useState("")

  const isFree = tier === "free"
  const parsedAge = Number(age)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const zipOk = /^\d{5}$/.test(zip.trim())

  // Free preview only needs name + age. The full (paid / /start) flow also
  // collects contact + location so we can email the report and match doctors.
  const isValid = isFree
    ? firstName.trim().length > 0 && parsedAge > 0 && Number.isFinite(parsedAge)
    : firstName.trim().length > 0 &&
      parsedAge > 0 &&
      Number.isFinite(parsedAge) &&
      emailOk &&
      usState.trim().length > 0 &&
      zipOk

  async function applyPromo() {
    const code = promo.trim().toUpperCase()
    if (!code) {
      setPromoStatus("err")
      setPromoMsg("Enter a code to apply.")
      return
    }
    setPromoStatus("checking")
    setPromoMsg("Checking…")
    try {
      const res = await fetch("/api/checkout/promo?code=" + encodeURIComponent(code), {
        credentials: "same-origin",
      })
      const j = await res.json()
      if (j.valid) {
        setPromoStatus("ok")
        setPromoMsg(j.message || `Code applied: ${j.discount}`)
      } else {
        setPromoStatus("err")
        setPromoMsg(j.message || "That code isn't valid.")
      }
    } catch {
      setPromoStatus("err")
      setPromoMsg("Could not validate code. Try again in a moment.")
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setUser({
      firstName: firstName.trim(),
      age: parsedAge,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      usState: usState.trim() || undefined,
      zip: zip.trim() || undefined,
    })
    onBegin()
  }

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

        {!isFree && (
          <>
            <label className="aes-field" style={{ ...styles.field, width: "100%", maxWidth: 400 }}>
              <span style={styles.fieldLabel}>Email</span>
              <input
                className="aes-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                autoComplete="email"
                required
                aria-label="Email"
              />
            </label>

            <label className="aes-field" style={{ ...styles.field, width: "100%", maxWidth: 400 }}>
              <span style={styles.fieldLabel}>Phone <span style={styles.optional}>(optional)</span></span>
              <input
                className="aes-input"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
                autoComplete="tel"
                aria-label="Phone (optional)"
              />
            </label>

            <div className="aes-fields" style={styles.fields}>
              <label className="aes-field" style={styles.field}>
                <span style={styles.fieldLabel}>State</span>
                <select
                  className="aes-input"
                  value={usState}
                  onChange={(e) => setUsState(e.target.value)}
                  style={{ ...styles.input, appearance: "none" as const }}
                  required
                  aria-label="State"
                >
                  <option value="" disabled>Select your state</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s} style={{ color: "#111" }}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="aes-field aes-field-age" style={{ ...styles.field, ...styles.fieldAge }}>
                <span style={styles.fieldLabel}>ZIP code</span>
                <input
                  className="aes-input"
                  type="text"
                  placeholder="90210"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
                  inputMode="numeric"
                  maxLength={5}
                  style={styles.input}
                  autoComplete="postal-code"
                  required
                  aria-label="ZIP code"
                />
              </label>
            </div>

            <p style={styles.locationNote}>
              We use your state &amp; ZIP to match you with menopause-trained doctors near you.
            </p>
          </>
        )}

        <button
          type="submit"
          disabled={!isValid}
          style={isValid ? styles.cta : styles.ctaDisabled}
          aria-label={isValid ? ctaLabel : "Fill in the required fields to begin"}
        >
          {ctaLabel}
        </button>

        {!isFree && (
          <div style={styles.pricingBox}>
            <p style={styles.pricingLine}>
              Health Intelligence Report — <strong style={styles.price}>$129</strong> one-time
              <span style={styles.priceSub}> (or $12/mo). No subscription.</span>
            </p>
            <div className="aes-promo-row" style={styles.promoRow}>
              <input
                className="aes-input"
                type="text"
                placeholder="Apply Code (e.g. CEOOFFER2026)"
                value={promo}
                onChange={(e) => { setPromo(e.target.value); setPromoStatus("idle"); setPromoMsg("") }}
                style={{ ...styles.input, textTransform: "uppercase" as const }}
                aria-label="Promo code"
              />
              <button
                type="button"
                onClick={applyPromo}
                disabled={promoStatus === "checking"}
                style={styles.promoBtn}
              >
                Apply Code
              </button>
            </div>
            {promoMsg && (
              <p style={promoStatus === "ok" ? styles.promoOk : promoStatus === "err" ? styles.promoErr : styles.promoNeutral}>
                {promoMsg}
              </p>
            )}
          </div>
        )}

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
    .aes-promo-row { flex-direction: column !important; }
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
    gap: 18,
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
  optional: {
    textTransform: "none" as const,
    letterSpacing: "normal",
    color: "rgba(248,246,242,0.45)",
    fontWeight: 500,
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
  locationNote: {
    fontSize: "0.8rem",
    color: "rgba(248,246,242,0.7)",
    margin: "-4px 0 0",
    maxWidth: 400,
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
  pricingBox: {
    width: "100%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    padding: "16px 16px",
    borderRadius: 12,
    border: "1px solid rgba(216,167,56,0.3)",
    background: "rgba(216,167,56,0.06)",
    boxSizing: "border-box" as const,
  },
  pricingLine: {
    margin: 0,
    fontSize: "0.92rem",
    color: ivory,
    lineHeight: 1.5,
  },
  price: {
    color: gold,
    fontSize: "1.1rem",
  },
  priceSub: {
    color: "rgba(248,246,242,0.7)",
    fontSize: "0.82rem",
  },
  promoRow: {
    display: "flex",
    gap: 8,
    width: "100%",
  },
  promoBtn: {
    flex: "0 0 auto",
    padding: "12px 18px",
    borderRadius: 10,
    border: `1px solid ${gold}`,
    background: "rgba(216,167,56,0.9)",
    color: plum,
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    fontFamily: "inherit",
  },
  promoOk: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#9be7a8",
    fontWeight: 600,
  },
  promoErr: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#ffb4a8",
    fontWeight: 600,
  },
  promoNeutral: {
    margin: 0,
    fontSize: "0.85rem",
    color: "rgba(248,246,242,0.7)",
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
