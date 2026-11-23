import type { Page } from "@playwright/test";
import { expect, expectUsable, test } from "./checks";
import en from "../src/i18n/messages/en.json";
import fr from "../src/i18n/messages/fr.json";

const locales = [
  { prefix: "", messages: fr, lang: "fr" },
  { prefix: "/en", messages: en, lang: "en" },
] as const;

const typed = { email: "parent@example.test", password: "seed-password-1", text: "Bonjour seed" };

// Visual-only forms: once the page is idle, nothing that was typed may leave the
// browser (no POST, no value in any URL or body) and the address stays the same.
async function expectNothingSent(page: Page, submit: () => Promise<void>) {
  await page.waitForLoadState("networkidle");
  const url = page.url();
  const leaks: string[] = [];
  page.on("request", (r) => {
    const sent = `${r.url()} ${r.postData() ?? ""}`;
    if (
      r.method() !== "GET" ||
      Object.values(typed).some((v) => sent.includes(encodeURIComponent(v)) || sent.includes(v))
    )
      leaks.push(`${r.method()} ${r.url()}`);
  });
  await submit();
  await page.waitForLoadState("networkidle");
  expect(leaks).toEqual([]);
  expect(page.url()).toBe(url);
}

for (const { prefix, messages, lang } of locales) {
  const { Contact, Login, Forms } = messages;

  test.describe(`contact and connexion (${lang})`, () => {
    test("contact: errors next to each field, then the sent popup", async ({ page }) => {
      await page.goto(`${prefix}/contact`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(Contact.title);

      const name = page.getByLabel(Contact.name);
      const email = page.getByLabel(Contact.email);
      const message = page.getByLabel(Contact.message);
      await page.getByRole("button", { name: Contact.submit }).click();
      for (const field of [name, email, message]) {
        await expect(field).toHaveAttribute("aria-invalid", "true");
        await expect(field).toHaveAccessibleDescription(Forms.required);
      }
      await expect(name).toBeFocused();
      // The error border is terracotta too, so focus must still show its own outline.
      await expect(name).not.toHaveCSS("outline-style", "none");
      await expectUsable(page, "contact errors");

      await name.fill("Seed Parent");
      await expect(name).not.toHaveAttribute("aria-invalid");
      await email.fill("pas-un-email");
      await message.fill(typed.text);
      await page.getByRole("button", { name: Contact.submit }).click();
      await expect(email).toHaveAccessibleDescription(Forms.email);
      await expect(email).toBeFocused();

      await email.fill(typed.email);
      await expectNothingSent(page, () => page.getByRole("button", { name: Contact.submit }).click());
      const dialog = page.getByRole("dialog", { name: Contact.sentTitle });
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(Contact.sentText);
      await expectUsable(page, "contact sent");
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();

      await page.getByRole("button", { name: Contact.submit }).click();
      await dialog.getByRole("button", { name: Forms.ok }).click();
      await expect(dialog).toBeHidden();
    });

    test("connexion: hidden password, info popup, nothing sent", async ({ page }) => {
      await page.goto(`${prefix}/connexion`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(Login.title);

      const password = page.getByLabel(Login.password, { exact: true });
      await expect(password).toHaveAttribute("type", "password");
      await page.getByRole("button", { name: Login.submit }).click();
      await expect(page.getByLabel(Login.email)).toHaveAccessibleDescription(Forms.required);

      await page.getByLabel(Login.email).fill(typed.email);
      await password.fill(typed.password);
      await expectNothingSent(page, () => page.getByRole("button", { name: Login.submit }).click());
      const info = page.getByRole("dialog", { name: Login.infoTitle });
      await expect(info).toContainText(Login.infoText);
      await expectUsable(page, "login info");
      await page.keyboard.press("Escape");
      await expect(info).toBeHidden();
    });

    test("connexion: forgot-password popup closes with Esc and returns focus", async ({ page }) => {
      await page.goto(`${prefix}/connexion`);
      const forgot = page.getByRole("button", { name: Login.forgot });
      await forgot.click();
      const help = page.getByRole("dialog", { name: Login.forgot });
      await expect(help).toBeVisible();
      await expect(help.getByRole("status")).toBeHidden();

      await help.getByLabel(Login.help.email).fill(typed.email);
      await expectNothingSent(page, () => help.getByRole("button", { name: Login.help.submit }).click());
      await expect(help.getByRole("status")).toHaveText(Login.help.sent);
      await expect(help).toBeVisible();
      await expectUsable(page, "password help");

      await page.keyboard.press("Escape");
      await expect(help).toBeHidden();
      await expect(forgot).toBeFocused();

      await forgot.click();
      await expect(help.getByRole("status")).toBeHidden();
      await help.getByRole("button", { name: Forms.back }).click();
      await expect(help).toBeHidden();
    });

    test("connexion: the create link opens /creer", async ({ page }) => {
      await page.goto(`${prefix}/connexion`);
      await page.getByRole("link", { name: Login.create }).click();
      await expect(page).toHaveURL(`${prefix}/creer`);
    });

    test("no console errors, no sideways scroll, no serious axe issues", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(e.message));
      for (const path of ["/contact", "/connexion"]) {
        await page.goto(`${prefix}${path}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path}: no sideways scroll`).toBeLessThanOrEqual(0);
        await expectUsable(page, path);
      }
      expect(errors).toEqual([]);
    });
  });
}
