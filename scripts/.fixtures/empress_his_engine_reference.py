"""
╔══════════════════════════════════════════════════════════════════════════════╗
║          EMPRESS HEALTH — HEALTH INTELLIGENCE SCORE ENGINE v1.0            ║
║          Biostatistics & Data Science Division                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

Complete scoring pipeline for the Empress 120-item menopause wellness assessment.

REGULATORY NOTICE
─────────────────
This engine produces wellness assessment outputs ONLY.
No output constitutes medical diagnosis, clinical assessment,
or treatment recommendation. Classification: General Wellness Tool
per 21 CFR §880.6310. Not a medical device.

SCORING ARCHITECTURE SUMMARY
─────────────────────────────
Item scale     : 0–10 (0 = maximum severity, 10 = no symptom)  ← flipped 2026-05-15
Scoring rule   : Items used directly — no reverse-scoring (slider is wellness-
                 aligned). `reverse_score()` is kept as identity so parity tests
                 between this Python reference and prds/hisEngine.ts still hold.
Domain formula : DS_d = [Σ raw_i / (n_d × 10)] × 100   →  0–100
Composite      : HIS = max(1, round(Σ (w_d,stage / 100) × DS_d))  →  1–100
Stage routing  : Single staging intake question (not demographic variable)

Pre-2026-05-15 note: the slider previously emitted 0=no-symptom / 10=severe and
every item was reverse-scored as 10 − raw so wellness ran high. After the
slider was flipped, that reverse-scoring step was removed (it would now
double-invert) and the item-flag thresholds were inverted from >= 8 to <= 2.

Domain weights sum to 100% per stage. Stage-specific weights reflect
shifting clinical risk profiles across the menopause continuum.

DOMAIN ARCHITECTURE (10 domains, 120 items)
────────────────────────────────────────────
D01  Vasomotor & Temperature           Q1–Q12    12 items
D02  Sleep Architecture & Cortisol     Q13–Q23   11 items  ← unequal (normalised)
D03  Cognitive Function & Brain Health Q24–Q35   12 items
D04  Mood, Anxiety & Emotional Health  Q36–Q48   13 items  ← unequal (normalised)
D05  Metabolic Health & Body Comp.     Q49–Q60   12 items
D06  Skin, Hair & Nails               Q61–Q72   12 items
D07  Musculoskeletal & Bone Health     Q73–Q84   12 items
D08  Genitourinary & Sexual Health     Q85–Q96   12 items
D09  Cardiovascular & Whole-Body Energy Q97–Q108  12 items
D10  Lifestyle, Gut Health & Nutrition Q109–Q120 12 items

STAGE WEIGHT MATRIX (%)
────────────────────────
Domain           Perimenopause  Menopause  Post-Menopause
D01 Vasomotor         12           16            8
D02 Sleep             14           14           10
D03 Cognitive         12           12           14
D04 Mood              14           12           10
D05 Metabolic         10           12           14
D06 Skin/Hair          6            5            5
D07 Bone/MSK           8            8           14
D08 GU/Sexual          8           10           12
D09 Cardiovascular    10            9           11
D10 Lifestyle          6            2            2
TOTAL                100          100          100

References: SWAN cohort · WHI · Greene Climacteric Scale · MENQOL ·
Menopause Rating Scale · FRAX · PSQI · PHQ-4 · GAD-7
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

# Domain metadata: id → {name, items list, n_items}
DOMAIN_CONFIG: Dict[int, dict] = {
    1:  {"name": "Vasomotor & Temperature",             "items": list(range(1,  13)),  "n": 12},
    2:  {"name": "Sleep Architecture & Cortisol",        "items": list(range(13, 24)),  "n": 11},
    3:  {"name": "Cognitive Function & Brain Health",    "items": list(range(24, 36)),  "n": 12},
    4:  {"name": "Mood, Anxiety & Emotional Health",     "items": list(range(36, 49)),  "n": 13},
    5:  {"name": "Metabolic Health & Body Composition",  "items": list(range(49, 61)),  "n": 12},
    6:  {"name": "Skin, Hair & Nails",                   "items": list(range(61, 73)),  "n": 12},
    7:  {"name": "Musculoskeletal & Bone Health",         "items": list(range(73, 85)),  "n": 12},
    8:  {"name": "Genitourinary & Sexual Health",         "items": list(range(85, 97)),  "n": 12},
    9:  {"name": "Cardiovascular & Whole-Body Energy",   "items": list(range(97, 109)), "n": 12},
    10: {"name": "Lifestyle, Gut Health & Nutrition",    "items": list(range(109, 121)),"n": 12},
}

# Stage-specific domain weight matrices (all rows must sum to 100)
DOMAIN_WEIGHTS: Dict[str, Dict[int, int]] = {
    "perimenopause":  {1:12, 2:14, 3:12, 4:14, 5:10, 6:6, 7:8,  8:8,  9:10, 10:6},
    "menopause":      {1:16, 2:14, 3:12, 4:12, 5:12, 6:5, 7:8,  8:10, 9:9,  10:2},
    "post_menopause": {1:8,  2:10, 3:14, 4:10, 5:14, 6:5, 7:14, 8:12, 9:11, 10:2},
}

# Client-facing staging intake question options → stage key
STAGE_MAPPING: Dict[int, str] = {
    1: "perimenopause",   # "Irregular periods or menstruating with symptoms"
    2: "menopause",       # "No period <12 months or surgical/iatrogenic menopause"
    3: "post_menopause",  # "No period 12+ months (natural)"
}

# Clinical flag items: q_num → (threshold, priority, referral_note)
# ALL fire on raw score ≤ threshold BEFORE composite computation
# 2026-05-15: thresholds inverted from >= 8 to <= 2 to match the flipped
# slider direction. A threshold of 2 means "fires when user answered 0, 1, or 2"
# — the worst-symptom end of the new slider.
CLINICAL_FLAGS: Dict[int, Tuple[int, str, str]] = {
    2:  (2, "RECOMMENDED", "Disabling vasomotor symptoms — evaluate for MHT or non-hormonal pharmacotherapy (fezolinetant, SSRIs/SNRIs)"),
    41: (2, "URGENT",      "Severe depressive episodes — immediate mental health referral; PHQ-9 to be administered by licensed clinician"),
    43: (2, "URGENT",      "Frequent panic attacks — psychiatric or psychological evaluation required"),
    48: (2, "RECOMMENDED", "Profound identity disconnection — mental health professional support strongly recommended"),
    57: (2, "RECOMMENDED", "Waist circumference >4 inch increase — metabolic syndrome screening: fasting glucose, HbA1c, fasting lipids"),
    63: (2, "RECOMMENDED", "Lateral eyebrow thinning — thyroid function panel (TSH, free T4) to exclude hypothyroidism"),
    82: (2, "RECOMMENDED", "Perceived physical frailty — functional mobility assessment and DEXA bone density scan referral"),
    83: (2, "RECOMMENDED", "Height/posture loss — DEXA bone density scan and vertebral fracture assessment recommended"),
    84: (2, "RECOMMENDED", "High fracture concern — FRAX 10-year risk calculation, DEXA referral; discuss bisphosphonate eligibility"),
    86: (2, "URGENT",      "Intercourse not possible due to pain — GSM (genitourinary syndrome of menopause) pathway; vaginal estrogen or ospemifene evaluation"),
    93: (2, "RECOMMENDED", "Severe stress incontinence — pelvic floor physiotherapy and urogynecology referral"),
    99: (2, "URGENT",      "Daily palpitations — 12-lead ECG and 24-hour Holter monitoring; cardiology referral"),
    104:(2, "URGENT",      "Unexplained dyspnea — cardiac workup (echocardiogram, exercise stress test) and pulmonary evaluation (spirometry)"),
    105:(2, "URGENT",      "Abnormal cardiac response to exercise — exercise stress test and cardiology evaluation required"),
    107:(2, "RECOMMENDED", "Autonomic BP/flushing swings — 24-hour ambulatory blood pressure monitoring; cardiology review"),
}

# MHT-sensitive domains (score overlay required when mht_active=True)
MHT_SENSITIVE_DOMAINS: List[int] = [1, 8]

# Domain-level flag threshold: DS ≤ this → mandatory clinical referral note
DOMAIN_FLAG_THRESHOLD: float = 20.0

# Composite critical threshold: HIS ≤ this → Critical band + mandatory escalation language
COMPOSITE_CRITICAL_THRESHOLD: int = 39

# Composite score interpretation bands: (low, high, label, color_hex)
SCORE_BANDS: List[Tuple[int, int, str, str]] = [
    (85, 100, "Thriving",    "#1D9E75"),
    (70,  84, "Flourishing", "#639922"),
    (55,  69, "Managing",    "#EF9F27"),
    (40,  54, "Struggling",  "#D85A30"),
    (1,   39, "Critical",    "#A32D2D"),
]

# Domain-level interpretation bands: (low, high, label)
DOMAIN_BANDS: List[Tuple[int, int, str]] = [
    (70, 100, "High"),
    (35,  69, "Moderate"),
    (0,   34, "Low"),
]

# Question labels for report readability (Q1–Q120)
QUESTION_LABELS: Dict[int, str] = {
    1:"Hot flash frequency", 2:"Hot flash severity", 3:"Night sweat frequency",
    4:"Hot flash duration", 5:"Palpitations during flashes", 6:"Chills after flash",
    7:"Cold hands & feet", 8:"Heat intolerance", 9:"Alcohol as flash trigger",
    10:"Stress-triggered flashes", 11:"Caffeine as flash trigger", 12:"Facial flushing",
    13:"Sleep onset latency", 14:"Night wakings frequency", 15:"2–4am waking pattern",
    16:"Wired-but-tired paradox", 17:"Sleep satisfaction on waking", 18:"Morning body lag",
    19:"Dream intensity & nightmares", 20:"Restless legs at night",
    21:"Sleep environment sensitivity", 22:"Daytime sleepiness", 23:"Nap dependency",
    24:"Word-finding difficulty", 25:"Short-term memory lapses", 26:"Concentration span",
    27:"Mental processing speed", 28:"Spatial memory loss", 29:"Multi-tasking capacity",
    30:"Decision fatigue", 31:"Reading re-reading", 32:"Mental clarity on waking",
    33:"Number & calculation difficulty", 34:"Professional confidence decline",
    35:"Mental endurance",
    36:"Baseline anxiety level", 37:"Feeling of dread or doom", 38:"Irritability threshold",
    39:"Rage episodes", 40:"Emotional volatility", 41:"Depressive episodes",
    42:"Emotional numbness", 43:"Panic attacks", 44:"Afternoon low / flat spell",
    45:"Loss of motivation / drive", 46:"Crying easily / tearfulness",
    47:"Social withdrawal", 48:"Identity disconnection",
    49:"Unexplained weight gain", 50:"Abdominal bloating", 51:"Sugar & carb cravings",
    52:"Loss of muscle tone", 53:"Inability to lose weight", 54:"Energy crashes after eating",
    55:"Fluid retention / puffiness", 56:"Increased hunger", 57:"Waist circumference change",
    58:"Exercise intolerance", 59:"Afternoon energy collapse", 60:"Perceived metabolic slowdown",
    61:"Hair shedding / thinning", 62:"Hair texture change", 63:"Eyebrow thinning",
    64:"Skin dryness", 65:"Loss of skin elasticity", 66:"Thin / crepey skin",
    67:"Adult acne / breakouts", 68:"Facial hair growth", 69:"Nail brittleness",
    70:"Bruising / skin fragility", 71:"Wound healing slowdown", 72:"Itching / crawling skin",
    73:"Joint pain / stiffness", 74:"Morning stiffness duration", 75:"Muscle aches / heaviness",
    76:"Loss of strength", 77:"Exercise recovery pain", 78:"Foot / heel pain",
    79:"Shoulder / neck tension", 80:"Lower back / hip pain", 81:"Grip strength decline",
    82:"Body frailty feeling", 83:"Height / posture change", 84:"Fear of future fracture",
    85:"Vaginal dryness", 86:"Pain with intercourse", 87:"Loss of libido",
    88:"Reduced arousal response", 89:"Orgasm changes", 90:"Bladder urgency",
    91:"Urinary frequency", 92:"Recurrent UTIs / irritation", 93:"Stress incontinence",
    94:"Nocturia", 95:"Genital discomfort / irritation", 96:"Impact on relationships / self-image",
    97:"Baseline energy level", 98:"Stairs / exertion tolerance", 99:"Heart palpitations",
    100:"Dizziness / lightheadedness", 101:"Afternoon energy drop",
    102:"Exhaustion despite rest", 103:"Body battery recovery",
    104:"Shortness of breath awareness", 105:"Exercise heart rate response",
    106:"Heavy limbs / body drag", 107:"BP / flushing swings", 108:"Capacity for full day",
    109:"Alcohol tolerance decline", 110:"Hangover / recovery intensity",
    111:"Bloated after healthy meals", 112:"Digestive slowdown / constipation",
    113:"Food sensitivity escalation", 114:"Stress recovery time",
    115:"Morning recovery feeling", 116:"Caffeine tolerance change",
    117:"Hydration / electrolyte dependence", 118:"Resilience to busy days",
    119:"Overall system inflammation", 120:"Loss of physiologic resilience",
}


# ═══════════════════════════════════════════════════════════════════════════════
# STARTUP VALIDATION
# ═══════════════════════════════════════════════════════════════════════════════

def _validate_config() -> None:
    """Validate all configuration constants at module load time."""
    # Weight sums
    for stage, weights in DOMAIN_WEIGHTS.items():
        total = sum(weights.values())
        assert total == 100, f"Weight sum error: {stage} sums to {total}, must be 100"
        assert set(weights.keys()) == set(DOMAIN_CONFIG.keys()), \
            f"Weight domain keys mismatch for {stage}"

    # Item count
    all_items = [q for cfg in DOMAIN_CONFIG.values() for q in cfg["items"]]
    assert len(all_items) == 120, f"Item count error: {len(all_items)} items, expected 120"
    assert len(set(all_items)) == 120, "Duplicate question numbers in domain config"
    assert set(all_items) == set(range(1, 121)), "Question numbers must be 1–120 contiguous"

    # Flag items must exist in question bank
    for q in CLINICAL_FLAGS:
        assert q in QUESTION_LABELS, f"Flag item Q{q} not found in question labels"

_validate_config()


# ═══════════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def reverse_score(raw: int) -> int:
    """
    Identity passthrough (was 10 − raw before 2026-05-15).

    All 120 items are wellness scales where:
        0 = maximum severity / worst state
       10 = no symptom / best state                ← flipped 2026-05-15

    HIS direction: higher score = better wellness. Since the slider is now
    wellness-aligned, no transformation is needed. This function is retained
    (and returns raw unchanged) so external callers — and the TS port —
    keep working without having to plumb a new function name through their
    pipelines.

    Args:
        raw:  Client's raw response (integer, 0–10 inclusive)

    Returns:
        Item wellness score (0–10), where 10 = optimal wellness

    Raises:
        ValueError: If raw is outside [0, 10]
    """
    if not isinstance(raw, int) or not (0 <= raw <= 10):
        raise ValueError(
            f"Raw response must be an integer in [0, 10]. Received: {raw!r}"
        )
    return raw


def get_item_domain(q_num: int) -> int:
    """Return the domain ID for a given question number."""
    for d_id, cfg in DOMAIN_CONFIG.items():
        if q_num in cfg["items"]:
            return d_id
    raise ValueError(f"Question Q{q_num} not found in any domain")


def get_score_band(score: float, bands: list) -> Tuple[str, str]:
    """
    Return (label, color_hex) for a score against a band definition list.

    Args:
        score:  Numeric score to classify
        bands:  List of (low, high, label, color) tuples

    Returns:
        Tuple of (band_label, color_hex)
    """
    for row in bands:
        low, high, label = row[0], row[1], row[2]
        color = row[3] if len(row) > 3 else "#888888"
        if low <= score <= high:
            return label, color
    return "Unknown", "#888888"


def get_domain_band(score: float) -> str:
    """Return domain-level band label (High / Moderate / Low)."""
    label, _ = get_score_band(score, DOMAIN_BANDS)
    return label


# ═══════════════════════════════════════════════════════════════════════════════
# MISSING DATA HANDLER
# ═══════════════════════════════════════════════════════════════════════════════

def handle_missing_items(
    domain_responses: Dict[int, Optional[int]]
) -> Optional[Dict[int, int]]:
    """
    Apply Empress missing data protocol within a single domain.

    Protocol:
      0 missing   →  return as-is (no imputation needed)
      1–2 missing →  mean imputation from completed items (rounded to int)
      3+ missing  →  return None  (domain excluded from composite)

    Imputation is applied at the raw score level, before reverse-scoring.
    The imputed flag is propagated to the result for report transparency.

    Args:
        domain_responses:  Dict {q_num: raw_value or None}

    Returns:
        Dict {q_num: imputed_raw_value} with no Nones, or None if excluded
    """
    missing_qs = [k for k, v in domain_responses.items() if v is None]
    n_missing = len(missing_qs)

    if n_missing == 0:
        return dict(domain_responses)  # type: ignore[return-value]

    if n_missing >= 3:
        return None  # Domain excluded — too many missing items

    # Mean imputation: compute mean from completed raw values
    completed = [v for v in domain_responses.values() if v is not None]
    imputed_val = round(sum(completed) / len(completed))

    result = {}
    for q, v in domain_responses.items():
        result[q] = imputed_val if v is None else v
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# DOMAIN SCORE COMPUTATION
# ═══════════════════════════════════════════════════════════════════════════════

def compute_domain_score(
    domain_id: int,
    full_responses: Dict[int, Optional[int]],
) -> Optional[float]:
    """
    Compute normalised domain score DS_d on a 0–100 scale.

    Formula:
        DS_d = [ Σ(10 - raw_i) / (n_d × 10) ] × 100

    The denominator n_d × 10 is the maximum possible reversed sum for
    domain d, ensuring all domains are on an identical 0–100 scale
    regardless of how many items the domain contains.

    This normalisation is mandatory because:
        Domain 2 (Sleep) has 11 items  →  max raw reversed = 110
        Domain 4 (Mood)  has 13 items  →  max raw reversed = 130
        All others       have 12 items  →  max raw reversed = 120

    Without normalisation these three ranges would be incommensurable
    in the weighted composite.

    Args:
        domain_id:       Domain identifier (1–10)
        full_responses:  Full {q_num: raw_value or None} for all 120 items

    Returns:
        Domain score in [0.0, 100.0] rounded to 2 decimal places,
        or None if domain is excluded due to excessive missing data
    """
    cfg = DOMAIN_CONFIG[domain_id]
    items = cfg["items"]
    n_d = cfg["n"]

    # Extract this domain's responses
    domain_resps: Dict[int, Optional[int]] = {q: full_responses.get(q) for q in items}

    # Apply missing data protocol
    imputed = handle_missing_items(domain_resps)
    if imputed is None:
        return None  # Domain excluded

    # Sum item wellness scores (reverse_score is identity post-2026-05-15)
    reversed_sum = sum(reverse_score(v) for v in imputed.values())

    # Normalise to 0–100
    return round((reversed_sum / (n_d * 10)) * 100, 2)


# ═══════════════════════════════════════════════════════════════════════════════
# COMPOSITE HIS COMPUTATION
# ═══════════════════════════════════════════════════════════════════════════════

def compute_his(
    domain_scores: Dict[int, Optional[float]],
    stage: str,
) -> Tuple[Optional[int], Dict[int, float]]:
    """
    Compute composite Health Intelligence Score (HIS).

    Formula:
        HIS = max(1, round( Σ_{d=1..10} (w_{d,stage} / 100) × DS_d ))

    Excluded domains (DS_d = None) have their weights renormalised
    proportionally so the remaining domain weights still sum to 100.
    This is the only modification to the weight matrix — no other
    adjustments are made.

    If ≥3 domains are excluded, HIS cannot be computed reliably and
    None is returned.

    Score is floored at 1 (never 0) and capped at 100.

    Args:
        domain_scores:  {domain_id: DS_d or None}
        stage:          Stage key string

    Returns:
        Tuple of:
          - HIS (integer 1–100), or None if too many domains excluded
          - Effective weight dict {domain_id: weight_used} (sums to 100)
    """
    if stage not in DOMAIN_WEIGHTS:
        raise ValueError(f"Unknown stage: {stage!r}. Must be one of {list(DOMAIN_WEIGHTS)}")

    base_weights = DOMAIN_WEIGHTS[stage]
    valid = {d: s for d, s in domain_scores.items() if s is not None}
    excluded = {d for d, s in domain_scores.items() if s is None}

    if len(excluded) >= 3:
        return None, {}

    # Renormalise weights if any domains excluded
    if excluded:
        total_valid_weight = sum(base_weights[d] for d in valid)
        effective_weights: Dict[int, float] = {
            d: round((base_weights[d] / total_valid_weight) * 100, 4)
            for d in valid
        }
    else:
        effective_weights = {d: float(w) for d, w in base_weights.items()}

    # Weighted sum
    weighted_sum = sum(
        (effective_weights[d] / 100.0) * score
        for d, score in valid.items()
    )

    # Floor at 1, cap at 100
    his = max(1, min(100, round(weighted_sum)))
    return his, effective_weights


# ═══════════════════════════════════════════════════════════════════════════════
# CLINICAL FLAG DETECTION
# ═══════════════════════════════════════════════════════════════════════════════

def detect_item_flags(
    responses: Dict[int, Optional[int]]
) -> List[Dict]:
    """
    Detect item-level clinical flags.

    Fires when a client's RAW response on a flagged item meets or exceeds
    the item-specific threshold. Applied BEFORE composite computation.
    Independence from HIS: a flag fires even if overall HIS is high.

    Args:
        responses:  Full {q_num: raw_value or None}

    Returns:
        List of flag dicts, sorted by priority (URGENT first):
            {question, label, raw_score, domain_id, domain_name,
             priority, referral_text}
    """
    triggered = []
    for q_num, (threshold, priority, referral_text) in CLINICAL_FLAGS.items():
        raw = responses.get(q_num)
        if raw is not None and raw <= threshold:
            d_id = get_item_domain(q_num)
            triggered.append({
                "question":       q_num,
                "label":          QUESTION_LABELS[q_num],
                "raw_score":      raw,
                "domain_id":      d_id,
                "domain_name":    DOMAIN_CONFIG[d_id]["name"],
                "priority":       priority,
                "referral_text":  referral_text,
            })

    # Sort URGENT before RECOMMENDED
    triggered.sort(key=lambda x: (0 if x["priority"] == "URGENT" else 1, x["question"]))
    return triggered


def detect_domain_flags(
    domain_scores: Dict[int, Optional[float]]
) -> List[Dict]:
    """
    Detect domain-level clinical flags (DS_d ≤ DOMAIN_FLAG_THRESHOLD).

    A domain score ≤ 20 indicates severe symptom burden across the entire
    clinical area — equivalent to an average raw severity of ≥8 per item.
    This fires before composite computation and regardless of HIS band.

    Args:
        domain_scores:  {domain_id: DS_d or None}

    Returns:
        List of flag dicts: {domain_id, domain_name, domain_score, message}
    """
    triggered = []
    for d_id, score in domain_scores.items():
        if score is not None and score <= DOMAIN_FLAG_THRESHOLD:
            triggered.append({
                "domain_id":   d_id,
                "domain_name": DOMAIN_CONFIG[d_id]["name"],
                "domain_score": round(score, 1),
                "message": (
                    f"Domain score {score:.1f}/100 at or below the severe-burden "
                    f"threshold of {DOMAIN_FLAG_THRESHOLD}. This clinical area "
                    f"requires professional evaluation."
                ),
            })
    return triggered


# ═══════════════════════════════════════════════════════════════════════════════
# RESULT DATA CLASS
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class HISResult:
    """
    Complete output of a single Empress assessment run.

    This object is the single source of truth for all downstream report
    generation, data storage, and provider communication.
    """
    # ── Inputs ──────────────────────────────────────────────────────────────
    stage: str
    mht_active: bool

    # ── Domain-level results ─────────────────────────────────────────────────
    domain_scores: Dict[int, Optional[float]]   # DS_d for each domain (0–100 or None)
    domain_bands:  Dict[int, str]               # "High" / "Moderate" / "Low" / "Excluded"
    excluded_domains: List[int]                 # Domains dropped due to ≥3 missing items
    imputed_domains:  List[int]                 # Domains where 1–2 items were imputed

    # ── Composite ────────────────────────────────────────────────────────────
    his:               Optional[int]            # Health Intelligence Score (1–100 or None)
    his_band:          str                      # "Thriving" / "Flourishing" / etc.
    his_color:         str                      # Hex color for UI rendering
    effective_weights: Dict[int, float]         # Weights actually used (post renormalisation)

    # ── Clinical flags ────────────────────────────────────────────────────────
    item_flags:      List[Dict]    # Item-level flags (Q-level hard triggers)
    domain_flags:    List[Dict]    # Domain-level flags (DS ≤ 20)
    composite_flag:  bool          # HIS ≤ 39 (Critical band)
    mht_flag:        bool          # MHT overlay required on D1 and D8

    # ── Metadata ─────────────────────────────────────────────────────────────
    n_answered:         int
    n_missing:          int
    assessment_valid:   bool       # False if ≥3 domains excluded (HIS = None)

    @property
    def urgent_flags(self) -> List[Dict]:
        """Return only URGENT item-level clinical flags."""
        return [f for f in self.item_flags if f["priority"] == "URGENT"]

    @property
    def recommended_flags(self) -> List[Dict]:
        """Return only RECOMMENDED item-level clinical flags."""
        return [f for f in self.item_flags if f["priority"] == "RECOMMENDED"]

    @property
    def total_flags(self) -> int:
        """Total number of clinical flags triggered (item + domain level)."""
        return len(self.item_flags) + len(self.domain_flags)

    @property
    def top_concern_domains(self) -> List[int]:
        """Domain IDs with Low band score, sorted by score ascending."""
        low = {d: s for d, s in self.domain_scores.items()
               if s is not None and s <= 34}
        return sorted(low, key=lambda d: low[d])

    @property
    def stage_display(self) -> str:
        """Human-readable stage label."""
        return self.stage.replace("_", "-").title()


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

def run_assessment(
    responses:        Dict[int, Optional[int]],
    staging_response: int,
    mht_active:       bool = False,
) -> HISResult:
    """
    Execute the complete Empress HIS assessment pipeline.

    This is the single entry point for all scoring.  The pipeline runs
    in strict order to ensure clinical flags fire before any composite
    computation, and to honour the missing data protocol at the earliest
    possible stage.

    Pipeline order:
        1. Input validation
        2. Stage determination
        3. Domain score computation (with missing data handling)
        4. Item-level clinical flag detection  ← BEFORE composite
        5. Domain-level clinical flag detection ← BEFORE composite
        6. Composite HIS computation
        7. Score interpretation
        8. MHT flag determination
        9. Return HISResult

    Args:
        responses:          Dict of {q_num (1–120): raw response (0–10) or None}.
                            Omitted questions are treated as None (missing).
        staging_response:   Integer 1, 2, or 3 corresponding to:
                                1 = Perimenopause
                                2 = Menopause
                                3 = Post-menopause
        mht_active:         True if client is currently on MHT/HRT.
                            Triggers overlay flag on Domains 1 and 8.

    Returns:
        HISResult dataclass containing all computed outputs.

    Raises:
        ValueError: Invalid q_num, invalid raw response, or invalid staging.

    Example:
        >>> responses = {i: 4 for i in range(1, 121)}  # All moderate raw scores
        >>> responses[2]  = 9   # Severe hot flash → RECOMMENDED flag
        >>> responses[41] = 9   # Severe depression → URGENT flag
        >>> result = run_assessment(responses, staging_response=1)
        >>> print(f"HIS: {result.his} — {result.his_band}")
        HIS: 61 — Managing
        >>> print(f"Urgent flags: {len(result.urgent_flags)}")
        Urgent flags: 1
    """
    # ── 1. Validate inputs ───────────────────────────────────────────────────
    valid_q_nums = set(range(1, 121))
    unknown_qs = set(responses.keys()) - valid_q_nums
    if unknown_qs:
        raise ValueError(f"Invalid question numbers: {sorted(unknown_qs)}")

    for q, v in responses.items():
        if v is not None:
            if not isinstance(v, int) or not (0 <= v <= 10):
                raise ValueError(
                    f"Q{q}: raw response must be integer 0–10, got {v!r}"
                )

    if staging_response not in STAGE_MAPPING:
        raise ValueError(
            f"staging_response must be 1, 2, or 3. Got: {staging_response!r}"
        )

    # ── 2. Stage determination ────────────────────────────────────────────────
    stage = STAGE_MAPPING[staging_response]

    # Fill any omitted questions as None (missing)
    full: Dict[int, Optional[int]] = {q: responses.get(q) for q in range(1, 121)}
    n_answered = sum(1 for v in full.values() if v is not None)
    n_missing  = 120 - n_answered

    # ── 3. Domain score computation ───────────────────────────────────────────
    domain_scores:    Dict[int, Optional[float]] = {}
    excluded_domains: List[int]                  = []
    imputed_domains:  List[int]                  = []

    for d_id, cfg in DOMAIN_CONFIG.items():
        # Check for any missing items in this domain
        d_resps = {q: full.get(q) for q in cfg["items"]}
        n_dom_missing = sum(1 for v in d_resps.values() if v is None)
        if 1 <= n_dom_missing <= 2:
            imputed_domains.append(d_id)

        score = compute_domain_score(d_id, full)
        domain_scores[d_id] = score
        if score is None:
            excluded_domains.append(d_id)

    domain_bands: Dict[int, str] = {
        d: (get_domain_band(s) if s is not None else "Excluded")
        for d, s in domain_scores.items()
    }

    # ── 4. Item-level clinical flags (BEFORE composite) ───────────────────────
    item_flags = detect_item_flags(full)

    # ── 5. Domain-level clinical flags (BEFORE composite) ─────────────────────
    domain_flags = detect_domain_flags(domain_scores)

    # ── 6. Composite HIS ──────────────────────────────────────────────────────
    his, effective_weights = compute_his(domain_scores, stage)

    # ── 7. Score interpretation ───────────────────────────────────────────────
    if his is not None:
        his_band, his_color = get_score_band(his, SCORE_BANDS)
        composite_flag   = his <= COMPOSITE_CRITICAL_THRESHOLD
        assessment_valid = True
    else:
        his_band         = "Incomplete"
        his_color        = "#888888"
        composite_flag   = False
        assessment_valid = False

    # ── 8. MHT flag ───────────────────────────────────────────────────────────
    mht_flag = mht_active

    # ── 9. Return result ──────────────────────────────────────────────────────
    return HISResult(
        stage             = stage,
        mht_active        = mht_active,
        domain_scores     = domain_scores,
        domain_bands      = domain_bands,
        excluded_domains  = excluded_domains,
        imputed_domains   = imputed_domains,
        his               = his,
        his_band          = his_band,
        his_color         = his_color,
        effective_weights = effective_weights,
        item_flags        = item_flags,
        domain_flags      = domain_flags,
        composite_flag    = composite_flag,
        mht_flag          = mht_flag,
        n_answered        = n_answered,
        n_missing         = n_missing,
        assessment_valid  = assessment_valid,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# REPORT FORMATTING UTILITY
# ═══════════════════════════════════════════════════════════════════════════════

def format_score_report(result: HISResult) -> str:
    """
    Generate a plain-text summary report for an assessment result.
    Suitable for logging, QA, and human-readable audit trail.

    Args:
        result:  HISResult from run_assessment()

    Returns:
        Formatted string report
    """
    SEP = "─" * 68
    lines = [
        "╔" + "═" * 66 + "╗",
        "║" + "  EMPRESS HEALTH — HEALTH INTELLIGENCE SCORE REPORT".center(66) + "║",
        "╚" + "═" * 66 + "╝",
        "",
        f"  Stage              : {result.stage_display}",
        f"  MHT Active         : {'Yes — D1 and D8 score overlay required' if result.mht_active else 'No'}",
        f"  Items answered     : {result.n_answered}/120",
        f"  Items missing      : {result.n_missing}",
    ]
    if result.imputed_domains:
        lines.append(f"  Imputed domains    : {result.imputed_domains}")
    if result.excluded_domains:
        lines.append(f"  Excluded domains   : {result.excluded_domains}")
    lines += ["", SEP]

    if result.his is not None:
        lines += [
            f"  HEALTH INTELLIGENCE SCORE  :  {result.his} / 100",
            f"  Interpretation             :  {result.his_band}",
        ]
    else:
        lines.append("  HEALTH INTELLIGENCE SCORE  :  Could not be computed (too many incomplete domains)")

    lines += ["", SEP, "  DOMAIN SCORES", SEP]
    header = f"  {'D':>3}  {'Domain':<42}  {'Score':>7}  {'Band':<10}  {'Weight':>7}"
    lines.append(header)
    lines.append("  " + "─" * 64)

    for d_id in sorted(result.domain_scores):
        name  = DOMAIN_CONFIG[d_id]["name"]
        score = result.domain_scores[d_id]
        band  = result.domain_bands[d_id]
        w     = result.effective_weights.get(d_id, 0.0)
        if score is not None:
            lines.append(f"  D{d_id:02d}  {name:<42}  {score:>5.1f}/100  {band:<10}  {w:>5.1f}%")
        else:
            lines.append(f"  D{d_id:02d}  {name:<42}  {'EXCLUDED':>7}  {'—':<10}  {'—':>7}")

    if result.item_flags or result.domain_flags:
        lines += ["", SEP, "  CLINICAL FLAGS", SEP]

    if result.urgent_flags:
        lines.append("  ⚠  URGENT FLAGS — Immediate action required:")
        for f in result.urgent_flags:
            lines.append(f"     Q{f['question']:03d} ({f['domain_name']}): {f['referral_text']}")

    if result.recommended_flags:
        lines.append("  •  RECOMMENDED FLAGS — Clinical evaluation advised:")
        for f in result.recommended_flags:
            lines.append(f"     Q{f['question']:03d} ({f['domain_name']}): {f['referral_text']}")

    if result.domain_flags:
        lines.append("  •  DOMAIN-LEVEL FLAGS (DS ≤ 20):")
        for f in result.domain_flags:
            lines.append(f"     D{f['domain_id']:02d} {f['domain_name']}: {f['message']}")

    if result.composite_flag:
        lines += [
            "",
            "  *** CRITICAL SCORE — MANDATORY IMMEDIATE CLINICAL EVALUATION ***",
            "  Recommended report language: 'Your Health Intelligence Score indicates",
            "  a high symptom burden across multiple body systems. We strongly recommend",
            "  discussing these results with your doctor or a menopause specialist.'",
        ]

    if result.mht_flag:
        lines += [
            "",
            "  [MHT ACTIVE] Domains 1 and 8 scores reflect a pharmacologically managed",
            "  symptom state, not untreated baseline. Report must include MHT overlay note.",
        ]

    lines += [
        "",
        SEP,
        "  REGULATORY NOTICE: This report is a wellness assessment tool only.",
        "  It does not constitute medical diagnosis or treatment recommendation.",
        "  Framework v1.0 — pending full psychometric validation.",
        SEP,
    ]
    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════════════
# WORKED EXAMPLE
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import random
    random.seed(2024)

    print("Running Empress HIS Engine — Worked Example\n")

    # Simulate a perimenopause client with moderate-to-high symptom load
    # and two specific clinical flag triggers
    example_responses: Dict[int, Optional[int]] = {}
    for q in range(1, 121):
        example_responses[q] = random.randint(3, 7)  # Moderate symptom range

    # Override specific items to trigger clinical flags
    example_responses[2]   = 9   # Hot flash severity → RECOMMENDED flag
    example_responses[41]  = 9   # Depressive episodes → URGENT flag
    example_responses[99]  = 8   # Heart palpitations → URGENT flag
    example_responses[13]  = None  # Simulate one missing item in Sleep domain

    result = run_assessment(
        responses=example_responses,
        staging_response=1,   # Perimenopause
        mht_active=False,
    )

    print(format_score_report(result))

    print("\n── Quick-access properties ──")
    print(f"HIS:              {result.his}")
    print(f"Band:             {result.his_band}")
    print(f"Top concerns:     Domains {result.top_concern_domains}")
    print(f"Urgent flags:     {len(result.urgent_flags)}")
    print(f"Recommended flags:{len(result.recommended_flags)}")
    print(f"Domain flags:     {len(result.domain_flags)}")
    print(f"Imputed domains:  {result.imputed_domains}")
    print(f"Assessment valid: {result.assessment_valid}")
