/* global React, Placeholder, Nav, Icon, SectionHeading, Footer */
// Variation 3 — "Liquid Vesper"
// Cinematic, liquid-glass-heavy: full-bleed warm hero with floating frosted panels,
// horizontal glass carousels, candlelight tones.

function HomeV3() {
  return (
    <div data-screen-label="V3 Liquid Vesper" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <Nav variant="floating" activeIdx={0} />

      {/* HERO — full bleed photo w/ floating panels --------------------- */}
      <section style={{ position: 'relative', padding: '40px 48px 56px' }}>
        <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', height: 780 }}>
          {/* Background portrait */}
          <Placeholder label="HERO PORTRAIT · WOMAN AT 53 · WARM INTERIOR · CANDLELIGHT · 16:9" width="100%" height="100%" radius={28} tone="tan"/>
          {/* Warm gradient wash */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(95deg, rgba(255,248,245,0.92) 0%, rgba(255,248,245,0.6) 30%, rgba(255,248,245,0.08) 60%, rgba(74,54,100,0.20) 100%)' }} />
          {/* Iridescent bubble blobs */}
          <div style={{ position: 'absolute', bottom: 80, left: '38%', width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85), rgba(214,188,243,0.4) 40%, rgba(247,210,170,0.3) 80%)',
            filter: 'blur(2px)', boxShadow: 'inset -20px -30px 60px rgba(74,54,100,0.15)' }} />
          <div style={{ position: 'absolute', top: 90, right: '24%', width: 140, height: 140, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(247,210,170,0.5) 60%)',
            filter: 'blur(1px)' }} />

          {/* Content overlay */}
          <div style={{ position: 'absolute', inset: 0, padding: '64px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="chip" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(14px)' }}>
                <span className="dot" />MENOPAUSE &amp; PERIMENOPAUSE
              </span>
              <div className="glass" style={{ padding: '18px 22px', maxWidth: 240 }}>
                <div className="label-sm" style={{ color: 'var(--plum)' }}>Today's affirmation</div>
                <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink)', lineHeight: 1.4 }}>
                  "Rest is not a reward I have to earn."
                </p>
                <div className="mono" style={{ marginTop: 12, color: 'var(--gold)' }}>SRC · CHUNK-088 · NAMS</div>
              </div>
            </div>

            {/* Center display */}
            <div style={{ maxWidth: 720 }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 500,
                fontSize: 'clamp(56px, 6.4vw, 108px)', lineHeight: 0.98,
                letterSpacing: '-0.02em', margin: 0,
              }}>
                Sleep deeply.<br/>
                Think clearly.<br/>
                <em className="italic-emph">Feel like yourself.</em>
              </h1>
              <p className="body-lg" style={{ marginTop: 28, maxWidth: 460, fontSize: 18 }}>
                Personalized menopause care, cited at every claim — built for the woman who reads the footnotes.
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 32 }}>
                <button className="btn btn-primary">Start Free {Icon.arrow(16)}</button>
                <button className="btn btn-ghost">
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--plum)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.play(10)}</span>
                  See a sample report
                </button>
              </div>
            </div>

            {/* Bottom glass strip */}
            <div className="glass" style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28, alignItems: 'center', background: 'rgba(255,255,255,0.7)' }}>
              {[
                ['120', 'questions in the assessment'],
                ['34',  'pages in your report'],
                ['247', 'NAMS-certified clinicians'],
                ['9.4', 'avg. score (out of 10)'],
              ].map(([n, l]) => (
                <div key={n}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 500, color: 'var(--plum)', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>{l}</div>
                </div>
              ))}
              <div style={{ position: 'absolute', top: 18, right: 22 }} className="mono">UPDATED · TODAY</div>
            </div>
          </div>
        </div>
      </section>

      {/* INSIGHTS DASH — three floating glass cards on lavender wash ---- */}
      <section style={{ position: 'relative', padding: '120px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-lavender) 50%, var(--surface) 100%)', overflow: 'hidden' }}>
        {/* Iridescent decoration */}
        <div style={{ position: 'absolute', top: 40, left: '8%', width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(214,188,243,0.5) 60%)',
          filter: 'blur(1px)' }} />
        <div style={{ position: 'absolute', bottom: 60, right: '6%', width: 130, height: 130, borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.95), rgba(247,210,170,0.55) 60%)',
          filter: 'blur(1px)' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeading
            align="center"
            eyebrow="A REPORT THAT FEELS LIKE YOURS"
            title="Your Health Intelligence"
            italicTail="— at a glance."
            sub="Composite score across ten clinical domains. Hand-authored narrative. Citation footers on every page. You'll see exactly where every recommendation comes from."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.4fr 1.05fr', gap: 22, marginTop: 64, alignItems: 'stretch' }}>
            {/* Left — radar */}
            <div className="glass" style={{ padding: 30 }}>
              <div className="label-sm">Symptom Radar</div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0' }}>
                <svg width="220" height="220" viewBox="0 0 220 220">
                  {[0.85, 0.65, 0.45, 0.25].map((r, i) => {
                    const pts = Array.from({ length: 10 }, (_, k) => {
                      const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
                      return [110 + Math.cos(a) * 90 * r, 110 + Math.sin(a) * 90 * r].join(',');
                    }).join(' ');
                    return <polygon key={i} points={pts} fill="none" stroke="rgba(74,54,100,0.12)" strokeWidth="0.7"/>;
                  })}
                  {(() => {
                    const vals = [0.7, 0.45, 0.62, 0.8, 0.55, 0.7, 0.4, 0.6, 0.85, 0.5];
                    const pts = vals.map((v, k) => {
                      const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
                      return [110 + Math.cos(a) * 90 * v, 110 + Math.sin(a) * 90 * v].join(',');
                    }).join(' ');
                    return <polygon points={pts} fill="rgba(74,54,100,0.18)" stroke="var(--plum)" strokeWidth="1.5"/>;
                  })()}
                  {Array.from({ length: 10 }, (_, k) => {
                    const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
                    return <line key={k} x1="110" y1="110" x2={110 + Math.cos(a) * 90} y2={110 + Math.sin(a) * 90} stroke="rgba(74,54,100,0.08)" strokeWidth="0.6"/>;
                  })}
                </svg>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {['Sleep', 'Mood', 'Hot Flash', 'Energy', 'Joint', 'Cognition', 'Libido', 'Skin', 'Cycle', 'Heart'].map((d) => (
                  <div key={d} style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>· {d.toUpperCase()}</div>
                ))}
              </div>
            </div>

            {/* Center — wellness gauge */}
            <div className="glass" style={{ padding: 36, position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0, fontWeight: 500 }}>Wellness Composite</h3>
                <span className="chip" style={{ fontSize: 10 }}>STAGE · PERI-MENO</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                <div style={{ position: 'relative' }}>
                  <svg width="190" height="190" viewBox="0 0 190 190">
                    <circle cx="95" cy="95" r="76" stroke="rgba(214,188,243,0.4)" strokeWidth="8" fill="none"/>
                    <circle cx="95" cy="95" r="76" stroke="var(--plum)" strokeWidth="8" fill="none"
                            strokeDasharray={`${0.68 * 2 * Math.PI * 76} ${2 * Math.PI * 76}`}
                            strokeLinecap="round" transform="rotate(-90 95 95)"/>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, lineHeight: 1 }}>68</div>
                    <div className="label-sm" style={{ marginTop: 4 }}>HIS Score</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {[
                    ['Sleep Quality', 72, 'var(--plum)'],
                    ['Energy',        64, 'var(--gold)'],
                    ['Mood Balance',  68, 'var(--plum-soft)'],
                    ['Vasomotor',     54, 'var(--plum)'],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--ink)' }}>{l}</span>
                        <span style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>{v}/100</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(74,54,100,0.10)', borderRadius: 999, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ width: v + '%', height: '100%', background: c, borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mono" style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(74,54,100,0.10)', color: 'var(--gold)' }}>
                SOURCES · CHUNK-014 · CHUNK-019 · NAMS 2023 · JAMA 2024
              </div>
            </div>

            {/* Right — focus areas + clinician */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="glass" style={{ padding: 24 }}>
                <div className="label-sm">Top Focus Areas</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Improve sleep quality', 'Balance hormonal cycle', 'Reduce vasomotor episodes'].map((t, i) => (
                    <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                      <span className="mono" style={{ color: 'var(--gold)' }}>0{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass" style={{ padding: 24 }}>
                <div className="label-sm">Matched Clinician</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
                  <Placeholder label="" width={52} height={52} radius={26} tone="lavender"/>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Dr. M. Chen, MD</div>
                    <div className="mono" style={{ marginTop: 2 }}>NAMS-CERTIFIED · 14 YRS</div>
                  </div>
                </div>
                <p className="body-md" style={{ marginTop: 14, fontSize: 13 }}>
                  Matched on vasomotor severity and sleep-domain protocol fit. Available next Thursday.
                </p>
                <a href="#" className="btn-text" style={{ fontSize: 13, marginTop: 4, display: 'inline-block' }}>Book appointment</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAM PILLARS — 4 cards w/ liquid glass ----------------------- */}
      <section style={{ padding: '120px 64px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeading
            eyebrow="THE FOUR PILLARS"
            title="A program as considered"
            italicTail="as you are."
            sub="No generic wellness journey. Each pillar is grounded in the same evidentiary register we'd expect from a cardiology workup — citation by citation."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginTop: 60 }}>
            {[
              { n: '01', icon: Icon.sparkle(20), title: 'Ask Empress',  body: 'AI guide trained on NAMS-aligned literature. Every answer cites the chunk.' },
              { n: '02', icon: Icon.stethoscope(20), title: 'Clinician Match', body: 'NAMS-certified practitioners ranked by your protocol fit, not your zip code.' },
              { n: '03', icon: Icon.chart(20), title: 'HIS Report', body: 'Composite score, ten-domain radar, hand-authored narrative — 34 pages, every one cited.' },
              { n: '04', icon: Icon.community(20), title: 'Community Library', body: 'Daily affirmations and member stories — provenance visible on every card.' },
            ].map((p) => (
              <div key={p.n} className="glass" style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 320, background: 'rgba(255,252,248,0.7)' }}>
                <div className="mono" style={{ color: 'var(--gold)' }}>{p.n}</div>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: 'rgba(214,188,243,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--plum)',
                }}>{p.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, margin: '12px 0 4px', lineHeight: 1.2 }}>{p.title}</h3>
                <p className="body-md" style={{ margin: 0 }}>{p.body}</p>
                <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                  <a href="#" className="btn-text" style={{ fontSize: 13 }}>Read more</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL CAROUSEL — three glass quote cards ------------------ */}
      <section style={{ padding: '120px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-tan) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeading
            align="center"
            eyebrow="REAL EXPERIENCES"
            title="Stories from women"
            italicTail="who feel seen."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, marginTop: 60 }}>
            {[
              { q: 'The Ask Empress chatbot felt like talking to a wise friend who actually gets what I\'m going through. It guided me when I felt most confused.', n: 'Pooja', m: 'Member · stage III · 11 mo', cite: 'CHUNK-014 · NAMS 2023' },
              { q: 'I had spent six years being told it was just stress. My report was the first document that took my symptoms seriously, line by line.', n: 'Diane',  m: 'Member · stage II · 4 mo',  cite: 'CHUNK-027 · JAMA 2024' },
              { q: 'My matched clinician knew the literature. The first appointment felt like a continuation of the report — not a restart.', n: 'Aisha', m: 'Member · stage III · 8 mo', cite: 'CHUNK-091 · ENDOCR. REV.' },
            ].map((t) => (
              <div key={t.n} className="glass" style={{ padding: 32, position: 'relative' }}>
                <span style={{ color: 'var(--plum-tint)', display: 'inline-block' }}>{Icon.quote(24)}</span>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.45, color: 'var(--ink)', margin: '10px 0 24px' }}>
                  "{t.q}"
                </p>
                <span className="gold-rule" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                  <Placeholder label="" width={40} height={40} radius={20} tone="lavender"/>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500 }}>— {t.n}</div>
                    <div className="mono">{t.m}</div>
                  </div>
                </div>
                <div className="mono" style={{ marginTop: 18, color: 'var(--gold)' }}>SOURCES · {t.cite}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA ----------------------------------------------------- */}
      <section style={{ padding: '0 48px 100px' }}>
        <div style={{
          position: 'relative', borderRadius: 28, overflow: 'hidden',
          background: 'linear-gradient(135deg, #2a1b3f 0%, var(--plum-mid) 100%)',
          padding: '100px 80px', color: '#fff',
        }}>
          {/* Glass iridescent blobs */}
          <div style={{ position: 'absolute', top: 40, right: 80, width: 140, height: 140, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), rgba(214,188,243,0.3) 60%)', filter: 'blur(2px)' }} />
          <div style={{ position: 'absolute', bottom: 60, right: '38%', width: 100, height: 100, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8), rgba(247,210,170,0.4) 60%)', filter: 'blur(2px)' }} />

          <div style={{ position: 'relative', maxWidth: 740 }}>
            <span className="mono" style={{ color: 'var(--gold-soft)' }}>BEGIN WHEN YOU'RE READY</span>
            <h2 className="display" style={{ marginTop: 18, color: '#fff', fontSize: 'clamp(48px, 5vw, 80px)' }}>
              Take the 120 questions. <em style={{ color: 'var(--plum-mist)' }}>Get the 34 pages.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22, color: 'rgba(255,255,255,0.74)', maxWidth: 480, fontSize: 18 }}>
              $139 one-time or $12/month. Your data is yours. Your citations are visible. Your clinician is matched.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>
              <button className="btn" style={{ background: '#fff', color: 'var(--plum)' }}>Start Free {Icon.arrow(16)}</button>
              <button className="btn" style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>See a sample report</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

Object.assign(window, { HomeV3 });
