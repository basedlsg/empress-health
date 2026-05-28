// lib/freeReportGenerator.js
//
// Generates the 5–6 page personable .docx report sent to Free-tier users
// after they complete the 30-question assessment. Page 6 is optional.
//
// Counterpart to the (not-yet-built) 20-page paid report scoped in
// prds/PAID_REPORT_SCOPE.md. This is intentionally lighter, warmer, and
// designed to feel like a friend explaining what the answers mean — not
// a clinical readout.
//
// Inputs (POSTed from the report screen, mirrors the /api/recommendations/combined payload):
//   user                 — { firstName, age }
//   overall              — number 0-100
//   categoryScores       — Array<{ id, slug, title, score, status }>
//   priorities           — top-3 lowest-scoring categories (CategoryScore[])
//   strengths            — top-2 highest-scoring categories (CategoryScore[])
//   affirmations         — string[]   (free tier passes 1)
//   recommendations      — Array<{ name, specialty, reason }>   (free tier passes 1)
//   completedAt          — ISO string
//   evidence_refs        — (optional) Array<{ id: string, description: string }>
//
// Returns: Buffer (binary .docx)

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  LevelFormat,
  BorderStyle,
  PageOrientation,
} = require("docx");

// Site palette — aligned to the new 20-question assessment brand.
// Reference: BRAND_BRIEF.md / DESIGN.md (Empress terracotta-deep system).
//   EMPRESS_TERRACOTTA #C8856A · EMPRESS_DEEP #3D2B1F · EMPRESS_CREAM #FAF6F1
//   EMPRESS_GOLD #C9A96E       · EMPRESS_SAGE #7A8C6E
// docx requires the colours WITHOUT the leading '#'.
const PLUM = "3D2B1F";        // EMPRESS_DEEP (headings)
const PLUM_LIGHT = "C8856A";  // EMPRESS_TERRACOTTA (accents)
const GOLD = "C9A96E";        // EMPRESS_GOLD (callouts, affirmation)
const SAGE = "7A8C6E";        // EMPRESS_SAGE (positive indicators)
const CREAM = "FAF6F1";       // EMPRESS_CREAM (background)
const MUTED = "6B6258";       // warm neutral on cream

// One personable lifestyle nudge per category. Pulled from the same
// clinical commentary used inside the paid report so the language stays
// consistent across surfaces, but trimmed and softened for the free tier.
const CATEGORY_LEVERS = {
  "vasomotor-temperature":
    "Try a cool 65–67°F bedroom and breathable layered sleepwear for two weeks, and quietly note whether alcohol, caffeine, or spicy meals seem to set things off.",
  "sleep-architecture-cortisol":
    "Hold a fixed wake time every day and step into bright morning light within 30 minutes of waking — both quietly reset the rhythm that perimenopause keeps tugging on.",
  "cognitive-function-brain-health":
    "Protect sleep first. Then layer in 150 minutes of zone-2 cardio a week and twice-weekly resistance training — the brain fog you're feeling is more reversible than it feels.",
  "mood-anxiety-emotional-health":
    "Anchor each meal with protein and step outside in the first hour after waking. Both look small, both have real evidence for peri-mood — and they're free.",
  "metabolic-health-body-composition":
    "Resistance training three times a week beats more cardio at this stage. Aim for 30–40g of protein at each meal; the midsection shift answers to muscle, not to crash diets.",
  "skin-hair-nails":
    "Daily SPF 30+ and a gentle topical retinoid will do more for your skin in six months than any single product launch. A silk or satin pillowcase is a quietly kind upgrade for hair.",
  "musculoskeletal-bone-health":
    "Add impact-bearing movement (not just walking) twice a week — your bones literally rebuild in response. Vitamin D3 2000 IU plus magnesium glycinate before bed is a low-cost foundation.",
  "genitourinary-sexual-health":
    "A daily non-hormonal vaginal moisturiser changes more than people expect, and pelvic-floor work helps both bladder and intimacy. This category responds quickly when given attention.",
  "cardiovascular-whole-body-energy":
    "Walk after meals — even 10 minutes blunts the post-meal glucose spike. Track resting heart rate and blood pressure once a week so trends are visible before they're symptoms.",
  "stress-resilience-life-load":
    "One regular nervous-system practice (slow breathing, gentle yoga, or a short outdoor walk) every day matters more than the choice between them. The point is consistency, not intensity.",
};

