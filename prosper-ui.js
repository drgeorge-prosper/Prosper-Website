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
  var gold = '#E6C384', bone = 'rgba(255,244,222,.95)', faint = 'rgba(244,222,180,.22)';
  try {
    var hero = document.querySelector('.hero3');
    if (hero) {
      hero.insertBefore(grid(false), hero.firstChild);
      var st = hero.querySelector('.stage');
      var nt = hero.querySelector('.note');
      if (nt) nt.parentNode.insertBefore(helix({horizontal: true, length: 760, amp: 28, rungs: 52, turns: 3.4, cls: 'lx-hero-strip', a: gold, b: bone, line: faint, r: 3.6, speed: .5}), nt.nextSibling);
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

// Elite visuals: aurora light, rising gold dust, a soft pointer glow on dark
// sections, and a pulse that travels along the healthspan curve. Dust pauses
// off screen; none of it runs for visitors who ask for reduced motion.
(function(){
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var targets = document.querySelectorAll('.hero3, .page-hero, .cta, #how, #about');
  var fields = [];
  function aura(host){
    var a = document.createElement('div'); a.className = 'lx-aura'; a.setAttribute('aria-hidden', 'true');
    a.innerHTML = '<i></i><i></i><i></i>'; host.insertBefore(a, host.firstChild);
  }
  function dust(host, density){
    var c = document.createElement('canvas'); c.className = 'lx-dust'; c.setAttribute('aria-hidden', 'true');
    host.insertBefore(c, host.firstChild.nextSibling);
    var f = {c: c, ctx: c.getContext('2d'), host: host, ps: [], visible: false, density: density};
    f.size = function(){
      var r = host.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(r.width * d); c.height = Math.round(r.height * d); f.d = d; f.w = r.width; f.h = r.height;
      var n = Math.round(Math.min(60, (r.width * r.height) / 20000 * f.density));
      f.ps = []; for (var i = 0; i < n; i++) f.ps.push(f.spawn(true));
    };
    f.spawn = function(any){
      return {x: Math.random() * f.w, y: any ? Math.random() * f.h : f.h + 10, r: Math.random() * 1.6 + .4,
        v: Math.random() * .25 + .08, sway: Math.random() * 6.28, a: Math.random() * .35 + .15, tw: Math.random() * 6.28};
    };
    f.draw = function(t){
      var x = f.ctx; x.setTransform(f.d, 0, 0, f.d, 0, 0); x.clearRect(0, 0, f.w, f.h);
      for (var i = 0; i < f.ps.length; i++) {
        var p = f.ps[i]; p.y -= p.v; p.sway += .01;
        if (p.y < -10) f.ps[i] = p = f.spawn(false);
        var px = p.x + Math.sin(p.sway) * 14, al = p.a * (.55 + .45 * Math.sin(t * 1.6 + p.tw));
        var g = x.createRadialGradient(px, p.y, 0, px, p.y, p.r * 5);
        g.addColorStop(0, 'rgba(255,232,180,' + al.toFixed(3) + ')'); g.addColorStop(1, 'rgba(240,200,130,0)');
        x.fillStyle = g; x.beginPath(); x.arc(px, p.y, p.r * 5, 0, 6.283); x.fill();
      }
    };
    fields.push(f); return f;
  }
  function spot(host){
    var s = document.createElement('div'); s.className = 'lx-spot'; s.setAttribute('aria-hidden', 'true');
    host.insertBefore(s, host.firstChild);
    host.addEventListener('pointermove', function(e){
      var r = host.getBoundingClientRect();
      host.style.setProperty('--mx', (e.clientX - r.left) + 'px'); host.style.setProperty('--my', (e.clientY - r.top) + 'px');
      host.classList.add('lx-lit');
    });
    host.addEventListener('pointerleave', function(){ host.classList.remove('lx-lit'); });
  }
  try {
    targets.forEach(function(t){
      if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
      t.style.overflow = 'hidden';
      aura(t);
      if (!still) dust(t, t.classList.contains('hero3') ? 1.4 : 1);
      if (!still && finePointer && (t.classList.contains('hero3') || t.classList.contains('page-hero'))) spot(t);
    });
  } catch (e) {}
  if (fields.length && window.requestAnimationFrame) {
    fields.forEach(function(f){ f.size(); });
    var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ fields.forEach(function(f){ f.size(); }); }, 200); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ fields.forEach(function(f){ if (f.host === e.target) f.visible = e.isIntersecting; }); }); });
      fields.forEach(function(f){ io.observe(f.host); });
    } else fields.forEach(function(f){ f.visible = true; });
    (function loop(ts){
      var t = ts / 1000;
      if (!document.hidden) fields.forEach(function(f){ if (f.visible) f.draw(t); });
      requestAnimationFrame(loop);
    })(performance.now());
  }
  // Steps connector: let the travelling light run the full width
  document.querySelectorAll('.steps3.lx-flow').forEach(function(s){
    var set = function(){ s.style.setProperty('--lx-w', s.offsetWidth + 'px'); }; set();
    window.addEventListener('resize', set);
  });
  // Healthspan chart: a glowing pulse that runs along the aim curve
  if (!still) document.querySelectorAll('.lx-chart svg').forEach(function(svg){
    var path = svg.querySelector('.lx-draw'); if (!path) return;
    var NS = 'http://www.w3.org/2000/svg', g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'lx-pulse');
    g.innerHTML = '<circle r="11" fill="rgba(240,190,110,.25)"/><circle r="5.5" fill="#E6B86C" stroke="#fff" stroke-width="2"/>' +
      '<animateMotion dur="5.5s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear" path="' + path.getAttribute('d') + '"/>';
    svg.appendChild(g);
  });
})();
