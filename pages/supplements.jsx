/* global React, Placeholder, Nav, SectionHeading, Footer */
// Supplements — Empress Health Curated Marketplace
// Shopify collection 330403643550 · token 0ad62e12ceaec500c350dc1f4a1958c5

function Supplements() {
  return (
    <div data-screen-label="Supplements" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={4} base="" />
      </div>

      {/* ───── EDITORIAL HERO ─────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '80px 64px 60px', overflow: 'hidden', background: 'var(--surface)' }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', top: -80, right: -100, width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.24) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 100, left: -80, width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.22) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 72 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>THE EMPRESS EDIT · SUPPLEMENTS · MMXXVI</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>THIRD-PARTY TESTED · CLINICALLY INFORMED</div>
          </div>

          <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto', paddingBottom: 60 }}>
            <span className="chip" style={{ marginBottom: 32 }}>
              <span className="dot" />
              SUPPLEMENTS &amp; NUTRITION
            </span>
            <h1 className="display" style={{ margin: '0 0 32px' }}>
              Supplements,<br/><em className="italic-emph">but considered.</em>
            </h1>
            <p className="body-lg" style={{ maxWidth: 580, margin: '0 auto 40px' }}>
              No proprietary blends. No undisclosed doses. Every formula passes a third-party assay before listing. We carry fewer options than most supplement shops because we believe less is clearer.
            </p>
            <div className="mono" style={{ color: 'var(--gold)' }}>
              SOURCES · NAMS 2023 · ENDOCRINE SOCIETY · CHUNK-019
            </div>
          </div>
        </div>
      </section>

      {/* ───── EDITOR'S PERSPECTIVE — 2-col with drop-cap ────────── */}
      <section style={{ padding: '120px 64px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)', borderBottom: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 80, alignItems: 'start' }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>EDITOR'S PERSPECTIVE</div>
              <SectionHeading
                title="How we read the"
                italicTail="evidence."
                sub=""
              />
              <div style={{ marginTop: 24 }}>
                <Placeholder label={"SUPPLEMENT · EDITORIAL\nBOTTLES · TAN CLOTH"} width="100%" height={320} radius={8} tone="tan" />
              </div>
              <div className="mono" style={{ marginTop: 18, color: 'var(--gold)' }}>
                SOURCES · COCHRANE · NAMS · CHUNK-019 · CHUNK-041
              </div>
            </div>

            <div style={{ paddingTop: 8 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.82, color: 'var(--ink-soft)', margin: 0 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                  fontSize: 64, color: 'var(--plum)', lineHeight: 0.85,
                  float: 'left', marginRight: 10, marginTop: 6,
                }}>T</span>
                here is a supplement for everything and evidence for very little. We start from that position. What reaches this page has passed three filters: there is a trial (not a testimonial), the dose matches what was tested, and the form is one a person can realistically maintain for six months.
              </p>
              <p className="body-md" style={{ marginTop: 24 }}>
                Magnesium glycinate at studied doses for sleep onset. Vitamin D3 with K2 for bone-density maintenance in the post-menopausal window. Ashwagandha at the KSM-66 extract level for cortisol and mood. These are the kinds of specifics that matter. The brand matters less than the certificate of analysis that arrives with every batch we list.
              </p>
              <p className="body-md" style={{ marginTop: 20 }}>
                We do not carry combination formulas where individual ingredients are below effective thresholds. We do not carry anything that calls itself a "menopause blend" without disclosing exactly what is in it and at what dose. The disclosure, in this edit, is not fine print — it is the label.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 40 }}>
                {[
                  { label: 'No proprietary blends', detail: 'Every ingredient listed with its dose' },
                  { label: 'Third-party tested', detail: 'CoA on file for every batch' },
                  { label: 'Clinically dosed', detail: 'Matched to studied quantities, not label minimums' },
                ].map((p) => (
                  <div key={p.label} style={{ borderTop: '1px solid var(--gold)', paddingTop: 16 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: 'var(--plum)', lineHeight: 1.3, marginBottom: 8 }}>{p.label}</div>
                    <div className="body-md" style={{ margin: 0 }}>{p.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SHOPIFY SUPPLEMENTS COLLECTION ────────────────────── */}
      <section id="sec-supplements" style={{ padding: '120px 64px 140px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeading
            align="center"
            eyebrow="ALL SUPPLEMENTS"
            title="The supplement edit,"
            italicTail="complete."
            sub="Every item third-party tested. Every dose matched to clinical evidence."
          />

          {/* Shopify embed mount point */}
          <div style={{ marginTop: 64, background: 'var(--surface-bright)', borderRadius: 'var(--r-xl)', padding: '40px 32px', border: '1px solid rgba(74,54,100,0.06)' }}>
            <div id="collection-component-1759529172622" />
          </div>

          {/* Citation strip */}
          <div style={{ marginTop: 56, padding: '24px 32px', background: 'var(--surface-lavender)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div className="mono" style={{ color: 'var(--plum)' }}>ALL RECOMMENDATIONS GROUNDED</div>
            <div className="mono" style={{ color: 'var(--gold)' }}>
              SOURCES · CHUNK-019 · CHUNK-041 · NAMS 2023 · ENDOCRINE SOCIETY · COCHRANE
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
