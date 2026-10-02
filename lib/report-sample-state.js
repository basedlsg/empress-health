'use strict';

/**
 * lib/report-sample-state.js — a realistic perimenopause sample report state
 * (mirrors the ?demo=1 persona in prds/AssessmentFlow.tsx). Used by the PDF
 * health check and the render tests; never shown to members.
 */

// 0 = mild … 10 = severe; category score = (10 − avg) × 10. Question ids run
// 1–120, twelve per category, in this order.
const RAW_BY_CATEGORY = [7, 7, 4, 4, 6, 2, 4, 6, 2, 3];

function buildSampleState() {
  const responses = {};
  RAW_BY_CATEGORY.forEach((base, c) => {
    for (let i = 0; i < 12; i += 1) {
      const id = c * 12 + i + 1;
      const jitter = (id + i) % 3 === 0 ? 1 : (id % 2 === 0 ? -1 : 0);
      responses[id] = Math.max(0, Math.min(10, base + jitter));
    }
  });
  const ref = (n) => `empress-120-symptom-biomarker-framework-chunk-${String(n).padStart(3, '0')}`;
  return {
    user: { firstName: 'Maya', age: 47, usState: 'California', zip: '90024' },
    stage: 'perimenopause',
    mhtActive: false,
    responses,
    completedAt: new Date().toISOString(),
    apiResult: {
      affirmations: [
        { text: 'My body is moving through a powerful transition, and I am listening with compassion.', focus_domain: 'mood-anxiety-emotional-health', evidence_refs: [ref(2)] },
        { text: 'Restorative sleep is an act of physiological preservation — not a luxury I have to earn.', focus_domain: 'sleep-architecture-cortisol', evidence_refs: [ref(3)] },
        { text: 'Every symptom I name today is information, not a verdict.', focus_domain: 'vasomotor-temperature', evidence_refs: [ref(1)] },
      ],
      recommendations: [],
      products: [],
      productsResponse: '',
      clinician: {
        specialty_id: 'nams_certified_mp',
        label: 'Menopause-Certified NAMS Practitioner',
        abbreviation: 'CMP',
        reason: 'Your vasomotor, sleep, and genitourinary scores point to a hormonal driver best evaluated by a NAMS-certified clinician for HRT suitability.',
        find_provider_url: 'https://www.menopause.org/for-women/find-a-menopause-practitioner',
        evidence_refs: [ref(6)],
      },
      poi_flag: false,
      source: 'catalog',
      groundedProducts: [
        { product_name: 'Magnesium Glycinate 400mg', shopify_handle: 'magnesium-glycinate-400mg', reason: 'Supports GABA-A activity for deeper sleep onset and reduced 2–4am waking.', evidence_refs: [ref(14)] },
        { product_name: 'Adaptogen Blend (Ashwagandha KSM-66 + Rhodiola)', shopify_handle: 'adaptogen-blend-ashwagandha-rhodiola', reason: 'Blunts the HPA-axis cortisol surge that amplifies hot flashes and night sweats.', evidence_refs: [ref(2)] },
      ],
      providersState: 'California',
      providers: [
        { name: 'Amy M. Stoddard, MD', qualification: 'Doctor — MD', state: 'California', address: 'Los Angeles, CA', zip: '90024', phone: '(310) 794-7274', website: 'https://www.uclahealth.org/medical-services/obgyn/menopause' },
        { name: 'Mary Jane Minkin, MD', qualification: 'OB/GYN — Menopause Specialist', state: 'California', address: 'San Francisco, CA', zip: '94115', phone: '(415) 600-1234', website: 'https://www.menopause.org' },
      ],
    },
  };
}

module.exports = { buildSampleState };
