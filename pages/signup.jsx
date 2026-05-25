/* global React, Nav, Footer, SectionHeading, Placeholder, Icon */
// Signup — split hero, glass-warm form card, 3-step rail below.

function SignupPage() {
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
              <div id="error-message" style={{
                display: 'none', padding: '12px 16px', marginBottom: 16,
                background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.25)',
                borderRadius: 'var(--r-md)', color: '#a03030',
                fontFamily: 'var(--font-body)', fontSize: 14,
              }} />
              <div id="success-message" style={{
                display: 'none', padding: '12px 16px', marginBottom: 16,
                background: 'rgba(60,140,80,0.08)', border: '1px solid rgba(60,140,80,0.22)',
                borderRadius: 'var(--r-md)', color: '#2a6e40',
                fontFamily: 'var(--font-body)', fontSize: 14,
              }} />

              <form id="signup-form" noValidate>
                <input type="hidden" id="_csrf" name="_csrf" value="" />

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

                <button type="submit" id="submit-btn" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px 28px' }}>
                  Create Account {Icon.arrow(16)}
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

      {/* ── FUNCTIONAL SCRIPT (preserved from legacy) ── */}
      <script dangerouslySetInnerHTML={{ __html: `
        function getCookie(name) {
          const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '=([^;]*)'));
          return match ? decodeURIComponent(match[1]) : null;
        }
        function refreshCsrfToken() {
          const t = getCookie('csrf_token');
          if (t) { window.__csrfToken = t; const h = document.getElementById('_csrf'); if (h) h.value = t; }
        }
        function fetchWithCsrf(url, opts) {
          opts = opts || {}; opts.headers = opts.headers || {};
          const token = window.__csrfToken || getCookie('csrf_token') || '';
          if (token) opts.headers['X-CSRF-Token'] = token;
          opts.credentials = opts.credentials || 'include';
          return fetch(url, opts);
        }
        refreshCsrfToken();
        const form = document.getElementById('signup-form');
        const errorEl = document.getElementById('error-message');
        const successEl = document.getElementById('success-message');
        const submitBtn = document.getElementById('submit-btn');
        function showError(msg) { errorEl.textContent = msg; errorEl.style.display = 'block'; successEl.style.display = 'none'; }
        function showSuccess(msg) { successEl.textContent = msg; successEl.style.display = 'block'; errorEl.style.display = 'none'; }
        form && form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const pw = document.getElementById('password').value;
          if (pw.length < 8 || !/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) { showError('Password must be at least 8 characters with letters and numbers'); return; }
          submitBtn.disabled = true; submitBtn.textContent = 'Creating Account…';
          const formData = {
            first_name: document.getElementById('first_name').value.trim(),
            last_name: document.getElementById('last_name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: pw,
            terms_accepted: document.getElementById('terms_accepted').checked
          };
          try {
            const res = await fetchWithCsrf('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            const data = await res.json();
            if (res.ok && data.success) {
              refreshCsrfToken();
              if (data.token) localStorage.setItem('authToken', data.token);
              setTimeout(() => { window.location.href = data.redirect || '/membershipsurvey'; }, 100);
            } else { showError(data.error || 'Failed to create account. Please try again.'); submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
          } catch (err) { showError('Network error. Please check your connection and try again.'); submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
        });
      `}} />
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
