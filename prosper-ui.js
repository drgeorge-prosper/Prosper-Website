// Shared UI behaviour: menu icon and one booking button at a time on mobile.
(function(){
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function(){
      var open = links.classList.contains('open');
      toggle.textContent = open ? '✕' : '☰';
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('menu-open', open);
    });
    links.addEventListener('click', function(e){
      if (e.target.closest('a') && links.classList.contains('open')) toggle.click();
    });
  }
  var bar = document.getElementById('stickyCta');
  if (bar && 'MutationObserver' in window) {
    var sync = function(){ document.body.classList.toggle('sticky-on', bar.classList.contains('show')); };
    new MutationObserver(sync).observe(bar, {attributes:true, attributeFilter:['class']});
    sync();
  }
})();

// Longevity visuals: DNA helices in heroes and CTAs, and reveal for charts.
// The helix is drawn in SVG and twisted with requestAnimationFrame. It pauses
// off screen and stays still for visitors who ask for reduced motion.
(function(){
  var NS = 'http://www.w3.org/2000/svg';
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var helices = [];
  function el(n, a){ var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function helix(o){
    // o: {horizontal, length, amp, rungs, turns, cls, a, b, line, r, speed}
    var L = o.length, A = o.amp, n = o.rungs, pad = 12, w = A * 2 + pad * 2;
    var s = el('svg', {viewBox: o.horizontal ? ('0 0 ' + (L + pad * 2) + ' ' + w) : ('0 0 ' + w + ' ' + (L + pad * 2)),
      preserveAspectRatio: o.horizontal ? 'none' : 'xMidYMid meet', 'class': 'lx-helix ' + o.cls, 'aria-hidden': 'true', focusable: 'false'});
    var back = el('g', {}), front = el('g', {});
    var pa = el('path', {fill: 'none', stroke: o.a, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: .75});
    var pb = el('path', {fill: 'none', stroke: o.b, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: .55});
    s.appendChild(back); s.appendChild(pa); s.appendChild(pb); s.appendChild(front);
    var rungs = [];
    for (var i = 0; i < n; i++) {
      var ln = el('line', {stroke: o.line, 'stroke-width': 1.2});
      var ca = el('circle', {fill: o.a}), cb = el('circle', {fill: o.b});
      back.appendChild(ln); front.appendChild(ca); front.appendChild(cb);
      rungs.push([ln, ca, cb]);
    }
    var h = {s: s, o: o, rungs: rungs, pa: pa, pb: pb, pad: pad, visible: true, t0: Math.random() * 10};
    h.draw = function(t){
      var k = (o.turns * 2 * Math.PI) / (n - 1), gap = L / (n - 1), mid = A + pad, da = '', db = '';
      for (var i = 0; i < n; i++) {
        var ph = t * (o.speed || .6) + i * k, sn = Math.sin(ph), cs = Math.cos(ph);
        var pos = pad + i * gap, xa = mid + A * sn, xb = mid - A * sn;
        var R = rungs[i], ra = (o.r || 4) * (.72 + .28 * cs), rb = (o.r || 4) * (.72 - .28 * cs);
        var P = o.horizontal ? function(p, q){ return [p, q]; } : function(p, q){ return [q, p]; };
        var A1 = P(pos, xa), B1 = P(pos, xb);
        R[0].setAttribute('x1', A1[0].toFixed(1)); R[0].setAttribute('y1', A1[1].toFixed(1));
        R[0].setAttribute('x2', B1[0].toFixed(1)); R[0].setAttribute('y2', B1[1].toFixed(1));
        R[1].setAttribute('cx', A1[0].toFixed(1)); R[1].setAttribute('cy', A1[1].toFixed(1)); R[1].setAttribute('r', ra.toFixed(2));
        R[1].setAttribute('opacity', (.35 + .65 * (cs + 1) / 2).toFixed(2));
        R[2].setAttribute('cx', B1[0].toFixed(1)); R[2].setAttribute('cy', B1[1].toFixed(1)); R[2].setAttribute('r', rb.toFixed(2));
        R[2].setAttribute('opacity', (.35 + .65 * (1 - cs) / 2).toFixed(2));
        da += (i ? 'L' : 'M') + A1[0].toFixed(1) + ' ' + A1[1].toFixed(1);
        db += (i ? 'L' : 'M') + B1[0].toFixed(1) + ' ' + B1[1].toFixed(1);
      }
      pa.setAttribute('d', da); pb.setAttribute('d', db);
    };
    h.draw(h.t0);
    helices.push(h);
    return s;
  }
  function grid(light){ var d = document.createElement('div'); d.className = 'lx-grid' + (light ? ' lx-grid-light' : ''); d.setAttribute('aria-hidden', 'true'); return d; }
  var gold = '#C29A5B', bone = 'rgba(244,239,230,.9)', faint = 'rgba(244,239,230,.16)';
  try {
    var hero = document.querySelector('.hero3');
    if (hero) {
      hero.insertBefore(grid(false), hero.firstChild);
      var st = hero.querySelector('.stage');
      if (st) st.insertBefore(helix({length: 620, amp: 52, rungs: 46, turns: 3.2, cls: 'lx-hero-helix', a: gold, b: bone, line: faint, r: 4.4}), st.firstChild);
    }
    document.querySelectorAll('.page-hero').forEach(function(ph){
      ph.insertBefore(grid(false), ph.firstChild);
      ph.appendChild(helix({length: 480, amp: 42, rungs: 36, turns: 2.6, cls: 'lx-ph-helix', a: gold, b: bone, line: faint, r: 3.8}));
    });
    document.querySelectorAll('.cta').forEach(function(c){
      c.insertBefore(grid(false), c.firstChild);
      c.appendChild(helix({horizontal: true, length: 1400, amp: 26, rungs: 90, turns: 7, cls: 'lx-cta-helix', a: gold, b: bone, line: faint, r: 3.2, speed: .45}));
    });
    document.querySelectorAll('.band').forEach(function(b){
      b.appendChild(helix({length: 420, amp: 36, rungs: 32, turns: 2.4, cls: 'lx-band-helix', a: '#1A1815', b: 'rgba(26,24,21,.45)', line: 'rgba(26,24,21,.2)', r: 4}));
    });
  } catch (e) {}
  if (helices.length && !still && window.requestAnimationFrame) {
    if ('IntersectionObserver' in window) {
      var hio = new IntersectionObserver(function(es){ es.forEach(function(e){ helices.forEach(function(h){ if (h.s === e.target) h.visible = e.isIntersecting; }); }); });
      helices.forEach(function(h){ h.visible = false; hio.observe(h.s); });
    }
    var start = null;
    (function loop(ts){
      if (start === null) start = ts;
      var t = (ts - start) / 1000;
      helices.forEach(function(h){ if (h.visible && !document.hidden) h.draw(h.t0 + t); });
      requestAnimationFrame(loop);
    })(performance.now());
  }
  var obs = document.querySelectorAll('.lx-obs');
  if (!obs.length) return;
  if (!('IntersectionObserver' in window)) { obs.forEach(function(el){ el.classList.add('lx-in'); }); return; }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('lx-in'); io.unobserve(e.target); } });
  }, {threshold: 0.25});
  obs.forEach(function(el){ io.observe(el); });
})();
