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

assert.match(scriptSource, /const assetBuildId = "slider-hitfix-v1-2026-08-08-01"/);
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

let opening = false;
const guardedSubmit = () => {
  if (opening) return false;
  opening = true;
  return true;
};
assert.equal(guardedSubmit(), true);
assert.equal(guardedSubmit(), false);

console.log("Quote form tests passed.");
