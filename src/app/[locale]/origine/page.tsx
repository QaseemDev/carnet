import { Camera, Gift, Sprout, Users } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import banner from "@/assets/images/origine/banner.png";
import { ArticlePage } from "@/components/brand/ArticlePage";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata({
    path: "/origine",
    title: t("Origine.title"),
    description: t("Home.cards.origine.text"),
    image: banner,
  });
}

export default function Page() {
  return <ArticlePage namespace="Origine" banner={banner} icons={[Camera, Sprout, Users, Gift]} />;
}
