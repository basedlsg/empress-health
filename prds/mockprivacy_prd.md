Product Requirements Document (PRD)

UI Cleanup — Privacy & Data Protection Policy Page
Product: EmpressHealth.ai Privacy Policy
Source: Current policy content as published on the site

1. Objective

Improve the usability, readability, hierarchy, and visual clarity of the Privacy & Data Protection Policy page without altering any of the actual text content.

2. Goals

Present the existing policy text in a cleaner, more modern, and mobile-friendly layout

Improve information hierarchy for faster scanning

Reduce visual clutter (especially navigation and duplicated menu elements near the policy content)

Ensure consistent typography, spacing, and UI conventions

3. User Experience Pain Points (Current)

Based on the live page structure:

Navigation menu is visually heavy and distracts from policy content

Section titles and text run together with little spacing

No sticky or in-page table of contents (TOC) for quick access

Policy blocks are long and lack visual breaks

No clear typography hierarchy (headings, sub-headings, body text)

No responsive enhancements for small screens

4. Requirements
4.1 Global Layout

Non-functional requirement: The policy must be readable on desktop, tablet, and mobile.

Breakpoint	Layout Behavior
Mobile	Single-column, large tap targets
Tablet	Single column with moderate spacing
Desktop	Two-column with optional fixed TOC
4.2 Navigation Cleanup

Collapse or hide the site nav when the policy content is visible (so the text is the focus)

Replace large menu with a compact header

Include a breadcrumb: Home / About Us / Privacy & Data Protection Policy

4.3 Visual Typography System

Apply a scalable typography system:

Element	Style
Page Title	32px bold
Section Titles (e.g., “1. Information We Collect”)	24px semi-bold
Sub-lists	18px regular
Body text	16px regular
Code/Email	Mono font
4.4 In-Page Table of Contents (TOC)

Sticky TOC on desktop (right side)

Accordion TOC on mobile

Clicking a TOC link scrolls to the section

TOC items:

Information We Collect

How We Use Your Information

How We Protect Your Information

Sharing of Information

Your Rights

Confidentiality

Cookies & Analytics

Data Retention

Children’s Privacy

Changes to This Policy

Contact Us

(Current section titles derived from the live page)

4.5 Content Formatting Enhancements

Add generous vertical spacing between sections

Use bulleted lists for list items instead of run-on blocks

Highlight emails and contact details with code-style background

Apply consistent text color and spacing

Add visual separators (thin lines) between major sections

4.6 Mobile-First Considerations

Larger tap areas for links

Collapsible sub-sections on mobile

TOC optimized to expand/collapse

Sticky header only visible on scroll up

4.7 Accessibility

Verify WCAG contrast ratios

Support keyboard navigation through policy sections

Ensure TOC is screen-reader friendly

Mark all headings with proper HTML semantics (<h1>, <h2>, etc.)

5. Design Mockups & States (Summary)
5.1 Initial Desktop View

Minimal header

Left column: policy content

Right column (optional): TOC sticky

5.2 Mobile View

Single column content

Collapsed TOC at top

Expand/collapse section head

5.3 Scroll UX

As user scrolls, highlight current TOC item

6. Success Metrics / KPIs
Metric	Target
Bounce rate on privacy policy page	↓ by 25%
Time on page	↑ by 40%
Scroll depth (reach Contact Us)	↑ 30%
Accessibility audit score	≥ WCAG AA
7. Technical Notes

No JavaScript required for basic layout; light enhancement for TOC sticky behavior

Server must serve the exact same policy text (no edits)

CSS design system reuse from main site

8. Non-Goals

No changes to policy wording or additions of legal content

No redesign of other pages at this stage

No backend logic changes

9. Dependencies

Design system tokens (typography, spacing scales)

Front-end framework (React/Next.js or static HTML/CSS)