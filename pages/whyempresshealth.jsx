/* global React, Placeholder, Nav, Icon, Footer, SectionHeading */
// Why Empress Health — Brand-value page: 3 numbered chapters + pricing strip.

const CHAPTERS = [
  {
    roman: 'I',
    title: 'Grounded',
    italicTail: 'not guessed.',
    body: 'Every clinical claim in the Empress system is grounded in a Pinecone-indexed chunk — a real trial, a published guideline, a named study. The chunk number appears on the page where the claim lives. Not in a tooltip. Not at the bottom. On the page. This is not a design decision; it is the product. If you cannot see the source, it is not Empress.',
    img: 'REPORT · OPEN FLAT-LAY\nCITATION FOOTNOTES VISIBLE\nCREAM SURFACE · NATURAL LIGHT',
    tone: 'lavender',
    cite: 'BRAND BRIEF § 5 · THE ONE DIFFERENTIATOR · CHUNK-031',
  },
  {
    roman: 'II',
    title: 'Personalized',
    italicTail: 'not generic.',
    body: 'The Health Intelligence Report scores your 22-question Health Inventory against 90 clinical narratives — written by menopause specialists, grounded in clinical evidence, calibrated to your symptom profile, your stage, your history. There is no generic report. The report you receive has never been generated in this exact form before, because you have not existed in this exact form before.',
    img: 'HIS QUESTIONNAIRE · DIGITAL\nPERSONAL DATA · CLINICAL FORM\nWARM LIGHT · FOCUSED',
    tone: 'cream',
    cite: 'HIS ENGINE · 90 NARRATIVES · NAMS § 3 · CHUNK-088',
  },
  {
    roman: 'III',
    title: 'Continuous',
    italicTail: 'not episodic.',
    body: 'The appointment is not the product. The report routes to a NAMS-certified clinician who reads it before you meet. The 12-week program extends the protocol week by week. The daily affirmations are grounded in your report — not inspiration, anchors. On-call clinician messaging means you are not waiting for the next appointment to get an answer. The care continues.',
    img: 'CLINICIAN CONSULTATION\nON-CALL MESSAGING · WARM\nTABLET INTERFACE · NATURAL LIGHT',
    tone: 'tan',
    cite: '12-WEEK PROTOCOL · DAILY AFFIRMATIONS · ON-CALL CARE · CHUNK-044',
  },
];

