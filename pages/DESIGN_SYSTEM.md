# Empress Health — Design System

**Version 1.0 · Empathetic Elegance**

This is the visual + component language for Empress Health. The aesthetic register is **editorial-clinical with Hermès quietness** — cream pages, plum chrome, restrained gold, refined serif headlines, real natural-light photography. Copy this file (and the partner `styles.css` + `shared.jsx`) into every new page so the system stays consistent.

---

## 1 · Colors

All colors are declared as CSS custom properties on `:root` in `styles.css`. Refer by token, never hardcode.

### Surfaces (warm cream foundation)

| Token | Hex | Use |
|---|---|---|
| `--surface` | `#fff8f5` | Page background — the foundation. NEVER use pure white. |
| `--surface-bright` | `#fffaf6` | Slightly lighter — for layered cream surfaces |
| `--surface-cream` | `#f9f3ec` | Secondary background — section divisions |
| `--surface-tan` | `#efe4d6` | Warm tan — accent sections |
| `--surface-tan-deep` | `#e7d8c6` | Deeper warm tone |
| `--surface-card` | `#ffffff` | Pure-white cards (sparingly) |
| `--surface-lavender` | `#efe7f5` | Lavender mist — supportive surfaces |
| `--surface-lavender-deep` | `#e3d6ee` | Deeper lavender wash |

### Ink (text)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#1e1b18` | Body text, headlines (warm near-black, never pure black) |
| `--ink-soft` | `#4a454e` | Secondary text, paragraphs |
| `--ink-faint` | `#7b757f` | Metadata, footnotes |
| `--ink-line` | `#ccc4cf` | Subtle dividers |

### Plum (primary brand)

| Token | Hex | Use |
|---|---|---|
| `--plum` | `#33204c` | Primary CTAs, headlines, brand chrome |
| `--plum-mid` | `#4a3664` | Hover states, secondary plum |
| `--plum-soft` | `#6a5585` | Tertiary plum |
| `--plum-tint` | `#b9a1d6` | Light lavender accent on dark plum |
| `--plum-mist` | `#d6bcf3` | Lightest lavender |

### Gold (restrained accent)

| Token | Hex | Use |
|---|---|---|
| `--gold` | `#c9a560` | Thin rules, citation tags, decorative ornaments. NEVER fill large areas. |
| `--gold-soft` | `#d9bf85` | Lighter gold — on dark backgrounds |

> **The gold rule of gold:** never as a fill, never as a gradient overlay. Only as thin (0.5–1px) rules, small marks, citation footers, and tiny accents. Restraint is the brand.

---

## 2 · Typography

Two families, no more. Loaded at the top of `styles.css` via Google Fonts.

```css
--font-display: 'Bodoni Moda', serif;     /* headlines + display */
--font-body:    'Plus Jakarta Sans';      /* body + UI */
--font-mono:    'JetBrains Mono';         /* citations + metadata */
```

### Scale

| Class | Family | Size | Weight | Notes |
|---|---|---|---|---|
| `.display` | Bodoni Moda | `clamp(48px, 5.4vw, 88px)` | 500 | Hero headlines |
| `.headline` | Bodoni Moda | `clamp(32px, 3.4vw, 56px)` | 500 | Section headlines |
| `.italic-emph` | Bodoni Moda italic | inherits | 500 | Signature italic — emphasis word in headlines (plum-mid) |
| `.body-lg` | Plus Jakarta | 18px | 400 | Lead paragraphs, hero subhead |
| `.body-md` | Plus Jakarta | 15px | 400 | Body copy |
| `.eyebrow` | Plus Jakarta | 11px | 600 | Plum, uppercase, `letter-spacing: 0.18em` |
| `.label-sm` | Plus Jakarta | 11px | 600 | Faint, uppercase, `letter-spacing: 0.14em` |
| `.mono` | JetBrains Mono | 10px | 500 | Citations, source tags, metadata |

### Headline pattern (the signature move)

Every section headline uses a normal + italic split:

```jsx
<h2 className="headline">
  Confidence that grows <em className="italic-emph">with you.</em>
</h2>
```

The italic tail is *always* in plum-mid. Never italicize the whole line.

---

## 3 · Spacing

Base-8 scale. Be generous — whitespace is the brand.

| Token | Value | Use |
|---|---|---|
| Stack S | 8px | Tight grouping |
| Stack M | 16px | Default item spacing |
| Stack L | 32px | Block spacing |
| Gutter | 24px | Grid gutters |
| Margin desktop | 56–64px | Page edge padding |
| Margin mobile | 20px | Mobile edge padding |
| Section gap | 120–160px | Between major sections (generous!) |

---

## 4 · Border radii

