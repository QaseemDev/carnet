import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "./checks";
import { navItems } from "../src/components/brand/nav-items";
import en from "../src/i18n/messages/en.json";
import fr from "../src/i18n/messages/fr.json";

const locales = [
  { prefix: "", messages: fr, other: en, lang: "fr" },
  { prefix: "/en", messages: en, other: fr, lang: "en" },
] as const;

const pages = ["", "/origine", "/qui-sommes-nous", "/chemin-de-vie", "/guide-parental", "/communication-bienveillante"];

// Strips next-intl rich tags so a message can be compared with rendered text.
const plain = (s: string) => s.replace(/<br><\/br>/g, " ").replace(/<\/?\w+>/g, "");

// Every image in the page body is served by this site and has loaded.
async function expectLocalImages(page: Page) {
  const images = page.locator("main img");
  await images.evaluateAll((imgs) => imgs.forEach((img) => ((img as HTMLImageElement).loading = "eager")));
  const srcs = await images.evaluateAll((imgs) => (imgs as HTMLImageElement[]).map((img) => img.currentSrc || img.src));
  expect(srcs.length).toBeGreaterThan(0);
  for (const src of srcs) expect(new URL(src).host, src).toBe(new URL(page.url()).host);
  await expect
    .poll(() => images.evaluateAll((imgs) => (imgs as HTMLImageElement[]).filter((i) => !i.naturalWidth).length))
    .toBe(0);
}

// Headings and card titles of these pages, in one language.
function titles(m: typeof fr) {
  return [
    ...Object.values(m.Home.cards).map((c) => c.title),
    ...[m.Origine, m.About, m.Guide, m.Communication].flatMap((p) => [
      p.title,
      ...Object.values(p.cards).map((c) => c.title),
    ]),
    m.Chemin.title,
    ...Object.values(m.Chemin.features).map((f) => f.title),
    ...Object.values(m.Chemin.moments),
  ];
}

for (const { prefix, messages, other, lang } of locales) {
  test.describe(`content pages (${lang})`, () => {
    test("home: hero, then the 8 explore cards in order, each opening its page", async ({ page }) => {
      await page.goto(prefix || "/");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(messages.Brand.title);
      await expect(page.getByText(messages.Home.quote["1"])).toBeVisible();

      const cards = page.locator("main ul > li");
      const keys = Object.keys(messages.Home.cards) as (keyof typeof messages.Home.cards)[];
      await expect(cards.getByRole("heading", { level: 3 })).toHaveText(keys.map((k) => messages.Home.cards[k].title));

      for (const [i, key] of keys.entries()) {
        await page.goto(prefix || "/");
        await cards.nth(i).getByRole("link").click();
        await expect(page).toHaveURL(`${prefix}${navItems.find((n) => n.key === key)!.href}`);
      }
    });

    for (const [path, ns] of [
      ["/origine", "Origine"],
      ["/qui-sommes-nous", "About"],
      ["/guide-parental", "Guide"],
      ["/communication-bienveillante", "Communication"],
    ] as const) {
      test(`${path}: title, 4 sections in order, closing quote`, async ({ page }) => {
        const t = messages[ns];
        await page.goto(`${prefix}${path}`);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.title);
        await expect(page.locator("article h2")).toHaveText(Object.values(t.cards).map((c) => c.title));
        await expect(page.getByText(t.closingQuote)).toBeVisible();
      });
    }

    test("/chemin-de-vie: 9 stages, 3 moments, 4 features, closing quote", async ({ page }) => {
      const t = messages.Chemin;
      await page.goto(`${prefix}/chemin-de-vie`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.title);
      await expect(page.locator("main ol > li")).toHaveCount(9);
      await expect(page.locator("main ol > li").first()).toContainText(plain(t.stages[1].name).split(" ")[0]);
      await expect(page.getByRole("list", { name: t.momentsLabel }).getByRole("listitem")).toHaveText(
        Object.values(t.moments),
      );
      await expect(page.locator("article h2")).toHaveText(Object.values(t.features).map((f) => f.title));
      await expect(page.getByText(t.closingQuote)).toBeVisible();
    });

    test("images load from this site, no text from the other language", async ({ page }) => {
      for (const path of pages) {
        await page.goto(`${prefix}${path}` || "/");
        await expectLocalImages(page);
        const text = await page.locator("main").innerText();
        const own = titles(messages);
        for (const title of titles(other)) if (!own.includes(title)) expect(text, path).not.toContain(title);
      }
    });

    test("no console errors, no sideways scroll, no serious axe issues", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(e.message));
      for (const path of pages) {
        await page.goto(`${prefix}${path}` || "/");
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path}: no sideways scroll`).toBeLessThanOrEqual(0);
        const { violations } = await new AxeBuilder({ page }).analyze();
        // heading-order is only "moderate" but a skipped level is what broke Chemin before.
        const blocking = violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical" || v.id === "heading-order",
        );
        expect(blocking.map((v) => `${path} ${v.id}: ${v.help}`)).toEqual([]);
      }
      expect(errors).toEqual([]);
    });
  });
}
