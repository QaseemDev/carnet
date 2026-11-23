import AxeBuilder from "@axe-core/playwright";
import { test as base, expect, type Page } from "@playwright/test";

// Every spec uses this `test`: whatever a test opens or clicks, the site must
// never fetch from another host (images, fonts, scripts were hotlinked once).
export const test = base.extend<{ sameHostOnly: void }>({
  sameHostOnly: [
    async ({ page }, use) => {
      const elsewhere: string[] = [];
      page.on("request", (r) => {
        const url = new URL(r.url());
        if (url.protocol.startsWith("http") && url.hostname !== "localhost") elsewhere.push(r.url());
      });
      await use();
      expect(elsewhere, "requests to other hosts").toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

// Links, buttons and fields under `root` smaller than 44 × 44 px, or with text
// under 16 px (iPhone zooms on focus below that). A checkbox or radio is
// measured by its label, which is what the finger hits. Links inside a
// sentence are exempt from the size rule, as WCAG 2.5.8 allows.
export function sizeProblems(page: Page, root: string) {
  return page.evaluate((root) => {
    const found: string[] = [];
    const scope = document.querySelector(root);
    if (!scope?.checkVisibility()) return [`${root} is not shown`];
    const name = (e: Element) =>
      `${e.tagName.toLowerCase()} "${(e.getAttribute("aria-label") || e.textContent || e.id).trim().slice(0, 30)}"`;
    for (const e of scope.querySelectorAll("input, select, textarea")) {
      if (e.checkVisibility() && parseFloat(getComputedStyle(e).fontSize) < 16) found.push(`font < 16px: ${name(e)}`);
    }
    for (const e of scope.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, summary")) {
      const choice = e.matches("[type=checkbox], [type=radio]") ? (e as HTMLInputElement).labels?.[0] : undefined;
      const target = choice ?? e;
      const box = target.getBoundingClientRect();
      if (!target.checkVisibility() || !box.width || (box.width >= 44 && box.height >= 44)) continue;
      const sentence = e.closest("p");
      if (e.tagName === "A" && sentence && sentence.textContent!.trim() !== e.textContent!.trim()) continue;
      found.push(`${Math.round(box.width)}×${Math.round(box.height)}: ${name(target)}`);
    }
    return found;
  }, root);
}

// What's on screen (the open popup if there is one) has no serious axe issue,
// no tap target under 44 px and no field text under 16 px.
export async function expectUsable(page: Page, label: string) {
  const root = (await page.locator("dialog[open]").count()) ? "dialog[open]" : "body";
  const { violations } = await new AxeBuilder({ page }).include(root).analyze();
  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(blocking.map((v) => `${label} ${v.id}: ${v.help}`)).toEqual([]);
  expect(await sizeProblems(page, root), `${label}: tap targets and field text`).toEqual([]);
}
