/* TravelGPT — Main JS  2025 */
(function () {
  "use strict";

  /* ── Loading overlay (planner page only) ─────────────────── */
  const plannerForm = document.getElementById("plannerForm");
  if (plannerForm) {
    const overlay = document.createElement("div");
    overlay.id = "loadingOverlay";
    overlay.innerHTML = `
      <div class="spinner-ring"></div>
      <div class="loading-title">Crafting your travel plan…</div>
      <div class="loading-steps">
        <div class="loading-step done"   id="ls1">✓  Analysing destination</div>
        <div class="loading-step active" id="ls2">✦  Generating itinerary with Watsonx.ai</div>
        <div class="loading-step"        id="ls3">○  Building budget breakdown</div>
        <div class="loading-step"        id="ls4">○  Finalising recommendations</div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Always hide overlay on page load (handles browser back-button cache)
    overlay.classList.remove("show");

    const steps = [overlay.querySelector("#ls2"), overlay.querySelector("#ls3"), overlay.querySelector("#ls4")];
    let si = 0;

    plannerForm.addEventListener("submit", function () {
      const btn = document.getElementById("generateBtn");
      if (btn) {
        btn.querySelector(".btn-text").style.display    = "none";
        btn.querySelector(".btn-loading").style.display = "inline";
        btn.disabled = true;
      }
      overlay.classList.add("show");
      const timer = setInterval(function () {
        if (si < steps.length) {
          steps[si].classList.remove("active");
          steps[si].classList.add("done");
          steps[si].textContent = "✓  " + steps[si].textContent.replace(/^[○✦✓]\s+/, "");
          si++;
          if (si < steps.length) {
            steps[si].classList.add("active");
            steps[si].textContent = "✦  " + steps[si].textContent.replace(/^○\s+/, "");
          }
        } else {
          clearInterval(timer);
        }
      }, 4000);
    });

    // Hide overlay when navigating back to the page
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) {
        overlay.classList.remove("show");
        if (document.getElementById("generateBtn")) {
          document.getElementById("generateBtn").disabled = false;
        }
      }
    });
  }

  /* ── Flash auto-dismiss ──────────────────────────────────── */
  document.querySelectorAll(".flash").forEach(function (el) {
    setTimeout(function () {
      el.style.transition = "opacity .5s, transform .5s";
      el.style.opacity = "0";
      el.style.transform = "translateY(-8px)";
      setTimeout(function () { el.remove(); }, 500);
    }, 5000);
  });

  /* ── Date validation ─────────────────────────────────────── */
  const depInput = document.getElementById("departure_date");
  const retInput = document.getElementById("return_date");
  if (depInput) {
    depInput.setAttribute("min", new Date().toISOString().split("T")[0]);
    depInput.addEventListener("change", function () {
      if (retInput) {
        retInput.setAttribute("min", depInput.value);
        if (retInput.value && retInput.value < depInput.value) retInput.value = "";
      }
    });
  }

  /* ── Hero parallax ───────────────────────────────────────── */
  const hero = document.querySelector(".planner-hero");
  if (hero) {
    window.addEventListener("scroll", function () {
      hero.style.backgroundPositionY = Math.round(window.scrollY * 0.3) + "px";
    }, { passive: true });
  }

  /* ── Form section hover lift ─────────────────────────────── */
  document.querySelectorAll(".form-section").forEach(function (s) {
    s.addEventListener("mouseenter", function () { s.style.transform = "translateY(-2px)"; });
    s.addEventListener("mouseleave", function () { s.style.transform = ""; });
  });

  /* ── Star field on hero (non-blocking RAF, stops when off-screen) ── */
  var heroEl = document.querySelector(".planner-hero, .result-hero");
  if (heroEl) {
    var canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;pointer-events:none;opacity:.35;z-index:0;";
    heroEl.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var stars = [], rafId = null, active = true;

    function resizeCanvas() {
      canvas.width  = heroEl.offsetWidth;
      canvas.height = heroEl.offsetHeight;
    }
    function initStars() {
      stars = [];
      for (var i = 0; i < 60; i++) {
        stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                     r: Math.random() * 1.2 + 0.3, o: Math.random() * 0.6 + 0.2,
                     speed: Math.random() * 0.25 + 0.08 });
      }
    }
    function drawStars() {
      if (!active) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(function (s) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + s.o + ")";
        ctx.fill();
        s.y -= s.speed;
        if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
      });
      rafId = requestAnimationFrame(drawStars);
    }
    // Stop animation when page is hidden (saves CPU, avoids blocking)
    document.addEventListener("visibilitychange", function () {
      active = !document.hidden;
      if (active && !rafId) drawStars();
    });
    window.addEventListener("pagehide", function () { active = false; });

    resizeCanvas(); initStars(); drawStars();
    window.addEventListener("resize", function () { resizeCanvas(); initStars(); }, { passive: true });
  }

})();


/* ═══════════════════════════════════════════════════════════
   AI CHAT WIDGET (floating bubble on all pages)
═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var toggle   = document.getElementById("chatToggle");
  var panel    = document.getElementById("chatPanel");
  var closeBtn = document.getElementById("chatClose");
  var form     = document.getElementById("chatForm");
  var input    = document.getElementById("chatInput");
  var sendBtn  = document.getElementById("chatSend");
  var messages = document.getElementById("chatMessages");
  var statusEl = document.getElementById("chatStatus");

  if (!toggle || !panel) return;

  var isOpen = false, isBusy = false, history = [];

  function openChat() {
    isOpen = true;
    panel.classList.add("visible");
    panel.setAttribute("aria-hidden", "false");
    toggle.classList.add("open");
    document.getElementById("chatToggleIcon").textContent = "✕";
    input.focus();
    scrollBottom();
  }
  function closeChat() {
    isOpen = false;
    panel.classList.remove("visible");
    panel.setAttribute("aria-hidden", "true");
    toggle.classList.remove("open");
    document.getElementById("chatToggleIcon").textContent = "✈️";
    var txt = document.getElementById("chatToggleTxt");
    if (txt) txt.style.display = "";
  }

  toggle.addEventListener("click", function () { isOpen ? closeChat() : openChat(); });
  if (closeBtn) closeBtn.addEventListener("click", closeChat);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen) closeChat(); });

  /* Quick chips */
  document.querySelectorAll(".chip-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var q = btn.getAttribute("data-q");
      if (q && !isBusy) {
        sendMsg(q);
        var sugg = document.getElementById("chatSuggestions");
        if (sugg) sugg.style.display = "none";
      }
    });
  });

  /* Form submit */
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text || isBusy) return;
      input.value = "";
      var sugg = document.getElementById("chatSuggestions");
      if (sugg) sugg.style.display = "none";
      sendMsg(text);
    });
  }

  function sendMsg(text) {
    if (isBusy) return;
    appendBubble("user", text);
    history.push({ role: "user", content: text });
    isBusy = true;
    sendBtn.disabled = true;
    input.disabled   = true;
    if (statusEl) statusEl.textContent = "Thinking…";
    var typing = appendTyping();
    scrollBottom();

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: history.slice(-6) }),
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      typing.remove();
      var reply = data.reply || data.error || "Sorry, something went wrong.";
      appendBubble("bot", reply);
      history.push({ role: "assistant", content: reply });
      if (statusEl) statusEl.textContent = "Powered by IBM Watsonx.ai";
    })
    .catch(function () {
      typing.remove();
      appendBubble("bot", "⚠️ Could not reach the server. Please check your connection.");
      if (statusEl) statusEl.textContent = "Powered by IBM Watsonx.ai";
    })
    .finally(function () {
      isBusy = false;
      sendBtn.disabled = false;
      input.disabled   = false;
      input.focus();
      scrollBottom();
    });
  }

  function appendBubble(role, text) {
    var wrap = document.createElement("div");
    wrap.className = "chat-msg " + role;
    var bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.innerHTML = text
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
      .replace(/\n/g,"<br/>");
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    scrollBottom();
    return wrap;
  }
  function appendTyping() {
    var wrap = document.createElement("div");
    wrap.className = "chat-msg bot typing";
    wrap.innerHTML = '<div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    messages.appendChild(wrap);
    return wrap;
  }
  function scrollBottom() {
    setTimeout(function () { messages.scrollTop = messages.scrollHeight; }, 50);
  }

})();
