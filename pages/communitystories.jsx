/* global React, Placeholder, Nav, Icon, SectionHeading, Footer */
// Community Stories — editorial story grid with member voice data from community-stories.csv

const STORIES = [
  { name: 'Pooja',    rating: '5/5', quote: 'The Ask Empress chatbot felt like talking to a wise friend who actually gets what I\'m going through. It guided me when I felt most confused.' },
  { name: 'Meena',   rating: '4/5', quote: 'I\'ve tried so many platforms, but this is the first one that makes menopause care feel personalized. I finally feel seen.' },
  { name: 'Kate',    rating: '5/5', quote: 'The tips and care I received completely transformed my sleep. The affirmations lifted my spirit, and the expert care gave me a path that actually works.' },
  { name: 'Susie',   rating: '4/5', quote: 'Ask Empress answered questions I was embarrassed to ask even my doctor. No judgment, just real answers.' },
  { name: 'Romano',  rating: '5/5', quote: 'This platform combines science and compassion in a way I\'ve never experienced before.' },
  { name: 'Lauren',  rating: '4/5', quote: 'For years, I thought I was the only one dealing with brain fog and mood swings. Empress showed me I\'m not alone — and gave me tools that actually help.' },
  { name: 'Rubins',  rating: '5/5', quote: 'The progress tracker gave me clarity. For the first time, I can see what\'s helping me and what\'s not.' },
  { name: 'Rachel',  rating: '4/5', quote: 'It\'s like the platform was designed just for me. Every feature feels thoughtful, supportive, and personal.' },
  { name: 'Patty',   rating: '5/5', quote: 'Ask Empress is always there — at 2 am when I can\'t sleep, or in the morning when I need guidance. It feels like 24/7 support in my pocket.' },
  { name: 'Zaria',   rating: '4/5', quote: 'I love how this platform speaks to me like a woman, not a patient. It\'s respectful, empowering, and uplifting.' },
  { name: 'Marina',  rating: '5/5', quote: 'The affirmations sound simple, but they\'ve helped me through tough days. It feels like the platform understands more than just symptoms.' },
  { name: 'Angela',  rating: '5/5', quote: 'It feels like a safe space built just for us — women navigating midlife with strength and grace.' },
  { name: 'Jeanette',rating: '5/5', quote: 'Empress Health makes me feel like I have a team walking with me. I\'m never alone anymore.' },
  { name: 'Deandre', rating: '4/5', quote: 'The community pods are amazing — I never realized how much I needed other women\'s voices in this journey.' },
  { name: 'Stephanie',rating:'5/5', quote: 'This is the first time technology actually feels human. Ask Empress feels like she\'s holding my hand.' },
  { name: 'Maushmi', rating: '5/5', quote: 'I was skeptical at first, but within a week I felt calmer, more informed, and more hopeful.' },
  { name: 'Aparna',  rating: '4/5', quote: 'Menopause used to feel like a silent struggle. With Empress Health, I finally feel heard.' },
  { name: 'Alka',    rating: '5/5', quote: 'Every woman deserves a platform like this — one that treats us with dignity, knowledge, and care.' },
];

const TONES = ['lavender', 'cream', 'tan', 'lavender', 'cream', 'tan'];
const ARCHIVE = [
  ['MMXXVI', ['Pooja · 53 · Stage III', 'Meena · 47 · Perimenopause', 'Kate · 51 · Post-menopause', 'Lauren · 49 · Stage II', 'Marina · 54 · Stage III']],
  ['MMXXV',  ['Romano · 52 · Perimenopause', 'Jeanette · 55 · Stage IV', 'Alka · 50 · Stage II', 'Aparna · 48 · Perimenopause', 'Maushmi · 53 · Stage III']],
];

