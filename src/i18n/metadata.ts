import type { Metadata } from "next";
import type { StaticImageData } from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import hero from "@/assets/images/home/hero.png";
import { getPathname } from "./navigation";
import { routing } from "./routing";

// Sign-up and login: noindex on the pages and left out of the sitemap. Not
// disallowed in robots.txt, or crawlers would never see the noindex.
export const noindexPaths = ["/creer", "/connexion"];

// Open Graph wants language_TERRITORY.
const ogLocales = { fr: "fr_FR", en: "en_GB" } as const;

// The `/` or `/en` form of `path` in each locale, e.g. "/origine" → "/en/origine".
export function localizedPaths(path: string) {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, getPathname({ href: path, locale })]),
  ) as Record<(typeof routing.locales)[number], string>;
  return { ...languages, "x-default": languages[routing.defaultLocale] };
}

type Props = {
  path: string;
  title?: string; // omitted on Home: just the brand, no template
  description: string;
  image?: StaticImageData;
  noindex?: boolean;
};

// Title, description, canonical + hreflang and Open Graph for one public page.
// Child `openGraph` replaces the parent's wholesale, so all of it is set here.
export async function pageMetadata({ path, title, description, image = hero, noindex }: Props): Promise<Metadata> {
  const locale = await getLocale();
  const brand = (await getTranslations("Brand"))("title");
  const languages = localizedPaths(path);
  const url = languages[locale as keyof typeof languages];

  return {
    title: title ?? { absolute: brand },
    description,
    ...(noindex && { robots: { index: false, follow: true } }),
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      siteName: brand,
      url,
      title: title ?? brand,
      description,
      locale: ogLocales[locale as keyof typeof ogLocales],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => ogLocales[l]),
      images: [{ url: image.src, width: image.width, height: image.height }],
    },
  };
}
