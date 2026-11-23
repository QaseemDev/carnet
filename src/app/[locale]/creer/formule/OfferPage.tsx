import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StepTitle } from "../creation";
import { featureCount, findOffer, type OfferSlug } from "../offers";
import * as ui from "../ui";
import { ChooseOffer } from "./ChooseOffer";

// One static folder per offer (formule/<slug>/page.tsx) rather than a `[offre]`
// segment: with Cache Components an unknown slug would render "not found" with a
// 200 status; as folders it matches no route and gets a real 404.
export async function offerMetadata(slug: OfferSlug): Promise<Metadata> {
  return { title: (await getTranslations("Creation.offers"))(`${slug}.title`) };
}

const range = (n: number) => Array.from({ length: n }, (_, i) => String(i + 1));

// Step 2: what the chosen offer includes.
export async function OfferPage({ slug }: { slug: OfferSlug }) {
  const offer = findOffer(slug)!;
  const t = await getTranslations("Creation");
  const o = (key: string) =>
    t(`offers.${offer.slug}.${key}`, { price: offer.price, was: "was" in offer ? offer.was : 0 });

  return (
    <section className="mx-auto max-w-[940px]">
      <Link href="/creer" className={ui.back}>
        <span aria-hidden>←</span> {t("back")}
      </Link>
      <article className={ui.panel}>
        <p className="eyebrow mb-[18px] text-[11px]! font-bold! tracking-[1.2px]! text-terracotta!">{o("age")}</p>
        <StepTitle>{o("title")}</StepTitle>
        <p className={`${ui.price} mb-[18px]`}>{t("offers.price", { price: offer.price })}</p>
        {range(offer.intro).map((i) => (
          <p
            key={i}
            className={`mb-[18px] ${
              offer.slug === "complet" && Number(i) === offer.intro ? "font-serif text-terracotta! italic" : ""
            }`}
          >
            {o(`intro.${i}`)}
          </p>
        ))}
        {!("features" in offer) && (
          <>
            <h3 className={ui.h3}>{t("offers.includes")}</h3>
            <div className="mt-7 mb-8 grid gap-4 sm:grid-cols-2">
              {range(featureCount).map((i) => (
                <section key={i} className="rounded-xl border border-[#eae1d5] bg-[#f8f5ef] p-5 min-[601px]:p-6">
                  <h4 className="mb-3 text-[15px] leading-[1.7] font-semibold text-teal">
                    {t(`offers.features.${i}.title`)}
                  </h4>
                  <p className="text-[13px] leading-[1.85] text-[#61706b]">{t(`offers.features.${i}.text`)}</p>
                </section>
              ))}
            </div>
          </>
        )}
        {range(offer.extra).map((i) =>
          i === "1" ? (
            <h3 key={i} className={ui.h3}>
              {o(`extra.${i}`)}
            </h3>
          ) : (
            <p key={i} className="mb-[18px]">
              {o(`extra.${i}`)}
            </p>
          ),
        )}
        <ChooseOffer slug={offer.slug}>{o("cta")}</ChooseOffer>
      </article>
    </section>
  );
}
