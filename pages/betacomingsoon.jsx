/* global React, Nav, Footer, Placeholder */
// Beta Coming Soon — Empress Health · Empathetic Elegance

// NOTE: The email-capture form POSTs to /api/notify-when-ready
// That endpoint does not exist yet — it should accept { email: string }
// and add the address to the pre-launch waitlist. Add a 201 response
// with { ok: true, message: "You're on the list." } when implementing.

function BetaComingSoon() {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle | loading | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/notify-when-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div data-screen-label="Beta Coming Soon" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Orb atmosphere */}
      <div style={{
        position: 'fixed', top: -200, right: -160, width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(214,188,243,0.22) 0%, rgba(214,188,243,0) 65%)',
        filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: -200, left: -120, width: 560, height: 560, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,222,196,0.18) 0%, rgba(247,222,196,0) 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={0} base="" />
      </div>

      {/* Hero — editorial two-column */}
      <section style={{ position: 'relative', padding: '80px 64px 140px', zIndex: 1 }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
        }}>
          {/* Left — copy */}
          <div>
            <div className="mono" style={{ color: 'var(--gold)', marginBottom: 24 }}>EMPRESS · MMXXVI · BETA PROGRAM</div>

            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(44px, 5vw, 80px)', lineHeight: 1 }}>
              Something good,{' '}
              <em className="italic-emph" style={{ display: 'block' }}>coming very soon.</em>
            </h1>

            <p className="body-lg" style={{ marginTop: 32, maxWidth: 480, color: 'var(--ink-soft)' }}>
              We are putting the finishing touches on a clinical experience that takes menopause seriously — a 34-page Health Intelligence Report, NAMS-certified care, and a twelve-week arc designed around your biology. The beta opens to a small cohort first. Leave your email and you will hear from us before anyone else does.
            </p>

            {/* Email capture */}
            <form onSubmit={handleSubmit} style={{ marginTop: 40 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  aria-label="Email address for waitlist"
                  style={{
                    flex: '1 1 260px',
                    padding: '14px 20px',
                    borderRadius: 'var(--r-pill)',
                    border: '1px solid rgba(74,54,100,0.18)',
                    background: 'var(--surface-bright)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 15,
                    color: 'var(--ink)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={status === 'loading'}
                  style={{ flexShrink: 0 }}
                >
                  {status === 'loading' ? 'One moment…' : 'Notify me →'}
                </button>
              </div>

              {status === 'success' && (
                <div className="mono" style={{ marginTop: 14, color: 'var(--plum)' }}>
                  YOU'RE ON THE LIST — WE'LL BE IN TOUCH.
                </div>
              )}
              {status === 'error' && (
                <div className="mono" style={{ marginTop: 14, color: '#a04050' }}>
                  SOMETHING WENT WRONG — TRY AGAIN OR EMAIL US DIRECTLY.
                </div>
              )}
            </form>

            {/* Social proof strip */}
            <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, color: 'var(--plum)', lineHeight: 1 }}>500+</span>
                <span className="mono" style={{ color: 'var(--ink-soft)' }}>early adopters</span>
              </div>
              <span style={{ width: 1, height: 32, background: 'rgba(74,54,100,0.15)' }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, color: 'var(--plum)', lineHeight: 1 }}>12</span>
                <span className="mono" style={{ color: 'var(--ink-soft)' }}>NAMS clinicians</span>
              </div>
            </div>

            <div className="mono" style={{ marginTop: 24, color: 'var(--gold)' }}>
              NO SPAM · NO COMMITMENTS · UNSUBSCRIBE ANY TIME
            </div>
          </div>

          {/* Right — portrait placeholder */}
          <div style={{ position: 'relative' }}>
            <Placeholder
              label={"BETA COVER PORTRAIT\nWOMAN 45–55 · NATURAL LIGHT\nSTUDIO · QUIET"}
              width="100%" height={620} radius={8} tone="lavender"
            />
            {/* Gold corner brackets */}
            {[
              { top: -10, left: -10, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' },
              { top: -10, right: -10, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' },
              { bottom: -10, left: -10, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' },
              { bottom: -10, right: -10, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 18, height: 18, ...s }} />
            ))}
            <div className="mono" style={{ marginTop: 14, color: 'var(--gold)', textAlign: 'right' }}>
              PHOTOGRAPHED · BROOKLYN STUDIO · 2026
            </div>
          </div>
        </div>
      </section>

      {/* Bottom editorial strip */}
      <section style={{ padding: '0 64px 120px', zIndex: 1, position: 'relative' }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          borderTop: '1px solid rgba(74,54,100,0.08)',
          paddingTop: 40,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24,
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 40, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--plum)' }}>The wait is nearly over.</span>
            <span style={{ width: 40, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>
          <div className="mono" style={{ color: 'var(--ink-faint)' }}>BETA PROGRAM · LIMITED COHORT · MMXXVI</div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
