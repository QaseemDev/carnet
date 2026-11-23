import { Heart, MessageSquare, Sprout, Users } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import banner from "@/assets/images/guide/banner.png";
import { ArticlePage } from "@/components/brand/ArticlePage";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata({
    path: "/guide-parental",
    title: t("Guide.title"),
    description: t("Home.cards.guideParental.text"),
    image: banner,
  });
}

export default function Page() {
  return <ArticlePage namespace="Guide" banner={banner} icons={[Sprout, MessageSquare, Users, Heart]} />;
}
