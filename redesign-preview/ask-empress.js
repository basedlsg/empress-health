(function () {
  'use strict';
  var form = document.getElementById('ask-form');
  if (!form) return;
  var input = document.getElementById('ask-question');
  var send = document.getElementById('ask-send');
  var messages = document.getElementById('ask-messages');
  var status = document.getElementById('ask-status');
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
    var question = input.value.trim();
    if (busy || !question || !form.reportValidity()) return;
    busy = true;
    send.disabled = true;
    input.readOnly = true;
    addMessage(question, 'user');
    status.textContent = 'Looking up the Empress library…';
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 55000);
    try {
      var response = await fetch('/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question }),
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
      input.value = '';
      status.textContent = data.status === 'no_evidence' ? 'The library did not provide enough information for this question.' : '';
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? 'This answer took too long. Your question is still here; please try again.' : error.message;
    } finally {
      clearTimeout(timer);
      busy = false;
      send.disabled = false;
      input.readOnly = false;
      input.focus({ preventScroll: true });
    }
  });
})();
