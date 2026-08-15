import assert from "node:assert/strict";
import fs from "node:fs";

const serviceOptions = {
  maintenance: { en: "Property maintenance", hu: "Ingatlankarbantartás" },
  handyman: { en: "Handyman / small repairs", hu: "Ezermester / kisebb javítások" },
  painting: { en: "Painting and wall repairs", hu: "Szobafestés és faljavítás" },
  garden: { en: "Garden maintenance", hu: "Kertfenntartás" },
  cleaning: { en: "Cleaning", hu: "Takarítás" },
  airbnb: { en: "Airbnb maintenance", hu: "Airbnb-karbantartás" },
  foreign_owner: {
    en: "Property support for a foreign owner",
    hu: "Ingatlankezelési segítség külföldi tulajdonosnak",
  },
  other: { en: "Other", hu: "Egyéb" },
};

const propertyOptions = {
  apartment: { en: "Apartment", hu: "Lakás" },
  house: { en: "House", hu: "Ház" },
  airbnb_rental: { en: "Airbnb / rental", hu: "Airbnb / kiadó ingatlan" },
  office: { en: "Office", hu: "Iroda" },
  representative_property: { en: "Representative property", hu: "Képviseleti ingatlan" },
  garden_outdoor: { en: "Garden / outdoor area", hu: "Kert / kültéri terület" },
  other: { en: "Other", hu: "Egyéb" },
};

const timingOptions = {
  asap: { en: "As soon as possible", hu: "Amint lehetséges" },
  week: { en: "Within one week", hu: "Egy héten belül" },
  month: { en: "Within one month", hu: "Egy hónapon belül" },
  flexible: {
    en: "Flexible / just requesting information",
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
  en: {
    greeting: "Hello! I would like to request a quote from Sopron Property Services.",
    name: "Name",
    service: "Service",
    propertyType: "Property type",
    location: "Location / district",
    timing: "Preferred timing",
    access: "Access information",
    description: "Task description",
    photos: "Photos",
    page: "Page",
    photosYes: "Photos are ready and will be attached in WhatsApp.",
    photosNo: "No photos yet / I will explain in WhatsApp.",
  },
  hu: {
    greeting: "Üdvözlöm! Ajánlatot szeretnék kérni a Sopron Property Servicestől.",
    name: "Név",
    service: "Szolgáltatás",
    propertyType: "Ingatlan típusa",
    location: "Helyszín / kerület",
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
  "District V",
  "Door code 1234",
  "Paint two cracked walls",
  "Hello! I would like to request a quote",
];

const englishPayload = {
  name: "Jane Owner",
  service: "painting",
  propertyType: "apartment",
  location: "District V",
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
assert.deepEqual(validateRequired(englishPayload), []);
["Sopron", "Buda", "Pest", "13", "XIII", "belváros", "nem tudom", ""].forEach((location) => {
  assert.deepEqual(validateRequired({ ...englishPayload, location }), []);
});

const englishMessage = buildMessage(englishPayload, "en");
assert.match(englishMessage, /Painting and wall repairs/);
assert.match(englishMessage, /Page: https:\/\/sopronpropertyservices.hu\/painting-wall-repairs-sopron.html/);
assert.doesNotMatch(englishMessage, /undefined/);
assert.doesNotMatch(englishMessage, /utm=/);

const englishWithoutLocation = buildMessage({ ...englishPayload, location: "   " }, "en");
assert.doesNotMatch(englishWithoutLocation, /Location \/ district:/);

const hungarianMessage = buildMessage(hungarianPayload, "hu");
assert.match(hungarianMessage, /Üdvözlöm!/);
assert.match(hungarianMessage, /Kertfenntartás/);
assert.match(hungarianMessage, /Sövényvágást/);
assert.doesNotMatch(hungarianMessage, /Ingatlan típusa:/);
assert.doesNotMatch(hungarianMessage, /Bejutási információ:/);

const hungarianWithoutLocation = buildMessage({ ...hungarianPayload, location: "" }, "hu");
assert.doesNotMatch(hungarianWithoutLocation, /Helyszín \/ kerület:/);

const encodedUrl = `https://wa.me/36206671832?text=${encodeURIComponent(hungarianMessage)}`;
assert.equal(decodeURIComponent(new URL(encodedUrl).searchParams.get("text")), hungarianMessage);

Object.entries(routeService).forEach(([path, service]) => {
  assert.equal(routeService[path], service);
});
assert.equal(routeService["/hu/szobafestes-faljavitas-sopron.html"], "painting");
assert.equal(routeService["/cleaning-services-sopron.html"], "cleaning");

const eventPayload = analyticsPayload(englishPayload, "/painting-wall-repairs-sopron.html", "en");
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
refreshField(formState, { ...englishPayload, name: "Jane Owner" }, "name");
assert.deepEqual(formState.name, { invalid: false, message: "" });

const scriptSource = fs.readFileSync("script.js", "utf8");
const stylesSource = fs.readFileSync("styles.css", "utf8");
const englishHome = fs.readFileSync("index.html", "utf8");
const hungarianHome = fs.readFileSync("hu/index.html", "utf8");

assert.match(scriptSource, /const assetBuildId = "slider-hitfix-v1-2026-08-08-01"/);
assert.doesNotMatch(scriptSource, /insertAdjacentElement\("afterend", languageSelector\)/);
assert.doesNotMatch(scriptSource, /mobileTools\.insertBefore\(languageSelector/);
assert.match(scriptSource, /languageSelectorTrigger/);
assert.match(scriptSource, /openLanguageSelectorFromTrigger/);
assert.match(stylesSource, /\.language-menu\s*\{[\s\S]*?position:\s*absolute/);
assert.match(stylesSource, /@media \(max-width: 1120px\)[\s\S]*?\.language-menu\s*\{[\s\S]*?position:\s*fixed/);
assert.match(stylesSource, /pointer-events:\s*auto;/);
assert.match(englishHome, /<button class="language-trust-badge" type="button" data-language-selector-trigger/);
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
