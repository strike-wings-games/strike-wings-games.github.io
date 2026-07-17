/* ============================================================
   STRIKE WINGS — interaction engine
   Static starfield · inertial scroll · masked reveals ·
   scroll-linked light · registry · reticle cursor
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var vh = window.innerHeight;

  if (prefersReduced) document.documentElement.classList.add("static");

  /* ---------- opening rite teardown ---------- */
  var intro = document.getElementById("intro");
  if (intro) setTimeout(function () {
    if (intro.parentNode) intro.parentNode.removeChild(intro);
  }, 3100);

  /* ---------- shared pointer state ---------- */
  var gmx = 0, gmy = 0, gpx = -9999, gpy = -9999, gsx = 0, gsy = 0, gHas = false;
  if (finePointer) {
    document.addEventListener("mousemove", function (e) {
      gpx = e.clientX;
      gpy = e.clientY;
      gmx = e.clientX / window.innerWidth - 0.5;
      gmy = e.clientY / vh - 0.5;
      gHas = true;
    });
  }

  window.addEventListener("resize", function () { vh = window.innerHeight; });

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ---------- starfield: drawn once, near-still ---------- */
  var sky = document.getElementById("sky");
  var ctx = sky.getContext("2d");
  var twinklers = [];

  function drawSky() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    sky.width = w * dpr;
    sky.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var count = Math.round((w * h) / 11000);
    twinklers = [];
    for (var i = 0; i < count; i++) {
      var x = Math.random() * w;
      var y = Math.random() * h;
      var r = Math.random() * 0.7 + 0.3;
      var a = Math.random() * 0.5 + 0.12;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220, 225, 235," + a + ")";
      ctx.fill();
      if (i % 45 === 0) twinklers.push({ x: x, y: y, r: r + 0.4, p: Math.random() * Math.PI * 2 });
    }
  }

  var resizeT;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(drawSky, 200);
  });
  drawSky();

  /* a handful of stars breathe, very slowly */
  if (!prefersReduced) {
    var lastTw = 0;
    (function breathe(t) {
      requestAnimationFrame(breathe);
      if (t - lastTw < 120) return;
      lastTw = t;
      for (var i = 0; i < twinklers.length; i++) {
        var s = twinklers[i];
        var a = 0.18 + 0.3 * (0.5 + 0.5 * Math.sin(t / 4200 + s.p));
        ctx.clearRect(s.x - s.r - 1, s.y - s.r - 1, (s.r + 1) * 2, (s.r + 1) * 2);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(225, 230, 240," + a + ")";
        ctx.fill();
      }
    })(0);
  }

  /* ---------- topbar ---------- */
  var topbar = document.getElementById("topbar");
  function onScrollBar() {
    topbar.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollBar, { passive: true });
  onScrollBar();

  /* ---------- inertial scroll (desktop, motion allowed) ---------- */
  var scroller = document.getElementById("scroller");
  var lerpOn = !prefersReduced && finePointer && window.innerWidth > 760 && scroller;
  var scrollCur = window.scrollY;

  if (lerpOn) {
    document.documentElement.classList.add("lerp");
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    var setBodyHeight = function () {
      document.body.style.height = scroller.offsetHeight + "px";
    };
    if (window.ResizeObserver) {
      new ResizeObserver(setBodyHeight).observe(scroller);
    } else {
      window.addEventListener("resize", setBodyHeight);
      window.addEventListener("load", setBodyHeight);
    }
    setBodyHeight();

    /* layout offset within the scroller, immune to the live transform */
    var layoutTop = function (el) {
      var y = 0;
      while (el && el !== scroller) {
        y += el.offsetTop;
        el = el.offsetParent;
      }
      return y;
    };

    /* anchors jump the native scroll; the lerp supplies the glide */
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href").slice(1);
      var el = id ? document.getElementById(id) : null;
      if (!id) { e.preventDefault(); window.scrollTo(0, 0); return; }
      if (!el) return;
      e.preventDefault();
      window.scrollTo(0, Math.max(0, layoutTop(el)));
    });

    /* honour a #hash on load — the browser can't reach inside the fixed shell */
    if (location.hash) {
      var hashEl = document.getElementById(location.hash.slice(1));
      if (hashEl) {
        var jump = function () {
          var y = Math.max(0, layoutTop(hashEl));
          window.scrollTo(0, y);
          scrollCur = y;
        };
        jump();
        window.addEventListener("load", function () { setTimeout(jump, 0); });
      }
    }
  }

  /* ---------- manifesto: words lit by scroll ---------- */
  var manifesto = document.querySelector("[data-wordfill]");
  var mWords = [];

  if (manifesto) {
    var splitWords = function (node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (kid) {
        if (kid.nodeType === 3) {
          var parts = kid.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement("span");
            s.className = "w";
            s.textContent = p;
            frag.appendChild(s);
          });
          node.replaceChild(frag, kid);
        } else if (kid.nodeType === 1) {
          splitWords(kid);
        }
      });
    };
    splitWords(manifesto);
    mWords = Array.prototype.slice.call(manifesto.querySelectorAll(".w"));
  }

  var mLit = -1;
  function fillManifesto() {
    if (!mWords.length || prefersReduced) return;
    var r = manifesto.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    var p = clamp01((vh * 0.88 - r.top) / (vh * 0.62));
    var lit = Math.round(p * mWords.length);
    if (lit === mLit) return;
    mLit = lit;
    for (var i = 0; i < mWords.length; i++) {
      mWords[i].classList.toggle("lit", i < lit);
    }
  }

  /* ---------- scroll-linked transforms, one RAF engine ---------- */
  var px = [];
  document.querySelectorAll("[data-parallax]").forEach(function (el) {
    px.push({ el: el, f: parseFloat(el.getAttribute("data-parallax")) || 0.1 });
  });

  var zooms = [];
  document.querySelectorAll("[data-zoom]").forEach(function (img) {
    var panel = img.closest(".panel");
    if (panel) zooms.push({ img: img, panel: panel });
  });

  /* ---------- scroll fly-bys: fighter wings streak across host sections ----------
     Each ship's crossing is compressed into a short, eased window of its host
     section's scroll progress (fast), staggered so the wing strafes past in
     sequence. RTL ships mirror via a negative X scale (handles the SSA art). */
  var CROSS_LEN = 0.22;          /* fraction of in-view scroll per ship — smaller = faster */
  var flybys = [];
  document.querySelectorAll(".flyby").forEach(function (layer) {
    var host = layer.parentElement;
    var dir = layer.getAttribute("data-fly") === "rtl" ? -1 : 1;
    var els = Array.prototype.slice.call(layer.querySelectorAll(".fighter"));
    var ships = els.map(function (el, i) {
      var img = el.querySelector("img");
      var sh = {
        el: el,
        band: parseFloat(el.getAttribute("data-band")) || 0.4,
        depth: parseFloat(el.getAttribute("data-depth")) || 1,
        idx: i,
        n: els.length,
        ok: !!(img && img.complete && img.naturalWidth)
      };
      if (img) {
        img.addEventListener("load", function () { sh.ok = true; });
        img.addEventListener("error", function () { el.style.display = "none"; });
      }
      return sh;
    });
    flybys.push({ host: host, dir: dir, ships: ships });
  });

  function flyEffects() {
    for (var f = 0; f < flybys.length; f++) {
      var fb = flybys[f];
      var r = fb.host.getBoundingClientRect();
      var active = r.bottom > -240 && r.top < vh + 240;
      var base = clamp01((vh - r.top) / (vh + r.height));
      var vw = window.innerWidth;
      for (var s = 0; s < fb.ships.length; s++) {
        var sh = fb.ships[s];
        var winStart = (sh.idx / sh.n) * (1 - CROSS_LEN);
        var local = (base - winStart) / CROSS_LEN;
        if (!sh.ok || !active || local <= 0 || local >= 1) {
          if (sh.el._on) { sh.el.style.opacity = "0"; sh.el.classList.remove("is-cross"); sh.el._on = false; }
          continue;
        }
        /* easeInOutQuad — slow at the edges, quick through the middle */
        var eased = local < 0.5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2;
        var spd = Math.sin(eased * Math.PI);             /* 0..1..0, peaks mid-cross */
        var w = sh.el.offsetWidth || 240;
        var margin = w * 1.25 + 80;
        var xL = -margin, xR = vw + margin;
        var x = fb.dir === 1 ? xL + (xR - xL) * eased : xR + (xL - xR) * eased;
        /* pin to a viewport band so the ship flies across the screen at a steady
           height regardless of how tall the host section is, plus a gentle rise */
        var y = sh.band * vh - r.top - spd * (46 * sh.depth);
        var bank = fb.dir * (-3 - 5 * sh.depth);                /* slight bank into travel */
        var sx = fb.dir * sh.depth * (1 + 0.12 * spd);          /* mirror (dir) + speed smear */
        var sy = sh.depth;
        sh.el.style.opacity = clamp01(spd * 1.9).toFixed(3);
        sh.el.style.transform =
          "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" +
          bank.toFixed(2) + "deg) scale(" + sx.toFixed(3) + "," + sy.toFixed(3) + ")";
        if (!sh.el._on) { sh.el.classList.add("is-cross"); sh.el._on = true; }
      }
    }
  }

  var heroInner = document.getElementById("hero-inner");
  var hero = document.getElementById("hero");
  var heroVisible = true;

  /* ---------- hero embers: light is art ---------- */
  var emberCanvas = document.getElementById("embers");
  var emberCtx = emberCanvas ? emberCanvas.getContext("2d") : null;
  var embers = [];
  var emberSprite = null;
  var eW = 2, eH = 2, eDpr = 1;

  function newEmber(fromBottom) {
    return {
      x: Math.random(),
      y: fromBottom ? 1.06 : Math.random(),
      v: 0.018 + Math.random() * 0.05,
      sway: 6 + Math.random() * 20,
      ph: Math.random() * Math.PI * 2,
      s: 2.5 + Math.random() * 9,
      a: 0.1 + Math.random() * 0.3
    };
  }

  function sizeEmbers() {
    if (!emberCanvas) return;
    eDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    eW = emberCanvas.clientWidth;
    eH = emberCanvas.clientHeight;
    emberCanvas.width = Math.max(2, Math.round(eW * eDpr));
    emberCanvas.height = Math.max(2, Math.round(eH * eDpr));
  }

  if (emberCtx && !prefersReduced) {
    emberSprite = document.createElement("canvas");
    emberSprite.width = emberSprite.height = 32;
    var eg = emberSprite.getContext("2d");
    var egr = eg.createRadialGradient(16, 16, 0, 16, 16, 16);
    egr.addColorStop(0, "rgba(255,216,156,1)");
    egr.addColorStop(0.35, "rgba(255,176,96,0.5)");
    egr.addColorStop(1, "rgba(255,150,60,0)");
    eg.fillStyle = egr;
    eg.fillRect(0, 0, 32, 32);
    sizeEmbers();
    window.addEventListener("resize", sizeEmbers);
    var emberCount = Math.round(Math.min(30, Math.max(16, window.innerWidth / 60)));
    for (var ei = 0; ei < emberCount; ei++) embers.push(newEmber(false));
  }

  function stepEmbers(dt, t) {
    if (!emberCtx || !embers.length) return;
    emberCtx.setTransform(eDpr, 0, 0, eDpr, 0, 0);
    emberCtx.clearRect(0, 0, eW, eH);
    for (var i = 0; i < embers.length; i++) {
      var em = embers[i];
      em.y -= em.v * dt;
      if (em.y < -0.06) { embers[i] = newEmber(true); continue; }
      var px = em.x * eW + Math.sin(t * 0.7 + em.ph) * em.sway;
      var py = em.y * eH;
      var al = em.a * (0.55 + 0.45 * Math.sin(t * 2.1 + em.ph * 2));
      if (al <= 0) continue;
      emberCtx.globalAlpha = al;
      emberCtx.drawImage(emberSprite, px - em.s, py - em.s, em.s * 2, em.s * 2);
    }
    emberCtx.globalAlpha = 1;
  }

  /* ---------- scorch trail: the cursor scars the painting ---------- */
  var scarCanvas = document.getElementById("scar");
  var scarCtx = scarCanvas ? scarCanvas.getContext("2d") : null;
  var scarSprite = null;
  var sW = 2, sH = 2, sDpr = 1;
  var scarPrev = null;
  var sparks = [];
  var lastHeroRect = null;

  function sizeScar() {
    if (!scarCanvas) return;
    sDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    sW = scarCanvas.clientWidth;
    sH = scarCanvas.clientHeight;
    scarCanvas.width = Math.max(2, Math.round(sW * sDpr));
    scarCanvas.height = Math.max(2, Math.round(sH * sDpr));
    if (scarCtx) scarCtx.setTransform(sDpr, 0, 0, sDpr, 0, 0);
  }

  if (scarCtx && !prefersReduced && finePointer) {
    scarSprite = document.createElement("canvas");
    scarSprite.width = scarSprite.height = 64;
    var sg = scarSprite.getContext("2d");
    var sgr = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
    sgr.addColorStop(0, "rgba(255,208,140,0.9)");
    sgr.addColorStop(0.35, "rgba(255,120,40,0.38)");
    sgr.addColorStop(1, "rgba(180,60,20,0)");
    sg.fillStyle = sgr;
    sg.fillRect(0, 0, 64, 64);
    sizeScar();
    window.addEventListener("resize", sizeScar);
  } else if (scarCanvas) {
    scarCanvas.style.display = "none";
  }

  function stepScar(dt, t) {
    if (!scarCtx || !scarSprite) return;
    var r = lastHeroRect;

    /* the burn heals slowly */
    scarCtx.globalCompositeOperation = "destination-out";
    scarCtx.globalAlpha = Math.min(1, dt * 0.45);
    scarCtx.fillStyle = "#000";
    scarCtx.fillRect(0, 0, sW, sH);
    scarCtx.globalCompositeOperation = "source-over";

    /* scorch along the cursor path */
    if (gHas && r && gpy >= r.top && gpy <= r.bottom && gpx >= r.left && gpx <= r.right) {
      var x = gpx - r.left, y = gpy - r.top;
      /* the held flame smoulders into the canvas */
      var ss = 7 + Math.random() * 9;
      scarCtx.globalAlpha = 0.4 + Math.random() * 0.25;
      scarCtx.drawImage(scarSprite,
        x - ss + (Math.random() - 0.5) * 4,
        y - ss + (Math.random() - 0.5) * 4,
        ss * 2, ss * 2);
      if (scarPrev) {
        var ddx = x - scarPrev[0], ddy = y - scarPrev[1];
        var dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist > 0.5) {
          var steps = Math.min(28, Math.max(1, Math.round(dist / 5)));
          for (var i = 1; i <= steps; i++) {
            var bx = scarPrev[0] + ddx * (i / steps) + (Math.random() - 0.5) * 6;
            var by = scarPrev[1] + ddy * (i / steps) + (Math.random() - 0.5) * 6;
            var bs = 12 + Math.random() * 22;
            scarCtx.globalAlpha = 0.5 + Math.random() * 0.4;
            scarCtx.drawImage(scarSprite, bx - bs, by - bs, bs * 2, bs * 2);
          }
          if (sparks.length < 48 && dist > 3) {
            sparks.push({
              x: x, y: y,
              vx: (Math.random() - 0.5) * 100,
              vy: -28 - Math.random() * 95,
              life: 0.5 + Math.random() * 0.7,
              t: 0
            });
          }
        }
      }
      scarPrev = [x, y];
    } else {
      scarPrev = null;
    }

    /* sparks thrown off the burn */
    for (var j = sparks.length - 1; j >= 0; j--) {
      var sp = sparks[j];
      sp.t += dt;
      if (sp.t >= sp.life) { sparks.splice(j, 1); continue; }
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 65 * dt;
      var k2 = 1 - sp.t / sp.life;
      scarCtx.globalAlpha = 1;
      scarCtx.fillStyle = "rgba(255,205,140," + (0.85 * k2).toFixed(3) + ")";
      scarCtx.fillRect(sp.x, sp.y, 1.7, 1.7);
    }
    scarCtx.globalAlpha = 1;
  }

  /* ---------- crest elements: fire for Terra, ash and sand for Mars.
       Particles pour only from the cursor's path over the shield. ---------- */
  var crestFires = [];
  var fireSprite = null, dustSprite = null, plumeSprite = null;

  function glowSprite(stops) {
    var c = document.createElement("canvas");
    c.width = c.height = 32;
    var g = c.getContext("2d");
    var gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    for (var i = 0; i < stops.length; i++) gr.addColorStop(stops[i][0], stops[i][1]);
    g.fillStyle = gr;
    g.fillRect(0, 0, 32, 32);
    return c;
  }

  if (!prefersReduced && finePointer) {
    var crestCards = document.querySelectorAll(".crest");
    if (crestCards.length) {
      fireSprite = glowSprite([[0, "rgba(255,214,150,0.95)"], [0.4, "rgba(255,130,45,0.4)"], [1, "rgba(180,60,20,0)"]]);
      dustSprite = glowSprite([[0, "rgba(215,185,140,0.5)"], [0.5, "rgba(180,150,110,0.18)"], [1, "rgba(150,120,85,0)"]]);
      /* sodium-yellow Consortium plume — lore colour 255,205,90 (the Ott-Stage D-line) */
      plumeSprite = glowSprite([[0, "rgba(255,230,160,0.8)"], [0.4, "rgba(255,205,90,0.32)"], [1, "rgba(220,150,40,0)"]]);
    }
    Array.prototype.forEach.call(crestCards, function (card, ci) {
      var ghost = card.querySelector(".crest-ghost");
      if (!ghost) return;
      var cv = document.createElement("canvas");
      cv.className = "crest-fire";
      ghost.appendChild(cv);
      var st = {
        canvas: cv,
        ctx: cv.getContext("2d"),
        mode: card.getAttribute("data-wake") || (ci === 0 ? "fire" : "ash"),
        parts: [],
        w: 2, h: 2,
        px: -1, py: -1,
        lx: -1, ly: -1,
        vx: 0, vy: 0,
        pending: 0,
        hit: null,
        ar: 1
      };

      /* alpha map of the crest so emission happens ON the shield only */
      var ghostImg = ghost.querySelector("img");
      function buildHit() {
        if (st.hit || !ghostImg || !ghostImg.naturalWidth) return;
        var hc = document.createElement("canvas");
        hc.width = hc.height = 64;
        var hg = hc.getContext("2d", { willReadFrequently: true });
        hg.drawImage(ghostImg, 0, 0, 64, 64);
        st.hit = hg.getImageData(0, 0, 64, 64).data;
        st.ar = ghostImg.naturalHeight / ghostImg.naturalWidth;
      }
      if (ghostImg) {
        /* lazy images can report complete=true with naturalWidth=0 before
           their request starts — try now AND on load (buildHit is idempotent) */
        buildHit();
        ghostImg.addEventListener("load", buildHit);
      }

      card.addEventListener("mousemove", function (e) {
        var r = cv.getBoundingClientRect();
        /* CSS-pixel coords — the buffer is sized in CSS pixels too */
        var x = e.clientX - r.left, y = e.clientY - r.top;
        var on = false;
        if (st.hit && x >= 0 && y >= 0 && x <= r.width && y <= r.height) {
          /* canvas -> ghost box (canvas overhangs the ghost by 18% a side) */
          var bu = (x / Math.max(1, r.width) - 0.13235) / 0.73529;
          var bv = (y / Math.max(1, r.height) - 0.13235) / 0.73529;
          /* ghost box -> object-fit:contain image area */
          var iu, iv, ar = st.ar;
          if (ar <= 1) { iu = bu; iv = (bv - (1 - ar) / 2) / ar; }
          else { iv = bv; iu = (bu - (1 - 1 / ar) / 2) * ar; }
          if (iu >= 0 && iu <= 1 && iv >= 0 && iv <= 1) {
            on = st.hit[(((iv * 63) | 0) * 64 + ((iu * 63) | 0)) * 4 + 3] > 40;
          }
        }
        if (!on) { st.px = -1; return; }
        if (st.px >= 0) {
          st.pending += Math.sqrt((x - st.px) * (x - st.px) + (y - st.py) * (y - st.py));
          st.vx = x - st.px;
          st.vy = y - st.py;
        }
        st.px = x;
        st.py = y;
      });
      card.addEventListener("mouseleave", function () { st.px = -1; st.pending = 0; });
      crestFires.push(st);
    });
  }

  function stepCrestFires(dt, t) {
    for (var c = 0; c < crestFires.length; c++) {
      var st = crestFires[c];
      if (st.pending < 1 && !st.parts.length) continue;
      var r = st.canvas.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) { st.pending = 0; continue; }
      var w = st.canvas.clientWidth, h = st.canvas.clientHeight;
      if (w !== st.w || h !== st.h) {
        st.w = Math.max(2, w);
        st.h = Math.max(2, h);
        st.canvas.width = st.w;
        st.canvas.height = st.h;
      }
      var x2 = st.ctx;
      x2.clearRect(0, 0, st.w, st.h);

      /* emission follows the pointer's movement, nothing else */
      if (st.px >= 0 && st.pending >= 1) {
        var mode = st.mode;
        var rate = mode === "fire" ? 4 : mode === "plume" ? 3 : 2.5;
        var n = Math.min(22, Math.round(st.pending / rate));
        for (var s = 0; s < n && st.parts.length < 140; s++) {
          var back = Math.random();
          var sx = st.px - st.vx * back + (Math.random() - 0.5) * 10;
          var sy = st.py - st.vy * back + (Math.random() - 0.5) * 10;
          if (mode === "fire") {
            st.parts.push({
              x: sx, y: sy,
              vx: (Math.random() - 0.5) * 26 + st.vx * 2,
              vy: -(40 + Math.random() * 95),
              g: -20,
              life: 0.55 + Math.random() * 0.9,
              t: 0,
              s: 4 + Math.random() * 10,
              kind: 1,
              ph: Math.random() * Math.PI * 2
            });
          } else if (mode === "plume") {
            /* billowing sodium gas — slow, buoyant, expanding */
            st.parts.push({
              x: sx, y: sy,
              vx: (Math.random() - 0.5) * 22 + st.vx * 1.2,
              vy: -(10 + Math.random() * 40),
              g: -10,
              life: 0.7 + Math.random() * 1.2,
              t: 0,
              s: 6 + Math.random() * 12,
              grow: 16 + Math.random() * 26,
              kind: 4,
              ph: Math.random() * Math.PI * 2
            });
            if (Math.random() < 0.32) {
              /* bright sodium spark off the burn */
              st.parts.push({
                x: sx, y: sy,
                vx: (Math.random() - 0.5) * 130 + st.vx * 2,
                vy: -(30 + Math.random() * 95),
                g: 70,
                life: 0.35 + Math.random() * 0.5,
                t: 0,
                s: 1.2 + Math.random() * 1.6,
                kind: 5,
                ph: 0
              });
            }
          } else {
            var grain = Math.random() < 0.72;
            st.parts.push({
              x: sx, y: sy,
              vx: (Math.random() - 0.5) * 40 + st.vx * 2.4,
              vy: grain ? 14 + Math.random() * 55 : (Math.random() - 0.5) * 16,
              g: grain ? 150 : 22,
              life: grain ? 0.7 + Math.random() * 1.0 : 1.1 + Math.random() * 1.2,
              t: 0,
              s: grain ? 1.3 + Math.random() * 2.1 : 8 + Math.random() * 14,
              kind: grain ? 2 : 3,
              ph: Math.random() * Math.PI * 2
            });
          }
        }
        st.pending = 0;
      }

      for (var p = st.parts.length - 1; p >= 0; p--) {
        var q2 = st.parts[p];
        q2.t += dt;
        if (q2.t >= q2.life) { st.parts.splice(p, 1); continue; }
        q2.vy += q2.g * dt;
        q2.x += (q2.vx + Math.sin(t * 2.2 + q2.ph) * 9) * dt;
        q2.y += q2.vy * dt;
        var k3 = 1 - q2.t / q2.life;
        if (q2.kind === 1) {
          /* embers off burning steel */
          x2.globalAlpha = Math.max(0, k3 * 0.9);
          x2.drawImage(fireSprite, q2.x - q2.s, q2.y - q2.s, q2.s * 2, q2.s * 2);
        } else if (q2.kind === 2) {
          /* falling sand grains */
          x2.globalAlpha = 1;
          x2.fillStyle = Math.random() < 0.5
            ? "rgba(212,182,140," + (0.68 * k3).toFixed(3) + ")"
            : "rgba(172,162,146," + (0.6 * k3).toFixed(3) + ")";
          x2.fillRect(q2.x, q2.y, q2.s, q2.s);
        } else if (q2.kind === 3) {
          /* drifting dust */
          x2.globalAlpha = Math.max(0, k3 * 0.4);
          x2.drawImage(dustSprite, q2.x - q2.s, q2.y - q2.s, q2.s * 2, q2.s * 2);
        } else if (q2.kind === 4) {
          /* sodium plume — additive, expanding glow */
          var ps = q2.s + (q2.grow || 0) * q2.t;
          x2.globalCompositeOperation = "lighter";
          x2.globalAlpha = Math.max(0, k3 * 0.5);
          x2.drawImage(plumeSprite, q2.x - ps, q2.y - ps, ps * 2, ps * 2);
          x2.globalCompositeOperation = "source-over";
        } else {
          /* bright sodium spark */
          x2.globalAlpha = 1;
          x2.fillStyle = "rgba(255,226,150," + (0.9 * k3).toFixed(3) + ")";
          x2.fillRect(q2.x, q2.y, q2.s, q2.s);
        }
      }
      x2.globalAlpha = 1;
    }
  }

  /* ---------- the premise face-off: Earth & Mars ----------
     Two worlds, cut live from the standoff painting, float in from the
     left and right fields as the band scrolls in, then hang breathing
     over the gulf while sparse tracer fire crosses between them. The
     cursor splits the crust — growing lava fissures on Earth, blue ice
     on Mars — and a tap does the same on touch. The flat painting stays
     in the DOM as the no-JS / reduced-motion fallback. */
  var foCanvas = document.getElementById("faceoff-fx");
  if (foCanvas && !prefersReduced) (function () {
    var fctx = foCanvas.getContext("2d");
    var wrap = foCanvas.parentElement;
    var FW = 2, FH = 2, FDPR = 1;

    var lavaSpr = glowSprite([[0, "rgba(255,214,150,0.95)"], [0.4, "rgba(255,130,45,0.4)"], [1, "rgba(180,60,20,0)"]]);
    var iceSpr = glowSprite([[0, "rgba(215,240,255,0.9)"], [0.4, "rgba(140,185,255,0.32)"], [1, "rgba(80,110,210,0)"]]);

    /* fractional centre + radius inside the source painting (fitted to the
       lit arcs of each disc, atmosphere glow included), plus palettes */
    var worlds = [
      { fx: 0.1705, fy: 0.494, fr: 0.1507, side: -1, ph: 0.7, mode: "lava",
        glow: [110, 160, 235], rim: [150, 195, 255], rimA: 0.05,
        core: [255, 228, 170], hot: [255, 140, 50], deep: [190, 70, 25] },
      { fx: 0.8852, fy: 0.5505, fr: 0.0748, side: 1, ph: 3.1, mode: "ice",
        glow: [235, 120, 70], rim: [255, 175, 115], rimA: 0.012,
        core: [220, 242, 255], hot: [135, 185, 255], deep: [70, 105, 190] }
    ];
    worlds.forEach(function (w) {
      w.spr = null; w.sr = 1;
      w.x = -9999; w.y = 0; w.R = 60; w.tx = 0; w.ty = 0; w.rot = 0; w.a = 0;
      w.heat = 0; w.kick = 0; w.cracks = []; w.parts = [];
      w.lastCrack = 0; w.acc = 99; w.px = -1; w.py = -1; w.still = 0;
    });

    /* cut a feather-edged disc out of the painting */
    function cutWorld(img, w) {
      var iw = img.naturalWidth, ih = img.naturalHeight;
      var r = w.fr * iw;
      var R = Math.ceil(r * 1.06);
      var c = document.createElement("canvas");
      c.width = c.height = R * 2;
      var g = c.getContext("2d");
      g.drawImage(img, Math.round(R - w.fx * iw), Math.round(R - w.fy * ih));
      /* tight feather: solid across the disc, gone just past the limb, so
         none of the painting's blue space background rides along */
      var m = g.createRadialGradient(R, R, r * 0.9, R, R, r * 1.03);
      m.addColorStop(0, "rgba(0,0,0,1)");
      m.addColorStop(0.55, "rgba(0,0,0,1)");
      m.addColorStop(1, "rgba(0,0,0,0)");
      g.globalCompositeOperation = "destination-in";
      g.fillStyle = m;
      g.fillRect(0, 0, R * 2, R * 2);
      w.spr = c;
      w.sr = r;
    }

    var foReady = false;
    var srcImg = new Image();
    srcImg.decoding = "async";
    srcImg.addEventListener("load", function () {
      for (var i = 0; i < worlds.length; i++) cutWorld(srcImg, worlds[i]);
      foReady = true;
    });
    srcImg.src = "assets/art/earth_mars_faceoff.jpg";

    function sizeFo() {
      FDPR = Math.min(window.devicePixelRatio || 1, 2);
      FW = wrap.clientWidth;
      FH = wrap.clientHeight;
      foCanvas.width = Math.max(2, Math.round(FW * FDPR));
      foCanvas.height = Math.max(2, Math.round(FH * FDPR));
      fctx.setTransform(FDPR, 0, 0, FDPR, 0, 0);
    }

    /* rest positions — Earth holds the left of the gulf, Mars the right;
       narrow screens stack them on a diagonal so both stay large */
    function layoutWorlds() {
      var e = worlds[0], m = worlds[1];
      if (FW < 640) {
        e.R = FW * 0.27; e.tx = FW * 0.28; e.ty = FH * 0.30;
        m.R = e.R * 0.52; m.tx = FW * 0.70; m.ty = FH * 0.74;
      } else {
        e.R = Math.min(FW * 0.16, FH * 0.42);
        e.tx = FW * 0.225; e.ty = FH * 0.54;
        m.R = e.R * 0.50; m.tx = FW * 0.79; m.ty = FH * 0.45;
      }
    }

    var foVis = false, fMx = -1, fMy = -1;
    new IntersectionObserver(function (e) { foVis = e[0].isIntersecting; }, { rootMargin: "120px" }).observe(foCanvas);

    wrap.addEventListener("pointermove", function (e) {
      var r = foCanvas.getBoundingClientRect();
      fMx = e.clientX - r.left;
      fMy = e.clientY - r.top;
    });
    wrap.addEventListener("pointerleave", function () { fMx = -1; fMy = -1; });
    /* a tap wounds the world directly — the hover for touch screens */
    wrap.addEventListener("pointerdown", function (e) {
      var r = foCanvas.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      for (var i = 0; i < worlds.length; i++) {
        var w = worlds[i];
        var dx = x - w.x, dy = y - w.y;
        if (dx * dx + dy * dy < w.R * w.R) {
          w.kick = 1;
          for (var n = 0; n < 3; n++) spawnCrack(w, dx, dy, tNow, true);
        }
      }
    });

    /* fissures live in planet-local units of R, so they ride the drift */
    function spawnCrack(w, dx, dy, t, burst) {
      if (w.cracks.length >= 14) return;
      var cr = Math.cos(-w.rot), sr = Math.sin(-w.rot);
      var u = (dx * cr - dy * sr) / w.R;
      var v = (dx * sr + dy * cr) / w.R;
      if (burst) { u += (Math.random() - 0.5) * 0.14; v += (Math.random() - 0.5) * 0.14; }
      var ang = Math.random() * Math.PI * 2;
      var main = [[u, v]], x = u, y = v, i;
      var n = 4 + (Math.random() * 4 | 0);
      for (i = 0; i < n; i++) {
        ang += (Math.random() - 0.5) * 1.2;
        var st = 0.09 + Math.random() * 0.09;
        x += Math.cos(ang) * st;
        y += Math.sin(ang) * st;
        if (x * x + y * y > 0.92) break;
        main.push([x, y]);
      }
      if (main.length < 2) return;
      var branches = [main];
      var bn = Math.random() < 0.78 ? (Math.random() < 0.35 ? 2 : 1) : 0;
      for (var b = 0; b < bn; b++) {
        var bi = 1 + (Math.random() * (main.length - 1) | 0);
        if (bi > main.length - 1) bi = main.length - 1;
        var bx = main[bi][0], by = main[bi][1];
        var ba = ang + (Math.random() - 0.5) * 2.4;
        var bp = [[bx, by]];
        var bm = 2 + (Math.random() * 3 | 0);
        for (i = 0; i < bm; i++) {
          ba += (Math.random() - 0.5) * 0.9;
          bx += Math.cos(ba) * 0.07;
          by += Math.sin(ba) * 0.07;
          if (bx * bx + by * by > 0.92) break;
          bp.push([bx, by]);
        }
        if (bp.length > 1) branches.push(bp);
      }
      w.cracks.push({
        br: branches,
        t0: t,
        grow: 0.35 + Math.random() * 0.3,
        life: 2.8 + Math.random() * 1.6,
        seed: Math.random() * 6.28
      });
      w.lastCrack = t;
    }

    /* trace the first u (0..1) of a polyline — cracks grow, not appear */
    function tracePartial(pts, u) {
      var last = (pts.length - 1) * u;
      var full = last | 0;
      fctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i <= full; i++) fctx.lineTo(pts[i][0], pts[i][1]);
      if (full < pts.length - 1) {
        var f = last - full;
        var a = pts[full], b = pts[full + 1];
        fctx.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f);
      }
    }

    function drawCracks(w, t) {
      if (!w.cracks.length) return;
      var lwGlow = Math.max(6 / w.R, 0.05) * (1 + 0.5 * w.heat);
      var lwHot = Math.max(2.2 / w.R, 0.018);
      var lwCore = Math.max(1 / w.R, 0.007);
      fctx.save();
      fctx.globalCompositeOperation = "lighter";
      fctx.translate(w.x, w.y);
      fctx.rotate(w.rot);
      fctx.scale(w.R, w.R);
      fctx.beginPath();
      fctx.arc(0, 0, 0.985, 0, Math.PI * 2);
      fctx.clip();
      fctx.lineCap = "round";
      fctx.lineJoin = "round";
      for (var c = w.cracks.length - 1; c >= 0; c--) {
        var ck = w.cracks[c];
        var age = t - ck.t0, k = age / ck.life;
        if (k >= 1) { w.cracks.splice(c, 1); continue; }
        var fade = Math.min(1, (1 - k) / 0.3) * w.a;
        var flick = w.mode === "lava"
          ? 0.72 + 0.28 * Math.sin(t * 12 + ck.seed * 7)
          : 0.86 + 0.14 * Math.sin(t * 6 + ck.seed * 5);
        var cool = 1 - 0.45 * k;
        for (var b = 0; b < ck.br.length; b++) {
          var gu = clamp01((age - (b ? 0.16 + b * 0.07 : 0)) / ck.grow);
          if (gu <= 0) continue;
          var pts = ck.br[b];
          fctx.beginPath();
          tracePartial(pts, gu);
          fctx.strokeStyle = "rgba(" + w.deep.join(",") + "," + (0.22 * fade).toFixed(3) + ")";
          fctx.lineWidth = lwGlow;
          fctx.stroke();
          fctx.beginPath();
          tracePartial(pts, gu);
          fctx.strokeStyle = "rgba(" + w.hot.join(",") + "," + (0.4 * fade * flick).toFixed(3) + ")";
          fctx.lineWidth = lwHot;
          fctx.stroke();
          fctx.beginPath();
          tracePartial(pts, gu);
          fctx.strokeStyle = "rgba(" + w.core.join(",") + "," + (0.9 * fade * flick * cool).toFixed(3) + ")";
          fctx.lineWidth = lwCore;
          fctx.stroke();
        }
      }
      fctx.restore();
    }

    /* embers rise off young lava fissures; ice sheds slow crystal motes */
    function spawnParts(w, t) {
      if (w.parts.length > 80 || !w.cracks.length) return;
      var sc = Math.max(0.5, w.R / 220);
      for (var c = 0; c < w.cracks.length; c++) {
        var ck = w.cracks[c];
        if ((t - ck.t0) / ck.life > 0.55) continue;
        if (Math.random() > (w.mode === "lava" ? 0.3 : 0.2)) continue;
        var pts = ck.br[0];
        var pt = pts[(Math.random() * pts.length) | 0];
        var cr = Math.cos(w.rot), sr = Math.sin(w.rot);
        var wx = w.x + (pt[0] * cr - pt[1] * sr) * w.R;
        var wy = w.y + (pt[0] * sr + pt[1] * cr) * w.R;
        if (w.mode === "lava") {
          w.parts.push({
            x: wx, y: wy,
            vx: (Math.random() - 0.5) * 18 * sc, vy: -(12 + Math.random() * 42) * sc,
            g: -14 * sc, s: (1.5 + Math.random() * 3.4) * sc,
            life: 0.5 + Math.random() * 0.8, t: 0, spark: Math.random() < 0.3
          });
        } else {
          w.parts.push({
            x: wx, y: wy,
            vx: (Math.random() - 0.5) * 14 * sc, vy: (4 + Math.random() * 14) * sc,
            g: 8 * sc, s: (1.2 + Math.random() * 2.6) * sc,
            life: 0.9 + Math.random() * 1.1, t: 0, spark: Math.random() < 0.25
          });
        }
      }
    }

    function stepParts(w, dt) {
      if (!w.parts.length) return;
      var spr = w.mode === "lava" ? lavaSpr : iceSpr;
      fctx.globalCompositeOperation = "lighter";
      for (var p = w.parts.length - 1; p >= 0; p--) {
        var q = w.parts[p];
        q.t += dt;
        if (q.t >= q.life) { w.parts.splice(p, 1); continue; }
        q.vy += q.g * dt;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        var k = (1 - q.t / q.life) * w.a;
        if (q.spark) {
          fctx.globalAlpha = k;
          fctx.fillStyle = w.mode === "lava" ? "rgba(255,216,150,0.9)" : "rgba(225,244,255,0.9)";
          fctx.fillRect(q.x, q.y, 1.4, 1.4);
        } else {
          fctx.globalAlpha = 0.5 * k;
          fctx.drawImage(spr, q.x - q.s, q.y - q.s, q.s * 2, q.s * 2);
        }
      }
      fctx.globalAlpha = 1;
      fctx.globalCompositeOperation = "source-over";
    }

    var tracers = [], nextShot = 0, tNow = 0, foLastT = 0;

    function spawnTracer(t) {
      var fromEarth = Math.random() < 0.5;
      tracers.push({
        a: worlds[fromEarth ? 0 : 1],
        b: worlds[fromEarth ? 1 : 0],
        ao: (Math.random() - 0.5) * 0.7,
        bo: (Math.random() - 0.5) * 0.7,
        t0: t, dur: 0.9 + Math.random() * 0.7,
        col: fromEarth ? [185, 212, 255] : [255, 188, 120],
        hit: false
      });
    }

    (function foLoop(now) {
      requestAnimationFrame(foLoop);
      if (!foVis || !foReady) { foLastT = now; return; }
      var t = now / 1000;
      var dt = Math.min(0.05, (now - foLastT) / 1000 || 0.016);
      foLastT = now;
      tNow = t;

      layoutWorlds();
      var band = wrap.getBoundingClientRect();
      var p = clamp01((vh - band.top) / (Math.min(vh, band.height) * 0.92));

      fctx.clearRect(0, 0, FW, FH);
      var i, w, arrived = true;

      for (i = 0; i < worlds.length; i++) {
        w = worlds[i];

        /* scroll-driven entrance from the side fields; Earth leads, Mars answers */
        var lp = i ? clamp01((p - 0.12) / 0.88) : p;
        var ent = lp * lp * (3 - 2 * lp);
        if (ent < 0.995) arrived = false;

        var inside = false;
        if (fMx >= 0) {
          var hdx = fMx - w.x, hdy = fMy - w.y;
          inside = hdx * hdx + hdy * hdy < w.R * w.R * 0.98;
        }
        w.heat += ((inside ? 1 : 0) - w.heat) * Math.min(1, dt * (inside ? 5 : 1.4));
        w.kick = Math.max(0, w.kick - dt * 2.2);

        /* float: entrance glide + slow bob, plus a shudder while wounded */
        var startX = w.side < 0 ? -w.R * 1.35 : FW + w.R * 1.35;
        var sh = w.R * (0.004 * w.heat + 0.02 * w.kick * w.kick);
        w.x = startX + (w.tx - startX) * ent
          + Math.sin(t * 0.27 + w.ph * 2) * w.R * 0.012 * ent
          + (Math.random() - 0.5) * sh;
        w.y = w.ty + Math.sin(t * 0.42 + w.ph) * w.R * 0.02 * ent
          + (Math.random() - 0.5) * sh;
        w.rot = Math.sin(t * 0.19 + w.ph) * 0.045 * ent;
        w.a = clamp01(ent * 1.5);
        if (w.a <= 0.01) continue;

        /* menacing breathing glow — hotter under the cursor */
        var slow = Math.sin(t * (i ? 0.5 : 0.4) + i * 2.1);
        var menace = Math.pow(0.5 + 0.5 * Math.sin(t * 0.16 + i * 3.0), 3);
        var ga = (0.03 + 0.03 * (0.5 + 0.5 * slow) + 0.06 * menace + 0.1 * w.heat) * w.a;
        var gr = w.R * (1.8 + 0.12 * slow + 0.3 * menace + 0.25 * w.heat);
        fctx.globalCompositeOperation = "lighter";
        var g = fctx.createRadialGradient(w.x, w.y, w.R * 0.5, w.x, w.y, gr);
        g.addColorStop(0, "rgba(" + w.glow.join(",") + "," + ga.toFixed(3) + ")");
        g.addColorStop(1, "rgba(" + w.glow.join(",") + ",0)");
        fctx.fillStyle = g;
        fctx.beginPath();
        fctx.arc(w.x, w.y, gr, 0, Math.PI * 2);
        fctx.fill();
        fctx.globalCompositeOperation = "source-over";

        /* the world itself */
        var s2 = w.R / w.sr;
        var half = w.spr.width / 2;
        fctx.save();
        fctx.globalAlpha = w.a;
        fctx.translate(w.x, w.y);
        fctx.rotate(w.rot);
        fctx.drawImage(w.spr, -half * s2, -half * s2, w.spr.width * s2, w.spr.width * s2);
        fctx.restore();
        fctx.globalAlpha = 1;

        /* thin atmosphere rim — Mars keeps it near zero at rest: a full ring
           around a mostly-dark limb reads as a cutout edge, not atmosphere */
        fctx.globalCompositeOperation = "lighter";
        var ra = (w.rimA + 0.1 * w.heat) * w.a;
        var rim = fctx.createRadialGradient(w.x, w.y, w.R * 0.82, w.x, w.y, w.R * 1.06);
        rim.addColorStop(0, "rgba(" + w.rim.join(",") + ",0)");
        rim.addColorStop(0.72, "rgba(" + w.rim.join(",") + "," + ra.toFixed(3) + ")");
        rim.addColorStop(1, "rgba(" + w.rim.join(",") + ",0)");
        fctx.fillStyle = rim;
        fctx.beginPath();
        fctx.arc(w.x, w.y, w.R * 1.06, 0, Math.PI * 2);
        fctx.fill();
        fctx.globalCompositeOperation = "source-over";

        drawCracks(w, t);
        spawnParts(w, t);
        stepParts(w, dt);
      }

      /* the cursor splits the crust while it lingers on a world */
      if (fMx >= 0) {
        for (i = 0; i < worlds.length; i++) {
          w = worlds[i];
          var cdx = fMx - w.x, cdy = fMy - w.y;
          if (cdx * cdx + cdy * cdy < w.R * w.R * 0.96) {
            if (w.px >= 0) w.acc += Math.abs(fMx - w.px) + Math.abs(fMy - w.py);
            w.px = fMx; w.py = fMy;
            w.still += dt;
            if ((w.acc > 26 || w.still > 0.5) && t - w.lastCrack > 0.09) {
              spawnCrack(w, cdx, cdy, t, false);
              w.acc = 0;
              w.still = 0;
            }
          } else { w.px = -1; w.still = 0; }
        }
      } else { worlds[0].px = worlds[1].px = -1; }

      /* sparse tracer fire once both worlds hold station */
      if (arrived && t > nextShot) {
        spawnTracer(t);
        nextShot = t + 1.6 + Math.random() * 2.6;
      }
      fctx.globalCompositeOperation = "lighter";
      for (i = tracers.length - 1; i >= 0; i--) {
        var tr = tracers[i], tk = (t - tr.t0) / tr.dur;
        if (tk >= 1.4) { tracers.splice(i, 1); continue; }
        var dir = tr.b.x > tr.a.x ? 1 : -1;
        var ax = tr.a.x + dir * tr.a.R * 0.94, ay = tr.a.y + tr.ao * tr.a.R * 0.6;
        var bx = tr.b.x - dir * tr.b.R * 0.94, by = tr.b.y + tr.bo * tr.b.R * 0.6;
        if (tk < 1) {
          var e2 = tk * tk * (3 - 2 * tk);
          var hx = ax + (bx - ax) * e2, hy = ay + (by - ay) * e2;
          var lk = Math.max(0, e2 - 0.13);
          var lx = ax + (bx - ax) * lk, ly = ay + (by - ay) * lk;
          var lg = fctx.createLinearGradient(lx, ly, hx, hy);
          lg.addColorStop(0, "rgba(" + tr.col.join(",") + ",0)");
          lg.addColorStop(1, "rgba(" + tr.col.join(",") + ",0.45)");
          fctx.strokeStyle = lg;
          fctx.lineWidth = 1.5;
          fctx.beginPath();
          fctx.moveTo(lx, ly);
          fctx.lineTo(hx, hy);
          fctx.stroke();
          var hg = fctx.createRadialGradient(hx, hy, 0, hx, hy, 5);
          hg.addColorStop(0, "rgba(" + tr.col.join(",") + ",0.85)");
          hg.addColorStop(1, "rgba(" + tr.col.join(",") + ",0)");
          fctx.fillStyle = hg;
          fctx.beginPath();
          fctx.arc(hx, hy, 5, 0, Math.PI * 2);
          fctx.fill();
        } else {
          if (!tr.hit) {
            /* the round lands: the far world shudders and cracks */
            tr.hit = true;
            tr.b.kick = Math.max(tr.b.kick, 0.4);
            if (Math.random() < 0.55) spawnCrack(tr.b, bx - tr.b.x, by - tr.b.y, t, true);
          }
          var fk = 1 - (tk - 1) / 0.4, fr = 8 + (1 - fk) * 14;
          var fg = fctx.createRadialGradient(bx, by, 0, bx, by, fr);
          fg.addColorStop(0, "rgba(" + tr.col.join(",") + "," + (0.4 * fk).toFixed(3) + ")");
          fg.addColorStop(1, "rgba(" + tr.col.join(",") + ",0)");
          fctx.fillStyle = fg;
          fctx.beginPath();
          fctx.arc(bx, by, fr, 0, Math.PI * 2);
          fctx.fill();
        }
      }
      fctx.globalCompositeOperation = "source-over";
    })(0);

    if (window.ResizeObserver) new ResizeObserver(sizeFo).observe(wrap);
    else window.addEventListener("resize", sizeFo);
    sizeFo();
  })();

  /* ---------- hero title: letters answer the cursor ---------- */
  var chs = [];
  var chFree = false;
  (function () {
    var title = document.querySelector(".hero-title");
    if (!title || prefersReduced || !finePointer) return;
    chs = Array.prototype.slice.call(title.querySelectorAll(".ch"));
    var ended = 0;
    title.addEventListener("animationend", function (e) {
      if (e.target.classList && e.target.classList.contains("ch")) {
        /* freeze the landed pose before detaching the animation,
           or the base translateY(118%) state snaps back */
        e.target.style.transform = "translateY(0)";
        e.target.style.animation = "none";
        ended++;
        if (ended >= chs.length) chFree = true;
      }
    });
  })();

  function liftLetters() {
    if (!chFree || !gHas) return;
    for (var i = 0; i < chs.length; i++) {
      var r = chs[i].getBoundingClientRect();
      var dx = gpx - (r.left + r.width / 2);
      var dy = gpy - (r.top + r.height / 2);
      var lift = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 230);
      lift *= lift;
      chs[i].style.transform = "translateY(" + (-9 * lift).toFixed(2) + "px)";
      chs[i].style.textShadow = lift > 0.02
        ? "0 0 " + (28 * lift).toFixed(0) + "px rgba(255,240,210," + (0.38 * lift).toFixed(3) + ")"
        : "";
    }
  }

  /* ---------- airframe survey: render -> phosphor schematic ---------- */
  var survey = document.getElementById("survey");
  var surveyPin = document.getElementById("survey-pin");
  var surveyRender = document.getElementById("survey-render");
  var surveyEdges = document.getElementById("survey-edges");
  var surveyScan = document.getElementById("survey-scan");
  var surveyImg = document.getElementById("survey-img");
  var surveyCanvas = document.getElementById("survey-canvas");
  var surveyLabels = [
    document.getElementById("survey-l1"),
    document.getElementById("survey-l2"),
    document.getElementById("survey-l3"),
    document.getElementById("survey-l4")
  ];
  var edgesBuilt = false;

  function buildEdges() {
    if (edgesBuilt || !surveyImg.naturalWidth) return;
    edgesBuilt = true;
    var maxW = 920;
    var scale = Math.min(1, maxW / surveyImg.naturalWidth);
    var w = Math.round(surveyImg.naturalWidth * scale);
    var h = Math.round(surveyImg.naturalHeight * scale);
    surveyCanvas.width = w;
    surveyCanvas.height = h;
    var c = surveyCanvas.getContext("2d", { willReadFrequently: true });
    c.drawImage(surveyImg, 0, 0, w, h);
    var d = c.getImageData(0, 0, w, h).data;
    var lum = new Float32Array(w * h);
    for (var i = 0; i < w * h; i++) {
      var o = i * 4;
      lum[i] = (0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2]) * (d[o + 3] / 255);
    }
    var out = c.createImageData(w, h);
    var od = out.data;
    for (var y = 1; y < h - 1; y++) {
      for (var x = 1; x < w - 1; x++) {
        var i0 = y * w + x;
        var gx = -lum[i0 - w - 1] - 2 * lum[i0 - 1] - lum[i0 + w - 1] + lum[i0 - w + 1] + 2 * lum[i0 + 1] + lum[i0 + w + 1];
        var gy = -lum[i0 - w - 1] - 2 * lum[i0 - w] - lum[i0 - w + 1] + lum[i0 + w - 1] + 2 * lum[i0 + w] + lum[i0 + w + 1];
        var m = Math.sqrt(gx * gx + gy * gy);
        var v = (m - 26) / 110;
        if (v > 0) {
          if (v > 1) v = 1;
          var p = i0 * 4;
          od[p] = Math.round(20 + 96 * v);
          od[p + 1] = Math.round(255 * v);
          od[p + 2] = Math.round(20 + 140 * v);
          od[p + 3] = Math.round(235 * v);
        }
      }
    }
    c.putImageData(out, 0, 0);
  }

  if (survey) {
    if (surveyImg.complete) buildEdges();
    surveyImg.addEventListener("load", buildEdges);
  }

  function surveyFx() {
    if (!survey) return;
    var r = survey.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    var travel = r.height - vh;
    if (travel <= 0) return;
    var pinY = Math.max(0, Math.min(-r.top, travel));
    surveyPin.style.transform = "translate3d(0," + pinY.toFixed(2) + "px,0)";
    var p = clamp01(-r.top / travel);
    var ps = clamp01((p - 0.08) / 0.74);
    var e = ps * ps * (3 - 2 * ps);
    surveyRender.style.clipPath = "inset(" + (e * 100).toFixed(2) + "% 0 0 0)";
    surveyEdges.style.clipPath = "inset(0 0 " + ((1 - e) * 100).toFixed(2) + "% 0)";
    surveyScan.style.top = (e * 100).toFixed(2) + "%";
    surveyScan.style.opacity = e > 0.004 && e < 0.996 ? 1 : 0;
    for (var i = 0; i < surveyLabels.length; i++) {
      surveyLabels[i].classList.toggle("is-on", p > 0.36 + i * 0.12);
    }
  }

  function scrollEffects() {
    var i, r, mid;
    for (i = 0; i < px.length; i++) {
      var p = px[i];
      r = p.el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) continue;
      mid = r.top + r.height / 2 - vh / 2;
      var isHeroArt = p.el.parentElement === hero;
      var ox = isHeroArt ? gsx * 18 : 0;
      var oy = isHeroArt ? gsy * 12 : 0;
      p.el.style.transform = "translate3d(" + ox.toFixed(2) + "px," + (-mid * p.f + oy).toFixed(2) + "px,0)";
    }
    for (i = 0; i < zooms.length; i++) {
      var z = zooms[i];
      r = z.panel.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      var v = clamp01((vh - r.top) / (vh + r.height));
      z.img.style.transform = "scale(" + (1.12 - 0.12 * v).toFixed(4) + ")";
    }
    if (hero && heroInner) {
      r = hero.getBoundingClientRect();
      lastHeroRect = r;
      heroVisible = r.bottom > 0;
      if (heroVisible) {
        var hp = clamp01(-r.top / (vh * 0.72));
        heroInner.style.opacity = (1 - hp * 0.95).toFixed(3);
        heroInner.style.transform = "translate3d(" + (gsx * -14).toFixed(2) + "px," + (-hp * 56 + gsy * -8).toFixed(2) + "px,0)";
      }
    }
    fillManifesto();
    surveyFx();
    flyEffects();
  }

  if (!prefersReduced) {
    var engT = 0;
    (function engine(now) {
      requestAnimationFrame(engine);
      var dt = Math.min(0.05, (now - engT) / 1000 || 0.016);
      engT = now;
      if (lerpOn) {
        var tgt = window.scrollY;
        scrollCur += (tgt - scrollCur) * 0.088;
        if (Math.abs(tgt - scrollCur) < 0.06) scrollCur = tgt;
        scroller.style.transform = "translate3d(0," + (-scrollCur).toFixed(2) + "px,0)";
      }
      gsx += (gmx - gsx) * 0.055;
      gsy += (gmy - gsy) * 0.055;
      scrollEffects();
      stepCrestFires(dt, now / 1000);
      if (heroVisible) {
        stepEmbers(dt, now / 1000);
        stepScar(dt, now / 1000);
        liftLetters();
      }
    })(0);
  }

  /* ---------- reveal on scroll ---------- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        runCounters(e.target);
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal").forEach(function (el) { revealObs.observe(el); });

  /* ---------- counters ---------- */
  function runCounters(scope) {
    var counts = scope.querySelectorAll ? scope.querySelectorAll(".count") : [];
    Array.prototype.forEach.call(counts, function (el) {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      var to = parseInt(el.getAttribute("data-to"), 10) || 0;
      if (prefersReduced) { el.textContent = to; return; }
      var t0 = null;
      var dur = 1200;
      (function tick(t) {
        if (!t0) t0 = t;
        var p = clamp01((t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(tick);
      })(performance.now());
    });
  }

  /* ---------- reticle cursor ---------- */
  var cursor = document.getElementById("cursor");
  if (cursor && finePointer && !prefersReduced) {
    document.documentElement.classList.add("has-cursor");
    var dot = cursor.querySelector(".cursor-dot");
    var ring = cursor.querySelector(".cursor-ring");
    var mx = -100, my = -100, rx = -100, ry = -100, shown = false;

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; cursor.classList.add("is-on"); rx = mx; ry = my; }
      dot.style.transform = "translate(" + (mx - 0) + "px," + (my - 0) + "px) translate(-50%,-50%)";
    });

    document.addEventListener("mouseleave", function () { cursor.classList.remove("is-on"); shown = false; });

    (function ringLoop() {
      requestAnimationFrame(ringLoop);
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) translate(-50%,-50%)";
    })();

    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest("a, button")) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest("a, button")) cursor.classList.remove("is-hover");
    });
  }

  /* ---------- ship registry — implementation moved to js/ships.js ---------- */
  if (false) {
  var SHIPS = [
    {
      id: "reaper", cls: "SPACE SUPERIORITY FIGHTER", name: "RP-1A REAPER",
      story: "The machine that ended an alliance. Drawn in 2113, built on Mars in 2180 — it wiped three Talons in its first field trial. A retired admiral threw his coffee cup at the screen.",
      spd: 84, arm: 72, shl: 80, pwr: 86
    },
    {
      id: "archfiend", cls: "ACE PRESTIGE FIGHTER", name: "AF-2 ARCHFIEND",
      story: "Twin gatlings, scatter packs, and a 350mm impact cannon that guts a frigate in one shot. Issued only to aces. The pulpits called it a civilization-ender. It is merely the most dangerous fighter humanity has built.",
      spd: 78, arm: 78, shl: 82, pwr: 96
    },
    {
      id: "talon", cls: "LINE FIGHTER", name: "SF-16D TALON",
      story: "The ship that turned the Halcyon Convulsion. Cheap, rugged, flown by the thousand on both sides. There is a Talon in the atrium of every Martian naval academy — it is the ship their great-grandparents flew home in.",
      spd: 70, arm: 66, shl: 62, pwr: 64
    },
    {
      id: "crusader", cls: "INNER-GUARD HEAVY FIGHTER", name: "1LSC CRUSADER",
      story: "Not a gram of Martian alloy, not a line of Halcyon firmware. Cockpit glass poured in Geneva, blessed in Rome. Every airframe consecrated before launch. The strongest fighter ever flown by a human being.",
      spd: 88, arm: 90, shl: 93, pwr: 91
    },
    {
      id: "wraith", cls: "STEALTH FIGHTER", name: "ST-1A WRAITH",
      story: "Flack cannon and a cloaking device. Invisible to missiles and hostile AI — until it fires, takes a hit, or runs dry. The most fun you can have in a ship, until you are found.",
      spd: 76, arm: 56, shl: 66, pwr: 72
    },
    {
      id: "headsman", cls: "TURRET FIGHTER", name: "LB-32B HEADSMAN",
      story: "The Alliance's answer to the Reaper: a dorsal 360° rotational turret on a heavy frame. It turns like a frigate. It does not need to turn — the gun does. Disliked by its pilots, feared by everyone else.",
      spd: 60, arm: 82, shl: 76, pwr: 80
    },
    {
      id: "marksman", cls: "RAIL SNIPER", name: "LR-13B MARKSMAN",
      story: "A rail cannon the length of the airframe, flown by the Order of Sable Vigil. Its kills are counted by target type, not number — one super carrier outranks a hundred fighters.",
      spd: 55, arm: 52, shl: 56, pwr: 90
    },
    {
      id: "roc", cls: "ABSORBER TESTBED", name: "X-27B ROC",
      story: "Designed to be shot. Incoming fire charges its weapons — the fighter gets stronger the more damage it takes, until its absorbers max out. Its pilots are called Black Jacks. Flying one is, literally, a gamble.",
      spd: 66, arm: 62, shl: 40, pwr: 78
    }
  ];

  var regViewport = document.getElementById("registry-viewport");
  var regImg = document.getElementById("registry-img");
  var regClass = document.getElementById("registry-class");
  var regName = document.getElementById("registry-name");
  var regStory = document.getElementById("registry-story");
  var bars = {
    spd: document.getElementById("stat-spd"),
    arm: document.getElementById("stat-arm"),
    shl: document.getElementById("stat-shl"),
    pwr: document.getElementById("stat-pwr")
  };
  var picker = document.getElementById("registry-picker");
  var current = 0;
  var cycleTimer = null;
  var userTouched = false;

  SHIPS.forEach(function (s, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.textContent = s.name.split(" ").slice(1).join(" ") || s.name;
    b.addEventListener("click", function () {
      userTouched = true;
      stopCycle();
      selectShip(i);
    });
    picker.appendChild(b);
  });

  var pickBtns = picker.querySelectorAll("button");

  function setBars(s) {
    bars.spd.style.width = s.spd + "%";
    bars.arm.style.width = s.arm + "%";
    bars.shl.style.width = s.shl + "%";
    bars.pwr.style.width = s.pwr + "%";
  }

  function scanline() {
    if (prefersReduced) return;
    regViewport.classList.remove("is-scanning");
    void regViewport.offsetWidth;
    regViewport.classList.add("is-scanning");
  }

  regViewport.addEventListener("animationend", function () {
    regViewport.classList.remove("is-scanning");
  });

  function selectShip(i) {
    current = i;
    var s = SHIPS[i];
    pickBtns.forEach(function (b, j) {
      b.classList.toggle("is-active", j === i);
      b.setAttribute("aria-selected", j === i ? "true" : "false");
    });
    regImg.classList.add("is-swapping");
    scanline();
    setTimeout(function () {
      regImg.src = "assets/ships/" + s.id + ".png";
      regImg.alt = "Wireframe schematic of the " + s.name;
      regClass.textContent = s.cls;
      regName.textContent = s.name;
      regStory.textContent = s.story;
      setBars(s);
      regImg.classList.remove("is-swapping");
    }, 220);
  }

  function stopCycle() {
    if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
  }

  pickBtns[0].classList.add("is-active");
  pickBtns[0].setAttribute("aria-selected", "true");

  new IntersectionObserver(function (entries, obs) {
    if (entries[0].isIntersecting) {
      SHIPS.forEach(function (s) { var im = new Image(); im.src = "assets/ships/" + s.id + ".png"; });
      setBars(SHIPS[0]);
      if (!prefersReduced && !userTouched) {
        cycleTimer = setInterval(function () {
          selectShip((current + 1) % SHIPS.length);
        }, 6000);
      }
      obs.disconnect();
    }
  }, { threshold: 0.35 }).observe(document.querySelector(".registry"));

  document.querySelector(".registry").addEventListener("pointerdown", function () {
    userTouched = true;
    stopCycle();
  });
  } /* end legacy registry — replaced by js/ships.js */

  /* reduced motion still needs parallax-free layout effects */
  if (prefersReduced) {
    mWords.forEach(function (w) { w.classList.add("lit"); });
  }

  /* ---------- combat reels: each box cycles 3 clips, fade in, play, fade out ---------- */
  var REELS = {
    "reel": [
      { src: "assets/video/hammerfall.mp4", title: "HAMMERFALL · THE BOMBER STORM" },
      { src: "assets/video/apocalypse.mp4", title: "APOCALYPSE · LAST WAR, FIRST DAY" },
      { src: "assets/video/killbox.mp4", title: "KILLBOX · THE PINCER CLOSES" }
    ],
    "reel-fleet": [
      { src: "assets/video/earthfall.mp4", title: "EARTHFALL · THE BATTLE FOR SOL" },
      { src: "assets/video/colossi.mp4", title: "COLOSSI · SUPERCARRIERS ON THE LINE" },
      { src: "assets/video/fleetwrath_neb.mp4", title: "FLEET WRATH OVER THE ORION DRIFT" }
    ],
    "reel-capital": [
      { src: "assets/video/capitals.mp4", title: "CAPITALS STACKED FOR GLORY" },
      { src: "assets/video/blackout.mp4", title: "BLACKOUT · THEY WERE NEVER THERE" },
      { src: "assets/video/eyewall.mp4", title: "EYEWALL · STORM-RING SLUGFEST" }
    ],
    "reel-wing": [
      { src: "assets/video/duel.mp4", title: "SINGLE COMBAT · REAPER AGAINST REAPER" },
      { src: "assets/video/crusader.mp4", title: "CRUSADER STRIKE PAIR VS CVE “RACKER”" },
      { src: "assets/video/respawn.mp4", title: "ATTRITION · A PILOT DIES, A TICKET BURNS" }
    ]
  };

  function initReel(reel, CLIPS) {
    var reelTitle = document.getElementById(reel.id + "-title");
    var idx = -1, fading = false, reelVisible = false;

    function loadClip(i) {
      idx = ((i % CLIPS.length) + CLIPS.length) % CLIPS.length;
      fading = false;
      reel.src = CLIPS[idx].src;
      if (reelTitle) reelTitle.textContent = CLIPS[idx].title;
      reel.load();
      var p = reel.play();
      if (p && p.catch) p.catch(function () {});
    }

    reel.addEventListener("playing", function () {
      if (!fading) reel.classList.add("is-on");
    });

    reel.addEventListener("timeupdate", function () {
      if (!fading && reel.duration && reel.duration - reel.currentTime < 1.05) {
        fading = true;
        reel.classList.remove("is-on");
      }
    });

    reel.addEventListener("ended", function () {
      if (reelVisible) loadClip(idx + 1);
    });

    new IntersectionObserver(function (es) {
      reelVisible = es[0].isIntersecting;
      if (reelVisible) {
        if (idx < 0) loadClip(0);
        else {
          var p = reel.play();
          if (p && p.catch) p.catch(function () {});
        }
      } else if (idx >= 0 && !reel.paused) {
        reel.pause();
      }
    }, { rootMargin: "80px" }).observe(reel);

    /* hidden tabs defer media; nudge playback when the page returns */
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && reelVisible && idx >= 0) {
        var p = reel.play();
        if (p && p.catch) p.catch(function () {});
      }
    });
  }

  if (!prefersReduced) Object.keys(REELS).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) initReel(el, REELS[id]);
  });

  /* ---------- the ultimate trailer: teaser loop, full cut on demand ----------
     The 2:00 master is ~37 MB — nobody downloads it unless they press play.
     A 1.3 MB teaser montage stands in as a living poster; the full cut is
     attached only on request and streams progressively (faststart moov). */
  var cinema = document.querySelector(".cinema");
  if (cinema) (function () {
    var teaser = document.getElementById("cinema-teaser");
    var full = document.getElementById("cinema-full");
    var play = document.getElementById("cinema-play");
    var track = document.getElementById("cinema-track");
    var title = document.getElementById("cinema-title");
    var label = document.getElementById("cinema-play-label");
    var FULL_SRC = "assets/video/trailer_ultimate.mp4";
    var cinemaVisible = false;

    if (!prefersReduced) {
      new IntersectionObserver(function (es) {
        cinemaVisible = es[0].isIntersecting;
        if (cinema.classList.contains("is-full")) {
          if (!cinemaVisible && !full.paused) full.pause();
          return;
        }
        if (cinemaVisible) {
          var p = teaser.play();
          if (p && p.catch) p.catch(function () {});
        } else if (!teaser.paused) {
          teaser.pause();
        }
      }, { rootMargin: "80px" }).observe(teaser);
    }

    /* one stage, seven cuts: the big play ring runs the ultimate; the bill
       cards below swap their own reel into the same stage. Nothing heavier
       than a poster is fetched until a cut is actually requested. */
    var pendingTitle = "";
    var activeCard = null;

    function playCut(src, onAirTitle, card) {
      if (activeCard) activeCard.classList.remove("is-active");
      activeCard = card || null;
      if (activeCard) activeCard.classList.add("is-active");
      pendingTitle = onAirTitle;
      cinema.classList.add("is-loading");
      label.textContent = "RECEIVING TRANSMISSION…";
      if (full.getAttribute("src") !== src) {
        full.src = src;
        track.style.setProperty("--p", 0);
      }
      full.controls = true;
      var p = full.play();
      if (p && p.catch) p.catch(function () {});
    }

    play.addEventListener("click", function () {
      playCut(FULL_SRC, "STRIKE WINGS · THE ULTIMATE TRAILER · IN-ENGINE, ONE CUT", null);
    });

    /* back up to the stage; offset chain works in both the lerp shell and
       native scroll (html scroll-behavior handles the glide off-lerp) */
    function stageTop() {
      var y = 0, el = cinema;
      while (el) { y += el.offsetTop; el = el.offsetParent; }
      return Math.max(0, y - 60);
    }

    document.querySelectorAll(".bill-card").forEach(function (card) {
      card.addEventListener("click", function () {
        playCut(card.getAttribute("data-src"), card.getAttribute("data-title") + " · NOW SHOWING", card);
        window.scrollTo(0, stageTop());
      });
    });

    full.addEventListener("playing", function () {
      cinema.classList.remove("is-loading");
      cinema.classList.add("is-full");
      teaser.pause();
      if (title && pendingTitle) title.textContent = pendingTitle;
    });

    full.addEventListener("timeupdate", function () {
      if (full.duration) track.style.setProperty("--p", full.currentTime / full.duration);
    });

    full.addEventListener("ended", function () {
      cinema.classList.remove("is-full");
      full.controls = false;
      if (activeCard) activeCard.classList.remove("is-active");
      activeCard = null;
      label.textContent = "PLAY IT AGAIN";
      if (title) title.textContent = "TEASER LOOP · THE FULL TWO MINUTES, ONE CLICK AWAY";
      track.style.setProperty("--p", 0);
      if (cinemaVisible && !prefersReduced) {
        var p = teaser.play();
        if (p && p.catch) p.catch(function () {});
      }
    });
  })();

  /* ---------- the known sphere: live 3D chart ----------
     System positions, tints and routes mirror the in-game star chart
     (freefighter32 src/ui/star_chart.cpp). +x = east, +z = south, y = height. */
  var mapCanvas = document.getElementById("starmap");
  if (mapCanvas && mapCanvas.getContext) (function () {
    var FCOL = {
      alliance: [80, 220, 120],
      ssa: [170, 185, 200],
      halcyon: [220, 80, 90],
      arathil: [255, 170, 60],
      ross: [60, 215, 200],
      gliese: [200, 170, 240],
      joint: [180, 200, 180],
      unknown: [200, 40, 50],
      silent: [115, 120, 130]
    };

    /* name, subtitle, east, south, height, faction, tier, cluster */
    var SYS = [
      ["SOL", "CRADLE OF MAN", 0, 0, 0, "alliance", 2, 0],
      ["ALPHA CENTAURI", "SILENT PRIMARY", -3.1, 3.1, 1.4, "silent", 0, 0],
      ["SIRIUS", "SILENT REFERENCE", 6.0, 6.1, -2.2, "silent", 0, 0],
      ["PROCYON", "SSA FORWARD ANCHORAGE", 10.6, -4.4, 2.8, "ssa", 1, 0],
      ["BARNARD", "SILENT REFERENCE", 2.0, -5.9, -1.6, "silent", 0, 0],
      ["ETA CASSIOPEIAE", "LUCIA COLONIES", 13.5, -13.5, -3.2, "alliance", 1, 0],
      ["TAU CETI", "ALLIANCE OUTPORT", 3.0, 11.6, 2.4, "alliance", 1, 0],
      ["EPSILON INDI", "SOUTHERN REACH", 5.0, 10.9, -1.2, "alliance", 0, 0],
      ["82 ERIDANI", "FRONTIER SHELL", 18.8, -6.8, -2.0, "alliance", 1, 0],
      ["SELACH", "JOINT LATTICE CITY", 5.5, 2.0, 1.0, "joint", 1, 0],
      ["NEW ANTWERP", "SABLE VIGIL GARRISON", -5.7, 5.7, -1.8, "alliance", 1, 0],
      ["HALCYON", "THE HALCYON LATTICE", 11.0, -4.7, 2.2, "halcyon", 1, 0],
      ["ROSS 128", "CONCORD HUB", -7.7, -7.7, -2.6, "ross", 1, 0],
      ["GLIESE 581", "HOUSES OF GLIESE", 14.4, 14.4, 3.2, "gliese", 1, 0],
      ["ARATHIL", "SALVAGE CHARTER", -10.6, 10.6, -2.8, "arathil", 1, 1],
      ["?", "UNCHARTED CLUSTER", -15.0, -15.0, 3.8, "unknown", 1, 1]
    ];

    /* a, b, kind */
    var ROUTES = [
      [0, 6, "lane"], [0, 7, "lane"], [0, 5, "lane"], [0, 8, "lane"], [0, 10, "lane"],
      [0, 9, "trade"], [9, 11, "trade"], [0, 12, "trade"], [12, 11, "trade"], [12, 13, "trade"],
      [10, 14, "war"], [11, 8, "war"],
      [14, 5, "raid"], [14, 6, "raid"],
      [15, 12, "anomaly"]
    ];

    var CLUSTER_OFF = [[0, 0], [1.5, 0.7], [-1.0, 1.3], [0.6, -1.4]];

    var ctx2 = mapCanvas.getContext("2d");
    var wrap = mapCanvas.parentElement;
    var W = 2, H = 2, DPR = 1;

    function size() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      mapCanvas.width = Math.max(2, W * DPR);
      mapCanvas.height = Math.max(2, H * DPR);
      if (prefersReduced) draw(8);
    }

    /* tinted glow sprites per faction */
    var sprites = {};
    function sprite(f) {
      if (sprites[f]) return sprites[f];
      var c = document.createElement("canvas");
      c.width = c.height = 64;
      var g = c.getContext("2d");
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(255,255,255,1)");
      gr.addColorStop(0.3, "rgba(255,255,255,0.45)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      g.globalCompositeOperation = "source-in";
      var col = FCOL[f];
      g.fillStyle = "rgb(" + col[0] + "," + col[1] + "," + col[2] + ")";
      g.fillRect(0, 0, 64, 64);
      sprites[f] = c;
      return c;
    }

    /* deterministic backdrop stars */
    var seed = 1337;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    var bg = [];
    for (var bi = 0; bi < 240; bi++) {
      var th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1), rr = 26 + rnd() * 34;
      bg.push([rr * Math.sin(ph) * Math.cos(th), rr * Math.cos(ph) * 0.55, rr * Math.sin(ph) * Math.sin(th), 0.2 + rnd() * 0.5]);
    }

    var yaw = -0.5, pitch = 0.5, parX = 0, parY = 0, tParX = 0, tParY = 0;
    var mouseX = -1, mouseY = -1, hovered = -1;
    var mapVisible = false;

    new IntersectionObserver(function (es) { mapVisible = es[0].isIntersecting; }, { rootMargin: "120px" }).observe(mapCanvas);

    mapCanvas.addEventListener("pointermove", function (e) {
      var r = mapCanvas.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
      tParX = mouseX / r.width - 0.5;
      tParY = mouseY / r.height - 0.5;
    });
    mapCanvas.addEventListener("pointerleave", function () {
      tParX = 0; tParY = 0; mouseX = -1; mouseY = -1;
    });

    function draw(t) {
      ctx2.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx2.clearRect(0, 0, W, H);
      var cx0 = W / 2, cy0 = H / 2 - H * 0.045;
      var f = Math.min(W, H) * 1.66;
      var ya = yaw + parX * 0.3, pa = pitch + parY * 0.16;
      var cy = Math.cos(ya), sy = Math.sin(ya);
      var cp = Math.cos(pa), sp = Math.sin(pa);
      var CAMD = 52;
      var HLIFT = 1.6; /* exaggerate out-of-plane heights for depth */

      function proj(x, y, z) {
        y *= HLIFT;
        var rx = x * cy + z * sy;
        var rz = -x * sy + z * cy;
        var ry = y * cp - rz * sp;
        var rz2 = y * sp + rz * cp;
        var d = rz2 + CAMD;
        var s = f / d;
        return [cx0 + rx * s, cy0 - ry * s, d, s];
      }

      var i, p, q, a;

      /* backdrop */
      for (i = 0; i < bg.length; i++) {
        p = proj(bg[i][0], bg[i][1], bg[i][2]);
        if (p[2] < 10) continue;
        a = bg[i][3] * Math.min(1, (p[2] - 10) / 30) * 0.5;
        ctx2.fillStyle = "rgba(220,225,235," + a.toFixed(3) + ")";
        ctx2.fillRect(p[0], p[1], 1, 1);
      }

      /* plane rings: 10 and 20 light-years */
      var ring, seg;
      for (ring = 1; ring <= 2; ring++) {
        var R = ring * 10;
        ctx2.beginPath();
        for (seg = 0; seg <= 96; seg++) {
          var aa = seg / 96 * Math.PI * 2;
          p = proj(R * Math.cos(aa), 0, R * Math.sin(aa));
          if (seg === 0) ctx2.moveTo(p[0], p[1]); else ctx2.lineTo(p[0], p[1]);
        }
        ctx2.strokeStyle = ring === 2 ? "rgba(236,234,228,0.10)" : "rgba(236,234,228,0.06)";
        ctx2.lineWidth = 1;
        ctx2.stroke();
      }
      /* tick marks on the outer ring */
      ctx2.strokeStyle = "rgba(236,234,228,0.12)";
      for (seg = 0; seg < 24; seg++) {
        var ta = seg / 24 * Math.PI * 2;
        p = proj(19.6 * Math.cos(ta), 0, 19.6 * Math.sin(ta));
        q = proj(20.4 * Math.cos(ta), 0, 20.4 * Math.sin(ta));
        ctx2.beginPath();
        ctx2.moveTo(p[0], p[1]);
        ctx2.lineTo(q[0], q[1]);
        ctx2.stroke();
      }
      p = proj(21.2, 0, 0);
      ctx2.font = "9px 'Share Tech Mono', monospace";
      ctx2.fillStyle = "rgba(236,234,228,0.28)";
      ctx2.fillText("20 LY", p[0] - 12, p[1]);

      /* stems from the chart plane to each system */
      for (i = 0; i < SYS.length; i++) {
        var s0 = SYS[i];
        if (!s0[4]) continue;
        p = proj(s0[2], 0, s0[3]);
        q = proj(s0[2], s0[4], s0[3]);
        var col0 = FCOL[s0[5]];
        ctx2.strokeStyle = "rgba(" + col0[0] + "," + col0[1] + "," + col0[2] + ",0.26)";
        ctx2.lineWidth = 1;
        ctx2.beginPath();
        ctx2.moveTo(p[0], p[1]);
        ctx2.lineTo(q[0], q[1]);
        ctx2.stroke();
        ctx2.fillStyle = "rgba(" + col0[0] + "," + col0[1] + "," + col0[2] + ",0.20)";
        ctx2.fillRect(p[0] - 1.5, p[1] - 0.5, 3, 1);
      }

      /* routes */
      for (i = 0; i < ROUTES.length; i++) {
        var r0 = SYS[ROUTES[i][0]], r1 = SYS[ROUTES[i][1]], kind = ROUTES[i][2];
        p = proj(r0[2], r0[4], r0[3]);
        q = proj(r1[2], r1[4], r1[3]);
        ctx2.beginPath();
        ctx2.moveTo(p[0], p[1]);
        ctx2.lineTo(q[0], q[1]);
        ctx2.lineWidth = 1;
        if (kind === "lane") {
          ctx2.setLineDash([]);
          ctx2.strokeStyle = "rgba(80,220,120,0.32)";
        } else if (kind === "trade") {
          ctx2.setLineDash([5, 6]);
          ctx2.strokeStyle = "rgba(200,164,92,0.42)";
        } else if (kind === "war") {
          ctx2.setLineDash([]);
          ctx2.strokeStyle = "rgba(220,80,90," + (0.38 + 0.22 * Math.sin(t * 2.4 + i)).toFixed(3) + ")";
          ctx2.lineWidth = 1.5;
        } else if (kind === "raid") {
          ctx2.setLineDash([2, 7]);
          ctx2.strokeStyle = "rgba(255,170,60,0.42)";
        } else {
          ctx2.setLineDash([3, 9]);
          ctx2.lineDashOffset = -((t * 26) % 12);
          ctx2.strokeStyle = "rgba(200,40,50,0.62)";
        }
        ctx2.stroke();
        ctx2.setLineDash([]);
        ctx2.lineDashOffset = 0;

        /* the torpedoes still arrive */
        if (kind === "anomaly") {
          var u = (t * 0.12) % 1;
          var tx = r0[2] + (r1[2] - r0[2]) * u;
          var ty = r0[4] + (r1[4] - r0[4]) * u;
          var tz = r0[3] + (r1[3] - r0[3]) * u;
          var tp = proj(tx, ty, tz);
          ctx2.drawImage(sprite("unknown"), tp[0] - 7, tp[1] - 7, 14, 14);
          ctx2.fillStyle = "rgba(255,210,210,0.9)";
          ctx2.beginPath();
          ctx2.arc(tp[0], tp[1], 1.2, 0, Math.PI * 2);
          ctx2.fill();
        }
      }

      /* nodes, far to near */
      var order = [];
      for (i = 0; i < SYS.length; i++) {
        p = proj(SYS[i][2], SYS[i][4], SYS[i][3]);
        order.push([p[2], i, p]);
      }
      order.sort(function (m, n) { return n[0] - m[0]; });

      var newHover = -1;
      for (i = 0; i < order.length; i++) {
        var idx = order[i][1];
        var sd = SYS[idx];
        p = order[i][2];
        var k = p[3] / (f / CAMD);
        var tier = sd[6];
        var halo = (tier === 2 ? 42 : tier === 1 ? 30 : 18) * k;
        var core = (tier === 2 ? 3.0 : tier === 1 ? 2.2 : 1.5) * k;
        var isHover = idx === hovered;
        if (isHover) { halo *= 1.4; core *= 1.25; }
        var pulse = sd[5] === "unknown" ? 0.72 + 0.28 * Math.sin(t * 3.2) : 1;

        if (mouseX >= 0) {
          var dx = mouseX - p[0], dyv = mouseY - p[1];
          if (dx * dx + dyv * dyv < 500) newHover = idx;
        }

        if (sd[7]) {
          for (q = 0; q < CLUSTER_OFF.length; q++) {
            var cpos = proj(sd[2] + CLUSTER_OFF[q][0], sd[4], sd[3] + CLUSTER_OFF[q][1]);
            ctx2.globalAlpha = (q === 0 ? 1 : 0.66) * pulse;
            ctx2.drawImage(sprite(sd[5]), cpos[0] - halo * 0.45, cpos[1] - halo * 0.45, halo * 0.9, halo * 0.9);
            ctx2.fillStyle = "rgba(255,255,255,0.85)";
            ctx2.beginPath();
            ctx2.arc(cpos[0], cpos[1], core * 0.7, 0, Math.PI * 2);
            ctx2.fill();
          }
          ctx2.globalAlpha = 1;
        } else {
          ctx2.globalAlpha = pulse;
          ctx2.drawImage(sprite(sd[5]), p[0] - halo / 2, p[1] - halo / 2, halo, halo);
          ctx2.fillStyle = "rgba(255,255,255,0.92)";
          ctx2.beginPath();
          ctx2.arc(p[0], p[1], core, 0, Math.PI * 2);
          ctx2.fill();
          ctx2.globalAlpha = 1;
        }

        if (isHover) {
          ctx2.strokeStyle = "rgba(200,164,92,0.7)";
          ctx2.lineWidth = 1;
          ctx2.beginPath();
          ctx2.arc(p[0], p[1], halo * 0.55, 0, Math.PI * 2);
          ctx2.stroke();
        }

        /* labels */
        var depthA = Math.max(0.25, Math.min(1, k * k));
        if (tier >= 1 || isHover) {
          var col1 = FCOL[sd[5]];
          var nameA = (isHover ? 1 : tier === 2 ? 0.95 : 0.75) * depthA;
          if (sd[5] === "unknown") nameA *= pulse;
          ctx2.font = (tier === 2 ? "10.5px" : "10px") + " 'Share Tech Mono', monospace";
          ctx2.fillStyle = sd[5] === "unknown"
            ? "rgba(220,90,100," + nameA.toFixed(3) + ")"
            : "rgba(236,234,228," + nameA.toFixed(3) + ")";
          ctx2.fillText(sd[0], p[0] + halo * 0.42 + 5, p[1] - 4);
          if (isHover || tier === 2) {
            ctx2.font = "9px 'Share Tech Mono', monospace";
            ctx2.fillStyle = "rgba(" + col1[0] + "," + col1[1] + "," + col1[2] + "," + (0.85 * depthA).toFixed(3) + ")";
            ctx2.fillText(sd[1], p[0] + halo * 0.42 + 5, p[1] + 7);
          }
        } else if (tier === 0) {
          ctx2.font = "8.5px 'Share Tech Mono', monospace";
          ctx2.fillStyle = "rgba(236,234,228," + (0.26 * depthA).toFixed(3) + ")";
          ctx2.fillText(sd[0], p[0] + 8, p[1] - 3);
        }
      }
      hovered = newHover;
      mapCanvas.style.cursor = hovered >= 0 ? "crosshair" : "";
    }

    if (window.ResizeObserver) new ResizeObserver(size).observe(wrap);
    else window.addEventListener("resize", size);
    size();

    if (prefersReduced) {
      draw(8);
    } else {
      var lastT = 0;
      (function mloop(now) {
        requestAnimationFrame(mloop);
        var dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
        lastT = now;
        if (!mapVisible) return;
        yaw += dt * 0.055;
        parX += (tParX - parX) * 0.05;
        parY += (tParY - parY) * 0.05;
        draw(now / 1000);
      })(0);
    }
  })();

})();
