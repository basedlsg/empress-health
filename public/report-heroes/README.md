# /public/report-heroes/

Section hero photos for the Health Intelligence Report (paid + free tiers)
and the Free Mini Assessment result screen.

The report code reads images from this folder via
`reportHeroSrc(slug)` → `/report-heroes/<slug>.jpg`
(see `prds/reportDesignSystem.tsx`).

**Each file is optional.** If the file is missing or fails to load, the
section degrades gracefully — the heading and body still render, the
`<img>` tag silently hides itself via `onError`. So you can ship the
report today and add the photos as they're approved.

---

## Filename → section mapping

| Filename                            | Used by                                                     | Subject in the template PDF                                  |
|-------------------------------------|-------------------------------------------------------------|--------------------------------------------------------------|
| `01-menopause-stage.jpg`            | Paid + free report, "01 Menopause Stage & Overview"         | Woman holding a small plant, soft warm light                 |
| `02-domain-scores.jpg`              | Paid report, "02 All 10 Domain Scores — Detailed Breakdown" | Woman holding flash-cards with domain names                  |
| `03-priority-areas.jpg`             | Paid + free report, "03 Your Top Priority Areas"            | Anatomy diagram with floating callouts to body systems       |
| `04-strongest-domains.jpg`          | Paid report, "04 Your Strongest Domains" (optional)         | Woman in confident pose / outdoor environment                |
| `05-affirmations.jpg`               | Paid report, "05 Personalised Affirmations" (optional)      | Hands holding mug / reflective journal                       |
| `06-clinician.jpg`                  | Paid report, "06 Clinician Recommendations" (optional)      | Doctor and patient in conversation                           |
| `07-products.jpg`                   | Paid report, "07 Recommended Products" (optional)           | Empress product flatlay                                      |
| `sleep-hygiene.jpg`                 | Paid report, interlude after Sleep priority                 | Woman sleeping peacefully, bedside lamp warm light           |
| `brain-fog.jpg`                     | Paid report, interlude after Cognitive priority             | Woman thinking at kitchen counter, soft morning light        |
| `anti-inflammation-diet.jpg`        | Paid report, interlude after Metabolic/Lifestyle priority   | Overhead shot of colourful anti-inflammatory foods           |
| `luxury-gift.jpg`                   | Paid report, "$75 luxury gift" card                         | Curated Empress wellness gift box flatlay                    |

---

## Image specs

- **Format:** `.jpg` (Empress photography style; lossless is overkill here)
- **Aspect ratio:** 3:2 horizontal (e.g. 1800×1200) for numbered hero
  pages, 16:9 (e.g. 1600×900) for interlude pages
- **Min dimensions:** 1200px on the long edge so the print PDF is sharp
- **Max file size:** ≤ 350 KB per image — these load on the report
  view and bloat slows print-to-PDF generation
- **Colour:** warm, slightly cream-tinted to live happily on the
  `#F4E5C8` page background. Avoid pure-white or icy-blue heroes.

---

## Adding a new section hero

1. Drop the `.jpg` into this folder using the slug naming convention
   above (kebab-case, no extension prefix).
2. Reference it from a report component with:
   ```tsx
   import { NumberedSectionHero, InterludeHero } from "../reportDesignSystem"

   <NumberedSectionHero
     number="09"
     title="New Section"
     slug="09-new-section"
   />
   ```
3. No code changes required for the fallback — the component handles
   `onError` automatically.

---

## Don't put assets that aren't report heroes here

The marketing site keeps its hero photos in:
- `/public/banners/` — marketplace category banners
- `/public/titlephotos/` — landing-page heroes (`hero_ai*.jpg`)
- `/public/coverphotos/` — content-page covers (`wellnesshubcover_*.jpg`)

This folder is **only** for assets that appear in the report itself.
