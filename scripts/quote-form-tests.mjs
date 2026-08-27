import assert from "node:assert/strict";
import fs from "node:fs";

const serviceOptions = {
  maintenance: { de: "Immobilienpflege", hu: "Ingatlankarbantartás" },
  handyman: { de: "Hausmeisterservice / Kleinreparaturen", hu: "Ezermester / kisebb javítások" },
  painting: { de: "Malerarbeiten und Wandreparaturen", hu: "Szobafestés és faljavítás" },
  garden: { de: "Gartenpflege", hu: "Kertfenntartás" },
  cleaning: { de: "Reinigung", hu: "Takarítás" },
  airbnb: { de: "Airbnb-Betreuung", hu: "Airbnb-karbantartás" },
  foreign_owner: {
    de: "Betreuung für ausländische Eigentümer",
    hu: "Ingatlankezelési segítség külföldi tulajdonosnak",
  },
  other: { de: "Sonstiges", hu: "Egyéb" },
};

const propertyOptions = {
  apartment: { de: "Wohnung", hu: "Lakás" },
  house: { de: "Haus", hu: "Ház" },
  airbnb_rental: { de: "Airbnb / Mietobjekt", hu: "Airbnb / kiadó ingatlan" },
  office: { de: "Büro", hu: "Iroda" },
  representative_property: { de: "Repräsentative Immobilie", hu: "Képviseleti ingatlan" },
  garden_outdoor: { de: "Garten / Außenbereich", hu: "Kert / kültéri terület" },
  other: { de: "Sonstiges", hu: "Egyéb" },
};

const timingOptions = {
  asap: { de: "So schnell wie möglich", hu: "Amint lehetséges" },
  week: { de: "Innerhalb einer Woche", hu: "Egy héten belül" },
  month: { de: "Innerhalb eines Monats", hu: "Egy hónapon belül" },
  flexible: {
    de: "Flexibel / nur Informationsanfrage",
    hu: "Rugalmas / egyelőre érdeklődöm",
  },
};

const routeService = {
  "/": "maintenance",
  "/property-maintenance-sopron.html": "maintenance",
  "/handyman-services-sopron.html": "handyman",
  "/painting-wall-repairs-sopron.html": "painting",
  "/garden-maintenance-sopron.html": "garden",
  "/cleaning-services-sopron.html": "cleaning",
  "/airbnb-property-maintenance-sopron.html": "airbnb",
  "/property-management-for-foreign-owners-sopron.html": "foreign_owner",
  "/hu/": "maintenance",
  "/hu/ingatlan-karbantartas-sopron.html": "maintenance",
  "/hu/ezermester-sopron.html": "handyman",
  "/hu/szobafestes-faljavitas-sopron.html": "painting",
  "/hu/kertfenntartas-sopron.html": "garden",
  "/hu/takaritas-sopron.html": "cleaning",
  "/hu/airbnb-karbantartas-sopron.html": "airbnb",
  "/hu/ingatlankezeles-kulfoldi-tulajdonosoknak-sopron.html": "foreign_owner",
};

const labels = {
  de: {
    greeting: "Hallo! Ich möchte gerne ein Angebot von Sopron Property Services anfragen.",
    name: "Name",
    service: "Leistung",
    propertyType: "Immobilientyp",
    location: "Ort / Gegend",
    timing: "Gewünschter Zeitpunkt",
    access: "Zugangsinformationen",
    description: "Aufgabenbeschreibung",
    photos: "Fotos",
    page: "Seite",
    photosYes: "Fotos sind bereit und werden in WhatsApp angehängt.",
    photosNo: "Noch keine Fotos / Ich erkläre es in WhatsApp.",
  },
  hu: {
    greeting: "Üdvözlöm! Ajánlatot szeretnék kérni a Sopron Property Servicestől.",
    name: "Név",
    service: "Szolgáltatás",
    propertyType: "Ingatlan típusa",
    location: "Helyszín / környék",
    timing: "Kívánt időpont",
    access: "Bejutási információ",
    description: "Feladat leírása",
    photos: "Fotók",
    page: "Oldal",
    photosYes: "Vannak fotók, és WhatsAppon csatolom őket.",
    photosNo: "Még nincsenek fotók / WhatsAppon pontosítom.",
  },
};

