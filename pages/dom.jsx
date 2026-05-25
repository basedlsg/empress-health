/* global React, Nav, Footer */
// Design Preview Hub — Empress Health · Empathetic Elegance
// Internal team tool: compare all /r/* redesigned routes against legacy.

const PREVIEW_ROUTES = [
  {
    slug: 'home',
    route: '/r/home',
    title: 'Home',
    desc: 'The Sanctuary hero — primary landing with portrait + editorial headline.',
    tone: 'lavender',
  },
  {
    slug: 'our-program',
    route: '/r/our-program',
    title: 'Our Program',
    desc: 'Twelve-week arc presented as a three-chapter editorial magazine spread.',
    tone: 'cream',
  },
  {
    slug: 'health-assessment',
    route: '/r/health-assessment',
    title: 'Health Assessment',
    desc: 'Assessment landing with 10-domain radar preview and report sample.',
    tone: 'tan',
  },
  {
    slug: 'community',
    route: '/r/community',
    title: 'Join the Community',
    desc: 'Pod-based community page with member stories and invite flow.',
    tone: 'lavender',
  },
  {
    slug: 'marketplace',
    route: '/r/marketplace',
    title: 'Curated Marketplace',
    desc: 'Glass-card category grid: Bundles, Supplements, Self-Care Tools.',
    tone: 'cream',
  },
  {
    slug: 'education',
    route: '/r/education',
    title: 'Education',
    desc: 'Editorial article grid — expert blogs, e-books, Menopause Month hub.',
    tone: 'tan',
  },
  {
    slug: 'stories',
    route: '/r/stories',
    title: 'Community Stories',
    desc: 'Long-form member narratives in magazine editorial layout.',
    tone: 'lavender',
  },
  {
    slug: 'about',
    route: '/r/about',
    title: 'About Us',
    desc: 'Founder\'s letter, team grid, and the origin story of Empress Health.',
    tone: 'cream',
  },
  {
    slug: 'faq',
    route: '/r/faq',
    title: 'FAQ',
    desc: 'Accordion Q&A with category filters and a live search field.',
    tone: 'tan',
  },
];

const TONE_COLORS = {
  lavender: 'rgba(232,222,250,0.55)',
  cream:    'rgba(247,232,218,0.45)',
  tan:      'rgba(231,216,198,0.55)',
};

function DesignHub() {
  return (
    <div data-screen-label="Design Preview Hub" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      {/* Orb atmosphere */}
      <div style={{
        position: 'absolute', top: -120, right: -160, width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(214,188,243,0.20) 0%, rgba(214,188,243,0) 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: -100, width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,222,196,0.16) 0%, rgba(247,222,196,0) 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={0} base="" />
      </div>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '80px 64px 60px', zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="mono" style={{ color: 'var(--gold)', marginBottom: 20 }}>INTERNAL · DESIGN PREVIEW · EMPATHETIC ELEGANCE V1.0</div>
          <h1 className="headline" style={{ margin: 0, fontSize: 'clamp(36px, 4vw, 64px)', maxWidth: 720 }}>
            Empress, <em className="italic-emph">redesigned.</em>
          </h1>
          <p className="body-lg" style={{ marginTop: 20, maxWidth: 600, color: 'var(--ink-soft)' }}>
            This hub links every page rebuilt under the Empathetic Elegance design system — cream surfaces, Bodoni Moda headlines, inline citations. Compare each against its legacy counterpart to confirm the system is working as intended before cutover.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 40, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
              <span className="mono" style={{ color: 'var(--ink-faint)' }}>9 ROUTES · ALL LIVE AT /r/*</span>
            </div>
            <span className="chip" style={{ fontSize: 10 }}>
              <span className="dot" />TEAM ONLY
            </span>
          </div>
        </div>
      </section>

      {/* Gold rule */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 64px' }}>
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
      </div>

      {/* Route grid — 3 columns */}
      <section style={{ padding: '60px 64px 140px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 22,
          }}>
            {PREVIEW_ROUTES.map((page, i) => (
              <div
                key={page.slug}
                className="glass"
                style={{
                  padding: '28px 28px 24px',
                  borderRadius: 18,
                  backgroundColor: TONE_COLORS[page.tone],
                  display: 'flex', flexDirection: 'column', gap: 0,
                  position: 'relative',
                }}
              >
                {/* Number */}
                <span className="mono" style={{ color: 'var(--gold)' }}>{String(i + 1).padStart(2, '0')}</span>

                {/* Title */}
                <h2 style={{
                  margin: '12px 0 8px',
                  fontFamily: 'var(--font-display)', fontWeight: 500,
                  fontSize: 22, color: 'var(--plum)', lineHeight: 1.2,
                }}>
                  {page.title}
                </h2>

                {/* Route badge */}
                <div className="mono" style={{ color: 'var(--ink-faint)', marginBottom: 14 }}>{page.route}</div>

                {/* Description */}
                <p className="body-md" style={{ margin: '0 0 24px', color: 'var(--ink-soft)', lineHeight: 1.65 }}>
                  {page.desc}
                </p>

                {/* Gold rule */}
                <span className="gold-rule" style={{ marginBottom: 18 }} />

                {/* Links row */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 'auto' }}>
                  <a
                    href={page.route}
                    className="btn btn-primary"
                    style={{ fontSize: 13, padding: '9px 18px' }}
                  >
                    View redesign →
                  </a>
                  <a
                    href={`/${page.slug === 'home' ? '' : page.slug}`}
                    className="btn btn-text"
                    style={{ fontSize: 13 }}
                  >
                    Legacy ↗
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* System notes */}
          <div style={{
            marginTop: 60,
            padding: '28px 32px',
            borderRadius: 14,
            background: 'var(--surface-cream)',
            border: '1px solid rgba(74,54,100,0.08)',
          }}>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 12 }}>SYSTEM · DESIGN TOKENS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {[
                ['Fonts', 'Bodoni Moda · Plus Jakarta · JetBrains Mono'],
                ['Surfaces', 'Cream #fff8f5 · Never pure white'],
                ['Accent', 'Plum #33204c · Gold as lines only'],
                ['Citations', 'Inline · JetBrains Mono · Gold · Always visible'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="mono" style={{ color: 'var(--ink-faint)', marginBottom: 4 }}>{k}</div>
                  <div className="body-md" style={{ color: 'var(--ink)', lineHeight: 1.5 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
