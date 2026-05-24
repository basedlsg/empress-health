/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   EMPRESS HEALTH — REPORT NARRATIVE TEMPLATE LIBRARY (TS PORT)           ║
 * ║   10 domains × 3 stages × 3 score bands = 90 modules                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Auto-generated from scripts/.fixtures/empress_report_templates_reference.py
 * by scripts/.fixtures/build_narratives_ts.py. Do NOT edit by hand — re-run the
 * generator if you need to update copy.
 *
 * Usage:
 *   1. Look up module by (domainId, stage)
 *   2. Select narrative by domainBand ("High" | "Moderate" | "Low")
 *   3. Append flagItems text for any item where raw ≥ flag threshold
 *   4. Prepend MHT_OVERLAY[domainId] if mhtActive and domainId ∈ {1, 8}
 */

import type { MenopauseStage, DomainBandLabel } from "./assessmentTypes"

export type NarrativeModule = {
  /** DS 70–100 — positive, maintenance-focused tone. */
  high: string
  /** DS 35–69 — concern, action-oriented tone. */
  moderate: string
  /** DS 0–34 — significant concern, clinical referral tone. */
  low: string
  /** Item-level flag narratives, keyed by question number. */
  flagItems: Record<number, string>
}

/** Stage keys used inside the TEMPLATES map. */
type NarrativeKey = `${number}_${MenopauseStage}`

function key(domainId: number, stage: MenopauseStage): NarrativeKey {
  return `${domainId}_${stage}` as NarrativeKey
}

/**
 * Shared clinical science footnotes. Inject under domain narratives where
 * appropriate (typically once per domain section).
 */
export const SCIENCE_FOOTNOTES: Record<number, string> = {
  1: "Hot flashes are triggered by a narrowed thermoregulatory zone in the hypothalamus driven by estradiol decline. FSH elevation is the primary hormonal marker at this stage. (SWAN cohort, n=3,302)",
  2: "Sleep architecture in the menopause transition shows reduced slow-wave sleep, increased sleep fragmentation, and elevated cortisol variability \u2014 all of which compound every other symptom domain. (Moline et al., Menopause, 2021)",
  3: "Estrogen directly upregulates BDNF and acetylcholine, both critical for memory consolidation and processing speed. Brain fog is a neurological event, not a psychological weakness. (Brinton, Nat Rev Endocrinol, 2021)",
  4: "Rapid estradiol fluctuation during perimenopause dysregulates serotonin, dopamine, and GABA \u2014 the triad that governs mood stability and anxiety threshold. (Gordon et al., Climacteric, 2022)",
  5: "Estrogen regulates insulin sensitivity, GLUT4 expression, and visceral fat distribution. Its decline drives the metabolic phenotype shift: central adiposity, insulin resistance, and reduced resting metabolic rate. (Mauvais-Jarvis, Nat Rev Endocrinol, 2020)",
  6: "Skin collagen declines ~30% in the first 5 years post-menopause. Estrogen receptors in hair follicles, sebaceous glands, and fibroblasts all lose signal. These are diagnostic data, not cosmetic concerns. (Thornton, Am J Clin Dermatol, 2013)",
  7: "Estrogen regulates muscle protein synthesis, collagen crosslinking, and osteoclast/osteoblast balance. Annual bone mineral density loss accelerates to 2\u20134% in the first years post-FMP. (Eastell et al., Nat Rev Dis Primers, 2016)",
  8: "Genitourinary syndrome of menopause (GSM) is progressive and does not self-resolve without treatment. Estrogen receptors throughout the vulvovaginal and lower urinary tract require estrogen for tissue maintenance. (Portman & Gass, Menopause, 2014)",
  9: "Estrogen maintains endothelial nitric oxide production, vascular tone, and mitochondrial biogenesis. Autonomic dysregulation peaks around the final menstrual period. (Mendelsohn & Karas, NEJM, 1999)",
  10: "The gut microbiome estrobolome degrades estrogen conjugates and regulates enterohepatic circulation. Estrogen decline directly reduces microbial diversity, amplifying systemic inflammation and food reactivity. (Baker et al., Maturitas, 2017)",
}

/**
 * MHT overlay copy injected before Domain 1 (Vasomotor) and Domain 8 (GU/Sexual)
 * narratives whenever the user reports active hormone therapy.
 */
export const MHT_OVERLAY: Record<number, string> = {
  1: "IMPORTANT \u2014 MHT ACTIVE: Your scores in this domain reflect your symptom experience while on hormone therapy. MHT is effectively managing your vasomotor symptoms, which means your score in this area represents your treated state, not your underlying untreated biology. If you were to stop MHT, your vasomotor domain score would likely be lower. This is not a limitation of the assessment \u2014 it reflects the clinical benefit of your current treatment.",
  8: "IMPORTANT \u2014 MHT ACTIVE: Your genitourinary and sexual health scores may be influenced by your current hormone therapy. Systemic MHT partially addresses GSM, though local vaginal estrogen is often required in addition to systemic therapy for complete genitourinary protection. Discuss with your provider whether your current regimen fully addresses Domain 8 symptoms.",
}

/**
 * 90 narrative modules indexed by `${domainId}_${stage}`.
 * Look up via getNarrative(domainId, stage, band) below.
 */
