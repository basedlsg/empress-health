/* global React, Placeholder, Nav, Icon, Footer */
// Join the Community — Editorial: pods, daily affirmations, a "membership" register.

function JoinCommunity() {
  return (
    <div data-screen-label="Join the Community" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={3} base="" />
      </div>

      {/* ───── HERO — circle of women editorial ─────────────────── */}
      <section style={{ position: 'relative', padding: '40px 64px 100px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, left: -160, width: 640, height: 640, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.32) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -120, right: -160, width: 580, height: 580, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.20) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', minHeight: 720 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--gold)' }} />
              <span className="mono" style={{ color: 'var(--plum)' }}>THE EMPRESS CIRCLE · MEMBERSHIP</span>
            </div>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(52px, 6vw, 92px)' }}>
              You're not alone.<br/><em className="italic-emph">We're in this together.</em>
            </h1>
            <p className="body-lg" style={{ marginTop: 28, maxWidth: 480 }}>
              A real community of women in midlife — not a fitness group, not a forum. Curated pods of eight, twice-weekly circles, and a daily letter that meets you where you are.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>
              <button className="btn btn-primary">Request a pod {Icon.arrow(16)}</button>
              <button className="btn btn-ghost">Read today's letter</button>
            </div>

            <div style={{ display: 'flex', gap: 36, marginTop: 64, paddingTop: 32, borderTop: '1px solid rgba(74,54,100,0.10)' }}>
              {[
                ['2,100+', 'members in good standing'],
                ['8', 'women per pod, always'],
                ['M / Th', 'twice-weekly circles'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 32, color: 'var(--plum)', lineHeight: 1 }}>{n}</div>
                  <div className="mono" style={{ marginTop: 8, color: 'var(--ink-soft)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: portrait constellation — central + orbiting members */}
          <div style={{ position: 'relative', height: 620 }}>
            {/* Central portrait */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 240, height: 240, borderRadius: '50%', overflow: 'hidden',
              boxShadow: '0 30px 80px -30px rgba(74,54,100,0.40), 0 0 0 10px rgba(255,255,255,0.7)' }}>
              <Placeholder label={"CENTER\nFOUNDER · CIRCLE"} width="100%" height="100%" radius={0} tone="lavender"/>
            </div>
            {/* Orbiting members */}
            {[
              { x: 50, y: 6,  s: 88, tone: 'cream',    name: 'Renée' },
              { x: 88, y: 26, s: 76, tone: 'tan',      name: 'Pooja' },
              { x: 96, y: 64, s: 92, tone: 'lavender', name: 'Sara' },
              { x: 70, y: 92, s: 80, tone: 'cream',    name: 'Mei' },
              { x: 30, y: 96, s: 96, tone: 'tan',      name: 'Lara' },
              { x: 4,  y: 70, s: 84, tone: 'lavender', name: 'Anya' },
              { x: 2,  y: 30, s: 80, tone: 'cream',    name: 'Bea' },
              { x: 30, y: 6,  s: 92, tone: 'tan',      name: 'Eve' },
            ].map((m, i) => (
              <div key={i} style={{
                position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)',
                width: m.s, height: m.s, borderRadius: '50%', overflow: 'hidden',
                boxShadow: '0 10px 24px -10px rgba(74,54,100,0.30), 0 0 0 5px rgba(255,255,255,0.7)',
              }}>
                <Placeholder label="" width="100%" height="100%" radius={0} tone={m.tone}/>
              </div>
            ))}
            {/* Thin orbit ring */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
              <ellipse cx="50" cy="50" rx="48" ry="46" stroke="var(--gold)" strokeWidth="0.15" strokeDasharray="0.6 1.2" fill="none" />
            </svg>
            {/* Floating membership card */}
            <div className="glass" style={{
              position: 'absolute', bottom: -20, right: -20, width: 240, padding: 20,
              borderRadius: 18,
            }}>
              <div className="mono" style={{ color: 'var(--gold)' }}>MEMBERSHIP · NO. 02174</div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, marginTop: 8, color: 'var(--plum)' }}>The Empress Circle</div>
              <span className="gold-rule" style={{ marginTop: 10 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--ink)' }}>Stella A.</span>
                <span className="mono" style={{ color: 'var(--ink-faint)' }}>EST · MMXXVI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── HOW PODS WORK ────────────────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface-cream)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end', marginBottom: 80 }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>HOW PODS WORK</div>
              <h2 className="headline" style={{ margin: 0 }}>
                Eight women.<br/>One stage of life.<br/><em className="italic-emph">A standing date.</em>
              </h2>
            </div>
            <p className="body-lg" style={{ margin: 0 }}>
              Pods are matched by stage, life context, and what you say you want. They meet twice a week on Zoom, hold attendance gently, and never grow past eight. Smallness is the feature.
            </p>
          </div>

          {/* Four-step rail */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { n: 'I', t: 'Tell us about you',     sub: 'A 6-question pod intake — stage, schedule, tone you want.' },
              { n: 'II', t: 'We match a pod',       sub: 'Compatible stage, time zone, life shape. Usually inside a week.' },
              { n: 'III', t: 'Meet the eight',      sub: 'A 30-minute soft launch with a host. Mon + Thu, 60 minutes.' },
              { n: 'IV', t: 'Stay (or switch)',     sub: 'No lock-in. Rotate pods any month, ask for a swap any time.' },
            ].map((s) => (
              <div key={s.n} style={{ padding: '24px 0', borderTop: '1px solid var(--ink)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32, color: 'var(--gold)', lineHeight: 1 }}>{s.n}.</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, margin: '20px 0 10px', lineHeight: 1.25 }}>{s.t}</h3>
                <p className="body-md" style={{ margin: 0 }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── INSIDE A POD — mock pod card ─────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 80, right: '-8%', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.22) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 72, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>POD · STAGE III · BROOKLYN / LONDON / LAGOS</div>
            <h2 className="headline" style={{ margin: 0 }}>
              An evening<br/>with <em className="italic-emph">your pod.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22 }}>
              Mondays open with a check-in, Thursdays close with a theme. The host (always a member, never a coach) keeps time. The shape is gentle on purpose.
            </p>
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['00:00', 'Open · weather word',  '5 min · each member, one word'],
                ['05:00', 'Round · how the week sat', '15 min · 2 min each'],
                ['20:00', 'Theme · this week',    '25 min · led by host'],
                ['45:00', 'Asks · what would help', '10 min · the round again'],
                ['55:00', 'Close · what you carry', '5 min · one sentence each'],
              ].map(([t, label, dur]) => (
                <div key={t} style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 20, padding: '14px 0', borderTop: '1px solid rgba(74,54,100,0.10)' }}>
                  <span className="mono" style={{ color: 'var(--gold)' }}>{t}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>{label}</span>
                  <span className="mono" style={{ color: 'var(--ink-faint)' }}>{dur}</span>
                </div>
              ))}
              <span style={{ display: 'block', height: 1, background: 'rgba(74,54,100,0.10)' }} />
            </div>
          </div>

          {/* Right: stylized "zoom grid" */}
          <div className="glass" style={{ padding: 30, borderRadius: 24, backgroundColor: 'rgba(255,252,248,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span className="mono" style={{ color: 'var(--plum)' }}>POD CIRCLE · THU 7:00 PM ET</span>
              <span style={{ fontSize: 12, color: '#1f8a5b', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1f8a5b' }} />Live · 0:42:18
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {Array.from({ length: 8 }).map((_, i) => {
                const tones = ['lavender', 'cream', 'tan', 'lavender', 'cream', 'tan', 'lavender', 'cream'];
                const names = ['Stella · host', 'Renée', 'Pooja', 'Sara', 'Mei', 'Lara', 'Anya', 'Bea'];
                const speaking = i === 0;
                return (
                  <div key={i} style={{
                    position: 'relative', aspectRatio: '4 / 3', borderRadius: 10, overflow: 'hidden',
                    boxShadow: speaking ? '0 0 0 2px var(--gold)' : '0 0 0 1px rgba(74,54,100,0.08)',
                  }}>
                    <Placeholder label="" width="100%" height="100%" radius={0} tone={tones[i]}/>
                    <span style={{
                      position: 'absolute', bottom: 6, left: 6,
                      padding: '4px 8px', borderRadius: 6,
                      background: 'rgba(0,0,0,0.55)', color: '#fff',
                      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em',
                    }}>{names[i]}</span>
                  </div>
                );
              })}
            </div>
            <div className="mono" style={{ marginTop: 22, paddingTop: 16, borderTop: '1px dashed rgba(74,54,100,0.18)', color: 'var(--gold)' }}>
              TONIGHT'S THEME · "WHAT IS WORTH KEEPING FROM YOUR FORTIES?"
            </div>
          </div>
        </div>
      </section>

      {/* ───── DAILY AFFIRMATIONS / LETTERS ─────────────────────── */}
      <section style={{ padding: '140px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 64px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>The daily letter.</span>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
            </div>
            <h2 className="headline">
              A letter from a friend<br/><em className="italic-emph">who happens to be a clinician.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22 }}>
              Two paragraphs, every morning, free for members. Practical, cited, warm. Read it on your phone before your coffee. Skip the day you don't want it.
            </p>
          </div>

          {/* Three letter cards — like postcards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                date: 'TUE · MAY XII',
                t: 'Heat and the kettle effect',
                body: 'A vasomotor surge is not your body breaking down. It is your thermostat re-calibrating in real time — louder than it needs to be, but on the way to a new equilibrium. The shape of it…',
                cite: 'NAMS § 4.2 · CHUNK-088',
              },
              {
                date: 'WED · MAY XIII',
                t: 'On the 3:47 wakeup',
                body: 'It almost always comes at the same time. You will be tempted to fight it. Don\'t — get up for nine minutes, read something dull and physical, and let the second half of the night come back to you…',
                cite: 'NAMS § 7.1 · CHUNK-104',
              },
              {
                date: 'THU · MAY XIV',
                t: 'The friend who said the wrong thing',
                body: 'Someone you love will say "oh I had that, it passed" and you will feel suddenly invisible. Tonight at pod we will name that, and write the reply you wish you could send. Bring a pen…',
                cite: 'COMMUNITY · POD MAY 14',
              },
            ].map((l, i) => (
              <article key={l.t} className="glass lift" style={{
                padding: 32, borderRadius: 22,
                backgroundColor: i === 0 ? 'rgba(232,222,250,0.55)' : i === 1 ? 'rgba(247,232,218,0.55)' : 'rgba(247,222,196,0.55)',
              }}>
                <div className="mono" style={{ color: 'var(--gold)' }}>{l.date}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 26, lineHeight: 1.2, margin: '16px 0 14px' }}>{l.t}</h3>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.65, color: 'var(--ink-soft)', margin: 0,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                    fontSize: 44, color: 'var(--plum)', lineHeight: 0.8,
                    float: 'left', marginRight: 8, marginTop: 4,
                  }}>{l.body[0]}</span>
                  {l.body.slice(1)}
                </p>
                <div className="mono" style={{ marginTop: 22, paddingTop: 14, borderTop: '1px dashed rgba(74,54,100,0.18)', color: 'var(--gold)' }}>
                  SOURCES · {l.cite}
                </div>
              </article>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <a href="#" style={{ fontSize: 14, color: 'var(--plum)', textDecoration: 'none', borderBottom: '1px solid var(--gold)', paddingBottom: 4 }}>
              Read the full archive — 142 letters →
            </a>
          </div>
        </div>
      </section>

      {/* ───── MEMBER QUOTES — masonry wall ─────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>FROM THE CIRCLE</div>
            <h2 className="headline">
              In their own<br/><em className="italic-emph">words.</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, alignItems: 'start' }}>
            {[
              { q: 'I joined for the science. I stay for the eight women who text on Tuesdays to ask how my mother is.', n: 'Renée · Brooklyn', tone: 'lavender', h: 240 },
              { q: 'It is the first health thing I have done in twenty years where I am not the one explaining what I have.', n: 'Pooja · Toronto', tone: 'cream',    h: 280 },
              { q: 'The Thursday round is the only meeting on my calendar I do not move.', n: 'Mei · San Francisco', tone: 'tan', h: 200 },
              { q: 'It is not therapy. It is not a class. It is closer to a long walk with people who know exactly which corner you are turning.', n: 'Lara · London', tone: 'cream', h: 320 },
              { q: 'I came in thinking I was the only one. Pod 14 disabused me of that in eleven minutes.', n: 'Anya · Lagos', tone: 'lavender', h: 220 },
              { q: 'My husband asked what the call was about. I said "the things I would not have said out loud last year."', n: 'Bea · Berlin', tone: 'tan', h: 260 },
            ].map((c, i) => (
              <article key={i} style={{
                padding: 28, borderRadius: 18,
                background: 'var(--surface-bright)',
                border: '1px solid rgba(74,54,100,0.08)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                minHeight: c.h,
              }}>
                <span style={{ color: 'var(--gold)' }}>{Icon.quote(22)}</span>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, lineHeight: 1.35,
                  color: 'var(--ink)', margin: '14px 0 0',
                }}>{c.q}</p>
                <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(74,54,100,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden' }}>
                    <Placeholder label="" width="100%" height="100%" radius={0} tone={c.tone}/>
                  </div>
                  <span className="mono" style={{ color: 'var(--plum)' }}>{c.n}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── HOST + MODERATION ────────────────────────────────── */}
      <section style={{ padding: '140px 64px', background: 'var(--surface-cream)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Placeholder label={"HOST PORTRAIT\n45-55 · WARMTH\nDOMESTIC INTERIOR"} width="100%" height={520} radius={6} tone="tan"/>
            <div style={{ position: 'absolute', top: -8, left: -8, width: 22, height: 22, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
            <div style={{ position: 'absolute', bottom: -8, right: -8, width: 22, height: 22, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
          </div>
          <div>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>HOST PROGRAM</div>
            <h2 className="headline" style={{ margin: 0 }}>
              Hosts are<br/><em className="italic-emph">members, first.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22, maxWidth: 480 }}>
              Every pod is held by a member who has been with us at least six months. They are trained, paid, and supervised — but they are not your therapist and they are not your doctor. They are the person who keeps the time.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '36px 0 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Trained', '14-hour facilitation curriculum'],
                ['Paid', 'Honorarium per session, no volunteers'],
                ['Supervised', 'Monthly debrief with our clinical lead'],
                ['Held to a code', 'Confidentiality, gentle attendance, no advice'],
              ].map(([k, v]) => (
                <li key={k} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16, padding: '14px 0', borderTop: '1px solid rgba(74,54,100,0.10)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--plum)' }}>{k}</span>
                  <span style={{ fontSize: 14, color: 'var(--ink)' }}>{v}</span>
                </li>
              ))}
              <span style={{ display: 'block', height: 1, background: 'rgba(74,54,100,0.10)' }} />
            </ul>
            <button className="btn btn-ghost" style={{ marginTop: 28 }}>Become a host →</button>
          </div>
        </div>
      </section>

      {/* ───── REQUEST A POD CTA ────────────────────────────────── */}
      <section style={{ padding: '120px 64px' }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          position: 'relative', overflow: 'hidden', borderRadius: 32,
          background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)',
          padding: '80px',
          border: '1px solid rgba(255,255,255,0.5)',
        }}>
          <div style={{ position: 'absolute', top: -120, right: -80, width: 460, height: 460, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(40px)' }} />

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>NEXT POD COHORT · MONDAY 03 JUNE</div>
              <h2 className="display" style={{ margin: 0, fontSize: 'clamp(40px, 4.6vw, 64px)', color: 'var(--plum)' }}>
                Eight women.<br/>
                <em className="italic-emph" style={{ color: 'var(--plum-mid)' }}>One of them you.</em>
              </h2>
              <p className="body-lg" style={{ marginTop: 24, maxWidth: 480, color: 'var(--ink-soft)' }}>
                Tell us your stage, your schedule, the tone you want. We match you to a pod within a week — or the cohort after, on your timeline.
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 32 }}>
                <button className="btn btn-primary">Request a pod {Icon.arrow(16)}</button>
                <button className="btn" style={{ background: 'rgba(255,252,248,0.65)', color: 'var(--plum)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.7)' }}>Sit in on a Thursday</button>
              </div>
            </div>

            <div className="glass" style={{ padding: 28, borderRadius: 20, backgroundColor: 'rgba(255,252,248,0.65)' }}>
              <div className="mono" style={{ color: 'var(--gold)' }}>WHAT MEMBERS GET</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'A curated pod of eight',
                  'Twice-weekly 60-min circles',
                  'Daily letter, free for members',
                  'Access to the full archive',
                  'Invitations to seasonal salons',
                ].map((b) => (
                  <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--ink)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="var(--gold)" strokeWidth="0.6"/>
                      <path d="M4 7l2 2 4-4" stroke="var(--plum)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mono" style={{ marginTop: 22, paddingTop: 14, borderTop: '1px dashed rgba(74,54,100,0.18)', color: 'var(--plum)' }}>
                INCLUDED WITH THE PROGRAM · $12 / MONTH
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
