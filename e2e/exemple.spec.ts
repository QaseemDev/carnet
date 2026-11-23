import type { Page } from "@playwright/test";
import { expect, expectUsable, test } from "./checks";
import en from "../src/i18n/messages/en.json";
import fr from "../src/i18n/messages/fr.json";
import en56 from "../src/i18n/stages/en/5-6.json";
import fr56 from "../src/i18n/stages/fr/5-6.json";
import enDesir from "../src/i18n/stages/en/desir.json";
import frDesir from "../src/i18n/stages/fr/desir.json";
import enGrossesse from "../src/i18n/stages/en/grossesse.json";
import frGrossesse from "../src/i18n/stages/fr/grossesse.json";
import enAccouchement from "../src/i18n/stages/en/accouchement.json";
import frAccouchement from "../src/i18n/stages/fr/accouchement.json";
import enParents from "../src/i18n/stages/en/parents.json";
import frParents from "../src/i18n/stages/fr/parents.json";
import en03 from "../src/i18n/stages/en/0-3m.json";
import fr03 from "../src/i18n/stages/fr/0-3m.json";
import enTransmission from "../src/i18n/stages/en/transmission.json";
import frTransmission from "../src/i18n/stages/fr/transmission.json";
import enNaissance from "../src/i18n/stages/en/naissance.json";
import frNaissance from "../src/i18n/stages/fr/naissance.json";
import enRupture from "../src/i18n/stages/en/rupture.json";
import frRupture from "../src/i18n/stages/fr/rupture.json";

const locales = [
  {
    prefix: "",
    messages: fr,
    stage56: fr56,
    desir: frDesir,
    grossesse: frGrossesse,
    accouchement: frAccouchement,
    parents: frParents,
    zeroThree: fr03,
    transmission: frTransmission,
    naissance: frNaissance,
    rupture: frRupture,
    lang: "fr",
  },
  {
    prefix: "/en",
    messages: en,
    stage56: en56,
    desir: enDesir,
    grossesse: enGrossesse,
    accouchement: enAccouchement,
    parents: enParents,
    zeroThree: en03,
    transmission: enTransmission,
    naissance: enNaissance,
    rupture: enRupture,
    lang: "en",
  },
] as const;

const typed = { other: "Une réponse de seed", details: "Une précision de seed" };

// The visible step title (the other steps stay mounted but hidden).
const stepTitle = (page: Page) => page.getByRole("heading", { level: 2 });
// Message text without its rich tags.
const plain = (message: string) => message.replace(/<br><\/br>/g, "");
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) < 768;

