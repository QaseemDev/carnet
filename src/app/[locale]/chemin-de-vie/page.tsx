import { Book, Clock, Heart, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import banner from "@/assets/images/chemin/banner.png";
import naissance from "@/assets/images/chemin/naissance.jpg";
import rupture from "@/assets/images/chemin/rupture.jpg";
import stage1 from "@/assets/images/chemin/stage-1.jpg";
import stage2 from "@/assets/images/chemin/stage-2.jpg";
import stage3 from "@/assets/images/chemin/stage-3.jpg";
import stage4 from "@/assets/images/chemin/stage-4.jpg";
import stage5 from "@/assets/images/chemin/stage-5.jpg";
import stage6 from "@/assets/images/chemin/stage-6.jpg";
import stage7 from "@/assets/images/chemin/stage-7.jpg";
import stage8 from "@/assets/images/chemin/stage-8.jpg";
import stage9 from "@/assets/images/chemin/stage-9.jpg";
import transmission from "@/assets/images/chemin/transmission.jpg";
import { ClosingQuote } from "@/components/brand/ClosingQuote";
import { NumberedCard } from "@/components/brand/NumberedCard";
import { PageBanner } from "@/components/brand/PageBanner";
import { rich } from "@/components/brand/rich";
import { SeenOnce } from "@/components/brand/SeenOnce";
import { pageMetadata } from "@/i18n/metadata";

const stages = [stage1, stage2, stage3, stage4, stage5, stage6, stage7, stage8, stage9];
// Not ages: moments that can come at any time, then the handover document.
const moments = [naissance, rupture, transmission];
// A loose hand-drawn wave through the 9 ring centres (x every 125, y = 41),
// arching alternately above and below.
const threadPath = `M 0 41 ${Array.from({ length: 8 }, (_, k) => {
  const x = k * 125;
  const y = k % 2 ? 53 : 29;
  return `C ${x + 40} ${y} ${x + 85} ${y} ${x + 125} 41`;
}).join(" ")}`;
const featureIcons = [Heart, MessageSquare, Clock, Book];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata({
    path: "/chemin-de-vie",
    title: t("Chemin.title"),
    description: t("Home.cards.cheminDeVie.text"),
    image: banner,
  });
}

export default async function Page() {
  const t = await getTranslations("Chemin");

  return (
    <>
      <PageBanner src={banner} alt={t("bannerAlt")} name="cheminDeVie" />
      <div className="mx-auto max-w-[1100px] px-5 pt-[50px]">
        <header className="mb-[50px] text-center">
          <h1 className="mb-1 text-4xl font-bold text-terracotta sm:text-[42px]">{t("title")}</h1>
          <p className="mb-[15px] font-serif text-[22px] text-teal italic">{t("tagline")}</p>
          <p className="mx-auto max-w-[800px] text-[15px] text-ink-2">{t("description")}</p>
        </header>

        {/* Scrolls sideways on narrow screens. The thread draws once when it comes
            into view, each ring turns terracotta as it is reached, and it ends in a
            closed book at 18 (globals.css). */}
        <div tabIndex={0} role="region" aria-label={t("stagesLabel")} className="mt-10 mb-10 overflow-x-auto pb-2">
          <SeenOnce className="relative min-w-max lg:min-w-0">
            {/* From the first ring's centre to the last (px-5 + half of w-[110px]). */}
            <svg
              aria-hidden
              viewBox="0 0 1000 82"
              preserveAspectRatio="none"
              className="absolute top-0 right-[75px] left-[75px] h-[82px] w-[calc(100%-150px)] overflow-visible"
            >
              <path
                d={threadPath}
                pathLength={1}
                fill="none"
                vectorEffect="non-scaling-stroke"
                className="thread stroke-terracotta stroke-2"
              />
            </svg>
            <ol className="relative flex justify-between gap-3 px-5">
              {stages.map((photo, i) => {
                const stage = `stages.${i + 1}`;
                return (
                  <li key={stage} className="relative flex w-[110px] flex-col items-center text-center">
                    <span
                      style={{ "--i": i } as CSSProperties}
                      className="thread-ring relative mb-3 size-[82px] overflow-hidden rounded-full border-3 border-white bg-white"
                    >
                      <Image src={photo} alt="" fill sizes="82px" className="object-cover" />
                    </span>
                    <span className="text-[13px] leading-tight font-semibold">{t.rich(`${stage}.name`, rich)}</span>
                    {t.has(`${stage}.detail`) && (
                      <span
                        className={`mt-0.5 block text-[11px] ${i === stages.length - 1 ? "font-semibold text-terracotta" : "text-ink-2"}`}
                      >
                        {t.rich(`${stage}.detail`, rich)}
                      </span>
                    )}
                    {i === stages.length - 1 && (
                      <Book aria-hidden size={22} className="thread-book mt-2 text-terracotta" />
                    )}
                  </li>
                );
              })}
            </ol>
          </SeenOnce>
        </div>

        <ul aria-label={t("momentsLabel")} className="mb-[70px] grid gap-6 md:grid-cols-3">
          {moments.map((photo, i) => (
            <li key={photo.src} className="text-center">
              <div className="relative mb-3 aspect-[8/3] overflow-hidden rounded-lg border border-line">
                <Image src={photo} alt="" fill sizes="(min-width: 768px) 350px, 100vw" className="object-cover" />
              </div>
              <span className="text-[15px] font-semibold">{t(`moments.${i + 1}`)}</span>
            </li>
          ))}
        </ul>

        <div className="grid gap-[30px] md:grid-cols-2">
          {featureIcons.map((icon, i) => {
            const feature = `features.${i + 1}`;
            return (
              <NumberedCard
                key={feature}
                icon={icon}
                step={t(`${feature}.step`)}
                title={t(`${feature}.title`)}
                paragraphs={[t(`${feature}.p1`)]}
                quote={t(`${feature}.quote`)}
              />
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-[60px] max-w-[1100px] px-5">
        <ClosingQuote quote={t("closingQuote")} author={t("closingAuthor")} />
      </div>
    </>
  );
}
