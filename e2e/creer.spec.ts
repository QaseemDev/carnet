import type { Page } from "@playwright/test";
import { expect, expectUsable, test } from "./checks";
import en from "../src/i18n/messages/en.json";
import fr from "../src/i18n/messages/fr.json";

const locales = [
  { prefix: "", messages: fr, lang: "fr" },
  { prefix: "/en", messages: en, lang: "en" },
] as const;

const typed = {
  first: "Seed",
  last: "Parent",
  child: "Léa",
  email: "parent@example.test",
  password: "seed-password-1",
  note: "Une note de seed",
};

const steps = ["", "/formule/fondement", "/compte", "/documents", "/paiement", "/bienvenue", "/carnet"];
// Steps that need earlier answers: opened directly, they point back to step 1.
const gated = ["/compte", "/documents", "/paiement", "/bienvenue", "/carnet"];

// Fills ICU `{name}` placeholders (prices, ages) in a message.
const fill = (message: string, values: Record<string, number>) =>
  message.replace(/\{(\w+)\}/g, (_, key) => String(values[key]));

// The page's visible step title (earlier steps stay mounted but hidden).
const stepTitle = (page: Page) => page.getByRole("heading", { level: 2 });

const offerCard = (page: Page, title: string) =>
  page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: title, exact: true }) });

