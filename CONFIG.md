# CONFIG.md
Single source of truth for Prosper v2 configuration values. Runtime values consumed by the site live in `site-config.js`; this file is the human-readable record of what each value is, its status, and where it is used. If this file and the code disagree, update the code to match this file.

## Brand
- BUSINESS_NAME: Prosper
- BRAND_DESCRIPTOR: Longevity & Performance Medicine
- PRIMARY_DOMAIN: prosper-clinic.com (recommended; prosperlongevity.com purchase decision open)

## Contact and entity (confirmed, use verbatim, never placeholder)
- LEGAL_ENTITY_DETAILS: Dr G Collins Ltd, company number 16388031, registered office 71-75 Shelton Street, Covent Garden, London WC2H 9JQ
- CONTACT_EMAIL: drgeorge@prosper-clinic.com
- DATA_CONTROLLER_WORDING: Dr G Collins Ltd, ICO registration ZB891517
- DR_GEORGE_CREDENTIALS: Dr George Collins, GMC-registered, BSc(Hons) MBChB PGDipSEM DipFSEM

## Integrations (confirmed)
- CALENDLY_URL: https://calendly.com/drgeorge-prosper-clinic/15min
- APPLICATION_FORM_ENDPOINT: https://formspree.io/f/xvzerwyv (no longer used by /apply since the October 2026 conversion refresh, which replaced the application form with direct Calendly booking; still used by the /for-coaches enquiry form; separate from the legacy waitlist endpoint mnjkojka, which is retired)
- PRIORITY_LIST_DESTINATION: same as APPLICATION_FORM_ENDPOINT until a dedicated endpoint is confirmed

