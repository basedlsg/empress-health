/* global React, Nav, Footer, Placeholder */
// Marketplace Landing — Empress Health · Empathetic Elegance

const CATEGORIES = [
  {
    slug: 'bundlesandkits',
    href: '/bundlesandkits',
    label: 'I.',
    title: 'Bundles',
    subtitle: '& Kits',
    desc: 'Complete protocol kits assembled by our NAMS-certified team. Each bundle addresses one domain — sleep, heat, mood, or energy — with every product validated against your HIS report.',
    cta: 'Shop Bundles →',
    tone: 'lavender',
    tint: 'rgba(232,222,250,0.58)',
    cite: 'CURATED · HIS DOMAIN MAPPING · CHUNK-014',
  },
  {
    slug: 'supplements',
    href: '/supplements',
    label: 'II.',
    title: 'Supplements',
    subtitle: '& Botanicals',
    desc: 'Non-HRT options reviewed by our clinical team for evidence quality, not sales volume. Every supplement page links to the research that supports the claim.',
    cta: 'Shop Supplements →',
    tone: 'cream',
    tint: 'rgba(247,232,218,0.58)',
    cite: 'EVIDENCE-GRADED · NAMS REVIEW · MMXXVI',
  },
  {
    slug: 'selfcaretools',
    href: '/selfcaretools',
    label: 'III.',
    title: 'Self-Care',
    subtitle: 'Tools',
    desc: 'Devices, trackers, and home tools that integrate with your weekly clinician check-ins. No gimmicks — if it does not have a plausible mechanism, we do not carry it.',
    cta: 'Shop Tools →',
    tone: 'tan',
    tint: 'rgba(231,216,198,0.58)',
    cite: 'CLINICALLY REVIEWED · MECHANISM-FIRST · MMXXVI',
  },
];