const sanitizeCanonical = (url) => {
  const canonical = new URL(url);
  canonical.search = "";
  canonical.hash = "";
  return canonical.href;
};

const buildMessage = (payload, lang) => {
  const t = labels[lang];
  const lines = [
    t.greeting,
    "",
    `${t.name}: ${payload.name}`,
    `${t.service}: ${serviceOptions[payload.service][lang]}`,
  ];
  if (payload.propertyType) lines.push(`${t.propertyType}: ${propertyOptions[payload.propertyType][lang]}`);
  if (String(payload.location || "").trim()) lines.push(`${t.location}: ${payload.location.trim()}`);
  lines.push(`${t.timing}: ${timingOptions[payload.timing][lang]}`);
  if (payload.access) lines.push(`${t.access}: ${payload.access}`);
  lines.push(`${t.description}:`);
  lines.push(payload.description);
  lines.push("");
  lines.push(`${t.photos}: ${payload.photosReady ? t.photosYes : t.photosNo}`);
  lines.push(`${t.page}: ${sanitizeCanonical(payload.page)}`);
  return lines.join("\n");
};

const validateRequired = (payload) =>
  ["name", "service", "description", "timing", "consent"].filter((field) => {
    if (field === "consent") return !payload.consent;
    return !String(payload[field] || "").trim();
  });

const analyticsPayload = (payload, path, lang) => ({
  event: "quote_whatsapp_open",
  page_path: path,
  page_language: lang,
  service_type: payload.service,
  property_type: payload.propertyType || "not_selected",
  preferred_timing: payload.timing,
  photos_ready: payload.photosReady,
  form_location: "contact_section",
});

const piiValues = [
  "Jane Owner",
  "Belváros",
  "Door code 1234",
  "Paint two cracked walls",
  "Hallo! Ich möchte gerne ein Angebot",
];

const germanPayload = {
  name: "Jane Owner",
  service: "painting",
  propertyType: "apartment",
  location: "Belváros",
  timing: "week",
  access: "Door code 1234",
  description: "Paint two cracked walls",
  photosReady: true,
  consent: true,
  page: "https://sopronpropertyservices.hu/painting-wall-repairs-sopron.html?utm=test#contact",
};

const hungarianPayload = {
  name: "Kovács Anna",
  service: "garden",
  propertyType: "",
  location: "XII. kerület",
  timing: "flexible",
  access: "",
  description: "Sövényvágást és tavaszi kertfrissítést szeretnék kérni.",
  photosReady: false,
  consent: true,
  page: "https://sopronpropertyservices.hu/hu/kertfenntartas-sopron.html?utm=test#contact",
};

assert.deepEqual(validateRequired({}), ["name", "service", "description", "timing", "consent"]);
assert.deepEqual(validateRequired(germanPayload), []);
["Sopron", "Belváros", "Lővérek", "13", "XIII", "belváros", "nem tudom", ""].forEach((location) => {
  assert.deepEqual(validateRequired({ ...germanPayload, location }), []);
});

const germanMessage = buildMessage(germanPayload, "de");
assert.match(germanMessage, /Malerarbeiten und Wandreparaturen/);
assert.match(germanMessage, /Seite: https:\/\/sopronpropertyservices.hu\/painting-wall-repairs-sopron.html/);
assert.doesNotMatch(germanMessage, /undefined/);
assert.doesNotMatch(germanMessage, /utm=/);

const germanWithoutLocation = buildMessage({ ...germanPayload, location: "   " }, "de");
assert.doesNotMatch(germanWithoutLocation, /Ort \/ Gegend:/);

const hungarianMessage = buildMessage(hungarianPayload, "hu");
assert.match(hungarianMessage, /Üdvözlöm!/);
assert.match(hungarianMessage, /Kertfenntartás/);
assert.match(hungarianMessage, /Sövényvágást/);
assert.doesNotMatch(hungarianMessage, /Ingatlan típusa:/);
assert.doesNotMatch(hungarianMessage, /Bejutási információ:/);

const hungarianWithoutLocation = buildMessage({ ...hungarianPayload, location: "" }, "hu");
assert.doesNotMatch(hungarianWithoutLocation, /Helyszín \/ környék:/);

