/* global React */
// Shared primitives for Empress Health redesign variations.

// ── Placeholder image with monospace label ──────────────────────────────
function Placeholder({ label, width, height, tone = 'cream', radius = 20, style = {} }) {
  const tones = {
    cream:    { bg: '#f3e8d8', stripe: 'rgba(74,54,100,0.06)', text: '#4a3664' },
    lavender: { bg: '#e8defa', stripe: 'rgba(74,54,100,0.08)', text: '#33204c' },
    plum:     { bg: '#3a2855', stripe: 'rgba(255,255,255,0.05)', text: '#d6bcf3' },
    tan:      { bg: '#e7d8c6', stripe: 'rgba(74,54,100,0.05)', text: '#4a3664' },
  };
  const t = tones[tone] || tones.cream;
  return (
    <div
      style={{
        width, height, borderRadius: radius,
        background: `repeating-linear-gradient(135deg, ${t.bg} 0, ${t.bg} 22px, ${t.stripe} 22px, ${t.stripe} 23px)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px rgba(74,54,100,0.06)',
        ...style,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 80% at 50% 30%, ${t.bg}cc 0%, transparent 75%)` }} />
      <div style={{
        position: 'relative', fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: t.text, opacity: 0.7,
        padding: '6px 12px', borderRadius: 999,
        background: 'rgba(255,252,248,0.7)', backdropFilter: 'blur(6px)',
        border: '1px solid rgba(74,54,100,0.08)',
        textAlign: 'center', maxWidth: '70%',
      }}>{label}</div>
    </div>
  );
}

// ── Crown wordmark ──────────────────────────────────────────────────────
function CrownLogo({ size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 44 24" fill="none" aria-hidden>
      <path d="M2 22 L6 6 L14 14 L22 4 L30 14 L38 6 L42 22 Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <circle cx="6" cy="6" r="1.6" fill={color}/>
      <circle cx="22" cy="4" r="1.8" fill={color}/>
      <circle cx="38" cy="6" r="1.6" fill={color}/>
    </svg>
  );
}

function Wordmark({ color = 'var(--plum)' }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, gap: 2 }}>
      <CrownLogo size={28} color={color} />
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 600,
        letterSpacing: '0.16em', fontSize: 22, color,
      }}>EMPRESS</span>
    </div>
  );
}

// ── Navigation — refined editorial nav (minimal, single row, gold accents) ──
const DEFAULT_NAV_LINKS = [
  { label: 'Home',                       href: 'index.html' },
  { label: 'Our Program',                href: 'pages/our-program.html' },
  { label: 'Get your Health Assessment', href: 'pages/health-assessment.html' },
  { label: 'Join the Community',         href: 'pages/community.html' },
  { label: 'Curated Marketplace',        href: 'pages/marketplace.html' },
  { label: 'Education',                  href: 'pages/education.html' },
  { label: 'Community Stories',          href: 'pages/stories.html' },
  { label: 'About Us',                   href: 'pages/about.html' },
  { label: 'FAQ',                        href: 'pages/faq.html' },
];

function Nav({ variant = 'inline', activeIdx = 0, links, base = '' }) {
  // Normalize: accept either array of strings or {label, href}.
  const raw = links || DEFAULT_NAV_LINKS;
  const items = raw.map((it) =>
    typeof it === 'string' ? { label: it, href: '#' } : it
  );
  // `base` rewrites hrefs relative to the page we're rendering on:
  //   '' (default) → urls relative to root (used by index.html)
  //   '../' → from inside pages/, so 'index.html' becomes '../index.html', 'pages/x' becomes '../pages/x' → strip 'pages/' to '../x'
  const resolveHref = (h) => {
    if (!h || h === '#') return '#';
    if (base === '../') {
      if (h.startsWith('pages/')) return h.replace(/^pages\//, '');
      return '../' + h;
    }
    // Flat dir (base=""): pages live as siblings, strip the pages/ prefix.
    if (h.startsWith('pages/')) return h.replace(/^pages\//, '');
    return h;
  };
  const linkStyle = (active) => ({
    textDecoration: 'none',
    color: active ? 'var(--plum)' : 'var(--ink)',
    fontSize: 13, fontWeight: active ? 600 : 400,
    fontFamily: 'var(--font-body)', letterSpacing: '0.005em',
    position: 'relative', whiteSpace: 'nowrap',
    paddingBottom: 4, transition: 'color .25s ease',
  });
  const navInner = (
    <>
      {/* Wordmark — compact crown + EMPRESS, fixed width so it doesn't squish */}
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, gap: 2, width: 112, flexShrink: 0 }}>
        <CrownLogo size={22} color="var(--plum)" />
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          letterSpacing: '0.18em', fontSize: 18, color: 'var(--plum)',
        }}>EMPRESS</span>
      </div>

      <nav style={{ display: 'flex', gap: 22, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        {items.map((it, i) => (
          <a key={it.label} href={resolveHref(it.href)} style={linkStyle(i === activeIdx)} className="nav-link"
             data-active={i === activeIdx ? 'true' : 'false'}>
            {it.label}
            {i === activeIdx && (
              <span style={{
                position: 'absolute', left: 0, right: 0, bottom: -2, height: 1,
                background: 'var(--gold)',
              }} />
            )}
          </a>
        ))}
      </nav>

      {/* Right: minimal action pair */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button style={{
          background: 'var(--plum)', color: '#fff', border: 0, borderRadius: 999,
          padding: '10px 22px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'var(--font-body)', letterSpacing: '0.02em',
          boxShadow: '0 6px 14px -8px rgba(74,54,100,0.6)',
        }}>Start Free</button>
        <button style={{
          background: 'transparent', color: 'var(--plum)', border: '1px solid rgba(74,54,100,0.20)',
          borderRadius: 999, padding: '10px 22px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'var(--font-body)', letterSpacing: '0.02em',
        }}>Sign In</button>
      </div>
    </>
  );

  if (variant === 'floating') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 48px 0', position: 'relative', zIndex: 10 }}>
        <div className="glass" style={{
          display: 'flex', alignItems: 'center', gap: 28,
          padding: '14px 14px 14px 28px', borderRadius: 999,
          width: '100%', maxWidth: 1320,
        }}>{navInner}</div>
      </div>
    );
  }
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 28,
      padding: '22px 56px', position: 'relative', zIndex: 10,
    }}>{navInner}</header>
  );
}

