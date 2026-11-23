import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { legalItems } from "./nav-items";

export async function SiteFooter() {
  const t = await getTranslations();

  return (
    <footer className="mt-16 border-t border-line bg-paper-2 px-4 py-8 text-[13px] sm:px-7">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p>
          <span className="font-serif text-base font-bold text-teal">{t("Brand.title")}</span>
          <span className="block text-ink-2">{t("Brand.subtitle")}</span>
        </p>
        <nav aria-label={t("Footer.legalLabel")}>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {legalItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center text-ink-2 hover:text-terracotta">
                  {t(`Footer.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-4 max-w-6xl text-ink-2">{t("Footer.copyright")}</p>
    </footer>
  );
}
