/* global React, Placeholder, Nav, SectionHeading, Footer */
// Haircare — Empress Health Curated Marketplace
// Shopify collection 331223302302 · token 0ad62e12ceaec500c350dc1f4a1958c5

function Haircare() {
  return (
    <div data-screen-label="Haircare" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={4} base="" />
      </div>

      {/* ───── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '80px 64px 60px', overflow: 'hidden', background: 'var(--surface)' }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', top: -80, right: -100, width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.22) 0%, rgba(214,188,243,0) 70%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 120, left: -60, width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.20) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(48px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 72 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>THE EMPRESS EDIT · HAIRCARE · MMXXVI</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>GENTLE · EVIDENCE-INFORMED · CITED</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <span className="chip" style={{ marginBottom: 32 }}>
                <span className="dot" />
                HAIRCARE &amp; HAIR TOOLS
              </span>
              <h1 className="display" style={{ margin: '0 0 32px', fontSize: 'clamp(48px, 5.6vw, 84px)' }}>
                Haircare,<br/><em className="italic-emph">for what's changed.</em>
              </h1>
              <p className="body-lg" style={{ maxWidth: 500, marginBottom: 40 }}>
                Post-menopausal hair shedding is a real, documented phenomenon — not vanity. Estrogen and progesterone loss shifts more follicles into the resting phase simultaneously. The products here work with that biology, not against it.
              </p>
              <div className="mono" style={{ color: 'var(--gold)' }}>
                SOURCES · J. DERMATOL. 2021 · NAMS § 7.3 · CHUNK-027
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Placeholder label={"HAIRCARE · EDITORIAL\nBOTTLES + COMB\nSOFT TAN SURFACE"} width="100%" height={560} radius={6} tone="cream" />
              <div style={{ position: 'absolute', top: -10, left: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, borderTop: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, left: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)' }} />
              <div style={{ position: 'absolute', bottom: -10, right: -10, width: 24, height: 24, borderBottom: '1px solid var(--gold)', borderRight: '1px solid var(--gold)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ───── EDITORIAL BLOCK — post-menopausal hair shedding ───── */}
      <section style={{ padding: '120px 64px', background: 'linear-gradient(180deg, var(--surface) 0%, #f3ecf8 60%, var(--surface) 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 80, alignItems: 'start' }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 16 }}>CLINICAL CONTEXT</div>
              <SectionHeading
                title="What happens to hair"
                italicTail="after menopause."
                sub=""
              />
              <div style={{ marginTop: 36 }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.82, color: 'var(--ink-soft)', margin: 0 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                    fontSize: 64, color: 'var(--plum)', lineHeight: 0.85,
                    float: 'left', marginRight: 10, marginTop: 6,
                  }}>H</span>
                  air follicles have estrogen receptors. When estrogen falls, the anagen (growth) phase shortens and the telogen (resting/shedding) phase lengthens. The clinical term is female pattern hair loss — it affects approximately 50% of women by the time they reach 50, and the hormonal shift of menopause is a documented accelerant.
                </p>
                <p className="body-md" style={{ marginTop: 24 }}>
                  The evidence for intervention is uneven. Minoxidil (topical) has the clearest trial data. Beyond that, reducing physical stress on follicles — avoiding high-heat tools, sulfate-heavy shampoos, and aggressive styling — makes a measurable difference in shedding rate. Scalp health is a factor: formulas that reduce inflammation and support the follicle environment are worth the attention.
                </p>
                <p className="body-md" style={{ marginTop: 20 }}>
                  The products in this edit are selected for gentleness and mechanism. We do not list anything that claims to "regrow hair" without a trial. We do list formulas that reduce breakage, support scalp health, and work with the hair you have.
                </p>
              </div>
              {/* Citation footer */}
              <div style={{ marginTop: 32, padding: '20px 24px', borderLeft: '2px solid var(--gold)', background: 'rgba(201,165,96,0.06)', borderRadius: '0 var(--r-md) var(--r-md) 0' }}>
                <div className="mono" style={{ color: 'var(--gold)', marginBottom: 6 }}>CLINICAL CITATIONS</div>
                <div className="mono" style={{ color: 'var(--ink-faint)' }}>
                  J. DERMATOLOGY 2021 · NAMS § 7.3 · INT'L J. TRICHOLOGY 2022 · CHUNK-027 · CHUNK-055
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 8 }}>
              <Placeholder label={"SCALP EDITORIAL\nCLOSE · TEXTURE"} width="100%" height={360} radius={8} tone="lavender" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 28 }}>
                {[
                  { label: 'Sulfate-free formulas', body: 'Gentler on the follicle environment and scalp barrier.' },
                  { label: 'Low-heat tools', body: 'Sustained high heat is a documented cause of shaft damage.' },
                  { label: 'Scalp massage', body: 'Four minutes daily increased hair thickness in one small trial.' },
                ].map((p) => (
                  <div key={p.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, color: 'var(--plum)', marginBottom: 4 }}>{p.label}</div>
                      <div className="body-md" style={{ margin: 0 }}>{p.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SHOPIFY HAIRCARE COLLECTION ───────────────────────── */}
      <section style={{ padding: '120px 64px 80px', background: 'var(--surface-cream)', borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeading
            align="center"
            eyebrow="HAIRCARE EDIT"
            title="The haircare collection,"
            italicTail="considered."
            sub="Gentle formulas and tools selected for post-menopausal hair needs."
          />

          {/* Shopify embed mount point */}
          <div style={{ marginTop: 64, background: 'var(--surface-bright)', borderRadius: 'var(--r-xl)', padding: '40px 32px', border: '1px solid rgba(74,54,100,0.06)' }}>
            <div id="collection-component-1760915730154" />
          </div>
        </div>
      </section>

      {/* ───── RITUAL GUIDE CARDS — glass-warm panels ────────────── */}
      <section style={{ padding: '100px 64px 140px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 56 }}>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--plum)' }}>A small ritual guide.</span>
            <span style={{ width: 50, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { step: 'Morning', title: 'Gentle cleanse', body: 'Sulfate-free shampoo, cool rinse. Avoid vigorous towel friction — pat dry.' },
              { step: 'Weekly', title: 'Scalp treatment', body: 'Lightweight oil or peptide serum massaged in for four minutes. Supports circulation.' },
              { step: 'Before heat', title: 'Heat protectant', body: 'Applied to damp hair before any tool above 140°C. Non-negotiable.' },
              { step: 'Monthly', title: 'Low-protein assessment', body: 'Over-protein causes brittleness. If hair feels stiff, take a protein break for a cycle.' },
            ].map((p) => (
              <div key={p.step} className="glass-warm" style={{ padding: '28px 24px', borderRadius: 'var(--r-lg)' }}>
                <div className="mono" style={{ color: 'var(--gold)', marginBottom: 12 }}>{p.step}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 20, margin: '0 0 12px', lineHeight: 1.25, color: 'var(--plum)' }}>{p.title}</h3>
                <p className="body-md" style={{ margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mono" style={{ marginTop: 40, textAlign: 'center', color: 'var(--gold)' }}>
            SOURCES · INT'L J. TRICHOLOGY 2022 · J. DERMATOLOGY 2021 · CHUNK-027
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