for (const { prefix, messages, lang } of locales) {
  const { Creation: C, Forms, Login } = messages;
  const base = `${prefix}/creer`;

  test.describe(`créer mon carnet (${lang})`, () => {
    test("offers: the four prototype prices, each with its own page", async ({ page }) => {
      await page.goto(base);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(C.title);
      await expect(offerCard(page, C.offers.fondement.title)).toContainText(fill(C.offers.price, { price: 149 }));
      for (const slug of ["construction", "transmission"] as const)
        await expect(offerCard(page, C.offers[slug].title)).toContainText(fill(C.offers.price, { price: 119 }));
      await expect(offerCard(page, C.offers.complet.title)).toContainText(
        fill(C.offers.wasPrice, { price: 299, was: 387 }),
      );

      await page.getByRole("link", { name: C.offers.see }).nth(2).click();
      await expect(page).toHaveURL(`${base}/formule/transmission`);
      await expect(stepTitle(page)).toHaveText(C.offers.transmission.title);
      await expect(page.getByRole("heading", { name: C.offers.transmission.extra["1"] })).toBeVisible();

      const missing = await page.goto(`${base}/formule/inconnue`);
      expect(missing?.status()).toBe(404);
    });

    test("full walk from offer to timeline, nothing sent", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(e.message));

      await page.goto(base);
      await page.waitForLoadState("networkidle");
      // From here on, nothing typed may leave the browser: only GETs, none carrying a typed value.
      const leaks: string[] = [];
      page.on("request", (r) => {
        const sent = `${decodeURIComponent(r.url())} ${r.postData() ?? ""}`;
        if (r.method() !== "GET" || Object.values(typed).some((v) => sent.includes(v)))
          leaks.push(`${r.method()} ${r.url()}`);
      });

      // 1 → 2 → 3
      await page.getByRole("link", { name: C.offers.see }).first().click();
      await expect(page).toHaveURL(`${base}/formule/fondement`);
      await expect(stepTitle(page)).toBeFocused();
      await expect(page.locator('[aria-current="step"]')).toContainText(C.steps.plan);
      await page.getByRole("button", { name: fill(C.offers.fondement.cta, { price: 149 }) }).click();
      await expect(page).toHaveURL(`${base}/compte`);
      await expect(stepTitle(page)).toBeFocused();
      await expectUsable(page, "account");

      // 3: errors next to the fields, then a too-short and a mismatched password
      const A = C.account;
      const firstName = page.getByLabel(A.firstName, { exact: true });
      const password = page.getByLabel(A.password, { exact: true });
      const confirm = page.getByLabel(A.confirm, { exact: true });
      const submit = page.getByRole("button", { name: A.submit });
      await submit.click();
      await expect(firstName).toHaveAccessibleDescription(Forms.required);
      await expect(firstName).toBeFocused();
      await expect(page.getByLabel(A.child)).not.toHaveAttribute("aria-invalid");
      await expectUsable(page, "account errors");

      await firstName.fill(typed.first);
      await page.getByLabel(A.lastName, { exact: true }).fill(typed.last);
      await page.getByLabel(A.child).fill(typed.child);
      await page.getByLabel(Login.email).fill(typed.email);
      await password.fill("court");
      await confirm.fill("court");
      await submit.click();
      await expect(password).toHaveAccessibleDescription(Forms.tooShort);
      await password.fill(typed.password);
      await confirm.fill(`${typed.password}x`);
      await submit.click();
      await expect(confirm).toHaveAccessibleDescription(Forms.mismatch);
      await expect(confirm).toBeFocused();
      // Fixing either password clears the mismatch.
      await password.fill(`${typed.password}x`);
      await expect(confirm).not.toHaveAttribute("aria-invalid");
      await submit.click();
      await expect(page).toHaveURL(`${base}/documents`);

      // Back keeps the answers
      await page.goBack();
      await expect(page).toHaveURL(`${base}/compte`);
      await expect(page.getByLabel(Login.email)).toHaveValue(typed.email);
      await expect(page.getByLabel(A.child)).toHaveValue(typed.child);
      await expect(stepTitle(page)).toBeFocused();
      // Passwords are not kept once the step is passed.
      await expect(password).toHaveValue("");
      await expect(confirm).toHaveValue("");
      await page.goForward();
      await expect(page).toHaveURL(`${base}/documents`);

      // 4: each document opens, scrolls and closes back on its button; continue waits for 4 ticks
      const D = C.documents;
      const toPayment = page.getByRole("button", { name: D.continue });
      await expect(toPayment).toBeDisabled();
      await expectUsable(page, "documents");
      for (const doc of ["cgu", "cgv", "charte", "confidentialite"] as const) {
        const opener = page.getByRole("button", { name: D.docs[doc] });
        await opener.click();
        const dialog = page.getByRole("dialog", { name: D.docs[doc] });
        await expect(dialog).toBeVisible();
        const card = dialog.locator("> div");
        expect(await card.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
        await card.evaluate((el) => el.scrollTo(0, el.scrollHeight));
        await expectUsable(page, `${doc} popup`);
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(opener).toBeFocused();
      }
      const boxes = page.getByRole("checkbox");
      for (let i = 0; i < 3; i++) await boxes.nth(i).check();
      await expect(toPayment).toBeDisabled();
      await boxes.nth(3).check();
      await expect(toPayment).toBeEnabled();
      await toPayment.click();
      await expect(page).toHaveURL(`${base}/paiement`);

      // 5: demo warning above the disabled card fields
      const P = C.payment;
      const warning = page.getByText(P.notice);
      const card = page.getByLabel(P.cardNumber);
      await expect(card).toBeDisabled();
      expect((await warning.boundingBox())!.y).toBeLessThan((await card.boundingBox())!.y);
      await expectUsable(page, "payment");
      await page.getByRole("button", { name: fill(P.pay, { price: 149 }) }).click();

      // 6: letter, the child's name carried over, guests
      const S = C.success;
      await expect(page).toHaveURL(`${base}/bienvenue`);
      await expect(stepTitle(page)).toHaveText(S.title);
      await expect(page.getByRole("heading", { name: S.letterTitle })).toBeVisible();
      await expect(page.getByLabel(S.forAttention)).toHaveValue(typed.child);
      const guests = page.getByRole("textbox", { name: S.guestName, exact: true });
      await expect(guests).toHaveCount(3);
      await page.getByRole("button", { name: S.addGuest }).click();
      await expect(guests).toHaveCount(4);
      await expect(guests.nth(3)).toBeFocused();
      await page.getByRole("button", { name: S.guestRemove }).first().click();
      await expect(page.getByRole("button", { name: S.guestRestore })).toBeVisible();
      await expectUsable(page, "welcome");
      await page.getByRole("link", { name: S.enter }).click();

      // 7: slider and range buttons change the label; notes survive close and reopen
      const T = C.carnet;
      await expect(page).toHaveURL(`${base}/carnet`);
      const output = page.locator("output");
      await expect(output).toHaveText(T.desire);
      await expect(page.getByRole("button", { name: T.prev })).toBeDisabled();
      await page.getByRole("button", { name: T.next }).click();
      await expect(output).toHaveText(T.birth);
      await page.getByRole("slider").press("ArrowRight");
      await expect(output).toHaveText(lang === "fr" ? "1 an" : "1 year");
      await page.getByRole("button", { name: T.open }).click();
      const chapter = page.getByRole("heading", { level: 3, name: lang === "fr" ? "1 an" : "1 year" });
      await expect(chapter).toBeFocused();
      const note = page.getByLabel(T.note);
      await note.fill(typed.note);
      await page.getByRole("button", { name: T.backToTimeline }).click();
      await expect(note).toBeHidden();
      await page.getByRole("button", { name: T.open }).click();
      await expect(note).toHaveValue(typed.note);
      // The slider leaves an open chapter alone; the range buttons move it.
      await page.getByRole("slider").press("ArrowRight");
      await expect(chapter).toBeVisible();
      await expect(note).toHaveValue(typed.note);
      await page.getByRole("button", { name: T.next }).click();
      await expect(page.getByRole("heading", { level: 3, name: lang === "fr" ? "5 ans" : "5 years" })).toBeFocused();
      await expect(note).toHaveValue("");
      for (const name of [T.separation, T.birthStories]) {
        await page.getByRole("button", { name }).click();
        await expect(page.getByRole("heading", { level: 3, name })).toBeFocused();
        await expect(note).toHaveValue("");
      }
      await expectUsable(page, "timeline");

      await page.waitForLoadState("networkidle");
      expect(leaks).toEqual([]);
      // Nor is anything kept in the browser.
      const kept = await page.evaluate(() => ({
        storage: localStorage.length + sessionStorage.length,
        cookie: document.cookie,
      }));
      expect(kept.storage).toBe(0);
      for (const value of Object.values(typed)) expect(kept.cookie).not.toContain(value);
      expect(errors).toEqual([]);
    });

    test("gates and resets follow the prototype", async ({ page }) => {
      const restart = page.getByRole("link", { name: C.restart });
      const D = C.documents;
      const boxes = page.getByRole("checkbox");

      await page.goto(base);
      await page.getByRole("link", { name: C.offers.see }).first().click();
      await page.getByRole("button", { name: fill(C.offers.fondement.cta, { price: 149 }) }).click();
      // "Explorer la suite" skips the account form.
      await page.getByRole("button", { name: C.account.explore }).click();
      await expect(page).toHaveURL(`${base}/documents`);

      // A legal popup left open is closed when Back leaves the page.
      await page.getByRole("button", { name: D.docs.cgu }).click();
      await expect(page.getByRole("dialog", { name: D.docs.cgu })).toBeVisible();
      await page.goBack();
      await expect(page).toHaveURL(`${base}/compte`);
      await expect(page.locator("dialog[open]")).toHaveCount(0);

      // Editing the account undoes it: Forward lands on the way back to step 1.
      await page.getByLabel(C.account.firstName, { exact: true }).fill(typed.first);
      await page.goForward();
      await expect(restart).toBeVisible();

      // Unticking a consent locks the payment step.
      await page.goBack();
      await page.getByRole("button", { name: C.account.explore }).click();
      for (let i = 0; i < 4; i++) await boxes.nth(i).check();
      await page.getByRole("button", { name: D.continue }).click();
      await expect(page).toHaveURL(`${base}/paiement`);
      await page.goBack();
      await boxes.first().uncheck();
      await page.goForward();
      await expect(restart).toBeVisible();

      // After paying, an edit to the account locks the timeline but not the welcome page.
      await page.goBack();
      await boxes.first().check();
      await page.getByRole("button", { name: D.continue }).click();
      await page.getByRole("button", { name: fill(C.payment.pay, { price: 149 }) }).click();
      await expect(page).toHaveURL(`${base}/bienvenue`);
      await page.getByRole("link", { name: C.success.backToAccount }).click();
      await expect(page).toHaveURL(`${base}/compte`);
      await page.getByLabel(C.account.firstName, { exact: true }).fill("Autre");
      await page.goBack();
      await expect(stepTitle(page)).toHaveText(C.success.title);
      await page.getByRole("link", { name: C.success.enter }).click();
      await expect(page).toHaveURL(`${base}/carnet`);
      await expect(restart).toBeVisible();
    });

    test("every step survives a refresh, without sideways scroll", async ({ page }) => {
      test.setTimeout(60_000);
      const errors: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(e.message));
      // A direct load is what a refresh does: the in-memory answers are gone.
      for (const step of steps) {
        const response = await page.goto(`${base}${step}`);
        expect(response?.status(), step).toBe(200);
        await expect(page).toHaveURL(`${base}${step}`);
        if (gated.includes(step)) await expect(page.getByRole("link", { name: C.restart })).toBeVisible();
        else await expect(stepTitle(page)).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${step}: no sideways scroll`).toBeLessThanOrEqual(0);
        await expectUsable(page, step || "/creer");
      }
      expect(errors).toEqual([]);
    });
  });
}
