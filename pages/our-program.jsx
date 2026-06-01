/* global React, Placeholder, Nav, Icon, Footer */
// Our Program — Editorial: 12 weeks framed as a three-chapter journey.

function OurProgram() {
  return (
    <div data-screen-label="Our Program" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      {/* ───── HERO ──────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={1} base="" />
      </div>

      {/* Editorial cover: oversized roman numeral, italic display, sidebar credits */}
      <section style={{ position: 'relative', padding: '20px 64px 100px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -180, width: 720, height: 720, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.32) 0%, rgba(214,188,243,0) 65%)',
          filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -120, width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.20) 0%, rgba(247,222,196,0) 70%)',
          filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto', display: 'grid',
                      gridTemplateColumns: '240px 1fr 1fr', gap: 56, alignItems: 'start', minHeight: 720 }}>
          {/* Left rail — masthead */}
          <div style={{ paddingTop: 40, borderRight: '1px solid rgba(74,54,100,0.10)', paddingRight: 24 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>VOLUME I · ISSUE 03</div>
            <div className="mono" style={{ marginTop: 8, color: 'var(--ink-faint)' }}>SUMMER · MMXXVI</div>
            <div style={{ marginTop: 56, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--plum)', lineHeight: 1.4 }}>
              "A program as<br/>unique as<br/>your journey."
            </div>
            <span className="gold-rule" style={{ margin: '16px 0' }} />
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>EDITORIAL · A. KAPLAN, MD</div>
            <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="#chapters" className="mono" style={{ color: 'var(--plum)', textDecoration: 'none' }}>I · DISCOVER ↓</a>
              <a href="#weeks" className="mono" style={{ color: 'var(--plum)', textDecoration: 'none' }}>II · STABILIZE ↓</a>
              <a href="#sustain" className="mono" style={{ color: 'var(--plum)', textDecoration: 'none' }}>III · SUSTAIN ↓</a>
              <a href="#price" className="mono" style={{ color: 'var(--plum)', textDecoration: 'none' }}>IV · MEMBERSHIP ↓</a>
            </div>
          </div>

          {/* Middle — big editorial type */}
          <div style={{ paddingTop: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--gold)' }} />
              <span className="mono" style={{ color: 'var(--plum)' }}>THE TWELVE-WEEK PROGRAM</span>
            </div>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(56px, 6.4vw, 104px)', lineHeight: 0.98 }}>
              Twelve weeks.<br/>Three chapters.<br/>
              <em className="italic-emph">One you.</em>
            </h1>
            <p className="body-lg" style={{ marginTop: 32, maxWidth: 480, fontSize: 19 }}>
              A guided arc built around your biology and your life — not a 30-day fix. Every week, a small move forward. Every month, a chapter that changes how you feel.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 40 }}>
              <button className="btn btn-primary">Start the assessment {Icon.arrow(16)}</button>
              <button className="btn btn-ghost">Download syllabus (PDF)</button>
            </div>
          </div>

          {/* Right — oversized roman numeral + portrait below */}
          <div style={{ position: 'relative', paddingTop: 20 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400,
              fontSize: 280, lineHeight: 0.85, color: 'var(--plum)',
              opacity: 0.92, letterSpacing: '-0.04em', textAlign: 'right',
            }}>XII</div>
            <div style={{ position: 'relative', marginTop: -40 }}>
              <Placeholder
                label={"COVER PORTRAIT\nWOMAN 50S · ROBE\nNATURAL WINDOW LIGHT"}
                width="100%" height={420} radius={6} tone="cream"
              />
              {/* gold corner ticks */}
              {[
                ['top:-8px;left:-8px',     'top:1px;left:1px'],
                ['top:-8px;right:-8px',    'top:1px;right:1px'],
                ['bottom:-8px;left:-8px',  'bottom:1px;left:1px'],
                ['bottom:-8px;right:-8px', 'bottom:1px;right:1px'],
              ].map(([pos], i) => {
                const [k1, v1, k2, v2] = pos.split(/[:;]/);
                const s = { position: 'absolute', width: 14, height: 14, [k1.trim()]: v1.trim(), [k2.trim()]: v2.trim() };
                if (i === 0) Object.assign(s, { borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' });
                if (i === 1) Object.assign(s, { borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' });
                if (i === 2) Object.assign(s, { borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' });
                if (i === 3) Object.assign(s, { borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' });
                return <div key={i} style={s} />;
              })}
            </div>
            <div className="mono" style={{ marginTop: 18, color: 'var(--gold)', textAlign: 'right' }}>
              PHOTOGRAPHED · BROOKLYN STUDIO · 2026
            </div>
          </div>
        </div>
      </section>

      {/* ───── ONE-LINER PROMISE STRIP ──────────────────────────── */}
      <section style={{ padding: '36px 64px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)', borderBottom: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 56, alignItems: 'center' }}>
          {[
            ['12', 'guided weeks'],
            ['34pp', 'intelligence report'],
            ['1:1', 'NAMS-certified care'],
            ['∞', 'lifetime access'],
          ].map(([n, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 44, color: 'var(--plum)', lineHeight: 1 }}>{n}</span>
              <span className="mono" style={{ color: 'var(--ink-soft)' }}>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ───── THREE CHAPTERS — magazine spread ─────────────────── */}
      <section id="chapters" style={{ position: 'relative', padding: '160px 64px 100px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 80, right: '-8%', width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.22) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 80px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>The arc.</span>
              <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
            </div>
            <h2 className="headline">
              Three chapters,<br/><em className="italic-emph">each four weeks long.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22 }}>
              The program is paced so the work compounds — you discover before you stabilize, and you stabilize before you sustain.
            </p>
          </div>

          {/* Three big spreads stacked vertically with alternating photo/copy */}
          {[
            {
              n: 'I.', name: 'Discover',
              weeks: 'Weeks 1–4',
              h: 'Map what is actually\nhappening.',
              body: 'Your 120-question assessment, your 34-page Health Intelligence Report, and a 60-minute intake with a NAMS-certified menopause practitioner. By the end of week four, you have a stage, a radar, and a plan you understand.',
              cite: 'GROUNDED · CHUNK-014',
              beats: [
                '120-question intake assessment',
                '34-page Health Intelligence Report',
                '60-min intake with clinician',
                '10-domain symptom radar',
              ],
              tone: 'lavender',
              tint: 'rgba(232,222,250,0.55)',
              reverse: false,
            },
            {
              n: 'II.', name: 'Stabilize',
              weeks: 'Weeks 5–8',
              h: 'Pull the levers that\nactually move the needle.',
              body: 'Sleep architecture. Vasomotor symptom load. Mood-energy interplay. Each week introduces one experiment in a single domain — never two — so you can tell what is working. Weekly check-ins with your care team adjust the plan in real time.',
              cite: 'HIS ENGINE · 10 DOMAINS',
              beats: [
                'One experiment per week, never two',
                'Weekly 15-min clinician check-in',
                'Companion: sleep, mood, energy logging',
                'Optional HRT review with your physician',
              ],
              tone: 'cream',
              tint: 'rgba(247,232,218,0.62)',
              reverse: true,
            },
            {
              n: 'III.', name: 'Sustain',
              weeks: 'Weeks 9–12',
              h: 'Make the new normal,\nactually normal.',
              body: 'You graduate from week-by-week to season-by-season. Your protocol becomes a maintenance rhythm, your care team becomes an on-call resource, and the community pods become the place you keep showing up. The arc ends — your access does not.',
              cite: 'PROTOCOL · MAINTENANCE',
              beats: [
                'Quarterly clinician review',
                'On-call hand-off + Ask Empress 24/7',
                'Permanent community pod placement',
                'Lifetime access to report + protocol',
              ],
              tone: 'tan',
              tint: 'rgba(247,222,196,0.55)',
              reverse: false,
            },
          ].map((c, i) => (
            <div key={c.name} style={{
              display: 'grid',
              gridTemplateColumns: c.reverse ? '1fr 1.1fr' : '1.1fr 1fr',
              gap: 80, alignItems: 'center',
              marginTop: i === 0 ? 0 : 120,
              direction: c.reverse ? 'rtl' : 'ltr',
            }}>
              <div style={{ direction: 'ltr' }}>
                <div style={{ position: 'relative' }}>
                  <Placeholder label={`CHAPTER ${c.n} · DOCUMENTARY\n${c.name.toUpperCase()} REGISTER\nKINFOLK INTERIOR`}
                                width="100%" height={520} radius={6} tone={c.tone}/>
                  <div style={{
                    position: 'absolute', top: 28, left: 28,
                    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 96, fontWeight: 400,
                    color: 'var(--surface-bright)', lineHeight: 1, textShadow: '0 4px 18px rgba(74,54,100,0.35)',
                  }}>{c.n}</div>
                  <div className="mono" style={{
                    position: 'absolute', bottom: 22, left: 22, color: 'var(--surface-bright)',
                    background: 'rgba(0,0,0,0.18)', padding: '8px 12px', borderRadius: 999,
                    backdropFilter: 'blur(8px)',
                  }}>{c.weeks}</div>
                </div>
              </div>
              <div style={{ direction: 'ltr' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--gold)' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>{c.name}</span>
                </div>
                <h3 className="headline" style={{ margin: 0, whiteSpace: 'pre-line', fontSize: 'clamp(34px, 3.4vw, 52px)' }}>
                  {c.h}
                </h3>
                <p className="body-lg" style={{ marginTop: 22 }}>{c.body}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '32px 0 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {c.beats.map((b, i2) => (
                    <li key={b} style={{
                      display: 'grid', gridTemplateColumns: '36px 1fr', gap: 16,
                      padding: '14px 0', borderTop: '1px solid rgba(74,54,100,0.10)',
                      borderBottom: i2 === c.beats.length - 1 ? '1px solid rgba(74,54,100,0.10)' : 'none',
                      alignItems: 'center',
                    }}>
                      <span className="mono" style={{ color: 'var(--gold)' }}>{String(i2 + 1).padStart(2, '0')}</span>
                      <span style={{ fontSize: 15, color: 'var(--ink)' }}>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mono" style={{ marginTop: 22, color: 'var(--gold)' }}>SOURCES · {c.cite}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── WEEK-BY-WEEK RAIL — long horizontal-feeling timeline ─ */}
      <section id="weeks" style={{ position: 'relative', padding: '120px 0', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 64px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'end', marginBottom: 60 }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>EVERY WEEK · WHAT TO EXPECT</div>
              <h2 className="headline" style={{ margin: 0 }}>
                A week,<br/><em className="italic-emph">on the page.</em>
              </h2>
            </div>
            <p className="body-lg" style={{ margin: 0 }}>
              Each week has the same rhythm: a Monday brief, midweek check-in, weekend reflection. Predictable on purpose — the work is in the consistency, not the surprise.
            </p>
          </div>
        </div>

        {/* Horizontal scrolling track of week cards */}
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          <div style={{ display: 'flex', gap: 18, padding: '0 64px 30px', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
            {[
              { wk: '01', title: 'Baseline', sub: 'Take the assessment',          tint: 'rgba(232,222,250,0.55)' },
              { wk: '02', title: 'Decoding', sub: 'Read your report',             tint: 'rgba(232,222,250,0.55)' },
              { wk: '03', title: 'Intake',   sub: 'Meet your clinician',          tint: 'rgba(232,222,250,0.55)' },
              { wk: '04', title: 'Plan',     sub: 'Build your protocol',          tint: 'rgba(232,222,250,0.55)' },
              { wk: '05', title: 'Sleep',    sub: 'First experiment',             tint: 'rgba(247,232,218,0.62)' },
              { wk: '06', title: 'Heat',     sub: 'Vasomotor load',               tint: 'rgba(247,232,218,0.62)' },
              { wk: '07', title: 'Mood',     sub: 'Emotional weather',            tint: 'rgba(247,232,218,0.62)' },
              { wk: '08', title: 'Review',   sub: 'Adjust the plan',              tint: 'rgba(247,232,218,0.62)' },
              { wk: '09', title: 'Rhythm',   sub: 'Make it routine',              tint: 'rgba(247,222,196,0.55)' },
              { wk: '10', title: 'Pods',     sub: 'Find your circle',             tint: 'rgba(247,222,196,0.55)' },
              { wk: '11', title: 'Season',   sub: 'Quarterly outlook',            tint: 'rgba(247,222,196,0.55)' },
              { wk: '12', title: 'Graduate', sub: 'Move to maintenance',          tint: 'rgba(247,222,196,0.55)' },
            ].map((w) => (
              <div key={w.wk} className="glass" style={{
                flex: '0 0 220px', scrollSnapAlign: 'start',
                padding: 22, backgroundColor: w.tint, borderRadius: 18,
                display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, color: 'var(--gold)', lineHeight: 1 }}>{w.wk}</span>
                  <span className="mono" style={{ color: 'var(--ink-faint)' }}>WK</span>
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, lineHeight: 1.2 }}>{w.title}</div>
                  <div className="mono" style={{ marginTop: 8, color: 'var(--plum)' }}>{w.sub}</div>
                </div>
                <span className="gold-rule" style={{ margin: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* legend */}
        <div style={{ maxWidth: 1320, margin: '40px auto 0', padding: '0 64px', display: 'flex', gap: 28, justifyContent: 'center' }}>
          {[
            ['DISCOVER', 'rgba(232,222,250,0.85)'],
            ['STABILIZE', 'rgba(247,232,218,0.85)'],
            ['SUSTAIN', 'rgba(247,222,196,0.85)'],
          ].map(([l, c]) => (
            <div key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: c, border: '1px solid rgba(74,54,100,0.10)' }} />
              <span className="mono" style={{ color: 'var(--ink-soft)' }}>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ───── INSIDE A SESSION ─────────────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>INSIDE A WEEKLY SESSION</div>
            <h2 className="headline" style={{ margin: 0 }}>
              Fifteen minutes,<br/><em className="italic-emph">that actually count.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22 }}>
              A weekly clinician check-in with a tight, repeating structure. We do not chat. We measure, decide, and adjust — then you go live your life until next Wednesday.
            </p>
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['00:00', 'How the last week felt', '3 min · narrative'],
                ['03:00', 'What the data shows',    '4 min · domain dashboard'],
                ['07:00', 'One adjustment',         '5 min · protocol edit'],
                ['12:00', 'What to watch for',      '3 min · briefing'],
              ].map(([t, label, dur]) => (
                <div key={t} style={{
                  display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 20,
                  padding: '18px 0', borderTop: '1px solid rgba(74,54,100,0.10)',
                  alignItems: 'baseline',
                }}>
                  <span className="mono" style={{ color: 'var(--gold)' }}>{t}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)' }}>{label}</span>
                  <span className="mono" style={{ color: 'var(--ink-faint)' }}>{dur}</span>
                </div>
              ))}
              <span style={{ display: 'block', height: 1, background: 'rgba(74,54,100,0.10)' }} />
            </div>
          </div>

          {/* Right: mock session UI */}
          <div className="glass" style={{ padding: 32, borderRadius: 24, backgroundColor: 'rgba(255,252,248,0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden' }}>
                <Placeholder label="" width="100%" height="100%" radius={0} tone="lavender"/>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 500 }}>Dr. M. Chen</div>
                <div className="mono" style={{ marginTop: 4, color: 'var(--plum)' }}>NAMS · WEEK 06 · WED 09:00</div>
              </div>
              <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#1f8a5b' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1f8a5b' }} />Live
              </span>
            </div>
            <Placeholder label={"VIDEO CALL TILE\nCLINICIAN HEADSHOT"} width="100%" height={260} radius={14} tone="cream"/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 18 }}>
              {[
                ['Sleep',  72, '+8'],
                ['Heat',   54, '−4'],
                ['Mood',   68, '+2'],
              ].map(([l, v, d]) => (
                <div key={l} style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(74,54,100,0.08)' }}>
                  <div className="mono" style={{ color: 'var(--ink-faint)' }}>{l}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--plum)', fontWeight: 500 }}>{v}</span>
                    <span style={{ fontSize: 12, color: d.startsWith('+') ? '#1f8a5b' : '#a04050' }}>{d}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mono" style={{ marginTop: 18, paddingTop: 14, borderTop: '1px dashed rgba(74,54,100,0.15)', color: 'var(--gold)' }}>
              ADJUSTMENT THIS WEEK · COOLING PROTOCOL § 4.2 · TWO WEEKS
            </div>
          </div>
        </div>
      </section>

      {/* ───── MEMBERSHIP & PRICING ─────────────────────────────── */}
      <section id="price" style={{ padding: '160px 64px', background: 'var(--surface-cream)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -120, right: '-6%', width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.22) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 80px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>Membership.</span>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
            </div>
            <h2 className="headline">
              Two ways<br/><em className="italic-emph">to begin.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22 }}>
              Whichever you choose, you get the report, the protocol, and lifetime access. The difference is who walks the twelve weeks with you.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            {[
              {
                name: 'The Report',
                price: '$139',
                cadence: 'one-time',
                lead: 'Your stage, your radar, your matched clinician — on paper.',
                included: [
                  '120-question intake assessment',
                  '34-page Health Intelligence Report',
                  '10-domain symptom radar',
                  'Three matched NAMS clinicians',
                  'Lifetime access to your report',
                ],
                cta: 'Start with the report',
                style: 'flat',
              },
              {
                name: 'The Program',
                price: '$12',
                cadence: 'per month · 12 weeks then optional',
                lead: 'The full editorial arc, with a clinician on the line every week.',
                included: [
                  'Everything in The Report',
                  '12 weekly 15-min clinician check-ins',
                  'Care team on Ask Empress 24/7',
                  'Permanent community pod placement',
                  'Quarterly review for life',
                ],
                cta: 'Start the program',
                style: 'feature',
              },
            ].map((tier) => (
              <div key={tier.name} className={tier.style === 'feature' ? 'glass' : ''} style={{
                padding: 44, borderRadius: 24,
                background: tier.style === 'feature' ? 'rgba(255,252,248,0.7)' : 'var(--surface-bright)',
                border: tier.style === 'feature' ? undefined : '1px solid rgba(74,54,100,0.10)',
                position: 'relative', overflow: 'hidden',
              }}>
                {tier.style === 'feature' && (
                  <span style={{
                    position: 'absolute', top: 24, right: 24,
                    padding: '6px 12px', borderRadius: 999,
                    background: 'var(--plum)', color: '#fff',
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em', fontWeight: 500,
                  }}>MOST CHOSEN</span>
                )}
                <div className="mono" style={{ color: 'var(--plum)' }}>{tier.name.toUpperCase()}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 18 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 72, color: 'var(--plum)', lineHeight: 1 }}>{tier.price}</span>
                  <span className="mono" style={{ color: 'var(--ink-faint)' }}>{tier.cadence}</span>
                </div>
                <span className="gold-rule" style={{ marginTop: 22 }} />
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 21, color: 'var(--plum-mid)', margin: '14px 0 0', lineHeight: 1.4 }}>{tier.lead}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '32px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tier.included.map((line) => (
                    <li key={line} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="var(--gold)" strokeWidth="0.6"/>
                        <path d="M4 7l2 2 4-4" stroke="var(--plum)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                      <span style={{ fontSize: 14, color: 'var(--ink)' }}>{line}</span>
                    </li>
                  ))}
                </ul>
                <button className={`btn ${tier.style === 'feature' ? 'btn-primary' : 'btn-ghost'}`}>
                  {tier.cta} {Icon.arrow(14)}
                </button>
              </div>
            ))}
          </div>

          <div className="mono" style={{ textAlign: 'center', marginTop: 48, color: 'var(--gold)' }}>
            FSA/HSA ELIGIBLE · NO INSURANCE REQUIRED · CANCEL ANY TIME
          </div>
        </div>
      </section>

      {/* ───── WHAT CHANGES — outcomes editorial ────────────────── */}
      <section id="sustain" style={{ position: 'relative', padding: '160px 64px', background: 'var(--surface)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -120, left: '-6%', width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.22) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>WHAT MEMBERS REPORT AT WEEK 12</div>
              <h2 className="headline" style={{ margin: 0 }}>
                What actually<br/><em className="italic-emph">changes.</em>
              </h2>
              <p className="body-lg" style={{ marginTop: 22, maxWidth: 480 }}>
                Self-reported, every Sunday, from 500+ early adopters. We publish the medians, not the marketing numbers.
              </p>

              <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  ['Sleep continuity',         '+42%', 0.84],
                  ['Vasomotor load (lower)',   '−38%', 0.76],
                  ['Daily energy',             '+28%', 0.62],
                  ['Mood variance (lower)',    '−24%', 0.54],
                  ['Confidence in protocol',   '+91%', 0.95],
                ].map(([label, n, frac]) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, color: 'var(--ink)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--plum)', fontWeight: 500 }}>{n}</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(74,54,100,0.10)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${frac * 100}%`, background: 'var(--plum)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mono" style={{ marginTop: 28, color: 'var(--gold)' }}>
                SOURCES · MEMBER PANEL N=500 · MEDIANS · WEEK 12 VS BASELINE
              </div>
            </div>

            {/* Right column: stacked editorial quote + small portrait */}
            <div style={{ position: 'relative' }}>
              <Placeholder label={"MEMBER PORTRAIT\nNATURAL LIGHT · 50S\nSEATED · UNGUARDED"} width="100%" height={420} radius={6} tone="lavender"/>
              <div style={{ position: 'absolute', top: -8, left: -8, width: 22, height: 22, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -8, right: -8, width: 22, height: 22, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div className="glass" style={{
                marginTop: -56, marginLeft: 36, padding: 32, borderRadius: 22,
                position: 'relative', zIndex: 2,
              }}>
                <span style={{ color: 'var(--gold)' }}>{Icon.quote(28)}</span>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, lineHeight: 1.35,
                  color: 'var(--ink)', margin: '8px 0 0',
                }}>
                  By week ten I stopped describing myself as “in menopause.” I started describing what I was doing about it.
                </p>
                <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ display: 'inline-block', width: 32, height: 1, background: 'var(--gold)' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 }}>— Renée</div>
                    <div className="mono" style={{ marginTop: 4, color: 'var(--plum)' }}>MEMBER · STAGE II · 14 MONTHS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CLOSING CTA ──────────────────────────────────────── */}
      <section style={{ padding: '40px 64px 120px', position: 'relative' }}>
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 32,
          background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)',
          padding: '80px 80px', color: 'var(--ink)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 30px 80px -40px rgba(74,54,100,0.25)',
        }}>
          <div style={{ position: 'absolute', top: -120, right: -80, width: 460, height: 460, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -160, left: '30%', width: 460, height: 460, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(247,222,196,0.55) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(50px)' }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 64, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 720 }}>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>BEGIN WHEN YOU'RE READY</div>
              <h2 className="display" style={{ margin: 0, fontSize: 'clamp(40px, 4.4vw, 64px)', color: 'var(--plum)' }}>
                Twelve weeks from now,<br/>
                <em className="italic-emph" style={{ color: 'var(--plum-mid)' }}>you'll be glad you started.</em>
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <button className="btn btn-primary">Start free {Icon.arrow(16)}</button>
              <button className="btn" style={{ background: 'rgba(255,252,248,0.65)', color: 'var(--plum)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.7)' }}>Read a sample report</button>
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