| Token | Value |
|---|---|
| `--r-sm` | 0.5rem (8px) — small chips, tiny elements |
| `--r-md` | 0.875rem (14px) — input fields, small cards |
| `--r-lg` | 1.25rem (20px) — primary cards, glass panels |
| `--r-xl` | 1.75rem (28px) — hero CTAs, large containers |
| `--r-pill` | 9999px — pills, buttons |

---

## 5 · Components

All components live in `shared.jsx` and are exposed globally. Import once per page.

### `<Nav />`

Editorial nav, single row. Wordmark (crown + EMPRESS) left, full menu items centered, Start Free + Sign In on right. Use `<Nav variant="inline" />` for cream pages, `<Nav variant="floating" />` for full-bleed photo heroes (renders as a glass capsule).

**Rules:**
- Nav text is `--ink`. Active item gets a thin gold underline.
- Hover: gold underline animates in from center.
- Place a **cream veil** at the top of any page with a full-bleed hero photo:

```jsx
<div style={{
  position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 1,
  pointerEvents: 'none',
  background: 'linear-gradient(180deg, var(--surface) 0%, rgba(255,248,245,0.85) 35%, transparent 100%)',
}} />
```

### `<Footer />`

5-column footer (brand + 4 link columns). Use unmodified at the bottom of every marketing page.

### Buttons

```html
<button class="btn btn-primary">Start free →</button>
<button class="btn btn-ghost">Read a sample report</button>
<button class="btn btn-text">Explore Our Program</button>  <!-- text only -->
```

- **Primary** = plum fill, white text, pill, soft plum drop-shadow on hover.
- **Ghost** = translucent cream + thin border + 12px backdrop blur. Use on dark backgrounds.
- **Text** = no chrome, plum text, auto-arrow on hover.

Pill radius (`--r-pill`) on all primary CTAs. Never square buttons.

### `<Placeholder label width height tone radius />`

Striped cream-toned stand-in for real photography. Tones: `cream` · `lavender` · `tan` · `plum`. Label is a monospace caption explaining what real image goes there (e.g. `"PORTRAIT · WOMAN 50S · NATURAL LIGHT"`). Replace with a real `<img>` when imagery is supplied.

### Glass surfaces

Three variants — pick by what's behind:

| Class | Use over |
|---|---|
| `.glass` | Detailed backdrops (photos, gradients) — full multi-layer liquid glass with backdrop-blur + saturation + inner highlight |
| `.glass-warm` | Plain cream sections where backdrop-filter has nothing to blur — uses a warm cream gradient fill |
| inline (custom tint) | Pass `backgroundColor: 'rgba(232,222,250,0.55)'` to `.glass` to tint while keeping the highlight |

**Anatomy of a `.glass` element:**
- `linear-gradient(135deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.18) 100%)` base
- `backdrop-filter: blur(22px) saturate(180%)`
- `border: 1px solid rgba(255,255,255,0.55)` — top-left specular highlight
- `box-shadow:` ambient plum-tinted drop + 1px white inset top + 1px white inset bottom
- `::before` adds a diagonal sheen across the top-left edge

Don't override the background entirely — only tint via `backgroundColor` so the gradient sheen survives.

### `<SectionHeading />`

```jsx
<SectionHeading
  align="center"            // or "left"
  eyebrow="A PROGRAM..."   // small uppercase
  title="Confidence that grows"
  italicTail="with you."
  sub="One-line description..."
/>
```

### Chips & tags

```html
<span class="chip"><span class="dot"></span>MENOPAUSE & PERIMENOPAUSE SUPPORT</span>
```

Lavender background, plum text, uppercase. The `.dot` is a tiny gold pip.

### The mono citation tag

Every clinical claim, recommendation, or member quote ends with a citation in mono:

```html
<div class="mono" style="color: var(--gold)">SOURCES · CHUNK-014 · NAMS 2023</div>
```

This is the brand. Never hide citations in tooltips.

---

## 6 · Patterns

These are the recurring layout moves. Reuse them.

### The gold rule (`gold-rule`)

```html
<span class="gold-rule"></span>
```

A 28×1px gold line. Use as a quiet divider between a title and a subtitle, or between a quote and an attribution.

### Section ornaments

**Gold rule + italic chapter marker** — opens a major section:

```html
<div style="display: inline-flex; align-items: center; gap: 16px">
  <span style="width: 50px; height: 1px; background: var(--gold)"></span>
  <span style="font-family: var(--font-display); font-style: italic; font-size: 22px; color: var(--plum)">
    Chapter II.
  </span>
  <span style="width: 50px; height: 1px; background: var(--gold)"></span>
</div>
```

