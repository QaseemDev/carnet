import { expect, test } from "./checks";
import { legalItems, navItems } from "../src/components/brand/nav-items";

const noindex = ["/creer", "/connexion"];
const all = ["/", ...[...navItems, ...legalItems].map((item) => item.href as string)];
const indexed = all.filter((path) => !noindex.includes(path));
const ogLocale = { fr: "fr_FR", en: "en_GB" } as const;
const localized = (path: string, lang: "fr" | "en") => (lang === "fr" ? path : path === "/" ? "/en" : `/en${path}`);

// Tests run without ALLOW_INDEXING, i.e. as staging.
test.describe("SEO", () => {
  test.describe.configure({ mode: "parallel" });
  test.skip(({ isMobile }) => isMobile, "head tags don't depend on the viewport");

  test("every page has its own title, description, hreflang and share image, in FR and EN", async ({ page }) => {
    const titles = new Set<string>();
    for (const path of all) {
      for (const lang of ["fr", "en"] as const) {
        const url = localized(path, lang);
        await page.goto(url);
        const title = await page.title();
        expect(title, url).not.toBe("");
        titles.add(title);

        const head = page.locator("head");
        await expect(head.locator('meta[name="description"]'), url).toHaveAttribute("content", /.{20}/);
        await expect(head.locator('meta[property="og:title"]'), url).toHaveAttribute("content", /\S/);
        await expect(head.locator('meta[property="og:description"]'), url).toHaveAttribute("content", /\S/);
        await expect(head.locator('meta[property="og:locale"]'), url).toHaveAttribute("content", ogLocale[lang]);
        for (const selector of ['link[rel="canonical"]', 'meta[property="og:url"]']) {
          const tag = head.locator(selector);
          const value = (await tag.getAttribute("href")) ?? (await tag.getAttribute("content"));
          expect(new URL(value!).pathname, `${url} ${selector}`).toBe(url);
        }

        for (const [hreflang, target] of [
          ["fr", localized(path, "fr")],
          ["en", localized(path, "en")],
          ["x-default", localized(path, "fr")],
        ]) {
          const href = await head.locator(`link[rel="alternate"][hreflang="${hreflang}"]`).getAttribute("href");
          expect(new URL(href!).pathname, `${url} ${hreflang}`).toBe(target);
        }

        const image = await head.locator('meta[property="og:image"]').getAttribute("content");
        const response = await page.request.get(new URL(new URL(image!).pathname, page.url()).href);
        expect(response.status(), `${url} og:image`).toBe(200);
      }
    }
    expect(titles.size, "titles are distinct (Home is the brand in both languages)").toBe(all.length * 2 - 1);
  });

  test("sign-up and login are noindex, content pages aren't", async ({ page }) => {
    for (const url of [
      "/creer",
      "/en/creer",
      "/creer/formule/complet",
      "/creer/compte",
      "/connexion",
      "/en/connexion",
    ]) {
      await page.goto(url);
      await expect(page.locator('head meta[name="robots"]'), url).toHaveAttribute("content", /noindex/);
    }
    for (const url of ["/", "/origine", "/en/cgu"]) {
      await page.goto(url);
      await expect(page.locator('head meta[name="robots"]'), url).toHaveCount(0);
    }
  });

  test("robots.txt blocks everything on staging", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toMatch(/User-Agent: \*\s+Disallow: \/\s*$/);
  });

  test("sitemap.xml lists every public page in FR and EN, each with the page's hreflang set", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    const entries = [...body.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, url]) => ({
      loc: new URL(/<loc>([^<]+)<\/loc>/.exec(url)![1]).pathname,
      alternates: Object.fromEntries(
        [...url.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map(([, lang, href]) => [lang, new URL(href).pathname]),
      ),
    }));
    const expected = indexed.flatMap((path) => [localized(path, "fr"), localized(path, "en")]);
    expect(entries.map((e) => e.loc).sort()).toEqual(expected.sort());
    for (const path of indexed) {
      const alternates = { fr: localized(path, "fr"), en: localized(path, "en"), "x-default": localized(path, "fr") };
      for (const lang of ["fr", "en"] as const) {
        expect(entries.find((e) => e.loc === localized(path, lang))!.alternates, localized(path, lang)).toEqual(alternates);
      }
    }
  });
});
