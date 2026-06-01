/* global React, Placeholder, Nav, Icon, SectionHeading, Footer */
// Menopause Month — print-magazine-feature campaign page. No balloons. Restrained.

const EDUCATION_RESOURCES = [
  { title: 'Understanding Perimenopause', category: 'CLINICAL GUIDE', pages: '18 pp', citation: 'NAMS 2023 · CHUNK-002' },
  { title: 'Vasomotor Symptoms: Evidence Review', category: 'RESEARCH BRIEF', pages: '12 pp', citation: 'MENOPAUSE J. 2024 · CHUNK-014' },
  { title: 'Sleep & Hormone Decline', category: 'CLINICAL GUIDE', pages: '14 pp', citation: 'ACOG BULLETIN · CHUNK-031' },
  { title: 'Bone Health After Estrogen Loss', category: 'PATIENT BRIEF', pages: '8 pp', citation: 'ENDOCRINE SOC. 2024 · CHUNK-044' },
  { title: 'Cardiovascular Risk in Midlife Women', category: 'RESEARCH BRIEF', pages: '20 pp', citation: 'SWAN COHORT 2024 · CHUNK-067' },
  { title: 'Cognitive Changes: What the Evidence Says', category: 'CLINICAL GUIDE', pages: '16 pp', citation: 'MAYO CLINIC PROC. 2023 · CHUNK-088' },
];

const PANEL_EVENTS = [
  { date: '01 OCT', title: 'Perimenopause: The Clinical Picture', format: 'WEBINAR · LIVE', speaker: 'Dr. Naomi Salas, NAMS' },
  { date: '08 OCT', title: 'HRT Decisions in 2026', format: 'PANEL · LIVE', speaker: 'Three NAMS-certified practitioners' },
  { date: '15 OCT', title: 'Sleep Architecture & Hormones', format: 'WEBINAR · ON DEMAND', speaker: 'Dr. Ama Owusu, ACOG' },
  { date: '22 OCT', title: 'Community Gathering: Open Circle', format: 'IN PERSON · NYC', speaker: 'Empress Health + pods' },
  { date: '29 OCT', title: 'Free Assessment Day', format: 'ONLINE · ALL DAY', speaker: 'Empress Health platform' },
];

const PARTNERS = [
  { name: 'NAMS', full: 'North American Menopause Society', role: 'Clinical evidence base' },
  { name: 'ACOG', full: 'American College of Obstetricians & Gynecologists', role: 'Practice guidelines' },
  { name: 'MAYO', full: 'Mayo Clinic Proceedings', role: 'Research partnership' },
  { name: 'ENDOCRINE', full: 'The Endocrine Society', role: 'Hormonal health standards' },
];

