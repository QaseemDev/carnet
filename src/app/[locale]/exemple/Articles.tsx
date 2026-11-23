"use client";

import { ArrowLeft, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CloseButton, Dialog } from "@/components/brand/Dialog";
import { rich } from "@/components/brand/rich";
import { numbered } from "./demo";

// Step 2: the "approfondissement" cards (as many as the stage has), each
// opening its Guide parental article in a panel on the right. A stage without
// articles (La transmission) shows only its text here.
export function Articles() {
  const t = useTranslations("Exemple");
  const articles = t.has("articles") ? numbered(t.raw("articles")) : [];
  const [chosen, setOpen] = useState(articles[0]);
  // Stages have different articles; never keep one this stage doesn't have.
  const open = articles.includes(chosen) ? chosen : articles[0];
  const panel = useRef<HTMLDialogElement>(null);
  const text = (
    <>
      <p>{t.rich("steps.2.intro", rich)}</p>
      {t.has("steps.2.quote") && <p className="font-serif text-lg text-terracotta italic">{t("steps.2.quote")}</p>}
    </>
  );
  if (!articles.length) return text;

  return (
    <>
      {text}
      <p>{t("steps.2.more", { count: articles.length })}</p>
      <ul className="mt-2 space-y-3">
        {articles.map((slug) => (
          <li key={slug}>
            <button
              type="button"
              onClick={() => {
                flushSync(() => setOpen(slug));
                panel.current?.showModal();
              }}
              className="group flex w-full items-start gap-3 rounded-xl border border-line bg-white p-4 text-left shadow-sm hover:border-terracotta"
            >
              <TrendingUp aria-hidden size={16} className="mt-1 shrink-0 text-terracotta" />
              <span>
                <span className="block text-sm font-bold text-teal group-hover:text-terracotta">
                  {t(`articles.${slug}.title`)}
                </span>
                {t.has(`articles.${slug}.summary`) && (
                  <span className="mt-1 block text-[13px] text-ink-2">{t(`articles.${slug}.summary`)}</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        ref={panel}
        title={t(`articles.${open}.title`)}
        dialogClassName="ms-auto me-0 h-dvh max-h-dvh w-full max-w-full open:animate-panel-in md:w-1/2 lg:w-[45%]"
        top={
          <CloseButton className="mb-10 flex min-h-11 items-center gap-2 rounded-full border border-terracotta bg-paper px-4 py-2 text-sm font-bold text-terracotta hover:bg-terracotta hover:text-white">
            <ArrowLeft aria-hidden size={18} /> {t("articleBack")}
          </CloseButton>
        }
        className={`h-full overflow-y-auto overscroll-contain border-l border-line bg-paper p-6 shadow-2xl md:p-10 [&>form]:sticky [&>form]:top-0 [&>form]:z-10 [&>h2]:mb-6 [&>h2]:text-3xl [&>h2]:leading-tight [&>h2]:font-bold [&>h2]:text-oxblood md:[&>h2]:text-4xl ${
          open === "phrases" ? "[&>h2]:italic" : ""
        }`}
      >
        <div className="space-y-5 text-[15px] leading-relaxed text-ink-2">
          {t.has(`articles.${open}.summary`) && <p>{t(`articles.${open}.summary`)}</p>}
          <Article slug={open} />
        </div>
      </Dialog>
    </>
  );
}

function Article({ slug }: { slug: string }) {
  const t = useTranslations(`Exemple.articles.${slug}`);
  const tr = useTranslations("Exemple");
  const { p, points, closing } = tr.raw(`articles.${slug}`);
  const phrases = slug === "phrases";
  return (
    <section className="mt-6 [&_p]:mb-4">
      {phrases ? (
        // An introduction, five "phrase + what the child feels" pairs, a conclusion.
        <>
          <p>{t("p.1")}</p>
          {[2, 4, 6, 8, 10].map((i) => (
            <p key={i} className="my-5!">
              <strong className="font-bold">{t(`p.${i}`)}</strong>
              <br />
              <span>{t(`p.${i + 1}`)}</span>
            </p>
          ))}
          <p>{t("p.12")}</p>
        </>
      ) : (
        numbered(p).map((i) => <p key={i}>{t.rich(`p.${i}`, rich)}</p>)
      )}
      {points && <h3 className="mt-[1.8rem] mb-4 text-[21px] font-bold text-oxblood">{tr("remember")}</h3>}
      <ul>
        {numbered(points).map((i) => (
          <li
            key={i}
            className="relative mb-3 pl-5 before:absolute before:left-0 before:text-terracotta before:content-['—']"
          >
            {phrases ? <strong className="font-bold">{t(`points.${i}`)}</strong> : t(`points.${i}`)}
          </li>
        ))}
      </ul>
      {numbered(closing).map((i) => (
        <p key={i} className="font-serif text-terracotta italic">
          {t(`closing.${i}`)}
        </p>
      ))}
    </section>
  );
}
