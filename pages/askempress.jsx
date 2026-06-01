/* global React, Nav, Footer, Icon */
// Ask Empress — hero headline, 2-col chat + example queries, Sources accordion preserved.
// /qa POST + sources accordion logic ported from legacy askempress.html.

const EXAMPLE_QUERIES = [
  'Why do I wake at 3am every night?',
  'What does low estrogen do to my joints?',
  'Is brain fog from perimenopause real?',
  'How can I reduce hot flashes without HRT?',
];

function AskEmpressPage() {
  return (
    <div style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>

      {/* ── NAV ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Nav variant="inline" activeIdx={0} base="" />
      </div>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '80px 64px 60px', overflow: 'hidden' }}>
        {/* Luxury orbs */}
        <div style={{ position: 'absolute', top: -140, right: -180, width: 680, height: 680, borderRadius: '50%', background: 'radial-gradient(circle, rgba(214,188,243,0.30) 0%, rgba(214,188,243,0) 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 200, left: -100, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(247,222,196,0.20) 0%, rgba(247,222,196,0) 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: '30%', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,96,0.10) 0%, rgba(201,165,96,0) 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>120-SYMPTOM BIOMARKER FRAMEWORK · GROUNDED AI</div>
          <h1 className="display" style={{ margin: '0 0 24px', fontSize: 'clamp(48px, 5.4vw, 88px)', lineHeight: 1.0 }}>
            Ask Empress.<br/><em className="italic-emph">She gets it.</em>
          </h1>
          <p className="body-lg" style={{ maxWidth: 560 }}>
            Every answer is grounded in peer-reviewed research and the Empress 120-Symptom Biomarker Framework. Sources are visible on every response — no black boxes.
          </p>
          <div className="mono" style={{ marginTop: 20, color: 'var(--gold)' }}>SOURCES · CHUNK-001 THROUGH CHUNK-120 · PINECONE GROUNDED · NAMS 2023</div>
        </div>
      </section>

      {/* ── CHAT + EXAMPLE QUERIES ── */}
      <section style={{ padding: '0 64px 160px', position: 'relative' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>

          {/* Chat panel */}
          <div className="glass-warm" style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Chat header */}
            <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(74,54,100,0.10)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--plum)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: '#fff' }}>E</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, color: 'var(--plum)' }}>Empress</div>
                <div className="mono" style={{ color: 'var(--gold)', marginTop: 2 }}>GROUNDED · BIOMARKER FRAMEWORK · ONLINE</div>
              </div>
              <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#1f8a5b', fontFamily: 'var(--font-body)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1f8a5b' }} />Live
              </span>
            </div>

            {/* Messages container */}
            <div id="messagesContainer" style={{
              flex: 1, overflowY: 'auto', padding: 28,
              display: 'flex', flexDirection: 'column', gap: 16,
              minHeight: 420, maxHeight: 560,
            }}>
              {/* Welcome state */}
              <div id="welcome-msg" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, color: 'var(--plum)', marginBottom: 12 }}>Welcome.</div>
                <p className="body-md" style={{ margin: 0 }}>
                  Ask me anything about menopause — symptoms, treatments, lifestyle, or what the research actually says.
                </p>
              </div>
            </div>

            {/* Typing indicator */}
            <div id="typingIndicator" style={{ display: 'none', padding: '0 28px 16px', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--plum)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, color: '#fff' }}>E</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{
                    width: 7, height: 7, borderRadius: '50%', background: 'var(--plum-tint)',
                    display: 'inline-block', animation: `typing 1.4s infinite ease-in-out ${i * -0.16}s`,
                  }} />
                ))}
              </div>
            </div>

            {/* Input row */}
            <div style={{ padding: '16px 28px 24px', borderTop: '1px solid rgba(74,54,100,0.10)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  id="messageInput"
                  placeholder="Ask me anything about menopause…"
                  rows="1"
                  style={{
                    flex: 1, minHeight: 48, maxHeight: 120,
                    padding: '13px 16px', border: '1px solid rgba(74,54,100,0.18)',
                    borderRadius: 'var(--r-md)', fontFamily: 'var(--font-body)', fontSize: 15,
                    color: 'var(--ink)', background: 'rgba(255,255,255,0.7)',
                    resize: 'none', outline: 'none', lineHeight: 1.5,
                  }}
                />
                <button id="sendBtn" disabled style={{
                  width: 48, height: 48, flexShrink: 0, borderRadius: '50%',
                  background: 'var(--plum)', color: '#fff', border: 0, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0.4, transition: 'opacity .2s ease',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22,2 15,22 11,13 2,9"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right: example query tiles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="mono" style={{ color: 'var(--plum)', marginBottom: 4 }}>EXAMPLE QUESTIONS</div>
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                className="lift"
                onClick={`populateQuery('${q}')`}
                style={{
                  textAlign: 'left', padding: '16px 18px', borderRadius: 'var(--r-md)',
                  background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(74,54,100,0.12)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)',
                  lineHeight: 1.4, boxShadow: 'var(--shadow-soft)',
                }}
              >
                {q}
              </button>
            ))}

            {/* Citation footer */}
            <div style={{ marginTop: 8, padding: '16px 18px', borderRadius: 'var(--r-md)', background: 'rgba(201,165,96,0.08)', border: '1px solid rgba(201,165,96,0.20)' }}>
              <div className="mono" style={{ color: 'var(--gold)', marginBottom: 8 }}>GROUNDED IN</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
                The Empress 120-Symptom Biomarker Framework. Every response cites its Pinecone source chunk.
              </p>
              <div className="mono" style={{ marginTop: 10, color: 'var(--gold)', fontSize: 9 }}>NAMS 2023 · ACOG · MAYO CLINIC · ENDOCRINE SOCIETY</div>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        #messagesContainer::-webkit-scrollbar { width: 5px; }
        #messagesContainer::-webkit-scrollbar-track { background: transparent; }
        #messagesContainer::-webkit-scrollbar-thumb { background: rgba(74,54,100,0.15); border-radius: 3px; }
        #sendBtn:not(:disabled) { opacity: 1 !important; }
        .msg-user { align-self: flex-end; }
        .msg-assistant { align-self: flex-start; }
        .example-query-btn:hover { background: rgba(255,255,255,0.85) !important; border-color: rgba(74,54,100,0.22) !important; }
      `}} />

      <Footer base="" />

      {/* ── CHAT ENGINE SCRIPT (preserved /qa POST + sources accordion from legacy) ── */}
      <script dangerouslySetInnerHTML={{ __html: `
        const msgInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const container = document.getElementById('messagesContainer');
        const typing = document.getElementById('typingIndicator');

        // Wire example query buttons
        document.querySelectorAll('[onclick]').forEach(btn => {
          const match = btn.getAttribute('onclick') && btn.getAttribute('onclick').match(/populateQuery\\('(.+)'\\)/);
          if (match) {
            btn.removeAttribute('onclick');
            btn.addEventListener('click', () => populateQuery(match[1]));
          }
        });

        function populateQuery(text) {
          msgInput.value = text;
          sendBtn.disabled = false;
          msgInput.focus();
        }

        msgInput.addEventListener('input', function() {
          sendBtn.disabled = !this.value.trim();
          this.style.height = 'auto';
          this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        msgInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) sendMessage();
          }
        });

        sendBtn.addEventListener('click', sendMessage);

        function addMessage(text, role, sources) {
          const welcome = document.getElementById('welcome-msg');
          if (welcome) welcome.remove();

          const wrap = document.createElement('div');
          wrap.style.cssText = 'display:flex; gap:10px; max-width:90%;' + (role === 'user' ? 'align-self:flex-end; flex-direction:row-reverse;' : 'align-self:flex-start;');

          const avatar = document.createElement('div');
          avatar.style.cssText = 'width:28px; height:28px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;';
          avatar.style.background = role === 'user' ? 'var(--surface-tan)' : 'var(--plum)';
          avatar.style.color = role === 'user' ? 'var(--plum)' : '#fff';
          avatar.textContent = role === 'user' ? 'You' : 'E';

          const bubble = document.createElement('div');
          bubble.style.cssText = 'padding:14px 16px; border-radius:14px; font-family:var(--font-body); font-size:14px; line-height:1.6; word-break:break-word;';
          bubble.style.background = role === 'user' ? 'var(--plum)' : 'rgba(255,255,255,0.7)';
          bubble.style.color = role === 'user' ? '#fff' : 'var(--ink)';
          bubble.style.border = role === 'user' ? 'none' : '1px solid rgba(74,54,100,0.10)';
          bubble.textContent = text;

          // Grounded sources panel — preserved from legacy
          if (role === 'assistant') {
            const srcs = Array.isArray(sources) ? sources : [];
            const srcWrap = document.createElement('div');
            srcWrap.style.cssText = 'margin-top:10px; border-top:1px solid rgba(74,54,100,0.10); padding-top:8px;';

            if (srcs.length === 0) {
              const noSrc = document.createElement('div');
              noSrc.style.cssText = 'font-family:var(--font-mono); font-size:10px; color:var(--gold); text-transform:uppercase; letter-spacing:0.06em;';
              noSrc.textContent = 'SOURCES · EMPRESS CLINICAL FRAMEWORK · NO SPECIFIC CHUNK MATCHED';
              srcWrap.appendChild(noSrc);
            } else {
              let expanded = false;
              const toggle = document.createElement('button');
              toggle.type = 'button';
              toggle.style.cssText = 'background:none; border:none; cursor:pointer; font-family:var(--font-mono); font-size:10px; color:var(--gold); font-weight:500; padding:0; text-transform:uppercase; letter-spacing:0.06em;';
              toggle.textContent = 'SOURCES (' + srcs.length + ') ▸';

              const panel = document.createElement('div');
              panel.style.cssText = 'display:none; margin-top:8px; flex-direction:column; gap:6px;';

              srcs.forEach(function(src) {
                const row = document.createElement('div');
                row.style.cssText = 'background:rgba(214,188,243,0.15); border-radius:6px; border-left:2px solid var(--gold); padding:6px 10px;';
                const idEl = document.createElement('code');
                const idText = typeof src.id === 'string' && src.id.length > 12 ? src.id.slice(-12) : (src.id || '');
                idEl.style.cssText = 'font-family:var(--font-mono); font-size:10px; color:var(--plum); font-weight:700; display:block; margin-bottom:3px; text-transform:uppercase;';
                idEl.textContent = idText;
                const snipEl = document.createElement('p');
                const snip = typeof src.snippet === 'string' ? src.snippet.slice(0, 120) : '';
                snipEl.style.cssText = 'font-family:var(--font-body); font-size:12px; color:var(--ink-soft); margin:0;';
                snipEl.textContent = snip + (snip.length >= 120 ? '…' : '');
                row.appendChild(idEl);
                if (snip) row.appendChild(snipEl);
                panel.appendChild(row);
              });

              toggle.addEventListener('click', function() {
                expanded = !expanded;
                panel.style.display = expanded ? 'flex' : 'none';
                toggle.textContent = 'SOURCES (' + srcs.length + ') ' + (expanded ? '▾' : '▸');
              });

              srcWrap.appendChild(toggle);
              srcWrap.appendChild(panel);
            }
            bubble.appendChild(srcWrap);
          }

          wrap.appendChild(avatar);
          wrap.appendChild(bubble);
          container.appendChild(wrap);
          container.scrollTop = container.scrollHeight;
        }

        function showTyping() {
          typing.style.display = 'flex';
          container.scrollTop = container.scrollHeight;
        }
        function hideTyping() { typing.style.display = 'none'; }

        async function sendMessage() {
          const msg = msgInput.value.trim();
          if (!msg) return;
          addMessage(msg, 'user');
          msgInput.value = '';
          msgInput.style.height = 'auto';
          sendBtn.disabled = true;
          showTyping();
          try {
            const res = await fetch('/qa', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ question: msg, message: msg })
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            hideTyping();
            const answer = data.answer || data.response || data.message || 'I apologise, but I couldn\\'t process your request.';
            const sources = Array.isArray(data.sources) ? data.sources : [];
            addMessage(answer, 'assistant', sources);
          } catch(err) {
            hideTyping();
            addMessage('Sorry, I encountered an error. Please try again.', 'assistant', []);
          }
        }
      `}} />
    </div>
  );
}
