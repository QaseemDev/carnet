import type { LucideIcon } from "lucide-react";
import type { StaticImageData } from "next/image";
import { getTranslations } from "next-intl/server";
import { ClosingQuote } from "./ClosingQuote";
import { NumberedCard } from "./NumberedCard";
import { PageBanner } from "./PageBanner";
import { rich } from "./rich";

type Props = {
  namespace: "Origine" | "About" | "Guide" | "Communication";
  banner: StaticImageData;
  icons: [LucideIcon, LucideIcon, LucideIcon, LucideIcon];
};

// Home card each page's banner pairs with (Communication has no card yet).
const cardKey = {
  Origine: "origine",
  About: "quiSommesNous",
  Guide: "guideParental",
  Communication: "communication",
} as const;

// Banner, title, four numbered cards and the founders' quote: the shared shape
// of L'Origine, Qui sommes-nous, Le Guide Parental and La Communication Bienveillante.
export async function ArticlePage({ namespace, banner, icons }: Props) {
  const t = await getTranslations(namespace);

  return (
    <>
      <PageBanner
        src={banner}
        alt={t("bannerAlt")}
        name={cardKey[namespace]}
        height={
          namespace === "About" ? "h-[clamp(240px,65vw,360px)] min-[641px]:h-[clamp(380px,44vw,680px)]" : undefined
        }
      />
      <div className="mx-auto my-[50px] max-w-[1100px] px-5">
        <header className="mb-[50px] text-center">
          <h1 className="mb-2.5 text-4xl font-bold sm:text-[42px]">{t("title")}</h1>
          {t.has("tagline") ? (
            <h2 className="font-sans text-[14.5px] text-ink">{t("tagline")}</h2>
          ) : (
            <div aria-hidden className="mx-auto my-3 h-0.5 w-[70px] bg-terracotta" />
          )}
          <p className="mx-auto mt-[15px] max-w-[850px] font-serif text-lg leading-normal text-ink-2 italic">
            {t.rich("subtitle", rich)}
          </p>
        </header>

        <div className="mb-[50px] grid gap-[30px] md:grid-cols-2">
          {icons.map((icon, i) => {
            const card = `cards.${i + 1}`;
            const paragraphs = ["p1", "p2", "p3"]
              .filter((p) => t.has(`${card}.${p}`))
              .map((p) => t.rich(`${card}.${p}`, rich));
            return (
              <NumberedCard
                key={card}
                icon={icon}
                step={t(`${card}.step`)}
                title={t(`${card}.title`)}
                paragraphs={paragraphs}
                quote={t(`${card}.quote`)}
              />
            );
          })}
        </div>

        <ClosingQuote quote={t("closingQuote")} author={t("closingAuthor")} />
      </div>
    </>
  );
}
