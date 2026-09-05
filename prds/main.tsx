import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { AssessmentFlow } from "./AssessmentFlow"
import { ErrorBoundary } from "./ErrorBoundary"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AssessmentFlow />
    </ErrorBoundary>
  </StrictMode>
)
