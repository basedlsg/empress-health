import { useEffect, useState } from "react"
import {
  reportPalette,
  reportFonts,
  reportStyles,
  reportPrintCSS,
  ScoreBadge,
  BandedProgressBar,
  type ReportStatus,
} from "./reportDesignSystem"

/**
 * Free Mini Health Assessment — 10 questions, ~2 minutes.
 * Rendered when /assessment/?tier=free. Self-contained: its own state
 * machine (intro → quiz → result), its own scoring, no API calls.
 *
 * The "Get Everything — $199" CTA sends the user into the full paid
 * assessment at /assessment/?tier=paid. The "Home" button returns to /.
 */

type QuestionOption = {
  label: string
  score: number
}

type Question = {
  id: number
  domain: string
  icon: string
  question: string
  options: QuestionOption[]
}

const questions: Question[] = [
  {
    id: 1,
    domain: "Sleep",
    icon: "🌙",
    question:
      "How often do you wake between 2–4am and struggle to fall back asleep?",
    options: [
      { label: "Never / Rarely", score: 0 },
      { label: "1–2 nights a week", score: 4 },
      { label: "3–4 nights a week", score: 7 },
      { label: "Almost every night", score: 10 },
    ],
  },
  {
    id: 2,
    domain: "Energy",
    icon: "⚡",
    question:
      "Do you hit a wall of fatigue mid-afternoon that no amount of coffee fixes?",
    options: [
      { label: "Never", score: 0 },
      { label: "Occasionally", score: 3 },
      { label: "Most days", score: 7 },
      { label: "Every single day — it's affecting my work", score: 10 },
    ],
  },
  {
    id: 3,
    domain: "Hormones",
    icon: "🌡️",
    question:
      "How often do you experience sudden heat flashes or night sweats?",
    options: [
      { label: "Not at all", score: 0 },
      { label: "Mild, a few times a week", score: 3 },
      { label: "Several times a day / night", score: 7 },
      { label: "Constant — disrupting sleep and daily life", score: 10 },
    ],
  },
  {
    id: 4,
    domain: "Brain",
    icon: "🧠",
    question:
      "Do you notice brain fog, word-finding problems, or memory gaps that feel new or worsening?",
    options: [
      { label: "No change from before", score: 0 },
      { label: "Mild and occasional", score: 3 },
      { label: "Moderate — I notice it at work or in conversations", score: 7 },
      { label: "Significant — it's alarming me", score: 10 },
    ],
  },
  {
    id: 5,
    domain: "Mood",
    icon: "💭",
    question:
      "In the days before your period (or generally if cycles have stopped), how is your emotional baseline?",
    options: [
      { label: "Stable and manageable", score: 0 },
      { label: "Some irritability or anxiety", score: 3 },
      { label: "Noticeable low mood, rage, or tearfulness", score: 7 },
      { label: "Severe — it impacts my relationships", score: 10 },
    ],
  },
  {
    id: 6,
    domain: "Cycle",
    icon: "🔄",
    question: "How would you describe your menstrual cycle over the last 6 months?",
    options: [
      { label: "Regular and predictable", score: 0 },
      { label: "Slightly irregular (a few days off)", score: 3 },
      { label: "Significantly irregular — skipping or much heavier/lighter", score: 7 },
      { label: "Cycles have stopped entirely", score: 10 },
    ],
  },
  {
    id: 7,
    domain: "Inflammation",
    icon: "🦴",
    question:
      "Do you experience new or worsening joint pain, stiffness, or muscle aches — especially in the morning?",
    options: [
      { label: "No", score: 0 },
      { label: "Mild stiffness that resolves quickly", score: 3 },
      { label: "Moderate — affects my movement or workouts", score: 7 },
      { label: "Significant — daily pain", score: 10 },
    ],
  },
  {
    id: 8,
    domain: "Metabolic",
    icon: "⚖️",
    question:
      "Have you gained weight around your midsection despite no real change in diet or exercise?",
    options: [
      { label: "No change", score: 0 },
      { label: "Slight shift — maybe 2–5 lbs", score: 3 },
      { label: "Noticeable belly fat gain I can't explain", score: 7 },
      { label: "Significant gain — nothing I try is working", score: 10 },
    ],
  },
  {
    id: 9,
    domain: "Hormonal Health",
    icon: "💫",
    question:
      "Have you noticed a decline in sexual desire, vaginal dryness, or discomfort during intimacy?",
    options: [
      { label: "No change", score: 0 },
      { label: "Mild decrease in desire", score: 3 },
      { label: "Noticeable change in desire and physical comfort", score: 7 },
      { label: "Significant — affecting my relationship or self-image", score: 10 },
    ],
  },
  {
    id: 10,
    domain: "Nervous System",
    icon: "🌿",
    question:
      "Do you experience new or worsening anxiety, dread, or feeling 'wired but tired' — especially at night?",
    options: [
      { label: "Rarely or never", score: 0 },
      { label: "Occasionally", score: 3 },
      { label: "Often — most weeks", score: 7 },
      { label: "Almost daily — it feels like a new version of me", score: 10 },
    ],
  },
]

