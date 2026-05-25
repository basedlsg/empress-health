/* global React, Placeholder, Nav, Icon, Footer, SectionHeading */
// How It Works — 3-step rail + per-step editorial deep-dive + pricing strip.

const STEPS = [
  {
    n: '01', label: 'Take the assessment',
    sub: '22 validated questions · 8–12 minutes · free',
    desc: 'The Empress Health Inventory (HIS) is built on validated perimenopause instruments — the Greene Climacteric Scale, MRS, and MENQOL, calibrated to our clinical database. It asks the questions your GP does not have time for.',
    img: 'ASSESSMENT · DIGITAL FORM\nCLEAN INTERFACE · WARM LIGHT',
    tone: 'lavender',
    cite: 'NAMS § 3 · MENQOL · CHUNK-031',
  },
  {
    n: '02', label: 'Receive your report',
    sub: '22-page Health Intelligence Report · $139 one-time or $12/mo',
    desc: 'The report scores your responses against 90 clinical narratives — written by menopause specialists and grounded in Pinecone-indexed trial data. Every recommendation cites the chunk that supports it. No hand-waving.',
    img: 'PRINTED REPORT · EDITORIAL\nFLAT-LAY · CREAM SURFACE',
    tone: 'cream',
    cite: 'ENDOCRINE SOC. 2023 · CHUNK-088 · 90 NARRATIVES',
  },
  {
    n: '03', label: 'Meet your clinician',
    sub: 'Asynchronous or synchronous · NAMS-certified · within 48 hours',
    desc: 'Your report routes to a NAMS-certified practitioner in our network who reads it before your first message. They are not starting from scratch. The report is the briefing document — they begin where it ends.',
    img: 'CLINICIAN CONSULTATION\nNATURAL LIGHT · WARM SETTING',
    tone: 'tan',
    cite: 'NAMS-CERTIFIED NETWORK · 247 PRACTITIONERS',
  },
];

