import { getLocale, getTranslations } from "next-intl/server";
import { pageMetadata } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";
import { legalReviewed, type LegalDocument } from "./legal-documents";
import { LegalText } from "./LegalText";
import { legalItems } from "./nav-items";

type Key = (typeof legalItems)[number]["key"];
const hrefOf = (key: Key) => legalItems.find((item) => item.key === key)!.href;

export async function legalMetadata(key: Key) {
  const t = await getTranslations();
  const title = t(`Footer.${key}`);
  return pageMetadata({ path: hrefOf(key), title, description: t("Legal.description", { document: title }) });
}

const notice = "mb-4 rounded-lg border-l-4 border-terracotta bg-paper-2 px-4 py-3 text-sm leading-[1.6]";

// One legal page: title, the draft notices, then the same text the /creer
// documents step shows. Mentions légales has no draft yet (pending the client).
export async function LegalPage({ doc }: { doc: LegalDocument | "mentionsLegales" }) {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <article className="mx-auto max-w-[760px] px-5 py-12 sm:py-16">
      <h1 className="mb-6 text-3xl leading-tight font-bold break-words sm:text-4xl">{t(`Footer.${doc}`)}</h1>
      {!legalReviewed && <p className={notice}>{t("Legal.draftBanner")}</p>}
      {doc === "mentionsLegales" ? (
        <p>{t("Legal.mentionsPending")}</p>
      ) : (
        <>
          {/* No translated legal texts yet: other locales show the French. */}
          {locale !== routing.defaultLocale && <p className={notice}>{t("Legal.frenchOnly")}</p>}
          <LegalText doc={doc} heading="h2" />
        </>
      )}
    </article>
  );
}
