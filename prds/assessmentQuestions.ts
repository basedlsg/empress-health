/**
 * This file must be populated only from screenshot-extracted assessment content.
 * Do not invent, paraphrase, or rewrite question copy.
 * The screenshots are the source of truth for all categories and questions.
 */

export type AssessmentQuestion = {
    id: number
    categoryId: number
    shortLabel: string
    prompt: string
    minLabel: string
    maxLabel: string
  }
  
  export type AssessmentCategory = {
    id: number
    slug: string
    title: string
    description: string
    questions: AssessmentQuestion[]
  }
  
  export const assessmentCategories: AssessmentCategory[] = [
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
          id: 4,
          categoryId: 1,
          shortLabel: "HOT FLASH DURATION",
          prompt: "How long does a typical hot flash last?",
          minLabel: "Under 1 min",
          maxLabel: "Over 5 minutes"
        },
        {
          id: 5,
          categoryId: 1,
          shortLabel: "PALPITATIONS DURING FLASHES",
          prompt: "Do you feel your heart racing during or after a hot flash?",
          minLabel: "Never",
          maxLabel: "Every flash"
        },
        {
          id: 6,
          categoryId: 1,
          shortLabel: "CHILLS AFTER FLASH",
          prompt: "After a hot flash ends, do you immediately feel intensely cold?",
          minLabel: "Never",
          maxLabel: "Every flash"
        },
        {
          id: 7,
          categoryId: 1,
          shortLabel: "COLD HANDS & FEET",
          prompt: "Do your hands and feet feel chronically cold even when flushing?",
          minLabel: "No change",
          maxLabel: "Constantly cold"
        },
        {
          id: 8,
          categoryId: 1,
          shortLabel: "HEAT INTOLERANCE",
          prompt: "Have you become significantly more sensitive to heat?",
          minLabel: "No change",
          maxLabel: "Cannot tolerate normal temperatures"
        },
        {
          id: 9,
          categoryId: 1,
          shortLabel: "ALCOHOL AS FLASH TRIGGER",
          prompt: "Does alcohol reliably trigger a hot flash within 1–2 hours?",
          minLabel: "No effect",
          maxLabel: "Always triggers"
        },
        {
          id: 10,
          categoryId: 1,
          shortLabel: "STRESS-TRIGGERED FLASHES",
          prompt: "Do emotional stress episodes reliably intensify hot flashes?",
          minLabel: "No connection",
          maxLabel: "Every stressful moment"
        },
        {
          id: 11,
          categoryId: 1,
          shortLabel: "CAFFEINE AS FLASH TRIGGER",
          prompt: "Does caffeine reliably worsen or trigger hot flashes?",
          minLabel: "No effect",
          maxLabel: "Any caffeine triggers immediately"
        },
        {
          id: 12,
          categoryId: 1,
          shortLabel: "FACIAL FLUSHING",
          prompt: "Do you experience facial redness or flushing separate from hot flashes?",
          minLabel: "Never",
          maxLabel: "Daily persistent redness"
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
          id: 16,
          categoryId: 2,
          shortLabel: "WIRED-BUT-TIRED PARADOX",
          prompt: "Do you feel exhausted during the day yet wired and alert at bedtime?",
          minLabel: "Never",
          maxLabel: "Every night"
        },
        {
          id: 17,
          categoryId: 2,
          shortLabel: "SLEEP SATISFACTION ON WAKING",
          prompt: "How rested do you feel when you wake up?",
          minLabel: "Fully rested",
          maxLabel: "Exhausted — as if I never slept"
        },
        {
          id: 18,
          categoryId: 2,
          shortLabel: "MORNING BODY LAG",
          prompt: "How long after waking does your body feel physically functional?",
          minLabel: "Within 15 mins",
          maxLabel: "Never functional until afternoon"
        },
        {
          id: 19,
          categoryId: 2,
          shortLabel: "DREAM INTENSITY & NIGHTMARES",
          prompt: "Have you noticed significantly more vivid or disturbing dreams?",
          minLabel: "No change",
          maxLabel: "Nightly nightmares"
        },
        {
          id: 20,
          categoryId: 2,
          shortLabel: "RESTLESS LEGS AT NIGHT",
          prompt: "Do you experience crawling, tingling, or urge to move legs at night?",
          minLabel: "Never",
          maxLabel: "Every night, severely disrupts sleep"
        },
        {
          id: 21,
          categoryId: 2,
          shortLabel: "SLEEP ENVIRONMENT SENSITIVITY",
          prompt: "Have you become newly sensitive to noise, light, or temperature during sleep?",
          minLabel: "No change",
          maxLabel: "Any minor disruption wakes me"
        },
        {
          id: 22,
          categoryId: 2,
          shortLabel: "DAYTIME SLEEPINESS",
          prompt: "Do you feel irresistibly sleepy during the day even after a full night in bed?",
          minLabel: "Rarely",
          maxLabel: "Constant debilitating sleepiness"
        },
        {
          id: 23,
          categoryId: 2,
          shortLabel: "NAP DEPENDENCY",
          prompt: "Do you feel you NEED to nap to function? — and does missing a nap significantly impair your afternoon capacity",
          minLabel: "Never nap",
          maxLabel: "Daily nap non-negotiable"
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
        },
        {
          id: 26,
          categoryId: 3,
          shortLabel: "CONCENTRATION SPAN",
          prompt: "How long can you hold focused attention before your mind wanders?",
          minLabel: "45+ mins as before",
          maxLabel: "Under 5 mins"
        },
        {
          id: 27,
          categoryId: 3,
          shortLabel: "MENTAL PROCESSING SPEED",
          prompt: "Does your thinking feel measurably slower than 2–3 years ago?",
          minLabel: "No change",
          maxLabel: "Significantly slower, affects work daily"
        },
        {
          id: 28,
          categoryId: 3,
          shortLabel: "SPATIAL MEMORY LOSS",
          prompt: "Do you frequently misplace everyday objects in obvious places?",
          minLabel: "No more than before",
          maxLabel: "Multiple times per day"
        },
        {
          id: 29,
          categoryId: 3,
          shortLabel: "MULTI-TASKING CAPACITY",
          prompt: "Has your ability to manage multiple tasks declined significantly?",
          minLabel: "No change",
          maxLabel: "Can barely manage one task"
        },
        {
          id: 30,
          categoryId: 3,
          shortLabel: "DECISION FATIGUE",
          prompt: "Do even minor decisions feel disproportionately exhausting?",
          minLabel: "Not at all",
          maxLabel: "Simple decisions feel paralyzing"
        },
        {
          id: 31,
          categoryId: 3,
          shortLabel: "READING RE-READING",
          prompt: "Do you need to re-read the same paragraph multiple times for it to register?",
          minLabel: "Never",
          maxLabel: "Almost every time I try to read"
        },
        {
          id: 32,
          categoryId: 3,
          shortLabel: "MENTAL CLARITY ON WAKING",
          prompt: "How quickly does your mind feel genuinely clear and sharp after waking?",
          minLabel: "Within 30 mins",
          maxLabel: "Never feels clear all day"
        },
        {
          id: 33,
          categoryId: 3,
          shortLabel: "NUMBER & CALCULATION DIFFICULTY",
          prompt: "Have you noticed new difficulty with mental arithmetic or financial tasks?",
          minLabel: "No change",
          maxLabel: "Significant new difficulty"
        },
        {
          id: 34,
          categoryId: 3,
          shortLabel: "PROFESSIONAL CONFIDENCE DECLINE",
          prompt: "Has your confidence in your professional ability declined in the last 12 months?",
          minLabel: "No change",
          maxLabel: "Considering stepping back"
        },
        {
          id: 35,
          categoryId: 3,
          shortLabel: "MENTAL ENDURANCE",
          prompt: "How long can you sustain demanding intellectual work before hitting a wall?",
          minLabel: "Full day as before",
          maxLabel: "Under 1 hour before shutdown"
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
          id: 37,
          categoryId: 4,
          shortLabel: "FEELING OF DREAD OR DOOM",
          prompt:
            "Do you experience unexplained feelings of dread — particularly on waking or at dusk?",
          minLabel: "Never",
          maxLabel: "Daily, specifically upon waking"
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
          id: 39,
          categoryId: 4,
          shortLabel: "RAGE EPISODES",
          prompt:
            "Have you experienced sudden explosive anger completely disproportionate to the situation?",
          minLabel: "Never",
          maxLabel: "Weekly explosive episodes"
        },
        {
          id: 40,
          categoryId: 4,
          shortLabel: "EMOTIONAL VOLATILITY",
          prompt:
            "Do your emotions swing dramatically within a single day without proportionate triggers?",
          minLabel: "Emotionally stable",
          maxLabel: "Severe unpredictable swings every day"
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
          id: 42,
          categoryId: 4,
          shortLabel: "EMOTIONAL NUMBNESS",
          prompt:
            "Do you feel emotionally flat or disconnected — unable to feel joy as before?",
          minLabel: "Fully emotionally present",
          maxLabel: "Persistent flatness, disconnected"
        },
        {
          id: 43,
          categoryId: 4,
          shortLabel: "PANIC ATTACKS",
          prompt:
            "Have you experienced sudden episodes of intense fear or breathlessness without a clear trigger?",
          minLabel: "Never",
          maxLabel: "Weekly or more frequently"
        },
        {
          id: 44,
          categoryId: 4,
          shortLabel: "AFTERNOON LOW / FLAT SPELL",
          prompt:
            "Do you experience a pronounced afternoon emotional low that lifts somewhat by evening?",
          minLabel: "No pattern",
          maxLabel: "Every afternoon 2–5pm feels dark"
        },
        {
          id: 45,
          categoryId: 4,
          shortLabel: "LOSS OF MOTIVATION / DRIVE",
          prompt: "Have you lost the motivation or drive that previously defined you?",
          minLabel: "No change",
          maxLabel: "Complete motivational flatness"
        },
        {
          id: 46,
          categoryId: 4,
          shortLabel: "CRYING EASILY / TEARFULNESS",
          prompt: "Do you cry far more easily than before — or cry without knowing why?",
          minLabel: "No change",
          maxLabel: "Crying multiple times daily, unprovoked"
        },
        {
          id: 47,
          categoryId: 4,
          shortLabel: "SOCIAL WITHDRAWAL",
          prompt:
            "Have you been withdrawing from social activities from internal discomfort — not circumstance?",
          minLabel: "No change",
          maxLabel: "Significant self-imposed isolation"
        },
        {
          id: 48,
          categoryId: 4,
          shortLabel: "IDENTITY DISCONNECTION",
          prompt:
            "Do you feel fundamentally unrecognisable from the person you were 3–5 years ago?",
          minLabel: "I recognise myself fully",
          maxLabel: "I have completely lost who I was"
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
          id: 52,
          categoryId: 5,
          shortLabel: "LOSS OF MUSCLE TONE",
          prompt: "Have you noticed loss of muscle tone even with the same exercise?",
          minLabel: "No change",
          maxLabel: "Significant visible muscle loss"
        },
        {
          id: 53,
          categoryId: 5,
          shortLabel: "INABILITY TO LOSE WEIGHT",
          prompt:
            "Have strategies that previously worked for weight loss become ineffective now?",
          minLabel: "Normal response",
          maxLabel: "Complete resistance — nothing moves"
        },
        {
          id: 54,
          categoryId: 5,
          shortLabel: "ENERGY CRASHES AFTER EATING",
          prompt:
            "Do you experience significant energy crashes within 1–2 hours of eating?",
          minLabel: "No effect",
          maxLabel: "Every carb meal causes hours-long crash"
        },
        {
          id: 55,
          categoryId: 5,
          shortLabel: "FLUID RETENTION / PUFFINESS",
          prompt:
            "Do you experience puffiness or fluid retention — face, hands, ankles?",
          minLabel: "No change",
          maxLabel: "Daily puffiness, visible and uncomfortable"
        },
        {
          id: 56,
          categoryId: 5,
          shortLabel: "INCREASED HUNGER",
          prompt:
            "Do you feel hungry more frequently or do meals fail to satisfy you?",
          minLabel: "Normal appetite",
          maxLabel: "Constant hunger regardless of how much I eat"
        },
        {
          id: 57,
          categoryId: 5,
          shortLabel: "WAIST CIRCUMFERENCE CHANGE",
          prompt:
            "Has your waist circumference increased comparing to 2–3 years ago?",
          minLabel: "No change",
          maxLabel: "Over 4 inches increase"
        },
        {
          id: 58,
          categoryId: 5,
          shortLabel: "EXERCISE INTOLERANCE",
          prompt:
            "Has your exercise tolerance declined — requiring much longer recovery?",
          minLabel: "No change",
          maxLabel: "Exercise leaves me bedridden for 1–2 days"
        },
        {
          id: 59,
          categoryId: 5,
          shortLabel: "AFTERNOON ENERGY COLLAPSE",
          prompt:
            "Do you experience a severe biochemical-feeling energy crash in early-to-mid afternoon?",
          minLabel: "Normal afternoon energy",
          maxLabel: "2–4pm is a total write-off every day"
        },
        {
          id: 60,
          categoryId: 5,
          shortLabel: "PERCEIVED METABOLIC SLOWDOWN",
          prompt:
            "Does it seem like your body burns calories far more slowly than before?",
          minLabel: "No perceived change",
          maxLabel: "Metabolism seems to have completely stopped"
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
          id: 62,
          categoryId: 6,
          shortLabel: "HAIR TEXTURE CHANGE",
          prompt: "Has your hair become significantly drier, coarser, or more brittle?",
          minLabel: "No change",
          maxLabel: "Dramatic texture deterioration"
        },
        {
          id: 63,
          categoryId: 6,
          shortLabel: "EYEBROW THINNING",
          prompt: "Have your eyebrows thinned noticeably, especially at the outer edges?",
          minLabel: "No change",
          maxLabel: "Significant visible thinning"
        },
        {
          id: 64,
          categoryId: 6,
          shortLabel: "SKIN DRYNESS",
          prompt:
            "Has your skin become significantly drier no matter what products you use?",
          minLabel: "No change",
          maxLabel: "Constant severe dryness"
        },
        {
          id: 65,
          categoryId: 6,
          shortLabel: "LOSS OF SKIN ELASTICITY",
          prompt: "Have you noticed a rapid loss of skin firmness or elasticity?",
          minLabel: "No change",
          maxLabel: "Dramatic accelerated sagging"
        },
        {
          id: 66,
          categoryId: 6,
          shortLabel: "THIN / CREPEY SKIN",
          prompt:
            "Has the skin on arms, chest, knees, or hands become thinner or crepey?",
          minLabel: "No change",
          maxLabel: "Severe widespread crepiness"
        },
        {
          id: 67,
          categoryId: 6,
          shortLabel: "ADULT ACNE / BREAKOUTS",
          prompt: "Have you developed new acne or jawline breakouts?",
          minLabel: "None",
          maxLabel: "Severe ongoing breakouts"
        },
        {
          id: 68,
          categoryId: 6,
          shortLabel: "FACIAL HAIR GROWTH",
          prompt: "Have you noticed increased facial hair growth on chin, lip, or jaw?",
          minLabel: "No change",
          maxLabel: "Significant coarse hair growth"
        },
        {
          id: 69,
          categoryId: 6,
          shortLabel: "NAIL BRITTLENESS",
          prompt:
            "Have your nails become weaker, thinner, or prone to peeling/breaking?",
          minLabel: "No change",
          maxLabel: "Constant splitting and breakage"
        },
        {
          id: 70,
          categoryId: 6,
          shortLabel: "BRUISING / SKIN FRAGILITY",
          prompt:
            "Do you bruise more easily or feel your skin is more fragile than before?",
          minLabel: "No change",
          maxLabel: "Constant bruising and skin fragility"
        },
        {
          id: 71,
          categoryId: 6,
          shortLabel: "WOUND HEALING SLOWDOWN",
          prompt:
            "Have cuts, blemishes, or skin irritation started healing much more slowly?",
          minLabel: "No change",
          maxLabel: "Extremely delayed healing"
        },
        {
          id: 72,
          categoryId: 6,
          shortLabel: "ITCHING / CRAWLING SKIN",
          prompt:
            "Do you experience unexplained itching, tingling, or crawling skin sensations?",
          minLabel: "Never",
          maxLabel: "Daily severe symptoms"
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
          id: 74,
          categoryId: 7,
          shortLabel: "MORNING STIFFNESS DURATION",
          prompt:
            "How long does stiffness last after waking before your body loosens up?",
          minLabel: "None",
          maxLabel: "Over 2 hours"
        },
        {
          id: 75,
          categoryId: 7,
          shortLabel: "MUSCLE ACHES / HEAVINESS",
          prompt:
            "Do your muscles feel unusually achy, heavy, or weak for no clear reason?",
          minLabel: "Never",
          maxLabel: "Constant and debilitating"
        },
        {
          id: 76,
          categoryId: 7,
          shortLabel: "LOSS OF STRENGTH",
          prompt:
            "Have you noticed a real drop in physical strength despite normal effort?",
          minLabel: "No change",
          maxLabel: "Dramatic strength loss"
        },
        {
          id: 77,
          categoryId: 7,
          shortLabel: "EXERCISE RECOVERY PAIN",
          prompt:
            "Does exercise cause disproportionate soreness or delayed recovery now?",
          minLabel: "Normal recovery",
          maxLabel: "Recovery takes many days"
        },
        {
          id: 78,
          categoryId: 7,
          shortLabel: "FOOT / HEEL PAIN",
          prompt:
            "Have you developed new heel pain, plantar-type pain, or foot stiffness?",
          minLabel: "None",
          maxLabel: "Severe daily pain walking"
        },
        {
          id: 79,
          categoryId: 7,
          shortLabel: "SHOULDER / NECK TENSION",
          prompt:
            "Do you carry marked tension or pain in the neck / shoulders that wasn't typical before?",
          minLabel: "No change",
          maxLabel: "Constant severe tension/pain"
        },
        {
          id: 80,
          categoryId: 7,
          shortLabel: "LOWER BACK / HIP PAIN",
          prompt: "Have lower back or hip pain become significantly more common?",
          minLabel: "No change",
          maxLabel: "Severe daily pain"
        },
        {
          id: 81,
          categoryId: 7,
          shortLabel: "GRIP STRENGTH DECLINE",
          prompt:
            "Have you noticed weaker grip strength opening jars, carrying items, or training?",
          minLabel: "No change",
          maxLabel: "Severe noticeable weakness"
        },
        {
          id: 82,
          categoryId: 7,
          shortLabel: "BODY FRAILTY FEELING",
          prompt:
            "Do you feel physically more fragile or breakable than you used to?",
          minLabel: "Never",
          maxLabel: "Constantly feel physically fragile"
        },
        {
          id: 83,
          categoryId: 7,
          shortLabel: "HEIGHT / POSTURE CHANGE",
          prompt:
            "Have you noticed worsened posture or a sense that you've lost height?",
          minLabel: "No change",
          maxLabel: "Definite posture collapse / height loss"
        },
        {
          id: 84,
          categoryId: 7,
          shortLabel: "FEAR OF FUTURE FRACTURE",
          prompt:
            "Are you concerned your bones or body integrity are declining beneath the surface?",
          minLabel: "Not concerned",
          maxLabel: "Deeply concerned and often think about it"
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
          id: 88,
          categoryId: 8,
          shortLabel: "REDUCED AROUSAL RESPONSE",
          prompt:
            "Does it take much longer to become physically aroused even when mentally interested?",
          minLabel: "No change",
          maxLabel: "Arousal response almost absent"
        },
        {
          id: 89,
          categoryId: 8,
          shortLabel: "ORGASM CHANGES",
          prompt: "Have orgasms become weaker, harder to reach, or less satisfying?",
          minLabel: "No change",
          maxLabel: "Major loss of orgasm function"
        },
        {
          id: 90,
          categoryId: 8,
          shortLabel: "BLADDER URGENCY",
          prompt: "Do you experience sudden urgent need to urinate with little warning?",
          minLabel: "Never",
          maxLabel: "Frequent urgent near-accidents"
        },
        {
          id: 91,
          categoryId: 8,
          shortLabel: "URINARY FREQUENCY",
          prompt:
            "Are you needing to urinate far more often than before — day or night?",
          minLabel: "No change",
          maxLabel: "Constant frequent urination"
        },
        {
          id: 92,
          categoryId: 8,
          shortLabel: "RECURRENT UTIs / IRRITATION",
          prompt:
            "Have you had recurrent UTIs, bladder irritation, or burning without clear infection?",
          minLabel: "Never",
          maxLabel: "Recurrent / ongoing problem"
        },
        {
          id: 93,
          categoryId: 8,
          shortLabel: "STRESS INCONTINENCE",
          prompt:
            "Do you leak urine when coughing, sneezing, laughing, or exercising?",
          minLabel: "Never",
          maxLabel: "Frequent / severe leakage"
        },
        {
          id: 94,
          categoryId: 8,
          shortLabel: "NOCTURIA",
          prompt: "How often does needing to urinate wake you at night?",
          minLabel: "Never",
          maxLabel: "Multiple times every night"
        },
        {
          id: 95,
          categoryId: 8,
          shortLabel: "GENITAL DISCOMFORT / IRRITATION",
          prompt: "Do you experience daily vulvar irritation, itching, or discomfort?",
          minLabel: "Never",
          maxLabel: "Severe daily discomfort"
        },
        {
          id: 96,
          categoryId: 8,
          shortLabel: "IMPACT ON RELATIONSHIPS / SELF-IMAGE",
          prompt:
            "Have these intimate or urinary changes affected your relationship, confidence, or self-image?",
          minLabel: "Not at all",
          maxLabel: "Profound emotional impact"
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
          id: 98,
          categoryId: 9,
          shortLabel: "STAIRS / EXERTION TOLERANCE",
          prompt: "Has climbing stairs or normal exertion become noticeably harder?",
          minLabel: "No change",
          maxLabel: "Significantly breathless from mild exertion"
        },
        {
          id: 99,
          categoryId: 9,
          shortLabel: "HEART PALPITATIONS",
          prompt:
            "Do you experience skipped beats, pounding heartbeat, or fluttering sensations?",
          minLabel: "Never",
          maxLabel: "Daily / disruptive"
        },
        {
          id: 100,
          categoryId: 9,
          shortLabel: "DIZZINESS / LIGHTHEADEDNESS",
          prompt:
            "Do you experience dizziness, lightheadedness, or a floaty feeling on standing?",
          minLabel: "Never",
          maxLabel: "Frequent / interferes with daily life"
        },
        {
          id: 101,
          categoryId: 9,
          shortLabel: "AFTERNOON ENERGY DROP",
          prompt:
            "Do you experience a predictable afternoon collapse in physical energy?",
          minLabel: "No pattern",
          maxLabel: "Severe daily collapse"
        },
        {
          id: 102,
          categoryId: 9,
          shortLabel: "EXHAUSTION DESPITE REST",
          prompt:
            "Do you still feel physically drained even after a full night's sleep or time off?",
          minLabel: "Rarely",
          maxLabel: "Constantly exhausted regardless of rest"
        },
        {
          id: 103,
          categoryId: 9,
          shortLabel: "BODY BATTERY RECOVERY",
          prompt:
            "How well does your energy recover after a quiet day or restful weekend?",
          minLabel: "Recovers normally",
          maxLabel: "Barely recovers at all"
        },
        {
          id: 104,
          categoryId: 9,
          shortLabel: "SHORTNESS OF BREATH AWARENESS",
          prompt:
            "Have you become more aware of your breathing or shortness of breath without clear explanation?",
          minLabel: "No change",
          maxLabel: "Frequent unexplained breathlessness"
        },
        {
          id: 105,
          categoryId: 9,
          shortLabel: "EXERCISE HEART RATE RESPONSE",
          prompt:
            "Does your heart rate feel exaggerated or abnormal for the level of exercise you're doing?",
          minLabel: "Feels normal",
          maxLabel: "Very abnormal / concerning"
        },
        {
          id: 106,
          categoryId: 9,
          shortLabel: "HEAVY LIMBS / BODY DRAG",
          prompt:
            "Do your legs or body feel unusually heavy — like you're moving through mud?",
          minLabel: "Never",
          maxLabel: "Daily severe heaviness"
        },
        {
          id: 107,
          categoryId: 9,
          shortLabel: "BLOOD PRESSURE / FLUSHING SWINGS",
          prompt:
            "Do you feel internal surges, pounding, pressure swings, or flushing episodes beyond standard hot flashes?",
          minLabel: "Never",
          maxLabel: "Frequent intense episodes"
        },
        {
          id: 108,
          categoryId: 9,
          shortLabel: "CAPACITY FOR FULL DAY",
          prompt:
            "Can your body still sustain a full productive day without biochemical shutdown?",
          minLabel: "Yes, fully",
          maxLabel: "No — body crashes before day ends"
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
          id: 110,
          categoryId: 10,
          shortLabel: "HANGOVER / RECOVERY INTENSITY",
          prompt:
            "Does alcohol now trigger sleep disruption, anxiety, flushing, or next-day crashes?",
          minLabel: "No effect",
          maxLabel: "Severe reaction every time"
        },
        {
          id: 111,
          categoryId: 10,
          shortLabel: "BLOATED AFTER HEALTHY MEALS",
          prompt: "Do you bloat even after meals you consider clean or healthy?",
          minLabel: "Never",
          maxLabel: "Almost every meal"
        },
        {
          id: 112,
          categoryId: 10,
          shortLabel: "DIGESTIVE SLOWDOWN / CONSTIPATION",
          prompt:
            "Have you developed constipation, sluggish digestion, or incomplete bowel movements?",
          minLabel: "No change",
          maxLabel: "Severe ongoing issue"
        },
        {
          id: 113,
          categoryId: 10,
          shortLabel: "FOOD SENSITIVITY ESCALATION",
          prompt: "Have you become newly reactive to foods you used to tolerate fine?",
          minLabel: "No change",
          maxLabel: "Many foods now trigger symptoms"
        },
        {
          id: 114,
          categoryId: 10,
          shortLabel: "STRESS RECOVERY TIME",
          prompt: "Once stressed, how quickly does your body return to baseline?",
          minLabel: "Recovers quickly",
          maxLabel: "Stays activated for hours or all day"
        },
        {
          id: 115,
          categoryId: 10,
          shortLabel: "MORNING RECOVERY FEELING",
          prompt: "Does a full night's sleep actually reset your system by morning?",
          minLabel: "Yes, reliably",
          maxLabel: "No reset at all"
        },
        {
          id: 116,
          categoryId: 10,
          shortLabel: "CAFFEINE TOLERANCE CHANGE",
          prompt:
            "Has caffeine started causing anxiety, palpitations, or crash symptoms more than before?",
          minLabel: "No change",
          maxLabel: "Very reactive now"
        },
        {
          id: 117,
          categoryId: 10,
          shortLabel: "HYDRATION / ELECTROLYTE DEPENDENCE",
          prompt:
            "Do you feel disproportionately worse when slightly dehydrated or under-fuelled?",
          minLabel: "No change",
          maxLabel: "Small dips hit me hard"
        },
        {
          id: 118,
          categoryId: 10,
          shortLabel: "RESILIENCE TO BUSY DAYS",
          prompt:
            "Can your body still handle a full busy day without needing major recovery after?",
          minLabel: "Yes, easily",
          maxLabel: "No — any full day wipes me out"
        },
        {
          id: 119,
          categoryId: 10,
          shortLabel: "OVERALL SYSTEM INFLAMMATION FEEL",
          prompt:
            "Does your body feel more inflamed, reactive, puffy, or sensitive than before?",
          minLabel: "No change",
          maxLabel: "Constantly inflamed / reactive"
        },
        {
          id: 120,
          categoryId: 10,
          shortLabel: "LOSS OF PHYSIOLOGIC RESILIENCE",
          prompt:
            "Overall, how much has your body's ability to “bounce back” declined?",
          minLabel: "No decline",
          maxLabel: "Bounce-back ability feels gone"
        }
      ]
    }
  ]

