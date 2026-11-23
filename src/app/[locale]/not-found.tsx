import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="font-serif text-6xl text-terracotta italic">404</p>
      <h1 className="mt-4 text-3xl">{t("title")}</h1>
      <p className="mt-3 text-ink-2">{t("text")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-terracotta px-5 font-semibold text-terracotta transition-colors hover:bg-terracotta hover:text-white"
      >
        {t("home")}
      </Link>
    </section>
  );
}
