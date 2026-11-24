import { expect, test } from "@playwright/test";

test("public sitemap pages have canonical metadata and reciprocal language links", async ({ page, request, baseURL }) => {
  test.setTimeout(180_000);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const urls = await page.evaluate((xml) => {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagName("loc"), (tag) => tag.textContent!);
  }, await sitemap.text());
  expect(urls.length).toBeGreaterThan(20);

  const checked = await Promise.all(urls.map(async (url) => {
    const { pathname, search } = new URL(url);
    const response = await request.get(new URL(pathname + search, baseURL).href, {
      headers: { "user-agent": "Twitterbot" },
      maxRedirects: 0,
    });
    expect(response.status(), url).toBe(200);
    return { url, html: await response.text() };
  }));
  const metadata = await page.evaluate((pages) => pages.map(({ url, html }) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return {
      url,
      title: doc.title,
      description: doc.querySelector('meta[name="description"]')?.getAttribute("content"),
      canonical: Array.from(doc.querySelectorAll('link[rel="canonical"]'), (node) => new URL(node.getAttribute("href")!, url).href),
      alternate: Array.from(doc.querySelectorAll('link[rel="alternate"][hreflang]'), (node) => ({
        lang: node.getAttribute("hreflang"),
        url: new URL(node.getAttribute("href")!, url).href,
      })),
    };
  }), checked);
  const indexed = new Map(metadata.map((entry) => [entry.url, entry]));
  for (const entry of metadata) {
    expect.soft(entry.title, entry.url).toBeTruthy();
    expect.soft(entry.description, entry.url).toBeTruthy();
    expect.soft(entry.canonical, entry.url).toEqual([entry.url]);
    expect.soft(entry.alternate.some(({ lang }) => lang === "x-default"), entry.url).toBe(true);
    expect.soft(entry.alternate.some(({ lang, url }) => lang !== "x-default" && url === entry.url), entry.url).toBe(true);
    for (const alternate of entry.alternate) {
      if (alternate.lang === "x-default" || !alternate.url) continue;
      expect.soft(indexed.get(alternate.url)?.alternate.some(({ url }) => url === entry.url), alternate.url).toBe(true);
    }
  }
  const localizedTitles = metadata.map(({ url, title }) =>
    `${/^\/en(?:\/|$)/.test(new URL(url).pathname) ? "en" : "es"}:${title}`);
  expect(new Set(localizedTitles).size).toBe(metadata.length);
});

test("robots and public structured data are served in the HTTP response", async ({ page, request, baseURL }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const rules = await robots.text();
  for (const path of ["/admin", "/cms", "/strapi-api", "/api"]) {
    expect(rules.split(/\r?\n/)).toContain(`Disallow: ${path}`);
  }
  expect(rules).toContain("/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  const paths = await page.evaluate((xml) => {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagName("loc"), (tag) => new URL(tag.textContent!).pathname);
  }, await sitemap.text());
  const candidates = [
    { path: "/", types: ["GovernmentOrganization", "WebSite"] },
    { path: paths.find((path) => path.startsWith("/prensa/")), types: ["NewsArticle", "BreadcrumbList"] },
    { path: paths.find((path) => path.startsWith("/portafolio/fichas-proyectos/")), types: ["Place", "BreadcrumbList"] },
  ];
  for (const { path, types } of candidates) {
    if (!path) continue;
    const response = await request.get(new URL(path, baseURL).href, { headers: { "user-agent": "Twitterbot" } });
    expect(response.status(), path).toBe(200);
    const structuredData = await page.evaluate((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return Array.from(doc.querySelectorAll('script[type="application/ld+json"]'),
        (node) => JSON.parse(node.textContent!) as Record<string, unknown>);
    }, await response.text());
    for (const type of types) {
      expect(structuredData.find((entry) => entry["@type"] === type), path).toMatchObject({
        "@context": "https://schema.org",
        "@type": type,
      });
    }
  }
});