type Result = {
  level: string
  color: string
  tagline: string
  message: string
  flagged: number
}

function getResult(score: number): Result {
  if (score >= 80) {
    return {
      level: "Thriving",
      color: "#4CAF88",
      tagline: "Your systems are largely in balance.",
      message:
        "Your body is managing the transition well — but peri+ menopause is dynamic. Small shifts now prevent bigger disruptions later. Your full report will map your 10 body systems in detail and show you exactly how to stay ahead.",
      flagged: 1,
    }
  }
  if (score >= 55) {
    return {
      level: "Early Signals",
      color: "#E8A84C",
      tagline: "Your body is sending early warning signs.",
      message:
        "You're in the zone where most women feel 'off' but can't pinpoint why. These early signals — if understood now — are completely addressable. Your full report flags 3–5 body systems and delivers a personalized protocol.",
      flagged: 3,
    }
  }
  if (score >= 30) {
    return {
      level: "Needs Attention",
      color: "#E07B4A",
      tagline: "Multiple systems are under stress.",
      message:
        "Your answers show meaningful disruption across several key domains. This isn't random — it's hormonal, metabolic, and neurological changes happening simultaneously. Your full report gives you a clinical-grade roadmap, not guesswork.",
      flagged: 5,
    }
  }
  return {
    level: "High Priority",
    color: "#C94F4F",
    tagline: "Your body needs clinical-level support now.",
    message:
      "What you're experiencing is real, significant, and treatable — but you need a system that sees the full picture. Your full Health Intelligence Report maps all 120 biomarkers, contextualizes your hormonal panel, and delivers a personalized action plan.",
    flagged: 7,
  }
}

type Phase = "intro" | "quiz" | "result"

