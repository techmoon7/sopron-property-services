import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = "https://sopronpropertyservices.hu";
const routes = {
  home: { en: "/", hu: "/hu/" },
  maintenance: { en: "/property-maintenance-sopron.html", hu: "/hu/ingatlan-karbantartas-sopron.html" },
  handyman: { en: "/handyman-services-sopron.html", hu: "/hu/ezermester-sopron.html" },
  painting: { en: "/painting-wall-repairs-sopron.html", hu: "/hu/szobafestes-faljavitas-sopron.html" },
  garden: { en: "/garden-maintenance-sopron.html", hu: "/hu/kertfenntartas-sopron.html" },
  cleaning: { en: "/cleaning-services-sopron.html", hu: "/hu/takaritas-sopron.html" },
  airbnb: { en: "/airbnb-property-maintenance-sopron.html", hu: "/hu/airbnb-karbantartas-sopron.html" },
  foreignOwners: {
    en: "/property-management-for-foreign-owners-sopron.html",
    hu: "/hu/ingatlankezeles-kulfoldi-tulajdonosoknak-sopron.html",
  },
};

const pages = Object.entries(routes).flatMap(([key, value]) =>
  ["en", "hu"].map((lang) => {
    const urlPath = value[lang];
    const file =
      urlPath === "/"
        ? "index.html"
        : urlPath === "/hu/"
          ? "hu/index.html"
          : urlPath.replace(/^\//, "");
    return { key, lang, path: urlPath, file, url: `${site}${urlPath}` };
  })
);

const errors = [];
const fail = (message) => errors.push(message);
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i"))?.[1] || "";
const tags = (html, pattern) => [...html.matchAll(pattern)].map((match) => match[0]);
const contentAttr = (html, selector) => html.match(selector)?.[1] || "";
const stripTags = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const routeByPath = new Map();
pages.forEach((page) => {
  routeByPath.set(page.path, page);
  if (page.path === "/") routeByPath.set("/index.html", page);
  if (page.path === "/hu/") routeByPath.set("/hu/index.html", page);
});

const internalFileForHref = (fromFile, href) => {
  if (!href || href.startsWith("#")) return null;
  if (/^(tel:|mailto:|sms:|whatsapp:|javascript:)/i.test(href)) return null;
  if (/^https?:\/\//i.test(href) && !href.startsWith(site)) return null;

  let raw = href.startsWith(site) ? href.slice(site.length) || "/" : href;
  raw = raw.split("#")[0].split("?")[0];
  if (!raw) return null;

  if (raw.startsWith("/")) {
    const route = routeByPath.get(raw);
    if (route) return route.file;
    return raw.replace(/^\//, "");
  }

  const resolved = path
    .normalize(path.join(path.dirname(fromFile), raw))
    .replaceAll(path.sep, "/");
  const route = [...routeByPath.values()].find((page) => page.file === resolved);
  return route?.file || resolved;
};

for (const page of pages) {
  if (!fs.existsSync(path.join(root, page.file))) fail(`${page.file}: file missing`);
  const html = read(page.file);
  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] || "";
  const body = html.match(/<body[\s\S]*?<\/body>/i)?.[0] || "";

  const htmlTag = html.match(/<html[^>]*>/i)?.[0] || "";
  if (attr(htmlTag, "lang") !== page.lang) fail(`${page.file}: html lang is not ${page.lang}`);
  if (attr(htmlTag, "data-page-language") !== page.lang) fail(`${page.file}: data-page-language is not ${page.lang}`);

  const titleCount = tags(head, /<title[\s\S]*?<\/title>/gi).length;
  if (titleCount !== 1) fail(`${page.file}: expected exactly one title, found ${titleCount}`);
  const title = contentAttr(head, /<title>([\s\S]*?)<\/title>/i);
  if (!title.trim()) fail(`${page.file}: title is empty`);

  const descriptions = tags(head, /<meta\s+name=["']description["'][^>]*>/gi);
  if (descriptions.length !== 1) fail(`${page.file}: expected exactly one meta description, found ${descriptions.length}`);
  if (!attr(descriptions[0] || "", "content").trim()) fail(`${page.file}: meta description is empty`);
  if (/<meta\s+name=["']keywords["']/i.test(head)) fail(`${page.file}: meta keywords must not be present`);

  const robots = tags(head, /<meta\s+name=["']robots["'][^>]*>/gi);
  if (robots.length !== 1 || !/index,\s*follow/i.test(attr(robots[0] || "", "content"))) fail(`${page.file}: robots meta must be index, follow`);

  const canonicals = tags(head, /<link\s+rel=["']canonical["'][^>]*>/gi);
  if (canonicals.length !== 1 || attr(canonicals[0] || "", "href") !== page.url) fail(`${page.file}: canonical mismatch`);

  for (const lang of ["en", "hu"]) {
    const alternate = tags(head, new RegExp(`<link\\s+rel=["']alternate["'][^>]*hreflang=["']${lang}["'][^>]*>`, "gi"))[0];
    if (!alternate || attr(alternate, "href") !== `${site}${routes[page.key][lang]}`) fail(`${page.file}: missing ${lang} hreflang`);
  }
  const xDefault = tags(head, /<link\s+rel=["']alternate["'][^>]*hreflang=["']x-default["'][^>]*>/gi)[0];
  if (!xDefault || attr(xDefault, "href") !== `${site}${routes[page.key].en}`) fail(`${page.file}: missing x-default hreflang`);

  const h1s = tags(body, /<h1\b[\s\S]*?<\/h1>/gi);
  if (h1s.length !== 1) fail(`${page.file}: expected exactly one H1, found ${h1s.length}`);
  if (h1s[0] && !stripTags(h1s[0])) fail(`${page.file}: H1 is empty`);

  const jsonScripts = [...head.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
  if (!jsonScripts.length) fail(`${page.file}: missing JSON-LD`);
  const jsonTypes = [];
  for (const jsonText of jsonScripts) {
    try {
      const parsed = JSON.parse(jsonText);
      const graph = parsed["@graph"] || [parsed];
      graph.forEach((node) => jsonTypes.push(node["@type"]));
    } catch (error) {
      fail(`${page.file}: invalid JSON-LD (${error.message})`);
    }
  }
  if (page.key === "home") {
    if (!jsonTypes.includes("LocalBusiness")) fail(`${page.file}: homepage missing LocalBusiness schema`);
    if (!jsonTypes.includes("WebSite")) fail(`${page.file}: homepage missing WebSite schema`);
  } else {
    if (!jsonTypes.includes("Service")) fail(`${page.file}: service page missing Service schema`);
    if (!jsonTypes.includes("BreadcrumbList")) fail(`${page.file}: service page missing BreadcrumbList schema`);
    if (/<details\b[^>]*class=["'][^"']*faq/i.test(body) && !jsonTypes.includes("FAQPage")) {
      fail(`${page.file}: visible FAQ exists but FAQPage schema is missing`);
    }
  }

  for (const link of tags(html, /<a\b[^>]*href=["'][^"']*["'][^>]*>/gi)) {
    const href = attr(link, "href");
    if (!href || href === "#") fail(`${page.file}: empty or bare hash link`);
    const target = internalFileForHref(page.file, href);
    if (target && !fs.existsSync(path.join(root, target))) fail(`${page.file}: broken internal href ${href} -> ${target}`);
  }

  for (const image of tags(html, /<img\b[^>]*>/gi)) {
    if (!attr(image, "alt")) fail(`${page.file}: image missing alt attribute`);
    const src = attr(image, "src");
    const target = internalFileForHref(page.file, src);
    if (target && !fs.existsSync(path.join(root, target))) fail(`${page.file}: missing local image ${src} -> ${target}`);
  }
}

const sitemap = read("sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const expectedUrls = pages.map((page) => page.url);
const duplicateUrls = sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index);
if (duplicateUrls.length) fail(`sitemap.xml: duplicate URLs: ${duplicateUrls.join(", ")}`);
for (const expected of expectedUrls) {
  if (!sitemapUrls.includes(expected)) fail(`sitemap.xml: missing ${expected}`);
}
for (const url of sitemapUrls) {
  if (!expectedUrls.includes(url)) fail(`sitemap.xml: unexpected ${url}`);
}

const robots = read("robots.txt");
if (!/Sitemap:\s*https:\/\/sopronpropertyservices\.hu\/sitemap\.xml/i.test(robots)) fail("robots.txt: missing sitemap directive");
if (/Disallow:\s*\/hu/i.test(robots)) fail("robots.txt: /hu is blocked");

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`SEO audit passed for ${pages.length} indexable pages.`);
