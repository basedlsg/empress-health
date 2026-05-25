/* global React, Placeholder, Nav, Icon, Footer, SectionHeading */
// Ebook Guides — Editorial ebook grid, featured cover + 6-up grid.

const EBOOKS = [
  { title: 'The Sleep Protocol.', topic: 'Vasomotor + Sleep', paid: false, cta: 'Download free', tone: 'lavender', cite: 'NAMS 2023 · CHUNK-067' },
  { title: 'Bone Intelligence.', topic: 'Musculoskeletal + Bone', paid: true, price: '$9', tone: 'cream', cite: 'NAMS § 9 · CHUNK-201' },
  { title: 'The Brain Fog Field Guide.', topic: 'Cognition + Mood', paid: false, cta: 'Download free', tone: 'tan', cite: 'ENDOCRINE SOC. 2023 · CHUNK-088' },
  { title: 'Skin After 45.', topic: 'Skin / Hair / Nails', paid: true, price: '$12', tone: 'lavender', cite: 'AAD 2023 · CHUNK-133' },
  { title: 'The Metabolic Shift.', topic: 'Metabolic + Nutrition', paid: false, cta: 'Download free', tone: 'cream', cite: 'ENDOCRINE SOC. 2024 · CHUNK-177' },
  { title: 'Desire, Revisited.', topic: 'GU + Intimacy', paid: true, price: '$9', tone: 'tan', cite: 'IPPS 2022 · CHUNK-112' },
  { title: 'The Cardio Window.', topic: 'Cardiovascular', paid: false, cta: 'Download free', tone: 'lavender', cite: 'ACC/AHA 2023 · CHUNK-155' },
  { title: 'Joint & Muscle in Midlife.', topic: 'Musculoskeletal', paid: true, price: '$9', tone: 'cream', cite: 'ARTHRITIS RES 2023 · CHUNK-192' },
];

function EbookGuides() {
  return (
    <div data-screen-label="Ebook Guides" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={5} base="" />
      </div>

      {/* ───── HERO ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '20px 64px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -160, width: 660, height: 660, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.28) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,165,96,0.12) 0%, rgba(201,165,96,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>EMPRESS LIBRARY · EBOOK COLLECTION</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>8 TITLES · CLINICIAN-AUTHORED · ALL CITED</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, alignItems: 'end' }}>
            <h1 className="display" style={{ margin: 0, lineHeight: 0.97 }}>
              Ebooks, as serious<br/><em className="italic-emph">as your symptoms.</em>
            </h1>
            <p className="body-lg" style={{ margin: 0, fontSize: 18 }}>
              Not listicles. Not "10 tips." Deep, cited, clinician-authored guides you can read once and return to. Several are free. All cite the trial, the panel size, the year.
            </p>
          </div>
        </div>
      </section>

      {/* ───── FEATURED EBOOK ─────────────────────────────────────── */}
      <section style={{ padding: '80px 64px 100px', background: 'var(--surface-cream)',
        borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div className="mono" style={{ color: 'var(--gold)', marginBottom: 24 }}>FEATURED TITLE · ISSUE 01</div>
          <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 72, alignItems: 'start' }}>
            {/* Cover */}
            <div style={{ position: 'relative' }}>
              <Placeholder label={"THE SLEEP PROTOCOL\nEDITORIAL COVER · EBOOK\nKINFOLK INTERIOR REGISTER"} width="100%" height={540} radius={4} tone="lavender" />
              <div style={{ position: 'absolute', top: -8, left: -8, width: 18, height: 18, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -8, right: -8, width: 18, height: 18, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div className="mono" style={{ marginTop: 14, color: 'var(--gold)' }}>VASOMOTOR + SLEEP · 48 PP · FREE</div>
            </div>
            {/* Text */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontStyle: 'italic',
                fontSize: 'clamp(36px, 4vw, 58px)', lineHeight: 1.1, margin: '0 0 24px', color: 'var(--ink)' }}>
                The Sleep Protocol.
              </h2>
              <p className="body-lg" style={{ margin: '0 0 22px' }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                  fontSize: 64, lineHeight: 0.82, float: 'left', marginRight: 10, marginTop: 6, color: 'var(--plum)',
                }}>M</span>
                ost middle-of-the-night waking in midlife is not insomnia. It is a vasomotor cascade with a circadian reset underneath. This guide maps the event, explains the biology, and gives you the evidence-ranked response — from temperature and timing to pharmacological options when lifestyle has been exhausted.
              </p>
              <p className="body-md" style={{ margin: '0 0 28px', color: 'var(--ink-soft)' }}>
                Written by Dr. L. Iversen, Sleep Medicine, and reviewed by the Empress clinical board. Forty-eight pages. Every claim cites the trial.
              </p>
              <div className="mono" style={{ color: 'var(--gold)', marginBottom: 24 }}>SOURCES · AASM 2023 · CHUNK-067 · NAMS § 7.1</div>
              <button className="btn btn-primary">Download free {Icon.arrow(14)}</button>
            </div>
          </div>
        </div>
      </section>

      {/* ───── EBOOK GRID ─────────────────────────────────────────── */}
      <section style={{ padding: '140px 64px 160px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderBottom: '1px solid var(--ink)', paddingBottom: 14, marginBottom: 56 }}>
            <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(28px, 2.6vw, 40px)' }}>
              The full<br/><em className="italic-emph">collection.</em>
            </h2>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>8 TITLES · UPDATED QUARTERLY</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28, rowGap: 56 }}>
            {EBOOKS.map((eb, i) => (
              <article key={eb.title} className="lift" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <Placeholder label={`EBOOK COVER\n${eb.topic.toUpperCase()}`} width="100%" height={280} radius={3} tone={eb.tone} />
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    padding: '5px 10px', borderRadius: 999,
                    background: eb.paid ? 'var(--plum)' : 'rgba(255,252,248,0.9)',
                    backdropFilter: 'blur(8px)',
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em',
                    color: eb.paid ? '#fff' : 'var(--plum)',
                    border: eb.paid ? 'none' : '1px solid rgba(74,54,100,0.15)',
                  }}>{eb.paid ? eb.price : 'FREE'}</span>
                </div>

                <div className="mono" style={{ color: 'var(--gold)', marginTop: 18, marginBottom: 8 }}>
                  {eb.topic.toUpperCase()}
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontStyle: 'italic',
                  fontSize: 20, margin: '0 0 8px', lineHeight: 1.2, flex: 1 }}>
                  {eb.title}
                </h3>

                <div className="mono" style={{ color: 'var(--ink-faint)', marginBottom: 16, fontSize: 9 }}>
                  {eb.cite}
                </div>

                <button className="btn btn-text" style={{ alignSelf: 'flex-start', fontSize: 13 }}>
                  {eb.paid ? `Get for ${eb.price} →` : 'Download free →'}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
