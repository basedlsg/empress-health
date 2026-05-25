/* global React, Placeholder, Nav, Icon, SectionHeading, Footer */
// Our Story — brand editorial long-read. The problem, the founding insight, the team, the partners.

const PARTNERS = [
  { abbr: 'NAMS',     full: 'North American Menopause Society',                   role: 'Evidence base for all clinical claims' },
  { abbr: 'ACOG',     full: 'American College of Obstetricians & Gynecologists',  role: 'Practice guideline alignment' },
  { abbr: 'MAYO',     full: 'Mayo Clinic Proceedings',                             role: 'Research and methodology review' },
  { abbr: 'ENDOCRINE',full: 'The Endocrine Society',                               role: 'Hormonal health standards' },
];

const VALUES = [
  { title: 'Every claim cites.',       body: 'No recommendation on the Empress platform is unsourced. The citation appears in the UI, on every card, in every report. Visibly.' },
  { title: 'No embellishment.',        body: 'We do not round up. We do not publish claims that exceed what the evidence supports. Uncertainty is stated as uncertainty.' },
  { title: 'The woman is the expert.', body: 'Our platform does not override the patient. It provides the evidence so she can have a better conversation with her clinician.' },
  { title: 'Community is clinical.',   body: 'Peer connection is not optional. The SWAN cohort data is clear: social support modifies outcomes. Pods are the intervention.' },
];

const TEAM = [
  { name: 'Elizabeth Koshy',  role: 'Founder & CEO',           note: 'Built from lived experience' },
  { name: 'Clinical Advisory','role': 'Four specialist advisors', note: 'NAMS, ACOG, Mayo, Endocrine' },
  { name: 'Engineering',      role: 'Full-stack team',          note: 'Node.js · React · Pinecone' },
  { name: 'Editorial',        role: 'Editor & content team',    note: 'Pays $250 per member piece' },
];

