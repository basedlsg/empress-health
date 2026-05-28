/**
 * Empress Health — Shared Report Design System
 *
 * Single source of truth for the visual language used by every report:
 *   - The paid 20-page Health Intelligence Report (AssessmentReportScreen.tsx, paid tier)
 *   - The free preview report (AssessmentReportScreen.tsx, free tier)
 *   - The free mini result (FreeMiniAssessment.tsx)
 *   - The downloadable / emailed B2 PDF (rendered server-side from the same React tree)
 *
 * The template the team aligned on is `HealthAssessmentReporttemplate.pdf`
 * (a print of /assessment/?tier=paid with section hero photos overlaid).
 *
 * What lives here:
 *   - `reportPalette`   — colour tokens (plum, gold, ivory, banding colours)
 *   - `reportFonts`     — font stacks
 *   - `reportStyles`    — re-usable React.CSSProperties for cards, headings, badges
 *   - `reportPrintCSS`  — print stylesheet (paged PDF / window.print parity)
 *   - React components: <ScoreBadge>, <BandedProgressBar>, <NumberedSectionHero>,
 *     <InterludeHero>, <CalloutCard>, <DoDontTable>, <SectionFeedback>,
 *     <LuxuryGiftHero>, <RecommendationListItem>
 *
 * Image slot contract:
 *   Section heroes resolve to `/report-heroes/<slug>.jpg` (drop-in folder).
 *   If a file is missing the <img> hides itself via onError and the section
 *   degrades to a plain heading + body. See /public/report-heroes/README.md.
 */

import * as React from "react"

/* ───────────────────────── Tokens ───────────────────────── */

export const reportPalette = {
  // Brand
  plum: "#3F144A",
  plumLight: "#472052",
  gold: "#D8A738",
  ivory: "#F3E5D3",

  // Surfaces
  pageBg: "#F4E5C8",        // cream/peach page (PDF print)
  cardBg: "#FFFFFF",
  cardBorder: "rgba(63,20,73,0.08)",
  cardShadow: "0 2px 12px rgba(42,15,63,0.05)",

  // Bands
  priority: "#C0392B",
  moderate: "#D4A017",
  strong: "#27AE60",

  // Progress bar bands
  progressLow: "#C0392B",     // 0–49 (Priority)
  progressMid: "#F4D2D5",     // 50–64 band fill
  progressMidHigh: "#EBE1C8", // 65–84 band fill
  progressHigh: "#D6E7DC",    // 85–100 band fill

  // Callouts
  ochre: "#D4A017",
  ochreText: "#3F144A",
  feedbackBg: "#E9DFEF",
  feedbackBorder: "#D4C6E0",
  mintCard: "#E8F1E9",
  mhtBannerBg: "#FFF5DA",
} as const

export const reportFonts = {
  body: "'Avenir', 'Avenir Next', 'Nunito Sans', system-ui, sans-serif",
  display: "'The Seasons', 'Playfair Display', system-ui, sans-serif",
} as const

/* ───────────────────────── Status helpers ───────────────────────── */

export type ReportStatus = "Priority" | "Moderate" | "Strong"

export function reportStatusColor(status: ReportStatus): string {
  if (status === "Priority") return reportPalette.priority
  if (status === "Moderate") return reportPalette.moderate
  return reportPalette.strong
}

/**
 * Slug → /report-heroes/<slug>.<ext> URL. Hero photos drop into /public/.
 *
 * The components consume this in a fallback chain (jpg → png → svg → hide)
 * so the team can drop any of those file types into the folder and the
 * report picks the first one that loads. JPG wins when present, which
 * lets photography overrule the SVG placeholders Empress Health shipped
 * with the 2026-05 launch.
 */
export const REPORT_HERO_EXTENSIONS = ["jpg", "png", "svg"] as const
export type ReportHeroExtension = (typeof REPORT_HERO_EXTENSIONS)[number]

export function reportHeroSrc(
  slug: string,
  ext: ReportHeroExtension = "jpg",
): string {
  return `/report-heroes/${slug}.${ext}`
}

/* ───────────────────────── Shared style fragments ───────────────────────── */

