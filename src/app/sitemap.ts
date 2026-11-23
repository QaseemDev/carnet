import type { MetadataRoute } from "next";
import { legalItems, navItems } from "@/components/brand/nav-items";
import { localizedPaths, noindexPaths } from "@/i18n/metadata";
import { siteUrl } from "@/i18n/site-url";
import { routing } from "@/i18n/routing";

// Home, every menu and footer page except the noindex ones, once per locale,
// each with the same hreflang set as the page's <head> (x-default included).
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...[...navItems, ...legalItems].map((item) => item.href as string)].filter(
    (path) => !noindexPaths.includes(path),
  );
  return paths.flatMap((path) => {
    const localized = localizedPaths(path);
    const languages = Object.fromEntries(Object.entries(localized).map(([lang, url]) => [lang, siteUrl + url]));
    return routing.locales.map((locale) => ({ url: siteUrl + localized[locale], alternates: { languages } }));
  });
}