// Friendly status label per CategoryStatus
function statusLabel(status) {
  if (status === "Priority") return "needs the most attention right now";
  if (status === "Moderate") return "in the middle";
  return "a strength";
}

// Given a 0-100 overall, return a personable framing line.
function overallFraming(overall) {
  if (overall >= 75) return "Your answers paint a picture of someone who's actively taking care of herself — that shows.";
  if (overall >= 60) return "Your answers tell a story of real strengths alongside a few areas that are quietly asking for attention.";
  if (overall >= 45) return "Your answers tell us this is a moment that deserves real care — and that several of the patterns you're feeling are highly responsive to support.";
  return "Your answers tell us a lot is happening at once. The good news: every one of the patterns we're seeing has known, evidence-based ways to feel better.";
}

// Helpers for paragraph styling — keeps the generator code readable.
function p(text, opts = {}) {
  const {
    bold = false,
    italic = false,
    color,
    size, // half-points
    align = AlignmentType.LEFT,
    spaceBefore = 0,
    spaceAfter = 80, // tighter default — was 120
    font = "Inter",
  } = opts;
  return new Paragraph({
    alignment: align,
    spacing: { before: spaceBefore, after: spaceAfter, line: 300 },
    children: [
      new TextRun({
        text,
        bold,
        italic,
        color,
        size,
        font,
      }),
    ],
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 120, after: 120 }, // halved — was 240/240
    children: [
      new TextRun({ text, bold: true, color: PLUM, size: 40, font: "Cormorant Garamond" }),
    ],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 160, after: 100 }, // tightened — was 280/160
    children: [
      new TextRun({ text, bold: true, color: PLUM, size: 28, font: "Cormorant Garamond" }),
    ],
  });
}

function eyebrow(text) {
  return new Paragraph({
    spacing: { before: 0, after: 40 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: PLUM_LIGHT, // terracotta eyebrow — was GOLD
        size: 18,
        font: "Inter",
        characterSpacing: 60,
      }),
    ],
  });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80, line: 300 },
    children: [new TextRun({ text, font: "Inter", size: 22 })],
  });
}

// Subtle 1px terracotta-tinted divider between sections. ~16-24px of vertical
// breathing room total (the spacing here is in twentieths of a point, so
// before:80/after:120 ≈ 4pt + 6pt ≈ 13px combined).
function divider() {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    border: {
      bottom: {
        color: "E8D8C8", // soft cream-tan rule
        space: 1,
        style: BorderStyle.SINGLE,
        size: 4,
      },
    },
    children: [new TextRun({ text: "" })],
  });
}

function formatCompletedDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ---- The five pages ------------------------------------------------------

function pageOne(data) {
  const { user = {}, overall = 0, completedAt } = data;
  const firstName = (user.firstName && String(user.firstName).trim()) || "there";
  const completed = formatCompletedDate(completedAt);

  return [
    eyebrow("EMPRESS HEALTH · YOUR PERSONAL REPORT"),
    h1(`Hi ${firstName},`),
    p(
      "here's what your answers tell us.",
      { italic: true, color: MUTED, size: 26, spaceAfter: 160, font: "Cormorant Garamond" },
    ),
    p(
      `${overallFraming(overall)} This document walks you through what we noticed, where you have real strengths to build on, and a small handful of next steps that quietly compound.`,
      { size: 22 },
    ),

    eyebrow("YOUR HEALTH INTELLIGENCE SCORE"),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: String(Math.round(overall)),
          color: PLUM_LIGHT, // terracotta score
          bold: true,
          font: "Cormorant Garamond",
          size: 96,
        }),
        new TextRun({
          text: "  /100",
          color: MUTED,
          font: "Inter",
          size: 32,
        }),
      ],
    }),
    p(
      "A 0–100 composite of all 30 questions across 10 body systems. It's a moment-in-time snapshot, not a verdict.",
      { color: MUTED, size: 20, italic: true, spaceAfter: 120 },
    ),

    completed ? p(`Assessment completed ${completed}.`, { color: MUTED, size: 18 }) : p(""),
    divider(),
    p(
      "Read at your own pace. Nothing in here is medical advice — it's a conversation starter for you, your body, and (when it's time) your clinician.",
      { color: MUTED, italic: true, size: 20, spaceAfter: 0 },
    ),
  ];
}