function MenopauseMonth() {
  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={3} base="" />
      </div>

      {/* ── EDITORIAL COVER ── */}
      <section style={{ position: 'relative', padding: '60px 64px 120px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -100, width: 580, height: 580, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,165,96,0.10) 0%, rgba(201,165,96,0) 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          {/* Masthead strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60, paddingBottom: 20,
            borderBottom: '1px solid rgba(74,54,100,0.18)' }}>
            <div className="mono" style={{ color: 'var(--plum)' }}>EMPRESS HEALTH</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ display: 'inline-block', width: 36, height: 1, background: 'var(--gold)' }} />
              <span className="mono" style={{ color: 'var(--gold)' }}>VOL · MMXXVI · OCTOBER</span>
              <span style={{ display: 'inline-block', width: 36, height: 1, background: 'var(--gold)' }} />
            </div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>MENOPAUSE AWARENESS</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 72, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--gold)' }} />
                <span className="mono" style={{ color: 'var(--plum)' }}>CAMPAIGN · OCTOBER · EVERY YEAR</span>
              </div>
              <h1 className="display" style={{ margin: 0, fontSize: 'clamp(52px, 5.6vw, 88px)' }}>
                Menopause Awareness, <em className="italic-emph">every day.</em>
              </h1>
              <p className="body-lg" style={{ marginTop: 28, maxWidth: 520 }}>
                October is Menopause Awareness Month. At Empress, we treat awareness as a year-round standard — not a ribbon. This page is our contribution: education, community, and access to clinicians who take this seriously.
              </p>
              <p className="body-md" style={{ marginTop: 16, color: 'var(--ink-soft)', maxWidth: 480 }}>
                Over 60 million U.S. women navigate perimenopause and menopause. Most receive inadequate clinical support. Every claim on this page cites a source.
              </p>
              <div className="mono" style={{ marginTop: 20, color: 'var(--gold)' }}>
                SOURCES · SWAN COHORT 2024 · CHUNK-002 · NAMS POSITION STATEMENT 2022
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <Placeholder label="EDITORIAL PORTRAIT · WOMAN 50S · NATURAL LIGHT · NEUTRAL BACKGROUND" width="100%" height={560} radius={4} tone="cream" />
              <div style={{ position: 'absolute', top: -10, left: -10, width: 22, height: 22, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 22, height: 22, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── PART I: EDUCATION RESOURCES ── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 56 }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>Part I.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'start' }}>
            <div>
              <SectionHeading
                align="left"
                eyebrow="EDUCATION RESOURCES"
                title="Evidence, not"
                italicTail="opinion."
                sub="Six clinical guides and research briefs, all sourced from NAMS, ACOG, Mayo, and the Endocrine Society. Free for all members."
              />
              <button className="btn btn-primary" style={{ marginTop: 36 }}>Download all six {Icon.arrow(14)}</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {EDUCATION_RESOURCES.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, padding: '18px 0', borderTop: '1px solid rgba(74,54,100,0.10)', alignItems: 'baseline' }}>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>{r.category}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18 }}>{r.title}</div>
                    <div className="mono" style={{ marginTop: 6, color: 'var(--gold)', fontSize: 9 }}>SOURCES · {r.citation}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ color: 'var(--ink-faint)' }}>{r.pages}</div>
                    <a href="#" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--plum)', textDecoration: 'none',
                      borderBottom: '1px solid var(--gold)', paddingBottom: 2, marginTop: 6, display: 'inline-block' }}>
                      Download →
                    </a>
                  </div>
                </div>
              ))}
              <span style={{ display: 'block', height: 1, background: 'rgba(74,54,100,0.10)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── PART II: COMMUNITY PARTICIPATION ── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 60, left: -80, width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.20) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 56 }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>Part II.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>

          <SectionHeading
            align="left"
            eyebrow="COMMUNITY PARTICIPATION"
            title="Five events in"
            italicTail="October."
            sub="Clinical panels, open webinars, a community gathering, and a free assessment day. No wellness theater — just evidence and conversation."
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 48 }}>
            {PANEL_EVENTS.map((ev, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 32, padding: '24px 0', borderTop: '1px solid rgba(74,54,100,0.10)', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)', lineHeight: 1 }}>{ev.date}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, marginBottom: 4 }}>{ev.title}</div>
                  <div className="mono" style={{ color: 'var(--ink-faint)', marginBottom: 2 }}>{ev.speaker}</div>
                  <span className="mono" style={{ color: 'var(--gold)' }}>{ev.format}</span>
                </div>
                <button className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 12 }}>RSVP</button>
              </div>
            ))}
            <span style={{ display: 'block', height: 1, background: 'rgba(74,54,100,0.10)' }} />
          </div>

          <div style={{ marginTop: 36 }}>
            <div className="glass-warm" style={{ padding: '28px 36px', borderRadius: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="mono" style={{ color: 'var(--gold)', marginBottom: 8 }}>FREE ASSESSMENT DAY · 29 OCT · ALL DAY</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 24 }}>Get your Health Intelligence Report — free.</div>
                <p className="body-md" style={{ marginTop: 8, margin: '8px 0 0', color: 'var(--ink-soft)' }}>
                  October 29th only. Our full HI assessment, no charge. 60 clinical questions, grounded report, cited recommendations.
                </p>
              </div>
              <button className="btn btn-primary" style={{ flexShrink: 0, marginLeft: 32 }}>Claim your spot {Icon.arrow(14)}</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PART III: CLINICIAN PARTNERSHIP ── */}
      <section style={{ padding: '120px 64px', background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 56 }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>Part III.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <SectionHeading
                align="left"
                eyebrow="CLINICIAN PARTNERS"
                title="Find a NAMS practitioner"
                italicTail="near you."
                sub="Our participating clinicians are NAMS-certified, accept the Empress Health report in their intake, and have committed to a 30-minute first appointment minimum."
              />
              <div style={{ marginTop: 32, display: 'flex', gap: 14 }}>
                <button className="btn btn-primary">Find a clinician {Icon.arrow(14)}</button>
                <button className="btn" style={{ background: 'rgba(255,252,248,0.65)', color: 'var(--plum)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.7)' }}>
                  Join as a clinician
                </button>
              </div>
            </div>

            <div className="glass" style={{ padding: 36, borderRadius: 24, backgroundColor: 'rgba(255,252,248,0.65)' }}>
              <div className="mono" style={{ color: 'var(--gold)', marginBottom: 20 }}>OUR CLINICAL PARTNERS</div>
              {PARTNERS.map(p => (
                <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 20, padding: '16px 0', borderTop: '1px solid rgba(74,54,100,0.10)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--plum)', letterSpacing: '0.04em' }}>{p.name}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{p.full}</div>
                    <div className="mono" style={{ marginTop: 4, color: 'var(--ink-faint)' }}>{p.role.toUpperCase()}</div>
                  </div>
                </div>
              ))}
              <span style={{ display: 'block', height: 1, background: 'rgba(74,54,100,0.10)' }} />
              <div className="mono" style={{ marginTop: 18, color: 'var(--plum)' }}>EVERY CLAIM CITED · SOURCES VISIBLE</div>
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
