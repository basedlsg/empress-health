/* global React, Placeholder, Nav, Icon, Footer */
// Health Assessment — Editorial preview of the 120-question intake + 34-page report.

function HealthAssessment() {
  // Pre-compute a radar polygon for visual consistency.
  const radarPts = [
    ['Sleep', 0.72], ['Mood', 0.68], ['Energy', 0.64], ['Cognition', 0.58],
    ['Heat', 0.46], ['Pain', 0.62], ['Sex', 0.55], ['Skin', 0.71], ['Heart', 0.78], ['Bone', 0.66],
  ];
  const RX = 140, RY = 140, CX = 180, CY = 180;
  const poly = radarPts.map(([_, v], i) => {
    const a = (i / radarPts.length) * Math.PI * 2 - Math.PI / 2;
    return [CX + Math.cos(a) * RX * v, CY + Math.sin(a) * RY * v];
  });

  return (
    <div data-screen-label="Health Assessment" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={2} base="" />
      </div>

      {/* ───── HERO — "Open the report" editorial spread ───────── */}
      <section style={{ position: 'relative', padding: '40px 64px 100px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -180, right: -120, width: 720, height: 720, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.30) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--gold)' }} />
              <span className="mono" style={{ color: 'var(--plum)' }}>YOUR HEALTH INTELLIGENCE REPORT</span>
            </div>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(48px, 5.6vw, 86px)' }}>
              120 questions.<br/>34 pages.<br/><em className="italic-emph">One you.</em>
            </h1>
            <p className="body-lg" style={{ marginTop: 28, maxWidth: 480 }}>
              The most thorough menopause assessment outside a clinic. Built with NAMS-certified specialists, scored by an evidence-graded engine, and written so you can actually read it on the train home.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>
              <button className="btn btn-primary">Take the assessment {Icon.arrow(16)}</button>
              <button className="btn btn-ghost">Read a sample report</button>
            </div>
            <div style={{ display: 'flex', gap: 48, marginTop: 56, paddingTop: 32, borderTop: '1px solid rgba(74,54,100,0.10)' }}>
              {[
                ['~20', 'minute intake'],
                ['10', 'symptom domains'],
                ['Yours', 'forever · export anytime'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--plum)', fontWeight: 500, lineHeight: 1 }}>{n}</div>
                  <div className="mono" style={{ marginTop: 8, color: 'var(--ink-soft)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: layered "spread" — three offset glass cards mimicking pages of the report */}
          <div style={{ position: 'relative', height: 620 }}>
            {/* Background spread — radar */}
            <div className="glass" style={{
              position: 'absolute', top: 0, right: 0, width: 380, padding: 28,
              borderRadius: 22, transform: 'rotate(-4deg)',
            }}>
              <div className="mono" style={{ color: 'var(--gold)' }}>PP. 04 · DOMAIN RADAR</div>
              <svg width="360" height="360" viewBox="0 0 360 360" style={{ marginTop: 12 }}>
                {/* concentric rings */}
                {[0.25, 0.5, 0.75, 1].map((r) => (
                  <circle key={r} cx={CX} cy={CY} r={RX * r} stroke="rgba(74,54,100,0.10)" strokeWidth="0.6" fill="none"/>
                ))}
                {/* axes */}
                {radarPts.map(([label], i) => {
                  const a = (i / radarPts.length) * Math.PI * 2 - Math.PI / 2;
                  const x2 = CX + Math.cos(a) * RX;
                  const y2 = CY + Math.sin(a) * RY;
                  const lx = CX + Math.cos(a) * (RX + 14);
                  const ly = CY + Math.sin(a) * (RY + 14);
                  return (
                    <g key={label}>
                      <line x1={CX} y1={CY} x2={x2} y2={y2} stroke="rgba(74,54,100,0.08)" strokeWidth="0.6" />
                      <text x={lx} y={ly} fontSize="9" fontFamily="JetBrains Mono" fill="#33204c" textAnchor="middle" dominantBaseline="middle" letterSpacing="0.08em">{label.toUpperCase()}</text>
                    </g>
                  );
                })}
                <polygon points={poly.map((p) => p.join(',')).join(' ')}
                         fill="rgba(74,54,100,0.18)" stroke="var(--plum)" strokeWidth="1.2" strokeLinejoin="round" />
                {poly.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="var(--gold)" />
                ))}
              </svg>
            </div>

            {/* Front spread — score */}
            <div className="glass" style={{
              position: 'absolute', bottom: 20, left: 0, width: 340, padding: 30,
              borderRadius: 22, transform: 'rotate(3deg)', backgroundColor: 'rgba(255,252,248,0.78)',
            }}>
              <div className="mono" style={{ color: 'var(--gold)' }}>PP. 01 · COVER</div>
              <div style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>
                Your Intelligence<br/>Report
              </div>
              <span className="gold-rule" style={{ marginTop: 12 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 14 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 72, lineHeight: 1, color: 'var(--plum)' }}>68</span>
                <span className="mono" style={{ color: 'var(--ink-soft)' }}>HIS · STAGE III</span>
              </div>
              <div className="mono" style={{ marginTop: 18, color: 'var(--ink-faint)' }}>NAMS-GRADED · 34 PP. · BOUND</div>
            </div>

            {/* Floating tag */}
            <div className="glass" style={{
              position: 'absolute', top: 220, right: -20, width: 220, padding: 18,
              borderRadius: 16, transform: 'rotate(1deg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1f8a5b' }} />
                <span className="mono" style={{ color: 'var(--plum)' }}>READY TO READ</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginTop: 8, lineHeight: 1.25 }}>
                Delivered in <em className="italic-emph">11 minutes.</em>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS — three-step ribbon ─────────────────── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)', borderBottom: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 80px' }}>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>HOW IT WORKS</div>
            <h2 className="headline">
              From answer<br/><em className="italic-emph">to insight.</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {[
              { n: 'I.',  t: 'Tell us, in your words', sub: '~20 min',
                body: '120 questions across ten domains. Answer in your own language — frequency, intensity, what it stops you from doing. Pause and resume; we save as you go.' },
              { n: 'II.', t: 'We score, you read',     sub: '~10 min',
                body: 'A scored composite — the Health Intelligence Score — plus a domain radar. You see what is loud, what is quiet, and what should be next.' },
              { n: 'III.', t: 'Match a clinician',     sub: 'optional',
                body: 'Three NAMS-certified menopause specialists matched to your case, ranked by fit. Book directly. Or take your report to your own doctor — you own it either way.' },
            ].map((s) => (
              <div key={s.n} style={{ padding: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '1px solid var(--ink)', paddingTop: 18 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 38, color: 'var(--gold)', lineHeight: 1 }}>{s.n}</span>
                  <span className="mono" style={{ color: 'var(--ink-faint)' }}>{s.sub}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, margin: '22px 0 12px', lineHeight: 1.2 }}>
                  {s.t}
                </h3>
                <p className="body-md" style={{ margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── INSIDE THE ASSESSMENT — sample questions ─────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 100, left: '-6%', width: 460, height: 460, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.22) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>SAMPLE QUESTIONS · CHAPTER 04</div>
            <h2 className="headline" style={{ margin: 0 }}>
              The questions a good<br/>doctor would ask,<br/><em className="italic-emph">if she had two hours.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22 }}>
              Each chapter is built with menopause specialists, then field-tested with 500+ early adopters. You don't see all 120 — you see the ones that change the answer.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '36px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Sleep architecture',  '14 items'],
                ['Vasomotor symptoms',  '11 items'],
                ['Mood & affect',       '15 items'],
                ['Energy & cognition',  '12 items'],
                ['Pain & joints',       '9 items'],
                ['Skin, hair, weight',  '10 items'],
                ['Sex & intimacy',      '9 items'],
                ['Cardiometabolic',     '13 items'],
                ['Bone & musculoskel.', '10 items'],
                ['Lived context',       '17 items'],
              ].map(([label, n]) => (
                <li key={label} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 16,
                  padding: '12px 0', borderBottom: '1px dashed rgba(74,54,100,0.18)',
                }}>
                  <span style={{ fontSize: 15, color: 'var(--ink)' }}>{label}</span>
                  <span className="mono" style={{ color: 'var(--ink-faint)' }}>{n}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: mock question card */}
          <div className="glass" style={{ padding: 36, borderRadius: 24, backgroundColor: 'rgba(255,252,248,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ color: 'var(--plum)' }}>CHAPTER 04 · SLEEP ARCHITECTURE</span>
              <span className="mono" style={{ color: 'var(--ink-faint)' }}>Q 38 / 120</span>
            </div>
            {/* progress */}
            <div style={{ height: 3, background: 'rgba(74,54,100,0.10)', borderRadius: 2, marginTop: 14, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '32%', background: 'var(--gold)' }} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 500, lineHeight: 1.25, margin: '36px 0 6px' }}>
              When you wake in the middle of the night, how often does it happen <em className="italic-emph">because of heat?</em>
            </h3>
            <p className="body-md" style={{ margin: '8px 0 28px' }}>
              We're looking for a pattern — not a diagnosis. Be approximate; we score the contour.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Never or almost never',         false],
                ['A handful of nights a month',   false],
                ['Most weeks, a couple nights',   true],
                ['Most nights',                   false],
                ['Multiple times most nights',    false],
              ].map(([label, sel], i) => (
                <button key={label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 18px', borderRadius: 14,
                  background: sel ? 'rgba(74,54,100,0.06)' : 'rgba(255,255,255,0.65)',
                  border: sel ? '1px solid var(--plum)' : '1px solid rgba(74,54,100,0.10)',
                  color: 'var(--ink)', textAlign: 'left', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 14,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: sel ? '5px solid var(--plum)' : '1.5px solid rgba(74,54,100,0.25)',
                    }} />
                    {label}
                  </span>
                  <span className="mono" style={{ color: 'var(--ink-faint)' }}>{String.fromCharCode(65 + i)}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
              <span className="mono" style={{ color: 'var(--gold)' }}>~ 11 MIN REMAINING</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 13 }}>Back</button>
                <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>Next {Icon.arrow(14)}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── THE REPORT — six-up grid of "pages" ──────────────── */}
      <section style={{ padding: '160px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 72px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>The 34-page report.</span>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
            </div>
            <h2 className="headline">
              Six things you'll<br/><em className="italic-emph">actually use.</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {[
              { pp: 'PP. 01–04', t: 'Cover & HIS score',       sub: 'Your composite score with confidence interval.', tint: 'rgba(232,222,250,0.55)' },
              { pp: 'PP. 05–10', t: 'Domain radar',             sub: 'Ten symptom domains, on one page.',              tint: 'rgba(247,232,218,0.55)' },
              { pp: 'PP. 11–16', t: 'Stage & trajectory',       sub: 'Where you are. Where you are likely going.',     tint: 'rgba(247,222,196,0.55)' },
              { pp: 'PP. 17–22', t: 'Personalized protocol',    sub: 'A first month plan, drafted by your clinician.', tint: 'rgba(232,222,250,0.55)' },
              { pp: 'PP. 23–28', t: 'Clinician shortlist',      sub: 'Three matched specialists, ranked by fit.',      tint: 'rgba(247,232,218,0.55)' },
              { pp: 'PP. 29–34', t: 'Citations & sources',      sub: 'Every recommendation traced to a chunk.',         tint: 'rgba(247,222,196,0.55)' },
            ].map((p, i) => (
              <article key={p.t} className="glass lift" style={{
                padding: 0, backgroundColor: p.tint, borderRadius: 22, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ padding: '24px 26px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ color: 'var(--gold)' }}>{p.pp}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, color: 'var(--plum)' }}>
                      {['I', 'II', 'III', 'IV', 'V', 'VI'][i]}.
                    </span>
                  </div>
                </div>
                <div style={{ padding: '20px 26px 26px' }}>
                  <Placeholder
                    label={`SPREAD PHOTOGRAPHY\n${p.t.toUpperCase()}`}
                    width="100%" height={180} radius={12} tone={i % 3 === 0 ? 'lavender' : i % 3 === 1 ? 'cream' : 'tan'} />
                </div>
                <div style={{ padding: '0 26px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, margin: 0, lineHeight: 1.2 }}>{p.t}</h3>
                  <p className="body-md" style={{ marginTop: 8 }}>{p.sub}</p>
                  <span className="gold-rule" style={{ marginTop: 'auto' }} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── SAMPLE PROTOCOL PAGE — single-spread close-up ────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 60, right: '-8%', width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.20) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>SAMPLE · PROTOCOL PAGE 19</div>
            <h2 className="headline" style={{ margin: 0 }}>
              A plan that<br/><em className="italic-emph">reads like a letter.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22, maxWidth: 480 }}>
              No jargon dumps, no PDF wall-of-text. Every recommendation is one sentence, one citation, one expected effect — written as if your clinician sat down to explain it.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '36px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                'Plain English first, clinical terms in mono parentheses',
                'Every claim cites the chunk it came from',
                'Expected effect window written, not implied',
                'Editable with your physician — not locked',
              ].map((b) => (
                <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="var(--gold)" strokeWidth="0.6"/>
                    <path d="M4 7l2 2 4-4" stroke="var(--plum)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  <span style={{ fontSize: 14, color: 'var(--ink)' }}>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: editorial "magazine page" mockup */}
          <div style={{
            background: 'var(--surface-bright)',
            border: '1px solid rgba(74,54,100,0.10)', borderRadius: 6,
            padding: '44px 48px', boxShadow: '0 30px 80px -40px rgba(74,54,100,0.30)',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="mono" style={{ color: 'var(--gold)' }}>PROTOCOL · PAGE 19</div>
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--plum)' }}>Chapter IV.</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 36, lineHeight: 1.2, margin: '28px 0 14px' }}>
              For your nights:<br/><em className="italic-emph">cool the room, not the body.</em>
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7,
              color: 'var(--ink)', margin: 0,
            }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                fontSize: 56, color: 'var(--plum)', lineHeight: 0.8,
                float: 'left', marginRight: 10, marginTop: 4,
              }}>F</span>
              or the next two weeks, hold the room at 64–67°F overnight and skip the fan on the body. The smaller temperature gradient lets your core temperature drop on its own schedule — which is what predicts a vasomotor-quiet night, not how cold the surface feels.
              <span className="mono" style={{ color: 'var(--gold)', marginLeft: 8 }}>(NAMS § 4.2 · CHUNK-088)</span>
            </p>
            <p className="body-md" style={{ marginTop: 18 }}>
              Expected effect window: 9–14 nights to see a measurable shift in sleep continuity. If you see none, we'll move to layer two.
            </p>
            <div className="mono" style={{ marginTop: 24, paddingTop: 14, borderTop: '1px dashed rgba(74,54,100,0.18)', color: 'var(--gold)' }}>
              REVIEWED · DR. M. CHEN · NAMS · 14 MAY MMXXVI
            </div>
            <span style={{ position: 'absolute', bottom: 18, right: 18, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-faint)' }}>· 19 ·</span>
          </div>
        </div>
      </section>

      {/* ───── PRIVACY ──────────────────────────────────────────── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48 }}>
          {[
            { t: 'Encrypted, end-to-end',       body: 'Your answers, your report, your clinician notes — encrypted at rest and in transit. HIPAA-aligned, never advertised against.' },
            { t: 'Exportable, in one click',     body: 'PDF, JSON, or a printable doctor-facing summary. Take your report wherever you go.' },
            { t: 'Deletable, no follow-up',     body: 'One button. We delete every artifact, including backups, within 30 days. No "are you sure?" guilt-trip.' },
          ].map((c, i) => (
            <div key={c.t}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <span style={{ display: 'inline-block', width: 20, height: 1, background: 'var(--gold)' }} />
                <span className="mono" style={{ color: 'var(--plum)' }}>0{i + 1}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 26, margin: '0 0 10px', lineHeight: 1.25 }}>{c.t}</h3>
              <p className="body-md" style={{ margin: 0 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── CLOSING CTA ──────────────────────────────────────── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface)' }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          position: 'relative', overflow: 'hidden', borderRadius: 32,
          background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)',
          padding: '80px 80px',
          border: '1px solid rgba(255,255,255,0.5)',
        }}>
          <div style={{ position: 'absolute', top: -120, right: -80, width: 460, height: 460, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(40px)' }} />

          <div style={{ position: 'relative', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>~20 MINUTES · YOUR OWN PACE</div>
            <h2 className="display" style={{ margin: 0, fontSize: 'clamp(40px, 4.6vw, 64px)', color: 'var(--plum)' }}>
              The report you've<br/>been wanting<br/>
              <em className="italic-emph" style={{ color: 'var(--plum-mid)' }}>your doctor to read.</em>
            </h2>
            <div style={{ display: 'flex', gap: 14, marginTop: 36, justifyContent: 'center' }}>
              <button className="btn btn-primary">Take the assessment {Icon.arrow(16)}</button>
              <button className="btn" style={{ background: 'rgba(255,252,248,0.65)', color: 'var(--plum)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.7)' }}>Read a sample report</button>
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
