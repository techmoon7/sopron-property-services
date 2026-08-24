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
const germanHome = fs.readFileSync("index.html", "utf8");
const hungarianHome = fs.readFileSync("hu/index.html", "utf8");

assert.match(scriptSource, /const assetBuildId = "mobile-nav-hitfix-v1-2026-08-24-01"/);
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

// Regression tests for the "WhatsApp form jumps instead of opening WhatsApp" bug.
//
// Root cause: the homepage (index.html / hu/index.html) is rendered twice —
// once immediately by script.js against the static markup, then again,
// asynchronously, by script-core.js, which replaces the entire document.body
// via innerHTML once it finishes loading. Binding a live, interactive
// WhatsApp quote form during the first (doomed) pass let a visitor's click or
// typed input be silently destroyed or misdirected onto a different element
// when script-core.js's replacement landed mid-interaction — surfacing as the
// page "jumping" instead of opening WhatsApp. The fix gates quote-form
// rendering/binding on script-core.js's own "render is stable" signal
// (afterHomeRender), with a same-effect fallback if script-core.js fails to
// load at all, so the form is only ever built once, against the final DOM.
assert.match(
  scriptSource,
  /let homeCoreReady = false;/,
  "script.js must track whether script-core.js's render has completed before it is safe to bind the quote form"
);
assert.match(
  scriptSource,
  /if \(homeCoreReady\) bindQuoteForms\(\);/,
  "applyHomeEnhancements must not call bindQuoteForms() until homeCoreReady is true"
);
// The dangerous pre-fix pattern — applyHomeEnhancements calling
// bindQuoteForms() unconditionally on its last line — must not reappear.
// (initStandalonePage, the *other* function that calls bindQuoteForms()
// unconditionally, is fine as-is: service pages never load script-core.js,
// so there is no destructive body.innerHTML replacement race to guard
// against there — only applyHomeEnhancements needs the gate.)
const applyHomeEnhancementsBody = scriptSource.match(
  /const applyHomeEnhancements = \(\) => \{([\s\S]*?)\n {2}\};/
)?.[1];
assert.ok(applyHomeEnhancementsBody, "could not locate applyHomeEnhancements body to inspect");
assert.doesNotMatch(
  applyHomeEnhancementsBody,
  /^\s*bindQuoteForms\(\);\s*$/m,
  "bindQuoteForms() must stay gated behind homeCoreReady inside applyHomeEnhancements, not called unconditionally"
);
assert.match(
  scriptSource,
  /window\.BPS_I18N\.afterHomeRender = \(\) => \{\s*\n\s*homeCoreReady = true;/,
  "afterHomeRender (called by script-core.js once its render is stable) must flip homeCoreReady on"
);
assert.match(
  scriptSource,
  /script\.onerror = \(\) => \{[\s\S]*?homeCoreReady = true;[\s\S]*?applyHomeEnhancements\(\);\s*\n\s*\};/,
  "if script-core.js fails to load, the static fallback form must still become usable"
);

// Regression tests for the "Hungarian pages contain German text" bug: two
// content fields in script-core.js had German copy sitting in their `hu`
// slot (audienceTitle, and the "Neglected yard or garden" situation card),
// and two render functions read a stale `.en` property that no longer
// existed after the EN->DE conversion (always rendering `undefined`/blank
// on German pages). Pin the fixed values and the fixed property reads so
// they cannot silently regress.
const coreSource = fs.readFileSync("script-core.js", "utf8");
assert.match(coreSource, /audienceTitle: \{ hu: "Kiknek hasznos\?", de: "Für wen ist das nützlich\?" \}/);
assert.match(coreSource, /\["Elhanyagolt udvar vagy kert", "Vernachlässigter Hof oder Garten"/);
// Render functions must read the current `.de` field, not the stale `.en`
// key that stopped existing once the site converted from English to German.
assert.match(coreSource, /state\.lang === "hu" \? item\.hu : item\.de/);
assert.match(coreSource, /state\.lang === "hu" \? metric\.hu : metric\.de/);

// Broader sweep: no `hu:`-labeled field in script-core.js should contain
// obviously German prose (distinct German function words/nouns that never
// legitimately appear in Hungarian text). This is the same heuristic used to
// find the two bugs above, kept here so any future edit that reintroduces a
// German string into a Hungarian slot fails the test suite.
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

// Cache-busting version string must be bumped together across script.js,
// styles.css and script-core.js's dynamically-loaded query string, so a
// browser that already cached the old assets picks up the fix.
["index.html", "hu/index.html", "garden-maintenance-sopron.html", "cleaning-services-sopron.html"].forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  assert.match(html, /styles\.css\?v=mobile-nav-hitfix-v1-2026-08-24-01/, `${file}: styles.css version must be bumped`);
  assert.match(html, /script\.js\?v=mobile-nav-hitfix-v1-2026-08-24-01/, `${file}: script.js version must be bumped`);
});

// No empty-fragment / dead `href="#"` links anywhere on the site.
["index.html", "hu/index.html", ...Object.keys(routeService)]
  .filter((path) => path !== "/" && path !== "/hu/")
  .forEach((path) => {
    const file = path.startsWith("/hu/") ? `hu/${path.slice(4)}` : path.replace(/^\//, "");
    const html = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(html, /href="#"/, `${file}: must not contain a dead href="#" link`);
  });

console.log("Quote form tests passed.");