export const reportStyles: Record<string, React.CSSProperties> = {
  // Page-level
  pageBg: {
    background: reportPalette.pageBg,
  },
  section: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "40px 24px 0",
  },
  sectionHeading: {
    fontFamily: reportFonts.display,
    fontSize: "clamp(1.2rem, 3vw, 1.7rem)",
    fontWeight: 700,
    color: reportPalette.plum,
    margin: "0 0 20px",
  },
  sectionLede: {
    margin: "0 0 18px",
    fontSize: "0.92rem",
    color: "#555",
    lineHeight: 1.6,
  },

  // Generic white card
  card: {
    background: reportPalette.cardBg,
    borderRadius: 14,
    padding: "24px 28px",
    border: `1px solid ${reportPalette.cardBorder}`,
    boxShadow: reportPalette.cardShadow,
  },

  // Ochre callout (KEEP DOING / LIFESTYLE LEVER / PRESERVE WITH CLINICIAN)
  calloutOchre: {
    background: reportPalette.ochre,
    color: reportPalette.ochreText,
    borderRadius: 10,
    padding: "16px 18px",
  },
  calloutOchreEyebrow: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: reportPalette.plum,
    marginBottom: 8,
    display: "block",
  },
  calloutOchreText: {
    margin: 0,
    fontSize: "0.88rem",
    lineHeight: 1.55,
    color: reportPalette.plum,
  },

  // Lavender feedback box (per-section "How does this resonate…")
  feedback: {
    background: reportPalette.feedbackBg,
    border: `1px solid ${reportPalette.feedbackBorder}`,
    borderRadius: 14,
    padding: "18px 22px",
    marginTop: 24,
  },
}

/* ───────────────────────── Print CSS ───────────────────────── */
/**
 * Inject once at the top of any report screen via <style>{reportPrintCSS}</style>.
 * Mirrors the existing print rules in AssessmentReportScreen so server-side
 * Playwright print-to-PDF produces the same paged layout as window.print().
 */
export const reportPrintCSS = `
@page {
  size: A4;
  margin: 14mm 12mm;
}

@media print {
  /* Hide chrome the user shouldn't see in print */
  nav, .empress-no-print, .empress-feedback-box, button.empress-no-print {
    display: none !important;
  }

  .empress-report-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* Section hero photos must keep their colour fills */
  body, .empress-report-page, .empress-section-hero {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Numbered hero pages start fresh */
  .empress-numbered-hero {
    break-before: page;
    page-break-before: always;
  }

  h1, h2, h3 {
    break-after: avoid;
    page-break-after: avoid;
  }
}
`

/* ───────────────────────── <ScoreBadge> ─────────────────────────
 * Big score number with `/ 100` suffix. Colour-coded by status.
 * Matches the "25 / 100" hero shown on every domain card in the template.
 */

export function ScoreBadge({
  score,
  status,
  size = "md",
}: {
  score: number
  status: ReportStatus
  size?: "sm" | "md" | "lg"
}) {
  const fontSize = size === "lg" ? "3rem" : size === "sm" ? "1.6rem" : "2.4rem"
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 4,
        fontFamily: reportFonts.display,
        color: reportStatusColor(status),
        lineHeight: 1,
      }}
      aria-label={`Score ${score} out of 100, ${status.toLowerCase()} band`}
    >
      <span style={{ fontSize, fontWeight: 700 }}>{score}</span>
      <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#777" }}>
        / 100
      </span>
    </span>
  )
}

/* ───────────────────────── <BandedProgressBar> ─────────────────────────
 * Four-band horizontal bar (0–49 red, 50–64 pink, 65–84 cream, 85–100 mint)
 * with a darker fill showing the actual score. Matches the template exactly.
 */

