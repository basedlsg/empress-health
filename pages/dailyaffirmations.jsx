/* global React, Placeholder, Nav, Icon, SectionHeading, Footer */
// Daily Affirmations — subscribe to /api/affirmations/subscribe, sample affirmation cards, how-it-works rail

const SAMPLE_AFFIRMATION = {
  date: 'MON · MAY XXV · MMXXVI',
  focus_domain: 'RESILIENCE',
  text: 'I bend but do not break. I grow through what I go through — not despite it, but because of it. Today I meet myself with gentleness.',
  citation: 'SOURCES · CHUNK-044 · NAMS MINDFULNESS COHORT 2024',
};

const ALL_AFFIRMATIONS = [
  { domain: 'HEALING',         text: 'My body and heart know how to heal. I support them with patience.' },
  { domain: 'SELF-CONFIDENCE', text: 'I trust my experience. I\'ve overcome so much already.' },
  { domain: 'HOPE',            text: 'New paths are opening for me, one step at a time.' },
  { domain: 'RESILIENCE',      text: 'I bend but do not break. I grow through what I go through.' },
  { domain: 'PEACE',           text: 'I choose a gentle pace. Peace grows with every breath.' },
  { domain: 'CONNECTION',      text: 'I reach out. I am worthy of being seen, heard, and held.' },
];

const CATEGORIES = ['Mood & Anxiety', 'Sleep & Rest', 'Body Image', 'Resilience', 'Relationships', 'Purpose'];
const TONES = ['lavender', 'cream', 'tan'];

