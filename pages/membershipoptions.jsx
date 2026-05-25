/* global React, Nav, Footer, SectionHeading, Icon */
// Membership Options — magazine intro, two pricing cards ($139 / $12mo), trust strip, FAQ links.

function MembershipOptionsPage() {
  const tiers = [
    {
      name: 'The Report',
      price: '$139',
      cadence: 'one-time',
      lead: 'Your stage, your radar, your matched clinician — on paper.',
      included: [
        '120-question intake assessment',
        '34-page Health Intelligence Report',
        '10-domain symptom radar',
        'Three matched NAMS clinicians',
        'Lifetime access to your report',
      ],
      cta: 'Start with the report',
      style: 'flat',
    },
    {
      name: 'The Program',
      price: '$12',
      cadence: 'per month · 12 weeks then optional',
      lead: 'The full editorial arc, with a clinician on the line every week.',
      included: [
        'Everything in The Report',
        '12 weekly 15-min clinician check-ins',
        'Care team on Ask Empress 24/7',
        'Permanent community pod placement',
        'Quarterly review for life',
      ],
      cta: 'Start the program',
      style: 'feature',
    },
  ];

  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>

      {/* ── NAV ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={1} base="" />
      </div>

      {/* ── MAGAZINE INTRO ── */}
      <section style={{ position: 'relative', padding: '100px 64px 80px', overflow: 'hidden' }}>
        {/* Luxury orbs */}
        <div style={{
          position: 'absolute', top: -120, right: -160, width: 640, height: 640, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.28) 0%, rgba(214,188,243,0) 65%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -100, width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.20) 0%, rgba(247,222,196,0) 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>Membership.</span>
            <span style={{ display: 'inline-block', width: 40, height: 1, background: 'var(--gold)' }} />
          </div>
          <h1 className="display" style={{ margin: 0, fontSize: 'clamp(48px, 5.4vw, 88px)', lineHeight: 1.0 }}>
            Two ways <em className="italic-emph">to begin.</em>
          </h1>
          <p className="body-lg" style={{ marginTop: 28, maxWidth: 580, margin: '28px auto 0' }}>
            Whichever you choose, you get the report, the protocol, and lifetime access. The difference is who walks the twelve weeks with you.
          </p>
          <div className="mono" style={{ marginTop: 24, color: 'var(--gold)' }}>FSA/HSA ELIGIBLE · NO INSURANCE REQUIRED · CANCEL ANY TIME</div>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section style={{ padding: '20px 64px 160px', background: 'var(--surface-cream)', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -80, right: '5%', width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.18) 0%, rgba(214,188,243,0) 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            {tiers.map((tier) => (
              <div key={tier.name} className={tier.style === 'feature' ? 'glass' : ''} style={{
                padding: 44, borderRadius: 24,
                background: tier.style === 'feature' ? 'rgba(255,252,248,0.7)' : 'var(--surface-bright)',
                border: tier.style === 'feature' ? undefined : '1px solid rgba(74,54,100,0.10)',
                position: 'relative', overflow: 'hidden',
              }}>
                {tier.style === 'feature' && (
                  <span style={{
                    position: 'absolute', top: 24, right: 24,
                    padding: '6px 12px', borderRadius: 999,
                    background: 'var(--plum)', color: '#fff',
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.10em', fontWeight: 500,
                  }}>MOST CHOSEN</span>
                )}
                <div className="mono" style={{ color: 'var(--plum)' }}>{tier.name.toUpperCase()}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 18 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 72, color: 'var(--plum)', lineHeight: 1 }}>{tier.price}</span>
                  <span className="mono" style={{ color: 'var(--ink-faint)' }}>{tier.cadence}</span>
                </div>
                <span className="gold-rule" style={{ marginTop: 22 }} />
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 21, color: 'var(--plum-mid)', margin: '14px 0 0', lineHeight: 1.4 }}>{tier.lead}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '32px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tier.included.map((line) => (
                    <li key={line} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="var(--gold)" strokeWidth="0.6"/>
                        <path d="M4 7l2 2 4-4" stroke="var(--plum)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                      <span style={{ fontSize: 14, color: 'var(--ink)' }}>{line}</span>
                    </li>
                  ))}
                </ul>
                <a href="/signup" className={`btn ${tier.style === 'feature' ? 'btn-primary' : 'btn-ghost'}`}>
                  {tier.cta} {Icon.arrow(14)}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section style={{ padding: '56px 64px', borderTop: '1px solid rgba(74,54,100,0.08)', borderBottom: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, alignItems: 'center' }}>
          {[
            ['NAMS Certified', 'Every clinician board-certified'],
            ['Citations Visible', 'Every claim sourced inline'],
            ['FSA / HSA', 'Eligible for health accounts'],
            ['Cancel Any Time', 'No lock-in, no minimums'],
          ].map(([title, sub]) => (
            <div key={title} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, color: 'var(--plum)', marginBottom: 6 }}>{title}</div>
              <div className="mono" style={{ color: 'var(--ink-faint)' }}>{sub.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ LINK CARDS ── */}
      <section style={{ padding: '120px 64px 160px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionHeading align="center" eyebrow="HAVE QUESTIONS" title="Common things" italicTail="people ask." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['What happens after I take the assessment?', '/faq'],
              ['Is this covered by insurance?', '/faq'],
              ['How are clinicians matched to me?', '/faq'],
              ['What\'s the difference between The Report and The Program?', '/faq'],
              ['Can I upgrade from The Report to The Program later?', '/faq'],
            ].map(([q, href]) => (
              <a key={q} href={href} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '18px 24px', borderRadius: 'var(--r-md)',
                background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,54,100,0.10)',
                textDecoration: 'none', transition: 'background .2s ease',
              }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink)' }}>{q}</span>
                <span style={{ color: 'var(--gold)', flexShrink: 0, marginLeft: 16 }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
