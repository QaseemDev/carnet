import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreationProvider, Progress } from "./creation";

// Every step and offer page: a sign-up flow, nothing for search engines.
export const metadata: Metadata = { robots: { index: false, follow: true } };

// Shared by the 7 steps: stays mounted while moving between them, so the
// provider keeps the answers (see `CreationProvider`).
export default async function CreerLayout({ children }: LayoutProps<"/[locale]/creer">) {
  const t = await getTranslations("Creation");
  return (
    <div className="bg-[radial-gradient(ellipse_at_12%_3%,#f0e5d8_0,transparent_36%),linear-gradient(180deg,#fcf8f2,#f8f5ef_70%,#fcf8f2)]">
      <div className="mx-auto max-w-[1240px] px-4 pt-[34px] pb-[55px] text-teal sm:px-6 sm:pt-[60px] sm:pb-[90px]">
        <header className="mx-auto mb-6 max-w-[780px] pb-4 text-center sm:px-5 sm:pb-7">
          <h1 className="mb-4 text-[clamp(34px,4vw,48px)] tracking-[-0.7px] sm:tracking-[-1.3px]">{t("title")}</h1>
          <p className="text-[15px] leading-[1.8] text-[#647370]">{t("subtitle")}</p>
          <div aria-hidden className="mx-auto mt-[26px] h-0.5 w-[46px] bg-terracotta" />
        </header>
        <CreationProvider>
          <Progress />
          {children}
        </CreationProvider>
      </div>
    </div>
  );
}
