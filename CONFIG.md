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
- DR_GEORGE_CREDENTIALS: Dr George Collins, GMC-registered, BSc(Hons) MBChB DipMSK PGDip

## Integrations (confirmed)
- CALENDLY_URL: https://calendly.com/drgeorge-prosper-clinic/15min
- APPLICATION_FORM_ENDPOINT: https://formspree.io/f/xvzerwyv (used for /apply submissions and the /apply/book priority-list fallback; separate from the legacy waitlist endpoint mnjkojka, which is retired)
- PRIORITY_LIST_DESTINATION: same as APPLICATION_FORM_ENDPOINT until a dedicated endpoint is confirmed

## Unresolved (must remain configurable, do not hardcode a guess)
- GMC_LINK: not set. No GMC link or "check the register" element ships until confirmed (per George's instruction, 20 July 2026: keep plain-text "GMC-registered doctor" everywhere as a confirmed credential, but do not add a clickable register-verification link)
- CANCELLATION_POLICY_WORDING: two-working-days courtesy line on /cancellations awaits George's ruling; shipped as drafted in the copy pack in the meantime
- COMPLAINTS_WORDING / COMPLAINTS_CONTACT: not applicable. Per George's instruction (20 July 2026), the public /complaints page is removed entirely. Any complaint-handling wording elsewhere routes to CONTACT_EMAIL directly, never to a /complaints page
- ANALYTICS_PROVIDER / ANALYTICS_ID: unset (cookieless provider recommended). No analytics script ships until chosen
- FSEM_CLAIM_WORDING: the Faculty of Sport and Exercise Medicine plaque stays in the credentials band under the existing generic subtitle only; no specific relationship claim is made (per George's instruction, 20 July 2026)
- SERVICE_AREA_STATEMENT / CLINICAL_SCOPE_STATEMENT / CLINICAL_GOVERNANCE_WORDING / PRESCRIBING_SCOPE_WORDING: not yet drafted, do not appear on the public site
- PUBLIC_ENTRY_PRICE: unset. Never shown publicly

## Pricing display
- SHOW_PUBLIC_PRICE_GUIDE: false (default, do not change without explicit approval)
- PUBLIC_PRICE_COPY: "Prosper is a private, self-funded service. The recommended pathway and all expected costs are explained clearly before you decide whether to proceed." (the only public money sentence)

## Routes (public, in sitemap)
/, /how-it-works, /for-coaches, /about, /apply, /privacy, /terms, /cancellations

## Routes (public, excluded from sitemap and nav)
/apply/book (noindex, Calendly embed)

## Routes removed from nav, force-redirected
/packages → / (301, forced via `_redirects`, file itself left in place per the drag-upload workflow constraint)

## Routes removed entirely (20 July 2026)
/complaints — not built. No page, no nav link, no footer link, no sitemap entry. Any complaint-handling wording on /terms or /privacy points to CONTACT_EMAIL directly.

## Analytics events (not yet instrumented, placeholder only)
apply_click (source), apply_submit, book_page_view, discovery_call_booked, priority_list_submit, coach_enquiry_submit


## Deploy trigger note
Trivial edit to trigger the first Netlify branch-deploy build for prosper-v2, 21 July 2026.
