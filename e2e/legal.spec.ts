import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./checks";
import { legalItems } from "../src/components/brand/nav-items";
import cgu from "../src/content/legal/fr/cgu.json";
import cgv from "../src/content/legal/fr/cgv.json";
import charte from "../src/content/legal/fr/charte.json";
import confidentialite from "../src/content/legal/fr/confidentialite.json";
import en from "../src/i18n/messages/en.json";
import fr from "../src/i18n/messages/fr.json";

// The same files the /creer documents popups render.
const drafts: Record<string, { h?: string; p?: string }[]> = { cgu, cgv, charte, confidentialite };

const locales = [
  { prefix: "", messages: fr, lang: "fr" },
  { prefix: "/en", messages: en, lang: "en" },
] as const;

for (const { prefix, messages, lang } of locales) {
  test.describe(`legal pages (${lang})`, () => {
    test("each footer link opens its page: title, draft banner, the draft text", async ({ page }) => {
      for (const { href, key } of legalItems) {
        await page.goto(prefix || "/");
        await page.getByRole("contentinfo").getByRole("link", { name: messages.Footer[key], exact: true }).click();
        await expect(page).toHaveURL(`${prefix}${href}`);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(messages.Footer[key]);
        await expect(page.getByText(messages.Legal.draftBanner)).toBeVisible();

        if (key === "mentionsLegales") {
          await expect(page.getByText(messages.Legal.mentionsPending)).toBeVisible();
          continue;
        }
        const headings = drafts[key].flatMap((b) => (b.h ? [b.h] : []));
        await expect(page.locator("main article h2")).toHaveText(headings);
        await expect(page.locator("main article [lang=fr] > p")).toHaveCount(drafts[key].length - headings.length);
        const frenchOnly = page.getByText(messages.Legal.frenchOnly);
        if (lang === "en") await expect(frenchOnly).toBeVisible();
        else await expect(frenchOnly).toHaveCount(0);
      }
    });

    test("no sideways scroll, no serious axe issues", async ({ page }) => {
      for (const { href } of legalItems) {
        await page.goto(`${prefix}${href}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${href}: no sideways scroll`).toBeLessThanOrEqual(0);
        const { violations } = await new AxeBuilder({ page }).analyze();
        const blocking = violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical" || v.id === "heading-order",
        );
        expect(blocking.map((v) => `${href} ${v.id}: ${v.help}`)).toEqual([]);
      }
    });
  });
}
