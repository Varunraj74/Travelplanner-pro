/* TravelGPT — Main JS  2025 */
(function () {
  "use strict";

  /* ── Loading overlay ─────────────────────────────────────── */
  const form = document.getElementById("plannerForm");
  if (form) {
    // Inject overlay
    const overlay = document.createElement("div");
    overlay.id = "loadingOverlay";
    overlay.innerHTML = `
      <div class="spinner-ring"></div>
      <div class="loading-title">Crafting your travel plan…</div>
      <div class="loading-steps">
        <div class="loading-step done" id="ls1">✓ &nbsp;Analysing destination</div>
        <div class="loading-step active" id="ls2">✦ &nbsp;Generating itinerary with Watsonx.ai</div>
        <div class="loading-step" id="ls3">○ &nbsp;Building budget breakdown</div>
        <div class="loading-step" id="ls4">○ &nbsp;Finalising recommendations</div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Cycle loading steps for UX feel
    const steps = [overlay.querySelector('#ls2'), overlay.querySelector('#ls3'), overlay.querySelector('#ls4')];
    let si = 0;
    let stepTimer;

    form.addEventListener("submit", function () {
      const btn = document.getElementById("generateBtn");
      if (btn) {
        btn.querySelector(".btn-text").style.display    = "none";
        btn.querySelector(".btn-loading").style.display = "inline";
        btn.disabled = true;
      }
      overlay.classList.add("show");

      // Animate loading steps
      stepTimer = setInterval(function () {
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
          clearInterval(stepTimer);
        }
      }, 4000);
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
    const today = new Date().toISOString().split("T")[0];
    depInput.setAttribute("min", today);
    depInput.addEventListener("change", function () {
      if (retInput) retInput.setAttribute("min", depInput.value);
      if (retInput && retInput.value && retInput.value < depInput.value) {
        retInput.value = "";
      }
    });
  }

  /* ── Hero parallax on planner page ──────────────────────── */
  const hero = document.querySelector(".planner-hero");
  if (hero) {
    window.addEventListener("scroll", function () {
      const y = window.scrollY;
      hero.style.backgroundPositionY = Math.round(y * 0.3) + "px";
    }, { passive: true });
  }

  /* ── Subtle hover lift on form sections ─────────────────── */
  document.querySelectorAll(".form-section").forEach(function (s) {
    s.addEventListener("mouseenter", function () {
      s.style.transform = "translateY(-2px)";
    });
    s.addEventListener("mouseleave", function () {
      s.style.transform = "";
    });
  });

  /* ── Star field canvas behind hero ──────────────────────── */
  const heroEl = document.querySelector(".planner-hero, .result-hero");
  if (heroEl) {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;pointer-events:none;opacity:.4;z-index:0";
    heroEl.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let stars = [];

    function resize() {
      canvas.width  = heroEl.offsetWidth;
      canvas.height = heroEl.offsetHeight;
    }

    function initStars() {
      stars = [];
      for (let i = 0; i < 80; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.3,
          o: Math.random() * 0.7 + 0.3,
          speed: Math.random() * 0.3 + 0.1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(function (s) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + s.o + ")";
        ctx.fill();
        s.y -= s.speed;
        if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
      });
      requestAnimationFrame(draw);
    }

    resize();
    initStars();
    draw();
    window.addEventListener("resize", function () { resize(); initStars(); }, { passive: true });
  }

})();

/* ══════════════════════════════════════════════════════════════
   AI CHAT WIDGET
══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const toggle    = document.getElementById("chatToggle");
  const panel     = document.getElementById("chatPanel");
  const closeBtn  = document.getElementById("chatClose");
  const form      = document.getElementById("chatForm");
  const input     = document.getElementById("chatInput");
  const sendBtn   = document.getElementById("chatSend");
  const messages  = document.getElementById("chatMessages");
  const statusEl  = document.getElementById("chatStatus");

  if (!toggle || !panel) return;

  let isOpen    = false;
  let isBusy    = false;
  let history   = [];   // [{role, content}, ...]

  /* ── Open / close ─────────────────────────────────────── */
  function openChat() {
    isOpen = true;
    panel.classList.add("visible");
    panel.setAttribute("aria-hidden", "false");
    toggle.classList.add("open");
    toggle.setAttribute("aria-label", "Close travel assistant");
    document.getElementById("chatToggleIcon").textContent = "✕";
    input.focus();
    scrollToBottom();
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove("visible");
    panel.setAttribute("aria-hidden", "true");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-label", "Open travel assistant");
    document.getElementById("chatToggleIcon").textContent = "✈️";
    document.getElementById("chatToggleTxt").style.display = "";
  }

  toggle.addEventListener("click", function () {
    isOpen ? closeChat() : openChat();
  });
  closeBtn.addEventListener("click", closeChat);

  /* ── Quick suggestion chips ───────────────────────────── */
  document.querySelectorAll(".chip-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const q = btn.getAttribute("data-q");
      if (q) sendMessage(q);
      // Hide suggestions after first use
      const sugg = document.getElementById("chatSuggestions");
      if (sugg) sugg.style.display = "none";
    });
  });

  /* ── Form submit ──────────────────────────────────────── */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || isBusy) return;
    input.value = "";
    // Hide suggestions once user types
    const sugg = document.getElementById("chatSuggestions");
    if (sugg) sugg.style.display = "none";
    sendMessage(text);
  });

  /* ── Core send function ───────────────────────────────── */
  function sendMessage(text) {
    if (isBusy) return;
    appendMessage("user", text);
    history.push({ role: "user", content: text });

    isBusy = true;
    sendBtn.disabled = true;
    input.disabled   = true;
    statusEl.textContent = "Thinking…";

    const typingEl = appendTyping();
    scrollToBottom();

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: history.slice(-6) }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        typingEl.remove();
        const reply = data.reply || data.error || "Sorry, something went wrong.";
        appendMessage("bot", reply);
        history.push({ role: "assistant", content: reply });
        statusEl.textContent = "Powered by IBM Watsonx.ai";
      })
      .catch(function () {
        typingEl.remove();
        appendMessage("bot", "⚠️ Could not reach the server. Please check your connection.");
        statusEl.textContent = "Powered by IBM Watsonx.ai";
      })
      .finally(function () {
        isBusy           = false;
        sendBtn.disabled = false;
        input.disabled   = false;
        input.focus();
        scrollToBottom();
      });
  }

  /* ── DOM helpers ──────────────────────────────────────── */
  function appendMessage(role, text) {
    const wrap   = document.createElement("div");
    wrap.className = "chat-msg " + role;
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    // Render **bold** and line-breaks
    bubble.innerHTML = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function appendTyping() {
    const wrap   = document.createElement("div");
    wrap.className = "chat-msg bot typing";
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    return wrap;
  }

  function scrollToBottom() {
    setTimeout(function () {
      messages.scrollTop = messages.scrollHeight;
    }, 50);
  }

  /* ── Keyboard shortcut: Escape closes chat ────────────── */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) closeChat();
  });

})();
