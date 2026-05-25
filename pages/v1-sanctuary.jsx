/* global React, Placeholder, Nav, Icon, SectionHeading, Footer */
// Variation 1 — "The Sanctuary"
// Faithful to the reference screenshot: inline nav, split hero with photo right,
// floating glass insight cards in the lower band, lavender ribbon transitions.

function HomeV1() {
  return (
    <div data-screen-label="V1 The Sanctuary" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      {/* Background atmosphere — kept on the LEFT only so the photo's natural cream blends seamlessly on the right */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '54%', height: 1100, pointerEvents: 'none', zIndex: 0,
        background: 'linear-gradient(135deg, var(--surface) 0%, #f5edfa 60%, var(--surface) 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, black 60%, transparent 100%)',
        maskImage: 'linear-gradient(90deg, black 60%, transparent 100%)',
      }} />
      {/* Luxury orbs — only on the text side, kept far from the photo */}
      <div style={{ position: 'absolute', top: -120, left: -180, width: 680, height: 680, borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 50%, rgba(214,188,243,0.32) 0%, rgba(214,188,243,0) 65%)',
        filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 460, left: '12%', width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,165,96,0.08) 0%, rgba(201,165,96,0) 70%)',
        filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Cream veil at top — sits over photo so nav text always reads on a consistent backdrop */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(180deg, var(--surface) 0%, rgba(255,248,245,0.85) 35%, rgba(255,248,245,0.45) 70%, transparent 100%)',
      }} />

      {/* HERO --------------------------------------------------------- */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav variant="inline" activeIdx={0} />
      </div>

      <section style={{ position: 'relative', zIndex: 1, paddingBottom: 60 }}>
        {/* Open hero: text in padded column, portrait bleeds full-height to right edge */}
        <div style={{ position: 'relative', minHeight: 720 }}>
          {/* Right: portrait — bleeds top + right + bottom, only LEFT edge feathers into the cream */}
          <div style={{
            position: 'absolute', top: -80, right: 0, width: '60%', height: 940,
            zIndex: 0,
          }}>
            <div style={{
              width: '100%', height: '100%',
              backgroundImage: 'url(assets/hero-portrait.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'right 65%',
              backgroundRepeat: 'no-repeat',
              // Linear feather on the LEFT edge only — photo's own cream tones blend with page cream on top/right/bottom
              WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.25) 6%, black 28%, black 100%)',
              maskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.25) 6%, black 28%, black 100%)',
            }} />
          </div>

          {/* Text column */}
          <div style={{ position: 'relative', zIndex: 2, padding: '40px 64px 0', maxWidth: 720 }}>
            <span className="chip" style={{ marginBottom: 32 }}>
              <span className="dot" />MENOPAUSE &amp; PERIMENOPAUSE SUPPORT
            </span>
            <h1 className="display" style={{ margin: 0 }}>
              Sleep deeply.<br />
              Think clearly.<br />
              <em className="italic-emph">Feel like yourself again.</em>
            </h1>
            <p className="body-lg" style={{ marginTop: 28, maxWidth: 480 }}>
              Personalized menopause care, expert guidance, and a supportive community — so you can thrive in every stage of midlife.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>
              <button className="btn btn-primary">Start Free {Icon.arrow(16)}</button>
              <button className="btn btn-ghost">Take the Assessment</button>
            </div>
            <div style={{ display: 'flex', gap: 28, marginTop: 56 }}>
              {[
                { icon: Icon.shield(16), text: 'Science-backed\nexpert care' },
                { icon: Icon.community(16), text: 'Personalized\nfor you' },
                { icon: Icon.smile(16), text: 'Trusted by\nwomen like you' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,252,248,0.6)', backdropFilter: 'blur(14px) saturate(140%)',
                    border: '1px solid rgba(74,54,100,0.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--plum)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset',
                  }}>{t.icon}</div>
                  <span style={{ fontSize: 13, color: 'var(--ink-soft)', whiteSpace: 'pre-line', lineHeight: 1.3 }}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating "Watch how it works" — beautiful corner placement, true liquid glass */}
          <div className="glass" style={{
            position: 'absolute', top: 90, right: 56, width: 280, padding: '24px 24px 22px',
            borderRadius: 22, zIndex: 3,
          }}>
            {/* tiny decorative ornament */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ display: 'inline-block', width: 20, height: 1, background: 'var(--gold)' }} />
              <span className="mono" style={{ color: 'var(--plum)', fontSize: 9 }}>A NOTE FOR YOU</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.18, color: 'var(--ink)', fontStyle: 'italic', fontWeight: 400 }}>
              You deserve to feel<br/>like you again.
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              Personalized support for your mind, body, and sleep.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(74,54,100,0.10)' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'var(--plum)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 14px -6px rgba(74,54,100,0.5)',
              }}>{Icon.play(12)}</div>
              <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>Watch how it works</span>
            </div>
          </div>
        </div>

        {/* Three glass insight cards along the bottom */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1fr', gap: 18, marginTop: 60, padding: '0 64px' }}>
          {/* Why Empress */}
          <div className="glass" style={{ padding: 30, backgroundColor: 'rgba(232,222,250,0.55)', position: 'relative', overflow: 'hidden' }}>
            <div className="label-sm">Why Empress?</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 26, margin: '12px 0 14px', lineHeight: 1.15 }}>
              Care that sees<br/>the whole you.
            </h3>
            <p className="body-md" style={{ margin: 0 }}>
              We combine expert guidance, personalized insights, and real community to help you feel like yourself again.
            </p>
            <a href="#" className="btn-text" style={{ marginTop: 20, display: 'inline-block', fontSize: 14 }}>Explore Our Program</a>
            <div style={{ position: 'absolute', bottom: -30, right: -30, width: 140, height: 140, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.7), rgba(214,188,243,0))', filter: 'blur(10px)' }} />
          </div>

          {/* Health Insights dashboard preview */}
          <div className="glass" style={{ padding: 30, backgroundColor: 'rgba(247,232,218,0.65)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, margin: 0 }}>
                Your Personalized Health Insights
              </h3>
              <span className="chip" style={{ fontSize: 10, padding: '6px 12px' }}>UPDATED TODAY</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 18, alignItems: 'center' }}>
              {/* Left stats column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: Icon.moon(16), label: 'Sleep Quality', val: 72 },
                  { icon: Icon.bolt(16), label: 'Energy',        val: 64 },
                  { icon: Icon.smile(16), label: 'Mood Balance', val: 68 },
                ].map((m) => (
                  <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,252,248,0.6)', borderRadius: 12, padding: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(214,188,243,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--plum)' }}>{m.icon}</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="label-sm" style={{ fontSize: 10 }}>{m.label}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}>
                        {m.val}<span style={{ fontSize: 11, color: 'var(--ink-faint)', marginLeft: 4 }}>/100</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Circular gauge */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="74" stroke="rgba(214,188,243,0.4)" strokeWidth="6" fill="none"/>
                  <circle cx="90" cy="90" r="74" stroke="var(--plum)" strokeWidth="6" fill="none"
                          strokeDasharray={`${0.68 * 2 * Math.PI * 74} ${2 * Math.PI * 74}`}
                          strokeLinecap="round" transform="rotate(-90 90 90)"/>
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center', width: 120 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 500, lineHeight: 1 }}>68</div>
                  <div className="label-sm" style={{ fontSize: 9, marginTop: 6, letterSpacing: '0.10em' }}>WELLNESS SCORE</div>
                  <div style={{ fontSize: 11, color: '#1f8a5b', marginTop: 6, fontWeight: 600 }}>● Good</div>
                </div>
              </div>
              {/* Focus areas */}
              <div>
                <div className="label-sm" style={{ marginBottom: 10 }}>Top Focus Areas</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Improve Sleep Quality', 'Balance Hormones', 'Reduce Stress'].map((f) => (
                    <li key={f} style={{ fontSize: 13, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#" className="btn-text" style={{ fontSize: 13, marginTop: 16, display: 'inline-block' }}>View Your Full Report</a>
              </div>
            </div>
          </div>

          {/* Real Women */}
          <div className="glass" style={{ padding: 30, backgroundColor: 'rgba(244,228,212,0.62)' }}>
            <div className="label-sm">Real Women. Real Stories.</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, margin: '12px 0', lineHeight: 1.18 }}>
              <em className="italic-emph">You're not alone.</em><br/>We're in this together.
            </h3>
            {/* Avatar stack */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 18 }}>
              {['tan', 'lavender', 'cream', 'tan'].map((tone, i) => (
                <div key={i} style={{
                  marginLeft: i ? -12 : 0,
                  width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
                  boxShadow: '0 0 0 3px var(--surface-bright), 0 4px 10px -4px rgba(74,54,100,0.18)',
                  position: 'relative', zIndex: 4 - i,
                }}>
                  <Placeholder label="" width="100%" height="100%" radius={0} tone={tone}/>
                </div>
              ))}
              <span className="chip" style={{ marginLeft: 14, fontSize: 10, padding: '6px 12px' }}>+2.1K</span>
            </div>
            <p className="body-md" style={{ marginTop: 16 }}>
              Join a community that uplifts, educates, and empowers.
            </p>
            <a href="#" className="btn-text" style={{ marginTop: 12, display: 'inline-block', fontSize: 14 }}>Read Their Stories</a>
          </div>
        </div>

        {/* Trust logos strip */}
        <div style={{ margin: '28px 64px 0' }}>
        <div className="glass" style={{ padding: '20px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 18 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontStyle: 'italic', color: 'var(--ink)' }}>
            Expert-led. Evidence-based. Designed for midlife.
          </span>
          <div style={{ display: 'flex', gap: 56, alignItems: 'center' }}>
            {['NAMS', 'ACOG', 'MAYO CLINIC', 'ENDOCRINE SOC.', '+ MORE PARTNERS'].map((l) => (
              <span key={l} className="mono" style={{ fontSize: 11, color: l.startsWith('+') ? 'var(--gold)' : 'var(--ink-soft)' }}>{l}</span>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* SHE STOPPED GUESSING — Intelligence Report value prop ---------- */}
      <section style={{ padding: '160px 64px 120px', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '4%', width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.20) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '0%', right: '-6%', width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.18) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 72, alignItems: 'center' }}>
          {/* Left: copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 32, height: 1, background: 'var(--gold)' }} />
              <span className="mono" style={{ color: 'var(--plum)' }}>YOUR HEALTH INTELLIGENCE REPORT</span>
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(44px, 4.6vw, 72px)', margin: 0 }}>
              She stopped<br/>guessing.<br/>
              <em className="italic-emph">You can too.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 28, maxWidth: 480 }}>
              A 120-question assessment built with NAMS-certified specialists. In under an afternoon, you receive a 34-page Health Intelligence Report — your stage, your radar of ten symptom domains, and a matched-clinician shortlist.
            </p>

            {/* Step rail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 36, borderTop: '1px solid rgba(74,54,100,0.10)' }}>
              {[
                ['01', 'Take the assessment', '~20 minutes · 120 questions'],
                ['02', 'Receive your report',  'Composite HIS score · 10-domain radar'],
                ['03', 'Meet your clinician',  'Three matched, NAMS-certified, ranked by fit'],
              ].map(([n, t, sub]) => (
                <div key={n} style={{
                  display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 20,
                  padding: '20px 0', borderBottom: '1px solid rgba(74,54,100,0.10)',
                  alignItems: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, color: 'var(--gold)', lineHeight: 1 }}>{n}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, lineHeight: 1.2 }}>{t}</div>
                    <div className="mono" style={{ marginTop: 6, color: 'var(--ink-soft)' }}>{sub}</div>
                  </div>
                  <span style={{ color: 'var(--plum)' }}>{Icon.arrow(16)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>
              <button className="btn btn-primary">Start free {Icon.arrow(16)}</button>
              <button className="btn btn-ghost">Read a sample report</button>
            </div>
          </div>

          {/* Right: framed editorial photo + floating chip */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <Placeholder
                label={"TWO WOMEN AT TABLE\nWITH PHONE · INTERIOR\nKINFOLK REGISTER"}
                width="100%" height={580} radius={6} tone="cream"
              />
              {/* thin gold frame, slightly offset */}
              <div style={{
                position: 'absolute', inset: -16, border: '1px solid var(--gold)',
                borderRadius: 8, pointerEvents: 'none',
              }} />
              {/* gold corner ticks */}
              <div style={{ position: 'absolute', top: -22, left: -22, width: 12, height: 12, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', top: -22, right: -22, width: 12, height: 12, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -22, left: -22, width: 12, height: 12, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -22, right: -22, width: 12, height: 12, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
            </div>

            {/* Floating "report preview" glass card overlapping bottom-left */}
            <div className="glass" style={{
              position: 'absolute', bottom: -32, left: -32, width: 280, padding: 22,
              borderRadius: 18,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#1f8a5b' }} />
                <span className="mono" style={{ color: 'var(--plum)' }}>YOUR REPORT IS READY</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, lineHeight: 1.2 }}>
                Stage III · Peri-meno
              </div>
              <span className="gold-rule" style={{ marginTop: 10 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 10 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 500, lineHeight: 1, color: 'var(--plum)' }}>68</div>
                <div className="mono" style={{ color: 'var(--ink-soft)' }}>HIS SCORE · 34 PP.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONFIDENCE — 4 editorial chapter cards -------------------------- */}
      <section style={{ position: 'relative', padding: '40px 64px 120px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', overflow: 'hidden' }}>
        {/* Quiet luxury orbs */}
        <div style={{ position: 'absolute', top: 120, right: '-8%', width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.22) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 80, left: '-6%', width: 460, height: 460, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.20) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Beautiful section header */}
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 880, margin: '0 auto 72px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>Chapter II.</span>
            <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
          </div>
          <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>A PROGRAM AS UNIQUE AS YOUR JOURNEY</div>
          <h2 className="headline">
            Confidence that grows <em className="italic-emph">with you.</em>
          </h2>
          <p className="body-lg" style={{ marginTop: 22, maxWidth: 640, margin: '22px auto 0' }}>
            Empress blends grounded clinical retrieval with hand-authored narrative — so your care evolves with your stage, your symptoms, and your goals.
          </p>
        </div>

        {/* 4 editorial chapter cards */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
          {[
            { n: 'I',   icon: Icon.sparkle(18),     title: 'Personalized AI Care',      sub: 'Your body, your blueprint.',
              body: 'Every symptom tells a story. Our AI listens, learns, and adapts — creating care pathways tailored to your stage. Support that feels personal, not generic.',
              tone: 'cream',    tint: 'rgba(255,250,244,0.55)', cite: 'GROUNDED · CHUNK-014' },
            { n: 'II',  icon: Icon.stethoscope(18), title: 'Trusted Experts',           sub: 'Guidance you can believe in.',
              body: 'From doctors to holistic coaches, our network of women\'s health specialists brings both science and compassion to midlife.',
              tone: 'lavender', tint: 'rgba(232,222,250,0.50)', cite: 'NAMS-CERTIFIED · 247' },
            { n: 'III', icon: Icon.chart(18),       title: 'See Your Progress',         sub: 'Clarity that empowers.',
              body: 'Track sleep, mood, energy, and more with simple insights that make sense. Watch your progress unfold and feel the confidence of seeing what\'s working.',
              tone: 'tan',      tint: 'rgba(247,232,218,0.55)', cite: 'HIS ENGINE · 10 DOMAINS' },
            { n: 'IV',  icon: Icon.community(18),   title: 'Community & Daily Uplift',  sub: 'Never alone on this journey.',
              body: 'Join women who truly get it. Uplifting daily affirmations and supportive community pods that keep you grounded, connected, and inspired.',
              tone: 'lavender', tint: 'rgba(232,222,250,0.50)', cite: 'AFFIRMATIONS · CITED' },
          ].map((c) => (
            <article key={c.title} className="glass lift" style={{
              backgroundColor: c.tint, padding: 0, overflow: 'hidden',
              display: 'flex', flexDirection: 'column', cursor: 'pointer',
              borderRadius: 22,
            }}>
              {/* Top: portrait fills the upper half, no padding */}
              <div style={{ position: 'relative', padding: 14, paddingBottom: 0 }}>
                <Placeholder label="PORTRAIT" width="100%" height={210} radius={14} tone={c.tone}/>
                {/* Roman numeral overlay top-left */}
                <div style={{
                  position: 'absolute', top: 26, left: 28,
                  fontFamily: 'var(--font-display)', fontSize: 36, fontStyle: 'italic',
                  color: 'var(--surface-bright)', textShadow: '0 2px 8px rgba(74,54,100,0.30)',
                  fontWeight: 500, lineHeight: 1,
                }}>{c.n}.</div>
                {/* Icon disc overlapping the bottom edge of the portrait */}
                <div style={{
                  position: 'absolute', bottom: -22, right: 28,
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.92)',
                  border: '1px solid rgba(255,255,255,0.95)',
                  boxShadow: '0 8px 18px -8px rgba(74,54,100,0.32), 0 1px 0 rgba(255,255,255,0.95) inset',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--plum)', backdropFilter: 'blur(8px)',
                }}>{c.icon}</div>
              </div>
              {/* Body */}
              <div style={{ padding: '36px 26px 26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 24, lineHeight: 1.18, margin: '0 0 6px' }}>{c.title}</h3>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--plum-mid)', marginBottom: 14 }}>
                  {c.sub}
                </div>
                <p className="body-md" style={{ margin: 0, flex: 1, fontSize: 14 }}>{c.body}</p>
                {/* Bottom rule + citation tag */}
                <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(74,54,100,0.10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ color: 'var(--gold)' }}>{c.cite}</span>
                  <span style={{ color: 'var(--plum)', display: 'inline-flex' }}>{Icon.arrow(14)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL — editorial pull quote with portrait inset ---------- */}
      <section style={{ position: 'relative', padding: '160px 64px', background: 'var(--surface-cream)', overflow: 'hidden' }}>
        {/* Quiet decorative arcs */}
        <svg style={{ position: 'absolute', top: 60, left: -160, opacity: 0.5, pointerEvents: 'none' }} width="420" height="420" viewBox="0 0 420 420">
          <circle cx="210" cy="210" r="200" stroke="var(--gold)" strokeWidth="0.6" fill="none"/>
          <circle cx="210" cy="210" r="150" stroke="var(--gold)" strokeWidth="0.4" fill="none"/>
          <circle cx="210" cy="210" r="100" stroke="var(--gold)" strokeWidth="0.3" fill="none"/>
        </svg>
        <div style={{ position: 'absolute', bottom: -200, right: -120, width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.28) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.9fr 1.2fr', gap: 64, alignItems: 'center' }}>
          {/* Left: small portrait inset on cream — feathered */}
          <div style={{ position: 'relative', height: 480 }}>
            <Placeholder label={"MEMBER\nPOOJA · 53\nNATURAL LIGHT"} width="100%" height="100%" radius={4} tone="tan" />
            {/* gold corner brackets */}
            <div style={{ position: 'absolute', top: -8, left: -8, width: 28, height: 28, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
            <div style={{ position: 'absolute', bottom: -8, right: -8, width: 28, height: 28, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
          </div>

          {/* Right: pull quote */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span style={{ display: 'inline-block', width: 32, height: 1, background: 'var(--gold)' }} />
              <span className="mono" style={{ color: 'var(--plum)' }}>WHAT OUR CUSTOMERS ARE SAYING</span>
            </div>
            <h2 className="headline" style={{ margin: 0, marginBottom: 28 }}>
              Real experiences,<br/><em className="italic-emph">from our community.</em>
            </h2>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(26px, 2.7vw, 38px)', lineHeight: 1.32, color: 'var(--ink)', margin: 0, textWrap: 'pretty',
            }}>
              "The Ask Empress chatbot felt like talking to a wise friend who actually gets what I'm going through. It guided me when I felt most confused."
            </p>
            <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 24 }}>
              <span style={{ display: 'inline-block', width: 60, height: 1, background: 'var(--gold)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500 }}>— Pooja</div>
                <div className="mono" style={{ marginTop: 4 }}>MEMBER · STAGE III · 11 MONTHS</div>
              </div>
              <div className="stars" style={{ marginLeft: 'auto', color: 'var(--gold)' }}>★★★★★</div>
            </div>
            <div className="mono" style={{ marginTop: 30, paddingTop: 18, borderTop: '1px dashed rgba(74,54,100,0.18)', color: 'var(--gold)' }}>
              SOURCES · CHUNK-014 · CHUNK-019 · NAMS 2023
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT THAT LEARNS YOU — stats in soft lavender glass --------- */}
      <section style={{ padding: '140px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #ece1f3 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: '8%', width: 540, height: 540, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -200, left: '-4%', width: 580, height: 580, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.32) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>Chapter III.</span>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
            </div>
            <h2 className="headline">
              Support that <em className="italic-emph">learns you.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22 }}>
              AI insights + expert guidance help you find balance, relief, and confidence — built around your symptoms, not someone else's.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
            {[
              { big: '500+', label: 'Early adopters testing with confidence',
                sub: 'A growing community of women — sharing what works and what doesn\'t.', icon: Icon.community(20) },
              { big: '90%',  label: 'Report meaningful engagement',
                sub: 'Members who use Empress weekly say it shifts how they understand their bodies.', icon: Icon.chart(20) },
              { big: 'Yours', label: 'Privacy first — your data, your control',
                sub: 'Encrypted. Never sold. You can export or delete everything in one click.', icon: Icon.shield(20) },
              { big: '24/7',  label: 'Expert team — doctors, therapists, coaches',
                sub: 'NAMS-certified specialists on call. Plus daily affirmations and community pods.', icon: Icon.stethoscope(20) },
            ].map((s, i) => (
              <div key={i} className="glass lift" style={{
                padding: 28, backgroundColor: 'rgba(255,252,248,0.55)',
                display: 'flex', flexDirection: 'column', gap: 14, minHeight: 280,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(214,188,243,0.35)', border: '1px solid rgba(255,255,255,0.8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--plum)',
                }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 500, lineHeight: 1, color: 'var(--plum)', marginTop: 8 }}>
                  {s.big}
                </div>
                <span className="gold-rule" style={{ margin: '6px 0' }} />
                <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.3 }}>{s.label}</div>
                <p className="body-md" style={{ margin: 0, fontSize: 13 }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ASK EMPRESS — chat companion feature ---------------------------- */}
      <section style={{ padding: '140px 64px', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', right: '-4%', width: 460, height: 460, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.22) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 80, alignItems: 'center' }}>
          {/* Left: copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 32, height: 1, background: 'var(--gold)' }} />
              <span className="mono" style={{ color: 'var(--plum)' }}>YOUR 24/7 COMPANION</span>
            </div>
            <h2 className="headline">
              Ask Empress.<br/>
              <em className="italic-emph">She gets it.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 24, maxWidth: 480 }}>
              Instant, personalized answers powered by AI + guided by experts. Hot flashes at 3 a.m., a sudden brain-fog week, a question you'd never ask your GP — Ask Empress meets you where you are.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 32 }}>
              {[
                'Evidence-based replies in seconds',
                'Cites the source chunk on every answer',
                'Hand-off to a NAMS-certified clinician when you need one',
              ].map((line, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="var(--gold)" strokeWidth="0.8"/>
                    <path d="M5 8 L7 10 L11 6" stroke="var(--plum)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  <span style={{ fontSize: 14, color: 'var(--ink)' }}>{line}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" style={{ marginTop: 36 }}>Ask Empress {Icon.arrow(16)}</button>
          </div>

          {/* Right: chat preview mockup */}
          <div className="glass" style={{
            backgroundColor: 'rgba(255,252,248,0.65)', padding: 0, overflow: 'hidden',
            borderRadius: 24, display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 480,
          }}>
            {/* Sidebar */}
            <div style={{
              background: 'linear-gradient(180deg, var(--plum) 0%, #2a1b3f 100%)',
              padding: '24px 18px', color: '#fff', position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(214,188,243,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--plum-mist)' }}>
                  {Icon.sparkle(14)}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500 }}>Ask Empress</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recent chats</div>
              {['Hot Flashes & Sleep', 'Mood Swings & Stress', 'Skin Changes & Care'].map((t, i) => (
                <div key={t} style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.85)', padding: '8px 10px', borderRadius: 6,
                  marginBottom: 4, background: i === 0 ? 'rgba(255,255,255,0.10)' : 'transparent',
                }}>{t}</div>
              ))}
              <div style={{ position: 'absolute', bottom: 18, left: 18, right: 18, display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden' }}>
                  <Placeholder label="" width="100%" height="100%" radius={0} tone="lavender"/>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>Stella Addison</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Free plan</div>
                </div>
              </div>
            </div>
            {/* Conversation */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* User msg */}
              <div style={{ alignSelf: 'flex-end', maxWidth: '78%', background: 'rgba(232,222,250,0.6)', padding: '12px 14px', borderRadius: 14, fontSize: 13, color: 'var(--ink)', lineHeight: 1.45 }}>
                I've been having hot flashes at night, and it's ruining my sleep. What can I do?
              </div>
              {/* Empress reply */}
              <div style={{ alignSelf: 'flex-start', maxWidth: '82%', background: 'rgba(255,255,255,0.85)', padding: '14px 16px', borderRadius: 14, fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, border: '1px solid rgba(74,54,100,0.06)' }}>
                You're not alone — many women experience this. Let's try a few evidence-based strategies like cooling techniques, gentle evening routines, and I can also connect you with sleep-focused experts.
                <div className="mono" style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(74,54,100,0.15)', color: 'var(--gold)' }}>
                  SOURCES · CHUNK-088 · NAMS § 4.2
                </div>
              </div>
              {/* User msg 2 */}
              <div style={{ alignSelf: 'flex-end', maxWidth: '78%', background: 'rgba(232,222,250,0.6)', padding: '12px 14px', borderRadius: 14, fontSize: 13, color: 'var(--ink)', lineHeight: 1.45 }}>
                I've tried sleeping with a fan, but it doesn't help much. Other options?
              </div>
              {/* Composer */}
              <div style={{
                marginTop: 'auto', padding: '12px 14px', borderRadius: 14,
                background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(74,54,100,0.10)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-faint)' }}>Ask Empress anything…</span>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: 'var(--plum)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{Icon.arrow(14)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEET YOUR CARE TEAM — editorial grid of clinicians -------------- */}
      <section style={{ padding: '140px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f7eee5 60%, var(--surface) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 60, left: '40%', width: 460, height: 460, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.18) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>Chapter IV.</span>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
            </div>
            <h2 className="headline">
              Meet your <em className="italic-emph">care team.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22 }}>
              Expert guidance from specialists who actually understand the midlife journey — NAMS-certified clinicians, women's health PTs, and meno-coaches.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18 }}>
            {[
              { name: 'Dr. M. Chen',     spec: 'Menopause Practitioner', tone: 'cream' },
              { name: 'Dr. R. Patel',    spec: 'Endocrinologist · NAMS', tone: 'lavender' },
              { name: 'Sara Okonkwo',    spec: 'Pelvic Floor PT',         tone: 'tan' },
              { name: 'Dr. L. Iversen',  spec: 'Sleep & Hormones',        tone: 'cream' },
              { name: 'Maya Russo',      spec: 'Meno-Coach · Nutrition',  tone: 'lavender' },
            ].map((p) => (
              <div key={p.name} className="lift" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <Placeholder label="HEADSHOT" width="100%" height={260} radius={6} tone={p.tone}/>
                  {/* gold corner ticks */}
                  <div style={{ position: 'absolute', top: -6, left: -6, width: 14, height: 14, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
                  <div style={{ position: 'absolute', bottom: -6, right: -6, width: 14, height: 14, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
                </div>
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, lineHeight: 1.2 }}>{p.name}</div>
                  <div className="mono" style={{ marginTop: 6, color: 'var(--plum)' }}>{p.spec}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <a href="#" style={{ fontSize: 14, color: 'var(--plum)', textDecoration: 'none', borderBottom: '1px solid var(--gold)', paddingBottom: 4 }}>
              See all 247 NAMS-certified practitioners →
            </a>
          </div>
        </div>
      </section>

      {/* CTA — luxury sign-off, soft and seamless with the page --------- */}
      <section style={{ padding: '40px 64px 120px', position: 'relative' }}>
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 32,
          background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)',
          padding: '100px 80px', color: 'var(--ink)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 30px 80px -40px rgba(74,54,100,0.25)',
        }}>
          {/* Iridescent luxury orbs */}
          <div style={{ position: 'absolute', top: -160, right: -120, width: 540, height: 540, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85) 0%, rgba(214,188,243,0) 60%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -180, left: '30%', width: 460, height: 460, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(247,222,196,0.55) 0%, rgba(247,222,196,0) 65%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '30%', left: -120, width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          {/* Subtle gold concentric ornament top-right */}
          <svg style={{ position: 'absolute', top: 36, right: 36, opacity: 0.35, pointerEvents: 'none' }} width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="72" stroke="var(--gold)" strokeWidth="0.5" fill="none"/>
            <circle cx="80" cy="80" r="52" stroke="var(--gold)" strokeWidth="0.5" fill="none"/>
            <circle cx="80" cy="80" r="32" stroke="var(--gold)" strokeWidth="0.5" fill="none"/>
            <circle cx="80" cy="80" r="2" fill="var(--gold)"/>
          </svg>

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.5fr 0.9fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <span style={{ display: 'inline-block', width: 36, height: 1, background: 'var(--gold)' }} />
                <span className="mono" style={{ color: 'var(--plum)' }}>BEGIN WHEN YOU'RE READY</span>
              </div>
              <h2 className="display" style={{ margin: 0, color: 'var(--plum)', fontSize: 'clamp(48px, 5vw, 76px)' }}>
                You've waited long enough to feel like <em className="italic-emph" style={{ color: 'var(--plum-mid)' }}>yourself.</em>
              </h2>
              <p className="body-lg" style={{ marginTop: 28, color: 'var(--ink-soft)', maxWidth: 520, fontSize: 18 }}>
                Take the 120-question assessment. Get your 34-page Health Intelligence Report. Match with a NAMS-certified clinician — all on your timeline.
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 40 }}>
                <button className="btn btn-primary">Start Free {Icon.arrow(16)}</button>
                <button className="btn" style={{ background: 'rgba(255,252,248,0.65)', color: 'var(--plum)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.7)' }}>Read a sample report</button>
              </div>
              <div style={{ display: 'flex', gap: 36, marginTop: 48, paddingTop: 36, borderTop: '1px solid rgba(74,54,100,0.12)' }}>
                {[
                  ['$139', 'one-time, full report'],
                  ['$12',  'per month, subscription'],
                  ['247',  'NAMS-certified clinicians'],
                ].map(([n, l]) => (
                  <div key={n}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 500, color: 'var(--plum)', lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 8, letterSpacing: '0.04em' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating glass card */}
            <div className="glass" style={{
              padding: 28, backgroundColor: 'rgba(255,252,248,0.55)',
              borderRadius: 22,
            }}>
              <div className="mono" style={{ color: 'var(--plum)' }}>YOUR MATCHED CLINICIAN</div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 18 }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 2px rgba(255,255,255,0.9)' }}>
                  <Placeholder label="" width="100%" height="100%" radius={0} tone="lavender" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', fontWeight: 500 }}>Dr. M. Chen, MD</div>
                  <div className="mono" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>NAMS-CERTIFIED · 14 YRS</div>
                </div>
              </div>
              <span className="gold-rule" style={{ marginTop: 22, marginBottom: 18 }} />
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink)', lineHeight: 1.5 }}>
                "Empress is the first platform whose intake I'd actually want to read before a consultation."
              </p>
              <div className="mono" style={{ marginTop: 18, color: 'var(--gold)' }}>SOURCE · MEMBER INTERVIEW 037</div>
            </div>
          </div>

          {/* Footer mark */}
          <div style={{ position: 'absolute', bottom: 28, left: 80, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--gold)' }} />
            <span className="mono" style={{ color: 'var(--ink-soft)' }}>EMPRESS HEALTH · EST. 2024 · GROUNDED CARE</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

Object.assign(window, { HomeV1 });