function pageTwo(data) {
  const { user = {}, priorities = [] } = data;
  const firstName = (user.firstName && String(user.firstName).trim()) || "you";

  const items = priorities.slice(0, 3);

  const blocks = [
    divider(),
    eyebrow("01 · PRIORITY AREAS"),
    h1("The three areas asking for attention first."),
    p(
      `These were the lowest-scoring categories on your assessment, ${firstName}. Lowest doesn't mean wrong — it means there's the most room for relief here, and these patterns are usually the most responsive to small changes.`,
      { size: 22, spaceAfter: 120 },
    ),
  ];

  if (items.length === 0) {
    blocks.push(p("No priority categories surfaced from this assessment.", { color: MUTED, italic: true }));
    return blocks;
  }

  items.forEach((cs, i) => {
    blocks.push(h2(`${i + 1}. ${cs.title}`));
    blocks.push(p(`Score: ${Math.round(cs.score)}/100  ·  ${statusLabel(cs.status)}`, {
      color: PLUM_LIGHT,
      size: 20,
      spaceAfter: 60,
    }));
    const lever = CATEGORY_LEVERS[cs.slug];
    if (lever) {
      blocks.push(p("One small lever:", { bold: true, color: PLUM_LIGHT, size: 22, spaceAfter: 40 }));
      blocks.push(p(lever, { size: 22 }));
    }
  });

  return blocks;
}

function pageThree(data) {
  const { user = {}, strengths = [] } = data;
  const firstName = (user.firstName && String(user.firstName).trim()) || "you";
  const items = strengths.slice(0, 2);

  const blocks = [
    divider(),
    eyebrow("02 · YOUR STRENGTHS"),
    h1("And these are quietly working in your favour."),
    p(
      `Strengths matter, ${firstName}. They're the foundation everything else builds on, and noticing what's working is part of how this gets sustainable.`,
      { size: 22, spaceAfter: 120 },
    ),
  ];

  if (items.length === 0) {
    blocks.push(p("Your scores were fairly even across categories — there isn't a clear standout strength yet, and that's okay. As you address the priorities above, expect strengths to emerge over the next few months.", {
      color: MUTED,
      italic: true,
    }));
    return blocks;
  }

  items.forEach((cs) => {
    blocks.push(h2(cs.title));
    blocks.push(p(`Score: ${Math.round(cs.score)}/100  ·  ${statusLabel(cs.status)}`, {
      color: SAGE, // strengths shown in sage
      size: 20,
      spaceAfter: 60,
    }));
    blocks.push(p(
      "Whatever you're already doing here is working. Don't disrupt it to chase fixes elsewhere — protecting strengths is part of the strategy.",
      { size: 22 },
    ));
  });

  return blocks;
}

