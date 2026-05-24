PRD — Visual Cleanup: Team Page

Page: /team
Product: EmpressHealth.ai
Document Type: Frontend Visual / UI PRD
Scope: Presentation-only (CSS / layout polish)
Status: Approved

1. Objective

Improve the visual clarity, professionalism, and emotional trust of the Team page without altering any content or its order.

The goal is to:

Make the team feel credible, warm, and expert-led

Improve scannability and balance

Ensure the page feels consistent with the rest of Empress Health

Deliver a polished desktop and mobile experience

This is a design refinement, not a content update.

2. Non-Negotiable Constraints
Constraint	Requirement
Text content	❌ Must not change
Names / titles	❌ Must not change
Bios	❌ Must not change
Order of people	❌ Must not change
Section order	❌ Must not change
Images	❌ Must not replace
Alignment / spacing	✅ Allowed
Color usage	✅ Allowed
Typography hierarchy	✅ Allowed
Responsive behavior	✅ Allowed
3. Design Principles (Empress Health)

The Team page should feel:

Trustworthy

Human

Calm and composed

Expert-led, not corporate

Avoid:

Loud colors

Aggressive contrast

Tight spacing

“Startup card clutter”

4. Global Styling Requirements
4.1 Color Application (Theme-Only)

Use existing Empress Health colors only:

Page background: Soft ivory / warm off-white

Primary text: Charcoal / deep neutral

Headings: Muted plum / Empress purple

Secondary text: Warm gray

Dividers / borders: Very light neutral

Accents: Warm gold or taupe (sparingly)

❗ No new colors.
❗ No high-contrast black-on-white.

4.2 Typography & Hierarchy

Establish clear visual hierarchy:

Page title: dominant, calm

Team member name: strong but not oversized

Role/title: visually secondary

Bio text: readable, consistent

Increase line-height for bios (≈ 1.6–1.7)

Keep bios left-aligned

Limit max-width of text blocks on desktop

No font changes required unless already defined globally.

5. Page Structure (Visual Only)

⚠️ The DOM order must remain exactly the same.

5.1 Page Header / Introduction (if present)

Allowed Improvements

Center or cleanly align the heading

Add vertical spacing above/below

Improve contrast between background and heading

Keep intro text readable with controlled width

Not Allowed

No copy edits

No new subheadings

5.2 Team Member Blocks

Each team member block should feel balanced and intentional.

Alignment

Ensure consistent alignment across all members:

Image + text alignment should match for every profile

Desktop:

Use grid/flex to align image and text cleanly

Mobile:

Stack image above text

Center image, left-align text

Spacing

Add consistent vertical spacing between team members

Avoid cramped bios

Ensure image and text are not visually competing

5.3 Images (No Replacement)

Allowed

Add consistent image sizing

Add subtle rounding (if brand-consistent)

Improve spacing around images

Ensure images scale cleanly on mobile

Not Allowed

No image swaps

No cropping changes that remove faces

No filters or stylization

5.4 Names, Titles, Bios

Visual Treatment Only

Name: Empress accent color or strong neutral

Title: softer secondary tone

Bio: neutral body text, comfortable spacing

Use color and spacing to create hierarchy — not size alone.

6. Section Separation & Rhythm

Introduce subtle separation between:

Header → team list

Individual team members

Use:

Whitespace first

Light dividers only if necessary

Avoid boxed “cards” unless already present

The page should feel editorial, not tiled.

7. Responsive Requirements
Breakpoints

Mobile: ≤ 820px

Tablet: 821–1024px

Desktop: ≥ 1025px

Mobile

Single-column layout

Comfortable padding (no edge-hugging text)

Images centered, bios easy to read

Desktop

Limit text width for bios

Maintain consistent vertical rhythm

Avoid overly wide layouts

No horizontal scrolling at any size.

8. Accessibility

Maintain WCAG AA color contrast

Preserve heading semantics

Images must have alt text (existing)

No information conveyed by color alone

9. Success Criteria

The cleanup is successful if:

The team feels credible and warm

Bios are easy to read without visual fatigue

Page looks intentional on mobile and desktop

No one can tell content was untouched — only improved

10. Explicitly Out of Scope

Editing bios

Rewriting titles

Changing team order

Adding social links

Adding animations or interactivity

Adding new team members

11. Implementation Notes

Prefer CSS-only changes

Light wrapper divs allowed (no DOM reorder)

No backend or CMS changes required