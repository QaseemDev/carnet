import { defineConfig, devices } from "@playwright/test";

const port = 3417;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // Reduced motion, so no check (axe contrast above all) catches a line mid-fade.
  // e2e/motion.spec.ts turns motion back on.
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // 360 px: the narrowest common phone width.
    { name: "phone", use: { ...devices["Pixel 7"], viewport: { width: 360, height: 780 } } },
  ],
  // Tests run against the production build: `pnpm build` first.
  webServer: {
    command: `pnpm start --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
  },
});
