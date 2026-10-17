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
  // Works out where this visit came from (UTM tags, or the referring site) and
  // carries it in the URL when the visitor clicks through to another page on this
  // site, so the booking page can pass it to Calendly. Nothing is stored on the
  // device (no cookies, no localStorage or sessionStorage).
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

  function sameSite(host) {
    return (host || '').replace(/^www\./, '') === w.location.hostname.replace(/^www\./, '');
  }

  var attribution = (function () {
    var params, found = {}, hasUtm = false;
    try { params = new URLSearchParams(w.location.search); } catch (e) { return {}; }
    UTM.forEach(function (k) {
      var v = params.get(k);
      if (v) { found[k] = v.slice(0, 100); hasUtm = true; }
    });
    if (hasUtm) return found;
    var refHost = '';
    try { if (d.referrer) refHost = new URL(d.referrer).hostname; } catch (e) {}
    if (!refHost || sameSite(refHost)) return {}; // direct visit or internal page
    found = sourceFromHost(refHost);
    found.utm_content = w.location.pathname.slice(0, 100); // landing page
    return found;
  })();

  w.prosperAttribution = function () { return attribution; };

  d.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var url;
    try { url = new URL(a.href, w.location.href); } catch (err) { return; }
    if (!/^https?:$/.test(url.protocol) || !sameSite(url.hostname)) return;

    // Booking CTA click
    var path = url.pathname.replace(/\/$/, '').replace(/\.html$/, '');
    if (path === '/apply') {
      var loc = a.getAttribute('data-cta');
      if (!loc) {
        if (a.closest('nav')) loc = 'nav';
        else if (a.closest('header')) loc = 'hero';
        else if (a.closest('section.cta')) loc = 'final_cta';
        else if (a.closest('footer')) loc = 'footer';
        else loc = 'body';
      }
      w.prosperTrack('cta_click', { location: loc });
    }

    // Carry attribution to the next page (skip in-page anchors)
    if (url.pathname === w.location.pathname && url.hash) return;
    var changed = false;
    UTM.forEach(function (k) {
      if (attribution[k] && !url.searchParams.has(k)) { url.searchParams.set(k, attribution[k]); changed = true; }
    });
    if (changed) a.href = url.toString();
  }, true);
})(window, document);
