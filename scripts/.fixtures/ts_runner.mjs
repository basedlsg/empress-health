/**
 * Runs the TS HIS engine for a single payload (argv[2]) and writes the
 * result as JSON to stdout. Invoked by the parity test harness via tsx.
 */
import { runAssessment } from "../../prds/hisEngine.ts"

const payload = JSON.parse(process.argv[2])
const result = runAssessment(payload)
process.stdout.write(JSON.stringify(result))