/**
 * P4 — plain-language help text shown under each category title in the
 * AssessmentCategoryScreen. One sentence, friendly tone, no jargon — meant
 * to answer "what is this section actually asking about?" before the user
 * starts the questions.
 *
 * Keyed by category slug so it works for both the 30-question free set
 * (abbreviatedAssessmentQuestions.ts) and the 120-question paid set above.
 */
export const CATEGORY_HELP_BY_SLUG: Record<string, string> = {
  "vasomotor-temperature":
    "These questions are about hot flashes, night sweats, and how your body's heat thermostat is behaving — one of the clearest signals of perimenopausal hormone shifts.",
  "sleep-architecture-cortisol":
    "Sleep is the single most leveraged thing in menopause — when sleep recovers, mood, weight, focus, and energy usually follow. We're mapping how yours is right now.",
  "cognitive-function-brain-health":
    "Word-finding lapses, working-memory dips, and the 'brain fog' you might be feeling — these questions help us see the pattern. Most of these changes are reversible with the right support.",
  "mood-anxiety-emotional-health":
    "Perimenopausal mood shifts are biochemical, not characterological. These questions help us understand what's happening so we can match you to the right kind of help.",
  "metabolic-health-body-composition":
    "Falling estradiol changes how your body stores energy and builds muscle. These questions map the metabolic shifts so the response can be specific, not generic.",
  "skin-hair-nails":
    "Collagen drops about 30% in the first five postmenopausal years — these questions track the visible signs and help us recommend support that actually works.",
  "musculoskeletal-bone-health":
    "Bone density, joint inflammation, and muscle changes accelerate during this transition. We're mapping where you are so prevention and care can start at the right level.",
  "genitourinary-sexual-health":
    "These are among the most under-treated and most highly responsive symptoms of menopause. Asking openly here unlocks options most women don't realise exist.",
  "cardiovascular-whole-body-energy":
    "Estrogen is cardioprotective. These questions track changes in your energy, heart rhythm, and circulation so cardiovascular care can stay ahead of risk.",
  "lifestyle-gut-health-nutrition":
    "Daily lifestyle, gut health, stress load, and nutrition compound everything else. These questions map the foundation so the rest of the plan stands on solid ground.",
}