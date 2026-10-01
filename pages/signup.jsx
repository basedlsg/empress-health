/* global React, Nav, Footer, SectionHeading, Placeholder, Icon */
// Signup — split hero, glass-warm form card, 3-step rail below.

function SignupPage() {
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const fields = event.currentTarget.elements;
    const payload = {
      first_name: fields.first_name.value.trim(),
      last_name: fields.last_name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim() || null,
      password: fields.password.value,
      terms_accepted: fields.terms_accepted.checked,
    };
    setError('');
    setSuccess('');
    if (!payload.first_name || !payload.last_name || !payload.email) {
      setError('Please enter your name and email address.');
      return;
    }
    if (payload.password.length < 8 || !/[a-zA-Z]/.test(payload.password) || !/[0-9]/.test(payload.password)) {
      setError('Password must be at least 8 characters with letters and numbers.');
      return;
    }
    if (!payload.terms_accepted) {
      setError('Please agree to the terms of use and privacy policy.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not create your account. Please try again.');
      setSuccess('Account created. Redirecting…');
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.assign('/account' + (next ? '?next=' + encodeURIComponent(next) : ''));
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>

      {/* ── NAV ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={0} base="" />
      </div>

      {/* ── HERO: split layout ── */}
      <section style={{ position: 'relative', padding: '60px 64px 120px', overflow: 'hidden' }}>
        {/* Luxury orbs */}
        <div style={{
          position: 'absolute', top: -160, left: -200, width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.28) 0%, rgba(214,188,243,0) 65%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 120, right: -120, width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.20) 0%, rgba(247,222,196,0) 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: '40%', width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,165,96,0.10) 0%, rgba(201,165,96,0) 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>

          {/* Left: headline + form */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>EMPRESS HEALTH · JOIN FREE</div>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(44px, 5vw, 76px)', lineHeight: 1.0 }}>
              Start your<br/><em className="italic-emph">first chapter.</em>
            </h1>
            <p className="body-lg" style={{ marginTop: 24, maxWidth: 420 }}>
              Clinical-grade menopause intelligence, grounded in 120+ biomarkers. Your stage, your radar, your plan.
            </p>

            {/* Form in glass-warm card */}
            <div className="glass-warm" style={{ marginTop: 40, padding: 40, borderRadius: 'var(--r-xl)' }}>
              {/* Error / success messages — preserved from legacy */}
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

              <form id="signup-form" method="post" onSubmit={handleSubmit} noValidate>

                {/* Name row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <label htmlFor="first_name" style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: 8 }}>First Name</label>
                    <input type="text" id="first_name" name="first_name" required autoComplete="given-name" style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="last_name" style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--plum)', marginBottom: 8 }}>Last Name</label>
                    <input type="text" id="last_name" name="last_name" required autoComplete="family-name" style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="email" style={labelStyle}>Email</label>
                  <input type="email" id="email" name="email" required autoComplete="email" style={inputStyle} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="phone" style={labelStyle}>Phone <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
                  <input type="tel" id="phone" name="phone" autoComplete="tel" style={inputStyle} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="password" style={labelStyle}>Password</label>
                  <div className="mono" style={{ color: 'var(--ink-faint)', marginBottom: 8, fontSize: 10 }}>AT LEAST 8 CHARACTERS · LETTERS + NUMBERS</div>
                  <input type="password" id="password" name="password" required autoComplete="new-password" minLength="8" style={inputStyle} />
                </div>

                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
                  padding: '14px 16px', borderRadius: 'var(--r-md)',
                  border: '1px solid rgba(74,54,100,0.15)',
                  background: 'rgba(255,255,255,0.5)', marginBottom: 28,
                }}>
                  <input type="checkbox" id="terms_accepted" name="terms_accepted" required style={{ marginTop: 2, width: 18, height: 18, accentColor: 'var(--plum)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    I agree to the <a href="/privacypolicy" target="_blank" style={{ color: 'var(--plum)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>terms of use and privacy policy</a>
                  </span>
                </label>

                <button type="submit" id="submit-btn" disabled={busy} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px 28px' }}>
                  {busy ? 'Creating account…' : <>Create Account {Icon.arrow(16)}</>}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-soft)' }}>
                Already have an account? <a href="/login" style={{ color: 'var(--plum)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Log in</a>
              </div>
            </div>
          </div>

          {/* Right: portrait + gold-bracketed quote */}
          <div style={{ paddingTop: 60 }}>
            <div style={{ position: 'relative' }}>
              {/* Gold corner ticks */}
              <div style={{ position: 'absolute', top: -8, left: -8, width: 18, height: 18, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)', zIndex: 1 }} />
              <div style={{ position: 'absolute', top: -8, right: -8, width: 18, height: 18, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)', zIndex: 1 }} />
              <div style={{ position: 'absolute', bottom: -8, left: -8, width: 18, height: 18, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)', zIndex: 1 }} />
              <div style={{ position: 'absolute', bottom: -8, right: -8, width: 18, height: 18, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)', zIndex: 1 }} />
              <Placeholder label={"EDITORIAL PORTRAIT\nWOMAN 50S · NATURAL LIGHT\nKINFOLK REGISTER"} width="100%" height={480} radius={6} tone="cream" />
            </div>

            {/* Gold-bracketed member quote */}
            <div className="glass-warm" style={{ marginTop: -56, marginLeft: 32, marginRight: 0, padding: '28px 32px', borderRadius: 'var(--r-lg)', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--gold)' }} />
                <span className="mono" style={{ color: 'var(--gold)' }}>MEMBER · STAGE II · 8 MONTHS</span>
                <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--gold)' }} />
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.4, color: 'var(--ink)', margin: 0 }}>
                "I finally have language for what I was experiencing. The report changed everything."
              </p>
              <div className="mono" style={{ marginTop: 14, color: 'var(--ink-faint)' }}>— DIANA R. · HOUSTON</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-STEP RAIL ── */}
      <section style={{ padding: '80px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>HOW IT WORKS</div>
            <h2 className="headline" style={{ margin: 0 }}>Three steps to <em className="italic-emph">understanding yourself.</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, position: 'relative' }}>
            {[
              { n: '01', title: 'Take the assessment', body: 'Answer 120 questions across 10 domains — sleep, mood, vasomotor load, cognition, and more. Takes about 25 minutes.' },
              { n: '02', title: 'Receive your report', body: 'A 34-page Health Intelligence Report arrives, grounded in peer-reviewed research with every claim cited to a Pinecone source.' },
              { n: '03', title: 'Meet your clinician', body: 'Three matched NAMS-certified practitioners, chosen for your stage. Book a 60-minute intake and start the twelve-week arc.' },
            ].map((step, i) => (
              <div key={step.n} style={{ padding: '40px 36px', borderLeft: i > 0 ? '1px solid rgba(74,54,100,0.10)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 56, color: 'var(--gold)', lineHeight: 1, marginBottom: 20, opacity: 0.7 }}>{step.n}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: 'var(--plum)', marginBottom: 12 }}>{step.title}</div>
                <p className="body-md" style={{ margin: 0 }}>{step.body}</p>
              </div>
            ))}
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
  transition: 'border-color .2s ease',
};
const labelStyle = {
  display: 'block', fontFamily: 'var(--font-body)', fontSize: 12,
  fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
  color: 'var(--plum)', marginBottom: 8,
};