// ── Inline icons (thin, lucide-ish) ─────────────────────────────────────
const Icon = {
  sparkle: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"/>
    </svg>
  ),
  stethoscope: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="10" r="2"/>
    </svg>
  ),
  chart: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17 9 11 13 15 21 7"/><path d="M14 7h7v7"/>
    </svg>
  ),
  community: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/><path d="M14.5 19c0-2.2 1.5-4 3.5-4s3 1.4 3 3.5"/>
    </svg>
  ),
  moon: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>
    </svg>
  ),
  bolt: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>
    </svg>
  ),
  smile: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r=".7" fill="currentColor"/><circle cx="15" cy="10" r=".7" fill="currentColor"/>
    </svg>
  ),
  shield: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  play: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
  ),
  arrow: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  ),
  quote: (s = 28) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="currentColor">
      <path d="M9 8c-3 0-5 2.5-5 6 0 3 2 5 4.5 5 0 3-2 5-5 5v3c6 0 10-4 10-10V8H9zm14 0c-3 0-5 2.5-5 6 0 3 2 5 4.5 5 0 3-2 5-5 5v3c6 0 10-4 10-10V8h-4.5z"/>
    </svg>
  ),
};

// ── Section heading ─────────────────────────────────────────────────────
function SectionHeading({ eyebrow, title, italicTail, sub, align = 'left' }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === 'center' ? 720 : 560, margin: align === 'center' ? '0 auto' : 0 }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 16 }}>{eyebrow}</div>}
      <h2 className="headline">
        {title}{italicTail && <> <em className="italic-emph">{italicTail}</em></>}
      </h2>
      {sub && <p className="body-lg" style={{ marginTop: 20 }}>{sub}</p>}
    </div>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────
function Footer({ base = '' }) {
  const cols = [
    ['Program',   [['Our Program', 'pages/our-program.html'], ['Health Assessment', 'pages/health-assessment.html'], ['Ask Empress', 'index.html#ask'], ['For Clinicians', 'pages/about.html']]],
    ['Resources', [['Education', 'pages/education.html'], ['Community Stories', 'pages/stories.html'], ['Daily Affirmations', 'pages/community.html'], ['FAQ', 'pages/faq.html']]],
    ['Company',   [['About', 'pages/about.html'], ['Founder Story', 'pages/about.html#founder'], ['Contact', 'pages/about.html#contact'], ['Press', 'pages/about.html#press']]],
    ['Legal',     [['Privacy', '#'], ['Terms', '#'], ['Cookies', '#'], ['Accessibility', '#']]],
  ];
  const resolve = (h) => {
    if (!h || h === '#' || h.startsWith('#')) return h || '#';
    if (base === '../') {
      if (h.startsWith('pages/')) return h.replace(/^pages\//, '');
      return '../' + h;
    }
    // Flat dir (base=""): strip pages/ prefix so siblings link directly.
    if (h.startsWith('pages/')) return h.replace(/^pages\//, '');
    return h;
  };
  return (
    <footer style={{ background: 'var(--surface-cream)', padding: '80px 64px 40px', borderTop: '1px solid rgba(74,54,100,0.08)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr repeat(4, 1fr)', gap: 48, maxWidth: 1280, margin: '0 auto' }}>
        <div>
          <Wordmark />
          <p className="body-md" style={{ marginTop: 20, maxWidth: 280 }}>
            Editorial-clinical menopause care. Every claim cited. Every recommendation grounded.
          </p>
          <div className="mono" style={{ marginTop: 24 }}>NAMS · ACOG · MAYO · ENDOCRINE SOC.</div>
        </div>
        {cols.map(([h, items]) => (
          <div key={h}>
            <div className="label-sm" style={{ marginBottom: 18, color: 'var(--plum)' }}>{h}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(([label, href]) => <li key={label}><a href={resolve(href)} style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: 14 }}>{label}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid rgba(74,54,100,0.08)', display: 'flex', justifyContent: 'space-between', maxWidth: 1280, margin: '64px auto 0', alignItems: 'center' }}>
        <span className="mono">© 2026 EMPRESS HEALTH · GROUNDED CARE FOR MIDLIFE</span>
        <span className="mono" style={{ color: 'var(--plum)' }}>EVERY CLAIM CITED · SOURCES VISIBLE</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Placeholder, CrownLogo, Wordmark, Nav, Icon, SectionHeading, Footer });
