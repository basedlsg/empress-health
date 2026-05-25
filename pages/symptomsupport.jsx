/* global React, Placeholder, Nav, Icon, Footer, SectionHeading */
// Symptom Support — Symptom directory with search, filter chips, and domain cards.

const DOMAINS = [
  {
    name: 'Vasomotor', slug: 'vasomotor', tone: 'lavender',
    desc: 'Hot flashes, night sweats, chills. The thermal dysregulation at the center of most perimenopause experience.',
    cite: 'NAMS 2023 · CHUNK-044',
  },
  {
    name: 'Sleep', slug: 'sleep', tone: 'cream',
    desc: 'Middle-of-the-night waking, early-morning cortisol, REM disruption. Not insomnia — a vasomotor cascade.',
    cite: 'AASM 2023 · CHUNK-067',
  },
  {
    name: 'Cognitive', slug: 'cognition', tone: 'tan',
    desc: 'Word-finding pauses, working-memory gaps, brain fog. Estrogen-withdrawal and sleep-debt are both contributors.',
    cite: 'ENDOCRINE SOC. 2023 · CHUNK-088',
  },
  {
    name: 'Mood', slug: 'mood', tone: 'lavender',
    desc: 'Irritability, low mood, the 5 o\'clock wave. Distinct from clinical depression — and the treatment differs.',
    cite: 'ACOG 2022 · CHUNK-099',
  },
  {
    name: 'Metabolic', slug: 'metabolic', tone: 'cream',
    desc: 'Abdominal weight redistribution, insulin sensitivity shifts, appetite changes. The estrogen-adipose axis.',
    cite: 'ENDOCRINE SOC. 2024 · CHUNK-177',
  },
  {
    name: 'Skin, Hair & Nails', slug: 'skin-hair-nails', tone: 'tan',
    desc: 'Collagen loss, dryness, hair thinning, nail brittleness. Estrogen-withdrawal dermatology, not aging.',
    cite: 'AAD 2023 · CHUNK-133',
  },
  {
    name: 'Musculoskeletal', slug: 'musculoskeletal', tone: 'lavender',
    desc: 'Joint aching, morning stiffness, bone density loss, muscle mass decline. The estrogen–collagen–calcium triangle.',
    cite: 'ARTHRITIS RES 2023 · CHUNK-192',
  },
  {
    name: 'GU / Pelvic', slug: 'gu', tone: 'cream',
    desc: 'Vaginal dryness, urinary urgency, pelvic floor changes, GSM. Underdiagnosed and highly treatable.',
    cite: 'ACOG 2022 · CHUNK-112',
  },
  {
    name: 'Cardiovascular', slug: 'cardio', tone: 'tan',
    desc: 'LDL shifts, blood pressure inflection, palpitations. The post-menopause cardio window is real and actionable.',
    cite: 'ACC/AHA 2023 · CHUNK-155',
  },
  {
    name: 'Lifestyle & Gut', slug: 'lifestyle', tone: 'lavender',
    desc: 'Bloating, gut microbiome shifts, alcohol tolerance changes, libido fluctuation. The systemic downstream effects.',
    cite: 'GUT 2023 · CHUNK-144',
  },
];

const TRENDING = [
  'Hot flashes', 'Night sweats', 'Brain fog', 'Sleep disruption',
  'Vaginal dryness', 'Mood swings', 'Joint pain', 'Hair thinning',
  'Weight gain', 'Heart palpitations', 'Fatigue', 'Low libido',
];

function SymptomSupport() {
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState('All');

  const filtered = DOMAINS.filter(d =>
    (active === 'All' || d.name === active) &&
    (query === '' || d.name.toLowerCase().includes(query.toLowerCase()) || d.desc.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div data-screen-label="Symptom Support" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={5} base="" />
      </div>

      {/* ───── HERO ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '20px 64px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -180, right: -160, width: 680, height: 680, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.28) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -120, width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.16) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>SYMPTOM DIRECTORY · 10 DOMAINS · CLINICIAN-MAPPED</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>EVERY PROTOCOL CITED · NAMS · ACOG · ENDOCRINE SOC.</div>
          </div>

          <div style={{ marginBottom: 52 }}>
            <h1 className="display" style={{ margin: '0 0 40px', lineHeight: 0.97 }}>
              Find your<br/><em className="italic-emph">symptom.</em>
            </h1>

            {/* Search input */}
            <div style={{ position: 'relative', maxWidth: 600 }}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search symptoms — try 'hot flash' or 'brain fog'"
                style={{
                  width: '100%', padding: '18px 24px', borderRadius: 999,
                  border: '1px solid rgba(74,54,100,0.20)',
                  background: 'var(--surface-bright)',
                  fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink)',
                  outline: 'none', boxSizing: 'border-box',
                  boxShadow: '0 4px 24px -8px rgba(74,54,100,0.12)',
                }}
              />
              <span style={{ position: 'absolute', right: 22, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--ink-faint)', pointerEvents: 'none' }}>
                {Icon.arrow(16)}
              </span>
            </div>
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['All', ...DOMAINS.map(d => d.name)].map(name => (
              <button key={name} onClick={() => setActive(name)} style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
                padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
                border: active === name ? '1px solid var(--plum)' : '1px solid rgba(74,54,100,0.18)',
                background: active === name ? 'var(--plum)' : 'rgba(255,252,248,0.80)',
                backdropFilter: 'blur(8px)',
                color: active === name ? '#fff' : 'var(--ink-soft)',
                transition: 'all .2s',
              }}>{name.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ───── DOMAIN CARDS ───────────────────────────────────────── */}
      <section style={{ padding: '80px 64px 140px', background: 'var(--surface-cream)',
        borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          {filtered.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--ink-soft)', paddingTop: 24 }}>
              No domains match "{query}" — try another term.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, rowGap: 32 }}>
              {filtered.map((d) => (
                <article key={d.name} className="lift glass-warm" style={{
                  padding: '28px 28px 24px', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                  <div className="mono" style={{ color: 'var(--gold)' }}>DOMAIN</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontStyle: 'italic',
                    fontSize: 26, margin: 0, lineHeight: 1.15, color: 'var(--plum)' }}>
                    {d.name}.
                  </h3>
                  <p className="body-md" style={{ margin: 0, flex: 1 }}>{d.desc}</p>
                  <div className="mono" style={{ color: 'var(--gold)', fontSize: 9 }}>SOURCES · {d.cite}</div>
                  <a href={`#${d.slug}`} style={{ color: 'var(--plum)', fontFamily: 'var(--font-body)',
                    fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textDecoration: 'none' }}>
                    Read protocol →
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───── TRENDING CHIPS ─────────────────────────────────────── */}
      <section style={{ padding: '80px 64px 120px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>Most-searched right now.</span>
            <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {TRENDING.map(t => (
              <a key={t} href="#" style={{ textDecoration: 'none' }}>
                <span className="chip" style={{ cursor: 'pointer' }}>
                  <span className="dot" />{t}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
