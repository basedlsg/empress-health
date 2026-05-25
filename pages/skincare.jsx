/* global React, Placeholder, Nav, SectionHeading, Footer */
// Skincare — Empress Health Curated Marketplace
// Shopify collection 330403938462 · token 0ad62e12ceaec500c350dc1f4a1958c5

function Skincare() {
  return (
    <div data-screen-label="Skincare" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={4} base="" />
      </div>

      {/* ───── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '80px 64px 60px', overflow: 'hidden', background: 'var(--surface)' }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', top: -100, left: -120, width: 580, height: 580, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.26) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 440, height: 440, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.18) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 72 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>THE EMPRESS EDIT · SKINCARE · MMXXVI</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>CLEAN · EVIDENCE-INFORMED · CITED</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <span className="chip" style={{ marginBottom: 32 }}>
                <span className="dot" />
                SKINCARE &amp; WELLNESS
              </span>
              <h1 className="display" style={{ margin: '0 0 32px', fontSize: 'clamp(48px, 5.6vw, 84px)' }}>
                For the skin<br/><em className="italic-emph">that's earned this.</em>
              </h1>
              <p className="body-lg" style={{ maxWidth: 500, marginBottom: 40 }}>
                Post-40 skin has different needs. Estrogen-driven collagen loss is measurable, not cosmetic. The formulas here respond to that — not with marketing, but with ingredients that have a mechanism.
              </p>
              <div className="mono" style={{ color: 'var(--gold)' }}>
                SOURCES · DERMATOLOGY J. 2022 · NAMS § 7 · CHUNK-022
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Placeholder label={"SKINCARE · FLAT LAY\nBOTTLES · CREAM CLOTH\nNATURAL LIGHT"} width="100%" height={560} radius={6} tone="tan" />
              <div style={{ position: 'absolute', top: -10, left: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, left: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ───── WHY POST-40 SKINCARE IS DIFFERENT ─────────────────── */}
      <section style={{ padding: '120px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f7eee5 60%, var(--surface) 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 80, alignItems: 'start' }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>CLINICAL CONTEXT</div>
              <SectionHeading
                title="Why post-40 skincare"
                italicTail="is different."
                sub=""
              />
              <div style={{ marginTop: 32 }}>
                <Placeholder label={"SKIN EDITORIAL\nCLOSE-UP · TEXTURE"} width="100%" height={280} radius={8} tone="cream" />
              </div>
            </div>

            <div style={{ paddingTop: 8 }}>
              {/* Drop-cap editorial block */}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.82, color: 'var(--ink-soft)', margin: 0 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                  fontSize: 64, color: 'var(--plum)', lineHeight: 0.85,
                  float: 'left', marginRight: 10, marginTop: 6,
                }}>E</span>
                strogen is the key regulator of collagen synthesis in skin. As ovarian production falls in perimenopause and stops in menopause, dermal collagen content drops by approximately 30% in the first five years post-menopause. This is not a cosmetic concern — it changes the skin's structural capacity, moisture retention, and barrier function in measurable ways.
              </p>
              <p className="body-md" style={{ marginTop: 24 }}>
                The practical implication: ingredients that worked at 30 are still relevant, but the delivery system and concentration matter more. Ceramide-rich moisturizers address the barrier dysfunction directly. Topical retinoids (at the right frequency for skin that is more reactive post-estrogen loss) support collagen turnover. Peptide formulas that work through a different mechanism than retinoids can be layered.
              </p>
              <p className="body-md" style={{ marginTop: 20 }}>
                What this edit avoids: "anti-aging" framing, proprietary blends without ingredient disclosure, SPF numbers above what the formula can actually deliver. What it carries: formulas with a mechanism, ingredients at studied concentrations, and no claim that outpaces the evidence.
              </p>

              {/* Gold citation footer */}
              <div style={{ marginTop: 36, padding: '20px 24px', borderLeft: '2px solid var(--gold)', background: 'rgba(201,165,96,0.06)', borderRadius: '0 var(--r-md) var(--r-md) 0' }}>
                <div className="mono" style={{ color: 'var(--gold)', marginBottom: 6 }}>CLINICAL CITATIONS</div>
                <div className="mono" style={{ color: 'var(--ink-faint)' }}>
                  DERMATOLOGY J. 2022 · COLLAGEN LOSS STUDY · NAMS § 7.1 · ENDOCRINE SOCIETY 2020 · CHUNK-022 · CHUNK-038
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SHOPIFY SKINCARE COLLECTION ───────────────────────── */}
      <section style={{ padding: '120px 64px 140px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeading
            align="center"
            eyebrow="SKINCARE EDIT"
            title="The skincare collection,"
            italicTail="considered."
            sub="Formulas with a mechanism. Ingredients at studied concentrations. Every claim visible."
          />

          {/* Shopify embed mount point */}
          <div style={{ marginTop: 64, background: 'var(--surface-bright)', borderRadius: 'var(--r-xl)', padding: '40px 32px', border: '1px solid rgba(74,54,100,0.06)' }}>
            <div id="collection-component-1760916097354" />
          </div>
        </div>
      </section>

      {/* ───── CARE NOTES FOOTER ─────────────────────────────────── */}
      <section style={{ padding: '80px 64px 100px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--plum)' }}>Care notes.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }}>
            {[
              { note: 'Introduce retinoids slowly', detail: 'Post-menopausal skin is more reactive. Start two nights per week.' },
              { note: 'Ceramides before actives', detail: 'Barrier first. Repair the foundation before adding stimulation.' },
              { note: 'SPF daily', detail: 'The single highest-evidence intervention for every skin type.' },
              { note: 'Hyaluronic acid on damp skin', detail: 'Apply to slightly damp skin — it draws moisture in, not out.' },
            ].map((p) => (
              <div key={p.note} style={{ borderTop: '1px solid rgba(74,54,100,0.15)', paddingTop: 20 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, color: 'var(--plum)', lineHeight: 1.3, marginBottom: 10 }}>{p.note}</div>
                <p className="body-md" style={{ margin: 0 }}>{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