function DailyAffirmations() {
  const [email, setEmail] = React.useState('');
  const [selected, setSelected] = React.useState([]);
  const [status, setStatus] = React.useState(null); // null | 'sending' | 'ok' | 'err'

  function toggleCat(c) {
    setSelected(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/affirmations/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, preferences: selected }),
      });
      setStatus(res.ok ? 'ok' : 'err');
    } catch {
      setStatus('err');
    }
  }

  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={3} base="" />
      </div>

      {/* ── HERO ── lavender portrait half */}
      <section style={{ position: 'relative', padding: '40px 64px 120px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--surface-lavender) 0%, var(--surface) 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -80, right: -120, width: 540, height: 540, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,165,96,0.12) 0%, rgba(201,165,96,0) 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', minHeight: 680 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--gold)' }} />
              <span className="mono" style={{ color: 'var(--plum)' }}>DAILY AFFIRMATIONS · EMPRESS HEALTH</span>
            </div>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(48px, 5.4vw, 88px)' }}>
              An affirmation in <em className="italic-emph">your inbox.</em>
            </h1>
            <p className="body-lg" style={{ marginTop: 26, maxWidth: 480 }}>
              Every morning at 8AM, a single affirmation — tuned to your health assessment priorities, grounded in evidence, and written for the life you're actually living.
            </p>
            <div style={{ marginTop: 36, display: 'flex', gap: 14 }}>
              <button className="btn btn-primary" onClick={() => document.getElementById('subscribe-form').scrollIntoView({ behavior: 'smooth' })}>
                Subscribe free {Icon.arrow(14)}
              </button>
              <button className="btn btn-ghost">Read today's letter</button>
            </div>
            <div style={{ marginTop: 48, display: 'flex', gap: 36, paddingTop: 28, borderTop: '1px solid rgba(74,54,100,0.10)' }}>
              {[['8AM', 'daily delivery'], ['26', 'affirmation domains'], ['Free', 'for all members']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, color: 'var(--plum)', lineHeight: 1 }}>{n}</div>
                  <div className="mono" style={{ marginTop: 6, color: 'var(--ink-soft)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Placeholder label="PORTRAIT · WOMAN 48-54 · MORNING LIGHT · LAVENDER BACKGROUND" width="100%" height={580} radius={16} tone="lavender" />
            {/* Floating affirmation card */}
            <div className="glass" style={{
              position: 'absolute', bottom: -28, left: -28, width: 280, padding: 24, borderRadius: 18,
              backgroundColor: 'rgba(239,231,245,0.75)',
            }}>
              <div className="mono" style={{ color: 'var(--gold)' }}>{SAMPLE_AFFIRMATION.date}</div>
              <div className="eyebrow" style={{ marginTop: 10 }}>{SAMPLE_AFFIRMATION.focus_domain}</div>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.4, color: 'var(--ink)', margin: '10px 0 14px' }}>
                "{SAMPLE_AFFIRMATION.text.slice(0, 90)}…"
              </p>
              <div className="mono" style={{ color: 'var(--gold)', fontSize: 9 }}>{SAMPLE_AFFIRMATION.citation}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SAMPLE AFFIRMATION CARD (full) ── */}
      <section style={{ padding: '120px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 56px' }}>
            <SectionHeading
              align="center"
              eyebrow="TODAY'S AFFIRMATION"
              title="An example from"
              italicTail="the archive."
              sub="Each affirmation is matched to a focus domain from your health assessment — and always carries a source citation."
            />
          </div>

          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <article className="glass-warm lift" style={{ padding: '40px 48px', borderRadius: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div className="mono" style={{ color: 'var(--gold)' }}>{SAMPLE_AFFIRMATION.date}</div>
                <span className="eyebrow">{SAMPLE_AFFIRMATION.focus_domain}</span>
              </div>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, lineHeight: 1.45,
                color: 'var(--ink)', margin: 0,
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                  fontSize: 64, color: 'var(--plum)', lineHeight: 0.8, float: 'left', marginRight: 10, marginTop: 4 }}>I</span>
                {SAMPLE_AFFIRMATION.text.slice(1)}
              </p>
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px dashed rgba(74,54,100,0.18)' }}>
                <div className="mono" style={{ color: 'var(--gold)' }}>{SAMPLE_AFFIRMATION.citation}</div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── AFFIRMATION GRID SAMPLE ── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <SectionHeading
            align="left"
            eyebrow="THE DOMAINS"
            title="Affirmations for"
            italicTail="every morning."
            sub="26 domains matched to the symptom categories from your health assessment. You receive the domain most relevant to your week."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, marginTop: 56 }}>
            {ALL_AFFIRMATIONS.map((a, i) => (
              <article key={a.domain} className="glass-warm" style={{ padding: '28px 32px', borderRadius: 18, backgroundColor: i % 2 === 0 ? 'rgba(239,231,245,0.5)' : 'rgba(247,232,218,0.5)' }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>{a.domain}</div>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.4, color: 'var(--ink)', margin: '0 0 18px' }}>
                  "{a.text}"
                </p>
                <div className="mono" style={{ color: 'var(--gold)' }}>SOURCES · EMPRESS HEALTH · CHUNK-{String(i + 40).padStart(3, '0')}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBSCRIBE FORM ── */}
      <section id="subscribe-form" style={{ padding: '120px 64px', background: 'var(--surface-cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>OPT IN · FREE FOR MEMBERS</div>
            <h2 className="headline" style={{ margin: 0 }}>
              Subscribe to <em className="italic-emph">the morning letter.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22, maxWidth: 480 }}>
              One affirmation, every morning at 8AM your time. Tuned to your assessment priorities. Grounded in clinical evidence. You can pause any day.
            </p>
          </div>

          <div className="glass-warm" style={{ padding: 36, borderRadius: 24 }}>
            {status === 'ok' ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, color: 'var(--plum)', marginBottom: 12 }}>
                  You're in the circle.
                </div>
                <p className="body-md">Your first affirmation arrives tomorrow at 8AM.</p>
                <div className="mono" style={{ marginTop: 16, color: 'var(--gold)' }}>WELCOME · EMPRESS HEALTH</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mono" style={{ color: 'var(--gold)', marginBottom: 20 }}>YOUR DETAILS</div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>
                    Email address
                  </label>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 'var(--r-md)',
                      border: '1px solid rgba(74,54,100,0.18)', fontFamily: 'var(--font-body)', fontSize: 15,
                      background: 'var(--surface)', color: 'var(--ink)', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
                    Preference categories (optional)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {CATEGORIES.map(c => (
                      <button key={c} type="button"
                        onClick={() => toggleCat(c)}
                        style={{
                          padding: '8px 14px', borderRadius: 999, fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500,
                          border: selected.includes(c) ? '1px solid var(--plum)' : '1px solid rgba(74,54,100,0.18)',
                          background: selected.includes(c) ? 'var(--plum)' : 'transparent',
                          color: selected.includes(c) ? '#fff' : 'var(--ink)', cursor: 'pointer',
                        }}
                      >{c}</button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                  disabled={status === 'sending'}>
                  {status === 'sending' ? 'Subscribing…' : 'Subscribe — it\'s free'}
                </button>
                {status === 'err' && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 10 }}>Something went wrong — please try again.</p>}
                <div className="mono" style={{ marginTop: 16, color: 'var(--ink-faint)', textAlign: 'center' }}>UNSUBSCRIBE ANY TIME · NO SPAM EVER</div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS 3-STEP RAIL ── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 64px' }}>
            <SectionHeading
              align="center"
              eyebrow="HOW IT WORKS"
              title="Three steps to"
              italicTail="your morning letter."
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { n: '01', t: 'Take the assessment', sub: 'Your HI Report maps symptoms, priorities, and the domains most relevant to your life right now.' },
              { n: '02', t: 'We tune to your priorities', sub: 'Our affirmation engine selects from 26 domains based on what your report flagged as most pressing.' },
              { n: '03', t: 'Daily delivery at 8AM', sub: 'One affirmation arrives each morning, with a source citation and a one-line clinical context. Read it in 45 seconds.' },
            ].map(s => (
              <div key={s.n} style={{ padding: '28px 0', borderTop: '1px solid var(--ink)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 36, color: 'var(--gold)', lineHeight: 1 }}>{s.n}</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, margin: '18px 0 10px', lineHeight: 1.25 }}>{s.t}</h3>
                <p className="body-md" style={{ margin: 0 }}>{s.sub}</p>
                <div className="mono" style={{ marginTop: 14, color: 'var(--gold)' }}>SOURCES · EMPRESS HI ENGINE · CHUNK-088</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
