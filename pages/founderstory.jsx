/* global React, Placeholder, Nav, Icon, SectionHeading, Footer */
// Founder Story — long-read editorial. Elizabeth Koshy. Bodoni Moda. Drop-cap. Pull-quotes. Gold rules.

const CLINICAL_ADVISORS = [
  { name: 'Dr. Naomi Salas', credential: 'NAMS Fellow · Reproductive Endocrinology', role: 'Clinical Lead' },
  { name: 'Dr. Priya Mehta', credential: 'Endocrine Society · Bone Health', role: 'Metabolic Health Advisor' },
  { name: 'Dr. Ama Owusu', credential: 'ACOG · Ob-Gyn Practice', role: 'Women\'s Health Advisor' },
  { name: 'Dr. Keiko Tanaka', credential: 'Mayo Clinic · Integrative Medicine', role: 'Integrative Advisor' },
];

function FounderStory() {
  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={7} base="" />
      </div>

      {/* ── COVER ── */}
      <section style={{ position: 'relative', padding: '60px 64px 120px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: -120, width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.24) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -80, width: 440, height: 440, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.18) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 16, marginBottom: 60 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>FOUNDER'S STORY · ELIZABETH KOSHY · CEO</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>EMPRESS HEALTH · MMXXVI</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 72, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 20 }}>FOUNDER'S STORY</div>
              <h1 className="display" style={{ margin: 0, fontSize: 'clamp(52px, 5.6vw, 88px)' }}>
                How Empress <em className="italic-emph">began.</em>
              </h1>
              <p className="body-lg" style={{ marginTop: 26, maxWidth: 480 }}>
                A letter from Elizabeth Koshy — on turning lived experience into a mission of care, science, and community.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 36 }}>
                <span style={{ display: 'inline-block', width: 36, height: 1, background: 'var(--gold)' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--plum)' }}>
                  Elizabeth Koshy, Founder & CEO
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Placeholder label="ELIZABETH KOSHY · FOUNDER PORTRAIT · NATURAL LIGHT · WARM INTERIOR" width="100%" height={580} radius={4} tone="tan" />
              <div style={{ position: 'absolute', top: -10, left: -10, width: 22, height: 22, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', top: -10, right: -10, width: 22, height: 22, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, left: -10, width: 22, height: 22, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 22, height: 22, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── LETTER BODY ── */}
      <section style={{ padding: '0 64px 120px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Chapter I */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>Chapter I.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
            <strong style={{ color: 'var(--ink)' }}>Dear Empress Community,</strong>
          </p>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
              fontSize: 64, color: 'var(--plum)', lineHeight: 0.85, float: 'left', marginRight: 12, marginTop: 4 }}>I</span>
            know what it feels like to walk through perimenopause and menopause feeling unseen, unheard, and unsupported. For years I battled the invisible toll of hormonal imbalance: crippling migraines, extreme fatigue, and the constant weight of endocrine disruptions. Despite having a team of doctors, not one addressed the root of my suffering. Not one offered the compassion, understanding, or answers I desperately needed.
          </p>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
            I was describing my symptoms in three different ways to three different people. To my husband: fatigue. To my mother: stress. To my doctor: fine — because fine is the answer that keeps the appointment short.
          </p>

          {/* Pull quote */}
          <blockquote style={{ margin: '40px 0', padding: '0 0 0 24px',
            borderLeft: '1px solid var(--gold)',
            fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, lineHeight: 1.3, color: 'var(--plum)' }}>
            "That loneliness, that silence, lit a fire."
          </blockquote>

          {/* Chapter II */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, margin: '48px 0 40px' }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>Chapter II.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
            I transformed that pain into purpose. Drawing on my entrepreneurial background and lived experience, I set out to build what I had needed: a trusted ecosystem where women navigating perimenopause and menopause could finally find guidance, support, and care — with every recommendation grounded in peer-reviewed evidence and every claim sourced visibly.
          </p>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
            That last detail mattered most to me. I had been given a great deal of advice online — some of it helpful, much of it invented. I wanted to build a platform where you could see exactly where every clinical recommendation came from. Not buried in a footnote. On every card, every report, every letter.
          </p>

          {/* Pull quote 2 */}
          <blockquote style={{ margin: '40px 0', padding: '0 0 0 24px',
            borderLeft: '1px solid var(--gold)',
            fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, lineHeight: 1.3, color: 'var(--plum)' }}>
            "Every clinical claim cites a Pinecone chunk — visibly, in the UI, on every card."
          </blockquote>

          <div className="mono" style={{ color: 'var(--gold)', marginBottom: 28 }}>
            SOURCES · EMPRESS HEALTH GROUNDING PIPELINE · NAMS 2022 POSITION STATEMENT
          </div>

          {/* Chapter III */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, margin: '48px 0 40px' }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>Chapter III.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
            What began with one woman's story is now a movement. Empress Health is more than a platform — it is a purpose-driven mission. Together, we are replacing silence with understanding, stigma with science, and isolation with community.
          </p>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
            Our story is deeply personal, but it belongs to every woman who has ever been told to "just endure." We exist so that no woman will walk this stage of life unseen, unsupported, or unheard again.
          </p>

          {/* Signature */}
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(74,54,100,0.10)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink)', margin: '0 0 10px' }}>
              With love, passion, and purpose,
            </p>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, color: 'var(--plum)', marginBottom: 6 }}>
              Elizabeth Koshy
            </div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>FOUNDER & CEO · EMPRESS HEALTH</div>
          </div>
        </div>
      </section>

      {/* ── CLINICAL ADVISORS ── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <SectionHeading
            align="left"
            eyebrow="FOUNDING CLINICAL ADVISORS"
            title="The clinicians who"
            italicTail="guide the science."
            sub="Our clinical advisory panel sets the evidence standards for every recommendation on the platform. All are NAMS-affiliated or board-certified in relevant specialties."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 56 }}>
            {CLINICAL_ADVISORS.map(a => (
              <div key={a.name} style={{ padding: '28px 24px', borderRadius: 14, background: 'var(--surface-bright)', border: '1px solid rgba(74,54,100,0.08)' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', marginBottom: 16 }}>
                  <Placeholder label="" width="100%" height="100%" radius={0} tone="lavender" />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, lineHeight: 1.2 }}>{a.name}</div>
                <div className="mono" style={{ marginTop: 6, color: 'var(--gold)', fontSize: 9 }}>{a.role.toUpperCase()}</div>
                <p className="body-md" style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-soft)' }}>{a.credential}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT'S NEXT CTA ── */}
      <section style={{ padding: '120px 64px' }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto', position: 'relative', overflow: 'hidden', borderRadius: 32,
          background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)',
          padding: '80px',
          border: '1px solid rgba(255,255,255,0.5)',
        }}>
          <div style={{ position: 'absolute', top: -100, right: -60, width: 440, height: 440, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>WHAT'S NEXT · MMXXVI</div>
              <h2 className="display" style={{ margin: 0, fontSize: 'clamp(36px, 4vw, 58px)', color: 'var(--plum)' }}>
                Take the first <em className="italic-emph">step.</em>
              </h2>
              <p className="body-lg" style={{ marginTop: 22, maxWidth: 440, color: 'var(--ink-soft)' }}>
                Your Health Intelligence Report takes 20 minutes. It produces a 14-page cited document you can bring to any clinician. It is the most useful thing you can do this week.
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 32 }}>
                <button className="btn btn-primary">Start the assessment {Icon.arrow(14)}</button>
                <button className="btn" style={{ background: 'rgba(255,252,248,0.65)', color: 'var(--plum)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.7)' }}>
                  Read a sample report
                </button>
              </div>
            </div>

            <div className="glass" style={{ padding: 28, borderRadius: 20, backgroundColor: 'rgba(255,252,248,0.65)' }}>
              <div className="mono" style={{ color: 'var(--gold)' }}>WHAT YOU RECEIVE</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'A 14-page Health Intelligence Report',
                  'Every recommendation source-cited',
                  'Symptom mapping across 6 domains',
                  'Clinician-ready one-page summary',
                  'Daily affirmation subscription',
                ].map((b) => (
                  <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--ink)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="var(--gold)" strokeWidth="0.6"/>
                      <path d="M4 7l2 2 4-4" stroke="var(--plum)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mono" style={{ marginTop: 22, paddingTop: 14, borderTop: '1px dashed rgba(74,54,100,0.18)', color: 'var(--plum)' }}>
                $139 ONE-TIME · $12 MONTHLY PLAN AVAILABLE
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
