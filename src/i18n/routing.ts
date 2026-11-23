import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  // French always lives at `/`: no cookie or Accept-Language redirect to /en.
  localeDetection: false,
});
