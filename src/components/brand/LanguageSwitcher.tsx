"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// The prototype's flags (`.language-flag`), drawn inline so they also show on
// Windows, which has no flag emoji. Decorative: the code beside names the
// language (visually hidden next to the full desktop menu, as in the prototype).
const flags = {
  fr: (
    <>
      <rect width="60" height="40" fill="#fff" />
      <path fill="#002395" d="M0 0h20v40H0z" />
      <path fill="#ED2939" d="M40 0h20v40H40z" />
    </>
  ),
  en: (
    <>
      <rect width="60" height="40" fill="#012169" />
      <path d="m0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="9" />
      <path d="m0 0 60 40M60 0 0 40" stroke="#C8102E" strokeWidth="3" />
      <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="14" />
      <path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="8" />
    </>
  ),
};

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const current = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")}>
      <ul className="flex items-center rounded-sm border border-line text-[12px] font-semibold">
        {routing.locales.map((locale) => (
          <li key={locale}>
            <Link
              href={pathname}
              locale={locale}
              lang={locale}
              aria-current={locale === current ? "true" : undefined}
              className={[
                "flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2 uppercase transition-colors",
                locale === current ? "bg-teal text-paper" : "text-ink hover:text-terracotta",
              ].join(" ")}
            >
              <svg
                aria-hidden
                viewBox="0 0 60 40"
                className="h-3 w-[18px] shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgb(0_0_0/0.12)]"
              >
                {flags[locale]}
              </svg>
              <abbr title={t(locale)} className="no-underline xl:sr-only">
                {locale}
              </abbr>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
