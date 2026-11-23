"use client";

import { Lock, Mic, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CloseButton, Dialog } from "@/components/brand/Dialog";
import { rich } from "@/components/brand/rich";
import { numbered, shownQuestions, type InfoKey } from "./demo";

const otherMax = 200;

// Step 3: the "invitations de partage". Three questions, the rest on demand.
export function Questions({ onInfo }: { onInfo: (key: InfoKey) => void }) {
  const t = useTranslations("Exemple.steps.3");
  const questions = numbered(useTranslations("Exemple").raw("questions"));
  const [more, setMore] = useState(false);
  const moreId = useId();
  const moreBlock = useRef<HTMLDivElement>(null);
  const card = (n: string) => <QuestionCard key={n} n={n} onInfo={onInfo} />;

  return (
    <>
      <p className="font-serif text-lg text-terracotta italic">{t("lead")}</p>
      <div className="mt-4 w-full space-y-5">
        {questions.slice(0, shownQuestions).map(card)}
        <div ref={moreBlock} id={moreId} hidden={!more} className="space-y-5">
          {questions.slice(shownQuestions).map(card)}
        </div>
        <div className="mt-6 flex justify-center pb-2">
          <button
            type="button"
            aria-expanded={more}
            aria-controls={moreId}
            onClick={() => {
              // Only on opening, as in the prototype: bring the new questions into view.
              flushSync(() => setMore(!more));
              if (!more) moreBlock.current?.scrollIntoView({ block: "start" });
            }}
            className="flex min-h-11 items-center gap-2 rounded-full border-2 border-terracotta bg-white px-7 py-3 text-sm font-bold text-terracotta hover:bg-paper"
          >
            <Lock aria-hidden size={18} strokeWidth={1.8} />
            <span>{more ? t("less") : t("more")}</span>
          </button>
        </div>
      </div>
    </>
  );
}

const pill = "min-h-11 rounded-full border px-4 py-1.5 text-[13px] hover:border-terracotta";
// Prototype `.pill-btn.active` grey, text darkened from #6b7280 for contrast.
const pillOn = "border-[#d1d5db] bg-[#e5e7eb] text-ink-2";
const pillOff = "border-line text-ink-2";

