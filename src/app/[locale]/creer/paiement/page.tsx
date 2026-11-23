import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Payment } from "./Payment";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Creation.steps"))("payment") };
}

export default function Page() {
  return <Payment />;
}
