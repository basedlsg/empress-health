"""Generate prds/hisNarratives.ts from empress_report_templates_reference.py.

Reads the Python TEMPLATES, MHT_OVERLAY, and SCIENCE_FOOTNOTES dicts and emits
a TypeScript module that exports the same data with stable typing. Run this
whenever the Python narratives change.
"""
import importlib.util
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
REPO = HERE.parent.parent

spec = importlib.util.spec_from_file_location(
    "rt", str(HERE / "empress_report_templates_reference.py")
)
rt = importlib.util.module_from_spec(spec)
sys.modules["rt"] = rt
spec.loader.exec_module(rt)


def js_string(s: str) -> str:
    return json.dumps(s)


lines = []
lines.append("/**")
lines.append(" * ╔══════════════════════════════════════════════════════════════════════════╗")
lines.append(" * ║   EMPRESS HEALTH — REPORT NARRATIVE TEMPLATE LIBRARY (TS PORT)           ║")
lines.append(" * ║   10 domains × 3 stages × 3 score bands = 90 modules                     ║")
lines.append(" * ╚══════════════════════════════════════════════════════════════════════════╝")
lines.append(" *")
lines.append(" * Auto-generated from scripts/.fixtures/empress_report_templates_reference.py")
lines.append(" * by scripts/.fixtures/build_narratives_ts.py. Do NOT edit by hand — re-run the")
lines.append(" * generator if you need to update copy.")
lines.append(" *")
lines.append(" * Usage:")
lines.append(" *   1. Look up module by (domainId, stage)")
lines.append(" *   2. Select narrative by domainBand (\"High\" | \"Moderate\" | \"Low\")")
lines.append(" *   3. Append flagItems text for any item where raw ≥ flag threshold")
lines.append(" *   4. Prepend MHT_OVERLAY[domainId] if mhtActive and domainId ∈ {1, 8}")
lines.append(" */")
lines.append("")
lines.append("import type { MenopauseStage, DomainBandLabel } from \"./assessmentTypes\"")
lines.append("")
lines.append("export type NarrativeModule = {")
lines.append("  /** DS 70–100 — positive, maintenance-focused tone. */")
lines.append("  high: string")
lines.append("  /** DS 35–69 — concern, action-oriented tone. */")
lines.append("  moderate: string")
lines.append("  /** DS 0–34 — significant concern, clinical referral tone. */")
lines.append("  low: string")
lines.append("  /** Item-level flag narratives, keyed by question number. */")
lines.append("  flagItems: Record<number, string>")
lines.append("}")
lines.append("")
lines.append("/** Stage keys used inside the TEMPLATES map. */")
lines.append("type NarrativeKey = `${number}_${MenopauseStage}`")
lines.append("")
lines.append("function key(domainId: number, stage: MenopauseStage): NarrativeKey {")
lines.append("  return `${domainId}_${stage}` as NarrativeKey")
lines.append("}")
lines.append("")
lines.append("/**")
lines.append(" * Shared clinical science footnotes. Inject under domain narratives where")
lines.append(" * appropriate (typically once per domain section).")
lines.append(" */")
lines.append("export const SCIENCE_FOOTNOTES: Record<number, string> = {")
for k in sorted(rt.SCIENCE_FOOTNOTES.keys()):
    lines.append(f"  {k}: {js_string(rt.SCIENCE_FOOTNOTES[k])},")
lines.append("}")
lines.append("")
lines.append("/**")
lines.append(" * MHT overlay copy injected before Domain 1 (Vasomotor) and Domain 8 (GU/Sexual)")
lines.append(" * narratives whenever the user reports active hormone therapy.")
lines.append(" */")
lines.append("export const MHT_OVERLAY: Record<number, string> = {")
for k in sorted(rt.MHT_OVERLAY.keys()):
    lines.append(f"  {k}: {js_string(rt.MHT_OVERLAY[k])},")
lines.append("}")
lines.append("")
lines.append("/**")
lines.append(" * 90 narrative modules indexed by `${domainId}_${stage}`.")
lines.append(" * Look up via getNarrative(domainId, stage, band) below.")
lines.append(" */")
lines.append("export const TEMPLATES: Record<NarrativeKey, NarrativeModule> = {")

# Sort keys by domain then stage for stable diff output
def sort_key(k):
    d, s = k
    stage_order = {"perimenopause": 0, "menopause": 1, "post_menopause": 2}
    return (d, stage_order.get(s, 99))

for (domain_id, stage_key) in sorted(rt.TEMPLATES.keys(), key=sort_key):
    module = rt.TEMPLATES[(domain_id, stage_key)]
    high = module.get("high", "")
    moderate = module.get("moderate", "")
    low = module.get("low", "")
    flag_items = module.get("flag_items", {})

    lines.append(f"  [`{domain_id}_{stage_key}`]: {{")
    lines.append(f"    high: {js_string(high)},")
    lines.append(f"    moderate: {js_string(moderate)},")
    lines.append(f"    low: {js_string(low)},")
    if flag_items:
        lines.append("    flagItems: {")
        for q in sorted(flag_items.keys()):
            lines.append(f"      {q}: {js_string(flag_items[q])},")
        lines.append("    },")
    else:
        lines.append("    flagItems: {},")
    lines.append("  },")

lines.append("}")
lines.append("")
lines.append("/**")
lines.append(" * Look up the narrative text for a given domain, stage, and band.")
lines.append(" * Returns null if the (domainId, stage) combination is not defined or the")
lines.append(" * band is \"Excluded\" (no narrative is rendered for excluded domains).")
lines.append(" */")
lines.append("export function getNarrative(")
lines.append("  domainId: number,")
lines.append("  stage: MenopauseStage,")
lines.append("  band: DomainBandLabel,")
lines.append("): string | null {")
lines.append("  const module = TEMPLATES[key(domainId, stage)]")
lines.append("  if (!module) return null")
lines.append("  if (band === \"High\") return module.high")
lines.append("  if (band === \"Moderate\") return module.moderate")
lines.append("  if (band === \"Low\") return module.low")
lines.append("  return null")
lines.append("}")
lines.append("")
lines.append("/** Return all flag-item narratives for a given (domainId, stage). */")
lines.append("export function getFlagItemNarratives(")
lines.append("  domainId: number,")
lines.append("  stage: MenopauseStage,")
lines.append("): Record<number, string> {")
lines.append("  const module = TEMPLATES[key(domainId, stage)]")
lines.append("  return module ? module.flagItems : {}")
lines.append("}")
lines.append("")

output = "\n".join(lines)
out_path = REPO / "prds" / "hisNarratives.ts"
out_path.write_text(output, encoding="utf-8")
print(f"Wrote {out_path} — {len(output)} chars, {output.count(chr(10))} lines")
print(f"Modules: {len(rt.TEMPLATES)}, MHT overlays: {len(rt.MHT_OVERLAY)}, science footnotes: {len(rt.SCIENCE_FOOTNOTES)}")
