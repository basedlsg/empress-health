import type { CSSProperties } from "react"

type Variant = "dark" | "light"

/**
 * Shared link back to the main Empress site from the /assessment/ SPA.
 */
export function AssessmentSiteNav({ variant = "dark" }: { variant?: Variant }) {
  const t = tokens[variant]
  return (
    <div style={bar.wrap}>
      <a href="/" style={{ ...bar.link, color: t.ink }}>
        <img
          src="/public/EmpressHealthlogo.png"
          alt=""
          width={36}
          height={36}
          style={bar.logo}
        />
        <span style={bar.label}>EmpressHealth.ai</span>
      </a>
      <span style={{ ...bar.pipe, color: t.pipe }} aria-hidden>
        |
      </span>
      <a href="/" style={{ ...bar.subtle, color: t.accent, borderBottomColor: t.accent }}>
        ← Main site
      </a>
    </div>
  )
}

// Aligned to site palette from index.html :root
const gold = "#D8A738"
const plum = "#3f1449"

const tokens: Record<
  Variant,
  { ink: string; pipe: string; accent: string }
> = {
  dark: {
    ink: "rgba(248,246,242,0.95)",
    pipe: "rgba(248,246,242,0.35)",
    accent: gold,
  },
  light: {
    ink: plum,
    // rgba of #3f1449 (site --primary) at 25% opacity
    pipe: "rgba(63,20,73,0.25)",
    // site --primary-600 (#4b2577) for the light-variant accent
    accent: "#4b2577",
  },
}

const bar: Record<string, CSSProperties> = {
  wrap: {
    width: "100%",
    maxWidth: 520,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap" as const,
    gap: "8px 14px",
    marginBottom: 20,
  },
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  logo: {
    display: "block",
    borderRadius: 8,
  },
  label: {
    letterSpacing: "0.02em",
  },
  pipe: {
    fontWeight: 300,
  },
  subtle: {
    fontSize: "0.88rem",
    fontWeight: 600,
    textDecoration: "none",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    paddingBottom: 1,
  },
}
