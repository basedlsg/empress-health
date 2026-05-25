# Home Cutover Notes — Empress Health
# Audit of `pages/index.html` as the canonical `/` replacement
# Date: MMXXVI · Empathetic Elegance v1.0

---

## What `pages/index.html` currently is

This file is NOT a single-page home component in the same pattern as `our-program.html`.
It is a **design canvas** — a multi-artboard viewer that renders two home variations
(V1 Sanctuary and V3 Liquid Vesper) side-by-side with a live tweaks panel.

It loads five JSX files in order:
  1. `shared.jsx`
  2. `v1-sanctuary.jsx`
  3. `v3-liquid.jsx`
  4. `design-canvas.jsx`
  5. `tweaks-panel.jsx`

This means it is an **internal design review tool**, not a consumer-facing home page.
It should NOT be deployed as-is as the production `/` route.

---

## Audit checklist

### 1. Does it import `./styles.css` and `./shared.jsx` correctly?
- `./styles.css`: YES — `<link rel="stylesheet" href="styles.css">` (relative, no leading `./` but works fine from the same directory).
- `./shared.jsx`: YES — loaded as `<script type="text/babel" src="shared.jsx">`.

### 2. Does it render Nav with `activeIdx={0}` and `base=""`?
- The canvas renders `<HomeV1 />` and `<HomeV3 />` inside artboard wrappers.
- Whether those components use `<Nav activeIdx={0} base="">` depends on `v1-sanctuary.jsx`
  and `v3-liquid.jsx` — **those files were not present in `pages/` at audit time**.
  Verify: `ls pages/v1-sanctuary.jsx pages/v3-liquid.jsx`.
- The canvas HTML itself does not render Nav or Footer at the page level.

### 3. Does it render Footer?
- No `<Footer />` at the page level. Any Footer would be inside `v1-sanctuary.jsx` or `v3-liquid.jsx`.
- Again: depends on those files, which need to be verified.

### 4. SEO / Open Graph meta tags
The current `pages/index.html` has NONE of the following:
- `<meta name="description">` — MISSING
- `<meta property="og:title">` — MISSING
- `<meta property="og:description">` — MISSING
- `<meta property="og:image">` — MISSING
- `<meta property="og:url">` — MISSING
- `<meta name="twitter:card">` — MISSING
- `<link rel="canonical">` — MISSING

**Add before cutover:**
```html
<meta name="description" content="Empress Health — the first menopause platform where every clinical recommendation cites the research behind it. Take a 120-question assessment, get a 34-page Health Intelligence Report, and work with a NAMS-certified clinician.">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Empress Health">
<meta property="og:title" content="Empress Health — Clinical Intelligence for Menopause">
<meta property="og:description" content="A 34-page Health Intelligence Report. NAMS-certified care. Every claim cited.">
<meta property="og:image" content="https://empressnaturals.co/public/mainphoto.jpg">
<meta property="og:url" content="https://empresshealth.ai/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Empress Health — Clinical Intelligence for Menopause">
<meta name="twitter:description" content="A 34-page Health Intelligence Report. NAMS-certified care. Every claim cited.">
<meta name="twitter:image" content="https://empressnaturals.co/public/mainphoto.jpg">
<link rel="canonical" href="https://empresshealth.ai/">
```

### 5. Does it reference `pages/assets/hero-portrait.png`?
- Cannot confirm without reading `v1-sanctuary.jsx`.
- The index.html itself does not reference it directly.
- The `Placeholder` component in `shared.jsx` is used as a stand-in until real photography is placed.
- Once real photography is sourced, update references inside `v1-sanctuary.jsx`.

### 6. Render-on-load behavior / JS dependency
- YES — fully JS-dependent. React 18.3.1 + Babel 7.29 are loaded from unpkg CDN.
- The `<div id="root">` renders blank without JS.
- No server-side rendering or static fallback content.
- For SEO and no-JS resilience: add a `<noscript>` block with a fallback message and link to the legacy page.

**Recommended noscript:**
```html
<noscript>
  <style>body { font-family: Georgia, serif; text-align: center; padding: 60px 20px; }</style>
  <p>Empress Health requires JavaScript to load. Please enable JavaScript or <a href="mailto:support@empresshealth.ai">contact support</a>.</p>
</noscript>
```

### 7. The design-canvas / tweaks-panel problem
**This is the critical blocker.** The current `pages/index.html` is a design tool, not a page.
It renders the TweaksPanel UI (accent switcher, font picker, glass blur sliders).
This MUST NOT ship to production.

**What needs to happen before cutover:**

Option A (recommended): Create a new `pages/home.html` and `pages/home.jsx` that render
the chosen V1 Sanctuary variation as a standalone consumer page — same shell pattern as
`our-program.html`. Move `pages/index.html` to `pages/index-design-canvas.html` so it
stays available for internal reference. Then point the server's `/` route at the new
`pages/home.html` file.

Option B: Strip the canvas/tweaks infrastructure from `pages/index.html`, promote
`<HomeV1 />` as the single root component, remove `design-canvas.jsx` and
`tweaks-panel.jsx` from the script list, add the SEO meta block, and update the title
from "Empress Health — Home Redesign" to "Empress Health".

Option B is faster but leaves the tweaks panel code in the repository with no entry
point. Option A is cleaner.

### 8. Title tag
Current: `Empress Health — Home Redesign`
Required for production: `Empress Health — Clinical Intelligence for Menopause`

### 9. Favicon
Not set in `pages/index.html`. Add:
```html
<link rel="icon" type="image/png" href="/public/EmpressHealthlogo.png">
```

### 10. Canvas-specific CSS
```css
html, body { background: #ece2d6; }
```
This dark-cream canvas background makes sense for the design tool (artboards float on it)
but is wrong for the production page. Replace with:
```css
html, body { background: var(--surface); }
body { overflow-x: hidden; }
```

---

## Summary: minimum changes before `/` cutover

1. **Structural**: Choose Option A or B above to remove design-canvas infrastructure.
2. **Meta tags**: Add all OG + description + canonical tags (see section 4 above).
3. **Title**: Update to production title.
4. **Favicon**: Add `<link rel="icon">`.
5. **Body background**: Change from `#ece2d6` to `var(--surface)`.
6. **Noscript fallback**: Add for accessibility + SEO bots.
7. **Verify**: `v1-sanctuary.jsx` renders `<Nav variant="inline" activeIdx={0} base="">` and `<Footer base="">`.
8. **Verify**: `v1-sanctuary.jsx` exists in `pages/` and is complete.

---

*Audit performed: MMXXVI · Empathetic Elegance v1.0 · Empress Health*
