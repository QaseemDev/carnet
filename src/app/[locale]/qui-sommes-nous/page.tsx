import { Sprout, User, Users } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import banner from "@/assets/images/qui-sommes-nous/banner.jpg";
import { ArticlePage } from "@/components/brand/ArticlePage";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata({
    path: "/qui-sommes-nous",
    title: t("About.title"),
    description: t("Home.cards.quiSommesNous.text"),
    image: banner,
  });
}

export default function Page() {
  return <ArticlePage namespace="About" banner={banner} icons={[User, User, Sprout, Users]} />;
}