// One question: its parts (see `parts`), "autre" with its popup, a free text field.
function QuestionCard({ n, onInfo }: { n: string; onInfo: (key: InfoKey) => void }) {
  const t = useTranslations("Exemple");
  const tf = useTranslations("Forms");
  const tm = useTranslations("Contact");
  const [chosen, setChosen] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [draft, setDraft] = useState("");
  const popup = useRef<HTMLDialogElement>(null);
  const fieldId = useId();
  const detailsId = useId();
  const otherId = useId();
  const countId = useId();
  const title = t(`questions.${n}.title`);
  const question = t.raw(`questions.${n}`);
  // Each pill is keyed by its message path, so option groups never clash.
  const pills = (path: string, list: unknown) =>
    numbered(list).map((i) => {
      const key = `${path}.${i}`;
      const on = chosen.includes(key);
      return (
        <button
          key={key}
          type="button"
          aria-pressed={on}
          onClick={() => setChosen(on ? chosen.filter((c) => c !== key) : [...chosen, key])}
          className={`${pill} ${on ? pillOn : pillOff}`}
        >
          {t(`questions.${n}.${key}`)}
        </button>
      );
    });
  const other = (
    <button
      type="button"
      aria-pressed={Boolean(answer)}
      aria-haspopup="dialog"
      onClick={() => {
        setDraft(answer);
        popup.current?.showModal();
      }}
      className={`${pill} ${answer ? pillOn : pillOff}`}
    >
      {t("steps.3.other")}
    </button>
  );
  const answered = answer && <p className="mb-2 text-[13px] [overflow-wrap:anywhere] text-ink-2">{answer}</p>;
  // The question itself, then its blocks: each may have a lead, a list of ideas,
  // options or choices, its own line to fill in and a note, in that order. One "autre"
  // goes with the last set of options (or stands alone where the question's own
  // options would be, when it has none).
  const parts = ["", ...numbered(question.blocks).map((b) => `blocks.${b}.`)];
  // A writing prompt (La transmission) has only its own lines to fill in: no "autre",
  // no "Plus particulièrement", no hint. Having `fields` (plural) is what makes one,
  // so a question that only adds a line of its own uses `field` (singular).
  const writing = Boolean(question.fields);
  const otherAt = writing ? null : (parts.findLast((path) => t.has(`questions.${n}.${path}options`)) ?? "");
  const part = (path: string) => {
    const key = `questions.${n}.${path}`;
    return (
      <Fragment key={path}>
        {t.has(`${key}lead`) && (
          <p className="mb-4 text-[15px] text-ink-2 [textarea+&]:mt-4">{t.rich(`${key}lead`, rich)}</p>
        )}
        {t.has(`${key}items`) && (
          // Writing ideas some questions list under their lead.
          <ul className="mb-4 list-disc space-y-1 pl-5 text-[15px] text-ink-2 marker:text-terracotta">
            {numbered(t.raw(`${key}items`)).map((i) => (
              <li key={i}>{t(`${key}items.${i}`)}</li>
            ))}
          </ul>
        )}
        {(t.has(`${key}options`) || t.has(`${key}choices`) || path === otherAt) && (
          <div className="mb-4 flex flex-wrap gap-2 [textarea+&]:mt-4">
            {t.has(`${key}options`) && pills(`${path}options`, t.raw(`${key}options`))}
            {/* Short answers (oui / non): pills that never take the "autre" button. */}
            {t.has(`${key}choices`) && pills(`${path}choices`, t.raw(`${key}choices`))}
            {path === otherAt && other}
          </div>
        )}
        {path === otherAt && answered}
        {t.has(`${key}field`) && (
          // A line of its own to fill in, before "Plus particulièrement".
          <>
            <label htmlFor={`${fieldId}${path}`} className="mt-4 mb-2 block text-[13px] text-ink-2">
              {t(`${key}field`)}
            </label>
            <textarea
              id={`${fieldId}${path}`}
              rows={3}
              placeholder={t("steps.3.detailsPlaceholder")}
              className="block min-h-[82px] w-full resize-y rounded-xl border border-line bg-[#fffdf9] p-3 text-ink"
            />
          </>
        )}
        {t.has(`${key}note`) && <p className="mt-4 text-[13px] text-ink-2">{t.rich(`${key}note`, rich)}</p>}
      </Fragment>
    );
  };

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-[17px] font-bold text-oxblood">{title}</h3>
      {parts.map(part)}
      {writing ? (
        <div className="mb-4 space-y-4">
          {question.short && (
            // Short answers (date, place…), one line each.
            <div className="grid gap-4 sm:grid-cols-2">
              {numbered(question.short).map((i) => (
                <label key={i} className="block text-[13px] text-ink-2">
                  {t(`questions.${n}.short.${i}`)}
                  <input
                    type="text"
                    className="mt-2 block min-h-11 w-full rounded-xl border border-line bg-[#fffdf9] px-3 text-[15px] text-ink"
                  />
                </label>
              ))}
            </div>
          )}
          {numbered(question.fields).map((i) => (
            <label key={i} className="block text-[13px] text-ink-2">
              {t(`questions.${n}.fields.${i}`)}
              <textarea
                rows={3}
                className="mt-2 block min-h-[82px] w-full resize-y rounded-xl border border-line bg-[#fffdf9] p-3 text-[15px] text-ink"
              />
            </label>
          ))}
        </div>
      ) : (
        <>
          <label htmlFor={detailsId} className="mt-4 mb-2 block text-[13px] text-ink-2">
            {t("steps.3.details")}
          </label>
          <textarea
            id={detailsId}
            rows={3}
            placeholder={t("steps.3.detailsPlaceholder")}
            className="mb-4 block min-h-[82px] w-full resize-y rounded-xl border border-line bg-[#fffdf9] p-3 text-ink"
          />
        </>
      )}
      <p className="text-[13px] text-ink-2 italic">{t(`questions.${n}.quote`)}</p>

      {otherAt !== null && (
        <Dialog
          ref={popup}
          title={t("other.title")}
          top={
            <CloseButton className="absolute top-4 right-4 flex size-11 items-center justify-center text-ink-2 hover:text-terracotta">
              <X aria-hidden size={20} />
              <span className="sr-only">{tf("close")}</span>
            </CloseButton>
          }
          className="relative w-md max-w-full rounded-3xl border border-line bg-white p-6 shadow-2xl [&>h2]:mb-4 [&>h2]:pr-10 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-oxblood"
        >
          <p className="mb-3 text-sm text-teal">{title}</p>
          <label htmlFor={otherId} className="mb-2 block text-sm text-ink-2">
            {t.has(`questions.${n}.prompt`) ? t(`questions.${n}.prompt`) : t("other.prompt")}
          </label>
          <textarea
            id={otherId}
            rows={4}
            maxLength={otherMax}
            aria-describedby={countId}
            placeholder={tm("messagePlaceholder")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full resize-none rounded-xl border border-line p-3 text-ink focus:border-terracotta"
          />
          <div className="mt-2 mb-4 flex items-center justify-between">
            <span id={countId} className="text-xs text-ink-2">
              {draft.length}/{otherMax}
            </span>
            <button
              type="button"
              onClick={() => onInfo("audio")}
              className="flex min-h-11 items-center gap-1 text-sm font-semibold text-terracotta hover:text-terracotta-hover"
            >
              <Mic aria-hidden size={16} /> {t("other.audio")}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setAnswer(draft.trim());
              popup.current?.close();
            }}
            className="min-h-11 w-full rounded-xl bg-terracotta py-2.5 font-medium text-white shadow-sm hover:bg-terracotta-hover"
          >
            {t("other.save")}
          </button>
        </Dialog>
      )}
    </div>
  );
}
