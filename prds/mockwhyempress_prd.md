Why Empress — Frontend Product Requirements Memo (PRM)

Route: /whyempress

Product: EmpressHealth.ai

Document Type: Frontend PRM

Audience: Frontend Engineering, Design, Product

Status: Approved for implementation

1. Page Role (Frontend Perspective)

The Why Empress page is a narrative-driven trust page.

From a frontend standpoint, its role is to:

Deliver a calm, linear story without friction

Visually reinforce credibility and intention

Avoid UI distractions that feel promotional or sales-driven

Guide the user emotionally toward onboarding

This page should feel more like a guided conversation than a landing page.

2. Global Frontend Constraints (Non-Negotiable)
2.1 Viewport Height Rule (Critical)

Header (menu) + Hero MUST equal exactly 100vh

There must be no vertical overflow on initial page load

The hero height must be calculated as:

hero-height = 100vh - header-height

This rule applies to all screen sizes. (Non‑Negotiable)

2.1 Responsive Breakpoints

Mobile: ≤ 820px

Desktop: ≥ 821px

Layouts must be mobile-first and scale upward.

2.2 Max Content Width

Desktop content max width: 1100–1200px

Center-aligned content column

Never full-width text blocks

2.3 Visual Tone Enforcement

No sharp edges

No aggressive animations

No high-contrast black/white combinations

No dense grids or cards unless explicitly defined

The page must visually “breathe.”

3. Page Layout Architecture
Layout Pattern

Single-column vertical narrative

Alternating text-only and text + visual sections

Generous vertical spacing between sections

Scrolling behavior:

Natural scroll only

No snap points

No auto-scroll

4. Section-by-Section Frontend Requirements
4.1 Hero Section

Critical Layout Rule:

Hero + header must equal 100vh exactly

Hero must never push content below the fold on first load

Hero Image Implementation (Required – Best Long-Term Solution):

Create source images that are pre-cropped and composed to match device aspect ratios, then render them using object-fit: cover. Because the source images already fit the viewport proportions, any cropping will be negligible.

Source Image Aspect Ratios:

Desktop: 16:9 (primary), 21:9 (ultra-wide)

Mobile: 9:16, 9:19.5

Implementation Rules:

Use <picture> with media queries

Apply object-fit: cover and object-position: center

Avoid CSS-based cropping tricks

No background video

Structure:

Hero height: calc(100vh - header-height)

Centered content block

Elements:

H1 headline

Short paragraph (max 2 lines on desktop)

Subtle CTA button

Structure:

Full viewport height minus header

Centered content block

Elements:

H1 headline

Short paragraph (max 2 lines on desktop)

Subtle CTA button

Frontend Rules:

No background video

Optional soft gradient or static image

CTA must not dominate the visual hierarchy

4.2 “The Problem” Section

Structure:

Text-first section

Optional muted illustration or abstract visual

Frontend Rules:

Paragraph width capped for readability

No bullet overload (max 3 bullets if used)

Maintain calm rhythm between lines

4.3 Philosophy Section

Structure:

Split layout on desktop (text + visual)

Stacked on mobile

Visual Rules:

Visual must feel editorial, not promotional

No icons that resemble medical symbols

4.4 Differentiation Section

Structure:

Vertical list of differentiators

Each item:

Short heading

One supporting sentence

Frontend Constraints:

No feature cards

No checkmarks

No comparison tables

4.5 Responsibility & AI Section

Structure:

Text-centered section

Optional callout block with softer background

Frontend Rules:

No technical diagrams

No model names

Focus on clarity, not implementation

4.6 Who It’s For / Not For Section

Structure:

Two-column layout on desktop

Single column stacked on mobile

Styling Rules:

Equal visual weight

Neutral language

No red/green success/failure cues

4.7 Closing CTA Section

Structure:

Minimal

Centered

Clear visual separation from previous content

CTA Rules:

Single CTA only

No urgency copy

No secondary buttons

5. Typography Rules
Headings

Elegant, restrained

Larger line-height than default

No all-caps

Body Text

Highly readable

Comfortable paragraph spacing

Avoid long line lengths

6. Color & Theming

Palette Usage:

Empress ivory backgrounds as default

Purple used sparingly for emphasis

Gold used only for accents

Explicit Restrictions:

No pure black text on pure white

No neon or saturated colors

7. Animation & Interaction

Subtle fade-ins only

No parallax

No scroll-jacking

Animations must never interrupt reading

8. Accessibility Requirements

Minimum AA contrast compliance

Proper heading hierarchy (H1 → H2 → H3)

Buttons must be keyboard accessible

Avoid relying on color alone to convey meaning

9. Performance Requirements

Page must feel instant on first load

Avoid large imagery unless optimized

Lazy-load non-critical visuals

10. Explicit Non‑Goals

The frontend must NOT:

Feel like a sales funnel

Look like a feature explainer

Contain pricing

Contain testimonials

Use countdowns, badges, or trust seals

11. Success Criteria (Frontend)

Users scroll through at least 70% of the page

Bounce rate lower than homepage average

Smooth visual flow with no cognitive friction

12. Implementation Summary

The /whyempress frontend should feel:

Editorial

Calm

Premium

Respectful of the user’s emotional state

If this page feels quietly confident, it is implemented correctly.