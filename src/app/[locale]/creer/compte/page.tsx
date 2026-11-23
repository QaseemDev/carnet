import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountForm } from "./AccountForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Creation.steps"))("account") };
}

export default function Page() {
  return <AccountForm />;
}
