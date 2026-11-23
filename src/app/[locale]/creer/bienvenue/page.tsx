import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Welcome } from "./Welcome";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Creation.steps"))("success") };
}

export default function Page() {
  return <Welcome />;
}
