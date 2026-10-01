/* global React, Nav, Footer, Placeholder, Icon */
// Login — quieter than signup, single glass-warm card, editorial welcome line.

function LoginPage() {
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    setError('');
    setSuccess('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Sign in failed. Please try again.');
      setSuccess('Logged in. Redirecting…');
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.assign('/account' + (next ? '?next=' + encodeURIComponent(next) : ''));
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={0} base="" />
      </div>

      {/* Luxury orbs — very soft on this quiet page */}
      <div style={{
        position: 'absolute', top: -80, right: -160, width: 580, height: 580, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(214,188,243,0.22) 0%, rgba(214,188,243,0) 65%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 80, left: -120, width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,222,196,0.16) 0%, rgba(247,222,196,0) 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      {/* ── MAIN CONTENT ── */}
      <section style={{ padding: '80px 64px 160px', position: 'relative' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

          {/* Left: editorial portrait */}
          <div style={{ position: 'relative' }}>
            {/* Masthead rail */}
            <div style={{ marginBottom: 40 }}>
              <div className="mono" style={{ color: 'var(--gold)', marginBottom: 8 }}>EMPRESS HEALTH · MEMBER PORTAL</div>
              <h1 className="display" style={{ margin: 0, fontSize: 'clamp(44px, 5vw, 76px)', lineHeight: 1.0 }}>
                Welcome back,<br/><em className="italic-emph">good to see you.</em>
              </h1>
              <p className="body-lg" style={{ marginTop: 22, maxWidth: 440 }}>
                Your report, your protocol, your care team — all here.
              </p>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: -8, left: -8, width: 16, height: 16, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)', zIndex: 1 }} />
              <div style={{ position: 'absolute', bottom: -8, right: -8, width: 16, height: 16, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)', zIndex: 1 }} />
              <Placeholder label={"INTERIOR PORTRAIT\nWOMAN 50S · WINDOW LIGHT\nQUIET REGISTER"} width="100%" height={380} radius={6} tone="lavender" />
            </div>
            <div className="mono" style={{ marginTop: 14, color: 'var(--gold)' }}>EDITORIAL · EMPRESS HEALTH · MMXXVI</div>
          </div>

          {/* Right: login form card */}
          <div>
            <div className="glass-warm" style={{ padding: 44, borderRadius: 'var(--r-xl)' }}>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 24 }}>SIGN IN TO YOUR ACCOUNT</div>

              {/* Error / success banners — preserved from legacy */}
              <div id="error-message" role="alert" aria-live="polite" style={{
                display: error ? 'block' : 'none', padding: '12px 16px', marginBottom: 16,
                background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.25)',
                borderRadius: 'var(--r-md)', color: '#a03030',
                fontFamily: 'var(--font-body)', fontSize: 14,
              }}>{error}</div>
              <div id="success-message" role="status" aria-live="polite" style={{
                display: success ? 'block' : 'none', padding: '12px 16px', marginBottom: 16,
                background: 'rgba(60,140,80,0.08)', border: '1px solid rgba(60,140,80,0.22)',
                borderRadius: 'var(--r-md)', color: '#2a6e40',
                fontFamily: 'var(--font-body)', fontSize: 14,
              }}>{success}</div>

              <form id="login-form" method="post" onSubmit={handleSubmit} noValidate>

                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="email" style={labelStyle}>Email</label>
                  <input type="email" id="email" name="email" required autoComplete="email" inputMode="email" placeholder="you@example.com" style={inputStyle} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label htmlFor="password" style={labelStyle}>Password</label>
                  <input type="password" id="password" name="password" required autoComplete="current-password" placeholder="Your password" style={inputStyle} />
                </div>

                <div style={{ textAlign: 'right', marginBottom: 28 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--plum-soft)' }}>Password reset is being set up.</span>
                </div>

                <button type="submit" id="submit-btn" disabled={busy} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px 28px' }}>
                  {busy ? 'Signing in…' : <>Log In {Icon.arrow(16)}</>}
                </button>
              </form>

              <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(74,54,100,0.10)', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)' }}>
                Don't have an account?{' '}
                <a href="/signup" style={{ color: 'var(--plum)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Start your assessment →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />


    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '13px 16px',
  border: '1px solid rgba(74,54,100,0.18)', borderRadius: 'var(--r-md)',
  fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink)',
  background: 'rgba(255,255,255,0.7)', outline: 'none',
};
const labelStyle = {
  display: 'block', fontFamily: 'var(--font-body)', fontSize: 12,
  fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
  color: 'var(--plum)', marginBottom: 8,
};
