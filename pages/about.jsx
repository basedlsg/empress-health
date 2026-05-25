/* global React, Placeholder, Nav, Icon, Footer */
// About Us — Founder portrait + manifesto + timeline + team.

function About() {
  return (
    <div data-screen-label="About Us" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={7} base="" />
      </div>

      {/* ───── MANIFESTO HERO ────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '20px 64px 100px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -180, right: -120, width: 720, height: 720, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.30) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -120, left: -160, width: 540, height: 540, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.22) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>EMPRESS HEALTH · FOUNDED MMXXVI · BROOKLYN, NEW YORK</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>A B-CORP IN GOOD STANDING</div>
          </div>

          {/* Manifesto */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <h1 className="display" style={{ margin: 0, fontSize: 'clamp(48px, 5.6vw, 88px)' }}>
                We started Empress because<br/>nobody was treating midlife<br/>
                <em className="italic-emph">like the chapter it is.</em>
              </h1>
              <p className="body-lg" style={{ marginTop: 32, maxWidth: 560, fontSize: 19 }}>
                Not a "decline." Not a "transition." A long, biological, social, complicated, often-funny chapter that deserves a serious team — and a beautiful one.
              </p>
              <p className="body-lg" style={{ marginTop: 18, maxWidth: 560, fontSize: 19 }}>
                We are forty-two people, in three cities, working on one thing: making the experience of menopause less lonely, less guessed-at, and less expensive than it has ever been.
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <Placeholder label={"FOUNDER PORTRAIT\nA. KAPLAN · 47\nSEATED · NATURAL LIGHT"} width="100%" height={620} radius={6} tone="lavender"/>
              <div style={{ position: 'absolute', top: -10, left: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div className="mono" style={{ marginTop: 14, color: 'var(--gold)', textAlign: 'right' }}>
                A. KAPLAN · CEO + EDITOR-IN-CHIEF
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── FOUNDER LETTER ────────────────────────────────────── */}
      <section id="founder" style={{ padding: '160px 64px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)', borderBottom: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
              <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>A letter from our founder.</span>
              <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
            </div>
            <h2 className="headline" style={{ marginTop: 22 }}>
              On what we are<br/><em className="italic-emph">trying to build.</em>
            </h2>
          </div>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)',
            columnCount: 2, columnGap: 56, margin: 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
              fontSize: 72, color: 'var(--plum)', lineHeight: 0.85,
              float: 'left', marginRight: 14, marginTop: 6,
            }}>I</span>
            n my mid-forties, I went to four doctors in eleven months. None of them used the word menopause. Two of them suggested I sleep more. One referred me to a therapist. The fourth, a woman the age of my mother, said the quiet line that started this company: "they did not teach us about this in medical school either."
            <br/><br/>
            That is not a scandal — it is the field as it stands. The textbook spends less than a paragraph on the longest endocrine transition of a woman's life. The trials are forty years stale. The internet is loud, frightened, and commercial. The cost of getting it right, between out-of-pocket specialists and the time off work, is the price of a small car.
            <br/><br/>
            We are trying to build the institution that did not exist when we needed it: a place that takes the symptoms seriously, the evidence seriously, the women seriously — and lets you pay for it the way you would pay for a magazine, not a procedure. The editorial side is not a marketing layer. It is the work.
            <br/><br/>
            If you have read this far, you are who we are building it for. Thank you. Write back any time.
          </p>
          <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--plum)' }}>— Ariana Kaplan</div>
              <div className="mono" style={{ marginTop: 4, color: 'var(--gold)' }}>FOUNDER · CEO · EDITOR-IN-CHIEF</div>
            </div>
            <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
          </div>
        </div>
      </section>

      {/* ───── COMPANY PRINCIPLES ────────────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 64, alignItems: 'start', marginBottom: 56 }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>HOW WE WORK</div>
              <h2 className="headline" style={{ margin: 0 }}>
                Six principles,<br/><em className="italic-emph">held in public.</em>
              </h2>
            </div>
            <p className="body-lg" style={{ margin: 0 }}>
              We publish these so you can hold us to them. When we get something wrong — and we will — we will say so on this page, in mono, with the date.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, rowGap: 48 }}>
            {[
              { n: 'I', t: 'Every claim, cited',     body: 'No hand-waving "studies show." We point to the chunk, the trial, the panel size, on the page where the claim lives.' },
              { n: 'II', t: 'Member-first writing',  body: 'A piece is not done until a member who is not in the company reads it without flinching at a sentence.' },
              { n: 'III', t: 'No advertising, ever', body: 'We do not run ads. Members pay us. Twelve dollars a month, when you can. Sliding scale, when you cannot.' },
              { n: 'IV', t: 'Editor independent',   body: 'Our editor does not see commercial deals before publication. Our marketplace pays its own way.' },
              { n: 'V', t: 'Open to being wrong',   body: 'We log corrections, openly. We apologize in mono. We rewrite the piece — we do not quietly disappear it.' },
              { n: 'VI', t: 'Quiet by design',      body: 'No push notifications, no streaks, no engagement loops. The product is a magazine and a clinician. Nothing else.' },
            ].map((p) => (
              <div key={p.n} style={{ borderTop: '1px solid var(--ink)', paddingTop: 18 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 30, color: 'var(--gold)', lineHeight: 1 }}>{p.n}.</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, margin: '18px 0 10px', lineHeight: 1.25 }}>{p.t}</h3>
                <p className="body-md" style={{ margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── TIMELINE ─────────────────────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>The first 24 months.</span>
              <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
            </div>
            <h2 className="headline">
              How we got<br/><em className="italic-emph">here.</em>
            </h2>
          </div>

          {/* Vertical timeline */}
          <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 110, top: 12, bottom: 12, width: 1, background: 'rgba(74,54,100,0.18)' }} />
            {[
              ['MMXXIV · Q3', 'Two people, one kitchen table',  'A and her co-founder, M, start interviewing women in midlife. 47 calls in six weeks.'],
              ['MMXXIV · Q4', 'Our first clinical advisor',     'Dr. M. Chen joins as our first clinical lead. The framework for the Health Intelligence Report takes shape on a whiteboard in Park Slope.'],
              ['MMXXV · Q1',  'Seed round, intentionally small','We close $4.8M to keep the runway long and the pressure off. Investors agree not to push for ads.'],
              ['MMXXV · Q2',  'The first 250 members',          'Closed pilot. Eight pods. Free, in exchange for honest feedback. The pod model is iterated five times.'],
              ['MMXXV · Q4',  'The Health Intelligence Report', 'Version 1.0 of the report ships to the pilot. By end of quarter, 500 members are in good standing.'],
              ['MMXXVI · Q1', 'Public launch + The Library',    'The marketing site goes live. The Empress Library ships its first issue. The marketplace, in its smallest form, opens.'],
              ['TODAY',       'Forty-two of us, three cities',  'Brooklyn, London, Lisbon. 2,100+ members. 247 NAMS-certified clinicians in the network. Issue 03 of The Library on the stands.'],
            ].map(([date, title, body], i, arr) => (
              <div key={date} style={{ display: 'grid', gridTemplateColumns: '90px 40px 1fr', gap: 16, padding: '20px 0' }}>
                <span className="mono" style={{ color: 'var(--gold)' }}>{date}</span>
                <span style={{ position: 'relative' }}>
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%', background: 'var(--gold)',
                    display: 'block', marginLeft: 6, transform: 'rotate(45deg)',
                  }} />
                </span>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, margin: 0, lineHeight: 1.25 }}>{title}</h3>
                  <p className="body-md" style={{ margin: '6px 0 0' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── TEAM ─────────────────────────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 56, borderBottom: '1px solid var(--ink)', paddingBottom: 14 }}>
            <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(32px, 3vw, 44px)' }}>
              Some of <em className="italic-emph">us.</em>
            </h2>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>FORTY-TWO IN ALL · MEET THE REST →</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28, rowGap: 56 }}>
            {[
              { name: 'Ariana Kaplan',   role: 'Founder · CEO',          tone: 'lavender' },
              { name: 'Marcela Rivas',   role: 'Co-founder · COO',       tone: 'cream' },
              { name: 'Dr. M. Chen',     role: 'Clinical Lead · NAMS',   tone: 'tan' },
              { name: 'Dr. R. Patel',    role: 'Endocrinology Lead',     tone: 'lavender' },
              { name: 'Sara Okonkwo',    role: 'Pelvic Floor PT Lead',   tone: 'cream' },
              { name: 'Linnea Holm',     role: 'Head of Editorial',      tone: 'tan' },
              { name: 'Maya Russo',      role: 'Community · Pods Lead',  tone: 'lavender' },
              { name: 'Hana Park',       role: 'Head of Engineering',    tone: 'cream' },
            ].map((p) => (
              <div key={p.name} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <Placeholder label="HEADSHOT" width="100%" height={280} radius={4} tone={p.tone}/>
                  <div style={{ position: 'absolute', top: -6, left: -6, width: 14, height: 14, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
                  <div style={{ position: 'absolute', bottom: -6, right: -6, width: 14, height: 14, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
                </div>
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500 }}>{p.name}</div>
                  <div className="mono" style={{ marginTop: 6, color: 'var(--plum)' }}>{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRESS · KIT · CONTACT ─────────────────────────────── */}
      <section id="contact" style={{ padding: '120px 64px', background: 'var(--surface-cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
          {[
            { id: 'press', label: 'For press', t: 'Press kit + interviews', body: 'Bios, brand assets, founder availability. We respond within two working days.', cta: 'Request the kit' },
            { label: 'For clinicians',         t: 'Join the network',       body: 'NAMS-certified menopause practitioners — we are taking applications quarterly. Honoraria above market.', cta: 'Apply to the network' },
            { label: 'For everyone else',      t: 'Write to us',            body: 'We read every note. We answer most. The address is hello@empress.health — and yes, a person reads it.', cta: 'Say hello' },
          ].map((c, i) => (
            <div key={c.label} id={c.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="mono" style={{ color: 'var(--gold)' }}>0{i + 1} · {c.label.toUpperCase()}</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, margin: '18px 0 12px', lineHeight: 1.2 }}>{c.t}</h3>
              <p className="body-md" style={{ margin: 0, flex: 1 }}>{c.body}</p>
              <button className="btn btn-ghost" style={{ marginTop: 22, alignSelf: 'flex-start' }}>{c.cta} →</button>
            </div>
          ))}
        </div>
      </section>

      {/* ───── INVESTORS RIBBON ───────────────────────────────── */}
      <section style={{ padding: '80px 64px', background: 'var(--surface)' }}>
        <div className="glass" style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 48px', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontStyle: 'italic', color: 'var(--ink)' }}>
            Backed by patient capital.
          </span>
          <div style={{ display: 'flex', gap: 48 }}>
            {['LIFESPAN VENTURES', 'CIRCLE OF FOUNDERS', 'KAUFFMAN', 'EMERSON', 'INDIVIDUAL ANGELS'].map((l, i) => (
              <span key={l} className="mono" style={{ color: i === 4 ? 'var(--gold)' : 'var(--ink-soft)' }}>{l}</span>
            ))}
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
