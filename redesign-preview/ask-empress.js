(function () {
  'use strict';
  var form = document.getElementById('ask-form');
  if (!form) return;
  var input = document.getElementById('ask-question');
  var send = document.getElementById('ask-send');
  var messages = document.getElementById('ask-messages');
  var status = document.getElementById('ask-status');
  var actions = document.getElementById('ask-answer-actions');
  var remember = document.getElementById('ask-remember');
  var clear = document.getElementById('ask-clear');
  var storageKey = 'empress.ask.chat.v1';
  var exchanges = [];
  var accountHistory = false;
  var historySaveQueue = Promise.resolve();
  var busy = false;

  function showInChat(element) {
    var padding = parseFloat(getComputedStyle(messages).paddingTop) || 0;
    messages.scrollTop += element.getBoundingClientRect().top - messages.getBoundingClientRect().top - padding;
  }

  function addMessage(text, role) {
    var bubble = document.createElement('div');
    bubble.className = 'bubble ' + role + ' show';
    var content = document.createElement('div');
    content.textContent = text;
    bubble.appendChild(content);
    messages.appendChild(bubble);
    var style = getComputedStyle(messages);
    var visibleHeight = messages.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    if (role === 'bot' && bubble.offsetHeight > visibleHeight) {
      showInChat(bubble);
    } else {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  function saveHistory() {
    if (accountHistory) {
      var payload = { remember: remember.checked, history: exchanges.slice(-8) };
      historySaveQueue = historySaveQueue.then(async function () {
        try {
          var csrfResponse = await fetch('/api/csrf');
          if (!csrfResponse.ok) throw new Error('We couldn’t save your chat. Please try again.');
          var csrf = await csrfResponse.json();
          var response = await fetch('/api/ask-empress/history', {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf.csrfToken },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            var data = await response.json();
            throw new Error(data.error || 'We couldn’t save your chat. Please try again.');
          }
        } catch (error) { status.textContent = error.message; }
      });
      return historySaveQueue;
    }
    try {
      if (remember.checked) {
        localStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), exchanges: exchanges.slice(-8) }));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (_) {
      remember.checked = false;
      status.textContent = 'This browser cannot save chat history. You can keep chatting here.';
    }
  }

  try {
    var saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved.savedAt === 'number' && Date.now() - saved.savedAt < 30 * 86400000 && Array.isArray(saved.exchanges)) {
      exchanges = saved.exchanges.slice(-8).filter(function (entry) {
        return entry && typeof entry.question === 'string' && typeof entry.answer === 'string';
      }).map(function (entry) { return { question: entry.question.slice(0, 800), answer: entry.answer.slice(0, 12000) }; });
      remember.checked = true;
      exchanges.forEach(function (entry) { addMessage(entry.question, 'user'); addMessage(entry.answer, 'bot'); });
      if (exchanges.length) status.textContent = 'Your saved chat is ready. Ask a follow-up, or clear it to start fresh.';
    } else if (saved) {
      localStorage.removeItem(storageKey);
    }
  } catch (_) { /* Chat remains available when browser storage is blocked. */ }

  // Resolve account ownership before the first question. A guest device chat
  // is never silently uploaded into whichever account happens to sign in.
  send.disabled = true;
  remember.disabled = true;
  clear.disabled = true;
  var historyReady = (async function () {
    try {
      var response = await fetch('/api/ask-empress/history', { signal: AbortSignal.timeout(10000), cache: 'no-store' });
      if (!response.ok) throw new Error('Account history is unavailable. Device-only chat is still available.');
      var data = await response.json();
      if (data.authenticated) {
        accountHistory = true;
        remember.checked = data.remember === true;
        exchanges = Array.isArray(data.history) ? data.history.slice(-8).filter(function (entry) {
          return entry && typeof entry.question === 'string' && typeof entry.answer === 'string';
        }) : [];
        messages.replaceChildren();
        addMessage('Hello. What would you like to understand about perimenopause or menopause?', 'bot');
        exchanges.forEach(function (entry) { addMessage(entry.question, 'user'); addMessage(entry.answer, 'bot'); });
        document.getElementById('ask-memory-label').textContent = 'Remember this chat in my account';
        document.getElementById('ask-memory-note').textContent = 'Optional. Saves up to eight exchanges for 30 days so you can return after signing in. Turn it off to remove the saved chat.';
        status.textContent = exchanges.length ? 'Your saved chat is ready. Ask a follow-up, or clear it to start fresh.' : '';
      }
    } catch (error) { status.textContent = error.message; }
    finally { send.disabled = false; remember.disabled = false; clear.disabled = false; }
  })();

  remember.addEventListener('change', saveHistory);
  clear.addEventListener('click', async function () {
    if (busy) return;
    exchanges = [];
    messages.replaceChildren();
    actions.replaceChildren();
    addMessage('Hello. What would you like to understand about perimenopause or menopause?', 'bot');
    status.textContent = 'Chat cleared.';
    await saveHistory();
    input.focus({ preventScroll: true });
  });

  function addAnswerActions(data) {
    actions.replaceChildren();
    if (data.emailToken) {
      var section = document.createElement('section');
      section.className = 'ask-save';
      var prompt = document.createElement('p');
      prompt.className = 'ask-save-prompt';
      prompt.textContent = data.blog
        ? 'Want to keep this? Get a copy of this answer, plus a deeper guide on what can help, sent to your inbox'
        : 'Want to keep this? Get a copy of this answer sent to your inbox';
      var note = document.createElement('p');
      note.className = 'ask-action-note';
      note.textContent = data.blog ? 'Includes: ' + data.blog.title : 'We don’t have a matching guide for this question yet.';
      var emailForm = document.createElement('form');
      emailForm.className = 'ask-email-form';
      var label = document.createElement('label');
      label.textContent = 'Email address';
      var email = document.createElement('input');
      email.type = 'email'; email.name = 'email'; email.autocomplete = 'email'; email.required = true; email.maxLength = 255;
      email.placeholder = 'you@example.com';
      label.appendChild(email);
      var button = document.createElement('button');
      button.type = 'submit'; button.className = 'btn btn-gold'; button.textContent = data.blog ? 'Email my answer + guide' : 'Email my answer';
      var consent = document.createElement('p');
      consent.className = 'ask-action-note';
      consent.textContent = 'By submitting, you request this email. This does not subscribe you to marketing emails.';
      var emailStatus = document.createElement('p');
      emailStatus.className = 'ask-email-status'; emailStatus.setAttribute('role', 'status');
      emailForm.append(label, button);
      section.append(prompt, note, emailForm, consent, emailStatus);
      emailForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (button.disabled || !emailForm.reportValidity()) return;
        button.disabled = true;
        emailStatus.textContent = 'Sending your answer…';
        try {
          var csrfResponse = await fetch('/api/csrf');
          if (!csrfResponse.ok) throw new Error('Please refresh the page and try again.');
          var csrf = await csrfResponse.json();
          var response = await fetch('/api/ask-empress/email-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf.csrfToken },
            body: JSON.stringify({ email: email.value.trim(), answerToken: data.emailToken, blogSlug: data.blog ? data.blog.slug : '' }),
          });
          var result = await response.json();
          if (!response.ok || !result.ok) throw new Error(result.error || 'We couldn’t email this answer. Please try again.');
          emailStatus.textContent = data.blog ? 'Your answer and guide are on their way to your inbox.' : 'Your answer is on its way to your inbox.';
          emailForm.remove();
        } catch (error) {
          emailStatus.textContent = error.message;
          button.disabled = false;
        }
      });
      actions.appendChild(section);
    }

    if (Array.isArray(data.products) && data.products.length) {
      var products = document.createElement('section');
      products.className = 'ask-products';
      var head = document.createElement('div'); head.className = 'ask-products-head';
      var heading = document.createElement('h2'); heading.textContent = 'Products to explore';
      var controls = document.createElement('div');
      var previous = document.createElement('button'); previous.type = 'button'; previous.textContent = '‹'; previous.setAttribute('aria-label', 'Previous products');
      var next = document.createElement('button'); next.type = 'button'; next.textContent = '›'; next.setAttribute('aria-label', 'Next products');
      controls.append(previous, next); head.append(heading, controls);
      var track = document.createElement('div'); track.className = 'ask-product-track'; track.tabIndex = 0; track.setAttribute('aria-label', 'Product recommendations');
      data.products.forEach(function (product) {
        if (!product || typeof product.name !== 'string' || typeof product.url !== 'string' || !product.url.startsWith('https://empressnaturals.co/products/')) return;
        var card = document.createElement('a'); card.className = 'ask-product'; card.href = product.url; card.target = '_blank'; card.rel = 'noopener';
        if (typeof product.image === 'string' && product.image.startsWith('/assets/shop/')) {
          var img = document.createElement('img'); img.src = product.image; img.alt = product.name; img.loading = 'lazy'; card.appendChild(img);
        }
        var name = document.createElement('strong'); name.textContent = product.name;
        var link = document.createElement('span'); link.textContent = 'View product ↗';
        card.append(name, link); track.appendChild(card);
      });
      var productNote = document.createElement('p'); productNote.className = 'ask-action-note';
      productNote.textContent = 'Optional Empress Naturals products for browsing. These are not a treatment recommendation.';
      products.append(head, track, productNote); actions.appendChild(products);
      function scroll(direction) {
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        track.scrollBy({ left: direction * 220, behavior: reducedMotion ? 'instant' : 'smooth' });
      }
      previous.addEventListener('click', function () { scroll(-1); });
      next.addEventListener('click', function () { scroll(1); });
    }
  }

  // Keep the HTML buttons in place so the shared reveal observer retains them.
  document.querySelectorAll('.prompt-grid .ask-suggestion').forEach(function (button) {
    var question = button.firstChild.textContent.trim();
    button.addEventListener('click', function () {
      if (busy) return;
      input.value = question;
      input.focus();
      input.scrollIntoView({ block: 'center' });
    });
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    await historyReady;
    var question = input.value.trim();
    if (busy || !question || !form.reportValidity()) return;
    busy = true;
    send.disabled = true;
    clear.disabled = true;
    input.readOnly = true;
    addMessage(question, 'user');
    status.textContent = 'Looking up the Empress library…';
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 55000);
    try {
      var response = await fetch('/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question, history: exchanges.slice(-8) }),
        signal: controller.signal,
      });
      var data = await response.json();
      if (!response.ok) {
        if (response.status === 429) throw new Error('You’ve reached the question limit. Please try again in a few minutes.');
        throw new Error(data.answer || data.response || 'Ask Empress is temporarily unavailable. Please try again shortly.');
      }
      var answer = data.answer || data.response;
      if (typeof answer !== 'string' || !answer.trim()) throw new Error('No answer was returned. Please try again.');
      addMessage(answer, 'bot');
      exchanges.push({ question: question, answer: answer });
      exchanges = exchanges.slice(-8);
      addAnswerActions(data);
      input.value = '';
      status.textContent = data.status === 'no_evidence' ? 'The library did not provide enough information for this question.' : '';
      await saveHistory();
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? 'This answer took too long. Your question is still here; please try again.' : error.message;
    } finally {
      clearTimeout(timer);
      busy = false;
      send.disabled = false;
      clear.disabled = false;
      input.readOnly = false;
      input.focus({ preventScroll: true });
    }
  });
})();