export function FreeMiniAssessment() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>("intro")
  const [animating, setAnimating] = useState(false)
  const [scoreAnim, setScoreAnim] = useState(0)

  // 2026-05-16 slider re-flip: each option's `score` now encodes SEVERITY
  // (0 = most mild, 10 = most severe), so `totalScore` is a severity sum.
  // The final percent presented to the user stays wellness-aligned
  // (100 = all mild → Thriving, 0 = all severe → High Priority), so we
  // invert: percentScore = 100 − (severitySum / maxSeverity) × 100.
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
  const maxScore = questions.length * 10
  const percentScore = Math.round(100 - (totalScore / maxScore) * 100)
  const result = getResult(percentScore)

  useEffect(() => {
    if (phase !== "result") return
    let start = 0
    const end = percentScore
    const step = Math.max(1, Math.ceil(end / 40))
    const timer = window.setInterval(() => {
      start += step
      if (start >= end) {
        setScoreAnim(end)
        window.clearInterval(timer)
      } else {
        setScoreAnim(start)
      }
    }, 30)
    return () => window.clearInterval(timer)
  }, [phase, percentScore])

  const handleNext = () => {
    if (selected === null) return
    const score = questions[current].options[selected].score
    const newAnswers = { ...answers, [current]: score }
    setAnswers(newAnswers)
    setAnimating(true)
    window.setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1)
        setSelected(null)
      } else {
        setPhase("result")
      }
      setAnimating(false)
    }, 300)
  }

  const progress = (current / questions.length) * 100

  // All phases (intro, quiz, result) use the warm ivory + purple theme.
  const isLight = true

  const styles = {
    wrapper: {
      minHeight: "100vh",
      background: isLight
        ? "linear-gradient(145deg, #faf3e7 0%, #f4e8d4 40%, #ede0c8 100%)"
        : "linear-gradient(145deg, #1a0e14 0%, #2d1520 40%, #1f1018 100%)",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "20px",
      position: "relative" as const,
      overflow: "hidden" as const,
    },
    grain: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      pointerEvents: "none" as const,
      zIndex: 0,
    },
    glow1: {
      position: "fixed" as const,
      top: "-20%",
      right: "-10%",
      width: "500px",
      height: "500px",
      borderRadius: "50%",
      background: isLight
        ? "radial-gradient(circle, rgba(120,55,140,0.18) 0%, transparent 70%)"
        : "radial-gradient(circle, rgba(180,60,100,0.15) 0%, transparent 70%)",
      pointerEvents: "none" as const,
      zIndex: 0,
    },
    glow2: {
      position: "fixed" as const,
      bottom: "-20%",
      left: "-10%",
      width: "400px",
      height: "400px",
      borderRadius: "50%",
      background: isLight
        ? "radial-gradient(circle, rgba(155,95,175,0.14) 0%, transparent 70%)"
        : "radial-gradient(circle, rgba(120,40,80,0.12) 0%, transparent 70%)",
      pointerEvents: "none" as const,
      zIndex: 0,
    },
    card: {
      background: isLight
        ? "rgba(255,251,243,0.78)"
        : "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      border: isLight
        ? "1px solid rgba(107,45,128,0.18)"
        : "1px solid rgba(255,255,255,0.08)",
      borderRadius: "24px",
      padding: "48px 44px",
      maxWidth: "580px",
      width: "100%",
      position: "relative" as const,
      zIndex: 1,
      boxShadow: isLight
        ? "0 32px 80px rgba(63,20,73,0.18), inset 0 1px 0 rgba(255,255,255,0.6)"
        : "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
    },
    logo: {
      fontSize: "11px",
      letterSpacing: "4px",
      color: isLight ? "#6b2d80" : "#c4808a",
      textTransform: "uppercase" as const,
      marginBottom: "8px",
      fontFamily: "'Georgia', serif",
      fontStyle: "italic" as const,
    },
    headline: {
      fontSize: "32px",
      fontWeight: 400 as const,
      color: "#3f1449",
      lineHeight: 1.2,
      marginBottom: "12px",
      fontFamily: "'Georgia', serif",
    },
    subhead: {
      fontSize: "15px",
      color: "rgba(63,20,73,0.65)",
      lineHeight: 1.6,
      marginBottom: "36px",
      fontFamily: "'Georgia', serif",
      fontStyle: "italic" as const,
    },
    startBtn: {
      background: "linear-gradient(135deg, #6b2d80 0%, #3f1449 100%)",
      color: "#faf3e7",
      border: "none",
      borderRadius: "12px",
      padding: "16px 40px",
      fontSize: "15px",
      letterSpacing: "1.5px",
      textTransform: "uppercase" as const,
      cursor: "pointer" as const,
      fontFamily: "'Georgia', serif",
      boxShadow: "0 8px 32px rgba(63,20,73,0.32)",
      transition: "transform 0.2s, box-shadow 0.2s",
      display: "block" as const,
      width: "100%",
    },
    progressBar: {
      width: "100%",
      height: "3px",
      background: "rgba(63,20,73,0.12)",
      borderRadius: "2px",
      marginBottom: "32px",
      overflow: "hidden" as const,
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(90deg, #6b2d80, #b48ac9)",
      borderRadius: "2px",
      transition: "width 0.5s ease",
      width: `${progress}%`,
    },
    questionNum: {
      fontSize: "11px",
      letterSpacing: "3px",
      color: "#6b2d80",
      textTransform: "uppercase" as const,
      marginBottom: "6px",
    },
    domainTag: {
      display: "inline-block" as const,
      background: "rgba(107,45,128,0.10)",
      border: "1px solid rgba(107,45,128,0.28)",
      color: "#5a2370",
      fontSize: "11px",
      letterSpacing: "2px",
      textTransform: "uppercase" as const,
      padding: "4px 12px",
      borderRadius: "20px",
      marginBottom: "16px",
    },
    questionText: {
      fontSize: "20px",
      color: "#3f1449",
      lineHeight: 1.45,
      marginBottom: "28px",
      fontFamily: "'Georgia', serif",
      fontWeight: 400 as const,
    },
    optionBtn: (isSelected: boolean): React.CSSProperties => ({
      display: "block",
      width: "100%",
      textAlign: "left",
      background: isSelected
        ? "rgba(107,45,128,0.14)"
        : "rgba(255,251,243,0.6)",
      border: isSelected
        ? "1px solid rgba(107,45,128,0.55)"
        : "1px solid rgba(63,20,73,0.12)",
      borderRadius: "12px",
      padding: "14px 18px",
      marginBottom: "10px",
      color: isSelected ? "#3f1449" : "rgba(63,20,73,0.72)",
      fontSize: "14px",
      cursor: "pointer",
      fontFamily: "'Georgia', serif",
      fontStyle: "italic",
      transition: "all 0.2s",
      lineHeight: 1.4,
    }),
    nextBtn: (enabled: boolean): React.CSSProperties => ({
      background: enabled
        ? "linear-gradient(135deg, #6b2d80 0%, #3f1449 100%)"
        : "rgba(63,20,73,0.08)",
      color: enabled ? "#faf3e7" : "rgba(63,20,73,0.32)",
      border: "none",
      borderRadius: "12px",
      padding: "14px 32px",
      fontSize: "13px",
      letterSpacing: "2px",
      textTransform: "uppercase",
      cursor: enabled ? "pointer" : "not-allowed",
      fontFamily: "'Georgia', serif",
      marginTop: "8px",
      transition: "all 0.2s",
      boxShadow: enabled ? "0 8px 24px rgba(63,20,73,0.28)" : "none",
      width: "100%",
    }),
    scoreCircle: {
      width: "140px",
      height: "140px",
      borderRadius: "50%",
      border: `3px solid ${result.color}`,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 24px",
      background: `radial-gradient(circle, ${result.color}18 0%, transparent 70%)`,
      boxShadow: `0 0 40px ${result.color}30`,
    },
    scoreNum: {
      fontSize: "42px",
      fontWeight: 300 as const,
      color: result.color,
      lineHeight: 1,
      fontFamily: "'Georgia', serif",
    },
    scoreLabel: {
      fontSize: "10px",
      letterSpacing: "3px",
      textTransform: "uppercase" as const,
      color: "rgba(63,20,73,0.5)",
      marginTop: "4px",
    },
    resultLevel: {
      fontSize: "11px",
      letterSpacing: "4px",
      textTransform: "uppercase" as const,
      color: result.color,
      textAlign: "center" as const,
      marginBottom: "8px",
    },
    resultTagline: {
      fontSize: "22px",
      color: "#3f1449",
      textAlign: "center" as const,
      fontFamily: "'Georgia', serif",
      marginBottom: "16px",
      lineHeight: 1.3,
    },
    resultMessage: {
      fontSize: "14px",
      color: "rgba(63,20,73,0.7)",
      lineHeight: 1.7,
      textAlign: "center" as const,
      marginBottom: "28px",
      fontFamily: "'Georgia', serif",
      fontStyle: "italic" as const,
    },
    divider: {
      height: "1px",
      background: "rgba(63,20,73,0.14)",
      margin: "24px 0",
    },
    homeBtn: {
      background: "rgba(255,251,243,0.6)",
      color: "rgba(63,20,73,0.78)",
      border: "1px solid rgba(63,20,73,0.18)",
      borderRadius: "12px",
      padding: "14px 32px",
      fontSize: "13px",
      letterSpacing: "2px",
      textTransform: "uppercase" as const,
      cursor: "pointer" as const,
      fontFamily: "'Georgia', serif",
      width: "100%",
      marginTop: "12px",
      transition: "all 0.2s",
    },
  }

  const goToPaidAssessment = () => {
    window.location.href = "/assessment/?tier=paid"
  }

  const goHome = () => {
    window.location.href = "/"
  }

  /**
   * Generate a print-ready report in a new window and open the browser's
   * print dialog so the user can Save as PDF (or print to paper). Uses
   * native browser print-to-PDF — no external dependencies.
   */
  const downloadReport = () => {
    const today = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const esc = (s: string) =>
      s.replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string),
      )
    const color = result.color
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Empress Health · Free Mini Assessment Report</title>
<style>
  @page { size: letter; margin: 0.6in; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1f1b2d; margin: 0; padding: 32px 40px; line-height: 1.55; }
  .brand { color: #3f1449; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; font-style: italic; }
  h1 { font-size: 30px; margin: 10px 0 6px; font-weight: 400; }
  .date { color: #6e6a7a; font-size: 12px; margin-bottom: 20px; }
  .score-box { border: 2px solid ${color}; border-radius: 16px; padding: 24px; margin: 20px 0 28px; text-align: center; }
  .score-num { font-size: 64px; font-weight: 300; color: ${color}; line-height: 1; }
  .score-label { font-size: 11px; letter-spacing: 3px; color: #6e6a7a; text-transform: uppercase; margin-top: 4px; }
  .level { font-size: 12px; letter-spacing: 4px; color: ${color}; text-transform: uppercase; margin-top: 16px; font-weight: bold; }
  .tagline { font-size: 22px; margin: 10px 0 0; font-weight: 400; }
  .meta { color: #6e6a7a; font-size: 13px; margin-top: 12px; }
  .section { margin: 24px 0; }
  .section h3 { font-size: 17px; margin: 0 0 8px; font-weight: 400; color: #3f1449; }
  .message { font-size: 14px; color: #333; margin: 10px 0; }
  .cta { background: #faf4ec; border: 1px solid #e7d9c3; border-radius: 12px; padding: 16px 18px; font-size: 13px; color: #3f1449; margin-top: 12px; }
  .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e0d7c7; color: #6e6a7a; font-size: 11px; }
  .noprint { position: fixed; top: 16px; right: 16px; z-index: 10; }
  .noprint button { background: #3f1449; color: #fff; border: none; padding: 10px 18px; border-radius: 999px; font-family: inherit; font-size: 13px; cursor: pointer; }
  @media print { .noprint { display: none !important; } body { padding: 0; } }
</style>
</head>
<body>
  <div class="noprint"><button onclick="window.print()">Print / Save as PDF</button></div>
  <div class="brand">Empress Health.ai · Free Mini Assessment</div>
  <h1>Your Health Snapshot</h1>
  <div class="date">${esc(today)}</div>

  <div class="score-box">
    <div class="score-num">${percentScore}</div>
    <div class="score-label">/ 100</div>
    <div class="level">${esc(result.level)}</div>
    <div class="tagline">${esc(result.tagline)}</div>
    <div class="meta">${result.flagged} body systems flagged for deeper review</div>
  </div>

  <div class="section">
    <h3>What this means</h3>
    <p class="message">${esc(result.message)}</p>
  </div>

  <div class="section">
    <h3>Next step — Health Intelligence Report</h3>
    <p class="message">Your full picture is 12 layers deeper. The complete Health Intelligence Report maps all 120 biomarkers, contextualizes your hormonal panel against your symptoms, and delivers a personalized protocol built by menopause specialists.</p>
    <div class="cta">Unlock your full report at <strong>/assessment/?tier=paid</strong> — $199 one-time, no subscription.</div>
  </div>

  <div class="footer">
    This free preview is based on a 10-question screener. It is educational and not a medical diagnosis. Consult a licensed clinician for personal medical advice.
    <br/>&copy; ${new Date().getFullYear()} Empress Health.
  </div>

  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.focus(); window.print(); }, 400);
    });
  </script>
</body>
</html>`
    const w = window.open("", "_blank", "noopener,noreferrer")
    if (!w) {
      alert("Please allow pop-ups to download your report.")
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  /* ----- intro ----- */
  if (phase === "intro") {
    return (
      <div style={styles.wrapper}>
        <div style={styles.grain} />
        <div style={styles.glow1} />
        <div style={styles.glow2} />
        <div style={styles.card}>
          <div style={styles.logo}>Empress Health.ai</div>
          <h1 style={styles.headline}>
            Your Free Mini
            <br />
            Health Assessment
          </h1>
          <p style={styles.subhead}>
            10 questions. 2 minutes. A score across the 5 body systems
            <br />
            most disrupted during peri+ menopause.
          </p>
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "32px",
              flexWrap: "wrap",
            }}
          >
            {["Sleep", "Energy", "Brain", "Mood", "Body"].map((tag) => (
              <div
                key={tag}
                style={{
                  fontSize: "11px",
                  color: "rgba(107,45,128,0.7)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontFamily: "'Georgia', serif",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <button
            style={styles.startBtn}
            onMouseEnter={(e) => {
              const t = e.currentTarget
              t.style.transform = "translateY(-2px)"
              t.style.boxShadow = "0 12px 40px rgba(63,20,73,0.42)"
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget
              t.style.transform = "none"
              t.style.boxShadow = "0 8px 32px rgba(63,20,73,0.32)"
            }}
            onClick={() => setPhase("quiz")}
          >
            Begin Assessment
          </button>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(63,20,73,0.45)",
              textAlign: "center",
              marginTop: "16px",
              fontFamily: "'Georgia', serif",
            }}
          >
            Free · No account required · Results in 2 minutes
          </p>
        </div>
      </div>
    )
  }

  /* ----- result -----
   * Refactored to match the paid Health Intelligence Report template
   * (HealthAssessmentReporttemplate.pdf): cream page, plum hero with score
   * badge, sectioned white cards numbered 01-03, banded progress bar.
   *
   * Score level → status band mapping (so the badge and bar use the same
   * three colours as the paid report):
   *   Thriving (80+)        → Strong
   *   Early Signals (55-79) → Moderate
   *   Needs Attention (30-)
   *   High Priority (0-29)  → Priority
   */
  if (phase === "result") {
    const status: ReportStatus =
      percentScore >= 65 ? "Strong" : percentScore >= 50 ? "Moderate" : "Priority"

    const priorityDomains = Object.entries(answers)
      .map(([qIdx, score]) => ({
        domain: questions[Number(qIdx)].domain,
        icon: questions[Number(qIdx)].icon,
        score,
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, result.flagged)

    return (
      <div
        className="empress-report-page"
        style={{
          minHeight: "100vh",
          background: reportPalette.pageBg,
          fontFamily: reportFonts.body,
          color: "#1F1F1F",
        }}
      >
        <style>{reportPrintCSS}</style>

        {/* ─── HERO ─── */}
        <section
          style={{
            background: `linear-gradient(160deg, ${reportPalette.plum} 0%, ${reportPalette.plumLight} 100%)`,
            color: reportPalette.ivory,
            padding: "32px 24px 48px",
          }}
        >
          <div
            style={{
              maxWidth: 860,
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 32,
            }}
          >
            <div style={{ flex: "1 1 360px" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  color: reportPalette.gold,
                  display: "block",
                  marginBottom: 12,
                }}
              >
                EMPRESS HEALTH.AI · FREE MINI ASSESSMENT
              </span>
              <h1
                style={{
                  fontFamily: reportFonts.display,
                  fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  margin: "0 0 12px",
                  color: reportPalette.ivory,
                }}
              >
                Your Peri+ Menopause
                <br />
                Health Snapshot
              </h1>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "rgba(248,246,242,0.6)",
                  margin: 0,
                }}
              >
                {new Date().toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
                {" · Free Preview · 10 questions"}
              </p>
            </div>
            <div
              style={{
                flex: "0 0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: reportFonts.display,
                  fontSize: "4.5rem",
                  fontWeight: 700,
                  lineHeight: 1,
                  color: reportPalette.gold,
                }}
              >
                {scoreAnim}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(248,246,242,0.55)",
                }}
              >
                Health Intelligence Score
              </span>
              <span
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "#fff",
                  padding: "4px 14px",
                  borderRadius: 999,
                  textTransform: "uppercase",
                  background: result.color,
                }}
              >
                {result.level}
              </span>
            </div>
          </div>
        </section>

        {/* ─── 01 YOUR HEALTH SNAPSHOT ─── */}
        <section
          className="empress-report-section"
          style={reportStyles.section}
        >
          <h2 style={reportStyles.sectionHeading}>01 Your Health Snapshot</h2>
          <div style={reportStyles.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <h3
                style={{
                  fontFamily: reportFonts.display,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: reportPalette.plum,
                  margin: 0,
                }}
              >
                {result.tagline}
              </h3>
              <ScoreBadge score={percentScore} status={status} size="md" />
            </div>
            <BandedProgressBar score={percentScore} status={status} />
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "0.92rem",
                color: "#444",
                lineHeight: 1.65,
              }}
            >
              {result.message}
            </p>
          </div>
        </section>

        {/* ─── 02 TOP PRIORITY AREAS ─── */}
        <section
          className="empress-report-section"
          style={reportStyles.section}
        >
          <h2 style={reportStyles.sectionHeading}>
            02 Your Top {priorityDomains.length} Priority Areas
          </h2>
          <p style={reportStyles.sectionLede}>
            These body systems flagged hardest on your screener. The full
            assessment maps each one across 10–12 clinical questions and
            delivers a personalised action plan.
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            {priorityDomains.map((d, i) => (
              <div
                key={i}
                style={{
                  ...reportStyles.card,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>
                  {d.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: reportFonts.display,
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: reportPalette.plum,
                      marginBottom: 4,
                    }}
                  >
                    {d.domain}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: reportPalette.priority,
                    }}
                  >
                    Priority
                  </div>
                </div>
                <ScoreBadge
                  score={Math.round((d.score / 10) * 100)}
                  status="Priority"
                  size="sm"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ─── 03 UNLOCK THE FULL ASSESSMENT ─── */}
        <section
          className="empress-report-section"
          style={{ ...reportStyles.section, paddingBottom: 40 }}
        >
          <h2 style={reportStyles.sectionHeading}>
            03 Unlock the Full Assessment
          </h2>
          <div style={reportStyles.card}>
            <h3
              style={{
                fontFamily: reportFonts.display,
                fontSize: "1.2rem",
                fontWeight: 700,
                color: reportPalette.plum,
                margin: "0 0 8px",
              }}
            >
              Your full picture is 12 layers deeper.
            </h3>
            <p
              style={{
                fontSize: "0.92rem",
                color: "#555",
                lineHeight: 1.65,
                margin: "0 0 22px",
              }}
            >
              The Health Intelligence Report maps all 120 biomarkers,
              contextualises your hormonal panel against your symptoms, and
              delivers a personalised protocol — built by menopause
              specialists.
            </p>

            {/* Price anchor */}
            <div
              style={{
                background: reportPalette.mhtBannerBg,
                border: `1px solid ${reportPalette.gold}66`,
                borderRadius: 12,
                padding: "16px 20px",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: reportPalette.plum,
                  opacity: 0.7,
                  marginBottom: 8,
                  fontWeight: 700,
                }}
              >
                Total value
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "center",
                  gap: 14,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: "1.4rem",
                    color: "#a07a2a",
                    textDecoration: "line-through",
                    fontFamily: reportFonts.display,
                  }}
                >
                  $499
                </span>
                <span style={{ color: "#aaa", fontSize: "1rem" }}>→</span>
                <span
                  style={{
                    fontSize: "2.4rem",
                    color: reportPalette.plum,
                    fontFamily: reportFonts.display,
                    fontWeight: 700,
                  }}
                >
                  $199
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: reportPalette.plum,
                  opacity: 0.6,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                One-time · No subscription
              </div>
            </div>

            {/* Feature grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: 10,
                marginBottom: 24,
              }}
            >
              {[
                { icon: "📋", title: "20-Page Report", desc: "All 10 body systems" },
                { icon: "🩺", title: "Clinician Match", desc: "Specialist referral" },
                { icon: "🧪", title: "Menopause Panel", desc: "Hormonal panel decoded" },
                { icon: "📱", title: "Daily Uplift", desc: "Morning affirmations" },
                { icon: "🛍️", title: "Curated Products", desc: "Clean marketplace" },
                { icon: "🌿", title: "Free Luxury Gift", desc: "$75 Empress product", highlight: true },
                { icon: "🥗", title: "Anti-Inflam Diet", desc: "Built for your stage" },
                { icon: "🏃‍♀️", title: "Exercise Protocol", desc: "Tailored to your body" },
                { icon: "💊", title: "Supplement Stack", desc: "Biomarker-targeted" },
                { icon: "💬", title: "Ask Empress 24/7", desc: "Always on chatbot" },
                { icon: "🎤", title: "Specialist Talks", desc: "Live expert sessions" },
              ].map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: f.highlight
                      ? reportPalette.mhtBannerBg
                      : "#FAF4E9",
                    border: f.highlight
                      ? `1px solid ${reportPalette.gold}`
                      : `1px solid ${reportPalette.cardBorder}`,
                    borderRadius: 10,
                    padding: "12px 12px 14px",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 6, lineHeight: 1 }}>
                    {f.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: reportFonts.display,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: reportPalette.plum,
                      marginBottom: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {f.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#666",
                      lineHeight: 1.4,
                    }}
                  >
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={goToPaidAssessment}
              className="empress-no-print"
              style={{
                background: reportPalette.plum,
                color: "#fff",
                border: 0,
                borderRadius: 999,
                padding: "14px 28px",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                width: "100%",
                boxShadow: "0 4px 14px rgba(63,20,73,0.25)",
                fontFamily: reportFonts.body,
              }}
            >
              Begin Full Assessment →
            </button>
          </div>
        </section>

        {/* ─── ACTION ROW (download / home / retake) ─── */}
        <section
          className="empress-report-section empress-no-print"
          style={{ ...reportStyles.section, paddingBottom: 60 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
            }}
          >
            <button
              onClick={downloadReport}
              style={{
                background: "#fff",
                color: reportPalette.plum,
                border: `1px solid ${reportPalette.plum}33`,
                borderRadius: 999,
                padding: "12px 20px",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: reportFonts.body,
              }}
            >
              ⬇  Download (PDF)
            </button>
            <button
              onClick={goHome}
              style={{
                background: "#fff",
                color: reportPalette.plum,
                border: `1px solid ${reportPalette.plum}33`,
                borderRadius: 999,
                padding: "12px 20px",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: reportFonts.body,
              }}
            >
              ← Home
            </button>
            <button
              onClick={() => {
                setCurrent(0)
                setAnswers({})
                setSelected(null)
                setPhase("intro")
                setScoreAnim(0)
              }}
              style={{
                background: "transparent",
                color: `${reportPalette.plum}99`,
                border: `1px solid transparent`,
                borderRadius: 999,
                padding: "12px 20px",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontFamily: reportFonts.body,
              }}
            >
              Retake assessment
            </button>
          </div>
        </section>
      </div>
    )
  }
  /* Legacy glassmorphism result block was here (~370 lines). It has been
   * replaced by the cream-and-plum report-template version above so the
   * Free Mini result now matches HealthAssessmentReporttemplate.pdf.
   *
   * The unused `styles.scoreCircle / scoreNum / scoreLabel / resultLevel /
   * resultTagline / resultMessage / divider` entries are kept in the
   * `styles` object below for backward compatibility (TypeScript is happy
   * with them being defined and never referenced).
   */
  /* Dead-code branch removed — the prior glassmorphism result block lived
   * here (~370 lines of <div style={styles.scoreCircle}/>, etc.) and has
   * been superseded by the cream-and-plum template above. The unused
   * style refs (scoreCircle, scoreNum, scoreLabel, resultLevel,
   * resultTagline, resultMessage, divider) remain defined in `styles` for
   * backward compatibility with any external callers — `noUnusedLocals` is
   * not enabled in tsconfig.json so this is safe.
   */

  /* ----- quiz ----- */
  const q = questions[current]
  return (
    <div style={styles.wrapper}>
      <div style={styles.grain} />
      <div style={styles.glow1} />
      <div style={styles.glow2} />
      <div
        style={{
          ...styles.card,
          opacity: animating ? 0 : 1,
          transition: "opacity 0.3s",
        }}
      >
        <div style={styles.logo}>Empress Health.ai</div>
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>
        <div style={styles.questionNum}>
          Question {current + 1} of {questions.length}
        </div>
        <div style={styles.domainTag}>
          {q.icon} {q.domain}
        </div>
        <div style={styles.questionText}>{q.question}</div>
        {q.options.map((opt, i) => (
          <button
            key={i}
            style={styles.optionBtn(selected === i)}
            onClick={() => setSelected(i)}
          >
            {opt.label}
          </button>
        ))}
        <button
          style={styles.nextBtn(selected !== null)}
          disabled={selected === null}
          onClick={handleNext}
        >
          {current === questions.length - 1 ? "See My Results" : "Next Question →"}
        </button>
      </div>
    </div>
  )
}
