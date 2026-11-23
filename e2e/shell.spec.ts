import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, expectUsable, test } from "./checks";
import { navItems } from "../src/components/brand/nav-items";
import en from "../src/i18n/messages/en.json";
import fr from "../src/i18n/messages/fr.json";

const locales = [
  { prefix: "", messages: fr, lang: "fr" },
  { prefix: "/en", messages: en, lang: "en" },
] as const;

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1280;

// Collects console errors and requests to banned CDNs for the whole test.
function watch(page: Page) {
  const errors: string[] = [];
  const cdn: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => /fonts\.googleapis\.com|cdnjs\.cloudflare\.com/.test(r.url()) && cdn.push(r.url()));
  return { errors, cdn };
}

// Ported pages have their own title; the rest are placeholders titled like the menu.
function pageTitle(messages: typeof fr, key: (typeof navItems)[number]["key"]) {
  const titles: Partial<Record<typeof key, string>> = {
    origine: messages.Origine.title,
    quiSommesNous: messages.About.title,
    cheminDeVie: messages.Chemin.title,
    guideParental: messages.Guide.title,
    communication: messages.Communication.title,
    exemple: messages.Exemple.header.carnet,
    connexion: messages.Login.title,
    contact: messages.Contact.title,
    creer: messages.Creation.title,
  };
  return titles[key] ?? messages.Nav[key];
}

async function openMenu(page: Page) {
  if (isPhone(page)) await page.getByRole("button", { name: /menu/i }).click();
}

for (const { prefix, messages, lang } of locales) {
  test.describe(`shell (${lang})`, () => {
    test("every menu item opens its page; back, forward and reload keep it", async ({ page }) => {
      const seen = watch(page);
      await page.goto(prefix || "/");
      await expect(page.locator("html")).toHaveAttribute("lang", lang);

      for (const item of navItems) {
        await openMenu(page);
        await page.getByRole("link", { name: messages.Nav[item.key], exact: true }).click();
        await expect(page).toHaveURL(`${prefix}${item.href}`);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(pageTitle(messages, item.key));
        if (isPhone(page)) await expect(page.getByRole("dialog")).toBeHidden();
      }

      await page.goBack();
      await expect(page).toHaveURL(`${prefix}${navItems.at(-2)!.href}`);
      await page.goForward();
      await expect(page).toHaveURL(`${prefix}${navItems.at(-1)!.href}`);
      await page.reload();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(pageTitle(messages, navItems.at(-1)!.key));

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, "no sideways scroll").toBeLessThanOrEqual(0);
      expect(seen.errors).toEqual([]);
      expect(seen.cdn).toEqual([]);
    });

    test("language switcher keeps the page", async ({ page }) => {
      await page.goto(`${prefix}/origine`);
      const other = lang === "fr" ? { code: "en", path: "/en/origine" } : { code: "fr", path: "/origine" };
      const switcher = page.getByRole("navigation", { name: messages.LanguageSwitcher.label });
      await expect(switcher.getByRole("link", { name: lang })).toHaveAttribute("aria-current", "true");
      await switcher.getByRole("link", { name: other.code }).click();
      await expect(page).toHaveURL(other.path);
      await expect(page.locator("html")).toHaveAttribute("lang", other.code);
    });

    test("unknown page is a styled 404 with a link home", async ({ page }) => {
      for (const path of ["/page.md", "/x/fichier.txt"]) {
        expect((await page.goto(`${prefix}${path}`))?.status(), path).toBe(404);
      }
      const response = await page.goto(`${prefix}/une-page-qui-nexiste-pas`);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(messages.NotFound.title);
      await page.getByRole("link", { name: messages.NotFound.home }).click();
      await expect(page).toHaveURL(prefix || "/");
    });

    test("no serious or critical axe issues", async ({ page }) => {
      for (const path of ["", "/origine", "/une-page-qui-nexiste-pas"]) {
        await page.goto(`${prefix}${path}` || "/");
        const { violations } = await new AxeBuilder({ page }).analyze();
        const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      }
    });
  });
}

test("phone menu closes with Esc and returns focus to its button", async ({ page }) => {
  test.skip(!isPhone(page), "phone only");
  await page.goto("/");
  const button = page.getByRole("button", { name: /menu/i });
  await button.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectUsable(page, "menu");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(button).toBeFocused();
});
