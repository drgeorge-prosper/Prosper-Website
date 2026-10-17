// Prosper booking analytics and attribution helper.
// Exposes window.prosperTrack(name, props) and window.prosperAttribution().
// Forwards events to whichever analytics is present (Plausible, Umami, gtag, dataLayer).
// If none is present it does nothing. Cloudflare Web Analytics has no custom events,
// so with Cloudflare alone these calls are a safe no-op.
// It does not load any analytics itself; that is done in site-config.js and <head>.
(function (w, d) {
  'use strict';

  var queue = [];

  function deliver(name, props) {
    var sent = false;
    try {
      if (typeof w.plausible === 'function') { w.plausible(name, { props: props }); sent = true; }
    } catch (e) {}
    try {
      if (w.umami && typeof w.umami.track === 'function') { w.umami.track(name, props); sent = true; }
    } catch (e) {}
    try {
      if (typeof w.gtag === 'function') { w.gtag('event', name, props); sent = true; }
      else if (Array.isArray(w.dataLayer)) { w.dataLayer.push(Object.assign({ event: name }, props)); sent = true; }
    } catch (e) {}
    return sent;
  }

  function flush() {
    var pending = queue; queue = [];
    pending.forEach(function (ev) { deliver(ev[0], ev[1]); });
  }

  w.prosperTrack = function (name, props) {
    try {
      props = props || {};
      if (!props.page) props.page = w.location.pathname;
      // If the analytics script has not loaded yet, hold the event and retry once on load.
      if (!deliver(name, props)) queue.push([name, props]);
    } catch (e) {}
  };
  w.addEventListener('load', function () { setTimeout(flush, 0); });

  // ---------- Attribution ----------
  // Stores where this visit came from (UTM tags, or the referring site) for the
  // length of the browser session, so the booking page can pass it to Calendly.
  var KEY = 'prosper_attr';
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var AI = {
    'chatgpt.com': 'chatgpt.com', 'chat.openai.com': 'chatgpt.com',
    'perplexity.ai': 'perplexity.ai', 'gemini.google.com': 'gemini.google.com',
    'claude.ai': 'claude.ai', 'copilot.microsoft.com': 'copilot'
  };

  function sourceFromHost(host) {
    host = (host || '').toLowerCase().replace(/^www\./, '');
    if (AI[host]) return { utm_source: AI[host], utm_medium: 'ai_assistant' };
    if (/(^|\.)google\.[a-z.]+$/.test(host)) return { utm_source: 'google', utm_medium: 'organic' };
    if (/(^|\.)bing\.com$/.test(host)) return { utm_source: 'bing', utm_medium: 'organic' };
    if (/(^|\.)duckduckgo\.com$/.test(host)) return { utm_source: 'duckduckgo', utm_medium: 'organic' };
    if (/(^|\.)linkedin\.com$/.test(host) || host === 'lnkd.in') return { utm_source: 'linkedin', utm_medium: 'social' };
    return { utm_source: host, utm_medium: 'referral' };
  }

  function read() {
    try { return JSON.parse(w.sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function save(obj) {
    try { w.sessionStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) {}
  }

  function capture() {
    var params, found = {}, hasUtm = false;
    try { params = new URLSearchParams(w.location.search); } catch (e) { return; }
    UTM.forEach(function (k) {
      var v = params.get(k);
      if (v) { found[k] = v.slice(0, 100); hasUtm = true; }
    });
    var refHost = '';
    try { if (d.referrer) refHost = new URL(d.referrer).hostname; } catch (e) {}
    var external = refHost && refHost.replace(/^www\./, '') !== w.location.hostname.replace(/^www\./, '');

    if (!hasUtm && !external) return; // internal navigation or direct: keep what we have
    if (!hasUtm) found = sourceFromHost(refHost);
    if (!found.utm_content) found.utm_content = w.location.pathname.slice(0, 100);
    save(found);
  }
  capture();

  w.prosperAttribution = function () { return read() || {}; };

  // ---------- CTA clicks ----------
  d.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var path;
    try { path = new URL(a.href, w.location.href).pathname.replace(/\/$/, '').replace(/\.html$/, ''); } catch (err) { return; }
    if (path !== '/apply') return;
    w.prosperTrack('cta_click', { location: a.getAttribute('data-cta') || 'other' });
  });
})(window, document);