const encodedUrl = `https://wa.me/36206671832?text=${encodeURIComponent(hungarianMessage)}`;
assert.equal(decodeURIComponent(new URL(encodedUrl).searchParams.get("text")), hungarianMessage);

Object.entries(routeService).forEach(([path, service]) => {
  assert.equal(routeService[path], service);
});
assert.equal(routeService["/hu/szobafestes-faljavitas-sopron.html"], "painting");
assert.equal(routeService["/cleaning-services-sopron.html"], "cleaning");

const eventPayload = analyticsPayload(germanPayload, "/painting-wall-repairs-sopron.html", "de");
const eventJson = JSON.stringify(eventPayload);
piiValues.forEach((value) => assert.equal(eventJson.includes(value), false));
assert.equal(eventPayload.service_type, "painting");
assert.equal(eventPayload.form_location, "contact_section");

const setFieldError = (state, field, message = "") => {
  state[field] = { invalid: Boolean(message), message };
};
const refreshField = (state, payload, field, showErrors = false) => {
  const message = validateRequired(payload).includes(field) ? "Please complete this field." : "";
  if (!message || showErrors) setFieldError(state, field, message);
};
const formState = { name: { invalid: true, message: "Please complete this field." } };
refreshField(formState, { ...germanPayload, name: "Jane Owner" }, "name");
assert.deepEqual(formState.name, { invalid: false, message: "" });

const scriptSource = fs.readFileSync("script.js", "utf8");
const stylesSource = fs.readFileSync("styles.css", "utf8");
const stylesBaseSource = fs.readFileSync("styles-base.css", "utf8");
const germanHome = fs.readFileSync("index.html", "utf8");
const hungarianHome = fs.readFileSync("hu/index.html", "utf8");

