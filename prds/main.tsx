import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { AssessmentFlow } from "./AssessmentFlow"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AssessmentFlow />
  </StrictMode>
)
