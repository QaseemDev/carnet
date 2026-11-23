import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./LoginForm";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata({
    path: "/connexion",
    title: t("Login.title"),
    description: t("Home.cards.connexion.text"),
    noindex: true,
  });
}

export default async function Page() {
  const t = await getTranslations("Login");
  return (
    <div className="mx-auto my-[60px] max-w-[620px] px-5">
      <div className="rounded-3xl border border-line bg-white px-5 py-8 shadow-[0_10px_30px_rgb(0_0_0/0.04)] sm:p-10">
        <header className="mb-[30px] text-center">
          <h1 className="mb-2.5 text-[32px]">{t("title")}</h1>
          <h2 className="mt-5 mb-[18px] text-2xl leading-tight text-ink">{t("returnTitle")}</h2>
          <p className="text-sm text-ink-2">{t("subtitle")}</p>
          <p className="mt-[15px] text-sm leading-[1.8] text-ink-2">{t("intro")}</p>
        </header>
        <LoginForm />
      </div>
    </div>
  );
}