assert.match(scriptSource, /const assetBuildId = "card-row-fix-v1-2026-08-24-02"/);
assert.doesNotMatch(scriptSource, /insertAdjacentElement\("afterend", languageSelector\)/);
assert.doesNotMatch(scriptSource, /mobileTools\.insertBefore\(languageSelector/);
assert.match(scriptSource, /languageSelectorTrigger/);
assert.match(scriptSource, /openLanguageSelectorFromTrigger/);
assert.match(stylesSource, /\.language-menu\s*\{[\s\S]*?position:\s*absolute/);
assert.match(stylesSource, /@media \(max-width: 1120px\)[\s\S]*?\.language-menu\s*\{[\s\S]*?position:\s*fixed/);
assert.match(stylesSource, /pointer-events:\s*auto;/);
assert.match(germanHome, /<button class="language-trust-badge" type="button" data-language-selector-trigger/);
assert.match(hungarianHome, /<button class="language-trust-badge" type="button" data-language-selector-trigger/);

["index.html", "hu/index.html"].forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  assert.equal((html.match(/id="langBtn"/g) || []).length, 1);
  assert.equal((html.match(/id="languageMenu"/g) || []).length, 1);
});

// Regression tests for the "WhatsApp form jumps instead of opening WhatsApp"
// bug and the architecture that caused it.
//
// Root cause (fixed by removing the double-render architecture entirely):
// the homepage used to be rendered twice — once immediately by script.js
// against static markup, then again, asynchronously, by a dynamically
// injected script-core.js, which replaced the entire document.body via
// innerHTML once it finished loading. Binding a live, interactive WhatsApp
// quote form during the first (doomed) pass let a visitor's click or typed
// input be silently destroyed or misdirected when the replacement landed
// mid-interaction. The homepage is now complete, final static HTML from the
// first paint onward — there is no second render to race against, so the
// form only ever needs to be bound once, exactly like every service page.
assert.doesNotMatch(scriptSource, /document\.body\.innerHTML\s*=/, "no script may replace the entire page body — the homepage must stay static after load");
assert.doesNotMatch(scriptSource, /homeCoreReady|afterHomeRender|loadCoreScript|script-core/, "the double-render workaround machinery must not reappear");
assert.match(scriptSource, /const initHomePage = \(\) => \{/, "the homepage must have its own single, direct initialization function");
const initHomePageBody = scriptSource.match(/const initHomePage = \(\) => \{([\s\S]*?)\n {2}\};/)?.[1];
assert.ok(initHomePageBody, "could not locate initHomePage body to inspect");
assert.match(initHomePageBody, /bindQuoteForms\(\);/, "initHomePage must bind the quote form directly, with no readiness gate needed");
assert.doesNotMatch(fs.readFileSync("index.html", "utf8"), /<script[^>]*script-core/, "index.html must not load script-core.js");
assert.doesNotMatch(fs.readFileSync("hu/index.html", "utf8"), /<script[^>]*script-core/, "hu/index.html must not load script-core.js");
assert.equal(fs.existsSync("script-core.js"), false, "script-core.js must be deleted, not merely stop being referenced");

// Regression tests for the "Hungarian pages contain German text" bug: two
// content fields had German copy sitting in their `hu` slot (the audience
// section heading, and the "Neglected yard or garden" situation card). Pin
// the fixed, now-static values so they cannot silently regress.
assert.match(fs.readFileSync("index.html", "utf8"), /Für wen ist das nützlich\?/);
assert.match(fs.readFileSync("index.html", "utf8"), /Vernachlässigter Hof oder Garten/);
assert.match(fs.readFileSync("hu/index.html", "utf8"), /Kiknek hasznos\?/);
assert.match(fs.readFileSync("hu/index.html", "utf8"), /Elhanyagolt udvar vagy kert/);

// Broader sweep: no `hu:`-labeled field in script.js's ported project/service
// data (projects, services, problemDetails — the on-demand modal/gallery
// content that still legitimately carries bilingual objects) should contain
// obviously German prose (distinct German function words/nouns that never
// legitimately appear in Hungarian text). This is the same heuristic used to
// find the bugs above, kept here so any future edit reintroduces a German
// string into a Hungarian slot fails the test suite.
const coreSource = scriptSource;
const germanSignal = new RegExp(
  "\\b(" +
    [
      "und", "für", "auf", "mit", "oder", "nicht", "eine", "einer", "einen", "einem",
      "ist", "sind", "wird", "werden", "kann", "können", "sowie", "über", "durch",
      "während", "zwischen", "Sie", "Ihre", "Ihr", "unsere", "unser", "damit", "dabei",
      "wenn", "warum", "welche", "müssen", "sollte", "Häufige", "Fragen", "kein", "keine",
      "keinen", "dieser", "diese", "dieses", "jeder", "jede", "jedes", "beim", "vom",
      "zum", "zur", "allen", "Garten", "Hof", "Büro", "Wand", "Wohnung", "Haus", "Häuser",
      "Reparatur", "Reparaturen", "Reinigung", "Pflege", "Immobilie", "Immobilien",
      "Eigentümer", "Gast", "Gäste", "Zimmer", "Vereinbart", "Vereinbarte", "Trockenbau",
      "Decke", "Außenbereich", "Übergabe", "Umgebung", "Instandhaltung", "Kommunikation",
      "Angebot", "Zeitpunkt", "Zugang", "Aufgabe", "Gegend", "Leistung", "Leistungen",
      "Betreuung", "Verwalter", "Ausführung", "Kontakt",
    ].join("|") +
    ")\\b"
);
const badHuFields = [];
const huFieldRe = /\bhu:\s*"((?:[^"\\]|\\.)*)"/g;
let hf;
while ((hf = huFieldRe.exec(coreSource))) {
  const val = hf[1];
  if (val.includes("ß") || germanSignal.test(val)) {
    badHuFields.push(val);
  }
}
assert.deepEqual(badHuFields, [], `German-looking text found in a "hu:" field: ${JSON.stringify(badHuFields)}`);

let opening = false;
const guardedSubmit = () => {
  if (opening) return false;
  opening = true;
  return true;
};
assert.equal(guardedSubmit(), true);
assert.equal(guardedSubmit(), false);

