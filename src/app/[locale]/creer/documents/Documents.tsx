"use client";

import { useTranslations } from "next-intl";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { CloseButton, Dialog } from "@/components/brand/Dialog";
import { Link, useRouter } from "@/i18n/navigation";
import { legalDocuments as docs, type LegalDocument as Doc } from "@/components/brand/legal-documents";
import { allConsents, Gate, StepTitle, useCreation } from "../creation";
import * as ui from "../ui";

// Step 4: read the four legal documents (popups) and tick the four consents.
export function Documents({ texts }: { texts: Record<string, ReactNode> }) {
  const t = useTranslations("Creation");
  const td = useTranslations("Creation.documents");
  const tf = useTranslations("Forms");
  const { state, update } = useCreation();
  const router = useRouter();
  const dialogs = useRef<Partial<Record<Doc, HTMLDialogElement | null>>>({});
  // Next keeps a page it leaves mounted but hidden: a popup left open would keep
  // the next page inert. Close them as this page hides (cleanup runs on hide).
  useLayoutEffect(() => {
    const open = dialogs.current;
    return () => Object.values(open).forEach((dialog) => dialog?.close());
  }, []);
  const ready = allConsents(state);

  return (
    <Gate need="account">
      <section className="mx-auto max-w-[940px]">
        <Link href="/creer/compte" className={ui.back}>
          <span aria-hidden>←</span> {t("back")}
        </Link>
        <div className={ui.panel}>
          <StepTitle>{td("title")}</StepTitle>
          <p className={ui.lead}>{td("lead")}</p>
          <p className={ui.notice}>{td("notice")}</p>

          <div className="mt-[18px]">
            {docs.map((doc) => (
              <button
                key={doc}
                type="button"
                aria-haspopup="dialog"
                onClick={() => dialogs.current[doc]?.showModal()}
                className="my-2.5 flex w-full items-center justify-between gap-5 rounded-[10px] border border-[#e3d9cb] bg-[#faf7f1] px-[22px] py-[19px] text-left text-sm leading-[1.6] transition-colors hover:border-[#b8a68e] hover:bg-[#f4ede2]"
              >
                {td(`docs.${doc}`)}
                <span aria-hidden>↗</span>
              </button>
            ))}
          </div>

          <div className="my-7 rounded-xl border border-[#e8ded1] bg-[#f8f5ef] p-[17px] min-[601px]:p-6">
            {docs.map((doc) => (
              <label
                key={doc}
                className="mb-1 flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm leading-[1.8]"
              >
                <input
                  type="checkbox"
                  checked={state.consents[doc]}
                  onChange={(event) =>
                    update((s) => ({
                      consents: { ...s.consents, [doc]: event.target.checked },
                      paid: event.target.checked && s.paid,
                    }))
                  }
                  className="mt-1.5 size-[17px] shrink-0 accent-terracotta"
                />
                <span>{td(`consents.${doc}`)}</span>
              </label>
            ))}
          </div>

          <p id="consent-hint" aria-live="polite" className={`${ui.small} mb-[18px]`}>
            {td("hint")}
          </p>
          <button
            type="button"
            disabled={!ready}
            aria-describedby="consent-hint"
            onClick={() => router.push("/creer/paiement")}
            className={ui.primary}
          >
            {td("continue")}
          </button>
        </div>

        {docs.map((doc) => (
          <Dialog
            key={doc}
            ref={(el) => {
              dialogs.current[doc] = el;
            }}
            title={td(`docs.${doc}`)}
            top={
              <CloseButton className="mb-5 inline-flex min-h-11 items-center py-2 text-sm text-terracotta">
                {tf("back")}
              </CloseButton>
            }
            className="max-h-[90dvh] w-[640px] max-w-full overflow-auto rounded-xl border border-line bg-card px-5 py-6 sm:p-[30px] [&>h2]:mb-[18px] [&>h2]:text-2xl [&>h2]:leading-tight sm:[&>h2]:text-[30px]"
          >
            <p className={`${ui.small} mb-[18px]`}>{td("original")}</p>
            {texts[doc]}
          </Dialog>
        ))}
      </section>
    </Gate>
  );
}
