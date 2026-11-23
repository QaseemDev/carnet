import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "./ContactForm";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata({
    path: "/contact",
    title: t("Contact.title"),
    description: t("Home.cards.contact.text"),
  });
}

export default async function Page() {
  const t = await getTranslations("Contact");
  return (
    <div className="mx-auto my-[50px] max-w-[1100px] px-5">
      <header className="mb-[50px] text-center">
        <h1 className="mb-2.5 text-4xl font-bold sm:text-[42px]">{t("title")}</h1>
        <div aria-hidden className="mx-auto my-3 h-0.5 w-[70px] bg-terracotta" />
        <p className="mx-auto mt-[15px] max-w-[850px] font-serif text-lg leading-normal text-ink-2 italic">
          {t("subtitle")}
        </p>
      </header>
      <div className="mb-[60px] rounded-xl border border-line bg-white px-5 py-8 shadow-[0_4px_15px_rgb(0_0_0/0.02)] sm:p-10">
        <ContactForm />
      </div>
    </div>
  );
}