function pageFour(data) {
  const { user = {}, affirmation, affirmations = [], recommendations = [] } = data;
  const firstName = (user.firstName && String(user.firstName).trim()) || "you";

  // Preferred: a single `affirmation` field (new free-flow Gemini contract).
  // Fallback: first item of legacy `affirmations` array (paid 120-Q flow).
  // Final fallback: brand default — TODO: wire to a real source later.
  const aff =
    (typeof affirmation === "string" && affirmation.trim()) ||
    (affirmations[0] && String(affirmations[0]).trim()) ||
    "You are not broken. You are becoming.";
  const rec = recommendations[0] || null;

  const blocks = [
    divider(),
    eyebrow("03 · CARRY THIS WITH YOU"),
  ];

  // Specialist match (inline, continuous flow)
  blocks.push(h2("Your suggested specialist match"));
  if (rec) {
    blocks.push(p(rec.name || rec.title || "Recommended specialist", {
      bold: true,
      color: PLUM,
      size: 26,
      font: "Cormorant Garamond",
      spaceAfter: 40,
    }));
    if (rec.specialty || rec.title) {
      blocks.push(p(rec.specialty || rec.title || "", {
        color: PLUM_LIGHT,
        size: 20,
        spaceAfter: 80,
      }));
    }
    if (rec.reason) {
      blocks.push(p(rec.reason, { size: 22, spaceAfter: 80 }));
    }
    blocks.push(p(
      `Why this match for ${firstName}: this clinician type pairs to the patterns showing up most strongly on your assessment. They're not the only option — but they're a good first conversation if you're choosing where to spend energy.`,
      { color: MUTED, italic: true, size: 20 },
    ));
  } else {
    blocks.push(p(
      "Your personalised clinician match is being prepared. In the meantime, a Menopause-Certified NAMS Practitioner is a strong default starting point — they're trained specifically in this transition.",
      { size: 22 },
    ));
  }

  return blocks;
}

