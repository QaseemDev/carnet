import { Ear, MessageCircleHeart, MessagesSquare, NotebookPen } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
// shortcut: reuses the Guide banner until the client supplies this page's photo.
import banner from "@/assets/images/guide/banner.png";
import { ArticlePage } from "@/components/brand/ArticlePage";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Communication");
  return pageMetadata({
    path: "/communication-bienveillante",
    title: t("title"),
    description: t("tagline"),
    image: banner,
  });
}

export default function Page() {
  return (
    <ArticlePage
      namespace="Communication"
      banner={banner}
      icons={[MessageCircleHeart, MessagesSquare, Ear, NotebookPen]}
    />
  );
}
