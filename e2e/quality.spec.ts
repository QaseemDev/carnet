import { legalItems, navItems } from "../src/components/brand/nav-items";
import { expect, expectUsable, test } from "./checks";

// Every page reachable by URL alone. The later Créer steps only show a
// "start again" notice when opened directly: creer.spec.ts walks the flow and
// checks them, and the popups, opened through the page, are checked where
// creer, exemple, forms and shell specs open them.
const routes = [
  "/",
  ...navItems.map((n) => n.href),
  ...legalItems.map((n) => n.href),
  ...["complet", "construction", "fondement", "transmission"].map((offer) => `/creer/formule/${offer}`),
  "/une-page-qui-nexiste-pas",
];

for (const prefix of ["", "/en"]) {
  test.describe(`quality (${prefix || "fr"})`, () => {
    for (const route of routes) {
      const path = prefix + route === "/en/" ? "/en" : prefix + route;

      test(path, async ({ page }, { project }) => {
        await page.goto(path);

        // Images: all loaded, none broken.
        const images = page.locator("img");
        await images.evaluateAll((imgs) => imgs.forEach((img) => ((img as HTMLImageElement).loading = "eager")));
        await expect
          .poll(() => images.evaluateAll((imgs) => (imgs as HTMLImageElement[]).filter((i) => !i.complete).length))
          .toBe(0);
        const broken = await images.evaluateAll((imgs) =>
          (imgs as HTMLImageElement[]).filter((i) => !i.naturalWidth).map((i) => i.src),
        );
        expect(broken, "broken images").toEqual([]);

        await expectUsable(page, path);

        // 200 % browser zoom on a 1280 px desktop is a 640 px wide viewport,
        // where the menu button replaces the menu bar.
        if (project.name === "desktop") {
          await page.setViewportSize({ width: 640, height: 400 });
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          expect(overflow, "sideways scroll at 200 % zoom").toBeLessThanOrEqual(0);
          await expectUsable(page, `${path} at 200 %`);
          // The 404 page has no menu.
          const menu = page.getByRole("button", { name: /menu/i });
          if (await menu.count()) {
            await menu.click();
            await expectUsable(page, `${path} menu at 200 %`);
          }
        }
      });
    }
  });
}
