import type { Page } from "@playwright/test";
import { expect, test } from "./checks";
import fr from "../src/i18n/messages/fr.json";

// The signature moments, with motion on (the other specs run with
// reduced motion so axe never sees a line mid-fade). French only: no moment
// depends on the language.
test.use({ contextOptions: { reducedMotion: "no-preference" } });

const { Home, Exemple: E, Creation: C, Login } = fr;
const moment = 2500; // longest moment (Chemin thread + book) with margin

// Every view transition the page starts, as "pseudo-element animation" lines.
async function recordTransitions(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { transitions: string[][] };
    w.transitions = [];
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = ((update: () => void) => {
      const transition = start(update);
      transition.ready.then(() =>
        w.transitions.push(
          document
            .getAnimations()
            .map((a) => `${(a.effect as KeyframeEffect).pseudoElement} ${(a as CSSAnimation).animationName}`),
        ),
      );
      return transition;
    }) as typeof document.startViewTransition;
  });
  return () => page.evaluate(() => (window as unknown as { transitions: string[][] }).transitions);
}

// Sum of layout shifts since load.
const layoutShift = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let sum = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) sum += (entry as unknown as { value: number }).value;
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(sum), 300);
      }),
  );

// Animations still moving (finished ones with `fill: both` stay listed).
const running = (page: Page) =>
  page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);

test("home: hero settles once, no layout shift, card morphs into its banner", async ({ page }) => {
  const transitions = await recordTransitions(page);
  await page.goto("/");
  const title = page.getByRole("heading", { level: 1 });
  expect(await title.evaluate((el) => el.getAnimations().length)).toBe(1);
  await expect(page.getByText(Home.quote["2"])).toHaveCSS("opacity", "1", { timeout: moment });
  await page.waitForTimeout(500);
  expect(await running(page)).toBe(0);
  expect(await layoutShift(page)).toBe(0);

  await page.getByRole("listitem").getByRole("link", { name: Home.cards.origine.title }).click();
  await expect(page).toHaveURL("/origine");
  expect((await transitions()).flat()).toContain(
    "::view-transition-group(banner-origine) -ua-view-transition-group-anim-banner-origine",
  );
});

test("chemin: the thread draws once in view and doesn't replay", async ({ page }) => {
  await page.goto("/chemin-de-vie");
  const timeline = page.locator("[data-seen]");
  const thread = page.locator(".thread");
  await timeline.scrollIntoViewIfNeeded();
  await expect(timeline).toHaveAttribute("data-seen", "true");
  await expect(thread).toHaveCSS("stroke-dashoffset", "0px", { timeout: moment });
  await expect(page.locator(".thread-ring").last()).toHaveCSS("border-top-color", "rgb(184, 74, 57)");
  await expect(page.locator(".thread-book")).toHaveCSS("opacity", "1", { timeout: moment });
  await page.waitForTimeout(700);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await timeline.scrollIntoViewIfNeeded();
  expect(await running(page)).toBe(0);
  expect(await layoutShift(page)).toBe(0);
});

test("exemple: pages turn the right way and every quick click counts", async ({ page }) => {
  const transitions = await recordTransitions(page);
  const title = page.getByRole("heading", { level: 2 });
  const turns = async () =>
    (await transitions()).map((t) => t.map((line) => line.split(" ")[1]).find((name) => name.startsWith("turn-")));
  await page.goto("/exemple");
  await page.getByRole("listitem").getByRole("button", { name: E.steps[1].label }).click();
  await expect(title).toHaveText(E.steps[1].title);
  await page.getByRole("button", { name: E.continue }).click();
  await expect(title).toHaveText(E.steps[2].title);
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: E.back }).click();
  await expect(title).toHaveText(E.steps[1].title);
  await page.waitForTimeout(1000);
  expect(await turns()).toEqual(["turn-next", "turn-next", "turn-prev"]);

  // Four quick clicks, each landing while the previous turn is still
  // running: one step each, so step 1 → 5, title focused. Raw mouse clicks:
  // `click()` would wait for the turn's overlay to go, and so prove nothing.
  const next = page.getByRole("button", { name: E.continue });
  for (let i = 0; i < 4; i++) {
    await next.scrollIntoViewIfNeeded();
    const box = (await next.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(150);
  }
  await expect(title).toHaveText(E.steps[5].title);
  await expect(page.locator('[aria-current="step"]')).toContainText(E.steps[5].label);
  await expect(title).toBeFocused();
});

test("créer: the letter and the wax seal play on the first arrival only", async ({ page }) => {
  await page.goto("/creer");
  await page.getByRole("link", { name: C.offers.see }).first().click();
  await page.getByRole("button", { name: C.offers.fondement.cta.replace("{price}", "149") }).click();
  await page.getByLabel(C.account.firstName, { exact: true }).fill("Seed");
  await page.getByLabel(C.account.lastName, { exact: true }).fill("Parent");
  await page.getByLabel(C.account.child).fill("Léa");
  await page.getByLabel(Login.email).fill("parent@example.test");
  await page.getByLabel(C.account.password, { exact: true }).fill("seed-password-1");
  await page.getByLabel(C.account.confirm, { exact: true }).fill("seed-password-1");
  await page.getByRole("button", { name: C.account.submit }).click();
  await expect(page).toHaveURL("/creer/documents");
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page.getByRole("button", { name: C.documents.continue }).click();
  await page.getByRole("button", { name: C.payment.pay.replace("{price}", "149") }).click();
  await expect(page).toHaveURL("/creer/bienvenue");

  const stamping = page.locator("svg.animate-stamp");
  await expect(stamping).toHaveCount(1);
  await expect(page.getByText(C.success.letter["1"])).toHaveClass(/animate-ink/);

  // Leave mid-reveal, before the seal lands, then come back: all at rest.
  await page.getByRole("link", { name: C.success.backToAccount }).click();
  await expect(page).toHaveURL("/creer/compte");
  await page.goBack();
  await expect(page.getByRole("heading", { name: C.success.letterTitle })).toBeVisible();
  await page.waitForTimeout(300);
  expect(await running(page)).toBe(0);
  await expect(stamping).toHaveCount(0);
  await expect(page.getByText(C.success.letter["1"])).not.toHaveClass(/animate-ink/);
  await expect(page.locator('svg[viewBox="0 0 80 80"]')).toHaveCSS("opacity", "1");
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("every moment is at rest at once", async ({ page }) => {
    await page.goto("/");
    // Within a frame or two: no 700 ms fade, no stagger delay.
    await expect(page.getByText(Home.quote["2"])).toHaveCSS("opacity", "1", { timeout: 100 });
    await page.goto("/chemin-de-vie");
    await page.locator("[data-seen]").scrollIntoViewIfNeeded();
    await expect(page.locator(".thread")).toHaveCSS("stroke-dashoffset", "0px", { timeout: 100 });
    await expect(page.locator(".thread-book")).toHaveCSS("opacity", "1", { timeout: 100 });
  });
});