## Unresolved (must remain configurable, do not hardcode a guess)
- GMC_LINK: not set. No GMC link or "check the register" element ships until confirmed (per George's instruction, 20 July 2026: keep plain-text "GMC-registered doctor" everywhere as a confirmed credential, but do not add a clickable register-verification link)
- CANCELLATION_POLICY_WORDING: two-working-days courtesy line on /cancellations awaits George's ruling; shipped as drafted in the copy pack in the meantime
- COMPLAINTS_WORDING / COMPLAINTS_CONTACT: not applicable. Per George's instruction (20 July 2026), the public /complaints page is removed entirely. Any complaint-handling wording elsewhere routes to CONTACT_EMAIL directly, never to a /complaints page
- ANALYTICS_PROVIDER / ANALYTICS_ID: unset (both null in `site-config.js`). The hook is built (see Analytics below) but loads nothing until a provider is set
- FSEM_CLAIM_WORDING: the Faculty of Sport and Exercise Medicine plaque stays in the credentials band under the existing generic subtitle only; no specific relationship claim is made (per George's instruction, 20 July 2026)
- SERVICE_AREA_STATEMENT / CLINICAL_SCOPE_STATEMENT / CLINICAL_GOVERNANCE_WORDING / PRESCRIBING_SCOPE_WORDING: not yet drafted, do not appear on the public site
- PUBLIC_ENTRY_PRICE: unset. Never shown publicly

## Pricing display
- SHOW_PUBLIC_PRICE_GUIDE: false (default, do not change without explicit approval)
- PUBLIC_PRICE_COPY: "Prosper is a private, self-funded service. The recommended pathway and all expected costs are explained clearly before you decide whether to proceed." (the only public money sentence)

## Routes (public, in sitemap)
/, /how-it-works, /about, /longevity-medicine-uk, /executive-health, /for-coaches, /prosper-continuum, /insights, /apply, /privacy, /terms, /cancellations

/apply is the booking page. The sitemap lists every indexable page with a `lastmod` date.

## Booking flow (October 2026)
/apply is the booking page: Calendly inline embed, no form. UTM parameters (or, if none, a utm_source worked out from the referring site, e.g. chatgpt.com, perplexity.ai, gemini.google.com, claude.ai, google) are passed to Calendly by prosper-track.js. Every site CTA reads "Book a discovery call" ("Book a call" in the mobile header).

## Routes (public, excluded from sitemap and nav)
/apply/book (noindex). Now a thin redirect to /apply (meta refresh and JS), also forced with a 301 in `_redirects`. File left in place per the drag-upload workflow constraint.

## Routes removed from nav, force-redirected
/packages redirects to / (301, forced via `_redirects`). `packages.html` stays in the repo but is `noindex` with a canonical to `/`, and is not in the sitemap. The old pricing and 70-biomarker content in that file is never served.

## Analytics
- `site-config.js` holds `ANALYTICS_PROVIDER` (null, "cloudflare" or "plausible") and `ANALYTICS_ID`.
- `analytics-loader.js` is loaded with `defer` from the head of every page (not packages, which is redirected). `site-config.js` must load before it. Pages whose body already includes `site-config.js` rely on `defer` for that order; other pages load it in the head.
- "cloudflare": set `ANALYTICS_ID` to the Cloudflare Web Analytics beacon token. The loader injects `https://static.cloudflareinsights.com/beacon.min.js` with `data-cf-beacon`.
- "plausible": the loader injects `https://plausible.io/js/script.js` with `data-domain="prosper-clinic.com"`. No ID needed.
- Update the privacy policy wording before switching either on.

## SEO and AI visibility
- Every indexable page has a unique title (under 60 characters), a description (under 155), canonical, robots meta, theme-color, Open Graph and Twitter tags, and one JSON-LD `@graph`.
- Shared graph nodes, identical on every page: `https://prosper-clinic.com/#org` (MedicalBusiness and MedicalClinic, alternateName "Prosper Clinic"), `#dr-george` (Person and Physician, jobTitle "Performance and longevity doctor") and `#website`. Each page adds a WebPage-type node (`<url>#webpage`) and a BreadcrumbList (`<url>#breadcrumb`).
- Page-specific nodes: FAQPage on `/` and `/longevity-medicine-uk` (questions and answers copied from the visible FAQ; if the visible FAQ text changes, update the JSON-LD to match), Service for Prosper Clarity on `/how-it-works`, Service for Prosper Continuum on `/prosper-continuum`.
- No prices or Offer nodes in schema, meta or `llms.txt`.
- New page checklist: copy the head of a similar page, change title, description, canonical, og:url, twitter tags and the WebPage and BreadcrumbList nodes, keep the shared nodes unchanged, add the page to `sitemap.xml` and to `llms.txt`.
- `llms.txt` summarises the site for AI assistants. `robots.txt` explicitly allows the main AI search and assistant crawlers, each with `Disallow: /apply/book`.
- `_headers` sets security headers (no CSP, so Calendly and Formspree are unaffected) and short caching for images and scripts.
- Credentials everywhere (visible and schema): BSc(Hons) MBChB PGDipSEM DipFSEM, GMC number 7658884. Set by George 17 Oct 2026. No Gary Brecka references anywhere on the site (George, 17 Oct 2026).

## Routes removed entirely (20 July 2026)
/complaints — not built. No page, no nav link, no footer link, no sitemap entry. Any complaint-handling wording on /terms or /privacy points to CONTACT_EMAIL directly.

## Analytics events
Instrumented in prosper-track.js via window.prosperTrack(name, props), which forwards to Plausible, Umami or gtag if loaded and otherwise does nothing (Cloudflare Web Analytics has no custom events):
- cta_click (location: nav, nav_mobile, hero, who_for, programme, approach, final_cta, sticky_bar, body)
- book_page_view (/apply)
- discovery_call_booked (on Calendly's calendly.event_scheduled message; utm_source attached)
Not instrumented: coach_enquiry_submit. Retired: apply_click, apply_submit, priority_list_submit.


## Deploy trigger note
Trivial edit to trigger the first Netlify branch-deploy build for prosper-v2, 21 July 2026.
