PRD — Founder Story Page Visual Cleanup

Page: /founderstory
Product: EmpressHealth.ai
Document Type: Frontend Visual / UI PRD
Status: Approved (Non-content, non-structural changes only)

1. Objective

Improve the visual clarity, alignment, and emotional tone of the Founder Story page without altering any text or content order.

The goal is to:

Make the page easier to read

Improve perceived quality and trust

Better reflect Empress Health’s brand (calm, expert, compassionate)

Ensure strong desktop and mobile presentation

This is a pure presentation refactor, not a rewrite.

2. Non-Negotiable Constraints
Constraint	Status
Text content	❌ Must not change
Content order	❌ Must not change
Section presence	❌ Must not change
Tone/voice	❌ Must not change
Layout alignment	✅ Allowed
Color usage	✅ Allowed
Typography scale	✅ Allowed
Spacing / rhythm	✅ Allowed
Responsive behavior	✅ Allowed
3. Design Principles (Empress Health Theme)

The page should feel:

Calm, not clinical

Premium, not flashy

Personal, not cluttered

Readable first, emotional second

Visual inspiration keywords:

Soft ivory backgrounds · muted plum accents · warm neutrals · generous whitespace · editorial calm

4. Global Styling Requirements
4.1 Color Palette (No new colors outside theme)

Use existing Empress Health brand colors only, applied consistently:

Primary background: Soft ivory / off-white

Primary text: Deep neutral (charcoal / soft black)

Accent color: Empress plum / muted purple

Secondary accent: Warm gold or taupe (sparingly)

Dividers / borders: Very light neutral lines (low contrast)

❗ Avoid high-contrast black-on-white or saturated colors.

4.2 Typography (Hierarchy Only — Same Text)

Establish clear typographic hierarchy:

Page title: visually dominant

Section headings: distinct but calm

Body text: consistent size and line height

Increase line-height for body text to improve readability

Limit max line width for long paragraphs on desktop (≈ 65–75 characters)

Use consistent text alignment (left-aligned for body text)

No font changes required unless already defined globally.

4.3 Spacing & Rhythm

Apply a consistent spacing system:

Increase vertical spacing between paragraphs

Add clear separation between sections

Avoid text blocks touching images or edges

Mobile spacing should be tighter but never cramped

Whitespace is intentional — not empty.

5. Section-by-Section Visual Requirements

(Content order remains EXACTLY as-is)

5.1 Hero / Top Section

Allowed Changes

Center or align the headline and subheading more intentionally

Improve contrast between background and text

Add breathing room above and below headline

Ensure the founder image (if present) is:

Properly aligned

Not overpowering text

Scales gracefully on mobile

Not Allowed

No headline edits

No rewording

No reordering

5.2 Founder Letter / Long-Form Text

This is the most critical section.

Requirements

Break long visual blocks using spacing (not text edits)

Maintain a readable column width on desktop

Increase line height for emotional readability

Ensure consistent left alignment

Use subtle color differentiation for emphasis lines (if present)

Optional (Visual Only)

Introduce a soft background tint behind the letter section

Add a subtle vertical divider or margin cue on desktop

5.3 Bullet / List Content (If Present)

Requirements

Align bullets consistently

Improve spacing between items

Use subtle accent color for bullet markers or icons

Ensure bullets wrap cleanly on mobile

Not Allowed

No bullet text changes

No bullet order changes

5.4 Signature / Closing Section

Requirements

Give the signature area visual importance through spacing

Center or softly align the signature for emotional weight

Use accent color subtly for name/signature (not body text)

Add separation from preceding text

This section should feel personal and intentional, not appended.

6. Responsive Behavior
Breakpoints

Mobile: ≤ 820px

Tablet: 821px–1024px

Desktop: ≥ 1025px

Mobile Rules

Single-column layout

Full-width text with comfortable padding

Images centered and scaled down

No horizontal scrolling

Desktop Rules

Limit line width for text-heavy sections

Images aligned to reinforce reading flow

Balanced margins on left/right

7. Accessibility Requirements

Maintain WCAG AA color contrast

No text placed over low-contrast backgrounds

Proper heading semantics preserved

No reliance on color alone for meaning

8. Success Criteria

The cleanup is successful if:

The page feels lighter and calmer

Text is easier to read without scrolling fatigue

Mobile experience feels intentional, not compressed

No stakeholder notices content changes — only quality improvement

9. Explicitly Out of Scope

Copy edits

Content rewrites

Section rearrangement

New components or CTAs

Animations beyond subtle hover/focus states

10. Implementation Notes

This PRD is intended for:

CSS-only or light HTML wrapper adjustments

No backend changes

No CMS/content updates