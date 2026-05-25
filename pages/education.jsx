/* global React, Placeholder, Nav, Icon, Footer */
// Education — Editorial library: a magazine index of long-form pieces, written by clinicians.

function Education() {
  return (
    <div data-screen-label="Education" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={5} base="" />
      </div>

      {/* ───── MASTHEAD HERO ────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '20px 64px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -180, right: -160, width: 720, height: 720, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.30) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          {/* Masthead */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 48 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>THE EMPRESS LIBRARY · LONG-FORM</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>148 PIECES · ALL FREE · UPDATED WEEKLY</div>
          </div>

          {/* Big title */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'end', marginBottom: 60 }}>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(56px, 6.4vw, 104px)', lineHeight: 0.98 }}>
              Read it<br/><em className="italic-emph">like a magazine.</em>
            </h1>
            <p className="body-lg" style={{ margin: 0, fontSize: 19 }}>
              Long-form pieces on menopause, perimenopause, midlife: written by NAMS-certified clinicians, edited by people who would never let a clinician write the first sentence. Citations live on the page, not at the bottom.
            </p>
          </div>

          {/* Featured cover article */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 56, alignItems: 'stretch' }}>
            <div style={{ position: 'relative' }}>
              <Placeholder label={"COVER PHOTOGRAPH\nLEAD ARTICLE · MAY MMXXVI\nKINFOLK INTERIOR"} width="100%" height={560} radius={6} tone="lavender"/>
              <span style={{
                position: 'absolute', top: 22, left: 22,
                padding: '8px 14px', borderRadius: 999,
                background: 'rgba(255,252,248,0.85)', backdropFilter: 'blur(8px)',
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--plum)',
                border: '1px solid rgba(255,255,255,0.6)',
              }}>THE LEAD · ISSUE 03</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="mono" style={{ color: 'var(--gold)' }}>CHAPTER · SLEEP · 18 MIN READ</div>
                <h2 className="headline" style={{ margin: '20px 0 18px', fontSize: 'clamp(32px, 3.4vw, 52px)' }}>
                  The 3:47 wakeup,<br/><em className="italic-emph">and what to do about it.</em>
                </h2>
                <p className="body-lg" style={{ margin: 0 }}>
                  Most middle-of-the-night waking in midlife is not insomnia. It is a vasomotor cascade, a circadian reset, and a slight estrogen withdrawal — and it has a shape you can learn to ride.
                </p>
              </div>
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(74,54,100,0.10)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden' }}>
                    <Placeholder label="" width="100%" height="100%" radius={0} tone="cream"/>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Dr. M. Chen</div>
                    <div className="mono" style={{ marginTop: 4, color: 'var(--plum)' }}>NAMS · MENOPAUSE PRACTITIONER</div>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 22 }}>Open the piece {Icon.arrow(16)}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── TABLE OF CONTENTS ────────────────────────────────── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)', borderBottom: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 36 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, color: 'var(--plum)' }}>Table of contents.</span>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>VOLUME I · ISSUE 03 · MAY MMXXVI</span>
          </div>

          {/* TOC list */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
            {[
              [
                ['Sleep',     [['The 3:47 wakeup', '18'], ['Cool the room, not the body', '12'], ['When melatonin stops working', '9']]],
                ['Mood',      [['The five o\u2019clock wave', '11'], ['SSRIs in midlife, a reckoning', '22'], ['On not being able to cry', '8']]],
                ['Cognition', [['On the word that won\u2019t come', '14'], ['The work-meeting brain fog', '10']]],
              ],
              [
                ['Heat',      [['What a hot flash actually is', '13'], ['Why winter makes it worse', '7']]],
                ['Body',      [['Joints in perimenopause', '16'], ['The midlife belly, honestly', '19']]],
                ['Intimacy',  [['Desire without context', '21'], ['Pelvic floor PT 101', '12']]],
                ['Bone',      [['DEXA at 47', '15'], ['Resistance for the unconvinced', '11']]],
              ],
            ].map((col, ci) => (
              <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {col.map(([cat, pieces]) => (
                  <div key={cat}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--gold)' }} />
                      <span className="mono" style={{ color: 'var(--plum)' }}>{cat.toUpperCase()}</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
                      {pieces.map(([title, page]) => (
                        <li key={title} style={{
                          display: 'grid', gridTemplateColumns: '1fr auto', gap: 18,
                          padding: '12px 0', borderTop: '1px dashed rgba(74,54,100,0.18)',
                          alignItems: 'baseline',
                        }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)' }}>{title}</span>
                          <span className="mono" style={{ color: 'var(--ink-faint)' }}>PP. {page}</span>
                        </li>
                      ))}
                      <span style={{ display: 'block', height: 1, background: 'rgba(74,54,100,0.18)', borderStyle: 'dashed' }} />
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FEATURED ARTICLE GRID ────────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 56, borderBottom: '1px solid var(--ink)', paddingBottom: 14 }}>
            <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(32px, 3vw, 44px)' }}>
              This week, <em className="italic-emph">we recommend.</em>
            </h2>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>SIX PIECES</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, rowGap: 72 }}>
            {[
              {
                chapter: 'SLEEP', read: '18 MIN', tone: 'lavender',
                t: 'The 3:47 wakeup, and what to do about it.',
                lede: 'Most middle-of-the-night waking in midlife is not insomnia. It is a vasomotor cascade…',
                author: 'Dr. M. Chen', role: 'NAMS', cite: 'NAMS § 7.1 · CHUNK-104',
              },
              {
                chapter: 'COGNITION', read: '14 MIN', tone: 'cream',
                t: 'On the word that won\u2019t come.',
                lede: 'A guided reading of midlife word-finding pause — what it is, what it isn\u2019t, what helps…',
                author: 'Dr. R. Patel', role: 'ENDOCRINE', cite: 'ENDOCRINE SOC. 2023',
              },
              {
                chapter: 'INTIMACY', read: '21 MIN', tone: 'tan',
                t: 'Desire without context.',
                lede: 'On why "spontaneous" is not the metric you think — and what responsive desire actually wants…',
                author: 'Sara Okonkwo', role: 'PELVIC FLOOR PT', cite: 'IPPS · 2022',
              },
              {
                chapter: 'HEAT', read: '13 MIN', tone: 'cream',
                t: 'What a hot flash actually is.',
                lede: 'A four-minute, two-step thermal event that you are not imagining and are not failing at…',
                author: 'Dr. L. Iversen', role: 'NAMS', cite: 'NAMS § 4.2',
              },
              {
                chapter: 'BODY', read: '16 MIN', tone: 'lavender',
                t: 'Joints in perimenopause.',
                lede: 'Why your knee, hip, and the second knuckle on your right hand all decided to speak up at once…',
                author: 'Dr. R. Patel', role: 'ENDOCRINE', cite: 'JOINT § 2024',
              },
              {
                chapter: 'BONE', read: '15 MIN', tone: 'tan',
                t: 'DEXA at 47.',
                lede: 'The bone scan most women in midlife are not offered, and the reasonable script to ask for one…',
                author: 'Dr. M. Chen', role: 'NAMS', cite: 'NAMS § 9 · CHUNK-201',
              },
            ].map((a, i) => (
              <article key={a.t} className="lift" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <Placeholder label={`COVER · ${a.chapter}`} width="100%" height={300} radius={4} tone={a.tone}/>
                  <span style={{
                    position: 'absolute', top: 14, left: 14,
                    padding: '6px 10px', borderRadius: 999,
                    background: 'rgba(255,252,248,0.85)', backdropFilter: 'blur(8px)',
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--plum)',
                  }}>{a.chapter} · {a.read}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 24, margin: '22px 0 10px', lineHeight: 1.2 }}>{a.t}</h3>
                <p className="body-md" style={{ margin: 0 }}>{a.lede}</p>
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(74,54,100,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--plum)' }}>— {a.author}</span>
                    <span className="mono" style={{ marginLeft: 10, color: 'var(--ink-faint)' }}>{a.role}</span>
                  </div>
                  <span className="mono" style={{ color: 'var(--gold)' }}>{a.cite.split(' · ')[0]}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PULL QUOTE FROM ARTICLE ──────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <svg style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', opacity: 0.5 }} width="60" height="60" viewBox="0 0 32 32" fill="var(--gold)">
            <path d="M9 8c-3 0-5 2.5-5 6 0 3 2 5 4.5 5 0 3-2 5-5 5v3c6 0 10-4 10-10V8H9zm14 0c-3 0-5 2.5-5 6 0 3 2 5 4.5 5 0 3-2 5-5 5v3c6 0 10-4 10-10V8h-4.5z"/>
          </svg>
          <p style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(30px, 3.4vw, 48px)', lineHeight: 1.25, color: 'var(--ink)', margin: 0,
          }}>
            "We do not write so that you can be informed at the doctor. We write so that you can be the one in the room who actually knows what is going on."
          </p>
          <div style={{ marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 18 }}>
            <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500 }}>— The editor's note · Issue 01</span>
            <span style={{ display: 'inline-block', width: 50, height: 1, background: 'var(--gold)' }} />
          </div>
        </div>
      </section>

      {/* ───── BACK ISSUES ──────────────────────────────────────── */}
      <section style={{ padding: '120px 64px 60px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, borderBottom: '1px solid var(--ink)', paddingBottom: 14 }}>
            <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(28px, 2.4vw, 36px)' }}>
              Back issues.
            </h2>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>OPEN ANYTHING · NO PAYWALL</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18 }}>
            {[
              ['ISSUE 02', 'APR MMXXVI', 'The body in transition', 'tan'],
              ['ISSUE 01', 'MAR MMXXVI', 'Beginnings', 'lavender'],
              ['ISSUE V',  'FEB MMXXVI', 'On the wakeup', 'cream'],
              ['ISSUE IV', 'JAN MMXXVI', 'Quiet seasons', 'lavender'],
              ['ISSUE III','DEC MMXXV',  'Cold light', 'tan'],
              ['ISSUE II', 'NOV MMXXV',  'Long November', 'cream'],
            ].map(([n, d, t, tone]) => (
              <a key={n} href="#" style={{ textDecoration: 'none', color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Placeholder label={`${n}\nCOVER`} width="100%" height={220} radius={3} tone={tone}/>
                <div>
                  <div className="mono" style={{ color: 'var(--gold)' }}>{n} · {d}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, marginTop: 6, lineHeight: 1.25 }}>{t}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ───── NEWSLETTER ───────────────────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)' }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          position: 'relative', overflow: 'hidden', borderRadius: 32,
          background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)',
          padding: '80px 80px',
          border: '1px solid rgba(255,255,255,0.5)',
        }}>
          <div style={{ position: 'absolute', top: -120, right: -80, width: 460, height: 460, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(40px)' }} />

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>SUBSCRIBE · WEEKLY · FREE</div>
              <h2 className="display" style={{ margin: 0, fontSize: 'clamp(36px, 4.2vw, 60px)', color: 'var(--plum)' }}>
                One piece, every<br/>Sunday morning,<br/>
                <em className="italic-emph" style={{ color: 'var(--plum-mid)' }}>read in your kitchen.</em>
              </h2>
              <p className="body-lg" style={{ marginTop: 22, maxWidth: 480, color: 'var(--ink-soft)' }}>
                14,000 women in midlife already read it. Unsubscribe in one click; we don't make you say why.
              </p>
            </div>
            <div style={{ background: 'rgba(255,252,248,0.75)', padding: '8px 8px 8px 22px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 30px 60px -30px rgba(74,54,100,0.30)' }}>
              <input placeholder="your@email.com" style={{ flex: 1, padding: '14px 0', border: 0, background: 'transparent', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', color: 'var(--ink)' }} />
              <button className="btn btn-primary" style={{ padding: '14px 22px' }}>Subscribe {Icon.arrow(14)}</button>
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
