import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ViewTransition, type CSSProperties } from "react";
import cheminDeVie from "@/assets/images/home/chemin-de-vie.png";
import connexion from "@/assets/images/home/connexion.png";
import contact from "@/assets/images/home/contact.png";
import creer from "@/assets/images/home/creer.png";
import exemple from "@/assets/images/home/exemple.png";
import guideParental from "@/assets/images/home/guide-parental.png";
import hero from "@/assets/images/home/hero.png";
import origine from "@/assets/images/home/origine.png";
import quiSommesNous from "@/assets/images/home/qui-sommes-nous.png";
import { CardCarousel } from "@/components/brand/CardCarousel";
import { navItems } from "@/components/brand/nav-items";
import { pageMetadata } from "@/i18n/metadata";
import { Link } from "@/i18n/navigation";

type NavKey = (typeof navItems)[number]["key"];

// Prototype card order (differs from the menu: Créer comes before Se connecter).
const cards = [
  { key: "origine", image: origine },
  { key: "quiSommesNous", image: quiSommesNous },
  { key: "cheminDeVie", image: cheminDeVie },
  { key: "guideParental", image: guideParental },
  { key: "exemple", image: exemple },
  { key: "creer", image: creer },
  { key: "connexion", image: connexion },
  { key: "contact", image: contact },
] as const satisfies readonly { key: NavKey; image: unknown }[];
// Cards whose page opens on a banner: the card photo morphs into it (PageBanner `name`).
const morphs: readonly NavKey[] = ["origine", "quiSommesNous", "cheminDeVie", "guideParental"];
const hrefs = Object.fromEntries(navItems.map((item) => [item.key, item.href])) as Record<NavKey, string>;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: "/", description: (await getTranslations("Chemin"))("description") });
}

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <>
      <section className="relative flex h-[420px] items-center justify-center overflow-hidden border-b border-line px-5 text-center">
        <Image
          src={hero}
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="animate-settle object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-paper/45" />
        <div className="relative">
          <h1 className="mb-1 animate-ink text-5xl font-bold tracking-[-1px] [text-shadow:0_2px_10px_rgb(250_246_238/0.6)] sm:text-[65px]">
            {t("Brand.title")}
          </h1>
          <div aria-hidden style={line(1)} className="mx-auto my-3 h-0.5 w-[70px] animate-ink bg-terracotta" />
          {/* The quote "ink settles" line by line. */}
          <p className="mt-[15px] max-w-[650px] font-serif text-xl leading-[1.4] italic [text-shadow:0_1px_8px_rgb(250_246_238/0.8)]">
            {(["1", "2"] as const).map((n, i) => (
              <span key={n} style={line(i + 2)} className="block animate-ink">
                {t(`Home.quote.${n}`)}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section className="my-[60px] pb-10 text-center">
        <h2 className="mb-3 px-5 text-4xl font-semibold sm:px-[30px] sm:text-[42px]">{t("Home.exploreTitle")}</h2>
        <p className="mb-10 px-5 text-base text-ink-2 sm:px-[30px]">{t("Home.exploreSubtitle")}</p>

        <div className="snap-x snap-mandatory overflow-x-auto px-5 pt-2.5 pb-[30px] [scrollbar-color:var(--color-terracotta)_var(--color-line)] sm:snap-none sm:px-10">
          <CardCarousel count={cards.length}>
            {cards.map(({ key, image }) => {
              const photo = <Image src={image} alt="" sizes="310px" className="h-[175px] w-full object-cover" />;
              return (
                <li key={key} className="w-[min(310px,calc(100vw-40px))] snap-center">
                  <Link
                    href={hrefs[key]}
                    className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-card transition-transform duration-300 ease-out hover:-translate-y-1"
                  >
                    {morphs.includes(key) ? (
                      <ViewTransition name={`banner-${key}`} share="morph" default="none">
                        {photo}
                      </ViewTransition>
                    ) : (
                      photo
                    )}
                    <div className="flex grow flex-col px-5 py-6">
                      <span className="eyebrow mb-2">{t(`Home.cards.${key}.category`)}</span>
                      <h3 className="mb-2.5 text-[19px] leading-[1.3] font-semibold">{t(`Home.cards.${key}.title`)}</h3>
                      <span className="mb-[25px] grow text-[13.5px] leading-normal text-ink-2">
                        {t(`Home.cards.${key}.text`)}
                      </span>
                      <span className="text-[13.5px] font-semibold text-terracotta group-hover:underline">
                        {t(`Home.cards.${key}.link`)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </CardCarousel>
        </div>
      </section>
    </>
  );
}

const line = (i: number) => ({ "--i": i }) as CSSProperties;