export function BandedProgressBar({
  score,
  status,
  showLabels = true,
}: {
  score: number
  status: ReportStatus
  showLabels?: boolean
}) {
  const clamped = Math.max(0, Math.min(100, score))
  const fillColor = reportStatusColor(status)

  return (
    <div style={{ width: "100%" }}>
      {/* Banded track */}
      <div
        style={{
          position: "relative",
          height: 10,
          borderRadius: 999,
          overflow: "hidden",
          display: "flex",
          background: reportPalette.progressMid,
        }}
      >
        <span style={{ flex: "0 0 50%", background: reportPalette.progressMid }} />
        <span style={{ flex: "0 0 15%", background: reportPalette.progressMidHigh }} />
        <span style={{ flex: "0 0 35%", background: reportPalette.progressHigh }} />
        {/* Score fill on top */}
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${clamped}%`,
            background: fillColor,
            borderRadius: 999,
          }}
        />
      </div>
      {showLabels && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
            fontSize: "0.72rem",
            color: "#7a6c66",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>0</span>
          <span>50</span>
          <span>65</span>
          <span>100</span>
        </div>
      )}
    </div>
  )
}

/* ───────────────────────── <NumberedSectionHero> ─────────────────────────
 * The big "01 Menopause Stage & Overview" / "02 All 10 Domain Scores"
 * hero card with a photo and a floating tan label tag.
 *
 * Falls back to a plain heading if the hero photo at /report-heroes/<slug>.jpg
 * is missing — drop-in folder makes this safe to ship without art assets.
 */

export function NumberedSectionHero({
  number,
  title,
  slug,
  altText,
}: {
  number: string
  title: string
  slug: string
  altText?: string
}) {
  // Walk the extension fallback chain on each onError. Once we run past the
  // end of the list, `extIndex >= length` flips `imgFailed` and the section
  // degrades to a clean heading-only layout.
  const [extIndex, setExtIndex] = React.useState(0)
  const imgFailed = extIndex >= REPORT_HERO_EXTENSIONS.length
  return (
    <div
      className="empress-numbered-hero empress-section-hero"
      style={{
        background: reportPalette.pageBg,
        borderRadius: 24,
        padding: 18,
        margin: "0 0 24px",
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 18,
          overflow: "hidden",
          background: "#3F144A",
          minHeight: imgFailed ? 0 : 220,
        }}
      >
        {!imgFailed && (
          <img
            src={reportHeroSrc(slug, REPORT_HERO_EXTENSIONS[extIndex])}
            alt={altText ?? title}
            onError={() => setExtIndex((i) => i + 1)}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "cover" as const,
            }}
          />
        )}
        {/* Fallback label only — rendered when the banner image fails to load.
         * The previous floating "NN. Title" tag overlay was removed so the
         * report1-report8 photo banners render without a redundant HTML
         * label on top (the section number / title is already part of the
         * banner art). */}
        {imgFailed && (
          <div
            style={{
              padding: "10px 18px",
              color: reportPalette.plum,
              fontFamily: reportFonts.display,
              fontWeight: 700,
              fontSize: "0.95rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: reportPalette.gold, fontSize: "1.1rem" }}>
              {number}.
            </span>
            <span>{title}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────── <InterludeHero> ─────────────────────────
 * The smaller "• Sleep Hygiene" / "• Brain Fog" / "• Anti-inflammation Diet"
 * intro pages — bullet-prefixed plum title above a wide photo, plus body.
 */

export function InterludeHero({
  title,
  slug,
  body,
  attribution,
  altText,
}: {
  title: string
  slug: string
  body: React.ReactNode
  attribution?: string
  altText?: string
}) {
  const [extIndex, setExtIndex] = React.useState(0)
  const imgFailed = extIndex >= REPORT_HERO_EXTENSIONS.length
  return (
    <section
      className="empress-report-section empress-section-hero"
      style={{ ...reportStyles.section, paddingTop: 32 }}
    >
      <h2
        style={{
          ...reportStyles.sectionHeading,
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color: reportPalette.gold }}>•</span>
        {title}
      </h2>
      {!imgFailed && (
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            marginBottom: 18,
            background: "#3F144A",
          }}
        >
          <img
            src={reportHeroSrc(slug, REPORT_HERO_EXTENSIONS[extIndex])}
            alt={altText ?? title}
            onError={() => setExtIndex((i) => i + 1)}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      )}
      <div
        style={{
          fontSize: "0.95rem",
          lineHeight: 1.7,
          color: "#333",
        }}
      >
        {body}
      </div>
      {attribution && (
        <p
          style={{
            marginTop: 18,
            fontSize: "0.85rem",
            color: "#7a6c66",
            fontStyle: "italic",
          }}
        >
          — {attribution}
        </p>
      )}
    </section>
  )
}

/* ───────────────────────── <CalloutCard> ─────────────────────────
 * Mustard/ochre rectangle used for KEEP DOING, LIFESTYLE LEVER,
 * CLINICIAN CONVERSATION, PRESERVE WITH YOUR CLINICIAN, and affirmation tiles.
 */

export function CalloutCard({
  eyebrow,
  children,
  italic = false,
}: {
  eyebrow?: string
  children: React.ReactNode
  italic?: boolean
}) {
  return (
    <div style={reportStyles.calloutOchre}>
      {eyebrow && (
        <span style={reportStyles.calloutOchreEyebrow}>{eyebrow}</span>
      )}
      <p
        style={{
          ...reportStyles.calloutOchreText,
          fontStyle: italic ? "italic" : "normal",
        }}
      >
        {children}
      </p>
    </div>
  )
}

/* ───────────────────────── <DoDontTable> ─────────────────────────
 * The "Do's / Don'ts" two-column table used by the Anti-inflammation Diet
 * interlude. Each row is a category (Fish & Seafood, Meat & Poultry, etc.)
 * with do/don't bullet lists.
 */

export type DoDontRow = {
  category: string
  icon?: string // image URL or emoji
  dos: string[]
  donts: string[]
}

export function DoDontTable({ rows }: { rows: DoDontRow[] }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          paddingBottom: 8,
          borderBottom: `1px solid ${reportPalette.cardBorder}`,
        }}
      >
        <strong style={{ color: reportPalette.plum, fontSize: "1rem" }}>
          Do's
        </strong>
        <strong style={{ color: reportPalette.plum, fontSize: "1rem" }}>
          Don't's
        </strong>
      </div>
      {rows.map((row, i) => (
        <div
          key={row.category}
          style={{
            ...reportStyles.card,
            padding: "18px 20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <div>
            <h4
              style={{
                margin: "0 0 10px",
                fontSize: "0.95rem",
                color: reportPalette.plum,
                fontFamily: reportFonts.display,
              }}
            >
              {i + 1}. {row.category}{" "}
              {row.icon && <span style={{ marginLeft: 4 }}>{row.icon}</span>}
            </h4>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.82rem", lineHeight: 1.6, color: "#333", wordBreak: "normal", overflowWrap: "anywhere" }}>
              {row.dos.map((d, j) => (
                <li key={j} style={{ marginBottom: 6 }}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ visibility: "hidden", margin: "0 0 10px", fontSize: "0.95rem" }}>.</h4>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.82rem", lineHeight: 1.6, color: "#333", wordBreak: "normal", overflowWrap: "anywhere" }}>
              {row.donts.map((d, j) => (
                <li key={j} style={{ marginBottom: 6 }}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ───────────────────────── Default content for the three interludes ─────────────────────────
 *
 * Used by AssessmentReportScreen when the user's priority domains include
 * Sleep, Cognitive Function, or Metabolic / Lifestyle respectively.
 * Empress clinical team can edit this copy in one place.
 */

export const SLEEP_HYGIENE_BODY = `Poor sleep in perimenopause is not an inconvenience to be managed. It is a clinical condition with measurable downstream consequences for cardiovascular health, metabolic function, cognitive resilience, bone density, and immune competence. Every night of restorative sleep is an act of physiological preservation, not a luxury.

The system in this section is built on the mechanisms specific to your hormonal transition. It is designed to give you the kind of precision and depth that a specialist consultation would provide, mapped to your biology, sequenced for implementation, and grounded in the clinical evidence base for this specific life stage.`

export const BRAIN_FOG_BODY = `Brain fog is the symptom perimenopausal women most frequently dismiss as stress, age, or overwork and the one that most reliably signals that something hormonal is driving it. It is not vague. It is not a precise biological mechanism.

Oestrogen is a powerful neuroprotective hormone. It supports the production of acetylcholine the neurotransmitter responsible for memory encoding and retrieval, and regulates serotonin and dopamine, which govern focus, motivation, and mental clarity. As oestrogen fluctuates and declines in perimenopause, the brain's chemical scaffolding becomes unstable. Synaptic transmission slows. Working memory is compromised. The hippocampus the brain's memory centre, becomes temporarily less efficient at consolidating new information.

Simultaneously disrupted sleep is robbing the brain of its nightly glymphatic clearance, the wash cycle that removes metabolic waste from neural tissue. Disrupted cortisol directly impairs prefrontal cortex function, the region responsible for focus, decision-making, and emotional regulation. The result is a brain fighting on three fronts at once: hormonal, sleep-related, and stress-related. The good news: it is reversible.`

/** Sleep Hygiene Do's/Don'ts — template pages 24–27. Six numbered protocols
 * rendered after the Sleep Hygiene interlude hero. */
export const SLEEP_HYGIENE_ROWS: DoDontRow[] = [
  {
    category: "Sleep Environment",
    icon: "🛏️",
    dos: [
      "Set bedroom temperature to 65°F.",
      "Install full blackout curtains, not blinds.",
      "Use Tencel (eucalyptus lyocell) sheets.",
      "Layer bedding so covers can be removed easily on waking.",
      "Run continuous low-level brown or pink noise at a barely audible volume.",
      "Reserve the bed strictly for sleep.",
    ],
    donts: [
      "Don't accept \"room temperature\" — above 75°F is too warm for a perimenopausal thermostat.",
      "Don't use white blinds; they don't mask light.",
      "Don't sleep under synthetic microfibre — it traps heat and amplifies vasomotor events.",
      "Don't keep a smartphone in the room, even face-down.",
      "Don't read, scroll, work, or watch TV in bed.",
      "Don't lie in bed awake longer than 20 minutes — get up, dim the light, return when sleepy.",
    ],
  },
  {
    category: "Evening & Pre-Sleep Routine",
    icon: "🌙",
    dos: [
      "Take a warm shower (104°F, 10 minutes) 75–90 minutes before sleep.",
      "Practice the physiological sigh for 5 minutes when wired-but-tired.",
      "Breath work — slow to 6 breaths per minute (5s in, 5s out) at the first sign of a hot flash.",
      "Apply a cold compress to wrists and neck at 9 p.m. if hot flashes continue.",
    ],
    donts: [
      "Don't shower immediately before bed.",
      "Don't type your worry list on a phone or laptop — handwriting is better.",
      "Don't take hot drinks, spicy food, or hot baths after 7 p.m.",
      "Don't exercise vigorously inside the 4-hour pre-sleep window.",
    ],
  },
  {
    category: "Supplementation",
    icon: "💊",
    dos: [
      "Take magnesium glycinate 300–400 mg at 9 p.m.",
      "Use 0.5 mg pharmaceutical melatonin.",
      "Take ashwagandha 600 mg daily, split AM/PM, standardised extract only.",
      "Treat supplements as a support layer over the profile protocol.",
      "Consult your doctor or clinician before taking any supplements.",
    ],
    donts: [
      "Don't substitute magnesium oxide or citrate for glycinate — absorption is inferior.",
      "Don't expect chamomile tea to deliver an active apigenin dose — it's negligible.",
      "Don't buy unstandardised ashwagandha powders — potency is unreliable.",
      "Don't keep cycling through new supplements past 8 weeks if there's no benefit.",
      "Don't treat supplementation as a replacement for the underlying hormonal mechanism.",
    ],
  },
  {
    category: "Morning Anchoring & Light",
    icon: "☀️",
    dos: [
      "Hold a fixed wake time 7 days a week — variance under 30 minutes.",
      "Step outside within 10 minutes of waking for 5–10 minutes, no sunglasses.",
      "Use a 10,000 lux lamp at breakfast on overcast days — before phone, before coffee.",
      "Hold the wake anchor even after a poor night — this feels wrong but is correct.",
    ],
    donts: [
      "Don't sleep in on weekends — it dismantles the cortisol reset you've built all week.",
      "Don't get your morning light through a window.",
      "Don't check your phone before light exposure.",
      "Don't delay light by stopping for coffee first — the order matters.",
    ],
  },
  {
    category: "Exercise Timing",
    icon: "🏃‍♀️",
    dos: [
      "Complete all HIIT and heavy strength training by 3 p.m.",
      "Keep evening movement to walking, gentle stretching, or restorative yoga.",
      "Time training to the morning where possible — cortisol-aligned and circadian-supportive.",
    ],
    donts: [
      "Don't do evening HIIT if you're Profile C — cortisol takes 6–8 hours to clear.",
      "Don't lift heavy after 3 p.m. during an active 2 a.m. waking phase.",
      "Don't use late-evening exercise to \"tire yourself out\" — it produces the opposite effect.",
    ],
  },
  {
    category: "When to Escalate to a Clinician",
    icon: "🩺",
    dos: [
      "Consult a menopause specialist after 8 consistent weeks if there's no meaningful improvement.",
      "Escalate immediately if you're experiencing 5+ vasomotor events per night.",
      "Raise sleep disruption alongside any mood symptoms — they share the same hormonal root.",
      "Discuss systemic hormonal therapy if cycles are irregular.",
      "Review current HRT evidence — the literature has been substantially reanalysed since 2002.",
    ],
    donts: [
      "Don't keep cycling through new supplements past the 8-week mark.",
      "Don't dismiss 5+ nightly flashes as something to push through.",
      "Don't separate sleep and mood symptoms — treating them in isolation rarely works.",
      "Don't anchor your view of HRT to outdated literature.",
      "Don't accept impairment in work, relationships, or safety-critical function as acceptable.",
    ],
  },
]

/** Brain Fog Do's/Don'ts — template pages 28–29. Two numbered protocols
 * rendered after the Brain Fog interlude hero. */
export const BRAIN_FOG_ROWS: DoDontRow[] = [
  {
    category: "Cognitive & Lifestyle",
    icon: "🧠",
    dos: [
      "Prioritise 7–9 hours of quality sleep — the brain clears metabolic waste during deep sleep.",
      "Exercise daily, especially aerobic movement — 30 min of brisk walking, cycling, or swimming raises BDNF.",
      "Practice daily mindfulness or breathwork — 5–10 minutes of box breathing (inhale 4, hold 4, exhale 4, hold 4) lowers cortisol.",
      "Do one cognitively stimulating activity daily — reading, puzzles, learning, or journaling strengthen neural pathways.",
    ],
    donts: [
      "Don't rely on caffeine to power through — coffee after 2 p.m. disrupts sleep and creates a fog-fatigue cycle.",
      "Avoid constant multitasking — rapid task-switching depletes prefrontal-cortex energy.",
      "Don't skip rest when overwhelmed — pushing through spikes cortisol, which shrinks the hippocampus over time.",
      "Avoid over-scheduling your day — decision fatigue depletes the brain's limited glucose reserves by midday.",
    ],
  },
  {
    category: "Hydration & Nutrition",
    icon: "💧",
    dos: [
      "Drink 8+ glasses of water daily — even mild dehydration (1–2%) reduces concentration, working memory, and mood.",
      "Eat omega-3-rich foods regularly — salmon, sardines, walnuts, and flaxseed support myelin and reduce neuroinflammation.",
      "Include choline-rich foods — eggs, edamame, and broccoli support acetylcholine for memory and focus.",
      "Eat protein at every meal — amino acids are precursors to dopamine and serotonin.",
    ],
    donts: [
      "Avoid ultra-processed and high-sugar foods — blood-sugar crashes cause immediate mental fog.",
      "Don't drink alcohol regularly — it disrupts REM sleep, depletes cognition-critical vitamins, and worsens hormonal imbalance.",
      "Don't skip meals or fast aggressively — the brain needs consistent glucose; skipping breakfast impairs memory.",
      "Avoid trans fats and excess seed oils — they promote neuroinflammation and poorer cognition in midlife.",
    ],
  },
]

export const ANTI_INFLAMMATION_INTRO = `Chronic, low-grade inflammation is the silent driver of nearly every menopausal symptom that resists symptom-by-symptom treatment. The shift in oestrogen is itself pro-inflammatory; layered on top of a Western diet, it produces the joint pain, brain fog, metabolic disruption, and accelerated skin ageing that define this transition for most women.

The diet below is the most evidence-backed intervention for this physiological state. It is not a weight-loss plan. It is a precision anti-inflammation protocol calibrated to the biology of peri+ menopause.`

/** Non-vegetarian Do's/Don'ts — page 12/13 of the template. */
export const ANTI_INFLAMMATION_ROWS_NONVEG: DoDontRow[] = [
  {
    category: "Fish & Seafood",
    icon: "🐟",
    dos: [
      "Wild caught salmon 2x per week (highest EPA/DHA, supresses NF-kB inflammatory cascade).",
      "Sardines & mackerel in olive oil omega-3 + calcium + CoQ10 for heart protection.",
      "Oysters & mussels weekly richest dietary zinc for immune & wound healing.",
      "Wild shrimp & scallops astaxanthin is a 6,000x stronger antioxidant than vit. E.",
      "Anchovies in sauces & dressings low-mercury, high omega-3, easy daily add.",
    ],
    donts: [
      "Farmed Atlantic salmon reversed omega-3:6 ratio, net pro-inflammatory effect.",
      "High-mercury fish: swordfish, shark, king mackerel mercury drives neuro-inflammation & brain fog.",
      "Battered & deep-fried fish omega-3s destroyed, replaced with oxidised inflammatory frying oils.",
      "Fast-food seafood & fish & chips trans-fat-laden oils activate inflammatory gene pathways.",
      "Imitation crab / surimi ultra-processed, omega-3, dyes & fillers disrupt.",
    ],
  },
  {
    category: "Meat & Poultry",
    icon: "🍗",
    dos: [
      "Grass-fed beef max 2× per week 3–5× higher CLA & omega-3 than grain-fed; supports lean mass.",
      "Pasture-raised chicken & turkey higher choline (cognitive support).",
      "Grass-fed beef liver 1× per month CoQ10, B12, retinol, iron, most nutrient-dense food on earth.",
      "Bone broth daily glycine + collagen reduces intestinal permeability & gut inflammation.",
      "Pasture-raised lamb iron, B12, CLA, meaningful anti-inflammatory fatty acid profile.",
      "Keep portions palm size (3-4 oz) excess saturated fat moves NF-kB inflammatory load up.",
    ],
    donts: [
      "Processed meats: bacon, sausage, deli meats, hot dogs WHO Group 1 carcinogen; nitrates + AGEs spike IL-6.",
      "Grain-fed factory meats daily high arachidonic acid, downstream prostaglandins.",
      "High-temp BBQ char heterocyclic amines, polycyclic aromatic hydrocarbons (HCAs).",
      "Fast-food burgers & fried chicken/seed-oil combo brain & joint inflammation.",
      "Fast-food seafood & fish & chips trans-fat-laden oils activate inflammatory pathways.",
      "Meat at the plate centre/every meal crowds out the anti-inflammatory veg quota.",
    ],
  },
  {
    category: "Eggs & Dairy",
    icon: "🥚",
    dos: [
      "Pasture-raised eggs 1–2 daily choline elevates LDL & cholin oxide drives systemic inflam.",
      "Full-fat plain Greek yogurt daily Lactobacillus reuteri rebuilds the gut B microbiome (best fermented for women).",
      "Kefir (dairy or water-based) 30 probiotic strains; reduces TNF-α & restores serotonin function.",
      "Aged hard cheeses (parmesan, cheddar, gruyère) K2 directs calcium to bones & teeth, away from arteries.",
      "Ghee for high-heat cooking stable saturated fat, no inflammatory casein.",
    ],
    donts: [
      "Skimmed & low-fat dairy strips vitamins A, D, E, K2, replaced with sugar or inflammatory thickeners.",
      "Flavoured yogurts (fruit-on-the-bottom) 15-20g added sugar (causes pre-diabetes).",
      "Factory-farmed caged eggs zero omega-3 calcium deposits in arteries instead of bones, drives heart disease.",
      "Processed cheese slices & spreads emulsifiers, food dyes, partial hydrogenation drive vascular inflammation.",
      "Milk-shake & ice-cream daily lactose + glucose insulin spike cycle drives weight gain.",
    ],
  },
]

/** Vegetarian Do's/Don'ts — page 14 of the template. */
export const ANTI_INFLAMMATION_ROWS_VEG: DoDontRow[] = [
  {
    category: "Vegetables & Fruits",
    icon: "🥦",
    dos: [
      "Cruciferous veg every day (DIM & sulforaphane activate Nrf2; support liver clearance of spent oestrogens).",
      "Berries daily 1 cup (anthocyanin lower hippocampal inflam; cognitive resilience).",
      "Leafy greens every meal (magnesium + B2 + folate boost serotonin & gaba on PMS/anxiety days).",
      "Colourful bell peppers, tomatoes, red cabbage (lycopene cuts cardiovascular inflam markers by 30%+).",
      "Leafy greens at every meal magnesium + B2 + folate lower depressive symptoms by ~30%.",
      "Raw garlic & onion daily allicin & quercetin inhibit COX-2 (potent prostaglandin inhibitor).",
    ],
    donts: [
      "Overcooked, boiled soft vegetables destroys sulforaphane, vitamin C, & heat-sensitive polyphenols.",
      "Iceberg lettuce as base near zero phytonutrient content.",
      "Fruit juices ineffectively glycemic load; spike insulin; drive abdominal fat & inflammation.",
      "Canned fruit in syrup HFCS spikes uric acid; accelerates joint pain.",
      "Eating only 3-4 vegetables on rotation minimum diet diversity for the microbiome.",
      "Skipping vegetables at breakfast missing a critical first-meal anti-inflammatory window.",
    ],
  },
  {
    category: "Carbs, Grains & Sugar",
    icon: "🌾",
    dos: [
      "Quinoa & farro as main grains low GI quinoa = complete protein, beneficial in plant-only diets.",
      "Steel-cut oats at breakfast beta-glucan fibre lowers CRP 30–35% (a major systemic inflammation marker).",
      "Lentils & chickpeas resistant starch feeds Lactobacillus strains.",
      "Soaked nuts (almonds, walnuts) 1 oz per day polyphenols + magnesium + selenium ALA.",
      "Legumes 4–5 servings per week resistant starch feeds Akkermansia muciniphila.",
      "Sourdough or sprouted bread lower-gluten fructans, less digestive inflammation.",
    ],
    donts: [
      "White bread, white rice, white pasta daily GI 70–80, each meal drives 6–8 CRP elevation within hours.",
      "Breakfast cereals (even \"wholegrain\") extruded, ultra-processed, hidden sugar; drives inflammatory glycaemic load.",
      "Added sugars (>25g/day) drives AGE formation, glycates cartilage & accelerates joint ageing.",
      "High-fructose corn syrup drives liver fructose accumulates uric acid; promotes joint pain.",
      "Refined seed-oil snacks crackers, biscuits omega-6 inflammation generators.",
      "Agave, rice malt, \"natural\" syrups in large amounts (still fructose, still inflammatory).",
    ],
  },
]

/** Gut + herbs page — page 15 of the template. */
export const ANTI_INFLAMMATION_ROWS_GUT: DoDontRow[] = [
  {
    category: "Gut Health & Fermented Foods",
    icon: "🥬",
    dos: [
      "Kimchi & sauerkraut 2–3 tbsp daily Lactobacillus plantarum reduces intestinal permeability & LPS-related inflammation.",
      "Miso soup unpasteurised (added off heat) brassinosteroids & savoury-bitter compounds activate Nrf2.",
      "Kefir (dairy or coconut-based) 30 microbial strains.",
      "Full-fat yogurt daily L. reuteri rebuilds bowel-vaginal microbiome disrupted by hormone decline.",
      "Garlic, onion, leek & asparagus daily FOS & inulin feed Akkermansia & anti-inflammatory microbiome.",
      "Apple-cider vinegar 1 tbsp before meals raises stomach acid (commonly low in mid-life) & gut diversity by 30–40%.",
      "Aim for 30+ different plant foods per week diversity is the #1 predictor of microbiome anti-inflammatory output.",
    ],
    donts: [
      "Pasteurised supermarket kombucha has killed probiotics; high sugar content negates benefits.",
      "Artificial sweeteners in diet sodas: aspartame, sucralose depletes Bifidobacterium within 2 days.",
      "Mass-market sweetened yogurts triggers blood sugar spikes negating fermented benefit.",
      "Live fibre diet dominated by meat & dairy starves Akkermansia & other anti-inflammatory species.",
      "Eating only 3–4 vegetables on rotation minimum diet diversity for the microbiome.",
      "Antibiotics unless absolutely needed essential course; consider lactobacillus rhamnosus GG to recover.",
    ],
  },
  {
    category: "Herbs, Spices & Supplements",
    icon: "🌿",
    dos: [
      "Turmeric + black pepper daily curcumin 95% absorption boost up to 2,000% with pepperine.",
      "Fresh ginger in food or tea (gingerols inhibit COX-2 & 5-LOX similarly to NSAID's without GI risk).",
      "Cinnamon ½ tsp / day lowers fasting glucose & inflammation; supports insulin sensitivity in midlife.",
      "Matcha or green tea 2 cups before 3pm (EGCG inhibits NF-kB; suppresses pro-inflammatory cytokines without caffeine crash).",
      "Magnesium glycinate 300–400mg at night (anti-inflammatory + GABA support for sleep).",
      "Vitamin D3 + K2 supplement 25-Hg directly inflammation cytokines, K2 directs calcium back to bone.",
      "Omega-3 supplement (1.5–3g/d total EPA+DHA daily) lowers IL-6 & TNF-α.",
    ],
    donts: [
      "Caffeine after 2pm in the half-life delays sleep, disrupts cortisol decline, drives inflammation.",
      "Alcohol nightly even 1 drink night-cap reduces deep sleep & raises 6 inflammatory IL-6 / next-day inflammation.",
      "Pumpkin pie spice / cinnamon mix in sugar-laden lattes net pro-inflammatory.",
      "Commercial salad dressings hidden refined oils & sugar.",
      "Multivitamin gummies cheap forms of nutrients minimal absorption.",
      "Iron supplements in midlife without bloodwork (excess iron drives oxidative stress when post-menopausal).",
      "Alcohol as a nightly wind-down despite GABA-like sedation, deeply pro-inflammatory at all doses.",
    ],
  },
]

/* ───────────────────────── <LuxuryGiftHero> ─────────────────────────
 * The "Your free $75 luxury gift, on us." card from page 18 of the template.
 * Stand-alone component because the form/submit logic lives elsewhere.
 */

export function LuxuryGiftHero({
  firstName,
  slug = "luxury-gift",
}: {
  firstName?: string | null
  slug?: string
}) {
  const [extIndex, setExtIndex] = React.useState(0)
  const imgFailed = extIndex >= REPORT_HERO_EXTENSIONS.length
  return (
    <section
      className="empress-report-section empress-section-hero"
      style={{ ...reportStyles.section, paddingTop: 24 }}
    >
      <div
        style={{
          background: "#F8E5B8",
          borderRadius: 18,
          padding: 24,
          display: "grid",
          gridTemplateColumns: imgFailed ? "1fr" : "1fr 1fr",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div>
          <span style={reportStyles.calloutOchreEyebrow}>A little thank you</span>
          <h2 style={{ ...reportStyles.sectionHeading, marginBottom: 12 }}>
            YOU WILL GET A LUXURY WELCOME GIFT
          </h2>
          <p style={{ margin: 0, fontSize: "0.92rem", color: "#5a4a14", lineHeight: 1.6 }}>
            Free with your $139 personalised report — or any $12/month
            installment plan. Hand-picked from the Empress wellness collection.
            Drop your email below and we'll coordinate shipping personally.
          </p>
        </div>
        {!imgFailed && (
          <img
            src={reportHeroSrc(slug, REPORT_HERO_EXTENSIONS[extIndex])}
            alt="Empress wellness gift"
            onError={() => setExtIndex((i) => i + 1)}
            style={{
              width: "100%",
              borderRadius: 14,
              display: "block",
              boxShadow: "0 6px 20px rgba(63,20,73,0.15)",
            }}
          />
        )}
      </div>
    </section>
  )
}