function HowItWorks() {
  return (
    <div data-screen-label="How It Works" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={2} base="" />
      </div>

      {/* ───── HERO ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '20px 64px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -180, right: -160, width: 680, height: 680, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.28) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>THE EMPRESS METHOD · THREE STEPS</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>CLINICAL · GROUNDED · CONTINUOUS</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64, alignItems: 'end' }}>
            <h1 className="display" style={{ margin: 0, lineHeight: 0.97 }}>
              How it<br/><em className="italic-emph">actually works.</em>
            </h1>
            <p className="body-lg" style={{ margin: 0, fontSize: 18 }}>
              A 22-question assessment. A 22-page report grounded in clinical evidence. A NAMS-certified clinician who has read it before you meet. That is the whole system — and nothing else tries to do all three.
            </p>
          </div>
        </div>
      </section>

      {/* ───── 3-STEP OVERVIEW RAIL ───────────────────────────────── */}
      <section style={{ padding: '80px 64px', background: 'var(--surface-cream)',
        borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{
                padding: '32px 40px 32px', display: 'flex', flexDirection: 'column', gap: 12,
                borderLeft: i > 0 ? '1px solid rgba(74,54,100,0.12)' : 'none',
                borderRight: i < STEPS.length - 1 ? 'none' : 'none',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 44,
                  color: 'var(--gold)', lineHeight: 1 }}>{s.n}</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 24,
                  margin: 0, lineHeight: 1.2, color: 'var(--ink)' }}>{s.label}</h3>
                <div className="mono" style={{ color: 'var(--plum-soft)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PER-STEP EDITORIAL BLOCKS ──────────────────────────── */}
      {STEPS.map((s, i) => (
        <section key={s.n} style={{
          padding: '160px 64px',
          background: i % 2 === 0 ? 'var(--surface)' : 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)',
          position: 'relative',
        }}>
          <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid',
            gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr', gap: 72,
            alignItems: 'center' }}>
            {/* Photo side (alternates) */}
            {i % 2 === 0 ? (
              <>
                <div style={{ position: 'relative' }}>
                  <Placeholder label={s.img} width="100%" height={480} radius={6} tone={s.tone} />
                  <div style={{ position: 'absolute', top: -8, left: -8, width: 18, height: 18, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
                  <div style={{ position: 'absolute', bottom: -8, right: -8, width: 18, height: 18, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
                </div>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32,
                      color: 'var(--gold)', lineHeight: 1 }}>{s.n}</span>
                    <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
                  </div>
                  <h2 className="headline" style={{ margin: '0 0 28px' }}>
                    {s.label.split(' ').slice(0, -1).join(' ')}<br/>
                    <em className="italic-emph">{s.label.split(' ').slice(-1)[0]}.</em>
                  </h2>
                  {/* Drop-cap body */}
                  <p className="body-lg" style={{ margin: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                      fontSize: 64, lineHeight: 0.82, float: 'left', marginRight: 10, marginTop: 6, color: 'var(--plum)',
                    }}>{s.desc[0]}</span>
                    {s.desc.slice(1)}
                  </p>
                  <div className="mono" style={{ color: 'var(--gold)', marginTop: 28 }}>SOURCES · {s.cite}</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32,
                      color: 'var(--gold)', lineHeight: 1 }}>{s.n}</span>
                    <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
                  </div>
                  <h2 className="headline" style={{ margin: '0 0 28px' }}>
                    {s.label.split(' ').slice(0, -1).join(' ')}<br/>
                    <em className="italic-emph">{s.label.split(' ').slice(-1)[0]}.</em>
                  </h2>
                  <p className="body-lg" style={{ margin: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                      fontSize: 64, lineHeight: 0.82, float: 'left', marginRight: 10, marginTop: 6, color: 'var(--plum)',
                    }}>{s.desc[0]}</span>
                    {s.desc.slice(1)}
                  </p>
                  <div className="mono" style={{ color: 'var(--gold)', marginTop: 28 }}>SOURCES · {s.cite}</div>
                </div>
                <div style={{ position: 'relative' }}>
                  <Placeholder label={s.img} width="100%" height={480} radius={6} tone={s.tone} />
                  <div style={{ position: 'absolute', top: -8, left: -8, width: 18, height: 18, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
                  <div style={{ position: 'absolute', bottom: -8, right: -8, width: 18, height: 18, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
                </div>
              </>
            )}
          </div>
        </section>
      ))}

      {/* ───── PRICING STRIP ──────────────────────────────────────── */}
      <section style={{ padding: '120px 64px', background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -100, right: -60, width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>PRICING · TRANSPARENT · NO UPSELLS</div>
              <h2 className="display" style={{ margin: '0 0 32px', fontSize: 'clamp(40px, 4.4vw, 68px)', color: 'var(--plum)', lineHeight: 1.0 }}>
                $139 once.<br/><em className="italic-emph" style={{ color: 'var(--plum-mid)' }}>Or $12 a month.</em>
              </h2>
              <p className="body-lg" style={{ margin: '0 0 36px', color: 'var(--ink-soft)', maxWidth: 460 }}>
                The one-time fee covers your Health Intelligence Report, lifetime access to results, and one clinician consultation. The monthly plan adds the 12-week program, daily affirmations, and on-call clinician messaging.
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                <button className="btn btn-primary" style={{ padding: '16px 36px' }}>Start free {Icon.arrow(14)}</button>
                <button className="btn btn-ghost" style={{ padding: '16px 28px' }}>Read a sample report</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                ['Health Intelligence Report', '22 pages · 90 clinical narratives · every claim cited'],
                ['Clinician review', 'NAMS-certified · reads your report first · responds in 48h'],
                ['12-week program', 'Week-by-week protocol matched to your symptom profile'],
                ['Daily affirmations', 'Not inspiration. Grounded daily anchors drawn from your report.'],
              ].map(([t, d]) => (
                <div key={t} style={{ display: 'flex', gap: 18, alignItems: 'flex-start', paddingTop: 18,
                  borderTop: '1px solid rgba(74,54,100,0.12)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--plum)',
                    display: 'inline-block', flexShrink: 0, marginTop: 6 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, color: 'var(--plum)' }}>{t}</div>
                    <div className="body-md" style={{ marginTop: 4, color: 'var(--ink-soft)' }}>{d}</div>
                  </div>
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
