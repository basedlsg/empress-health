Product Requirements Document (PRD)
Layout Cleanup – Menopause Month Page

Project: EmpressHealth.ai
Page: /menopausemonth
Scope: UI/Layout Only (No Content Edits)

1. Project Overview

The Menopause Month page appears to function as a campaign or awareness landing page. The objective is to improve visual hierarchy, readability, content grouping, and responsiveness while preserving all existing text exactly as written.

The redesign will:

Improve scannability of campaign messaging

Strengthen hero-to-content transition

Improve section rhythm and whitespace

Enhance mobile readability

Maintain emotional tone and brand consistency

All copy must remain unchanged.

2. Objectives

Improve visual hierarchy and content grouping.

Enhance clarity of awareness messaging.

Strengthen section separation.

Improve mobile layout.

Maintain brand tone and campaign integrity.

Preserve all text verbatim.

3. Non-Negotiable Constraints

No changes to wording.

No reordering of content.

No rewriting or editing.

No removal of text.

No addition of new copy.

No altering of CTA text.

No backend logic changes.

Header and footer remain untouched.

4. Layout Problems to Address (Typical for Campaign Pages)

Hero section lacks strong visual separation.

Dense paragraphs without sufficient whitespace.

Weak visual hierarchy between headings and body.

Insufficient separation between informational blocks.

Poor mobile spacing.

CTA not clearly distinguished (if present).

5. Structural Layout Requirements
5.1 Page Wrapper

Wrap entire body content inside:

<main class="menopause-month">

Use centered max-width container:

Desktop max width: ~1100px

Tablet: fluid with side padding

Mobile padding: 24px

5.2 Hero Section

First section should be visually distinct.

Requirements:

Large H1 emphasis.

Generous vertical padding (80px top & bottom).

Clear visual separation from next section.

If background image exists, maintain but improve text contrast.

Do NOT change hero text.

5.3 Section Grouping

Each logical content group must be wrapped in:

<section class="campaign-section">

Spacing:

60px vertical padding between sections.

32px internal padding where appropriate.

24px spacing between paragraphs.

Alternate subtle background color between major sections to improve rhythm (very light tonal shift only).

5.4 Typography Hierarchy

Preserve existing headings but enforce consistent visual scale:

Element	Styling Requirement
H1	Strong campaign headline
H2	Major section titles
H3	Subsection headings
Body	16–18px, 1.5–1.6 line-height

Rules:

Do not skip heading levels.

Limit line width to 65–75 characters.

Maintain left alignment for body text.

Increase spacing above headings.

5.5 Content Blocks

If page contains:

Informational segments

Statistics

Awareness bullet points

Support resources

CTA blocks

They should be structured as:

Option A: Card Layout

Subtle border

Light shadow

24–32px internal padding

Rounded corners (8–12px)

OR

Option B: Alternating Section Blocks

Slight background contrast

No structural reordering allowed.

5.6 Call-to-Action (If Present)

Visually separated from informational content.

Add spacing above and below CTA.

Full-width on mobile.

Maintain original CTA text exactly.

6. Responsive Requirements
Mobile (<768px)

Single-column layout.

Generous padding.

Clear section separation.

Buttons minimum 44px height.

Avoid dense text stacking.

Tablet (768–1024px)

Optional two-column layout for balanced sections if appropriate.

Maintain clear spacing.

Desktop (>1024px)

Centered layout.

Balanced whitespace.

Avoid overly long line length.

7. Accessibility Requirements

Semantic heading hierarchy (H1 → H2 → H3).

Accessible color contrast (WCAG AA).

Clear keyboard focus states.

Use proper <ul> and <li> for lists.

Decorative visuals marked aria-hidden.

8. Visual Direction

Align with Empress Health brand:

Calm, supportive, empowering tone.

Soft neutral backgrounds.

Structured whitespace.

Clean wellness-tech aesthetic.

No loud gradients or aggressive visuals.

No new color palette introduced.

9. Structural Wireframe Example
[Header]

<main>
  Section 1: Hero (Campaign Headline + Intro)

  Section 2: Educational Content Block

  Section 3: Awareness / Key Points

  Section 4: Supporting Resources

  Section 5: CTA / Engagement Section
</main>

[Footer]

Content order must remain identical to live page.

10. Acceptance Criteria

All text matches live page exactly.

Content order unchanged.

Clear visual hierarchy implemented.

Proper section spacing (60px vertical).

Responsive at:

375px

768px

1024px

1440px

No overflow or clipping.

Accessibility standards met.

11. Success Metrics

Improved campaign readability.

Increased time on page.

Improved mobile engagement.

Stronger visual consistency across Empress pages.

12. Deliverables

Updated semantic HTML structure.

Responsive CSS layout.

QA confirmation of zero text changes.

Clean visual hierarchy implementation.