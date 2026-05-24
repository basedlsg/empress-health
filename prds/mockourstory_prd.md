EmpressHealth.ai — Our Story

Frontend Design PRD (Revised / Locked Scope)

Page: /ourstory
Document Type: Frontend UX / UI PRD
Status: Approved Direction (visual/layout execution only)
Stack: Plain HTML / CSS / JavaScript
Editing Constraint: ❗ Customer-generated text is immutable
Design Intent: Minimal · Calm · Editorial

1. Core Constraints (Hard Rules)

Single static hero image only

Must be fixed for desktop and mobile

No carousel, no transitions

No buttons on the page

Only interactive elements allowed:

Global navigation menu links

❌ No CTAs

❌ No callout buttons

❌ No prompts to convert

Text is locked

❌ Do NOT edit wording

❌ Do NOT rewrite paragraphs

❌ Do NOT split or merge sentences

Layout and spacing only

Minimal aesthetic

No decorative UI

No icons

No visual noise

Editorial pacing is the priority

2. Global Layout Rules
2.1 Responsive Breakpoints

Mobile: ≤ 820px

Desktop: ≥ 821px

2.2 Content Width

Narrative text max width: 680–720px

Centered column

Consistent across all text sections

2.3 Typography

Use existing site typography only.

Comfortable long-form reading:

Line-height: ~1.65

Generous paragraph spacing

No typography embellishments

No drop caps

No decorative quotes

3. Page Structure (Top → Bottom)
3.1 Hero Section (Static Image Fix)
Objective

Correct and normalize the existing hero image for desktop and mobile without altering content meaning.

Layout

Full-width container

Single static image

Image is fully visible (no aggressive cropping)

Image Rules

Desktop:

Landscape ratio

Image must not be hidden by header

Mobile:

Re-cropped or alternate asset allowed only to preserve subject clarity

No text overlay

Behavior

No animation

No parallax

No motion

Load priority: high

3.2 Narrative Sections (Text-Only)
Objective

Preserve the authenticity of the customer-generated story while improving readability and pacing.

Layout

Single centered column

Paragraphs remain exactly as written

Spacing is the only tool for structure

Rules

Use vertical rhythm to create “breathing room”

No visual dividers between paragraphs

No cards

No boxes

No background gradients inside text blocks

3.3 Alternating Section Backgrounds (Subtle Only)
Objective

Create visual rhythm without distracting from the story.

Implementation

Alternate between:

Pure white

Soft ivory / off-white (e.g. #fffaf1 or existing token)

Rules

Background shifts occur only between major narrative groupings

No borders

No shadows

No visible section breaks beyond background tone

3.4 Supporting Image Section (If Present)
Objective

Break up text fatigue while maintaining emotional tone.

Layout

Full-width or centered image

Soft edge blending into background

Neutral, calm imagery only

Rules

Image does not introduce new information

No captions

No overlays

No competing focal points

3.5 Mission / Belief Statement (Text Only)
Objective

Allow the mission to stand on its own visually without altering words.

Layout Treatment

Same text

Slightly larger font size OR increased line spacing

Centered within column

No quotation marks added

No icons

4. Navigation & Header Behavior

Use existing global header

Header must:

Not overlap hero image

Feel visually quiet

No sticky CTAs

No additional page-specific navigation

5. Accessibility (Required)

Proper semantic structure (H1 → H2)

Alt text for images (descriptive, neutral)

Sufficient color contrast

Keyboard navigation intact

No interaction traps

6. Performance Requirements

Images optimized per breakpoint

Avoid layout shift (CLS)

Minimal JS

Target load time:

< 2s mobile

< 1.5s desktop

7. Motion & Effects

❌ No parallax
❌ No scroll-triggered animations
❌ No fades

If any motion exists, it must be imperceptible and non-essential.

8. Explicit Non-Goals

This page must NOT:

Act as a landing page

Push conversion

Introduce new copy

Feel like marketing

Compete visually with the Home page

9. Implementation Summary (For Cursor / Dev)

“Do not modify text.
Fix hero image responsiveness for desktop and mobile.
Center narrative content in a readable column.
Introduce subtle alternating background sections.
Keep everything minimal, quiet, and editorial.”