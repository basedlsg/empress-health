/* global React, Placeholder, Nav, Icon, Footer, SectionHeading */
// Wellness Hub — Editorial resource directory, magazine table-of-contents feel.

const DIRECTORY = [
  {
    topic: 'Sleep',
    resources: [
      { type: 'PROTOCOL', label: 'The 3 AM wakeup: a clinical map', href: '#' },
      { type: 'EBOOK', label: 'The Sleep Protocol — 48 pp.', href: '#' },
      { type: 'ARTICLE', label: 'When melatonin stops working', href: '#' },
      { type: 'CLINICIAN', label: 'Dr. L. Iversen · Sleep Medicine consult', href: '#' },
      { type: 'AUDIO', label: 'Sleep hygiene in perimenopause · 22 min', href: '#' },
    ],
  },
  {
    topic: 'Cognition',
    resources: [
      { type: 'ARTICLE', label: 'On the word that won\'t come', href: '#' },
      { type: 'DEEP-DIVE', label: 'Brain fog in midlife: what\'s hormonal, what isn\'t', href: '#' },
      { type: 'EBOOK', label: 'The Brain Fog Field Guide — 36 pp.', href: '#' },
      { type: 'CLINICIAN', label: 'Dr. R. Patel · Endocrinology consult', href: '#' },
    ],
  },
  {
    topic: 'Mood',
    resources: [
      { type: 'ARTICLE', label: 'The 5 o\'clock wave — irritability in perimenopause', href: '#' },
      { type: 'PROTOCOL', label: 'SSRIs in midlife: a frank reckoning', href: '#' },
      { type: 'CLINICIAN', label: 'Dr. M. Chen · Mood + vasomotor consult', href: '#' },
      { type: 'AUDIO', label: 'On not being able to cry · 18 min', href: '#' },
    ],
  },
  {
    topic: 'Hormones',
    resources: [
      { type: 'DEEP-DIVE', label: 'What a hot flash actually is', href: '#' },
      { type: 'PROTOCOL', label: 'HRT: the evidence hierarchy', href: '#' },
      { type: 'ARTICLE', label: 'Why winter makes vasomotor symptoms worse', href: '#' },
      { type: 'CLINICIAN', label: 'Dr. M. Chen · Vasomotor specialist', href: '#' },
      { type: 'EBOOK', label: 'The Sleep Protocol — vasomotor chapter', href: '#' },
    ],
  },
  {
    topic: 'Movement',
    resources: [
      { type: 'PROTOCOL', label: 'Resistance training for the unconvinced', href: '#' },
      { type: 'ARTICLE', label: 'Joints in perimenopause — the honest picture', href: '#' },
      { type: 'DEEP-DIVE', label: 'Pelvic floor PT 101 — where to start', href: '#' },
      { type: 'CLINICIAN', label: 'Sara Okonkwo · Pelvic floor PT consult', href: '#' },
    ],
  },
  {
    topic: 'Nutrition',
    resources: [
      { type: 'ARTICLE', label: 'The midlife belly — honestly', href: '#' },
      { type: 'EBOOK', label: 'The Metabolic Shift — 40 pp. free', href: '#' },
      { type: 'PROTOCOL', label: 'Protein targets in menopause', href: '#' },
      { type: 'CLINICIAN', label: 'Dr. A. Vasquez · Preventive medicine consult', href: '#' },
      { type: 'AUDIO', label: 'Eating through the transition · 28 min', href: '#' },
    ],
  },
];

const TYPE_COLORS = {
  ARTICLE: 'var(--plum)', PROTOCOL: 'var(--plum-soft)', EBOOK: 'var(--gold)',
  CLINICIAN: 'var(--ink)', AUDIO: 'var(--plum-tint)', 'DEEP-DIVE': 'var(--plum-mid)',
};

function WellnessHub() {
  return (
    <div data-screen-label="Wellness Hub" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={5} base="" />
      </div>

      {/* ───── HERO ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '20px 64px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -160, width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.26) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>WELLNESS HUB · CURATED BY CLINICIANS</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>148 RESOURCES · 6 DOMAINS · ALL CITED</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64, alignItems: 'end' }}>
            <h1 className="display" style={{ margin: 0, lineHeight: 0.97 }}>
              Wellness,<br/><em className="italic-emph">cited.</em>
            </h1>
            <p className="body-lg" style={{ margin: 0, fontSize: 18 }}>
              Six domains. Articles, protocols, ebooks, audio, and clinician consultations — all cross-referenced. Find the resource that fits where you are right now, not where a search algorithm thinks you are.
            </p>
          </div>
        </div>
      </section>

      {/* ───── TYPE LEGEND ────────────────────────────────────────── */}
      <section style={{ padding: '48px 64px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="mono" style={{ color: 'var(--ink-faint)', marginRight: 8 }}>RESOURCE TYPE</span>
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <span key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
              <span className="mono" style={{ color: 'var(--ink-soft)', fontSize: 10 }}>{type}</span>
            </span>
          ))}
        </div>
      </section>

      {/* ───── RESOURCE DIRECTORY ─────────────────────────────────── */}
      <section style={{ padding: '80px 64px 160px', background: 'var(--surface-cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56, rowGap: 72 }}>
          {DIRECTORY.map((col) => (
            <div key={col.topic}>
              {/* Topic header */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ display: 'inline-block', width: 32, height: 1, background: 'var(--gold)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--plum)' }}>
                  {col.topic}.
                </span>
              </div>

              {/* Resource list */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.resources.map((r, i) => (
                  <li key={r.label} style={{
                    display: 'grid', gridTemplateColumns: '72px 1fr', gap: 14,
                    padding: '14px 0', alignItems: 'baseline',
                    borderTop: '1px dashed rgba(74,54,100,0.15)',
                  }}>
                    <span className="mono" style={{ color: TYPE_COLORS[r.type] || 'var(--plum)', fontSize: 9 }}>{r.type}</span>
                    <a href={r.href} style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)',
                      textDecoration: 'none', lineHeight: 1.3 }}>
                      {r.label}
                    </a>
                  </li>
                ))}
                <li style={{ height: 1, background: 'rgba(74,54,100,0.15)', borderStyle: 'dashed', marginTop: 0 }} />
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ───── CTA ────────────────────────────────────────────────── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface)',
        borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>THE REPORT · PERSONAL · CITED</div>
          <h2 className="headline" style={{ margin: '0 0 22px' }}>
            Every resource above — applied<br/><em className="italic-emph">to your biology.</em>
          </h2>
          <p className="body-lg" style={{ margin: '0 auto 36px', maxWidth: 560 }}>
            The Health Intelligence Report reads the same evidence and gives you the 22-page version specific to your symptom profile, your stage, your lab markers. $139 one-time or $12/mo.
          </p>
          <button className="btn btn-primary" style={{ padding: '16px 40px' }}>Start your assessment {Icon.arrow(16)}</button>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
