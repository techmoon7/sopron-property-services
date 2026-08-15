import fs from "node:fs/promises";
import path from "node:path";

const ROOT = "https://sopronpropertyservices.hu";
const PROJECT_ROOT = process.cwd();
const SITEMAP = path.join(PROJECT_ROOT, "sitemap.xml");
const TIMEOUT_MS = 20000;

const errors = [];
const seenUrls = new Set();
const fetched = new Map();

const fail = (message) => errors.push(message);

const fetchText = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "sopron-property-services-production-smoke" },
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timeout);
  }
};

const fetchHead = async (url) => {
  if (fetched.has(url)) return fetched.get(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "sopron-property-services-production-smoke" },
    });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "sopron-property-services-production-smoke" },
      });
      await response.arrayBuffer();
    }
    fetched.set(url, response);
    return response;
  } finally {
    clearTimeout(timeout);
  }
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pagePathForUrl = (url) => {
  const parsed = new URL(url);
  if (parsed.pathname === "/" || parsed.pathname === "/hu/") return parsed.pathname;
  return parsed.pathname;
};

const resolveInternal = (href, baseUrl) => {
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("https://wa.me/")) return null;
  if (/^(sms|viber|whatsapp):/i.test(href)) return null;
  const url = new URL(href, baseUrl);
  if (url.origin !== ROOT) return null;
  url.search = "";
  return url;
};

const extractUrls = (html, baseUrl) => {
  const assets = [];
  const links = [];
  const attrPattern = /\b(?:src|href|poster)=["']([^"']+)["']/gi;
  let match;
  while ((match = attrPattern.exec(html))) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("data:")) continue;
    const resolved = resolveInternal(raw, baseUrl);
    if (!resolved) continue;
    if (/\.(?:png|jpe?g|webp|svg|gif|css|js|ico|json|xml|txt)$/i.test(resolved.pathname)) assets.push(resolved.href);
    else links.push(resolved.href);
  }

  const urlPattern = /url\((?!['"]?data:)(['"]?)([^'")]+)\1\)/gi;
  while ((match = urlPattern.exec(html))) {
    const raw = match[2].trim();
    const resolved = resolveInternal(raw, baseUrl);
    if (resolved) assets.push(resolved.href);
  }

  return { assets: [...new Set(assets)], links: [...new Set(links)] };
};

const idsForHtml = (html) =>
  [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]).filter(Boolean);

const hrefsForHtml = (html) =>
  [...html.matchAll(/<a\b[^>]*\shref=["']([^"']*)["'][^>]*>/gi)].map((match) => match[1]);

const comparePairsForHtml = (html) => {
  const pairs = [];
  const compareBlocks = [...html.matchAll(/<div[^>]+data-compare[^>]*>([\s\S]*?)<\/div>/gi)];
  for (const block of compareBlocks) {
    const images = [...block[1].matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
    if (images.length >= 2) pairs.push(images.slice(0, 2));
  }
  const previewBlocks = [...html.matchAll(/<button\b[^>]+class=["'][^"']*case-preview[^"']*["'][^>]*>([\s\S]*?)<\/button>/gi)];
  for (const block of previewBlocks) {
    const images = [...block[1].matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
    if (images.length >= 2) pairs.push(images.slice(0, 2));
  }
  return pairs;
};

const sitemapXml = await fs.readFile(SITEMAP, "utf8");
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());

if (!urls.length) fail("sitemap.xml contains no <loc> URLs.");

for (const url of urls) {
  if (seenUrls.has(url)) fail(`Duplicate sitemap URL: ${url}`);
  seenUrls.add(url);
}

const pages = new Map();

for (const url of urls) {
  const { response, text } = await fetchText(url);
  if (response.status !== 200) fail(`Page is not HTTP 200: ${url} -> ${response.status}`);
  if (!/<!DOCTYPE html>/i.test(text.slice(0, 200))) fail(`Page does not start as HTML document: ${url}`);
  pages.set(url, text);

  const ids = idsForHtml(text);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  duplicates.forEach((id) => fail(`Duplicate id "${id}" on ${url}`));

  hrefsForHtml(text).forEach((href) => {
    if (href === "#" || /^javascript:/i.test(href)) fail(`Dead href "${href}" on ${url}`);
  });

  comparePairsForHtml(text).forEach(([first, second]) => {
    if (first === second) fail(`Before/after pair uses the same asset on ${url}: ${first}`);
  });
}

const allAssets = new Set();
const allLinks = new Set();

for (const [url, html] of pages.entries()) {
  const { assets, links } = extractUrls(html, url);
  assets.forEach((asset) => allAssets.add(asset));
  links.forEach((link) => allLinks.add(link));
}

for (const asset of [...allAssets]) {
  const response = await fetchHead(asset);
  if (response.status !== 200) fail(`Asset is not HTTP 200: ${asset} -> ${response.status}`);
}

for (const link of [...allLinks]) {
  const url = new URL(link);
  const cleanHref = `${url.origin}${url.pathname}`;
  const hash = url.hash ? decodeURIComponent(url.hash.slice(1)) : "";
  const response = await fetchHead(cleanHref);
  if (response.status !== 200) {
    fail(`Internal link is not HTTP 200: ${link} -> ${response.status}`);
    continue;
  }
  if (hash) {
    const html = pages.get(cleanHref) || (await fetchText(cleanHref)).text;
    const idPattern = new RegExp(`\\sid=["']${escapeRegExp(hash)}["']`, "i");
    if (!idPattern.test(html)) fail(`Internal hash target missing: ${link}`);
  }
}

if (errors.length) {
  console.error(`Production smoke failed (${errors.length}):`);
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Production smoke passed for ${urls.length} pages, ${allAssets.size} assets and ${allLinks.size} internal links.`);
