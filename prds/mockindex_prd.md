EmpressHealth.ai — Home (Index) Page PRD

Document Type: Frontend Design PRD (Single Page)
Page: Index / Home
Stack: Plain HTML / CSS / JavaScript (no framework)
Status: Approved behavioral spec (ready for Cursor execution)

1. Purpose of the Home Page

The Home page is the primary conversion and trust-building surface for EmpressHealth.ai. Its goals are:

Establish emotional resonance and credibility within seconds

Clearly communicate what EmpressHealth.ai does and who it is for

Guide users through a calm, premium narrative

Convert users into onboarding (“Start your plan”)

The page must feel guided, soothing, premium, and intentional, never overwhelming or cluttered.

2. Global Page Rules (Non-Negotiable)
2.1 Responsive Breakpoint

Mobile: ≤ 820px

Desktop: ≥ 821px

2.2 Sticky Header + Hero Height (Option B)

The menu/header is always sticky.

The hero must occupy the remaining viewport height, not hide behind the menu.

Hero height formula (all breakpoints):

hero height = 100vh − header height

2.3 Carousel Interaction Standard (Used Across Page)

Whenever a section is described as “display one at a time”, it must follow this exact interaction model:

Layout

[ Left Arrow ]  [ Single Item ]  [ Right Arrow ]


Scroll Behavior

Horizontal scrolling only

Left arrow scrolls content LEFT

Right arrow scrolls content RIGHT

Navigation Rules

Infinite looping (last → first, first → last)

Arrows are never disabled

Clicking arrows must move exactly one item per interaction

Swipe / drag enabled (touch + trackpad)

Indicators

Arrows only

No dots

No pagination text

This interaction model applies identically to:

Reviews

Feature List (mobile)

Doctors (mobile)

Products

Affirmations (mobile)

Affirmation Reader navigation

3. Page Structure (10 Sections)

The Home page consists of exactly 10 sections, in the following order:

Menu (Header)

Hero

Reviews

Feature List

Progress

Stats

Doctors

Products

Preview

Affirmations

4. Section-by-Section Requirements
4.1 Section 1 — Menu (Header)
Purpose

Primary navigation and brand anchor.

Behavior

Anchored (sticky) to the top of the viewport

Desktop: menu must be horizontally centered

Logo + nav group centered within the header container

Equal spacing on left and right sides

Mobile: hamburger menu expands into full navigation

Constraints

Do not redesign menu visuals

Only adjust alignment and layout logic

Page content must account for header height (no overlap)

4.2 Section 2 — Hero
Purpose

Immediate emotional impact and value proposition.

Layout

Full-width hero

Height = 100vh − header height

Entire hero image must always be fully visible

Use object-fit: contain

No cropping of faces, text, or key visual content

Extra space filled with brand-aligned neutral background

Behavior

Hero image rotates every 8 seconds

Rotation applies to desktop and mobile

Transition style: subtle fade

Rotation pauses when tab/window is not visible

Honors prefers-reduced-motion

4.3 Section 3 — Reviews
Purpose

Social proof and emotional validation.

Layout

Reviews styled as chat / talking bubbles

Background color: Empress Gold (adjusted for contrast)

Interaction

One review displayed at a time

Left/right arrows

Infinite loop

Swipe/drag enabled

4.4 Section 4 — Feature List
Purpose

Explain core value propositions clearly and quickly.

Layout

Desktop: features displayed left-to-right

Mobile: one feature at a time

Interaction (Mobile)

One-at-a-time carousel

Infinite loop

Swipe/drag enabled

4.5 Section 5 — Progress
Purpose

Reinforce growth, continuity, and momentum.

Layout (All Breakpoints)

Header / copy

Image

Constraints

No side-by-side layouts

Stacked only

4.6 Section 6 — Stats
Purpose

Build confidence through measurable outcomes.

Layout

Desktop: 2 × 2 grid

Mobile: stacked 1 × 4

4.7 Section 7 — Doctors
Purpose

Establish credibility and expertise.

Layout

Desktop: horizontal list with overflow scroll

Mobile: one doctor at a time

Interaction (Mobile)

One-at-a-time carousel

Infinite loop

Swipe/drag enabled

4.8 Section 8 — Products
Purpose

Introduce Empress-recommended products.

Layout

One product visible at a time

Interaction

One-at-a-time carousel

Infinite loop

Arrow direction must strictly match scroll direction

Swipe/drag enabled

Constraints

Shopify integration unchanged

No backend changes

Presentation only

4.9 Section 9 — Preview
Purpose

Preview the Ask Empress experience.

Layout

Desktop image for desktop

Mobile image for mobile

Implementation

Use <picture> or conditional rendering

Images provided externally

4.10 Section 10 — Affirmations
Purpose

End the page with reassurance, empowerment, and emotional grounding.

Layout

Desktop: 3-column grid, all affirmations visible

Mobile: one affirmation at a time

Interaction (Mobile)

One-at-a-time carousel

Infinite loop

Swipe/drag enabled

4.10.1 Affirmation Content (Required — Explicit List)

The following affirmations must be rendered and used consistently across preview, carousel, and reader:

You are not broken — your body is changing, and you are adapting.

This phase of life is not the end of you — it is a becoming.

You deserve support, clarity, and care — without shame.

Your symptoms are real, valid, and worthy of attention.

You are allowed to rest, reset, and choose yourself.

You are still powerful, capable, and deeply whole.

No affirmations may be omitted, merged, or renamed.

4.10.2 Affirmation Preview Rules

Affirmation preview must display the entire image

Use object-fit: contain

No cropping

No masked edges

Title text must never overlap the image

Preview image and title must be fully visible at all times

4.10.3 Affirmation Reader (Modal)

Clicking or tapping any affirmation opens a modal reader.

Reader Behavior

Displays:

Affirmation title

Full affirmation image (entire image visible, no crop)

Expanded affirmation text / details

Navigation:

Left/right arrows navigate affirmations

Infinite loop

Keyboard: ArrowLeft / ArrowRight

Close behavior:

Close button (×)

Escape key

Background click

Body scroll locked while open

Constraints

Reuse existing affirmation logic

Do not duplicate state or data sources

5. Accessibility & UX Requirements

All arrows require aria-labels

Keyboard navigation supported everywhere

Focus rings visible and brand-consistent

Text contrast meets WCAG AA

6. Performance & QA Requirements
Required

No layout shift on hero rotation

No duplicated event listeners

Smooth scrolling

No content hidden behind header

Must Pass QA Viewports

360 × 800

820 × 1180

1280 × 800

7. Definition of Done

The Home page is complete when:

Desktop menu is centered

All carousels scroll in the correct direction

Product arrows function correctly with infinite looping

All affirmations are present and readable

Affirmation images are never cropped

Reader behaves identically across devices

No regressions to menu or Shopify logic

Owner: Empress Health Product & Design
Last Updated: 2026-01-17