function OurStory() {
  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={7} base="" />
      </div>

      {/* ── COVER ── */}
      <section style={{ position: 'relative', padding: '60px 64px 120px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -140, width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.26) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -80, width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.16) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 16, marginBottom: 60 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>OUR STORY · EMPRESS HEALTH · MMXXVI</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>GROUNDED CARE · CITED · COMMUNITY-LED</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 20 }}>THE EMPRESS STORY</div>
              <h1 className="display" style={{ margin: 0, fontSize: 'clamp(52px, 5.6vw, 88px)' }}>
                The Empress <em className="italic-emph">story.</em>
              </h1>
              <p className="body-lg" style={{ marginTop: 26, maxWidth: 480 }}>
                How a woman's unheard experience became a platform where every clinical claim carries its source.
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <Placeholder label="BRAND STORY COVER · WOMAN AT DESK · MORNING LIGHT · NATURAL" width="100%" height={520} radius={4} tone="tan" />
              <div style={{ position: 'absolute', top: -10, left: -10, width: 22, height: 22, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 22, height: 22, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── NARRATIVE ── The problem */}
      <section style={{ padding: '0 64px 80px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>The problem.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
              fontSize: 64, color: 'var(--plum)', lineHeight: 0.85, float: 'left', marginRight: 12, marginTop: 4 }}>E</span>
            mpress Health was born from a specific failure: women navigating perimenopause and menopause being dismissed by the doctors they trusted. Not from malice, but from a healthcare system that treats this transition as an afterthought — despite the fact that over 60 million U.S. women live in this stage at any given time.
          </p>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
            The symptoms are real: vasomotor events, sleep disruption, cognitive changes, skeletal changes, cardiovascular risk shifts. The evidence base is deep. The problem is not the science — it is the gap between what the science says and what women are told in a 12-minute GP appointment.
          </p>

          <div className="mono" style={{ color: 'var(--gold)', marginBottom: 28 }}>
            SOURCES · SWAN COHORT 2024 · NAMS POSITION STATEMENT 2022 · CHUNK-002
          </div>

          <blockquote style={{ margin: '40px 0', padding: '0 0 0 24px',
            borderLeft: '1px solid var(--gold)',
            fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, lineHeight: 1.3, color: 'var(--plum)' }}>
            "We exist so that no woman will walk this stage of life unseen, unsupported, or unheard again."
          </blockquote>
        </div>
      </section>

      {/* ── NARRATIVE ── The founding insight */}
      <section style={{ padding: '80px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>The founding insight.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
            The problem was not a lack of information. It was a lack of <em>cited</em> information in a form a woman could hold and use. Every clinical claim on the Empress platform connects to a specific chunk from the peer-reviewed literature — retrieved via Pinecone from NAMS guidelines, ACOG bulletins, Mayo Clinic Proceedings, and Endocrine Society standards.
          </p>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.78, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
            The citation is not a footnote. It appears on every card, in every report, in every affirmation. This is the brand. Not polish. The one thing that makes Empress different from the thirty other platforms using the word "holistic."
          </p>

          <div className="mono" style={{ color: 'var(--gold)', marginBottom: 0 }}>
            SOURCES · EMPRESS GROUNDING PIPELINE · PINECONE VECTOR DB · NAMS § 4.1 · CHUNK-014
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'start' }}>
            <div>
              <SectionHeading
                align="left"
                eyebrow="CLINICAL PARTNERS"
                title="The shoulders we"
                italicTail="stand on."
                sub="Every source on the Empress platform comes from one of four institutions. We do not cite less authoritative sources in clinical context."
              />
            </div>
            <div>
              {PARTNERS.map((p, i) => (
                <div key={p.abbr} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 24, padding: '22px 0', borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid rgba(74,54,100,0.10)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--plum)', letterSpacing: '0.04em' }}>{p.abbr}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{p.full}</div>
                    <div className="mono" style={{ color: 'var(--ink-faint)' }}>{p.role.toUpperCase()}</div>
                  </div>
                </div>
              ))}
              <span style={{ display: 'block', height: 1, background: 'var(--ink)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 64px' }}>
            <SectionHeading
              align="center"
              eyebrow="OUR VALUES"
              title="Four principles. No"
              italicTail="exceptions."
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {VALUES.map((v, i) => (
              <div key={i} style={{ padding: '28px 0', borderTop: '1px solid var(--ink)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 32, color: 'var(--gold)', lineHeight: 1 }}>
                  {['I.', 'II.', 'III.', 'IV.'][i]}
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, margin: '18px 0 10px', lineHeight: 1.25 }}>{v.title}</h3>
                <p className="body-md" style={{ margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <SectionHeading
            align="left"
            eyebrow="THE TEAM"
            title="The people"
            italicTail="behind it."
            sub="A small, deliberately composed team of engineers, clinicians, editors, and community builders."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 56 }}>
            {TEAM.map((m, i) => (
              <div key={i} style={{ padding: '24px', borderRadius: 14, background: 'var(--surface-bright)', border: '1px solid rgba(74,54,100,0.08)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', marginBottom: 14 }}>
                  <Placeholder label="" width="100%" height="100%" radius={0} tone={['lavender','cream','tan','lavender'][i]} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 17 }}>{m.name}</div>
                <div className="mono" style={{ marginTop: 4, color: 'var(--gold)' }}>{m.role.toUpperCase()}</div>
                <p className="body-md" style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-soft)' }}>{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 64px' }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto', position: 'relative', overflow: 'hidden', borderRadius: 32,
          background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)',
          padding: '80px',
          border: '1px solid rgba(255,255,255,0.5)',
        }}>
          <div style={{ position: 'absolute', top: -80, right: -60, width: 420, height: 420, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>JOIN US</div>
            <h2 className="display" style={{ margin: 0, fontSize: 'clamp(36px, 4vw, 58px)', color: 'var(--plum)' }}>
              Start with the <em className="italic-emph">assessment.</em>
            </h2>
            <p className="body-lg" style={{ marginTop: 22, color: 'var(--ink-soft)' }}>
              Twenty minutes. A 14-page cited report. The most useful document you will bring to any medical appointment.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 36, justifyContent: 'center' }}>
              <button className="btn btn-primary">Start the assessment {Icon.arrow(14)}</button>
              <button className="btn" style={{ background: 'rgba(255,252,248,0.65)', color: 'var(--plum)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.7)' }}>
                Read a sample report
              </button>
            </div>
            <div className="mono" style={{ marginTop: 24, color: 'var(--plum)' }}>EVERY CLAIM CITED · SOURCES VISIBLE · NAMS · ACOG · MAYO · ENDOCRINE SOC.</div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