**Fleuron diamond** — the rotated gold square with a center pip:

```jsx
<svg width="14" height="14" viewBox="0 0 14 14">
  <rect x="6" y="0" width="2" height="14" fill="var(--gold)" transform="rotate(45 7 7)" />
  <rect x="0" y="6" width="14" height="2" fill="var(--gold)" transform="rotate(45 7 7)" />
  <circle cx="7" cy="7" r="2" fill="var(--surface)" stroke="var(--gold)" strokeWidth="0.8"/>
</svg>
```

**Gold corner brackets** — frame photos with editorial-print restraint:

```html
<div style="position: relative">
  <img />
  <div style="position: absolute; top: -8px; left: -8px; width: 14px; height: 14px;
              border-top: 1px solid var(--gold); border-left: 1px solid var(--gold)"></div>
  <!-- mirror for the other three corners -->
</div>
```

### Luxury orbs (the Louis Vuitton effect)

Background atmosphere. **Always** very large, very low opacity, single radial gradient, heavy gaussian blur. Never use rings or hard edges.

```jsx
<div style={{
  position: 'absolute', top: -120, left: -180, width: 680, height: 680, borderRadius: '50%',
  background: 'radial-gradient(circle at 50% 50%, rgba(214,188,243,0.32) 0%, rgba(214,188,243,0) 65%)',
  filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
}} />
```

Mix lavender (`rgba(214,188,243,X)`), peach (`rgba(247,222,196,X)`), faint gold (`rgba(201,165,96,X)`). Opacity range `0.08–0.32`. Place 2–4 per section.

### Photography (the seamless blend)

Real portraits bleed past their container. Feather only the side that meets cream, not the side that meets the page edge.

```jsx
<div style={{
  width: '60%', height: 940,
  backgroundImage: 'url(...)',
  backgroundSize: 'cover',
  backgroundPosition: 'right 65%',
  WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.25) 6%, black 28%, black 100%)',
  maskImage: '...same...',
}} />
```

Because the photo's own background is cream-toned, the un-feathered edges blend into the page automatically.

### The signature italic in display headlines

The brand voice splits headline + italic tail. Italic word always says the emotional payoff:

- "Sleep deeply. Think clearly. *Feel like yourself again.*"
- "Confidence that grows *with you.*"
- "Support that *learns you.*"
- "Meet your *care team.*"
- "Ask Empress. *She gets it.*"

---

## 7 · The layout grid

12-column desktop grid, 56–64px page margins, 24px gutters.

For a typical content section:

```jsx
<section style={{ padding: '140px 64px', background: 'var(--surface)' }}>
  <div style={{ maxWidth: 1280, margin: '0 auto' }}>
    {/* content */}
  </div>
</section>
```

Section vertical padding is generous: **120–160px** above + below. Don't compress.

---

## 8 · Backgrounds (section palette)

Alternate between three background tones to create rhythm:

1. `--surface` (warm cream `#fff8f5`) — default
2. Linear gradient: `linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)` — lavender wash
3. Linear gradient: `linear-gradient(180deg, var(--surface) 0%, #f7eee5 60%, var(--surface) 100%)` — warm tan wash
4. Light lavender for closing CTA: `linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)` — never dark plum on landing surfaces

Place the deeper variants at major content shifts. Keep them low-saturation.

---

## 9 · Banned patterns

The brand brief is clear. Don't:

- Purple gradient over white background (SaaS slop)
- Pure-white page backgrounds (use cream)
- "Feature 1 / 2 / 3" icon-grid card sections without imagery
- Stock smiling-woman-holds-tablet photography (use Kinfolk / Cereal register)
- "Wellness journey" / "Modern, clean, premium" copy
- Citations hidden in tooltips — they must be visible inline
- Roboto, Arial, system-ui, or Inter as body type
- Hard gold fills (gold is *only* lines + small marks)
- Saturation above 0.04 on whites/creams

---

## 10 · How to use this on a new page

1. Copy `styles.css` and `shared.jsx` into the new page's directory.
2. Load the fonts (Bodoni Moda, Plus Jakarta Sans, JetBrains Mono).
3. Pin React 18.3.1 + Babel 7.29 with the exact integrity hashes from the existing pages.
4. Import `shared.jsx` first, then your page's component.
5. Apply the cream-veil pattern at the top if you have a full-bleed photo hero.
6. Compose with `<Nav />`, `<SectionHeading />`, `.glass` cards, `<Placeholder />`, and `<Footer />`. Don't reinvent.
7. Generous section padding (120–160px). Real photography where placeholders are. Citations visible.

That's the whole system.

---

*Last updated · MMXXVI · Empress Health · Empathetic Elegance v1.0*
