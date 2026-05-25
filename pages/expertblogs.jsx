/* global React, Placeholder, Nav, Icon, Footer, SectionHeading */
// Expert Blogs — Reading Room: fetches /public/blogs.json, renders editorial blog cards.

function ExpertBlogs() {
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/public/blogs.json')
      .then(r => r.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const tones = ['lavender', 'cream', 'tan', 'lavender', 'cream', 'tan'];

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  const featured = posts[0] || null;
  const grid = posts.slice(1);

  return (
    <div data-screen-label="Expert Blogs" style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={5} base="" />
      </div>

      {/* ───── MASTHEAD HERO ──────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '20px 64px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -180, width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214,188,243,0.28) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -100, width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,222,196,0.18) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          {/* Masthead bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderBottom: '1px solid rgba(74,54,100,0.18)', paddingBottom: 18, marginBottom: 56 }}>
            <div className="mono" style={{ color: 'var(--gold)' }}>READING ROOM · WEEKLY</div>
            <div className="mono" style={{ color: 'var(--ink-faint)' }}>CLINICIAN-WRITTEN · ALL FREE · UPDATED EVERY MONDAY</div>
          </div>

          {/* Display headline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, alignItems: 'end', marginBottom: 72 }}>
            <h1 className="display" style={{ margin: 0, lineHeight: 0.98 }}>
              Expert voices,<br/><em className="italic-emph">grounded.</em>
            </h1>
            <p className="body-lg" style={{ margin: 0, fontSize: 18 }}>
              Every piece is written by a NAMS-certified clinician and edited until it reads like something worth reading — not a brochure. Citations appear where the claim lives, not buried at the end.
            </p>
          </div>

          {/* Featured post */}
          {loading && (
            <div style={{ padding: '40px 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
              LOADING POSTS…
            </div>
          )}

          {!loading && featured && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 56, alignItems: 'stretch' }}>
              {/* Photo side */}
              <div style={{ position: 'relative' }}>
                {featured.image
                  ? <img src={featured.image} alt={featured.title}
                      style={{ width: '100%', height: 520, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                  : <Placeholder label="FEATURED ARTICLE · READING ROOM" width="100%" height={520} radius={6} tone="lavender" />
                }
                <span style={{
                  position: 'absolute', top: 22, left: 22,
                  padding: '8px 14px', borderRadius: 999,
                  background: 'rgba(255,252,248,0.88)', backdropFilter: 'blur(8px)',
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--plum)',
                  border: '1px solid rgba(255,255,255,0.6)',
                }}>THE LEAD · READING ROOM</span>
              </div>
              {/* Text side */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="mono" style={{ color: 'var(--gold)', marginBottom: 18 }}>
                    {formatDate(featured.date)} · FEATURED
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px, 2.8vw, 42px)',
                    lineHeight: 1.15, margin: '0 0 20px', fontStyle: 'italic', color: 'var(--ink)' }}>
                    {featured.title}
                  </h2>
                  {/* Drop-cap intro */}
                  <p className="body-lg" style={{ margin: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
                      fontSize: 64, lineHeight: 0.82, float: 'left', marginRight: 10, marginTop: 6, color: 'var(--plum)',
                    }}>{featured.excerpt ? featured.excerpt[0] : 'R'}</span>
                    {featured.excerpt ? featured.excerpt.slice(1) : ''}
                  </p>
                </div>
                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(74,54,100,0.10)' }}>
                  <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--gold)', verticalAlign: 'middle', marginRight: 10 }} />
                  <a href={`/blog/${featured.slug}`} style={{ color: 'var(--plum)', fontFamily: 'var(--font-body)', fontSize: 14,
                    fontWeight: 600, letterSpacing: '0.04em', textDecoration: 'none' }}>
                    Read the piece →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ───── BLOG GRID ───────────────────────────────────────────── */}
      <section style={{ padding: '120px 64px 160px', background: 'var(--surface-cream)',
        borderTop: '1px solid rgba(74,54,100,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderBottom: '1px solid var(--ink)', paddingBottom: 14, marginBottom: 56 }}>
            <h2 className="headline" style={{ margin: 0, fontSize: 'clamp(28px, 2.6vw, 40px)' }}>
              Recent pieces, <em className="italic-emph">all cited.</em>
            </h2>
            <span className="mono" style={{ color: 'var(--ink-faint)' }}>SORTED BY DATE · NEWEST FIRST</span>
          </div>

          {loading && (
            <div style={{ padding: '40px 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
              LOADING…
            </div>
          )}

          {!loading && grid.length === 0 && !featured && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
              NO POSTS FOUND.
            </div>
          )}

          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, rowGap: 64 }}>
              {grid.map((post, i) => (
                <article key={post.slug} className="lift" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative' }}>
                    {post.image
                      ? <img src={post.image} alt={post.title}
                          style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 4, display: 'block' }} />
                      : <Placeholder label="ARTICLE COVER" width="100%" height={240} radius={4} tone={tones[i % tones.length]} />
                    }
                  </div>
                  {/* Eyebrow: date */}
                  <div className="mono" style={{ color: 'var(--gold)', marginTop: 20, marginBottom: 10 }}>
                    {formatDate(post.date)} · READING ROOM
                  </div>
                  {/* Italic Bodoni title */}
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontStyle: 'italic',
                    fontSize: 22, margin: '0 0 12px', lineHeight: 1.25, color: 'var(--ink)', flex: 1 }}>
                    {post.title}
                  </h3>
                  {/* 2-line excerpt */}
                  <p className="body-md" style={{ margin: '0 0 20px',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.excerpt}
                  </p>
                  {/* Gold rule + read link */}
                  <div style={{ paddingTop: 16, borderTop: '1px solid rgba(201,165,96,0.35)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--gold)' }} />
                    <a href={`/blog/${post.slug}`} style={{ color: 'var(--plum)', fontFamily: 'var(--font-body)',
                      fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textDecoration: 'none' }}>
                      Read →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───── NEWSLETTER ─────────────────────────────────────────── */}
      <section style={{ padding: '160px 64px', background: 'var(--surface)' }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          position: 'relative', overflow: 'hidden', borderRadius: 32,
          background: 'linear-gradient(135deg, #efe7f5 0%, #e3d6ee 35%, #d6c5e8 65%, #c4afd9 100%)',
          padding: '80px 80px',
          border: '1px solid rgba(255,255,255,0.5)',
        }}>
          <div style={{ position: 'absolute', top: -120, right: -80, width: 460, height: 460, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div className="mono" style={{ color: 'var(--plum)', marginBottom: 18 }}>SUBSCRIBE · WEEKLY · FREE</div>
              <h2 className="display" style={{ margin: 0, fontSize: 'clamp(36px, 4.2vw, 60px)', color: 'var(--plum)' }}>
                One expert piece,<br/>every Monday,<br/>
                <em className="italic-emph" style={{ color: 'var(--plum-mid)' }}>read with your coffee.</em>
              </h2>
            </div>
            <div style={{ background: 'rgba(255,252,248,0.75)', padding: '8px 8px 8px 22px', borderRadius: 999,
              display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 30px 60px -30px rgba(74,54,100,0.30)' }}>
              <input placeholder="your@email.com" style={{ flex: 1, padding: '14px 0', border: 0,
                background: 'transparent', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', color: 'var(--ink)' }} />
              <button className="btn btn-primary" style={{ padding: '14px 22px' }}>Subscribe {Icon.arrow(14)}</button>
            </div>
          </div>
        </div>
      </section>

      <Footer base="" />
    </div>
  );
}
