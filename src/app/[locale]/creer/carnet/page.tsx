import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Timeline } from "./Timeline";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Creation.steps"))("carnet") };
}

export default function Page() {
  return <Timeline />;
}
