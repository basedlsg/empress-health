/**
 * Abbreviated assessment for the FREE tier (30 questions).
 *
 * Source of truth: prds/assessmentQuestions.ts (120 questions, 10 categories).
 * Every entry below is a verbatim subset of that source — no question text,
 * shortLabel, minLabel, maxLabel, id, or categoryId has been altered.
 *
 * Selection rule: 30 questions total, with at least 2 questions from every
 * category. Top 5 clinically-weighted categories (Vasomotor, Sleep, Mood,
 * Metabolic, Genitourinary) receive 4 questions each; the remaining 5
 * categories receive 2 questions each. 4×4 + 4×2 + 2 + 2 = 30. ✓
 *
 * Clinical rationale for the top-5 weighting comes from the source file's
 * own category descriptions (e.g. "Sleep disruption is the single greatest
 * amplifier of every other menopause symptom" and "[Genitourinary] are
 * among the most under-treated and most fixable aspects of menopause").
 *
 * Per-category question counts (free):
 *   Cat 1  Vasomotor & Temperature             4
 *   Cat 2  Sleep Architecture & Cortisol       4
 *   Cat 3  Cognitive Function & Brain Health   2
 *   Cat 4  Mood, Anxiety & Emotional Health    4
 *   Cat 5  Metabolic Health & Body Composition 4
 *   Cat 6  Skin, Hair & Nails                  2
 *   Cat 7  Musculoskeletal & Bone Health       2
 *   Cat 8  Genitourinary & Sexual Health       4
 *   Cat 9  Cardiovascular & Whole-Body Energy  2
 *   Cat 10 Lifestyle, Gut Health & Nutrition   2
 *
 * If a question is renamed/renumbered in the source file, update the
 * corresponding entry here so this file stays in sync.
 */

import type { AssessmentCategory } from "./assessmentQuestions"

