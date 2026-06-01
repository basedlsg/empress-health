/* global React, Placeholder, Nav, Icon, Footer */
// Community Stories — Editorial long-form features written by members about their own arcs.

function Stories() {
  return (
    <div data-screen-label="Community Stories" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={6} base="" />
      </div>

      {/* ───── MASTHEAD HERO ─── single-quote full bleed ─────────── */}
      <section style={{ position: 'relative', padding: '20px 64px 60px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, left: -160, width: 640, height: 640, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.32) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 60 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>COMMUNITY STORIES · VOLUME I</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>WRITTEN BY MEMBERS · NEVER GHOSTWRITTEN</div>
          </div>

          <div style={{ textAlign: 'center', maxWidth: 980, margin: '0 auto' }}>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(56px, 6.4vw, 104px)' }}>
              Real women.<br/><em className="italic-emph">In their own words.</em>
            </h1>
            <p className="body-lg" style={{ marginTop: 28, fontSize: 19, maxWidth: 640, margin: '28px auto 0' }}>
              Long-form pieces written by members — about the year they stopped sleeping, the friend who finally got it, the doctor who didn't. We edit lightly. We do not embellish. We never invent.
            </p>
          </div>
        </div>
      </section>

      {/* ───── FEATURED STORY — full-bleed editorial ────────────── */}
      <section style={{ position: 'relative', padding: '60px 64px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          {/* Header strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, color: 'var(--plum)' }}>The lead piece.</span>
            <span className="mono" style={{ color: 'var(--gold)' }}>STORY № 047 · 22 MIN READ</span>
          </div>

          {/* Two-up */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 56, alignItems: 'stretch' }}>
            {/* Left: oversized portrait */}
            <div style={{ position: 'relative' }}>
              <Placeholder label={"POOJA · 53\nNATURAL LIGHT · KITCHEN\nMORNING"} width="100%" height={760} radius={4} tone="tan"/>
              <div style={{ position: 'absolute', top: -10, left: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, left: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <span style={{
                position: 'absolute', bottom: 24, left: 24,
                background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)',
                padding: '10px 14px', borderRadius: 999,
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: '#fff',
              }}>POOJA · TORONTO · STAGE III</span>
            </div>

            {/* Right: editorial copy */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="mono" style={{ color: 'var(--gold)' }}>CHAPTER · BEGINNINGS</div>
              <h2 className="headline" style={{ margin: '14px 0 18px', fontSize: 'clamp(34px, 3.4vw, 54px)' }}>
                The year I stopped<br/><em className="italic-emph">explaining myself.</em>
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.72, color: 'var(--ink-soft)', margin: 0,
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                  fontSize: 64, color: 'var(--plum)', lineHeight: 0.85,
                  float: 'left', marginRight: 12, marginTop: 6,
                }}>I</span>
                was at a kitchen table in November when I realized I had been describing the same wake-up to three different people in three different ways. To my husband I had been saying I was hot. To my mother I had been saying I was tired. To my doctor I had been saying I was fine, because in his fifteen-minute appointment that was the answer that kept the appointment fifteen minutes long.
              </p>

              {/* Pull quote */}
              <blockquote style={{
                margin: '32px 0', padding: '0 0 0 24px',
                borderLeft: '1px solid var(--gold)',
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, lineHeight: 1.3, color: 'var(--plum)',
              }}>
                "By the third minute I realized the room had been waiting for me to actually say the thing."
              </blockquote>

              <p className="body-md" style={{ margin: 0, fontSize: 16, lineHeight: 1.72 }}>
                The pod was the first place where I didn't have to choose which version. Mei went first, said she had cried in a parking lot for ten minutes that morning, and then said it was not the saddest thing that had happened to her that week. Lara laughed. I laughed. By the third minute I realized the room had been waiting for me to actually say the thing.
              </p>

              <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid rgba(74,54,100,0.10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 500 }}>— Pooja, 53</div>
                    <div className="mono" style={{ marginTop: 4, color: 'var(--plum)' }}>MEMBER · POD 14 · 11 MONTHS</div>
                  </div>
                </div>
                <button className="btn btn-primary">Read in full {Icon.arrow(14)}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── BY THE NUMBERS — community panel ─────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>THE STORIES PANEL · WHAT WE PUBLISH</div>
            <h2 className="headline" style={{ margin: 0 }}>
              We publish what<br/><em className="italic-emph">actually happened.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22, maxWidth: 480 }}>
              An editor reads every submission, copy-edits lightly, and runs it past the writer twice. We pay $250 per piece. We do not run sponsored stories. We do not ghostwrite. We are not always cheerful.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            {[
              ['$250',  'paid per piece', 'No exposure-economy. Members are professionals.'],
              ['1 / 4', 'submissions ran', 'We say no often. Always with a personal note.'],
              ['68',    'pieces this year','One a week, plus the occasional bonus.'],
              ['0',     'sponsored words','Not now, not ever, not for any number.'],
            ].map(([n, l, sub]) => (
              <div key={l} style={{ padding: 28, borderRadius: 14, background: 'var(--surface-bright)', border: '1px solid rgba(74,54,100,0.08)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 44, color: 'var(--plum)', lineHeight: 1 }}>{n}</div>
                <div className="mono" style={{ marginTop: 8, color: 'var(--gold)' }}>{l.toUpperCase()}</div>
                <p className="body-md" style={{ marginTop: 12, fontSize: 13 }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── STORY GRID — magazine catalog ────────────────────── */}
      <section style={{ padding: '0 64px 160px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--ink)', padding: '14px 0' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--plum)' }}>The current issue.</span>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>SIX STORIES · MAY MMXXVI</span>
          </div>

          {/* Mixed-size grid — first piece spans 2 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 28, rowGap: 56 }}>
            {[
              { span: 3, n: '048', cat: 'BODY · 14 MIN', t: 'The morning I asked for the bone scan.', author: 'Mei · 49', tone: 'lavender' },
              { span: 3, n: '049', cat: 'WORK · 19 MIN', t: 'On the meeting I rescheduled, then rescheduled.', author: 'Lara · 47', tone: 'cream' },
              { span: 2, n: '050', cat: 'INTIMACY · 21 MIN', t: 'A long conversation with my husband, in a parked car.', author: 'Renée · 51', tone: 'tan' },
              { span: 2, n: '051', cat: 'MOOD · 11 MIN',  t: 'On the five o\u2019clock wave.', author: 'Anya · 50', tone: 'lavender' },
              { span: 2, n: '052', cat: 'SLEEP · 16 MIN', t: 'A diary of seven nights, in honest terms.', author: 'Bea · 54', tone: 'cream' },
            ].map((a) => (
              <article key={a.n} className="lift" style={{ gridColumn: `span ${a.span}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <Placeholder label={`STORY № ${a.n}`} width="100%" height={a.span === 3 ? 380 : 280} radius={4} tone={a.tone}/>
                  <span style={{
                    position: 'absolute', top: 14, left: 14,
                    padding: '6px 10px', borderRadius: 999,
                    background: 'rgba(255,252,248,0.85)', backdropFilter: 'blur(8px)',
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--plum)',
                  }}>{a.cat}</span>
                  <span style={{
                    position: 'absolute', bottom: 14, right: 14,
                    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--surface-bright)',
                    textShadow: '0 2px 6px rgba(74,54,100,0.4)',
                  }}>№ {a.n}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: a.span === 3 ? 32 : 24, margin: '20px 0 10px', lineHeight: 1.2 }}>
                  {a.t}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--plum)' }}>— {a.author}</span>
                  <span className="mono" style={{ color: 'var(--gold)' }}>READ →</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── EDITOR'S CALL — submit a story ──────────────────── */}
      <section style={{ padding: '160px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>EDITOR’S CALL · OPEN ALL YEAR</div>
            <h2 className="headline" style={{ margin: 0 }}>
              Tell us<br/><em className="italic-emph">what happened.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22, maxWidth: 480 }}>
              We are looking for first-person pieces from women in midlife. 1,200–2,500 words. True. Not necessarily resolved. We read everything within two weeks and respond to every submission, even the no.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '36px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                'Your name, or a pseudonym — your choice',
                'Your age and a one-line context',
                'A working title, even a placeholder',
                'The piece itself, as a .doc, .pages, or pasted',
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
            <button className="btn btn-primary" style={{ marginTop: 32 }}>Submit a story {Icon.arrow(14)}</button>
            <div className="mono" style={{ marginTop: 24, color: 'var(--gold)' }}>
              PAYS $250 ON ACCEPTANCE · BYLINE OR PSEUDONYM
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <Placeholder label={"DESK · TYPEWRITER\nMORNING LIGHT\nWRITER AT WORK"} width="100%" height={520} radius={6} tone="cream"/>
            <div className="glass" style={{
              position: 'absolute', bottom: -28, left: -28, width: 280, padding: 24, borderRadius: 18,
            }}>
              <span style={{ color: 'var(--gold)' }}>{Icon.quote(22)}</span>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.35,
                color: 'var(--ink)', margin: '8px 0 14px',
              }}>
                The piece you almost throw away is usually the one we publish.
              </p>
              <div className="mono" style={{ color: 'var(--plum)' }}>— A. KAPLAN · EDITOR</div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── STORIES ARCHIVE BAND ─────────────────────────────── */}
      <section style={{ padding: '120px 64px 60px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, borderBottom: '1px solid var(--ink)', paddingBottom: 14 }}>
            <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(28px, 2.4vw, 36px)' }}>
              The archive.
            </h2>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>147 STORIES · OPEN, FREE</span>
          </div>

          {/* Compact index table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
            {[
              [
                ['№ 046', 'When my friend told me to "try magnesium"',          'Mei · 49'],
                ['№ 045', 'On the perimenopause I had at 39',                 'Sara · 41'],
                ['№ 044', 'A letter to my mother, who is also in this',       'Renée · 51'],
                ['№ 043', 'The two-day hot flash, and what I told my boss',   'Anya · 50'],
                ['№ 042', 'Why I quit my therapist',                          'Bea · 54'],
                ['№ 041', 'The DEXA appointment my GP forgot to mention',     'Lara · 47'],
              ],
              [
                ['№ 040', 'On the long November',                              'Pooja · 53'],
                ['№ 039', 'A diary of one week off HRT',                       'Anonymous · 48'],
                ['№ 038', 'My husband, my mother, and the same question',    'Mei · 49'],
                ['№ 037', 'The conference call I did from the bath',          'Lara · 47'],
                ['№ 036', 'On finally being heard',                            'Anonymous · 52'],
                ['№ 035', 'Three weeks of cold rooms',                         'Renée · 51'],
              ],
            ].map((col, ci) => (
              <ul key={ci} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.map(([n, t, a]) => (
                  <li key={n} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px', gap: 16, padding: '14px 0', borderTop: '1px dashed rgba(74,54,100,0.18)', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--gold)' }}>{n}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>{t}</span>
                    <span className="mono" style={{ color: 'var(--ink-faint)', textAlign: 'right' }}>{a}</span>
                  </li>
                ))}
                <span style={{ display: 'block', height: 1, background: 'rgba(74,54,100,0.18)', borderStyle: 'dashed' }} />
              </ul>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <a href="#" style={{ fontSize: 14, color: 'var(--plum)', textDecoration: 'none', borderBottom: '1px solid var(--gold)', paddingBottom: 4 }}>
              Browse all 147 stories →
            </a>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
