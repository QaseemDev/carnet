import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import carnet from "@/assets/images/exemple/carnet.png";
import { pageMetadata } from "@/i18n/metadata";
import { CarnetDemo } from "./CarnetDemo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata({
    path: "/exemple",
    title: t("Nav.exemple"),
    description: t("Home.cards.exemple.text"),
    image: carnet,
  });
}

export default function Page() {
  return <CarnetDemo />;
}