for (const {
  prefix,
  messages,
  stage56,
  desir,
  grossesse,
  accouchement,
  parents,
  zeroThree,
  transmission,
  naissance,
  rupture,
  lang,
} of locales) {
  const { Exemple: E, Forms } = messages;
  const S = E.steps;
  const base = `${prefix}/exemple`;
  const bubble = (page: Page, n: 1 | 2 | 3 | 4 | 5) =>
    page.getByRole("listitem").getByRole("button", { name: S[n].label });
  const question = (page: Page, n: keyof typeof E.questions) =>
    page
      .locator("div")
      .filter({ has: page.getByRole("heading", { name: E.questions[n].title, exact: true }) })
      .last();

  test.describe(`carnet demo (${lang})`, () => {
    test("previous / next walk every step, bubbles jump, last step opens /creer", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(e.message));

      await page.goto(base);
      await expect(stepTitle(page)).toHaveText(plain(S[0].title));
      // Step 0: no previous/next, a pointer to the bubbles instead.
      await expect(page.getByRole("button", { name: E.back })).toHaveCount(0);
      await expect(page.getByText(E.start)).toBeVisible();

      await bubble(page, 1).click();
      await expect(stepTitle(page)).toHaveText(S[1].title);
      await expect(stepTitle(page)).toBeFocused();
      for (const n of [2, 3, 4, 5] as const) {
        await page.getByRole("button", { name: E.continue }).click();
        await expect(stepTitle(page)).toHaveText(S[n].title);
        await expect(bubble(page, n)).toHaveAttribute("aria-current", "step");
      }
      for (const n of [4, 3] as const) {
        await page.getByRole("button", { name: E.back }).click();
        await expect(stepTitle(page)).toHaveText(S[n].title);
      }
      await bubble(page, 5).click();
      await expect(stepTitle(page)).toHaveText(S[5].title);
      await page.getByRole("link", { name: `${E.create} ${S[5].next}` }).click();
      await expect(page).toHaveURL(`${prefix}/creer`);
      expect(errors).toEqual([]);
    });

    test("answers survive moving between steps, nothing is sent", async ({ page }) => {
      const sent: string[] = [];
      page.on("request", (r) => {
        const body = `${decodeURIComponent(r.url())} ${r.postData() ?? ""}`;
        if (r.method() !== "GET" || Object.values(typed).some((v) => body.includes(v))) sent.push(r.url());
      });
      await page.goto(base);

      await bubble(page, 3).click();
      const q1 = question(page, "1");
      const pill = q1.getByRole("button", { name: E.questions["1"].options["2"] });
      await pill.click();
      await expect(pill).toHaveAttribute("aria-pressed", "true");
      await q1.getByRole("textbox").fill(typed.details);

      // "autre": popup, 200-character limit, answer shown under the pills.
      const q2 = question(page, "2");
      await q2.getByRole("button", { name: S[3].other, exact: true }).click();
      const popup = page.getByRole("dialog", { name: E.other.title });
      await expect(popup.getByText(E.questions["2"].title)).toBeVisible();
      await expectUsable(page, "autre popup");
      const field = popup.getByRole("textbox", { name: E.questions["2"].prompt });
      await field.fill("x".repeat(250));
      await expect(field).toHaveValue("x".repeat(200));
      await expect(popup.getByText("200/200")).toBeVisible();
      await field.fill(typed.other);
      await popup.getByRole("button", { name: E.other.save }).click();
      await expect(popup).toBeHidden();
      await expect(q2.locator("p").filter({ hasText: typed.other })).toBeVisible();
      await expect(q2.getByRole("button", { name: S[3].other, exact: true })).toHaveAttribute("aria-pressed", "true");

      await bubble(page, 4).click();
      await bubble(page, 3).click();
      await expect(pill).toHaveAttribute("aria-pressed", "true");
      await expect(q1.getByRole("textbox")).toHaveValue(typed.details);
      await q2.getByRole("button", { name: S[3].other, exact: true }).click();
      await expect(popup.getByRole("textbox")).toHaveValue(typed.other);

      // A text selection released over the backdrop keeps the popup open; a plain backdrop click closes it.
      const box = (await popup.getByRole("textbox").boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(2, 2, { steps: 5 });
      await page.mouse.up();
      await expect(popup).toBeVisible();
      await page.mouse.click(2, 2);
      await expect(popup).toBeHidden();

      // Esc drops an unsaved edit and keeps the saved answer.
      await q2.getByRole("button", { name: S[3].other, exact: true }).click();
      await popup.getByRole("textbox").fill("brouillon");
      await page.keyboard.press("Escape");
      await expect(q2.locator("p").filter({ hasText: typed.other })).toBeVisible();
      await q2.getByRole("button", { name: S[3].other, exact: true }).click();
      await expect(popup.getByRole("textbox")).toHaveValue(typed.other);
      await page.keyboard.press("Escape");

      // Seven more questions on demand; the last one only has "autre".
      const more = page.getByRole("button", { name: S[3].more });
      await expect(more).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByRole("heading", { name: E.questions["10"].title })).toBeHidden();
      await more.click();
      await expect(page.getByRole("button", { name: S[3].less })).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByRole("heading", { name: E.questions["10"].title })).toBeVisible();
      await expectUsable(page, "step 3 expanded");

      // Opening a popup elsewhere doesn't move the page back to the extra questions.
      // The button may sit below the fold, so measure once it is in view.
      await page.evaluate(() => window.scrollTo(0, 0));
      const feuilleter = page.getByRole("button", { name: E.sidebar.feuilleter });
      await feuilleter.scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => window.scrollY);
      await feuilleter.click();
      await expect(page.getByRole("dialog", { name: E.sidebar.feuilleter })).toBeVisible();
      expect(await page.evaluate(() => window.scrollY)).toBe(before);
      await page.keyboard.press("Escape");

      await page.getByRole("button", { name: S[3].less }).click();
      await expect(more).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByRole("heading", { name: E.questions["10"].title })).toBeHidden();

      await page.waitForLoadState("networkidle");
      expect(sent).toEqual([]);
    });

    test("each approfondissement opens its article; Esc closes it back on its card", async ({ page }) => {
      await page.goto(base);
      await bubble(page, 2).click();
      for (const slug of ["evolution", "estime", "phrases", "dessin"] as const) {
        const article = E.articles[slug];
        const card = page.getByRole("button", { name: article.title });
        await card.click();
        const panel = page.getByRole("dialog", { name: article.title });
        await expect(panel.getByText(article.p["2"])).toBeVisible();
        await expect(panel.getByRole("heading", { name: E.remember })).toBeVisible();
        await expectUsable(page, `${slug} article`);
        await page.keyboard.press("Escape");
        await expect(panel).toBeHidden();
        await expect(card).toBeFocused();
      }
      // The back button closes it too.
      await page.getByRole("button", { name: E.articles.estime.title }).click();
      await page.getByRole("button", { name: E.articleBack }).click();
      await expect(page.getByRole("dialog")).toBeHidden();
    });

    test("placeholder actions open the info popup", async ({ page }) => {
      await page.goto(base);
      const info = page.getByRole("dialog");
      const check = async (open: () => Promise<void>, text: string) => {
        await open();
        await expect(info.getByText(text)).toBeVisible();
        await expectUsable(page, text);
        await info.getByRole("button", { name: Forms.ok }).click();
        await expect(info).toBeHidden();
      };

      for (const key of ["expression", "feuilleter"] as const)
        await check(() => page.getByRole("button", { name: E.sidebar[key] }).click(), E.info[key]);
      if (!isPhone(page))
        for (const key of ["audio", "video", "photo", "text"] as const)
          await check(
            () => page.getByRole("main").locator("header").getByRole("button", { name: E.header[key] }).click(),
            E.info[key],
          );

      await bubble(page, 5).click();
      for (const key of ["photo", "video", "audio", "text"] as const)
        await check(() => page.getByRole("button", { name: S[5][key] }).click(), E.info[key]);
      await expectUsable(page, "step 5");

      // No track yet: no music button.
      await expect(page.getByRole("button", { name: E.header.music })).toHaveCount(0);
    });

    test("the stage picker opens that stage's own text", async ({ page }) => {
      await page.goto(base);
      const picker = page.getByRole("combobox", { name: E.stage.label });
      await expect(picker).toHaveValue("4-5");
      // Picking an age opens it, no button.
      await expect(page.getByRole("button", { name: "Voir" })).toHaveCount(0);
      await picker.selectOption("5-6");
      await expect(page).toHaveURL(`${base}/5-6`);
      await expect(page.getByText(stage56.steps[0].badge)).toBeVisible();
      await expect(page.getByRole("combobox", { name: E.stage.label })).toHaveValue("5-6");
      // Back shows the stage it lands on, not the one just picked.
      await page.goBack();
      await expect(page).toHaveURL(base);
      await expect(page.getByRole("combobox", { name: E.stage.label })).toHaveValue("4-5");
      await page.goForward();
      await expect(page).toHaveURL(`${base}/5-6`);
      await bubble(page, 1).click();
      await expect(stepTitle(page)).toHaveText(stage56.steps[1].title);
      await expectUsable(page, "5-6 step 1");

      expect((await page.request.get(`${base}/not-a-stage`)).status()).toBe(404);
      await page.goto(`${base}/4-5`);
      await expect(page).toHaveURL(base);
    });

    test("a stage shapes its own steps (Désir d'enfant)", async ({ page }) => {
      await page.goto(`${base}/desir`);
      // Its own three articles.
      await bubble(page, 2).click();
      for (const article of Object.values(desir.articles)) {
        await expect(page.getByRole("button", { name: article.title })).toBeVisible();
      }
      // A question with a lead line and no options, only "autre".
      await bubble(page, 3).click();
      await page.getByRole("button", { name: E.steps[3].more }).click();
      await expect(page.getByRole("heading", { name: desir.questions[4].title })).toBeVisible();
      await expect(page.getByText(desir.questions[4].lead)).toBeVisible();
      // The ritual's fill-in prompts, and no subtitle borrowed from 4–5.
      await bubble(page, 4).click();
      await expect(page.getByRole("textbox", { name: desir.steps[4].fields[1] })).toBeVisible();
      await expect(page.getByText(S[4].subtitle)).toHaveCount(0);
      await expectUsable(page, "désir step 4");
    });

    test("La transmission: no articles, writing prompts, an optional letter", async ({ page }) => {
      const T = transmission.steps;
      // Its own step names, so its own bubbles.
      const step = (label: string) => page.getByRole("listitem").getByRole("button", { name: label });
      await page.goto(`${base}/transmission`);
      await step(S[1].label).click();
      await expect(stepTitle(page)).toHaveText(T[1].title);
      await expect(page.getByText(T[1].subtitle, { exact: true })).toBeVisible();
      await step(T[2].label).click();
      await expect(stepTitle(page)).toHaveText(T[2].title);
      await expect(page.getByText(T[2].quote, { exact: true })).toBeVisible();
      await expect(page.getByText(S[2].more.split("{")[0])).toHaveCount(0);

      // Writing prompts: their own lines, no "autre", no "Plus particulièrement".
      await step(S[3].label).click();
      await expect(page.getByRole("textbox", { name: transmission.questions[1].fields[1] })).toBeVisible();
      await expect(page.getByRole("button", { name: E.steps[3].other, exact: true })).toHaveCount(0);
      await expect(page.getByText(E.steps[3].details)).toHaveCount(0);
      await page.getByRole("button", { name: E.steps[3].more }).click();
      await expect(page.getByRole("textbox", { name: transmission.questions[10].short[1] })).toBeVisible();

      await step(T[4].label).click();
      await expect(page.getByRole("textbox", { name: T[4].fields[1] })).toBeVisible();
      // Nothing of the 4–5 ritual around its fill-in lines.
      await expect(page.getByText(plain(S[4].quote).slice(0, 30))).toHaveCount(0);
      await expect(page.getByText(S[4].invite.slice(0, 30))).toHaveCount(0);

      // The letter shows only once "add a letter" is picked.
      await step(T[5].label).click();
      const letter = page.getByRole("heading", { name: T[5].letter.title });
      await expect(letter).toHaveCount(0);
      await page.getByRole("radio", { name: T[5].choices[1] }).check();
      await expect(letter).toBeVisible();
      await page.getByRole("radio", { name: T[5].choices[2] }).check();
      await expect(letter).toHaveCount(0);
      await expectUsable(page, "transmission step 5");
    });

    test("Histoires de naissance particulières: subtitle, a line before its options", async ({ page }) => {
      await page.goto(`${base}/naissance`);
      await bubble(page, 1).click();
      await expect(stepTitle(page)).toHaveText(naissance.steps[1].title);
      await expect(page.getByText(naissance.steps[1].subtitle, { exact: true })).toBeVisible();
      // Question 5: its line to fill in, then its own options and "autre".
      await bubble(page, 3).click();
      await page.getByRole("button", { name: E.steps[3].more }).click();
      const field = page.getByRole("textbox", { name: naissance.questions[5].field });
      const option = page.getByRole("button", { name: naissance.questions[5].blocks[1].options[1] });
      await expect(field).toBeVisible();
      await expect(option).toBeVisible();
      const [fieldBox, optionBox] = [await field.boundingBox(), await option.boundingBox()];
      expect(optionBox!.y).toBeGreaterThan(fieldBox!.y + fieldBox!.height);
      await expectUsable(page, "naissance step 3");
    });

    test("Rupture, séparation, deuil: last in the picker, its own text", async ({ page }) => {
      await page.goto(`${base}/rupture`);
      const picker = page.getByRole("combobox", { name: E.stage.label });
      await expect(picker).toHaveValue("rupture");
      // Left menu only: the picker names it but doesn't offer it.
      await expect(picker.locator("option:not([disabled])").last()).toHaveText(E.stage.names.transmission);
      await expect(picker.locator("option:not([disabled])", { hasText: E.stage.names.rupture })).toHaveCount(0);
      await bubble(page, 1).click();
      await expect(stepTitle(page)).toHaveText(rupture.steps[1].title);
      // Question 10's two labelled lines to fill in.
      await bubble(page, 3).click();
      await page.getByRole("button", { name: E.steps[3].more }).click();
      await expect(page.getByRole("textbox", { name: rupture.questions[10].field })).toBeVisible();
      await expect(page.getByRole("textbox", { name: rupture.questions[10].blocks[1].field })).toBeVisible();
      await expectUsable(page, "rupture step 3");
    });

    test("a question can add its own line to fill in (Grossesse)", async ({ page }) => {
      await page.goto(`${base}/grossesse`);
      await bubble(page, 3).click();
      await page.getByRole("button", { name: E.steps[3].more }).click();
      await expect(page.getByRole("heading", { name: grossesse.questions[5].title })).toBeVisible();
      await expect(page.getByRole("textbox", { name: grossesse.questions[5].field })).toBeVisible();
      await expectUsable(page, "grossesse step 3");
    });

    test("a question can list writing ideas; step 2 without a quote (Accouchement)", async ({ page }) => {
      await page.goto(`${base}/accouchement`);
      await bubble(page, 2).click();
      await expect(page.getByText(plain(accouchement.steps[2].intro).split(".")[0])).toBeVisible();
      await expect(page.getByText(S[2].quote)).toHaveCount(0);
      await bubble(page, 3).click();
      await page.getByRole("button", { name: E.steps[3].more }).click();
      const ideas = page.getByRole("list").filter({ hasText: accouchement.questions[10].items[1] });
      await expect(ideas).toBeVisible();
      await expect(ideas.getByRole("listitem")).toHaveCount(Object.keys(accouchement.questions[10].items).length);
      await expectUsable(page, "accouchement step 3");
    });

    test("a question can have a second set of options; step 4 text after its field (Devenir parent)", async ({
      page,
    }) => {
      await page.goto(`${base}/parents`);
      await bubble(page, 3).click();
      const q3 = parents.questions[3];
      const card = page
        .locator("div")
        .filter({ has: page.getByRole("heading", { name: q3.title, exact: true }) })
        .last();
      await expect(card.getByText(q3.blocks[1].lead)).toBeVisible();
      const options = Object.keys(q3.options).length + Object.keys(q3.blocks[1].options).length;
      await expect(card.getByRole("button")).toHaveCount(options + 1);
      const sibling = card.getByRole("button", { name: q3.blocks[1].options[1] });
      await sibling.click();
      await expect(sibling).toHaveAttribute("aria-pressed", "true");
      await expect(card.getByRole("button", { name: q3.options[1] })).toHaveAttribute("aria-pressed", "false");
      await expectUsable(page, "parents step 3");
      await bubble(page, 4).click();
      await expect(page.getByRole("textbox", { name: parents.steps[4].fields[1] })).toBeVisible();
      await expect(page.getByText(parents.steps[4].after)).toBeVisible();
    });

    test("a question can have several blocks of options and fields; an article without points (0–3 mois)", async ({
      page,
    }) => {
      await page.goto(`${base}/0-3m`);
      await bubble(page, 3).click();
      const q3 = zeroThree.questions[3];
      const card = page
        .locator("div")
        .filter({ has: page.getByRole("heading", { name: q3.title, exact: true }) })
        .last();
      for (const block of Object.values(q3.blocks)) {
        await expect(card.getByText(block.lead)).toBeVisible();
        await expect(card.getByRole("textbox", { name: block.field })).toBeVisible();
      }
      const options = [q3.options, ...Object.values(q3.blocks).map((b) => b.options)];
      await expect(card.getByRole("button")).toHaveCount(options.reduce((n, o) => n + Object.keys(o).length, 0) + 1);
      // "autre" sits with the last set of options.
      const lastGroup = card.getByRole("button", { name: q3.blocks[2].options[1] }).locator("..");
      await expect(lastGroup.getByRole("button", { name: S[3].other })).toBeVisible();
      await page.getByRole("button", { name: E.steps[3].more }).click();
      await expect(page.getByText(zeroThree.questions[8].note)).toBeVisible();
      await expectUsable(page, "0-3m step 3");

      await bubble(page, 2).click();
      await page.getByRole("button", { name: zeroThree.articles.sommeil.title }).click();
      const panel = page.getByRole("dialog");
      await expect(panel.getByText(zeroThree.articles.sommeil.closing[1])).toBeVisible();
      await expect(panel.getByRole("heading", { name: E.remember })).toHaveCount(0);
    });

    test("sidebar links, layout and axe", async ({ page }) => {
      await page.goto(base);
      await expectUsable(page, "step 0");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      // The sidebar never overlaps the step.
      const side = await page.getByRole("complementary").boundingBox();
      const title = await stepTitle(page).boundingBox();
      expect(side && title).toBeTruthy();
      const apart = isPhone(page) ? side!.y + side!.height <= title!.y : side!.x + side!.width <= title!.x;
      expect(apart).toBe(true);

      await page.getByRole("link", { name: E.sidebar.offres }).click();
      await expect(page).toHaveURL(`${prefix}/creer`);
    });

    test("left menu opens the two life-event stages", async ({ page }) => {
      await page.goto(base);
      const journeys = page.getByRole("navigation", { name: E.sidebar.journeys });
      for (const key of ["naissance", "rupture"] as const) {
        await journeys.getByRole("link", { name: E.stage.names[key] }).click();
        await expect(page).toHaveURL(`${prefix}/exemple/${key}`);
        await expect(journeys.getByRole("link", { name: E.stage.names[key] })).toHaveAttribute("aria-current", "page");
      }
    });
  });
}
