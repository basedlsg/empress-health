Product Requirements Document (PRD)
Layout Cleanup – eBook Guides Page

Project: EmpressHealth.ai
Page: /ebookguides
Scope: UI/Layout Only (No Content Edits)

1. Project Overview

The eBook Guides page functions as a resource distribution and/or educational content landing page. The objective is to improve layout clarity, content grouping, visual hierarchy, and responsiveness while preserving all text exactly as written.

This redesign will:

Improve presentation of eBook listings

Strengthen visual consistency of guide cards

Enhance readability

Improve mobile experience

Align with overall Empress Health design system

All text must remain unchanged.

2. Objectives

Improve clarity of individual guide offerings.

Strengthen card-based layout consistency.

Enhance scannability of titles and descriptions.

Improve spacing and typography structure.

Optimize responsiveness across devices.

Preserve all text verbatim.

3. Non-Negotiable Constraints

No rewriting or editing of text.

No changing order of guides.

No removal or addition of content.

No modification of CTA wording.

No backend, CMS, or download logic changes.

Header and footer remain untouched.

4. Current Layout Challenges (Typical Resource Pages)

Weak separation between individual guides.

Inconsistent spacing.

Long vertical scroll without visual grouping.

Poor mobile card structure.

Weak hierarchy between title, description, and CTA.

Unbalanced layout if guide count varies.

5. Structural Layout Requirements
5.1 Page Container

Centered max-width container (~1200px desktop).

Padding:

24px mobile

40px tablet

60px desktop.

Maintain whitespace-driven layout.

5.2 Page Header Section

The top of the page should clearly present:

Page title (H1)

Intro text (if present)

Requirements:

60–80px vertical spacing.

Clear separation between header and guide grid.

Emphasize H1 without changing text.

5.3 eBook Guide Card Structure

Each guide should be structured as:

<article class="ebook-card">

Card styling requirements:

Subtle border.

Light shadow.

Rounded corners (8–12px).

24–32px internal padding.

24–32px spacing between cards.

Each card must contain (in existing order):

Guide title

Description text

Any metadata (if present)

CTA (Download / View / Learn More — unchanged text)

No reordering allowed.

5.4 Grid Layout Behavior
Desktop (>1024px)

Responsive 2–3 column grid depending on number of guides.

Even spacing between columns.

Balanced card heights where possible.

Tablet (768–1024px)

2-column grid where space allows.

Consistent vertical rhythm.

Mobile (<768px)

Single-column stacked layout.

Full-width cards.

32px vertical spacing between cards.

Comfortable padding.

6. Typography Hierarchy

Preserve all text but enforce consistent styling:

Element	Styling Requirement
H1	Page Title
H2/H3	Guide Titles
Body	16–18px
CTA	Clear visual emphasis
Metadata	Slightly smaller than body

Rules:

Line height 1.5–1.6.

Limit line width to 65–75 characters.

Maintain left alignment for readability.

Add consistent spacing above headings.

7. Visual Enhancements

Clear separation between guide cards.

Strong visual distinction between title and description.

Add subtle hover effect on desktop (shadow elevation).

Clearly distinguish clickable areas.

Do NOT:

Add badges or labels unless already present.

Add filtering or sorting UI.

Add pagination if not already present.

8. CTA Layout

CTA clearly separated from description.

Minimum 44px tap height.

Full-width on mobile.

Maintain original CTA text exactly.

9. Accessibility Requirements

Use semantic <article> for each guide.

Proper heading structure (H1 → H2/H3).

WCAG AA color contrast.

Keyboard focus states visible.

Links/buttons clearly identifiable.

10. Design System Alignment

Maintain Empress Health aesthetic:

Clean wellness-tech style.

Soft neutral backgrounds.

Structured whitespace.

Subtle borders and shadows.

Calm, professional presentation.

No new color palette introduced.

11. Structural Wireframe Example
[Header]

<main>
  Section 1: Page Title + Intro

  Section 2: eBook Grid
    [Guide Card 1]
    [Guide Card 2]
    [Guide Card 3]
    [Guide Card 4]

  Section 3: Additional Info (if present)
</main>

[Footer]

Content order must match live page exactly.

12. Acceptance Criteria

All text matches live page exactly.

Content order unchanged.

Guides rendered in consistent card layout.

Responsive grid works at:

375px

768px

1024px

1440px.

No overflow or layout clipping.

Accessibility standards met.

13. Success Metrics

Improved clarity of guide offerings.

Better mobile usability.

Stronger visual hierarchy.

Consistency with other cleaned Empress pages.

14. Deliverables

Updated semantic HTML structure.

Responsive card-based layout.

Clean CSS implementation.

QA validation confirming zero text changes.