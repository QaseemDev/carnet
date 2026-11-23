"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { navItems } from "./nav-items";

const base =
  "flex min-h-11 items-center justify-center rounded-sm py-1.5 text-center text-[12px] leading-snug font-medium transition-colors duration-200";

export function NavLinks({ onNavigate, stacked = false }: { onNavigate?: () => void; stacked?: boolean }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <ul className={stacked ? "flex flex-col gap-2" : "flex items-center gap-1.5"}>
      {navItems.map((item) => {
        const current = pathname === item.href;
        const cta = "cta" in item;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={current ? "page" : undefined}
              className={[
                base,
                stacked && "justify-start text-[15px]",
                // 9 links only fit the 1280 px header if long labels wrap and padding is tight.
                stacked || cta ? "px-2.5" : "max-w-32 px-2 text-balance 2xl:max-w-none",
                cta
                  ? "border-[1.5px] border-terracotta font-semibold text-terracotta hover:bg-terracotta hover:text-white"
                  : current
                    ? "bg-tab font-semibold text-terracotta-hover"
                    : "text-ink hover:text-terracotta",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {t(item.key)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
