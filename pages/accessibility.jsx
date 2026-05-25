/* global React, Nav, Footer */
// Accessibility Statement — Empress Health · Empathetic Elegance

const A11Y_SECTIONS = [
  {
    num: '01',
    title: 'Our WCAG AA Commitment',
    body: 'Empress Health is committed to ensuring our platform is accessible to everyone, including people with disabilities. We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. This means every page is designed to meet minimum contrast ratios, provide text alternatives for non-text content, and support a logical reading and interaction order.',
  },
  {
    num: '02',
    title: 'Keyboard Navigation',
    body: 'All interactive elements on the Empress Health platform — navigation menus, forms, buttons, and assessment flows — are fully operable using a keyboard alone. We use visible focus indicators so keyboard users always know where they are on the page. Skip-to-content links appear at the top of every page to allow bypass of repetitive navigation blocks.',
  },
  {
    num: '03',
    title: 'Screen Reader Support',
    body: 'Our pages use semantic HTML5 elements and ARIA landmarks (header, nav, main, footer) so that screen readers can navigate efficiently. Interactive components include appropriate ARIA roles, states, and properties. Form inputs are programmatically associated with their labels, and error messages are linked to the fields they describe so assistive technology announces them correctly.',
  },
  {
    num: '04',
    title: 'Known Limitations',
    body: 'We are a growing platform and some areas are still being improved. Our clinical assessment SPA and PDF report viewer may not yet meet all Level AA criteria in every assistive-technology combination. We are actively auditing these areas and prioritise fixes in each release cycle. Where a feature is inaccessible, an accessible alternative is available on request.',
  },
  {
    num: '05',
    title: 'Contact Us About Access',
    body: null,
    extra: (
      <p className="body-md" style={{ margin: 0, color: 'var(--ink)', lineHeight: 1.8 }}>
        If you encounter any barrier while using the Empress Health platform, or if you need content in a different format, please contact us at{' '}
        <a href="mailto:support@empresshealth.ai" style={{ color: 'var(--plum)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          support@empresshealth.ai
        </a>. We take every accessibility report seriously and will respond within five business days with either a resolution or a timeline for one.
      </p>
    ),
  },
];

function Accessibility() {
  return (
    <div data-screen-label="Accessibility" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      {/* Orb atmosphere */}
      <div style={{
        position: 'fixed', top: -150, right: -120, width: 520, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(214,188,243,0.16) 0%, rgba(214,188,243,0) 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: -180, left: -100, width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,222,196,0.14) 0%, rgba(247,222,196,0) 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={0} base="" />
      </div>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '80px 64px 60px', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="mono" style={{ color: 'var(--gold)', marginBottom: 20 }}>ACCESSIBILITY · MMXXVI</div>
          <h1 className="headline" style={{ margin: 0, fontSize: 'clamp(36px, 4vw, 64px)' }}>
            Built for <em className="italic-emph">everyone.</em>
          </h1>
          <p className="body-lg" style={{ marginTop: 20, maxWidth: 560, color: 'var(--ink-soft)' }}>
            Menopause does not discriminate, and neither should the tools built to support it. Our accessibility commitment is not a compliance checkbox — it is part of building a platform that genuinely serves every woman.
          </p>
          <div style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 40, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>WCAG 2.1 AA TARGET · 5 SECTIONS · LAST UPDATED MMXXVI</span>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 64px' }}>
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
      </div>

      {/* Body */}
      <section style={{ padding: '60px 64px 120px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {A11Y_SECTIONS.map((sec, i) => (
            <div key={sec.num} style={{ paddingTop: 48, paddingBottom: 48, borderBottom: i < A11Y_SECTIONS.length - 1 ? '1px solid rgba(74,54,100,0.08)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 20 }}>
                <span className="mono" style={{ color: 'var(--gold)', minWidth: 26 }}>{sec.num}</span>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(18px, 2.2vw, 26px)', color: 'var(--plum)' }}>
                  {sec.title}
                </h2>
              </div>
              {sec.body && <p className="body-md" style={{ margin: 0, color: 'var(--ink)', lineHeight: 1.8 }}>{sec.body}</p>}
              {sec.extra && sec.extra}
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 720, margin: '48px auto 0' }}>
          <div className="mono" style={{ color: 'var(--gold)', borderTop: '1px solid rgba(201,165,96,0.25)', paddingTop: 18 }}>
            EMPRESS HEALTH · ACCESSIBILITY STATEMENT · WCAG 2.1 AA · MMXXVI
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
