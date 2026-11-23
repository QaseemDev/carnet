import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";
import { StepTitle } from "./creation";
import { offers } from "./offers";
import * as ui from "./ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata({
    path: "/creer",
    title: t("Creation.title"),
    description: t("Home.cards.creer.text"),
    noindex: true,
  });
}

// Step 1: choose one of the four offers.
export default async function Page() {
  const t = await getTranslations("Creation.offers");
  return (
    <section>
      <StepTitle className="text-center">{t("title")}</StepTitle>
      <p className={`${ui.lead} mb-[34px] text-center`}>{t("lead")}</p>
      {/* Prototype final layer: the four offers in one white frame, the full
          journey (last) filled terracotta. */}
      <ul className="grid gap-3 rounded-xl border border-line bg-white p-3.5 shadow-[0_4px_15px_rgb(0_0_0/0.02)] min-[601px]:grid-cols-2 min-[601px]:gap-4 min-[601px]:p-6 min-[1001px]:grid-cols-4">
        {offers.map((offer) => {
          const featured = "was" in offer;
          return (
            <li
              key={offer.slug}
              className={`flex flex-col rounded-xl border px-[19px] py-[22px] transition-[translate,box-shadow,border-color] duration-200 min-[601px]:px-5 min-[601px]:pt-[25px] min-[601px]:pb-[22px] hover:-translate-y-[5px] hover:shadow-[0_16px_35px_#2c4a4e12] ${
                featured ? "border-terracotta bg-terracotta text-white" : "border-line bg-white hover:border-[#bfa98e]"
              }`}
            >
              <p
                className={`mb-2.5 text-[10px] leading-[1.65] font-bold tracking-[1.2px] uppercase min-[601px]:min-h-[18px] min-[1001px]:min-h-8 ${featured ? "" : "text-terracotta"}`}
              >
                {t(`${offer.slug}.age`)}
              </p>
              <h3
                id={`offer-${offer.slug}`}
                className={`mb-3.5 text-[25px] leading-[1.25] tracking-[-0.5px] min-[601px]:min-h-[60px] min-[601px]:text-2xl min-[1001px]:min-h-[90px] ${featured ? "text-white" : ""}`}
              >
                {t(`${offer.slug}.title`)}
              </h3>
              <p
                className={`mb-4 border-t pt-3.5 font-serif leading-[1.25] font-bold min-[1001px]:min-h-[78px] ${
                  featured
                    ? "border-white/25 text-[25px] min-[601px]:text-[26px]"
                    : "border-[#e9ded0] text-[30px] text-terracotta min-[601px]:text-[32px]"
                }`}
              >
                {featured ? t("wasPrice", { price: offer.price, was: offer.was }) : t("price", { price: offer.price })}
              </p>
              <Link
                href={`/creer/formule/${offer.slug}`}
                aria-describedby={`offer-${offer.slug}`}
                className={`mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-full border px-2 py-[11px] text-center text-xs leading-normal font-semibold min-[601px]:text-[11px] ${
                  featured
                    ? "border-white bg-white text-terracotta hover:border-[#fff4ee] hover:bg-[#fff4ee]"
                    : "border-[#dac8b5] text-teal hover:bg-paper"
                }`}
              >
                {t("see")}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
