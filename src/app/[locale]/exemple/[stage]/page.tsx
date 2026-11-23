import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import carnet from "@/assets/images/exemple/carnet.png";
import { pageMetadata } from "@/i18n/metadata";
import { CarnetDemo } from "../CarnetDemo";
import { defaultStage, isStage, stageText, stages } from "../demo";

// Blocking on purpose: an unknown stage must answer 404 before anything
// streams. Every real stage is prerendered, so there is no wait to hide.
export const instant = false;

// One page per life stage but 4–5 (that one is `/exemple`).
export function generateStaticParams() {
  return stages.filter((stage) => stage !== defaultStage).map((stage) => ({ stage }));
}

async function stageOf(params: PageProps<"/[locale]/exemple/[stage]">["params"]) {
  const { stage } = await params;
  if (!isStage(stage) || stage === defaultStage) notFound();
  return stage;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/exemple/[stage]">): Promise<Metadata> {
  const stage = await stageOf(params);
  const t = await getTranslations();
  return pageMetadata({
    path: `/exemple/${stage}`,
    title: `${t("Nav.exemple")} · ${t(`Exemple.stage.names.${stage}`)}`,
    description: t("Home.cards.exemple.text"),
    image: carnet,
  });
}

export default async function Page({ params }: PageProps<"/[locale]/exemple/[stage]">) {
  const stage = await stageOf(params);
  const messages = await getMessages();
  // Only this stage's text reaches the browser, not all twenty.
  const own = (await import(`@/i18n/stages/${await getLocale()}/${stage}.json`)).default;
  return (
    <NextIntlClientProvider messages={{ ...messages, Exemple: overlay(withoutStageText(messages.Exemple as AbstractIntlMessages), own) }}>
      <CarnetDemo stage={stage} />
    </NextIntlClientProvider>
  );
}

// The 4–5 text minus everything a stage brings itself.
function withoutStageText(base: AbstractIntlMessages): AbstractIntlMessages {
  const out = structuredClone(base);
  for (const path of stageText) {
    const keys = path.split(".");
    const last = keys.pop()!;
    const parent = keys.reduce<AbstractIntlMessages | undefined>(
      (node, key) => node?.[key] as AbstractIntlMessages | undefined,
      out,
    );
    if (parent) delete parent[last];
  }
  return out;
}

// `base` with every key of `own` replaced, nested keys included.
function overlay(base: AbstractIntlMessages, own: AbstractIntlMessages): AbstractIntlMessages {
  const out = { ...base };
  for (const [key, value] of Object.entries(own)) {
    const under = base[key];
    out[key] = typeof value === "object" && typeof under === "object" ? overlay(under, value) : value;
  }
  return out;
}
