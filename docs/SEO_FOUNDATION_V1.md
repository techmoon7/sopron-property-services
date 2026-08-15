# SEO Foundation V1

Production domain: `https://sopronpropertyservices.hu`

Baseline protected by backup branch:

- `backup-before-seo-foundation-v1`
- Production commit before this work: `f0b4a50044edf83c42b51d097b27ac69f83c8a22`

## What Changed

- Added crawlable German and Hungarian URL equivalents for all indexable pages. German fully replaces English as the default language at the site root (converted 2026-08-15); no English content remains customer-facing.
- Kept Ukrainian and Chinese as inert, unused client-side data only (never reachable through the language switcher).
- Added self canonicals, reciprocal `hreflang="de"` / `hreflang="hu"` and `x-default` (pointing to German) on each DE/HU page.
- Removed meta keywords from generated page heads.
- Added normalized JSON-LD:
  - Homepage: `LocalBusiness` and `WebSite`
  - Service pages: `LocalBusiness`, `Service`, `BreadcrumbList`
  - Service pages with visible FAQs: `FAQPage`
- Updated sitemap to the full DE/HU canonical set.
- Preserved versioned CSS/JS asset loading with build ID `seo-foundation-v1-2026-07-21-02`.
- Added `scripts/seo-audit.mjs` for repeatable validation.

## Crawlable URL Set

German:

- `https://sopronpropertyservices.hu/`
- `https://sopronpropertyservices.hu/property-maintenance-sopron.html`
- `https://sopronpropertyservices.hu/handyman-services-sopron.html`
- `https://sopronpropertyservices.hu/painting-wall-repairs-sopron.html`
- `https://sopronpropertyservices.hu/garden-maintenance-sopron.html`
- `https://sopronpropertyservices.hu/cleaning-services-sopron.html`
- `https://sopronpropertyservices.hu/airbnb-property-maintenance-sopron.html`
- `https://sopronpropertyservices.hu/property-management-for-foreign-owners-sopron.html`

Hungarian:

- `https://sopronpropertyservices.hu/hu/`
- `https://sopronpropertyservices.hu/hu/ingatlan-karbantartas-sopron.html`
- `https://sopronpropertyservices.hu/hu/ezermester-sopron.html`
- `https://sopronpropertyservices.hu/hu/szobafestes-faljavitas-sopron.html`
- `https://sopronpropertyservices.hu/hu/kertfenntartas-sopron.html`
- `https://sopronpropertyservices.hu/hu/takaritas-sopron.html`
- `https://sopronpropertyservices.hu/hu/airbnb-karbantartas-sopron.html`
- `https://sopronpropertyservices.hu/hu/ingatlankezeles-kulfoldi-tulajdonosoknak-sopron.html`

## Language Behavior

- Route language wins over stored language on initial load.
- German and Hungarian language selections navigate to the equivalent static URL.
- Ukrainian and Chinese data remain in the codebase as unused, unreachable client-side artifacts and are not included in sitemap or `hreflang`.
- No browser-language redirect is used.

## Validation

Run:

```bash
node --check script.js
node --check script-core.js
node scripts/seo-audit.mjs
git diff --check
```

The audit validates metadata, canonicals, hreflang, JSON-LD, internal links, image alt attributes, sitemap consistency and robots sitemap visibility.
