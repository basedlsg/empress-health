Product Requirements Document (PRD)
Layout Cleanup – Wellness Hub Page

Project: EmpressHealth.ai
Page: /wellnesshub
Scope: UI/Layout only (No content edits)

1. Project Overview

The Wellness Hub page requires visual refinement to improve hierarchy, readability, spacing consistency, and responsiveness while preserving all existing text exactly as written.

This redesign will:

Improve user comprehension

Strengthen visual structure

Align the page more tightly with the Empress Health design system

Enhance mobile usability

All text must remain verbatim.

2. Objectives

Improve visual hierarchy and scannability.

Standardize spacing and section structure.

Enhance responsiveness across devices.

Improve semantic HTML structure and accessibility.

Maintain brand consistency.

3. Non-Negotiable Constraints

No changes to wording.

No reordering of text blocks.

No removal or addition of copy.

No new sections.

No backend logic changes.

Header and footer remain untouched (unless structurally required for spacing consistency).

4. Current Issues (Layout-Oriented)

Typical problems addressed:

Inconsistent spacing between sections.

Overly dense text blocks.

Weak visual grouping of related content.

Inconsistent heading scale.

Insufficient max-width constraints.

Mobile stacking inconsistencies.

Lack of strong section separation.

5. Layout Requirements
5.1 Page Container

Wrap content in a centered max-width container (~1100px desktop).

Side padding:

24px mobile

40px tablet

60px desktop

Maintain clean whitespace-driven layout.

5.2 Section Structure

Each logical group of content must be wrapped in:

<section class="wellness-section">


Spacing rules:

60px vertical padding between major sections.

32px internal padding within cards or content blocks.

24px spacing between paragraphs.

20px spacing between list items.

Alternate background styling between sections (subtle tonal variation only — neutral, brand-aligned).

5.3 Typography Hierarchy

Maintain existing text but enforce consistent scale:

Element	Style Requirement
H1	Strong visual anchor, largest size
H2	Section headers
H3	Subsections
Body	16–18px, 1.5–1.6 line-height

Rules:

Limit line length to ~65–75 characters.

Improve paragraph readability.

Maintain left-aligned text for body copy.

5.4 Content Grouping

If the page contains:

Resource listings

Categories

Tool sections

Educational blocks

Wellness areas

They should be visually structured as:

Option A: Card Layout

Soft rounded corners

Light border

Subtle shadow

Internal padding 24–32px

Option B: Alternating Section Blocks

Slight background tone shift between sections

No content restructuring allowed — only visual grouping.

5.5 Visual Hierarchy Enhancements

Use consistent heading spacing.

Add subtle horizontal dividers between major content groups.

Improve spacing above and below CTA areas.

Emphasize important sections via visual rhythm (not new copy).

6. Responsive Requirements
Mobile (<768px)

Single-column layout.

Increased side padding.

Maintain 44px minimum tap targets.

Proper spacing between stacked elements.

Avoid cramped text blocks.

Tablet (768–1024px)

Optional two-column layout ONLY if content already implies grouping.

Maintain balanced whitespace.

Desktop (>1024px)

Centered layout.

Controlled line-length.

Proper section rhythm.

7. Accessibility Requirements

Proper semantic hierarchy (H1 → H2 → H3).

No heading skipping.

Adequate color contrast (WCAG AA minimum).

Keyboard navigability preserved.

Decorative elements marked with aria-hidden="true" if used.

8. Design System Alignment

Follow Empress Health visual identity:

Clean, modern wellness aesthetic.

Soft neutral backgrounds.

Structured whitespace.

Professional healthcare-tech presentation.

Calm, non-aggressive visual hierarchy.

No new color palette introduced.

9. Wireframe (Structural Example)
[Header]

<main>
  Section 1: Page Title + Intro

  Section 2: First Content Group (Card/Block)

  Section 3: Second Content Group

  Section 4: Resource Listings / Categories

  Section 5: CTA or Informational Footer Area
</main>

[Footer]

10. Acceptance Criteria

All text matches live site exactly.

Content order unchanged.

Clear section separation implemented.

Page responsive at:

375px

768px

1024px

1440px

Typography consistent.

No layout overflow.

Accessibility structure valid.

11. Success Metrics

Improved readability perception.

Better visual clarity.

Stronger mobile usability.

Consistent design alignment with other cleaned-up Empress pages.

12. Deliverables

Updated semantic HTML structure.

Clean CSS implementation.

Responsive layout.

QA pass for spacing, hierarchy, and accessibility.

No content modifications.