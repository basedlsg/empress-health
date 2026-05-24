Product Requirements Document (PRD)
Layout Cleanup – Haircare Page

Project: EmpressHealth.ai
Page: /haircare
Scope: UI/Layout Only (No Content Edits)

1. Project Overview

The Haircare page appears to function as a product, educational, or category-based resource page within Empress Health. The objective is to improve structure, readability, visual grouping, and responsiveness while preserving all existing text exactly as written.

This redesign will:

Improve clarity of content sections

Enhance product/resource presentation (if applicable)

Strengthen hierarchy and spacing

Improve mobile usability

Align layout with the broader Empress design system

All text must remain unchanged.

2. Objectives

Improve scannability of haircare-related content.

Strengthen hierarchy between page title and sections.

Improve card or product layout consistency (if applicable).

Increase whitespace and vertical rhythm.

Enhance mobile responsiveness.

Preserve all text verbatim.

3. Non-Negotiable Constraints

No rewriting or editing of text.

No reordering of sections or products.

No adding or removing content.

No modifying CTA wording.

No backend, cart, or product logic changes.

Header and footer remain untouched.

4. Current Layout Challenges (Typical Category Pages)

Dense content without sufficient spacing.

Weak separation between informational sections.

Inconsistent product/resource presentation.

Poor mobile stacking.

Long vertical scroll without visual rhythm.

Weak emphasis on key sections.

5. Structural Layout Requirements
5.1 Page Container

Centered max-width container (~1200px desktop).

Side padding:

24px mobile

40px tablet

60px desktop

Maintain whitespace-driven layout.

5.2 Page Header Section

The top of the page must clearly present:

Page title (H1)

Intro text (if present)

Requirements:

60–80px vertical padding.

Clear separation between header and next section.

H1 visually emphasized (no text change).

5.3 Section Grouping

Each logical content group must be wrapped in:

<section class="haircare-section">

Spacing:

60px vertical spacing between sections.

24–32px internal spacing within sections.

24px paragraph spacing.

16–20px spacing between list items.

Alternate subtle background tone between major sections to create rhythm (very light variation only).

5.4 Product or Resource Cards (If Present)

If the page includes product listings or resource blocks, structure each item as:

<article class="haircare-card">

Card requirements:

Subtle border.

Light shadow.

Rounded corners (8–12px).

24–32px internal padding.

24–32px spacing between cards.

Preserve internal order:

Title

Image (if present)

Description

CTA

No reordering allowed.

5.5 Grid Layout Behavior
Desktop (>1024px)

2–3 column responsive grid for product/resource cards.

Even gutters.

Balanced card heights where feasible.

Tablet (768–1024px)

2-column layout where appropriate.

Maintain strong vertical rhythm.

Mobile (<768px)

Single-column stacked layout.

32px vertical spacing between cards.

Full-width CTAs.

Comfortable padding.

6. Typography Hierarchy

Preserve text but enforce consistent styling:

Element	Styling Requirement
H1	Page Title
H2	Major Section Titles
H3	Subsections
Body	16–18px
CTA	Clear emphasis
Lists	Proper bullet styling

Rules:

Line-height 1.5–1.6.

Limit line width to 65–75 characters.

Maintain left alignment.

Consistent spacing above headings.

7. Visual Enhancements

Add clear separation between sections.

Improve spacing between title and body text.

Add subtle hover state for cards (desktop only).

Improve CTA prominence through spacing only (not copy).

Do NOT:

Add new promotional badges.

Add filters or sorting UI.

Add new decorative icons that change meaning.

8. CTA Areas (If Present)

Visually separated from content.

32px spacing above CTA blocks.

Full-width on mobile.

Preserve CTA text exactly.

9. Accessibility Requirements

Semantic <section> and <article> usage.

Proper heading hierarchy (H1 → H2 → H3).

WCAG AA contrast.

Keyboard focus states visible.

Links clearly distinguishable.

10. Design System Alignment

Maintain Empress Health aesthetic:

Clean wellness-tech style.

Soft neutral backgrounds.

Structured whitespace.

Subtle shadows and borders.

Professional, calm presentation.

No new color palette introduced.

11. Structural Wireframe Example
[Header]

<main>
  Section 1: Page Title + Intro

  Section 2: Informational Content

  Section 3: Product/Resource Grid
    [Haircare Card 1]
    [Haircare Card 2]
    [Haircare Card 3]

  Section 4: Additional Content / CTA
</main>

[Footer]

Content order must match live page exactly.

12. Acceptance Criteria

All text matches live page exactly.

Section order unchanged.

Cards rendered consistently.

Responsive at:

375px

768px

1024px

1440px.

No overflow or clipping.

Accessibility standards met.

13. Success Metrics

Improved readability.

Cleaner section rhythm.

Better mobile usability.

Stronger visual alignment with other Empress pages.

14. Deliverables

Updated semantic HTML layout.

Responsive card-based structure (if applicable).

Clean CSS implementation.

QA confirmation of zero text changes.