// Regression tests for the "mobile plus/accordion controls don't work, taps
// jump to the top or to the wrong page" bug.
//
// Root cause: on mobile (<=1120px), .header[data-nav-enhanced="true"]
// .nav-dropdown-menu unconditionally forced `opacity: 1`,
// `pointer-events: auto` and `visibility: visible`, overriding its ancestor
// .nav's `visibility: hidden; pointer-events: none;` closed state. The
// services dropdown therefore stayed hit-testable and rendered (the whole
// .nav container is position:fixed, so this held at every scroll position)
// even while the mobile menu was fully closed, silently absorbing taps meant
// for underlying page content — including the FAQ accordion's plus controls
// on the Gartenpflege page — and occasionally navigating away or jumping to
// a `#anchor` near the top when a dropdown link happened to be hit instead.
// Confirmed live via elementsFromPoint() hit-testing before/after the fix.
const mobileNavDropdownMenuRule = stylesSource.match(
  /\.header\[data-nav-enhanced="true"\] \.nav-dropdown-menu \{([\s\S]*?)\n {2}\}/
)?.[1];
assert.ok(mobileNavDropdownMenuRule, "could not locate the mobile .nav-dropdown-menu rule to inspect");
assert.doesNotMatch(
  mobileNavDropdownMenuRule,
  /visibility:\s*visible/,
  ".nav-dropdown-menu must not force itself visible while its parent .nav is closed"
);
assert.doesNotMatch(
  mobileNavDropdownMenuRule,
  /pointer-events:\s*auto/,
  ".nav-dropdown-menu must not force itself interactive while its parent .nav is closed"
);
assert.doesNotMatch(
  mobileNavDropdownMenuRule,
  /^\s*opacity:\s*1;/m,
  ".nav-dropdown-menu must not force full opacity while its parent .nav is closed"
);
// The legitimate open-state rule (gated on .nav-open) must still exist —
// this guards against "fixing" the bug by deleting the feature instead.
assert.match(
  stylesSource,
  /html\.nav-menu-open \.header\[data-nav-enhanced="true"\]\.nav-open \.nav,\s*\n\s*body\.nav-menu-open \.header\[data-nav-enhanced="true"\]\.nav-open \.nav \{\s*\n\s*opacity: 1 !important;\s*\n\s*pointer-events: auto !important;/,
  "the mobile nav must still become visible/interactive once actually opened"
);

// Regression test for the emergency-fix follow-up bug: the first fix above
// removed the dropdown's forced-visible styling to stop it leaking through
// while the nav is closed, but removed opacity/pointer-events/visibility
// entirely rather than gating them — so the un-scoped desktop base rule
// (`.nav-dropdown-menu { opacity: 0; pointer-events: none; visibility: hidden; }`,
// only lifted by the desktop-only `.nav-dropdown.open` class, which mobile
// never sets — it uses `.mobile-collapsed` instead) took over permanently,
// leaving the services dropdown invisible and dead even while the mobile
// menu was legitimately open. Confirmed live via elementsFromPoint()
// hit-testing, focus(), and the accessibility tree all agreeing the links
// were unreachable, then verified fixed against real Chrome via CDP.
assert.match(
  mobileNavDropdownMenuRule,
  /opacity:\s*0;/,
  ".nav-dropdown-menu must explicitly default to hidden/non-interactive on mobile"
);
assert.match(
  mobileNavDropdownMenuRule,
  /pointer-events:\s*none;/,
  ".nav-dropdown-menu must explicitly default to non-interactive on mobile"
);
assert.match(
  mobileNavDropdownMenuRule,
  /visibility:\s*hidden;/,
  ".nav-dropdown-menu must explicitly default to hidden on mobile"
);
const mobileNavOpenDropdownMenuRule = stylesSource.match(
  /\.header\[data-nav-enhanced="true"\]\.nav-open \.nav-dropdown-menu \{([\s\S]*?)\n {2}\}/
)?.[1];
assert.ok(
  mobileNavOpenDropdownMenuRule,
  "the mobile nav must have its own explicit .header[data-nav-enhanced=\"true\"].nav-open .nav-dropdown-menu rule — " +
    "it must not depend on the desktop-only .nav-dropdown.open class, which mobile never sets"
);
assert.match(mobileNavOpenDropdownMenuRule, /opacity:\s*1;/, "the dropdown must become opaque when the mobile nav is open");
assert.match(mobileNavOpenDropdownMenuRule, /pointer-events:\s*auto;/, "the dropdown must become interactive when the mobile nav is open");
assert.match(mobileNavOpenDropdownMenuRule, /visibility:\s*visible;/, "the dropdown must become visible when the mobile nav is open");

// Regression tests for the "Gartenpflege visual effect is unnecessary" /
// "Reinigungsservice wall-cleaning effect is slow and weak" requests.
//
// The garden hero must no longer run the heavy canvas-based finger-reveal
// effect at all (no replacement animation was requested). The cleaning hero
// keeps the before/after concept but as a lightweight, GPU-only
// (clip-path-driven) comparison slider with no canvas, no pointer-capture
// loop, and no continuous animation.
["garden-maintenance-sopron.html", "hu/kertfenntartas-sopron.html"].forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  assert.doesNotMatch(html, /data-paint-reveal/, `${file}: garden hero must not use the paint-reveal effect`);
});
["cleaning-services-sopron.html", "hu/takaritas-sopron.html"].forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  assert.doesNotMatch(html, /data-paint-reveal/, `${file}: cleaning hero must not use the paint-reveal effect`);
  assert.match(html, /class="service-hero-visual cleaning-compare"/, `${file}: cleaning hero must use the comparison slider`);
  assert.match(html, /data-cleaning-compare-input/, `${file}: cleaning hero must expose the comparison range input`);
});
assert.match(scriptSource, /const bindCleaningCompare = \(\) => \{/);
assert.match(scriptSource, /bindCleaningImageGallery\(\);\s*\n\s*bindCleaningCompare\(\);/);
assert.doesNotMatch(
  scriptSource.match(/const bindCleaningCompare = \(\) => \{([\s\S]*?)\n {2}\};/)?.[1] || "",
  /requestAnimationFrame|setInterval|canvas|PointerEvent/,
  "the cleaning comparison slider must stay a plain, lightweight input-driven control"
);

// Cache-busting is now a single source of truth: every HTML file carries the
// literal placeholder "__ASSET_VERSION__" on styles.css/script.js links (and
// on image src attributes), and only the deploy workflow substitutes it for
// a real value, computed once from the actual shipped file content. There is
// nothing left to hand-edit or forget to bump across 16 files.
["index.html", "hu/index.html", "garden-maintenance-sopron.html", "cleaning-services-sopron.html"].forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  assert.match(html, /styles\.css\?v=__ASSET_VERSION__/, `${file}: styles.css must use the version placeholder`);
  assert.match(html, /script\.js\?v=__ASSET_VERSION__/, `${file}: script.js must use the version placeholder`);
});
const pagesWorkflow = fs.readFileSync(".github/workflows/pages.yml", "utf8");
assert.match(pagesWorkflow, /ASSET_VERSION="\$\(cat styles\.css styles-base\.css script\.js \| sha256sum/, "the deploy workflow must compute the asset version from actual file content, not a hand-written string");
assert.match(pagesWorkflow, /sed -i "s\/__ASSET_VERSION__\/\$ASSET_VERSION\/g"/, "the deploy workflow must substitute the version placeholder across every copied file");

// Regression tests for the "homepage DE/HU / Fotos / Sopron card row overflows
// and its 'Mehr erfahren +' controls overlap the next card" bug.
//
// Root cause: each card's disclosure toggle used
// `.disclosure-icon[data-disclosure-label]`, which turns the normally-small
// 30px circular icon into a wide, nowrap pill ("Mehr erfahren +") sitting in
// a `justify-content: space-between` flex row against the card heading. That
// pill does not fit in a 1/3-width grid column at any viewport and visually
// overlaps the neighbouring card. Fix: the three cards no longer use
// <details>/<summary> disclosure toggles at all — they render as plain
// static cards with the heading, subtitle and (previously hidden) detail
// sentence always visible, stacked vertically with no competing flex row.
["index.html", "hu/index.html"].forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  const statsBlock = html.match(/<div class="stats">([\s\S]*?)\n {10}<\/div>/)?.[1];
  assert.ok(statsBlock, `${file}: could not locate the DE/HU · Fotos · Sopron stats row to inspect`);
  assert.doesNotMatch(statsBlock, /Mehr erfahren|Részletek|disclosure-icon|<details|<summary/, `${file}: the stats row must not contain a disclosure/"Mehr erfahren" control`);
  assert.equal((statsBlock.match(/class="stat"/g) || []).length, 3, `${file}: the stats row must render exactly 3 static cards`);
});
// No negative margins anywhere in the .stat card rules (any breakpoint) —
// negative margins were how the pre-fix layout tried to visually compensate
// for the disclosure row and are explicitly disallowed in the rebuild.
const statPRules = [...stylesSource.matchAll(/\.stat p \{([\s\S]*?)\}/g), ...stylesBaseSource.matchAll(/\.stat p \{([\s\S]*?)\}/g)];
assert.ok(statPRules.length > 0, "could not locate any .stat p rules to inspect");
statPRules.forEach((m) => {
  assert.doesNotMatch(m[1], /margin:\s*-/, "no .stat p rule may use a negative margin");
});
// The 3-column desktop/tablet grid must collapse to a single stacked column
// on mobile via an explicit, correctly-scoped selector (not left to lose a
// specificity fight against the unconditional 3-column homepage rule).
assert.match(
  stylesSource,
  /@media \(max-width: 620px\) \{\s*\n\s*body:not\(\.service-page\) \.stats \{\s*\n\s*grid-template-columns: 1fr;/,
  "the homepage stats row must explicitly stack to one column at <=620px"
);

// Regression test for the "unused paint-reveal JavaScript still runs on
// pages that don't use the effect" performance issue: bindPaintReveal must
// bail out immediately, before any of its setup work, when the page has no
// [data-paint-reveal] element at all (true for the garden and cleaning
// pages after the effect was removed/replaced).
assert.match(
  scriptSource,
  /const bindPaintReveal = \(\) => \{\s*\n\s*if \(!document\.querySelector\("\[data-paint-reveal\]"\)\) return;/,
  "bindPaintReveal must return immediately on pages with no paint-reveal elements"
);

// No empty-fragment / dead `href="#"` links anywhere on the site.
["index.html", "hu/index.html", ...Object.keys(routeService)]
  .filter((path) => path !== "/" && path !== "/hu/")
  .forEach((path) => {
    const file = path.startsWith("/hu/") ? `hu/${path.slice(4)}` : path.replace(/^\//, "");
    const html = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(html, /href="#"/, `${file}: must not contain a dead href="#" link`);
  });

// Regression tests for the homepage re-architecture: project filtering must
// show/hide the existing static cards, never regenerate the page.
assert.match(scriptSource, /const applyProjectFilter = \(filterValue\) => \{/, "project filtering must be a dedicated, non-destructive function");
const applyProjectFilterBody = scriptSource.match(/const applyProjectFilter = \(filterValue\) => \{([\s\S]*?)\n {2}\};/)?.[1];
assert.ok(applyProjectFilterBody, "could not locate applyProjectFilter body to inspect");
assert.match(applyProjectFilterBody, /card\.hidden = !matches;/, "project filtering must toggle the native `hidden` attribute on existing cards");
assert.doesNotMatch(applyProjectFilterBody, /innerHTML|render\(\)/, "project filtering must not regenerate any markup");
const filterClickBody = scriptSource.match(/document\.querySelectorAll\("\[data-project-filter\]"\)\.forEach\(\(btn\) => \{([\s\S]*?)\n {4}\}\);/)?.[1];
assert.ok(filterClickBody, "could not locate the project-filter click handler to inspect");
assert.doesNotMatch(filterClickBody, /render\(\)|scrollIntoView|location\.hash/, "clicking a project filter must not re-render the page, force a scroll, or touch the URL hash");

// Every project card in the static markup must carry its filter category,
// and there must be exactly one per known category, in both languages.
["index.html", "hu/index.html"].forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  const categories = [...html.matchAll(/data-project-category="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(categories, ["painting", "drywall", "garden", "airbnb", "office", "handyman"], `${file}: project cards must carry their filter category, in order`);
});

// Hash-scroll positioning must happen once, on initial navigation only, and
// must never be wired to fire again on a later, unrelated interaction (that
// re-fire — driven by the old render() call on every project-filter click
// and every language switch — was the "unexpected jump to an old #section"
// bug).
assert.match(scriptSource, /const scrollToInitialHashTarget = \(\) => \{/, "hash-scroll must be its own single-purpose, one-time function");
assert.doesNotMatch(applyProjectFilterBody, /scrollToInitialHashTarget|scheduleHashScroll/, "project filtering must not trigger hash-scroll positioning");
assert.doesNotMatch(scriptSource, /window\.addEventListener\("bps:languagechange"/, "the homepage must not listen for an in-place language-change re-render (real language switches navigate to the other URL instead)");

console.log("Quote form tests passed.");
