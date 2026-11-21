  /* apply the saved theme before the page paints (no colour flash) */
  try { var t = localStorage.getItem("cc-theme"); if (t) document.documentElement.setAttribute("data-theme", t); } catch (e) {}

document.addEventListener('DOMContentLoaded', function () {
/* ---- Page wiring; message encryption and decryption run on the server ---- */
if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const choiceEl = $("choice"), msgEl = $("message"), shiftEl = $("shift");
  const resBox = $("result"), resText = $("text"), resTag = $("tag"), copyBtn = $("copy");
  const reverseBtn = $("reverse"), srText = $("srText");
  const chips = document.querySelectorAll(".chip");
  const reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lastOutput = "";
  let latestRequest = 0;

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  // ---------- themes ----------
  const THEMES = ["roman", "emerald", "royal", "obsidian"];
  const swatches = document.querySelectorAll(".sw");
  function applyTheme(name) {
    if (THEMES.indexOf(name) < 0) name = "roman";
    document.documentElement.setAttribute("data-theme", name);
    swatches.forEach(function (s) { s.setAttribute("aria-pressed", s.dataset.t === name ? "true" : "false"); });
  }
  swatches.forEach(function (s) {
    s.addEventListener("click", function () { applyTheme(s.dataset.t); store("cc-theme", s.dataset.t); });
  });
  applyTheme(load("cc-theme") || "roman");

  // ---------- sound + vibration (off by default) ----------
  const fbBtn = $("fb");
  let fbOn = load("cc-fb") === "1";
  let actx = null;
  function syncFb() {
    fbBtn.setAttribute("aria-pressed", fbOn ? "true" : "false");
    fbBtn.classList.toggle("on", fbOn);
  }
  function clickSound() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = "triangle"; o.frequency.value = 1500;
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      o.connect(g); g.connect(actx.destination);
      o.start(t); o.stop(t + 0.05);
    } catch (e) {}
  }
  function feedback() {
    if (!fbOn) return;
    try { if (navigator.vibrate) navigator.vibrate(7); } catch (e) {}
    clickSound();
  }
  fbBtn.addEventListener("click", function () {
    fbOn = !fbOn;
    store("cc-fb", fbOn ? "1" : "0");
    syncFb();
    if (fbOn) feedback();
  });
  syncFb();

  // ---------- choice chips ----------
  function syncChips() {
    chips.forEach((c) => c.classList.toggle("on", c.dataset.v === choiceEl.value.trim()));
  }
  chips.forEach((c) => c.addEventListener("click", () => {
    choiceEl.value = c.dataset.v;
    syncChips();
  }));
  choiceEl.addEventListener("input", syncChips);

  // ---------- Cipher wheel (display only; the cipher logic is above) ----------
  const STEP = 360 / 26;
  const CX = 180, CY = 194;

  function pt(r, deg) {
    const t = deg * Math.PI / 180;
    return [CX + r * Math.sin(t), CY - r * Math.cos(t)];
  }
  function f(n) { return n.toFixed(2); }
  function wedge(r1, r2, a0, a1) {
    const A = pt(r2, a0), B = pt(r2, a1), C = pt(r1, a1), D = pt(r1, a0);
    return "M" + f(A[0]) + " " + f(A[1]) + " A" + r2 + " " + r2 + " 0 0 1 " + f(B[0]) + " " + f(B[1]) +
           " L" + f(C[0]) + " " + f(C[1]) + " A" + r1 + " " + r1 + " 0 0 0 " + f(D[0]) + " " + f(D[1]) + " Z";
  }

  (function buildWheel() {
    let s = '<svg id="wheel" viewBox="0 0 360 374" role="slider" tabindex="0" aria-label="Shift value. Use the left and right arrow keys." aria-valuemin="0" aria-valuemax="25" aria-valuenow="0">';
    s += '<defs>' +
      '<linearGradient id="gBez" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--gold-xl)"/><stop offset=".35" style="stop-color:var(--gold)"/><stop offset=".65" style="stop-color:var(--gold-l)"/><stop offset="1" style="stop-color:var(--gold-d)"/></linearGradient>' +
      '<radialGradient id="gHub" cx="35%" cy="30%" r="80%"><stop offset="0" style="stop-color:var(--gold-xl)"/><stop offset=".6" style="stop-color:var(--gold)"/><stop offset="1" style="stop-color:var(--gold-d)"/></radialGradient>' +
      '<radialGradient id="gCore" cx="50%" cy="50%" r="60%"><stop offset="0" style="stop-color:var(--core-a)"/><stop offset="1" style="stop-color:var(--core-b)"/></radialGradient>' +
      '<radialGradient id="gSheen" cx="32%" cy="22%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".30"/><stop offset=".5" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></radialGradient>' +
      '<linearGradient id="gLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--gold-l)"/><stop offset="1" style="stop-color:var(--gold-d)"/></linearGradient>' +
      '<linearGradient id="gPtr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--ptr-a)"/><stop offset="1" style="stop-color:var(--ptr-b)"/></linearGradient>' +
      '<filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>';

    // bezel with tick marks and diamonds
    s += '<circle cx="' + CX + '" cy="' + CY + '" r="178" fill="url(#gBez)" style="stroke:var(--gold-xd)" stroke-width="1.5"/>';
    for (let i = 0; i < 52; i++) {
      const a = i * STEP / 2, lg = i % 2 === 0;
      const p = pt(lg ? 170 : 172.5, a), q = pt(lg ? 176 : 175, a);
      s += '<line x1="' + f(p[0]) + '" y1="' + f(p[1]) + '" x2="' + f(q[0]) + '" y2="' + f(q[1]) +
           '" style="stroke:var(--tick)" stroke-opacity=".7" stroke-width="' + (lg ? 1.3 : 0.8) + '"/>';
    }
    [90, 180, 270].forEach(function (a) {
      const p = pt(173, a);
      s += '<polygon points="' + f(p[0]) + ',' + f(p[1] - 5.5) + ' ' + f(p[0] + 4.2) + ',' + f(p[1]) + ' ' +
           f(p[0]) + ',' + f(p[1] + 5.5) + ' ' + f(p[0] - 4.2) + ',' + f(p[1]) + '" style="fill:var(--crimson-d);stroke:var(--gold-xl)" stroke-width="1"/>';
    });
    s += '<circle cx="' + CX + '" cy="' + CY + '" r="167" style="fill:var(--bez-dark)"/>';

    // outer ring: plain letters (fixed), one cell per letter
    s += '<g id="oWedges">';
    for (let i = 0; i < 26; i++) {
      s += '<path id="ow' + i + '" class="ow' + (i % 2 ? ' alt' : '') + '" d="' + wedge(128, 166, (i - 0.5) * STEP, (i + 0.5) * STEP) + '"/>';
    }
    s += '</g><g>';
    for (let i = 0; i < 26; i++) {
      s += '<text id="ot' + i + '" class="wo" x="' + CX + '" y="' + (CY - 147) + '" transform="rotate(' + f(i * STEP) + ' ' + CX + ' ' + CY +
           ')" text-anchor="middle" dominant-baseline="central">' + ABC[i] + '</text>';
    }
    s += '</g>';

    // inner ring: cipher letters (turns with the shift)
    s += '<g id="inner" style="transform-origin:' + CX + 'px ' + CY + 'px;transform:rotate(0deg)">' +
         '<circle cx="' + CX + '" cy="' + CY + '" r="126" fill="url(#gCore)"/><g id="iWedges">';
    for (let i = 0; i < 26; i++) {
      s += '<path id="iw' + i + '" class="iw' + (i % 2 ? ' alt' : '') + '" d="' + wedge(86, 125, (i - 0.5) * STEP, (i + 0.5) * STEP) + '"/>';
    }
    s += '</g><g>';
    for (let i = 0; i < 26; i++) {
      s += '<text id="it' + i + '" class="wi" x="' + CX + '" y="' + (CY - 105.5) + '" transform="rotate(' + f(i * STEP) + ' ' + CX + ' ' + CY +
           ')" text-anchor="middle" dominant-baseline="central">' + ABC[i] + '</text>';
    }
    s += '</g></g>';

    // rims, metallic sheen
    s += '<circle cx="' + CX + '" cy="' + CY + '" r="126.5" fill="none" stroke="url(#gBez)" stroke-width="4"/>';
    s += '<circle cx="' + CX + '" cy="' + CY + '" r="86" fill="none" stroke="url(#gBez)" stroke-width="3.5"/>';
    s += '<circle cx="' + CX + '" cy="' + CY + '" r="166" fill="url(#gSheen)" pointer-events="none"/>';

    // laurel wreath
    for (let k = 0; k < 9; k++) {
      const th = 168 - k * 15;
      [[68, 38], [62, -38]].forEach(function (pr, idx) {
        const t2 = th - idx * 6;
        [1, -1].forEach(function (side) {
          const q = side === 1 ? pt(pr[0], t2) : pt(pr[0], 360 - t2);
          const ang = side === 1 ? t2 + pr[1] : 360 - t2 - pr[1];
          s += '<ellipse cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" rx="9" ry="3.6" transform="rotate(' + f(ang) + ' ' + f(q[0]) + ' ' + f(q[1]) +
               ')" fill="url(#gLeaf)" style="stroke:var(--gold-xd)" stroke-width=".6"/>';
        });
      });
    }

    // hub
    s += '<circle cx="' + CX + '" cy="' + CY + '" r="46" fill="url(#gHub)" style="stroke:var(--gold-xl)" stroke-width="2"/>';
    s += '<circle cx="' + CX + '" cy="' + CY + '" r="40" fill="none" style="stroke:var(--gold-d)" stroke-width=".8"/>';
    s += '<text class="hubl" x="' + CX + '" y="' + (CY - 17) + '" text-anchor="middle" dominant-baseline="central">SHIFT</text>';
    s += '<text id="hub" class="hubn" x="' + CX + '" y="' + (CY + 9) + '" text-anchor="middle" dominant-baseline="central">0</text>';

    // pointer
    s += '<g id="ptr" style="transform-origin:' + CX + 'px 10px">' +
         '<path d="M166 2 L194 2 L180 36 Z" fill="url(#gPtr)" style="stroke:var(--gold-xl)" stroke-width="2" stroke-linejoin="round"/>' +
         '<circle cx="180" cy="11" r="3.4" style="fill:var(--gold-xl)"/></g>';

    s += '</svg><div id="grip" aria-hidden="true"></div>';
    $("wheelBox").innerHTML = s;
  })();

  const svg = $("wheel"), inner = $("inner"), ptr = $("ptr"), grip = $("grip");
  const hubNum = $("hub"), capEl = $("pv-cap"), egEl = $("eg");
  const oW = [], oT = [], iW = [], iT = [];
  for (let i = 0; i < 26; i++) {
    oW.push($("ow" + i)); oT.push($("ot" + i)); iW.push($("iw" + i)); iT.push($("it" + i));
  }

  function getEff() {
    const raw = shiftEl.value.trim();
    if (!/^[+-]?\d+$/.test(raw)) return 0;
    const value = BigInt(raw);
    return Number((value % 26n + 26n) % 26n);
  }

  let rot = 0, curEff = 0, tickReady = false;

  function tick() {   // ratchet "click": pointer kick + optional sound / vibration
    feedback();
    if (reduceMotion || !ptr.animate) return;
    ptr.animate(
      [{ transform: "rotate(-14deg)" }, { transform: "rotate(5deg)", offset: 0.6 }, { transform: "rotate(0deg)" }],
      { duration: 220, easing: "ease-out" });
  }
  function spinWheel() {   // one full turn, landing on the current shift
    if (reduceMotion || !inner.animate) return;
    inner.animate(
      [{ transform: "rotate(" + (rot - 360) + "deg)" }, { transform: "rotate(" + rot + "deg)" }],
      { duration: 1100, easing: "cubic-bezier(.2,.8,.25,1)" });
  }

  function mark(list, i, cls) { list[i].classList.add(cls); }

  function drawWheel() {
    const eff = getEff();

    // turn the inner ring by the shortest way, so 25 -> 0 does not unwind a whole turn
    let d = eff - curEff;
    if (d > 13) d -= 26;
    if (d < -13) d += 26;
    if (d !== 0) {
      rot -= d * STEP;
      curEff = eff;
      inner.style.transform = "rotate(" + rot + "deg)";
      if (tickReady) tick();
    }

    const cr = choiceEl.value.trim();
    const dec = cr !== "" && Number(cr) === 2;

    for (let i = 0; i < 26; i++) {
      oW[i].classList.remove("w-hl", "w-key"); iW[i].classList.remove("w-hl", "w-key");
      oT[i].classList.remove("t-hl", "t-key"); iT[i].classList.remove("t-hl", "t-key");
    }

    // letters used in the message
    const used = new Set();
    for (const ch of msgEl.value) {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90) used.add(c - 65);
      else if (c >= 97 && c <= 122) used.add(c - 97);
    }
    used.forEach(function (k) {
      const oi = dec ? (k - eff + 26) % 26 : k;      // outer ring = plain letter
      const ii = dec ? k : (k + eff) % 26;           // inner ring = cipher letter
      mark(oW, oi, "w-hl"); mark(oT, oi, "t-hl");
      mark(iW, ii, "w-hl"); mark(iT, ii, "t-hl");
    });

    // the pair under the pointer: A (outer) and what it becomes (inner)
    mark(oW, 0, "w-key"); mark(oT, 0, "t-key");
    mark(iW, eff, "w-key"); mark(iT, eff, "t-key");
    oW[0].parentNode.appendChild(oW[0]);
    iW[eff].parentNode.appendChild(iW[eff]);

    hubNum.textContent = eff;
    svg.setAttribute("aria-valuenow", eff);
    capEl.textContent = "Shift " + eff + " · " + (dec ? "decrypting (inner ring to outer ring)" : "encrypting (outer ring to inner ring)");
    const sh = dec ? (26 - eff) % 26 : eff;
    egEl.textContent = "A becomes " + ABC[sh] + "   |   Z becomes " + ABC[(25 + sh) % 26];

  }

  // message accepts letters only: numbers are removed and an alert is shown
  const msgAlert = $("msgAlert");
  let alertTimer = null;
  function flagNumbers() {
    msgAlert.classList.add("show");
    msgEl.classList.remove("bad");
    void msgEl.offsetWidth;
    msgEl.classList.add("bad");
    clearTimeout(alertTimer);
    alertTimer = setTimeout(function () {
      msgAlert.classList.remove("show");
      msgEl.classList.remove("bad");
    }, 3500);
  }
  msgEl.addEventListener("input", function () {
    const v = msgEl.value;
    if (!/\p{Nd}/u.test(v)) return;
    const pos = msgEl.selectionStart === null ? v.length : msgEl.selectionStart;
    const keep = v.slice(0, pos).replace(/\p{Nd}/gu, "").length;   // keep the cursor where it was
    msgEl.value = v.replace(/\p{Nd}/gu, "");
    try { msgEl.setSelectionRange(keep, keep); } catch (err) {}
    flagNumbers();
  });
  msgEl.addEventListener("input", drawWheel);
  shiftEl.addEventListener("input", drawWheel);
  choiceEl.addEventListener("input", drawWheel);
  chips.forEach(function (c) { c.addEventListener("click", drawWheel); });

  // tap an outer letter: A becomes that letter
  oW.forEach(function (w, i) {
    w.addEventListener("click", function () { shiftEl.value = String(i); drawWheel(); });
  });

  // drag the inner ring to set the shift (mouse and touch)
  let drag = null;
  function angleOf(e) {
    const r = svg.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * (CY / 374);
    return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
  }
  grip.addEventListener("pointerdown", function (e) {
    drag = { prev: angleOf(e), acc: 0, start: getEff() };
    svg.classList.add("drag");
    grip.classList.add("drag");
    try { grip.setPointerCapture(e.pointerId); } catch (err) {}
    try { svg.focus({ preventScroll: true }); } catch (err) {}
    e.preventDefault();
  });
  grip.addEventListener("pointermove", function (e) {
    if (!drag) return;
    const a = angleOf(e);
    let d = a - drag.prev;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    drag.prev = a;
    drag.acc += d;
    const eff = (((drag.start - Math.round(drag.acc / STEP)) % 26) + 26) % 26;
    if (eff !== getEff()) { shiftEl.value = eff; drawWheel(); }
  });
  function endDrag() { drag = null; svg.classList.remove("drag"); grip.classList.remove("drag"); }
  grip.addEventListener("pointerup", endDrag);
  grip.addEventListener("pointercancel", endDrag);

  // arrow keys turn the wheel too
  svg.addEventListener("keydown", function (e) {
    let step = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") step = 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") step = -1;
    else return;
    e.preventDefault();
    shiftEl.value = (getEff() + step + 26) % 26;
    drawWheel();
  });

  drawWheel();
  tickReady = true;

  // intro: the wheel spins once when it first comes into view
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(function (entries) {
      if (entries.some(function (en) { return en.isIntersecting; })) { spinWheel(); io.disconnect(); }
    }, { threshold: 0.45 });
    io.observe(svg);
  }

  // ---------- result box ----------
  let revealRaf = 0;
  // letters of the answer "decode" from random letters, left to right (display only; lastOutput is set instantly)
  function setResultText(text, animate) {
    cancelAnimationFrame(revealRaf);
    if (!animate || reduceMotion) { resText.textContent = text; return; }
    const head = text.indexOf("Result: ") === 0 ? "Result: " : "";
    const chars = Array.from(text.slice(head.length));
    const dur = Math.min(1000, 260 + chars.length * 40);
    const t0 = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - t0) / dur);
      const done = Math.floor(p * chars.length);
      let out = head;
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (i < done || !/[A-Za-z]/.test(c)) out += c;
        else {
          const r = ABC[Math.floor(Math.random() * 26)];
          out += (c >= "a" && c <= "z") ? r.toLowerCase() : r;
        }
      }
      resText.textContent = out;
      if (p < 1) revealRaf = requestAnimationFrame(frame);
      else resText.textContent = text;
    }
    revealRaf = requestAnimationFrame(frame);
  }

  function show(kind, tag, text) {
    resBox.className = "result " + kind;
    resTag.textContent = tag;
    srText.textContent = text;
    setResultText(text, kind === "ok");
    void resBox.offsetWidth;
    resBox.classList.add("pop");
    resBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function doRun() {
    const requestId = ++latestRequest;
    const choiceRaw = choiceEl.value.trim();
    const shiftRaw = shiftEl.value.trim();
    const message = msgEl.value;

    if (choiceRaw !== "1" && choiceRaw !== "2") {
      lastOutput = "";
      show("err", "Check input", "Invalid choice. Choose Encrypt (1) or Decrypt (2).");
      return;
    }
    if (!/^[+-]?\d+$/.test(shiftRaw)) {
      lastOutput = "";
      show("err", "Check input", "Invalid shift. Enter a whole number, such as 3 or -3.");
      return;
    }

    const choice = Number(choiceRaw);
    const endpoint = choice === 1 ? "/api/encrypt" : "/api/decrypt";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, shift: shiftRaw }),
      });
      const data = await response.json();
      if (requestId !== latestRequest) return;

      if (!response.ok || data.success !== true || typeof data.result !== "string") {
        lastOutput = "";
        const errorText = typeof data.error === "string" ? data.error : "The server could not process the request. Check your inputs and try again.";
        const errorTag = response.status === 400 || response.status === 413 ? "Check input" : "Error";
        show("err", errorTag, errorText);
        return;
      }

      lastOutput = data.result;
      reverseBtn.textContent = choice === 1 ? "Decrypt this" : "Encrypt this";
      show("ok", "Output", "Result: " + data.result);
      spinWheel();
    } catch (err) {
      if (requestId !== latestRequest) return;
      lastOutput = "";
      show("err", "Error", "Could not connect to the local server. Make sure it is running and try again.");
    }
  }

  // Run works on button click and on Enter key (no form submission needed)
  $("run").addEventListener("click", doRun);
  [choiceEl, msgEl, shiftEl].forEach(function (el) {
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); doRun(); }
    });
  });

  // run the answer back the other way (Encrypt -> Decrypt this, Decrypt -> Encrypt this)
  reverseBtn.addEventListener("click", function () {
    const wasEncrypt = Number(choiceEl.value.trim()) === 1;
    msgEl.value = lastOutput;
    choiceEl.value = wasEncrypt ? "2" : "1";
    syncChips();
    drawWheel();
    doRun();
  });

  copyBtn.addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(lastOutput);
      copyBtn.textContent = "Copied";
    } catch (err) {
      copyBtn.textContent = "Press Ctrl+C";
    }
    setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
  });
}
});
