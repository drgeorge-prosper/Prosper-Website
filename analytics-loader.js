// Analytics loader. Reads ANALYTICS_PROVIDER and ANALYTICS_ID from site-config.js.
// Does nothing while ANALYTICS_PROVIDER is null.
// Supported: "cloudflare" (needs ANALYTICS_ID, the beacon token) and "plausible".
(function () {
  var c = window.PROSPER_CONFIG;
  if (!c || !c.ANALYTICS_PROVIDER) return;
  if (document.querySelector('script[data-prosper-analytics]')) return;
  var s = document.createElement('script');
  s.defer = true;
  s.setAttribute('data-prosper-analytics', c.ANALYTICS_PROVIDER);
  if (c.ANALYTICS_PROVIDER === 'cloudflare') {
    if (!c.ANALYTICS_ID) return;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: c.ANALYTICS_ID }));
  } else if (c.ANALYTICS_PROVIDER === 'plausible') {
    s.src = 'https://plausible.io/js/script.js';
    s.setAttribute('data-domain', 'prosper-clinic.com');
  } else {
    return;
  }
  document.head.appendChild(s);
})();
