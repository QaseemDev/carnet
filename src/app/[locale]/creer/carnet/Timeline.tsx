"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Gate, StepTitle, useCreation } from "../creation";
import * as ui from "../ui";
import { ageLabel, ageRanges, maxAge, minAge, rangeIndex } from "./ages";

// Step 7: the age timeline and the chapters. A note is kept per chapter (per
// age on the timeline) for the visit only.
// Open once the demo payment is made.
export function Timeline() {
  return (
    <Gate need="paid">
      <TimelineStep />
    </Gate>
  );
}

function TimelineStep() {
  const t = useTranslations("Creation");
  const tc = useTranslations("Creation.carnet");
  const tm = useTranslations("Contact");
  const { state, update } = useCreation();
  const [age, setAge] = useState(minAge);
  // The open chapter: `age-<n>`, `separation` or `birth`; also its note key.
  const [chapter, setChapter] = useState<string | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const slider = useRef<HTMLInputElement>(null);

  const label = tc(ageLabel(age), { age });
  const range = rangeIndex(age);
  const chapterAge = chapter?.startsWith("age-") ? Number(chapter.slice(4)) : null;

  useEffect(() => {
    if (chapter) title.current?.focus();
  }, [chapter]);

  return (
    <section>
      <Link href="/creer/bienvenue" className={ui.back}>
        <span aria-hidden>←</span> {t("back")}
      </Link>
      <StepTitle className="text-center">{tc("title")}</StepTitle>
      <p className={`${ui.lead} mb-[34px] text-center`}>{tc("lead")}</p>
      <Link href="/creer/bienvenue" className={`${ui.secondary} mb-6`}>
        {t("account.returnWelcome")}
      </Link>

      <div className="grid gap-6 sm:grid-cols-[1.6fr_1fr]">
        <div className={ui.panel}>
          <h3 className={`${ui.h3} mt-0! text-[25px]!`}>{tc("timeline")}</h3>
          <label htmlFor="creation-age" className="block text-sm leading-[1.7]">
            {tc("slider")}
          </label>
          <input
            ref={slider}
            id="creation-age"
            type="range"
            min={minAge}
            max={maxAge}
            step={1}
            value={age}
            aria-valuetext={label}
            onChange={(e) => setAge(Number(e.target.value))}
            className="mt-4 h-11 w-full cursor-pointer accent-terracotta"
          />
          <div aria-hidden className="flex justify-between text-xs">
            <span>{tc("desire")}</span>
            <span>{tc("age", { age: maxAge })}</span>
          </div>
          <output htmlFor="creation-age" className="mt-7 block font-serif text-[32px] text-terracotta">
            {label}
          </output>

          <div className="mt-[22px] grid grid-cols-2 gap-2.5">
            {(
              [
                ["prev", -1],
                ["next", 1],
              ] as const
            ).map(([key, step]) => (
              <button
                key={key}
                type="button"
                disabled={ageRanges[range + step] === undefined}
                onClick={() => {
                  const next = ageRanges[range + step].start;
                  setAge(next);
                  // As in the prototype, the range buttons (not the slider) move an open age chapter.
                  if (chapterAge !== null) setChapter(`age-${next}`);
                }}
                className={`${ui.secondary} w-full px-3.5! py-3! text-xs disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {tc(key)}
              </button>
            ))}
          </div>
          <p aria-live="polite" className={`${ui.small} mt-[18px]`}>
            {tc(`ranges.${ageRanges[range].key}`)}
          </p>
          <button type="button" className={ui.primary} onClick={() => setChapter(`age-${age}`)}>
            {tc("open")}
          </button>
        </div>

        <aside className={`${ui.panel} bg-[#f0f3ed]!`}>
          <h3 className="mt-1.5 mb-[25px] font-sans text-[11px] font-semibold tracking-[1.3px]">{tc("special")}</h3>
          {(
            [
              ["separation", tc("separation")],
              ["birth", tc("birthStories")],
            ] as const
          ).map(([key, name]) => (
            <button
              key={key}
              type="button"
              onClick={() => setChapter(key)}
              className="my-2.5 flex w-full items-center justify-between gap-5 rounded-[10px] border border-[#e3d9cb] bg-[#faf7f1] px-[22px] py-[19px] text-left text-sm leading-[1.6] transition-colors hover:border-[#b8a68e] hover:bg-[#f4ede2]"
            >
              {name} <span aria-hidden>→</span>
            </button>
          ))}
        </aside>
      </div>

      <div hidden={!chapter} className={`${ui.panel} mt-6 scroll-mt-32`}>
        <button
          type="button"
          className={ui.back}
          onClick={() => {
            setChapter(null);
            slider.current?.focus();
          }}
        >
          {tc("backToTimeline")}
        </button>
        <h3 ref={title} tabIndex={-1} className={`${ui.h3} focus:outline-none`}>
          {chapterAge !== null
            ? tc(ageLabel(chapterAge), { age: chapterAge })
            : chapter === "separation"
              ? tc("separation")
              : tc("birthStories")}
        </h3>
        <label htmlFor="creation-chapter-note" className="block text-sm leading-[1.7]">
          {tc("note")}
        </label>
        <textarea
          id="creation-chapter-note"
          rows={6}
          placeholder={tm("messagePlaceholder")}
          value={(chapter && state.notes[chapter]) || ""}
          onChange={(e) => chapter && update((s) => ({ notes: { ...s.notes, [chapter]: e.target.value } }))}
          className="mt-[15px] block w-full resize-y rounded-lg border border-[#d5c4b0] p-[18px]"
        />
        <p className={`${ui.small} mt-[18px]`}>{tc("noteKept")}</p>
        <Link href="/exemple" className={ui.secondary}>
          {tc("example")}
        </Link>
      </div>
    </section>
  );
}