export const TEMPLATES: Record<NarrativeKey, NarrativeModule> = {
  [`1_perimenopause`]: {
    high: "Your vasomotor profile is strong for this stage of your transition. Hot flash frequency and severity are minimal, suggesting your hypothalamic thermoregulatory centre is tolerating early estradiol fluctuation well. This is a positive foundation \u2014 the perimenopausal phase carries the most unpredictable vasomotor activity, driven by fluctuating rather than absent estrogen.\n\nKeep monitoring: Vasomotor symptoms can escalate rapidly as estradiol decline accelerates. Track any triggers carefully \u2014 particularly alcohol, caffeine, and stress \u2014 and reassess every 3\u20136 months. The absence of significant vasomotor symptoms now does not guarantee the same trajectory into confirmed menopause.",
    moderate: "Your vasomotor scores indicate a moderate hot flash and thermoregulation burden \u2014 one of the most common experiences in perimenopause, when estradiol levels fluctuate unpredictably before their eventual sustained decline. The hypothalamic thermostat becomes exquisitely sensitive to estrogen signal changes, triggering heat-dissipation responses at lower and lower thresholds.\n\nWhat this likely looks like: 2\u20136 hot flashes per day of moderate intensity, night sweats on several nights per week, and heightened sensitivity to alcohol, caffeine, and stress as triggers. These symptoms are directly amplifying your Sleep (D02) and Mood (D04) scores.\n\nPriority actions:\n  1. Eliminate or significantly reduce alcohol and caffeine intake\n  2. Maintain bedroom temperature at 65\u201368\u00b0F with breathable bedding\n  3. Track hot flash frequency, intensity, and triggers for 4 weeks\n  4. Discuss phytoestrogen supplementation (isoflavones) with your provider\n  5. Begin paced breathing practice \u2014 shown to reduce flash frequency by 44%\n\nClinical note: Discuss your vasomotor symptom profile at your next appointment. MHT eligibility assessment is appropriate if symptoms significantly disrupt sleep or daily function.",
    low: "Your vasomotor domain score is in the low tier, indicating a high burden of hot flashes, night sweats, and thermoregulatory disruption. Severe vasomotor symptoms at the perimenopause stage may suggest accelerated estradiol decline and warrant a clinical evaluation to rule out premature ovarian insufficiency (POI) if you are under 45.\n\nThe clinical reality: Severe vasomotor symptoms generate a cascade effect across your entire symptom profile. Each night sweat that wakes you degrades your sleep architecture, which elevates cortisol, which amplifies anxiety, which lowers your cognitive performance the next day. Addressing the vasomotor domain aggressively is likely to produce secondary improvements across Sleep, Mood, and Cognitive domains.\n\nRecommended action: Discuss this assessment with your doctor or menopause specialist. Hormone therapy (MHT) has the strongest evidence base for severe vasomotor symptoms \u2014 with a 75\u201380% reduction in hot flash frequency as the typical outcome. Non-hormonal alternatives (fezolinetant, SSRIs/SNRIs, gabapentin) are effective for women who cannot or prefer not to use MHT. Treatment should not be delayed when symptom burden is this high.",
    flagItems: {
      2: "CLINICAL FLAG \u2014 Q2 (Hot Flash Severity): Your score indicates disabling hot flash severity. Episodes at this intensity significantly impair daily functioning, sleep, and quality of life. This warrants prompt discussion with your healthcare provider. MHT or non-hormonal pharmacotherapy (fezolinetant, oxybutynin, SSRIs/SNRIs) should be evaluated without delay.",
    },
  },
  [`1_menopause`]: {
    high: "Your vasomotor scores are in the high tier at confirmed menopause \u2014 a genuinely impressive result, given that this is typically the peak hot flash burden phase for most women. You are either managing effectively with treatment, or you fall within the approximately 25% of women who experience minimal vasomotor symptoms at menopause.\n\nIf you are on MHT: your score reflects pharmacologically managed symptoms \u2014 a valid and successful outcome. If unmedicated: your thermoregulatory resilience at this stage is a biological positive. Continue current strategies. Re-assess in 6 months as the genitourinary and metabolic domains begin to require more attention.",
    moderate: "Your vasomotor scores at confirmed menopause reflect the peak burden phase \u2014 estradiol is now chronically absent rather than fluctuating, and the thermoregulatory zone narrows further. A moderate score at this stage is both expected and actionable.\n\nKey insight: Vasomotor symptoms at menopause carry a higher downstream impact than in perimenopause because the sleep disruption they cause is occurring against a background of already-declining sleep architecture. Untreated moderate vasomotor burden compounds across months and years.\n\nPriority actions:\n  1. Formal trigger diary \u2014 2 weeks, track time of day, duration, severity\n  2. Discuss MHT eligibility with your provider if not already considered\n  3. Cooling strategies: cooling mattress pad, fan by bedside, cooling towel\n  4. Avoid alcohol within 3 hours of bedtime \u2014 its vasodilatory effect      peaks overnight\n  5. Consider soy-based phytoestrogen protocol under dietitian supervision",
    low: "Your vasomotor score at confirmed menopause is in the low tier \u2014 indicating a high and disruptive hot flash and night sweat burden at the stage when vasomotor symptoms are clinically at their most intense. This level of vasomotor disruption is significantly impacting your sleep, mood, cognitive function, and overall quality of life.\n\nThis is the scenario that hormone therapy was specifically developed to address. If you have not had a formal MHT eligibility assessment, this is strongly recommended. The benefit-risk profile of MHT for women under 60 at menopause \u2014 without relevant contraindications \u2014 is overwhelmingly favourable for symptom relief.\n\nIf MHT is not an option for you, there are now FDA-approved non-hormonal treatments (fezolinetant \u2014 brand name Veoza) specifically targeting vasomotor symptoms via the NK3 receptor pathway. Please discuss all options with your provider promptly.",
    flagItems: {
      2: "CLINICAL FLAG \u2014 Q2 (Hot Flash Severity): Score indicates disabling vasomotor severity at confirmed menopause. Immediate clinical discussion required. MHT or pharmacotherapy (fezolinetant, SSRIs/SNRIs) evaluation should be prioritised.",
    },
  },
  [`1_post_menopause`]: {
    high: "Your vasomotor domain scores are in the high tier for post-menopause \u2014 indicating that hot flash burden has attenuated as expected. The majority of women see vasomotor frequency decrease in the years following confirmed menopause, though approximately 20% experience symptoms for a decade or more. Your scores suggest you are in the fortunate majority.\n\nAttention: While vasomotor symptoms are now less dominant, the genitourinary and metabolic domains become the primary clinical concern at this stage. Review your Domain 5 (Metabolic) and Domain 8 (GU/Sexual) scores carefully.",
    moderate: "Moderate vasomotor burden at post-menopause is less common than at menopause \u2014 but it is not rare. Approximately 30% of women continue to experience meaningful hot flashes years after their final menstrual period. If you discontinued MHT recently, this may also reflect rebound vasomotor activity during the withdrawal period.\n\nNote: Persistent vasomotor symptoms in post-menopause may also be associated with elevated cardiovascular risk in some studies. This warrants discussion with your provider, particularly given the shift in clinical priority toward cardiometabolic health at this stage.",
    low: "Significant vasomotor burden at post-menopause is clinically notable. Persistent severe hot flashes years after menopause should prompt a re-evaluation of treatment strategy if you are currently unmedicated, or a review of treatment adequacy if you are on MHT. This duration and severity of vasomotor exposure has been associated with increased long-term cardiovascular and bone health risk in population data.\n\nPlease discuss the persistence of these symptoms with your provider. Treatment options remain effective and relevant in post-menopause.",
    flagItems: {
      2: "CLINICAL FLAG \u2014 Q2 (Hot Flash Severity): Disabling vasomotor symptoms persisting into post-menopause. Clinical evaluation and treatment review strongly recommended.",
    },
  },
  [`2_perimenopause`]: {
    high: "Your sleep profile is strong \u2014 a critical advantage at this stage. Sleep is the single greatest amplifier of every other menopause symptom: when sleep is intact, mood stability, cognitive clarity, metabolic regulation, and stress resilience all improve significantly. Your current sleep scores provide a strong buffer against the symptom cascade that typically compounds in the menopause transition.\n\nProtect this actively. Sleep architecture becomes increasingly vulnerable as estradiol continues to decline. Consistent sleep scheduling, dark and cool sleep environment, and alcohol elimination are the three highest leverage protective habits.",
    moderate: "Your sleep scores reflect the disrupted sleep architecture that is near-universal in perimenopause \u2014 driven by the dual mechanism of night sweats (Domain 1 crosstalk) and HPA axis dysregulation. The 2\u20134am waking pattern, specifically, is a cortisol signature: the adrenal gland fires prematurely, producing a cortisol surge that interrupts the second half of the sleep cycle before deep sleep is fully restorative.\n\nWhat poor sleep does to your other scores: One night of fragmented sleep reduces prefrontal cortex function by approximately 20% (direct cognitive impact), activates the amygdala (mood impact), elevates cortisol and ghrelin (metabolic impact), and reduces pain threshold (musculoskeletal impact). Sleep disruption is not just one symptom \u2014 it is a force multiplier across all domains.\n\nPriority actions:\n  1. Sleep window consistency \u2014 same bedtime and wake time, 7 days\n  2. Blackout the 2\u20134am cortisol trigger: limit fluids after 7pm,      use amber glasses after 8pm to suppress cortisol-stimulating blue light\n  3. Magnesium glycinate 300\u2013400mg at bedtime (supports GABA activity)\n  4. Assess Domain 1 scores \u2014 night sweat management directly improves sleep\n  5. 4-7-8 breathing: 4s inhale, 7s hold, 8s exhale \u2014 activates      parasympathetic branch, lowers cortisol within 3 minutes",
    low: "Your sleep domain score is in the severe range \u2014 this is the single highest-impact finding in your assessment. Sleep disruption at this severity is not just a symptom of your menopause transition; it is actively worsening every other domain in your profile. Restoration of sleep architecture is the highest clinical priority in your plan.\n\nThe cortisol-sleep feedback loop: Disrupted sleep elevates cortisol, which dysregulates blood sugar, which disrupts sleep further. Each cycle makes the next night harder. This loop requires deliberate interruption \u2014 lifestyle measures alone are often insufficient at this severity.\n\nRecommended clinical evaluation: CBT-I (Cognitive Behavioural Therapy for Insomnia) has the strongest evidence base for menopause-related sleep disruption \u2014 superior to sleep medication for long-term outcomes. MHT also significantly improves sleep architecture in symptomatic women. A combined approach addressing both sleep hygiene and hormonal drivers typically produces the best outcomes.",
    flagItems: {},
  },
  [`2_menopause`]: {
    high: "Excellent sleep profile at confirmed menopause \u2014 when sleep disruption is typically at its most severe. Night sweats peak, cortisol variability is highest, and estrogen's direct sleep-architecture role is fully absent. Your high score here suggests either effective symptom management, naturally low vasomotor burden, or strong sleep hygiene practices.\n\nThis domain score is your most powerful protective factor. Maintain all current sleep practices with deliberate consistency.",
    moderate: "Moderate sleep disruption at confirmed menopause is the clinical norm rather than the exception \u2014 validated PSQI data across menopause cohorts show mean sleep quality scores dropping by 28% in the year surrounding the final menstrual period. Your scores suggest disruption significant enough to affect daytime function, cognitive performance, and emotional regulation, but with meaningful room for improvement through targeted intervention.\n\nThe vasomotor-sleep link: If your Domain 1 score is also moderate or low, addressing hot flashes and night sweats will produce the fastest sleep improvement. Night sweat resolution typically adds 45\u201375 minutes of consolidated sleep per night in clinical studies.\n\nPriority actions: Sleep restriction therapy (controlled bed time), CBT-I workbook or digital program, magnesium glycinate at bedtime, temperature regulation, and vasomotor treatment review.",
    low: "Severe sleep disruption at menopause \u2014 the most vulnerable stage for sleep architecture \u2014 creates a clinical urgency around sleep restoration. At this severity, you are likely functioning on chronically inadequate restorative sleep, which has measurable effects on immune function, cardiovascular regulation, insulin sensitivity, and mental health.\n\nPlease raise sleep disruption as a primary concern at your next clinical appointment. Do not accept 'this is just menopause' as a response. Effective, evidence-based treatments exist \u2014 CBT-I, MHT, and in some cases short-term pharmacological bridge support \u2014 that can meaningfully restore sleep within 6\u201312 weeks.",
    flagItems: {},
  },
  [`2_post_menopause`]: {
    high: "Your sleep profile is strong at post-menopause \u2014 indicating that your sleep architecture has largely adapted or that effective management is in place. Sleep quality often partially recovers in the years following confirmed menopause once vasomotor burden attenuates.",
    moderate: "Moderate ongoing sleep disruption in post-menopause may reflect persistent HPA axis dysregulation, comorbid sleep disorders (sleep apnoea prevalence doubles in post-menopausal women), or cumulative lifestyle factors. A formal sleep evaluation \u2014 including apnoea screening \u2014 is appropriate if sleep disruption has been present for more than 12 months.",
    low: "Severe sleep disruption persisting into post-menopause warrants a comprehensive sleep evaluation. Consider referral for polysomnography to rule out obstructive sleep apnoea (prevalence rises significantly post-menopause due to loss of progesterone's respiratory protection), in addition to CBT-I for the insomnia component. Long-duration poor sleep at this stage is associated with increased dementia, cardiovascular, and metabolic risk.",
    flagItems: {},
  },
  [`3_perimenopause`]: {
    high: "Your cognitive function scores are strong \u2014 your thinking, memory, and mental processing speed are largely intact at this stage. This is reassuring, given that estrogen's direct neuroprotective role (upregulating BDNF and acetylcholine) means the perimenopausal brain is entering a phase of neurochemical change.\n\nProtective investment: Consider this the optimal window to build cognitive reserve \u2014 aerobic exercise (hippocampal neurogenesis), quality sleep (amyloid clearance), omega-3s (neuronal membrane integrity), and cognitively challenging activities all increase resilience for the transition ahead.",
    moderate: "Your cognitive scores reflect the brain fog experience that affects an estimated 60\u201370% of women in perimenopause \u2014 characterised by word-finding difficulty, reduced processing speed, and multi-tasking capacity decline. This is a neurological event driven by estradiol fluctuation's impact on BDNF, acetylcholine, and serotonin \u2014 not a personality flaw or sign of early dementia.\n\nWhat's actually happening: Estrogen is a neuroprotective hormone. When levels fluctuate rather than remain stable, the brain's efficiency in synaptic transmission, memory consolidation, and executive function shows measurable transient decline. The research consistently shows this improves for most women after menopause, when hormone levels stabilise at a new (lower) baseline.\n\nPriority actions: Prioritise sleep above all else for cognitive recovery. Add 150+ minutes of aerobic exercise weekly (shown to directly increase BDNF). Reduce cognitive load strategically \u2014 externalise with notes and reminders. Consider discussing B12, folate, and omega-3 status with your provider.",
    low: "Your cognitive domain score indicates significant brain fog \u2014 word-finding difficulty, memory lapses, processing speed decline, and concentration deficits that are meaningfully impacting your professional and personal functioning. This is one of the most distressing aspects of the menopause transition and one of the most under-discussed with healthcare providers.\n\nPlease know: this is not dementia, and for the majority of women, cognitive function stabilises and partially recovers after confirmed menopause. But severe cognitive symptoms now indicate you need active support \u2014 not reassurance that it will pass.\n\nRecommended clinical conversation: Raise these symptoms directly with your doctor. MHT has the most robust evidence for cognitive symptom management during the perimenopause window. Vitamin D, omega-3, and magnesium status should be checked. Rule out hypothyroidism (frequently co-presents with cognitive symptoms at this stage).",
    flagItems: {},
  },
  [`3_menopause`]: {
    high: "Strong cognitive scores at confirmed menopause are a meaningful positive indicator. While some women experience peak cognitive disruption around the final menstrual period, your scores suggest your brain is adapting well to the new hormonal baseline. Protective lifestyle factors and effective symptom management both contribute to this outcome.",
    moderate: "Moderate cognitive symptoms at confirmed menopause \u2014 word-finding difficulty, slower processing, and reduced multi-tasking \u2014 reflect the acute brain transition from fluctuating to absent estrogen. Many women find cognition stabilises 12\u201324 months post-menopause as the brain adapts to its new hormonal environment.\n\nKey intervention: Consistent aerobic exercise (30+ minutes, 5x/week) has the strongest non-hormonal evidence for cognitive symptom improvement in this window \u2014 shown to increase hippocampal volume by 2% in post-menopausal women over 12 months (Erickson et al., PNAS).",
    low: "Significant cognitive burden at menopause warrants a comprehensive discussion with your healthcare provider. The cognitive window \u2014 initiating effective intervention during or immediately after the menopausal transition \u2014 is now well-established in the neuroprotection literature. Delays in addressing severe cognitive symptoms may limit recovery potential. MHT during this window has the strongest evidence for cognitive protection. Please seek specialist evaluation.",
    flagItems: {},
  },
  [`3_post_menopause`]: {
    high: "Strong cognitive function in post-menopause is the most encouraging of all the domain outcomes at this stage. Your brain has adapted well to the post-estrogen environment. The risk window for cognitive decline remains present \u2014 lifestyle factors (exercise, sleep, social engagement, dietary quality) are now your primary modifiable levers.",
    moderate: "Moderate cognitive symptoms in post-menopause may reflect either the normal adaptive curve (not yet fully stabilised) or emerging long-term brain health considerations. At this stage, persistent cognitive symptoms warrant a discussion with your provider about comprehensive cognitive health evaluation, including cardiovascular risk assessment (the shared vascular risk pathway for dementia), vitamin D and B12 status, and sleep quality optimisation.",
    low: "Significant cognitive burden persisting in post-menopause is clinically important. At this stage, severe cognitive symptoms should be formally evaluated by your doctor \u2014 including ruling out treatable causes such as hypothyroidism, B12 deficiency, depression, sleep apnoea, and medication side effects. A formal cognitive screening (MoCA or similar) is appropriate. This does not mean dementia \u2014 many causes are fully reversible. But evaluation is not optional at this severity and duration.",
    flagItems: {},
  },
  [`4_perimenopause`]: {
    high: "Your mood and emotional health scores are strong \u2014 your emotional regulation, anxiety threshold, and sense of identity appear largely intact at this stage. Given that perimenopause drives some of the most significant neurochemical volatility of any life stage (comparable to puberty in amplitude of hormonal change), this is a genuinely positive finding.\n\nMaintain your current emotional anchors \u2014 exercise, social connection, sleep, and stress management practices are all demonstrably mood-protective during hormonal transitions. Re-assess at 3\u20136 month intervals.",
    moderate: "Your mood and anxiety scores reflect the emotional disruption that affects 40\u201360% of perimenopausal women \u2014 characterised by heightened anxiety, irritability, emotional volatility, and low mood episodes. These are not character failings. They are neurochemical events: rapid estradiol fluctuation dysregulates serotonin, dopamine, and GABA \u2014 the brain's primary mood-stabilising neurotransmitters \u2014 in ways that are measurably distinct from primary mood disorders.\n\nThe rage-irritability axis: The sudden rage or disproportionate irritability many perimenopausal women experience reflects the amygdala operating with reduced prefrontal cortex regulation \u2014 the same pathway disrupted by sleep deprivation. Domain 2 (Sleep) and Domain 4 (Mood) scores are mechanistically linked.\n\nPriority actions: Aerobic exercise 5x/week (most evidence for mood benefit). Sleep restoration. Reduce or eliminate alcohol (a depressant that worsens GABA and serotonin function). Consider discussion with your GP about whether an SSRI/SNRI \u2014 which also helps vasomotor symptoms \u2014 might be appropriate.",
    low: "Your mood and emotional health scores indicate a significant burden \u2014 anxiety, low mood, emotional volatility, and/or loss of self that is meaningfully impairing your quality of life. These experiences are real, they are physiological, and they are treatable.\n\nThe perimenopause transition is associated with a 2\u20134\u00d7 increased risk of a first depressive episode \u2014 even in women with no prior history. This is a biological vulnerability window, not a personal weakness. The SWAN cohort of 3,302 women showed that perimenopausal depression responds exceptionally well to estrogen-based therapy in this window.\n\nRecommended action: Please speak with your doctor about these symptoms this week. Describe the mood changes specifically. Both hormonal (MHT) and non-hormonal (SSRIs, CBT) options are highly effective for this stage. You should not be managing this alone.",
    flagItems: {
      41: "CLINICAL FLAG \u2014 Q41 (Depressive Episodes): Your score indicates severe depression symptoms that require immediate professional evaluation. Please contact your doctor as soon as possible. This is not a sign of weakness \u2014 it is a medical situation requiring medical attention. If you are in crisis, please contact the Crisis Text Line (text HOME to 741741) or the 988 Suicide & Crisis Lifeline.",
      43: "CLINICAL FLAG \u2014 Q43 (Panic Attacks): Your score indicates frequent panic attacks that require psychiatric or psychological evaluation. Panic attacks during perimenopause can be driven by both neurochemical and cardiovascular mechanisms and require formal clinical assessment.",
      48: "CLINICAL FLAG \u2014 Q48 (Identity Disconnection): You have scored in the range that suggests a profound loss of sense of self. This is one of the most distressing experiences of the menopause transition and one of the least discussed. Mental health professional support \u2014 specifically a therapist experienced in midlife and menopause transitions \u2014 can provide significant relief. You are not losing your mind. You are navigating a genuine identity transition that deserves skilled support.",
    },
  },
  [`4_menopause`]: {
    high: "Strong emotional health at confirmed menopause reflects either natural resilience, effective support systems, or \u2014 for some women \u2014 the phenomenon of mood improvement once cycles cease and estradiol stops fluctuating and stabilises at a new consistent baseline.",
    moderate: "Moderate mood and anxiety burden at menopause is clinically common. For many women, the months surrounding the final menstrual period carry the highest emotional burden of the entire transition. The good news: population data consistently shows mood improves significantly in the 12\u201324 months following menopause for most women, as the brain adapts to stable (rather than fluctuating) hormone levels.\n\nSupport strategies: Exercise, sleep, structured stress management, social connection, and honest conversations with your provider about whether additional support is warranted.",
    low: "Significant mood and emotional health burden at confirmed menopause requires professional support \u2014 not self-management alone. Please prioritise a conversation with your doctor about these symptoms this month. The menopause transition is one of the highest-risk windows for first-onset and recurrent depression in women's lives, and effective treatments exist.",
    flagItems: {
      41: "CLINICAL FLAG \u2014 Q41 (Depressive Episodes): Severe depression at confirmed menopause. Please contact your doctor immediately. This is a medical situation, not a reflection of your character or capacity. Effective treatment exists.",
      43: "CLINICAL FLAG \u2014 Q43 (Panic Attacks): Frequent panic episodes at menopause require professional evaluation. Please seek assessment.",
      48: "CLINICAL FLAG \u2014 Q48 (Identity Disconnection): Profound loss of self at this stage of the transition warrants psychological support. Please discuss with your provider.",
    },
  },
  [`4_post_menopause`]: {
    high: "Strong emotional health in post-menopause \u2014 many women report their most stable emotional baseline at this stage, as hormones settle at a new consistent level and the acute turbulence of the transition resolves. Your scores reflect this positive trajectory.",
    moderate: "Moderate mood symptoms in post-menopause may reflect lingering transition effects, ongoing life stressors, or the beginning of atypical depressive presentations that are more common in this stage. These include low energy, social withdrawal, and reduced motivation as primary features. If present for more than 6 months, formal evaluation is appropriate.",
    low: "Significant emotional health burden persisting in post-menopause requires clinical evaluation. Persistent depression and anxiety at this stage are associated with elevated cardiovascular and cognitive risk. Please discuss with your provider and explore evidence-based treatments including SSRIs, CBT, and social/lifestyle interventions.",
    flagItems: {
      41: "CLINICAL FLAG \u2014 Q41: Severe depression in post-menopause. Immediate clinical evaluation required.",
      43: "CLINICAL FLAG \u2014 Q43: Frequent panic attacks in post-menopause. Professional evaluation required.",
      48: "CLINICAL FLAG \u2014 Q48: Profound identity disconnection. Mental health support strongly recommended.",
    },
  },
  [`5_perimenopause`]: {
    high: "Your metabolic health profile is strong at this early transition stage. Insulin sensitivity, weight stability, and energy regulation are intact. This advantage will require active protection: estrogen's decline directly reduces insulin sensitivity and shifts fat deposition centrally. Strength training 2\u20133x/week is the highest-leverage protective habit for maintaining metabolic health through the transition.",
    moderate: "Your metabolic scores reflect the early hormonal drivers of the menopause metabolic shift \u2014 weight gain around the middle, energy crashes after eating, sugar cravings, and exercise results that no longer match your effort. Estrogen regulates insulin sensitivity, GLUT4 expression, and fat distribution. As it declines, the metabolic operating system genuinely changes \u2014 not your willpower.\n\nPriority actions: Prioritise protein (1.6g/kg body weight), reduce refined carbohydrates, add resistance training, and time carbohydrate intake to morning hours when insulin sensitivity is highest.",
    low: "Significant metabolic burden \u2014 unexplained weight gain, insulin sensitivity changes, exercise intolerance, and bloating \u2014 warrants clinical investigation. Request fasting glucose, HbA1c, fasting lipids, and thyroid function from your provider. Consider referral to a dietitian experienced in menopause nutrition.",
    flagItems: {
      57: "CLINICAL FLAG \u2014 Q57 (Waist Circumference): Score indicates >4 inch increase \u2014 a validated proxy for significant visceral adiposity accumulation. Metabolic syndrome screening (fasting glucose, HbA1c, triglycerides, HDL, blood pressure) is recommended.",
    },
  },
  [`5_menopause`]: {
    high: "Strong metabolic scores at confirmed menopause indicate effective management of the acute metabolic shift driven by estrogen absence. Maintain resistance training as the primary metabolic protective habit.",
    moderate: "Moderate metabolic burden at menopause reflects the acute insulin sensitivity decline and fat redistribution that occurs in the 12\u201324 months post-FMP. Targeted nutrition and resistance training intervention typically produce meaningful improvements within 3\u20134 months.",
    low: "Significant metabolic burden at menopause warrants clinical evaluation including fasting metabolic panel and thyroid function. Consider dietitian referral and structured resistance training program. If waist circumference has increased >4 inches, metabolic syndrome screening is indicated.",
    flagItems: {
      57: "CLINICAL FLAG \u2014 Q57: Waist circumference increase >4 inches at menopause. Metabolic syndrome screening required.",
    },
  },
  [`5_post_menopause`]: {
    high: "Excellent metabolic health in post-menopause \u2014 the highest cardiometabolic risk stage. Your profile is protective. Maintain resistance training and whole-food dietary quality as primary ongoing strategies.",
    moderate: "Moderate metabolic burden in post-menopause indicates the primary clinical risk zone for this stage. Cardiometabolic health now receives the highest domain weight (14%). Fasting metabolic panel, blood pressure monitoring, and dietary audit are all appropriate.",
    low: "Significant metabolic burden in post-menopause is the highest-priority clinical concern at this stage. Metabolic syndrome, pre-diabetes, and cardiovascular risk are all elevated. Urgent referral for fasting metabolic workup and specialist review is recommended.",
    flagItems: {
      57: "CLINICAL FLAG \u2014 Q57: Waist circumference increase in post-menopause \u2014 metabolic syndrome screening and cardiovascular risk assessment required urgently.",
    },
  },
  [`6_perimenopause`]: {
    high: "Skin, hair, and nail integrity are well-maintained \u2014 reflecting adequate collagen support, thyroid function, and micronutrient status at this stage.",
    moderate: "Moderate changes in skin, hair, and nails reflect early collagen decline driven by estradiol's effect on fibroblasts and hair follicle receptors. Prioritise collagen-supporting nutrition (vitamin C, zinc, silica), topical retinoids under dermatologist guidance, and sun protection.",
    low: "Significant skin, hair, and nail changes warrant investigation. Request thyroid function (TSH, free T4) to exclude hypothyroidism, ferritin levels (iron deficiency is a major hair loss driver), and vitamin D. Referral to a dermatologist experienced in hormonal hair and skin changes is appropriate.",
    flagItems: {
      63: "CLINICAL FLAG \u2014 Q63 (Eyebrow Thinning): Lateral eyebrow thinning is a classical sign of hypothyroidism. Thyroid function panel (TSH, free T4, and optionally anti-TPO antibodies) should be requested from your doctor.",
    },
  },
  [`6_menopause`]: {
    high: "Strong skin, hair and nail scores at confirmed menopause, when collagen decline typically accelerates most rapidly. Current protective strategies are working.",
    moderate: "Moderate changes in skin and hair at menopause reflect the 30% collagen loss that occurs in the first 5 post-menopause years. Topical retinoids, collagen-rich nutrition, vitamin C, and sun protection are the primary evidence-based interventions.",
    low: "Significant skin, hair, and nail changes at menopause warrant dermatological evaluation and full thyroid and micronutrient panel.",
    flagItems: {
      63: "CLINICAL FLAG \u2014 Q63: Thyroid function testing recommended \u2014 lateral eyebrow thinning at menopause may indicate hypothyroidism.",
    },
  },
  [`6_post_menopause`]: {
    high: "Well-maintained skin, hair, and nail integrity in post-menopause reflects either effective supplementation, MHT benefit on collagen, or natural resilience.",
    moderate: "Ongoing collagen attrition and tissue fragility in post-menopause are expected but manageable. Evidence-based interventions: topical estrogen (for skin), collagen peptide supplementation, and dermatological review.",
    low: "Significant tissue fragility in post-menopause warrants dermatological evaluation and full endocrine and micronutrient workup.",
    flagItems: {
      63: "CLINICAL FLAG \u2014 Q63: Thyroid function testing recommended.",
    },
  },
  [`7_perimenopause`]: {
    high: "Musculoskeletal and bone health are well-maintained. Prioritise strength training and adequate calcium and vitamin D intake now \u2014 the bone density you build in the next 2\u20133 years is the reserve you will draw on for the rest of your life.",
    moderate: "Joint stiffness, muscle aches, and reduced strength are among the earliest musculoskeletal signals of estrogen decline. Estrogen directly lubricates joint tissue and regulates muscle protein synthesis. Resistance training and anti-inflammatory nutrition are the primary protective interventions.",
    low: "Significant musculoskeletal burden at perimenopause warrants clinical evaluation. Request inflammatory markers (CRP, ESR) to exclude inflammatory arthritis, and vitamin D and calcium status. Consider physiotherapy referral for joint management.",
    flagItems: {
      82: "CLINICAL FLAG \u2014 Q82: Perceived physical frailty \u2014 functional mobility assessment recommended.",
      83: "CLINICAL FLAG \u2014 Q83: Height/posture change \u2014 DEXA bone density scan recommended.",
      84: "CLINICAL FLAG \u2014 Q84: High fracture concern \u2014 FRAX calculation and DEXA referral indicated.",
    },
  },
  [`7_menopause`]: {
    high: "Strong musculoskeletal scores at menopause. Bone loss rate accelerates to 2\u20134% annually in the first 2\u20135 years post-FMP \u2014 maintain resistance training and ensure vitamin D >50nmol/L.",
    moderate: "Moderate joint, muscle, and bone health concerns at menopause require active management. DEXA baseline scan is appropriate at this stage. Resistance training, vitamin D, and calcium are priority interventions.",
    low: "Significant musculoskeletal burden at menopause during the rapid bone loss window. DEXA scan, FRAX calculation, and specialist review strongly recommended.",
    flagItems: {
      82: "CLINICAL FLAG \u2014 Q82: Functional mobility assessment and DEXA referral.",
      83: "CLINICAL FLAG \u2014 Q83: DEXA bone density scan and vertebral fracture assessment.",
      84: "CLINICAL FLAG \u2014 Q84: FRAX and DEXA indicated \u2014 discuss bisphosphonate eligibility with your provider.",
    },
  },
  [`7_post_menopause`]: {
    high: "Excellent bone and musculoskeletal health in post-menopause \u2014 particularly notable given this is the highest-weight domain at this stage (14%). Your protective habits are working.",
    moderate: "Moderate musculoskeletal burden in post-menopause warrants DEXA baseline scan if not yet performed, FRAX fracture risk calculation, and review of calcium and vitamin D intake. Resistance and impact exercise (walking, dancing) are both protective for bone.",
    low: "Significant bone and musculoskeletal burden in post-menopause is a high clinical priority. DEXA, FRAX, and specialist evaluation are urgent. Bisphosphonate or other bone-protective therapy should be discussed if T-score is below \u22122.5.",
    flagItems: {
      82: "CLINICAL FLAG \u2014 Q82: Frailty assessment and DEXA \u2014 post-menopause frailty carries the highest morbidity risk.",
      83: "CLINICAL FLAG \u2014 Q83: Height loss in post-menopause \u2014 DEXA and vertebral fracture assessment urgent.",
      84: "CLINICAL FLAG \u2014 Q84: FRAX calculation and DEXA urgent \u2014 bisphosphonate eligibility discussion required.",
    },
  },
  [`8_perimenopause`]: {
    high: "Genitourinary and sexual health are well-maintained. Early intervention if any of these symptoms emerge is strongly advisable \u2014 GSM is progressive and much easier to treat early.",
    moderate: "Early GSM development and sexual health changes are emerging. Vaginal moisturisers (non-hormonal) and lubricants are appropriate first steps. Local vaginal estrogen is the most effective treatment for GSM \u2014 highly targeted and minimally absorbed.",
    low: "Significant genitourinary and sexual health burden warrants clinical evaluation. Local vaginal estrogen or ospemifene are highly effective treatments with excellent safety profiles. Please discuss with your provider \u2014 these symptoms are among the most under-treated in menopause care.",
    flagItems: {
      86: "CLINICAL FLAG \u2014 Q86 (Pain with Intercourse): Intercourse is not possible due to pain. This is GSM \u2014 genitourinary syndrome of menopause \u2014 and it requires treatment, not tolerance. Local vaginal estrogen or ospemifene are highly effective. Please seek evaluation.",
      93: "CLINICAL FLAG \u2014 Q93 (Stress Incontinence): Pelvic floor physiotherapy referral strongly recommended.",
    },
  },
  [`8_menopause`]: {
    high: "Strong genitourinary and sexual health scores at menopause when GSM is beginning to develop. Proactive use of vaginal moisturisers and lubricants can maintain tissue health.",
    moderate: "GSM is developing at menopause \u2014 vaginal dryness, urinary urgency, and sexual changes are all estrogen-receptor driven. Local vaginal estrogen is safe, highly effective, and does not carry the systemic risks of oral MHT. Please discuss with your provider.",
    low: "Significant GSM and sexual health burden at menopause requires clinical treatment. GSM does not resolve without intervention. Local vaginal estrogen or ospemifene are the primary evidence-based treatments.",
    flagItems: {
      86: "CLINICAL FLAG \u2014 Q86: Sexual intercourse not possible due to pain. GSM treatment required urgently.",
      93: "CLINICAL FLAG \u2014 Q93: Severe stress incontinence \u2014 pelvic floor physiotherapy and urogynecology referral.",
    },
  },
  [`8_post_menopause`]: {
    high: "Maintained genitourinary and sexual health in post-menopause \u2014 often the result of ongoing local vaginal estrogen use or very early GSM intervention. Continue all current strategies.",
    moderate: "Moderate GSM in post-menopause is progressive without treatment. If not already using local vaginal estrogen, this is the stage at which it becomes most impactful. Discuss with your provider.",
    low: "Significant GSM and urinary health burden in post-menopause \u2014 this domain receives the second-highest weight at this stage (12%). GSM is now well-established and requires sustained treatment. Vaginal estrogen, ospemifene, or laser therapy options should be discussed urgently.",
    flagItems: {
      86: "CLINICAL FLAG \u2014 Q86: Severe dyspareunia in post-menopause. Immediate GSM treatment evaluation required.",
      93: "CLINICAL FLAG \u2014 Q93: Severe incontinence \u2014 urogynecology and pelvic floor physiotherapy referral.",
    },
  },
  [`9_perimenopause`]: {
    high: "Cardiovascular and energy profile is strong. Estrogen's vascular protective role \u2014 maintaining endothelial nitric oxide production and vascular tone \u2014 is still partially intact at this stage.",
    moderate: "Moderate energy and cardiovascular symptoms reflect early autonomic dysregulation and mitochondrial function changes. Consistent aerobic exercise is the most powerful cardiovascular protective intervention at this stage.",
    low: "Significant cardiovascular and energy burden warrants clinical evaluation including resting ECG, blood pressure monitoring, full blood count (to exclude anaemia as energy driver), and thyroid function.",
    flagItems: {
      99: "CLINICAL FLAG \u2014 Q99: Daily palpitations \u2014 12-lead ECG and 24-hour Holter monitoring required. Cardiology referral indicated.",
      104: "CLINICAL FLAG \u2014 Q104: Unexplained breathlessness \u2014 cardiac and pulmonary workup required urgently.",
      105: "CLINICAL FLAG \u2014 Q105: Abnormal cardiac response to exercise \u2014 exercise stress test and cardiology evaluation.",
      107: "CLINICAL FLAG \u2014 Q107: Autonomic BP swings \u2014 24-hour ambulatory BP monitoring and cardiology review.",
    },
  },
  [`9_menopause`]: {
    high: "Strong cardiovascular and energy profile at menopause \u2014 the stage of highest autonomic dysregulation. Maintain aerobic exercise as primary cardiovascular protection.",
    moderate: "Moderate cardiovascular symptoms at menopause reflect the autonomic and vascular changes driven by estrogen absence. Blood pressure monitoring, aerobic exercise, and dietary sodium reduction are priority interventions.",
    low: "Significant cardiovascular burden at menopause \u2014 the stage when CV risk begins to rise. Clinical evaluation including ECG, blood pressure, and lipid panel is recommended urgently.",
    flagItems: {
      99: "CLINICAL FLAG \u2014 Q99: Daily palpitations at menopause \u2014 cardiology referral urgent.",
      104: "CLINICAL FLAG \u2014 Q104: Unexplained dyspnea \u2014 cardiac and pulmonary workup required.",
      105: "CLINICAL FLAG \u2014 Q105: Abnormal exercise heart rate \u2014 cardiology evaluation required.",
      107: "CLINICAL FLAG \u2014 Q107: BP swings \u2014 ambulatory BP monitoring required.",
    },
  },
  [`9_post_menopause`]: {
    high: "Excellent cardiovascular and energy profile in post-menopause \u2014 the highest CV risk stage. Your scores reflect effective lifestyle and/or clinical management. Maintain this trajectory with consistent aerobic exercise and annual cardiovascular screening.",
    moderate: "Moderate cardiovascular burden in post-menopause warrants annual cardiovascular risk assessment (lipids, blood pressure, HbA1c, smoking status, BMI). This is the highest-risk window for first coronary events in women.",
    low: "Significant cardiovascular and energy burden in post-menopause is a clinical priority. Comprehensive cardiovascular risk assessment, specialist review, and lifestyle intervention programme are all urgently indicated.",
    flagItems: {
      99: "CLINICAL FLAG \u2014 Q99: Daily palpitations \u2014 urgent cardiology referral in post-menopause.",
      104: "CLINICAL FLAG \u2014 Q104: Unexplained breathlessness in post-menopause \u2014 urgent cardiac and pulmonary workup.",
      105: "CLINICAL FLAG \u2014 Q105: Abnormal cardiac response to exercise \u2014 urgent cardiology evaluation.",
      107: "CLINICAL FLAG \u2014 Q107: BP swings in post-menopause \u2014 urgent ambulatory BP monitoring and cardiology review.",
    },
  },
  [`10_perimenopause`]: {
    high: "Your lifestyle, gut health, and nutritional resilience are strong. The gut-estrogen axis is beginning to shift \u2014 maintaining dietary diversity and probiotic-rich foods supports the estrobolome microbiome that regulates estrogen enterohepatic circulation.",
    moderate: "Gut reactivity, alcohol intolerance, and reduced stress resilience are early signals of the menopause gut-estrogen axis shift. Reducing ultra-processed food, increasing dietary fibre (30g/day target), and eliminating or reducing alcohol are the highest-impact lifestyle levers.",
    low: "Significant gut health, food sensitivity, and resilience burden warrants a full dietary audit with a registered dietitian, and discussion with your GP about gut microbiome evaluation and inflammation markers (CRP, calprotectin).",
    flagItems: {},
  },
  [`10_menopause`]: {
    high: "Strong lifestyle and gut health profile. Note that at menopause, this domain receives a reduced weight (2%) \u2014 reflecting that direct clinical drivers (hormonal and physiological) take clinical priority, not that lifestyle doesn't matter.",
    moderate: "Lifestyle and gut health challenges at menopause \u2014 alcohol intolerance, food reactivity, and reduced resilience \u2014 are direct consequences of estrogen's role in gut motility and microbiome diversity. Dietary quality improvements compound positively across all other domains.",
    low: "Significant lifestyle and gut health burden. Prioritise dietary quality: Mediterranean or DASH pattern, adequate protein and fibre, alcohol elimination. Consider registered dietitian referral.",
    flagItems: {},
  },
  [`10_post_menopause`]: {
    high: "Strong lifestyle foundation in post-menopause \u2014 a critical protective factor. The low domain weight (2%) at this stage reflects that direct clinical interventions carry higher priority, but lifestyle factors remain the most modifiable long-term health lever.",
    moderate: "Moderate lifestyle and gut health burden. Focus on the highest-impact behaviours: dietary quality, alcohol reduction, hydration, and stress management \u2014 all of which feed into the cardiometabolic and bone domains that carry the highest weight at this stage.",
    low: "Poor lifestyle foundation in post-menopause amplifies the cardiometabolic and bone risks that are already elevated. Registered dietitian referral and comprehensive lifestyle coaching programme recommended.",
    flagItems: {},
  },
}

/**
 * Look up the narrative text for a given domain, stage, and band.
 * Returns null if the (domainId, stage) combination is not defined or the
 * band is "Excluded" (no narrative is rendered for excluded domains).
 */
export function getNarrative(
  domainId: number,
  stage: MenopauseStage,
  band: DomainBandLabel,
): string | null {
  const module = TEMPLATES[key(domainId, stage)]
  if (!module) return null
  if (band === "High") return module.high
  if (band === "Moderate") return module.moderate
  if (band === "Low") return module.low
  return null
}

/** Return all flag-item narratives for a given (domainId, stage). */
export function getFlagItemNarratives(
  domainId: number,
  stage: MenopauseStage,
): Record<number, string> {
  const module = TEMPLATES[key(domainId, stage)]
  return module ? module.flagItems : {}
}