export const abbreviatedAssessmentCategories: AssessmentCategory[] = [
  {
    id: 1,
    slug: "vasomotor-temperature",
    title: "Vasomotor & Temperature",
    description:
      "Every hot flash is a diagnostic event mapping to estradiol decline, FSH elevation, and hypothalamic thermoregulation.",
    questions: [
      {
        id: 1,
        categoryId: 1,
        shortLabel: "HOT FLASH FREQUENCY",
        prompt: "How many times per day do you experience a sudden surge of heat?",
        minLabel: "Never",
        maxLabel: "10+ times/day"
      },
      {
        id: 2,
        categoryId: 1,
        shortLabel: "HOT FLASH SEVERITY",
        prompt: "When a hot flash hits, how intense is it?",
        minLabel: "None",
        maxLabel: "Disabling"
      },
      {
        id: 3,
        categoryId: 1,
        shortLabel: "NIGHT SWEAT FREQUENCY",
        prompt: "How many nights per week do you wake drenched in sweat?",
        minLabel: "Never",
        maxLabel: "Every night"
      },
      {
        id: 5,
        categoryId: 1,
        shortLabel: "PALPITATIONS DURING FLASHES",
        prompt: "Do you feel your heart racing during or after a hot flash?",
        minLabel: "Never",
        maxLabel: "Every flash"
      }
    ]
  },
  {
    id: 2,
    slug: "sleep-architecture-cortisol",
    title: "Sleep Architecture & Cortisol",
    description:
      "Sleep disruption is the single greatest amplifier of every other menopause symptom. Fix sleep first — everything else improves.",
    questions: [
      {
        id: 13,
        categoryId: 2,
        shortLabel: "SLEEP ONSET LATENCY",
        prompt: "How long does it take to fall asleep after getting into bed?",
        minLabel: "Under 15 mins",
        maxLabel: "Over 2 hours"
      },
      {
        id: 14,
        categoryId: 2,
        shortLabel: "NIGHT WAKINGS FREQUENCY",
        prompt: "How many times do you wake after initially falling asleep?",
        minLabel: "None",
        maxLabel: "Cannot count"
      },
      {
        id: 15,
        categoryId: 2,
        shortLabel: "2–4AM WAKING PATTERN",
        prompt: "Do you specifically wake between 2am and 4am and can't return to sleep?",
        minLabel: "Never",
        maxLabel: "Every single night"
      },
      {
        id: 17,
        categoryId: 2,
        shortLabel: "SLEEP SATISFACTION ON WAKING",
        prompt: "How rested do you feel when you wake up?",
        minLabel: "Fully rested",
        maxLabel: "Exhausted — as if I never slept"
      }
    ]
  },
  {
    id: 3,
    slug: "cognitive-function-brain-health",
    title: "Cognitive Function & Brain Health",
    description:
      "Brain fog is a neurological event — not a personality flaw. Maps to BDNF, acetylcholine, and estrogen's direct neuroprotective role.",
    questions: [
      {
        id: 24,
        categoryId: 3,
        shortLabel: "WORD-FINDING DIFFICULTY",
        prompt: "How often do you struggle to retrieve the right word mid-sentence?",
        minLabel: "Never",
        maxLabel: "Impacts every conversation"
      },
      {
        id: 25,
        categoryId: 3,
        shortLabel: "SHORT-TERM MEMORY LAPSES",
        prompt: "How often do you forget things you just did or said?",
        minLabel: "Occasional/Normal",
        maxLabel: "Severe and frightening"
      }
    ]
  },
  {
    id: 4,
    slug: "mood-anxiety-emotional-health",
    title: "Mood, Anxiety & Emotional Health",
    description:
      "These are neurochemical events with measurable hormonal fingerprints — not character failings. Highly effective treatments exist.",
    questions: [
      {
        id: 36,
        categoryId: 4,
        shortLabel: "BASELINE ANXIETY LEVEL",
        prompt:
          "Describe the resting background anxiety you carry through your day without a specific trigger.",
        minLabel: "None",
        maxLabel: "Severe near-constant dread"
      },
      {
        id: 38,
        categoryId: 4,
        shortLabel: "IRRITABILITY THRESHOLD",
        prompt:
          "How quickly do you become irritated by minor annoyances that previously wouldn't have affected you?",
        minLabel: "No change",
        maxLabel: "Hair-trigger irritability constantly"
      },
      {
        id: 41,
        categoryId: 4,
        shortLabel: "DEPRESSIVE EPISODES",
        prompt:
          "Do you experience periods of low mood or loss of interest new or worse during this transition?",
        minLabel: "None",
        maxLabel: "Severe, impairs all functioning"
      },
      {
        id: 43,
        categoryId: 4,
        shortLabel: "PANIC ATTACKS",
        prompt:
          "Have you experienced sudden episodes of intense fear or breathlessness without a clear trigger?",
        minLabel: "Never",
        maxLabel: "Weekly or more frequently"
      }
    ]
  },
  {
    id: 5,
    slug: "metabolic-health-body-composition",
    title: "Metabolic Health & Body Composition",
    description:
      "Menopause is a metabolic event. Estrogen regulates insulin sensitivity, fat distribution, appetite hormones, and resting metabolic rate.",
    questions: [
      {
        id: 49,
        categoryId: 5,
        shortLabel: "UNEXPLAINED WEIGHT GAIN",
        prompt:
          "Have you gained weight in the past 1–3 years unexplained by diet or activity changes?",
        minLabel: "No change",
        maxLabel: "Over 20 lbs despite no lifestyle change"
      },
      {
        id: 50,
        categoryId: 5,
        shortLabel: "ABDOMINAL BLOATING",
        prompt:
          "Do you experience abdominal distension or bloating particularly after meals?",
        minLabel: "No change",
        maxLabel: "Daily severe bloating, visible distension"
      },
      {
        id: 51,
        categoryId: 5,
        shortLabel: "SUGAR & CARB CRAVINGS",
        prompt: "Have sugar and carbohydrate cravings significantly increased?",
        minLabel: "No change",
        maxLabel: "Intense hard-to-resist cravings daily"
      },
      {
        id: 53,
        categoryId: 5,
        shortLabel: "INABILITY TO LOSE WEIGHT",
        prompt:
          "Have strategies that previously worked for weight loss become ineffective now?",
        minLabel: "Normal response",
        maxLabel: "Complete resistance — nothing moves"
      }
    ]
  },
  {
    id: 6,
    slug: "skin-hair-nails",
    title: "Skin, Hair & Nails",
    description:
      "These visible changes reflect collagen decline, androgen shifts, thyroid interplay, and micronutrient status — they are diagnostic clues, not vanity concerns.",
    questions: [
      {
        id: 61,
        categoryId: 6,
        shortLabel: "HAIR SHEDDING / THINNING",
        prompt: "Have you noticed increased hair shedding or reduced hair volume?",
        minLabel: "No change",
        maxLabel: "Severe visible thinning"
      },
      {
        id: 64,
        categoryId: 6,
        shortLabel: "SKIN DRYNESS",
        prompt:
          "Has your skin become significantly drier no matter what products you use?",
        minLabel: "No change",
        maxLabel: "Constant severe dryness"
      }
    ]
  },
  {
    id: 7,
    slug: "musculoskeletal-bone-health",
    title: "Musculoskeletal & Bone Health",
    description:
      "Estrogen directly regulates muscle protein synthesis, collagen integrity, joint lubrication, and bone turnover. Pain here is highly trackable and actionable.",
    questions: [
      {
        id: 73,
        categoryId: 7,
        shortLabel: "JOINT PAIN / STIFFNESS",
        prompt:
          "Have you developed new joint pain or stiffness without an obvious injury?",
        minLabel: "None",
        maxLabel: "Severe daily pain in multiple joints"
      },
      {
        id: 76,
        categoryId: 7,
        shortLabel: "LOSS OF STRENGTH",
        prompt:
          "Have you noticed a real drop in physical strength despite normal effort?",
        minLabel: "No change",
        maxLabel: "Dramatic strength loss"
      }
    ]
  },
  {
    id: 8,
    slug: "genitourinary-sexual-health",
    title: "Genitourinary & Sexual Health",
    description:
      "These symptoms map directly to estrogen decline in vulvovaginal and urinary tissues. They are among the most under-treated and most fixable aspects of menopause.",
    questions: [
      {
        id: 85,
        categoryId: 8,
        shortLabel: "VAGINAL DRYNESS",
        prompt: "Have you developed vaginal dryness or lack of natural lubrication?",
        minLabel: "No change",
        maxLabel: "Severe daily dryness"
      },
      {
        id: 86,
        categoryId: 8,
        shortLabel: "PAIN WITH INTERCOURSE",
        prompt: "Do you experience pain, burning, or tearing during intimacy?",
        minLabel: "None",
        maxLabel: "Intercourse not possible due to pain"
      },
      {
        id: 87,
        categoryId: 8,
        shortLabel: "LOSS OF LIBIDO",
        prompt:
          "Has your sexual desire declined significantly from your previous baseline?",
        minLabel: "No change",
        maxLabel: "Complete loss of desire"
      },
      {
        id: 90,
        categoryId: 8,
        shortLabel: "BLADDER URGENCY",
        prompt: "Do you experience sudden urgent need to urinate with little warning?",
        minLabel: "Never",
        maxLabel: "Frequent urgent near-accidents"
      }
    ]
  },
  {
    id: 9,
    slug: "cardiovascular-whole-body-energy",
    title: "Cardiovascular & Whole-Body Energy",
    description:
      "Menopause alters vascular tone, autonomic regulation, blood pressure variability, and mitochondrial output. Energy symptoms here are physiologic data, not just “fatigue.”",
    questions: [
      {
        id: 97,
        categoryId: 9,
        shortLabel: "BASELINE ENERGY LEVEL",
        prompt:
          "Compared to 2–3 years ago, how much baseline daily energy have you lost?",
        minLabel: "No meaningful loss",
        maxLabel: "Energy feels almost completely gone"
      },
      {
        id: 99,
        categoryId: 9,
        shortLabel: "HEART PALPITATIONS",
        prompt:
          "Do you experience skipped beats, pounding heartbeat, or fluttering sensations?",
        minLabel: "Never",
        maxLabel: "Daily / disruptive"
      }
    ]
  },
  {
    id: 10,
    slug: "lifestyle-gut-health-nutrition",
    title: "Lifestyle, Gut Health & Nutrition",
    description:
      "The body becomes less resilient to poor inputs during menopause. Food, alcohol, stress load, and recovery habits now create disproportionately large physiologic effects.",
    questions: [
      {
        id: 109,
        categoryId: 10,
        shortLabel: "ALCOHOL TOLERANCE DECLINE",
        prompt: "Has alcohol become much less tolerable than it used to be?",
        minLabel: "No change",
        maxLabel: "Even 1 drink causes major symptoms"
      },
      {
        id: 112,
        categoryId: 10,
        shortLabel: "DIGESTIVE SLOWDOWN / CONSTIPATION",
        prompt:
          "Have you developed constipation, sluggish digestion, or incomplete bowel movements?",
        minLabel: "No change",
        maxLabel: "Severe ongoing issue"
      }
    ]
  }
]
