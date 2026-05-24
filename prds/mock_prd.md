# Empress Health — Mock Frontend Design PRD (Noom‑Inspired)

**Product:** Empress Health Web Platform

**Document Type:** Frontend Design Product Requirements Document (PRD)

**Owner:** Norvell Robinson

**Version:** v1.0

**Last Updated:** 2026-01-09

---

## 1. Objective

Design and implement a modern, conversion‑focused frontend experience for Empress Health inspired by the clarity, warmth, and guided‑journey UX of Noom.com, while maintaining Empress brand identity (premium, supportive, empowering, culturally inclusive).

Primary goals:

* Maximize trust and credibility
* Clearly communicate value within first 5 seconds
* Drive users into guided onboarding and AI chat
* Support seamless transition to subscription and product discovery

---

## 2. Design Principles (Noom‑Inspired)

### 2.1 Tone & Emotional Cues

* Friendly, empathetic, non‑clinical
* Encouraging and empowering language
* Conversational microcopy

### 2.2 Visual Style

* Light backgrounds (off‑white, soft gradients)
* High‑contrast but soft typography
* Rounded UI components
* Subtle animations and transitions

### 2.3 UX Philosophy

* Step‑by‑step progression
* Minimal cognitive load
* Clear calls‑to‑action at all times
* Mobile‑first but desktop‑polished

---

## 3. Global Layout & Navigation

### 3.1 Header

**Desktop:**

* Left: Empress Health logo
* Center or right: Primary navigation

  * How It Works
  * Programs
  * Shop
  * About
* Right: Primary CTA button: “Get Started”

**Mobile:**

* Logo left
* Hamburger menu right
* Sticky bottom CTA bar optional

### 3.2 Footer

* Company info
* Privacy Policy
* Medical Disclaimer
* Contact
* Social links

---

## 4. Homepage Requirements

### 4.1 Hero Section

**Purpose:** Immediate emotional connection + value proposition

**Structure:**

* Left: Headline + subheadline
* Right: Lifestyle imagery (diverse women, calm settings)

**Copy Style:**

* Headline: Outcome‑focused ("Feel like yourself again")
* Subheadline: Support + science + personalization

**Primary CTA:**

* “Start Your Free Chat” or “Take the First Step”

**Secondary CTA:**

* “How It Works”

---

### 4.2 Social Proof Section

* Testimonials
* Short quotes
* Trust badges or press mentions (future)

Layout:

* Card‑based, horizontally scrollable on mobile

---

### 4.3 How It Works (Guided Flow)

Step cards:

1. Tell us what you’re feeling
2. Chat with Empress AI
3. Get a personalized plan

Each step includes:

* Icon or illustration
* 1–2 lines of copy

---

### 4.4 Programs / Solutions Overview

Cards for:

* Hormone Balance
* Sleep Support
* Weight Management
* Mental Wellness

Each card:

* Soft background
* Short benefit statement
* CTA: “Explore”

---

### 4.5 Product Preview (Empress Naturals)

* Featured products carousel
* Benefit‑driven descriptions
* CTA: “Shop Recommended Products”

---

### 4.6 Final Conversion Block

* Reinforce emotional outcome
* Repeat primary CTA

---

## 5. Onboarding & Funnel Design

(Noom‑style multi‑step flow)

### 5.1 Entry Point

Triggered by:

* Homepage CTA
* Product recommendation

Redirects to:

* Fullscreen guided flow

---

### 5.2 Question Flow

* 5–10 steps max
* Single question per screen
* Progress indicator

Question Types:

* Multiple choice
* Sliders
* Yes/No

Topics:

* Symptoms
* Goals
* Lifestyle

---

### 5.3 Account Creation

Appears after value demonstration:

* “Save your plan” prompt
* Email + password
* Optional Google login (future)

---

### 5.4 Paywall Placement

After:

* Initial AI insights
* Preview of recommendations

Design:

* Clear value summary
* Monthly vs annual plans
* Testimonials near pricing

---

## 6. AI Chat Interface Design

### 6.1 Layout

* Chat bubble UI
* Friendly avatar for Empress
* Typing indicators

---

### 6.2 Chat UX Requirements

* Auto‑scroll
* Suggested quick replies
* Follow‑up questions

---

### 6.3 Product Integration

* Inline product cards
* Expandable details
* Deep links to Shopify

---

## 7. Educational Content UX

### 7.1 Content Hub

* Category filters
* Search
* Featured guides

---

### 7.2 Article Layout

* Large readable typography
* Highlighted tips
* Inline CTAs to chat or products

---

## 8. E‑Commerce UX Integration

### 8.1 Product Pages

* Benefits first
* Ingredient transparency
* Reviews
* Medical disclaimer block

---

### 8.2 Cross‑Selling

* “Recommended for you” sections
* Bundles highlighted

---

## 9. Accessibility & Performance

### 9.1 Accessibility

* WCAG 2.1 AA target
* High contrast ratios
* Keyboard navigation
* Screen reader labels

---

### 9.2 Performance

* LCP under 2.5s
* Optimized images
* Lazy loading for below‑the‑fold

---

## 10. Responsive Design Requirements

### Breakpoints

* Mobile: ≤ 640px
* Tablet: 641px – 1024px
* Desktop: 1025px – 1440px
* Large screens: ≥ 1441px

All layouts must:

* Maintain readable line lengths
* Avoid text overlapping hero images
* Preserve CTA visibility

---

## 11. Technical Implementation

### 11.1 Framework

* Next.js App Router
* Tailwind CSS
* Component library with design tokens

---

### 11.2 Animations

* Framer Motion
* Used for:

  * Step transitions
  * CTA emphasis
  * Page entry

---

### 11.3 CMS (Optional Phase 2)

* Headless CMS for articles
* Static regeneration

---

## 12. Brand Alignment

Must align with Empress brand:

* Purple and gold accents
* Premium feel
* Inclusive imagery
* Calm, supportive tone

Avoid:

* Medicalized or sterile design
* Overly aggressive sales language

---

## 13. Deliverables

Design team must provide:

* Figma desktop layouts
* Mobile‑first variants
* Component library
* Interaction prototypes

Engineering must provide:

* Reusable UI components
* Layout templates
* A/B testing hooks

---

## 14. Risks & Mitigations

### Risk: Over‑complex onboarding

Mitigation: Cap steps, test drop‑off

### Risk: Slow hero load times

Mitigation: Optimized responsive images

### Risk: Trust barriers

Mitigation: Testimonials, disclaimers, transparency

---

## 15. Open Questions

* Final color palette tuning
* Subscription pricing display format
* Regulatory language placement
* Multilingual rollout timing

---