function Market() {
  return (
    <div data-screen-label="Marketplace" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      {/* Orb atmosphere */}
      <div style={{
        position: 'absolute', top: -160, right: -180, width: 640, height: 640, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(214,188,243,0.20) 0%, rgba(214,188,243,0) 68%)',
        filter: 'blur(65px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: 400, left: -120, width: 520, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,222,196,0.16) 0%, rgba(247,222,196,0) 70%)',
        filter: 'blur(55px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={4} base="" />
      </div>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '80px 64px 70px', zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'end' }}>
          <div>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 20 }}>CURATED MARKETPLACE · MMXXVI</div>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(48px, 5.2vw, 90px)', lineHeight: 0.97 }}>
              The{' '}
              <em className="italic-emph">marketplace.</em>
            </h1>
            <p className="body-lg" style={{ marginTop: 28, maxWidth: 520, color: 'var(--ink-soft)' }}>
              Three categories. Clinician-reviewed. No affiliate noise — every item earns its place on this shelf because our team would recommend it to their own patients.
            </p>
          </div>

          {/* Right: stat rail */}
          <div style={{ paddingLeft: 40, borderLeft: '1px solid rgba(74,54,100,0.10)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {[
                ['100%', 'clinician-reviewed', 'Every product on this shelf has been assessed by a NAMS-certified practitioner.'],
                ['0', 'affiliate arrangements', 'We do not earn commissions. Curation is conflict-free.'],
                ['3', 'categories', 'Bundles, Supplements, and Self-Care Tools — nothing more, for now.'],
              ].map(([n, label, note]) => (
                <div key={label}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 40, color: 'var(--plum)', lineHeight: 1 }}>{n}</span>
                    <span className="mono" style={{ color: 'var(--ink-soft)' }}>{label}</span>
                  </div>
                  <p className="body-md" style={{ margin: 0, color: 'var(--ink-faint)', lineHeight: 1.6 }}>{note}</p>
                </div>
              ))}
            </div>
            <div className="mono" style={{ marginTop: 28, color: 'var(--gold)', borderTop: '1px solid rgba(201,165,96,0.20)', paddingTop: 16 }}>
              SOURCES · PRODUCT CATALOG · CHUNK-CATALOG-001
            </div>
          </div>
        </div>
      </section>

      {/* Gold rule */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 64px' }}>
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
      </div>

      {/* ── THREE CATEGORY CARDS ──────────────────────────────── */}
      <section style={{ padding: '80px 64px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="mono" style={{ color: 'var(--plum)', marginBottom: 40 }}>THREE CATEGORIES</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {CATEGORIES.map((cat) => (
              <a
                key={cat.slug}
                href={cat.href}
                className="glass"
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: '36px 32px 28px',
                  borderRadius: 22,
                  backgroundColor: cat.tint,
                  textDecoration: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  minHeight: 420,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Roman numeral */}
                <div style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400,
                  fontSize: 56, color: 'var(--gold)', lineHeight: 1, marginBottom: 8,
                }}>{cat.label}</div>

                <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 32, color: 'var(--plum)', lineHeight: 1.1 }}>
                  {cat.title}<br />
                  <em style={{ fontStyle: 'italic', color: 'var(--plum-mid)' }}>{cat.subtitle}</em>
                </h2>

                <span className="gold-rule" style={{ margin: '22px 0' }} />

                <p className="body-md" style={{ margin: '0 0 auto', color: 'var(--ink-soft)', lineHeight: 1.75 }}>
                  {cat.desc}
                </p>

                <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, color: 'var(--plum)',
                  }}>{cat.cta}</span>
                </div>

                <div className="mono" style={{ marginTop: 18, color: 'var(--gold)', borderTop: '1px solid rgba(201,165,96,0.18)', paddingTop: 12 }}>
                  {cat.cite}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDITOR'S LETTER ──────────────────────────────────── */}
      <section style={{
        padding: '100px 64px 120px',
        background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 50%, var(--surface) 100%)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'start' }}>
          {/* Left rail */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>Editor's letter.</span>
              <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            </div>
            <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(28px, 3vw, 48px)' }}>
              Curated by clinicians, <em className="italic-emph">not algorithms.</em>
            </h2>
            <div className="mono" style={{ marginTop: 28, color: 'var(--gold)' }}>
              A. KAPLAN, MD · CLINICAL DIRECTOR · MMXXVI
            </div>
          </div>

          {/* Right — editorial paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p className="body-lg" style={{ margin: 0, color: 'var(--ink)' }}>
              Every product you see in this marketplace arrived here the same way: a member mentioned it, a clinician reviewed the evidence, and we either added it or did not. There is no brand deal that opens the door. There is no "featured listing" that can be purchased. The only criterion is whether we would recommend it to our own patients.
            </p>
            <p className="body-md" style={{ margin: 0, color: 'var(--ink-soft)' }}>
              We keep the catalogue intentionally small. More is not better. The signal matters more than the selection size. When a product is removed — and some are, quarterly — we say so and explain why. Curation is an ongoing act, not a one-time decision.
            </p>
            <p className="body-md" style={{ margin: 0, color: 'var(--ink-soft)' }}>
              We do not earn commissions. We do not have affiliate arrangements. This matters because recommendations made under financial pressure are not recommendations — they are advertising. You deserve better than that.
            </p>
            <div className="mono" style={{ color: 'var(--gold)', borderTop: '1px solid rgba(201,165,96,0.20)', paddingTop: 16 }}>
              CURATION POLICY · EMPRESS HEALTH · CONFLICT-FREE · MMXXVI
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{ padding: '0 64px 120px', position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          borderRadius: 28,
          background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)',
          padding: '60px 64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap',
          border: '1px solid rgba(255,255,255,0.5)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -80, right: -60, width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'relative' }}>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 14 }}>YOUR REPORT MATCHES THE SHELF</div>
            <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(28px, 3vw, 48px)', color: 'var(--plum)' }}>
              Start with the assessment.<br />
              <em className="italic-emph">The right products follow.</em>
            </h2>
          </div>
          <div style={{ position: 'relative', display: 'flex', gap: 14, flexWrap: 'wrap', flexShrink: 0 }}>
            <a href="/assessment/" className="btn btn-primary">Take the assessment →</a>
            <a href="/bundlesandkits" className="btn" style={{ background: 'rgba(255,252,248,0.65)', color: 'var(--plum)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.7)' }}>Browse all products</a>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