function WhyEmpressHealth() {
  return (
    <div data-screen-label="Why Empress Health" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={7} base="" />
      </div>

      {/* ───── HERO ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '20px 64px 100px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -180, width: 720, height: 720, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.30) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -160, width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.20) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 64 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>EMPRESS HEALTH · WHY WE EXIST</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>GROUNDED · PERSONALIZED · CONTINUOUS</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 72, alignItems: 'center' }}>
            <div>
              <h1 className="display" style={{ margin: '0 0 40px', lineHeight: 0.97 }}>
                Why<br/><em className="italic-emph">Empress.</em>
              </h1>

              {/* Pull quote */}
              <blockquote style={{ margin: 0, padding: '28px 32px', borderLeft: '2px solid var(--gold)',
                background: 'var(--surface-lavender)', borderRadius: '0 12px 12px 0' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400,
                  fontSize: 22, lineHeight: 1.4, color: 'var(--plum)', margin: '0 0 16px' }}>
                  "Four doctors in eleven months. None of them used the word menopause. One suggested I sleep more."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--gold)' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--plum-soft)' }}>
                    — Ariana Kaplan, Founder
                  </span>
                </div>
              </blockquote>
            </div>

            <div style={{ position: 'relative' }}>
              <Placeholder label={"FOUNDER · EDITORIAL PORTRAIT\nNATURAL LIGHT · SEATED"} width="100%" height={560} radius={6} tone="lavender" />
              <div style={{ position: 'absolute', top: -10, left: -10, width: 22, height: 22,
                borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 22, height: 22,
                borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div className="mono" style={{ marginTop: 14, color: 'var(--gold)', textAlign: 'right' }}>
                A. KAPLAN · CEO + EDITOR-IN-CHIEF
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── THREE CHAPTERS ─────────────────────────────────────── */}
      {CHAPTERS.map((ch, i) => (
        <section key={ch.roman} style={{
          padding: '160px 64px',
          background: i % 2 === 0
            ? 'var(--surface-cream)'
            : 'linear-gradient(180deg, var(--surface) 0%, #f7eee5 60%, var(--surface) 100%)',
          borderTop: '1px solid rgba(74,54,100,0.08)',
          position: 'relative',
        }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            {/* Chapter ornament */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, marginBottom: 56 }}>
              <span style={{ display: 'inline-block', width: 56, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--plum)' }}>
                Chapter {ch.roman}.
              </span>
              <span style={{ display: 'inline-block', width: 56, height: 1, background: 'var(--gold)' }} />
            </div>

            <div style={{ display: 'grid',
              gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr', gap: 80, alignItems: 'center' }}>

              {i % 2 === 0 ? (
                <>
                  {/* Text first on even */}
                  <div>
                    <h2 className="headline" style={{ margin: '0 0 28px' }}>
                      {ch.title} — <em className="italic-emph">{ch.italicTail}</em>
                    </h2>
                    <p className="body-lg" style={{ margin: 0 }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                        fontSize: 64, lineHeight: 0.82, float: 'left', marginRight: 10, marginTop: 6, color: 'var(--plum)',
                      }}>{ch.body[0]}</span>
                      {ch.body.slice(1)}
                    </p>
                    <div className="mono" style={{ color: 'var(--gold)', marginTop: 28 }}>SOURCES · {ch.cite}</div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Placeholder label={ch.img} width="100%" height={480} radius={6} tone={ch.tone} />
                    <div style={{ position: 'absolute', top: -8, left: -8, width: 18, height: 18,
                      borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
                    <div style={{ position: 'absolute', bottom: -8, right: -8, width: 18, height: 18,
                      borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
                  </div>
                </>
              ) : (
                <>
                  {/* Photo first on odd */}
                  <div style={{ position: 'relative' }}>
                    <Placeholder label={ch.img} width="100%" height={480} radius={6} tone={ch.tone} />
                    <div style={{ position: 'absolute', top: -8, left: -8, width: 18, height: 18,
                      borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
                    <div style={{ position: 'absolute', bottom: -8, right: -8, width: 18, height: 18,
                      borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
                  </div>
                  <div>
                    <h2 className="headline" style={{ margin: '0 0 28px' }}>
                      {ch.title} — <em className="italic-emph">{ch.italicTail}</em>
                    </h2>
                    <p className="body-lg" style={{ margin: 0 }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                        fontSize: 64, lineHeight: 0.82, float: 'left', marginRight: 10, marginTop: 6, color: 'var(--plum)',
                      }}>{ch.body[0]}</span>
                      {ch.body.slice(1)}
                    </p>
                    <div className="mono" style={{ color: 'var(--gold)', marginTop: 28 }}>SOURCES · {ch.cite}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* ───── PRICING STRIP ──────────────────────────────────────── */}
      <section style={{ padding: '120px 64px', background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -100, right: -60, width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 20 }}>PRICING · NO SUBSCRIPTIONS REQUIRED</div>
            <h2 className="display" style={{ margin: '0 0 28px', fontSize: 'clamp(40px, 5vw, 72px)',
              color: 'var(--plum)', lineHeight: 1.0 }}>
              $139 once.<br/><em className="italic-emph" style={{ color: 'var(--plum-mid)' }}>Or $12 a month.</em>
            </h2>
            <p className="body-lg" style={{ margin: '0 0 40px', color: 'var(--ink-soft)' }}>
              The one-time fee covers your Health Intelligence Report, lifetime access to results, and one clinician consultation. The monthly plan adds the 12-week program, daily affirmations, and on-call messaging.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button className="btn btn-primary" style={{ padding: '16px 40px' }}>Start free {Icon.arrow(14)}</button>
              <button className="btn btn-ghost" style={{ padding: '16px 28px' }}>Read a sample report</button>
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
