/**
 * enrich-pinecone-seed.mjs
 * Adds structured metadata to each chunk in the Empress 120 seed file.
 * Run: node scripts/enrich-pinecone-seed.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Source / Dest paths ──────────────────────────────────────────────────────
const SRC  = join(ROOT, "pinecone_data", "empress-120-symptom-biomarker-framework-records.json");
const DEST = join(ROOT, "pinecone_data", "empress-120-symptom-biomarker-framework-records.enriched.json");
const REPORT = join(ROOT, "pinecone_data", "seed-enrichment-report.md");

// ─── Domain → Category slug mapping (from assessmentQuestions.ts) ────────────
const DOMAIN_SLUGS = {
  1:  "vasomotor-temperature",
  2:  "sleep-architecture-cortisol",
  3:  "cognitive-function-brain-health",
  4:  "mood-anxiety-emotional-health",
  5:  "metabolic-health-body-composition",
  6:  "skin-hair-nails",
  7:  "musculoskeletal-bone-health",
  8:  "genitourinary-sexual-health",
  9:  "cardiovascular-whole-body-energy",
  10: "lifestyle-gut-health-nutrition",
};

// ─── Domain Q-number ranges (from hisEngine.ts DOMAIN_CONFIG) ────────────────
const DOMAIN_RANGES = {
  1:  [1,  12],
  2:  [13, 23],
  3:  [24, 35],
  4:  [36, 48],
  5:  [49, 60],
  6:  [61, 72],
  7:  [73, 84],
  8:  [85, 96],
  9:  [97, 108],
  10: [109, 120],
};

function qInDomain(q) {
  for (const [d, [lo, hi]] of Object.entries(DOMAIN_RANGES)) {
    if (q >= lo && q <= hi) return Number(d);
  }
  return null;
}

// ─── Keyword signals per domain ───────────────────────────────────────────────
// Each entry: { patterns: RegExp[], qKeywords: string[] }
// We use case-insensitive matching throughout.
const DOMAIN_SIGNALS = {
  1: {
    patterns: [
      /vasomotor/i, /hot flash/i, /night sweat/i, /temperature regulation/i,
      /thermoregulat/i, /thermoneutral/i, /estradiol decline/i, /FSH/i,
      /facial flush/i, /chills after/i, /heat intolerance/i,
      /CATEGORY 1/i, /palpitation/i,
    ],
  },
  2: {
    patterns: [
      /sleep architecture/i, /cortisol rhythm/i, /CATEGORY 2/i,
      /sleep onset/i, /night waking/i, /wired.but.tired/i,
      /progesterone.*(sleep|GABA)/i, /melatonin/i, /restless leg/i,
      /nap depend/i, /deep sleep/i, /REM/i, /sleep.*fragment/i,
      /2.?4.?am/i, /HPA axis/i, /cortisol awakening/i,
    ],
  },
  3: {
    patterns: [
      /cognitive function/i, /brain health/i, /CATEGORY 3/i,
      /brain fog/i, /word.find/i, /memory lapse/i, /concentration/i,
      /processing speed/i, /BDNF/i, /acetylcholine/i, /hippocampal/i,
      /ApoE/i, /dementia/i, /cerebral glucose/i, /neuroprotective/i,
      /mental endurance/i, /decision fatigue/i,
    ],
  },
  4: {
    patterns: [
      /mood.*anxiet/i, /emotional health/i, /CATEGORY 4/i,
      /anxiety/i, /dread or doom/i, /irritability/i, /rage episode/i,
      /emotional volatil/i, /depressive episode/i, /panic attack/i,
      /allopregnanolone/i, /serotonin/i, /progesterone deficien/i,
      /social withdrawal/i, /identity disconnection/i, /tearful/i,
    ],
  },
  5: {
    patterns: [
      /metabolic health/i, /body composition/i, /CATEGORY 5/i,
      /weight gain/i, /visceral fat/i, /insulin resist/i,
      /muscle tone/i, /abdominal bloat/i, /sugar.*craving/i,
      /waist circumference/i, /energy crash/i, /fluid retention/i,
      /leptin/i, /sarcopenia/i, /metabolic slow/i,
    ],
  },
  6: {
    patterns: [
      /skin.*hair.*nail/i, /CATEGORY 6/i, /collagen/i,
      /skin dryn/i, /hair shedding/i, /eyebrow thin/i,
      /nail brit/i, /adult acne/i, /facial hair/i,
      /skin thin/i, /wound heal/i, /hyperpigment/i, /melasma/i,
      /skin luminosity/i,
    ],
  },
  7: {
    patterns: [
      /musculoskeletal/i, /bone health/i, /CATEGORY 7/i,
      /joint pain/i, /joint stiff/i, /bone densit/i, /DEXA/i,
      /FRAX/i, /fracture/i, /osteoporo/i, /muscle ache/i,
      /grip strength/i, /plantar/i, /frozen shoulder/i,
      /height loss/i, /vertebral/i, /back pain/i,
    ],
  },
  8: {
    patterns: [
      /genitourinary/i, /sexual health/i, /CATEGORY 8/i,
      /vaginal dryn/i, /GSM/i, /dyspareunia/i, /pain.*intercourse/i,
      /libido/i, /arousal/i, /urinary urgency/i, /bladder/i,
      /recurrent UTI/i, /stress incontinence/i, /vaginal atrophy/i,
      /vaginal estrogen/i, /ospemifene/i, /pelvic floor/i,
    ],
  },
  9: {
    patterns: [
      /cardiovascular/i, /whole.body energy/i, /CATEGORY 9/i,
      /heart palpitation/i, /blood pressure/i, /breathless/i,
      /HRV/i, /resting heart rate/i, /chest tightness/i,
      /dizziness on standing/i, /orthostatic/i, /cardiac/i,
      /aerobic capacity/i, /exercise.*recovery/i,
    ],
  },
  10: {
    patterns: [
      /lifestyle.*gut/i, /gut health/i, /CATEGORY 10/i,
      /alcohol intol/i, /phytoestrogen/i, /plant.*diversity/i,
      /fermented food/i, /screen.*before bed/i, /morning sunlight/i,
      /resistance training/i, /stress management/i, /hydration/i,
      /caffeine timing/i, /omega.3/i, /estrobolome/i, /gut.*microbi/i,
    ],
  },
};

// ─── Category header patterns per domain (from the PDF text) ─────────────────
const CATEGORY_HEADER_PATTERNS = {
  1:  /CATEGORY 1/i,
  2:  /CATEGORY 2/i,
  3:  /CATEGORY 3/i,
  4:  /CATEGORY 4/i,
  5:  /CATEGORY 5/i,
  6:  /CATEGORY 6/i,
  7:  /CATEGORY 7/i,
  8:  /CATEGORY 8/i,
  9:  /CATEGORY 9/i,
  10: /CATEGORY 10/i,
};

// ─── Q-number extraction regex ────────────────────────────────────────────────
// Matches patterns like: "01\nHot Flash", "#57", "Q57", "Question 57", "#83"
const Q_PATTERNS = [
  /\b(?:Q|Question\s+|#\s*)([1-9][0-9]{0,2})\b/gi,
  // bare number at line start followed by known symptom keywords (1-2 digit only)
  /^(\d{1,3})\n[A-Z][a-z]/gm,
];

function extractQuestionIds(text) {
  const found = new Set();

  // Pattern 1: Q57, #57, Question 57
  const re1 = /\b(?:Q|Question\s+|#\s*)([1-9][0-9]{0,2})\b/gi;
  let m;
  while ((m = re1.exec(text)) !== null) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 120) found.add(n);
  }

  // Pattern 2: lines that start with a 2-digit number then newline then capital letter
  // e.g. "01\nHot Flash" or "57\nWaist"
  const re2 = /(?:^|\n)(\d{2,3})\n[A-Z]/gm;
  while ((m = re2.exec(text)) !== null) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 120) found.add(n);
  }

  // Pattern 3: plain number followed by newline — single digit (less reliable, only take if small range)
  const re3 = /(?:^|\n)(\d{1,2})\n[A-Z]/gm;
  while ((m = re3.exec(text)) !== null) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 120) found.add(n);
  }

  return [...found].sort((a, b) => a - b);
}

// ─── System tag detection ─────────────────────────────────────────────────────
const SYSTEM_TAG_PATTERNS = {
  E: [/estrogen/i, /estradiol/i, /estrobol/i, /MHT/i, /HRT/i, /menopause hormone/i],
  T: [/thyroid/i, /TSH/i, /T3/i, /T4/i, /hypothyroid/i, /hyperthyroid/i],
  C: [/cortisol/i, /HPA axis/i, /adrenal/i, /pregnenolone/i, /cortisol rhythm/i],
  M: [/insulin/i, /glucose/i, /metabolic/i, /leptin/i, /visceral fat/i, /glycogen/i, /mitochondr/i],
  N: [/neurotransmitter/i, /dopamine/i, /serotonin/i, /BDNF/i, /acetylcholine/i, /norepinephrine/i, /GABA/i, /brain/i],
  G: [/gut/i, /microbi/i, /Lactobacillus/i, /estrobolome/i, /gastric/i, /motility/i, /intestinal/i, /ferment/i],
  B: [/bone/i, /DEXA/i, /FRAX/i, /fracture/i, /osteoporo/i, /collagen/i, /joint/i, /cartilage/i, /vertebr/i],
};

function detectSystemTags(text) {
  const tags = new Set();
  for (const [tag, patterns] of Object.entries(SYSTEM_TAG_PATTERNS)) {
    if (patterns.some((p) => p.test(text))) tags.add(tag);
  }
  return [...tags].sort();
}

// ─── Stage relevance detection ────────────────────────────────────────────────
const STAGE_PATTERNS = {
  perimenopause: [/perimenopaus/i, /peri-menopaus/i, /menopause transition/i, /early.*menopaus/i, /transition/i, /perimenopausal/i],
  menopause:     [/\bmenopause\b/i, /menopausal\b/i, /menopaus[ae]\s/i],
  post_menopause:[/post.menopaus/i, /postmenopaus/i, /POI/i, /premature ovarian/i],
};

function detectStageRelevance(text) {
  const stages = new Set();
  for (const [stage, patterns] of Object.entries(STAGE_PATTERNS)) {
    if (patterns.some((p) => p.test(text))) stages.add(stage);
  }
  // If menopause is mentioned at all, assume also relevant to menopause
  if (stages.has("perimenopause") || stages.has("post_menopause")) {
    stages.add("menopause");
  }
  // Default: all stages if nothing specific
  if (stages.size === 0) {
    stages.add("perimenopause");
    stages.add("menopause");
    stages.add("post_menopause");
  }
  return [...stages];
}

// ─── Clinical topic detection ─────────────────────────────────────────────────
const CLINICAL_TOPIC_PATTERNS = [
  [/\bMHT\b/i,                       "MHT"],
  [/\bHRT\b/i,                       "HRT"],
  [/fezolinetant/i,                  "fezolinetant"],
  [/\bDEXA\b/i,                      "DEXA"],
  [/\bFRAX\b/i,                      "FRAX"],
  [/\bGSM\b/i,                       "GSM"],
  [/\bPOI\b/i,                       "POI"],
  [/vaginal estrogen/i,              "vaginal estrogen"],
  [/ospemifene/i,                    "ospemifene"],
  [/phytoestrogen/i,                 "phytoestrogen"],
  [/CBT-I/i,                         "CBT-I"],
  [/\bmagnesium\b/i,                 "magnesium"],
  [/\bberberine\b/i,                 "berberine"],
  [/\bcreatine\b/i,                  "creatine"],
  [/\bomega.3\b/i,                   "omega-3"],
  [/bisphosphonate/i,                "bisphosphonate"],
  [/\bSSRI|SNRI\b/i,                 "SSRIs/SNRIs"],
  [/testosterone/i,                  "testosterone"],
  [/progesterone/i,                  "progesterone"],
  [/estradiol/i,                     "estradiol"],
  [/ApoE/i,                          "ApoE genotyping"],
  [/\bBDNF\b/i,                      "BDNF"],
  [/HbA1c/i,                         "HbA1c"],
  [/\bHRV\b/i,                       "HRV"],
  [/continuous glucose monitor/i,    "CGM"],
  [/MCT oil/i,                       "MCT oil"],
  [/estrobolome/i,                   "estrobolome"],
  [/pelvic floor physiotherapy/i,    "pelvic floor physio"],
  [/allopregnanolone/i,              "allopregnanolone"],
  [/resistance training/i,           "resistance training"],
  [/PHQ-9/i,                         "PHQ-9"],
];

function detectClinicalTopics(text) {
  const topics = new Set();
  for (const [pattern, label] of CLINICAL_TOPIC_PATTERNS) {
    if (pattern.test(text)) topics.add(label);
  }
  return [...topics];
}

// ─── Main enrichment ──────────────────────────────────────────────────────────
function enrichChunk(chunk) {
  const text = chunk.content;

  // 1. Domain detection
  const domainIds = new Set();

  // Check category headers first (strong signal)
  for (const [d, pattern] of Object.entries(CATEGORY_HEADER_PATTERNS)) {
    if (pattern.test(text)) domainIds.add(Number(d));
  }

  // Check domain-specific keyword patterns
  for (const [d, { patterns }] of Object.entries(DOMAIN_SIGNALS)) {
    const matchCount = patterns.filter((p) => p.test(text)).length;
    if (matchCount >= 2) domainIds.add(Number(d));
  }

  // Derive domain from question IDs found in text
  const questionIds = extractQuestionIds(text);
  for (const q of questionIds) {
    const d = qInDomain(q);
    if (d) domainIds.add(d);
  }

  // If nothing detected and chunk_index === "0" it's the intro
  const domainIdsArr = [...domainIds].sort((a, b) => a - b);

  // 2. Category slugs from domain IDs
  const categorySlugs = domainIdsArr.map((d) => DOMAIN_SLUGS[d]).filter(Boolean);

  // 3. System tags
  const systemTags = detectSystemTags(text);

  // 4. Stage relevance
  const stageRelevance = detectStageRelevance(text);

  // 5. Clinical topics
  const clinicalTopics = detectClinicalTopics(text);

  return {
    ...chunk,
    metadata: {
      domain_ids:      domainIdsArr,
      category_slugs:  categorySlugs,
      question_ids:    questionIds,
      system_tags:     systemTags,
      stage_relevance: stageRelevance,
      clinical_topics: clinicalTopics,
    },
  };
}

// ─── Run ──────────────────────────────────────────────────────────────────────
const raw = JSON.parse(readFileSync(SRC, "utf8"));
const enriched = raw.map(enrichChunk);
writeFileSync(DEST, JSON.stringify(enriched, null, 2), "utf8");
console.log(`\nWrote enriched file: ${DEST}`);

// ─── Summary table ────────────────────────────────────────────────────────────
console.log("\n╔══ Enrichment Summary ═════════════════════════════════════════════════════╗");
console.log(`  Total chunks: ${enriched.length}`);
console.log("─".repeat(78));
const domainCoverage = {};
for (let d = 1; d <= 10; d++) domainCoverage[d] = 0;
let chunksWithQ = 0;
let chunksWithStage = 0;
const allClinicalTopics = {};
const noMetaChunks = [];

for (const c of enriched) {
  const m = c.metadata;
  for (const d of m.domain_ids) domainCoverage[d] = (domainCoverage[d] || 0) + 1;
  if (m.question_ids.length > 0) chunksWithQ++;
  if (m.stage_relevance.length > 0) chunksWithStage++;
  for (const t of m.clinical_topics) allClinicalTopics[t] = (allClinicalTopics[t] || 0) + 1;
  if (m.domain_ids.length === 0 && m.system_tags.length === 0) noMetaChunks.push(c._id);
  console.log(
    `  ${c._id.replace("empress-120-symptom-biomarker-framework-", "")} | ` +
    `domains=[${m.domain_ids.join(",")}] | Q#=[${m.question_ids.slice(0,5).join(",")}${m.question_ids.length>5?"...":""}] | ` +
    `tags=[${m.system_tags.join(",")}] | clinical=[${m.clinical_topics.slice(0,4).join(",")}${m.clinical_topics.length>4?"...":""}]`
  );
}

console.log("─".repeat(78));
console.log("\n  Domain coverage:");
for (const [d, count] of Object.entries(domainCoverage)) {
  if (count > 0) console.log(`    D${d.padStart(2,"0")} (${DOMAIN_SLUGS[d]}): ${count} chunks`);
}
console.log(`\n  Chunks with explicit Q numbers: ${chunksWithQ}/${enriched.length}`);
console.log(`  Chunks with stage relevance:    ${chunksWithStage}/${enriched.length}`);
console.log(`  Top clinical topics:            ${Object.entries(allClinicalTopics).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([t,n])=>`${t}(${n})`).join(", ")}`);
if (noMetaChunks.length > 0) {
  console.log(`\n  ⚠ Chunks with NO metadata (need manual review): ${noMetaChunks.length}`);
  for (const id of noMetaChunks) console.log(`    - ${id}`);
} else {
  console.log("\n  All chunks received metadata.");
}
console.log("╚" + "═".repeat(77) + "╝");

// ─── Write report ─────────────────────────────────────────────────────────────
const reportLines = [
  "# Empress Seed Enrichment Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  `## Overview`,
  "",
  `- **Total chunks:** ${enriched.length}`,
  `- **Chunks with Q-number citations:** ${chunksWithQ}`,
  `- **Chunks with stage relevance detected:** ${chunksWithStage}`,
  "",
  "## Domain Coverage",
  "",
  "| Domain | Slug | Chunk Count |",
  "|--------|------|-------------|",
  ...Object.entries(domainCoverage)
    .filter(([,n]) => n > 0)
    .map(([d, n]) => `| D${d.padStart(2,"0")} | ${DOMAIN_SLUGS[d]} | ${n} |`),
  "",
  "## Top Clinical Topics",
  "",
  ...Object.entries(allClinicalTopics)
    .sort((a,b) => b[1]-a[1])
    .map(([t, n]) => `- **${t}**: ${n} chunks`),
  "",
  "## Chunks Needing Manual Review",
  "",
  noMetaChunks.length === 0
    ? "All chunks received metadata — no manual review required."
    : noMetaChunks.map((id) => `- ${id}`).join("\n"),
  "",
  "## Per-Chunk Metadata",
  "",
  "| ID | Domains | Q-nums | System Tags | Stage | Clinical Topics |",
  "|----|---------|--------|-------------|-------|-----------------|",
  ...enriched.map((c) => {
    const m = c.metadata;
    const id = c._id.replace("empress-120-symptom-biomarker-framework-", "");
    return `| ${id} | ${m.domain_ids.join(",")} | ${m.question_ids.slice(0,6).join(",")} | ${m.system_tags.join(",")} | ${m.stage_relevance.join(",")} | ${m.clinical_topics.slice(0,4).join(", ")} |`;
  }),
];
writeFileSync(REPORT, reportLines.join("\n"), "utf8");
console.log(`\nReport written: ${REPORT}`);
