import { Component, type ErrorInfo, type ReactNode } from "react"

/**
 * Minimal, dependency-free error boundary for the assessment SPA.
 *
 * Without this, an unguarded exception anywhere in the ~4k-line report tree
 * white-screens the whole page at the exact moment a paying user expects their
 * report. This catches the render failure and degrades to a reassuring retry
 * state instead. Self-contained (inline styles, brand colours hard-coded) so
 * the fallback itself can never depend on something that just failed.
 */

type Props = { children: ReactNode }
type State = { hasError: boolean }

const PLUM = "#3F144A"
const GOLD = "#D8A738"
const IVORY = "#F3E5D3"

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface for logging/monitoring; never rethrow.
    console.error("[assessment] render error caught by ErrorBoundary:", error, info?.componentStack)
  }

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
          background: `linear-gradient(165deg, ${PLUM} 0%, #472052 100%)`,
          color: IVORY,
          fontFamily: "'Avenir', 'Nunito Sans', system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: GOLD,
              marginBottom: 18,
            }}
          >
            Empress Health
          </p>
          <h1 style={{ fontSize: "1.75rem", lineHeight: 1.3, margin: "0 0 12px" }}>
            Something went wrong displaying your report
          </h1>
          <p style={{ fontSize: "0.95rem", opacity: 0.8, margin: "0 0 24px", lineHeight: 1.6 }}>
            Your answers are safe. This is a display issue on our end — please try
            again, and if it keeps happening, contact us at hello@empresshealth.ai.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: GOLD,
              color: PLUM,
              border: "none",
              padding: "0.85rem 2.5rem",
              borderRadius: 100,
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
}