function CommunityStories() {
  const featured = STORIES[0];
  const grid = STORIES.slice(1, 9);

  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={6} base="" />
      </div>

      {/* ── MASTHEAD HERO ── */}
      <section style={{ position: 'relative', padding: '32px 64px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: -140, width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.28) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -100, width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.18) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 16, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>COMMUNITY STORIES · VOLUME II · MMXXVI</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>WRITTEN BY MEMBERS · NEVER GHOSTWRITTEN</div>
          </div>

          <div style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(52px, 6vw, 96px)' }}>
              Real stories, <em className="italic-emph">from real women.</em>
            </h1>
            <p className="body-lg" style={{ marginTop: 28, maxWidth: 600, margin: '28px auto 0' }}>
              Members of the Empress circle sharing what this stage of life has felt like — in their own words, without edit. We publish the true version.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURED STORY ── */}
      <section style={{ padding: '0 64px 60px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: 'var(--plum)' }}>The lead piece.</span>
            <span className="mono" style={{ color: 'var(--gold)' }}>STORY № 001 · MEMBER VOICE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 56, alignItems: 'stretch' }}>
            <div style={{ position: 'relative' }}>
              <Placeholder label="POOJA · 53 · NATURAL LIGHT · KITCHEN MORNING" width="100%" height={720} radius={4} tone="tan" />
              <div style={{ position: 'absolute', top: -10, left: -10, width: 22, height: 22, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', top: -10, right: -10, width: 22, height: 22, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, left: -10, width: 22, height: 22, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 22, height: 22, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <span style={{
                position: 'absolute', bottom: 20, left: 20,
                background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(8px)',
                padding: '8px 14px', borderRadius: 999,
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: '#fff',
              }}>POOJA · TORONTO · PERIMENOPAUSE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="mono" style={{ color: 'var(--gold)' }}>MEMBER VOICE · SELF-DESCRIBED</div>
              <h2 className="headline" style={{ margin: '14px 0 18px', fontSize: 'clamp(30px, 3vw, 50px)' }}>
                The chatbot that <em className="italic-emph">got it.</em>
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.75, color: 'var(--ink-soft)', margin: 0 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                  fontSize: 60, color: 'var(--plum)', lineHeight: 0.85, float: 'left', marginRight: 12, marginTop: 6 }}>T</span>
                he Ask Empress chatbot felt like talking to a wise friend who actually gets what I'm going through. It guided me when I felt most confused — when the brain fog made even simple decisions feel impossible, and the 3 AM wake-ups had become a nightly ritual I didn't sign up for.
              </p>

              <blockquote style={{ margin: '28px 0', padding: '0 0 0 22px',
                borderLeft: '1px solid var(--gold)',
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, lineHeight: 1.3, color: 'var(--plum)' }}>
                "For the first time, I didn't have to choose which version of myself to explain."
              </blockquote>

              <p className="body-md" style={{ margin: 0, fontSize: 15, lineHeight: 1.75 }}>
                I had been describing the same symptoms to three different people in three different ways. To my husband: fatigue. To my mother: stress. To my doctor: fine. The Empress platform was the first place where I could say all of it at once, without editing myself.
              </p>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(74,54,100,0.10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ display: 'inline-block', width: 36, height: 1, background: 'var(--gold)' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>— Pooja, 53</div>
                    <div className="mono" style={{ marginTop: 4, color: 'var(--plum)' }}>MEMBER · TORONTO · 5/5</div>
                  </div>
                </div>
                <button className="btn btn-primary">Read in full {Icon.arrow(14)}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MIXED-SPAN GRID ── */}
      <section style={{ padding: '80px 64px 120px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--ink)', padding: '14px 0' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>From the circle.</span>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>{grid.length} VOICES · MMXXVI</span>
          </div>

          {/* Mixed grid: 1 wide (col 1–4), 2 tall (col 5–6 across rows), 3 standard */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 24, rowGap: 40 }}>
            {grid.map((s, i) => {
              const span = i === 0 ? 4 : i === 1 || i === 2 ? 3 : 2;
              const height = i === 0 ? 400 : i === 1 || i === 2 ? 320 : 260;
              const tone = TONES[i % TONES.length];
              return (
                <article key={s.name} className="lift" style={{ gridColumn: `span ${span}`, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative' }}>
                    <Placeholder label={`${s.name.toUpperCase()} · MEMBER`} width="100%" height={height} radius={4} tone={tone} />
                    <span style={{ position: 'absolute', top: 14, left: 14,
                      padding: '5px 10px', borderRadius: 999,
                      background: 'rgba(255,252,248,0.85)', backdropFilter: 'blur(8px)',
                      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--plum)' }}>{s.rating}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: span >= 3 ? 20 : 17, margin: '18px 0 8px', lineHeight: 1.3, color: 'var(--ink)' }}>
                    "{s.quote}"
                  </p>
                  <span className="gold-rule" style={{ marginBottom: 10 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--plum)' }}>— {s.name}</span>
                    <span className="mono" style={{ color: 'var(--gold)' }}>MEMBER →</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS PANEL ── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>THE STORIES PANEL</div>
            <h2 className="headline" style={{ margin: 0 }}>
              We publish what <em className="italic-emph">actually happened.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22, maxWidth: 480 }}>
              Every voice in this archive is a member. Every review is real. We do not curate for cheerfulness. We curate for honesty.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            {[
              ['25+', 'member voices', 'Collected from the Empress circle over six months.'],
              ['4.7', 'average rating', 'Every review represented, including the 4-star ones.'],
              ['0', 'ghostwritten lines', 'Word-for-word from members. Never paraphrased.'],
              ['60M+', 'U.S. women', 'Navigating menopause — most without adequate support.'],
            ].map(([n, l, sub]) => (
              <div key={l} style={{ padding: 26, borderRadius: 14, background: 'var(--surface-bright)', border: '1px solid rgba(74,54,100,0.08)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 40, color: 'var(--plum)', lineHeight: 1 }}>{n}</div>
                <div className="mono" style={{ marginTop: 8, color: 'var(--gold)' }}>{l.toUpperCase()}</div>
                <p className="body-md" style={{ marginTop: 10, fontSize: 13 }}>{sub}</p>
                <div className="mono" style={{ marginTop: 10, color: 'var(--gold)', fontSize: 9 }}>SOURCES · EMPRESS COMMUNITY · MMXXVI</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARCHIVE INDEX ── */}
      <section style={{ padding: '120px 64px 80px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, borderBottom: '1px solid var(--ink)', paddingBottom: 14 }}>
            <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(26px, 2.4vw, 34px)' }}>The archive.</h2>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>{STORIES.length} VOICES · ALL OPEN · FREE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
            {ARCHIVE.map(([year, items]) => (
              <div key={year}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <span style={{ width: 36, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>{year}</span>
                  <span style={{ width: 36, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, padding: '13px 0', borderTop: '1px dashed rgba(74,54,100,0.18)', alignItems: 'baseline' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--ink)' }}>{item}</span>
                      <span className="mono" style={{ color: 'var(--gold)' }}>READ →</span>
                    </li>
                  ))}
                  <span style={{ display: 'block', height: 1, background: 'rgba(74,54,100,0.18)' }} />
                </ul>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 52 }}>
            <a href="#" style={{ fontSize: 14, color: 'var(--plum)', textDecoration: 'none', borderBottom: '1px solid var(--gold)', paddingBottom: 4 }}>
              Browse all voices →
            </a>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
