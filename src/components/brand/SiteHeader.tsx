import Image from "next/image";
import { getTranslations } from "next-intl/server";
import logo from "@/assets/images/logo.png";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

export async function SiteHeader() {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b border-line bg-paper px-4 py-3 sm:px-7">
      <Link href="/" className="flex min-h-11 min-w-0 items-center gap-2 sm:gap-3">
        {/* Prototype PNG until the client's SVG arrives. */}
        <Image src={logo} alt="" sizes="(min-width: 640px) 80px, 40px" loading="eager" className="h-auto w-10 shrink-0 sm:w-20" />
        <span>
          <span className="block font-serif text-[22px] leading-[1.1] font-bold text-teal">{t("Brand.title")}</span>
          <span className="hidden text-[10.5px] text-ink-2 sm:block">{t("Brand.subtitle")}</span>
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <nav aria-label={t("Nav.label")} className="hidden xl:block">
          <NavLinks />
        </nav>
        <LanguageSwitcher />
        <div className="xl:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
