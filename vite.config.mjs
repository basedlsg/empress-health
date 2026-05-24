import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/assessment/" : "/",
  root: "prds",
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
    open: true,
  },
}))