// "Your Affirmation for the Day" — placed near the END of the report,
// just before next-steps / CTA. Large serif quote, centred, gold accent.
function affirmationForDay(data) {
  const { affirmation, affirmations = [] } = data;
  const aff =
    (typeof affirmation === "string" && affirmation.trim()) ||
    (affirmations[0] && String(affirmations[0]).trim()) ||
    "You are not broken. You are becoming."; // TODO: wire to a real source later for the paid 120-Q flow

  return [
    divider(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 60 },
      children: [
        new TextRun({
          text: "YOUR AFFIRMATION FOR THE DAY",
          bold: true,
          color: GOLD,
          size: 20,
          font: "Inter",
          characterSpacing: 80,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80, line: 360 },
      children: [
        new TextRun({
          text: "“" + aff + "”",
          italic: true,
          size: 36, // 18pt — the visual peak of the report
          color: PLUM_LIGHT, // terracotta
          font: "Cormorant Garamond",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      border: {
        bottom: {
          color: GOLD,
          space: 1,
          style: BorderStyle.SINGLE,
          size: 4,
        },
      },
      indent: { left: 3600, right: 3600 },
      children: [new TextRun({ text: "" })],
    }),
  ];
}

function pageFive(data) {
  const { user = {} } = data;
  const firstName = (user.firstName && String(user.firstName).trim()) || "you";

  return [
    divider(),
    eyebrow("04 · YOUR NEXT STEPS"),
    h1("Three things to do next."),
    p(
      `${firstName}, the gap between knowing and doing is where most of us get stuck. So here are three steps, in order. Pick one — even just one — and start there.`,
      { size: 22, spaceAfter: 120 },
    ),

    h2("01 · Book a NAMS-certified visit."),
    p(
      "If you don't already have a menopause-trained clinician, this is the highest-leverage move. Find one at menopause.org/find-a-provider — it's a free directory.",
      { size: 22, spaceAfter: 100 },
    ),

    h2("02 · Pick one lever from above and run it for 14 days."),
    p(
      "Don't try to fix all three priorities at once. Choose the lever that feels most doable and give it two full weeks before judging it. Most things in this assessment respond quickly, but rarely overnight.",
      { size: 22, spaceAfter: 100 },
    ),

    h2("03 · Come back to Empress when you're ready for the full picture."),
    p(
      "This was the preview. The full 120-question assessment maps every body system in clinical detail and produces a 20-page report you can hand to a clinician.",
      { size: 22, spaceAfter: 160 },
    ),

    // ── Primary CTA — terracotta block ──
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 60 },
      shading: { type: "clear", color: "auto", fill: PLUM_LIGHT },
      border: {
        top: { color: PLUM_LIGHT, style: BorderStyle.SINGLE, size: 24, space: 12 },
        bottom: { color: PLUM_LIGHT, style: BorderStyle.SINGLE, size: 24, space: 12 },
        left: { color: PLUM_LIGHT, style: BorderStyle.SINGLE, size: 24, space: 12 },
        right: { color: PLUM_LIGHT, style: BorderStyle.SINGLE, size: 24, space: 12 },
      },
      children: [
        new TextRun({
          text: "Unlock Your Full 120-Question Assessment",
          bold: true,
          color: CREAM,
          size: 28,
          font: "Cormorant Garamond",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      shading: { type: "clear", color: "auto", fill: PLUM_LIGHT },
      children: [
        new TextRun({
          text: "$129/year (one-time) · empresshealth.ai/health-assessment",
          color: CREAM,
          size: 22,
          font: "Inter",
        }),
      ],
    }),

    divider(),

    p(
      "You're not alone in this. Welcome to Empress Health.",
      { color: PLUM, italic: true, size: 22, align: AlignmentType.CENTER, spaceBefore: 80 },
    ),
  ];
}

function pageSix(data) {
  const { evidence_refs = [] } = data;

  const blocks = [
    divider(),
    eyebrow("05 · SOURCES & EVIDENCE"),
    h1("Sources & evidence"),
    p(
      "The personalised guidance in this report is grounded in the Empress 120-Symptom Biomarker Framework. Below are the specific clinical chunks our system referenced for your assessment.",
      { size: 22, spaceAfter: 120 },
    ),
  ];

  evidence_refs.forEach((ref) => {
    blocks.push(
      new Paragraph({
        spacing: { before: 40, after: 60, line: 300 },
        children: [
          new TextRun({
            text: ref.id || "",
            font: "Courier New",
            size: 20,
            color: PLUM_LIGHT, // terracotta chunk id
          }),
        ],
      }),
    );
    blocks.push(p(ref.description || "", { size: 22, spaceAfter: 100 }));
  });

  blocks.push(
    p(
      "Empress Health 120-Symptom Biomarker Framework v1.0 · March 2026",
      { color: MUTED, italic: true, size: 18, align: AlignmentType.CENTER, spaceBefore: 80, spaceAfter: 0 },
    ),
  );

  return blocks;
}

// ---- Top-level builder ---------------------------------------------------

async function generateFreeReport(data) {
  // Continuous flow: page-breaks have been replaced with thin dividers, so
  // sections compose end-to-end into one running document. The optional
  // sources page is the only one that begins on its own (it's reference
  // material, not narrative). "Your Affirmation for the Day" sits between
  // the body of the report and the next-steps / CTA block at the bottom.
  const children = [
    ...pageOne(data),
    ...pageTwo(data),
    ...pageThree(data),
    ...pageFour(data),
    ...affirmationForDay(data),
    ...pageFive(data),
  ];

  if (data.evidence_refs?.length > 0) {
    children.push(...pageSix(data));
  }

  const doc = new Document({
    creator: "Empress Health",
    title: "Empress Health — Personal Assessment Report",
    description: "Personalised free-tier report from the assessment.",
    styles: {
      default: { document: { run: { font: "Inter", size: 22 } } },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 40, bold: true, font: "Cormorant Garamond", color: PLUM },
          paragraph: { spacing: { before: 120, after: 120 }, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 28, bold: true, font: "Cormorant Garamond", color: PLUM },
          paragraph: { spacing: { before: 160, after: 100 }, outlineLevel: 1 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 12240,   // US Letter (8.5")
              height: 15840,  // (11")
              orientation: PageOrientation.PORTRAIT,
            },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

module.exports = { generateFreeReport };
