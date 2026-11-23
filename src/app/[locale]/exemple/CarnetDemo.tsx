"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Baby,
  Camera,
  ChevronDown,
  ChevronRight,
  FileText,
  Gift,
  Heart,
  HeartCrack,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  Music,
  Pause,
  PenLine,
  Play,
  Settings,
  Sprout,
  Star,
  Sun,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  addTransitionType,
  startTransition,
  useEffect,
  useId,
  useRef,
  useState,
  ViewTransition,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import picture from "@/assets/images/exemple/carnet.png";
import logo from "@/assets/images/logo.png";
import { InfoDialog } from "@/components/brand/Dialog";
import { rich } from "@/components/brand/rich";
import { Link, useRouter } from "@/i18n/navigation";
import { Articles } from "./Articles";
import {
  defaultStage,
  hasMusic,
  numbered,
  range,
  stagePath,
  stages,
  stepCount,
  type InfoKey,
  type Stage,
} from "./demo";
import { Questions } from "./Questions";

// The carnet demo for one life stage (its text comes in as `Exemple.*`). All
// six steps stay mounted (only the current one is shown), so choices and
// answers survive moving between them, until refresh or another stage.
// Nothing is saved or sent.
export function CarnetDemo({ stage = defaultStage }: { stage?: Stage }) {
  const t = useTranslations("Exemple");
  const [step, setStep] = useState(0);
  const last = stepCount - 1;
  const [navigated, setNavigated] = useState(false);
  const [info, setInfo] = useState<InfoKey>("expression");
  const infoDialog = useRef<HTMLDialogElement>(null);
  const titles = useRef<(HTMLHeadingElement | null)[]>([]);

  // Back to the top first, then the page turns (forward or back) as a view
  // transition. A click during a turn still counts: React holds the next turn
  // until this one ends, so moves count from the last step asked for, not the
  // one on screen.
  const asked = useRef(0);
  const go = (next: number) => {
    const to = Math.min(Math.max(next, 0), last);
    if (to === asked.current) return;
    const type = to > asked.current ? "turn-next" : "turn-prev";
    asked.current = to;
    window.scrollTo({ top: 0 });
    startTransition(() => {
      addTransitionType(type);
      setStep(to);
      setNavigated(true);
    });
  };
  // After a move, focus the new step's title so a screen reader announces it.
  useEffect(() => {
    if (navigated) titles.current[step]?.focus({ preventScroll: true });
  }, [step, navigated]);

  const showInfo = (key: InfoKey) => {
    flushSync(() => setInfo(key));
    infoDialog.current?.showModal();
  };
  const infoTitle = info === "expression" || info === "feuilleter" ? t(`sidebar.${info}`) : t(`header.${info}`);

  return (
    <div className="flex min-w-0 flex-col md:flex-row">
      {/* During a turn only the step is captured, not the whole page: a
          captured element can't be clicked, and the page must stay clickable.
          Inline because the CSS build drops this (newer) selector. */}
      <style>{`:root:active-view-transition-type(turn-next, turn-prev) { view-transition-name: none; }`}</style>
      <Sidebar stage={stage} onInfo={showInfo} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-white/80 px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3 text-sm font-medium tracking-wide text-teal uppercase">
            <span>{t("header.path")}</span>
            <span aria-hidden className="text-line">
              /
            </span>
            <StagePicker value={stage} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {hasMusic && <MusicButton />}
            <div className="hidden items-center gap-4 text-xs font-medium md:flex">
              {(
                [
                  ["audio", Mic],
                  ["video", Video],
                  ["photo", Camera],
                  ["text", PenLine],
                ] as const
              ).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => showInfo(key)}
                  className="flex min-h-11 min-w-11 flex-col items-center gap-1 hover:text-terracotta"
                >
                  <Icon aria-hidden size={18} className="text-terracotta" /> {t(`header.${key}`)}
                </button>
              ))}
            </div>
            <h1 className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 font-sans text-xs font-semibold text-ink shadow-sm">
              <Sun aria-hidden size={18} className="text-terracotta" />
              {t("header.carnet")}
            </h1>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between overflow-x-hidden p-4 sm:p-6 md:p-10">
          <div className="mb-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            <ViewTransition
              update={{ "turn-next": "turn-next", "turn-prev": "turn-prev", default: "none" }}
              default="none"
            >
              <div className="lg:col-span-7">
                {range(stepCount).map((n, i) => (
                  <section key={n} hidden={i !== step} className="space-y-6">
                    <p className="text-xs font-bold tracking-widest text-terracotta uppercase">
                      {i === 0 ? t("steps.0.badge") : `${i} • ${t(`steps.${i}.label`)}`}
                    </p>
                    <h2
                      ref={(el) => {
                        titles.current[i] = el;
                      }}
                      tabIndex={-1}
                      className="text-4xl leading-tight font-bold text-oxblood focus:outline-none md:text-5xl"
                    >
                      {t.rich(`steps.${i}.title`, rich)}
                    </h2>
                    {t.has(`steps.${i}.subtitle`) && (
                      <p className="font-serif text-xl text-terracotta">{t(`steps.${i}.subtitle`)}</p>
                    )}
                    <div className="w-full space-y-4 text-[15px] leading-relaxed text-teal md:text-base">
                      <StepBody step={i} onInfo={showInfo} />
                    </div>
                  </section>
                ))}
              </div>
            </ViewTransition>
            <Image
              src={picture}
              alt={t("pictureAlt")}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-[400px] w-full rounded-3xl object-cover shadow-xl md:h-[500px] lg:sticky lg:top-28 lg:col-span-5"
            />
          </div>

          <div className="mt-auto border-t border-line pt-6">
            {step === 0 && (
              <div className="mb-6 flex items-center gap-3">
                <ArrowDown aria-hidden size={48} className="shrink-0 text-terracotta" />
                <div>
                  <p className="font-serif text-xl font-bold text-oxblood">{t("start")}</p>
                  <p className="text-sm text-ink-2">{t("startHint")}</p>
                </div>
              </div>
            )}
            <div className="mt-4 flex flex-col gap-6 md:flex-row">
              <Bubbles step={step} onGo={go} />
              {/* Hidden but kept in place on step 0, so the step buttons don't resize (prototype). */}
              <div
                inert={step === 0}
                className={`flex items-center justify-end gap-3 md:w-[30%] ${step === 0 ? "invisible" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => go(asked.current - 1)}
                  className="flex min-h-12 items-center gap-2 rounded-full border border-terracotta bg-white px-6 py-4 font-medium whitespace-nowrap text-terracotta shadow-sm hover:bg-paper"
                >
                  <ArrowLeft aria-hidden size={16} /> {t("back")}
                </button>
                <NextButton
                  sub={t(`steps.${step}.next`)}
                  label={step === last ? t("create") : t("continue")}
                  onClick={step === last ? undefined : () => go(asked.current + 1)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <InfoDialog ref={infoDialog} title={infoTitle} text={t(`info.${info}`)} />
    </div>
  );
}

const ages: readonly Stage[] = stages.filter((key) => key !== "naissance" && key !== "rupture");

// Picking an age opens it at once (client's call over WCAG 3.2.2:
// on some browsers arrowing through the closed list changes page on each step).
// Uncontrolled, so the choice stays shown while the next stage loads. A page
// left behind stays mounted and is shown again on Back, so the effect (re-run
// then) puts its own stage back.
function StagePicker({ value }: { value: Stage }) {
  const t = useTranslations("Exemple.stage");
  const router = useRouter();
  const select = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (select.current) select.current.value = value;
  }, [value]);
  return (
    <span className="relative inline-flex min-w-0 items-center">
      <select
        ref={select}
        name="stage"
        aria-label={t("label")}
        defaultValue={value}
        onChange={(e) => router.push(stagePath(e.target.value as Stage))}
        className="min-h-11 w-full max-w-full cursor-pointer appearance-none truncate rounded-full border border-terracotta bg-white py-2 pr-10 pl-4 font-sans text-base font-semibold tracking-normal text-terracotta normal-case shadow-sm hover:bg-paper"
      >
        {/* On a left-menu stage the picker still names it, but can't pick it. */}
        {!ages.includes(value) && (
          <option value={value} disabled hidden>
            {t(`names.${value}`)}
          </option>
        )}
        {ages.map((key) => (
          <option key={key} value={key}>
            {t(`names.${key}`)}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden size={16} className="pointer-events-none absolute right-4 text-terracotta" />
    </span>
  );
}

const resources: {
  key: string;
  Icon: LucideIcon;
  href?: "/chemin-de-vie" | "/guide-parental" | "/creer";
  info?: InfoKey;
}[] = [
  { key: "chemin", Icon: Star, href: "/chemin-de-vie" },
  { key: "expression", Icon: MessageSquare, info: "expression" },
  { key: "guide", Icon: Settings, href: "/guide-parental" },
  { key: "feuilleter", Icon: FileText, info: "feuilleter" },
  { key: "offres", Icon: Gift, href: "/creer" },
];

// Life events that are not ages: on the left menu only, as the client
// asked, so the stage picker leaves them out.
const journeys: { key: Stage; Icon: LucideIcon }[] = [
  { key: "naissance", Icon: Baby },
  { key: "rupture", Icon: HeartCrack },
];

// On phones only the links show, as one row that scrolls sideways.
function Sidebar({ stage, onInfo }: { stage: Stage; onInfo: (key: InfoKey) => void }) {
  const t = useTranslations("Exemple.sidebar");
  const ts = useTranslations("Exemple.stage");
  const tb = useTranslations("Brand");
  const item =
    "flex min-h-12 shrink-0 items-center gap-4 rounded-lg px-4 py-3 text-left text-sm font-medium text-ink hover:bg-paper";
  return (
    <aside className="shrink-0 border-b border-line bg-[#fdfbf7] px-4 py-3 md:w-72 md:border-r md:border-b-0 md:p-6">
      <div className="hidden flex-col items-center border-b border-line pb-6 text-center md:flex">
        <Image src={logo} alt="" sizes="144px" className="mb-2 h-auto w-36" />
        <p className="font-serif text-xl font-bold tracking-tight text-terracotta">{tb("title")}</p>
        <p className="mt-1 text-[10px] tracking-widest text-ink-2 uppercase">{t("tagline")}</p>
      </div>
      <nav aria-labelledby="exemple-journeys" className="mb-3 md:mb-0 md:border-b md:border-line md:py-6">
        <p
          id="exemple-journeys"
          className="mb-2 px-2 text-xs font-semibold tracking-wider text-ink-2 uppercase md:mb-4"
        >
          {t("journeys")}
        </p>
        <ul className="-mx-4 flex gap-1 overflow-x-auto px-2 md:mx-0 md:flex-col md:gap-2 md:px-0">
          {journeys.map(({ key, Icon }) => (
            <li key={key} className="shrink-0">
              <Link
                href={stagePath(key)}
                aria-current={key === stage ? "page" : undefined}
                className={`${item} aria-[current=page]:bg-paper aria-[current=page]:font-semibold aria-[current=page]:text-terracotta`}
              >
                <Icon aria-hidden size={20} className="shrink-0 text-terracotta" />
                <span className="leading-[1.45] md:flex-1">{ts(`names.${key}`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-labelledby="exemple-resources" className="md:py-6">
        <p
          id="exemple-resources"
          className="mb-2 px-2 text-xs font-semibold tracking-wider text-ink-2 uppercase md:mb-4"
        >
          {t("resources")}
        </p>
        <ul className="-mx-4 flex gap-1 overflow-x-auto px-2 md:mx-0 md:flex-col md:gap-2 md:px-0">
          {resources.map(({ key, Icon, href, info }) => {
            const body = (
              <>
                <Icon aria-hidden size={20} className="shrink-0 text-terracotta" />
                <span className="leading-[1.45] md:flex-1">{t(key)}</span>
              </>
            );
            return (
              <li key={key} className="shrink-0">
                {href ? (
                  <Link href={href} className={item}>
                    {body}
                  </Link>
                ) : (
                  <button type="button" onClick={() => onInfo(info!)} className={`${item} w-full`}>
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

const bubbleIcons = [Sun, Sprout, Users, Heart, ImageIcon];

// Steps 1–5, each one jumps to its step.
function Bubbles({ step, onGo }: { step: number; onGo: (step: number) => void }) {
  const t = useTranslations("Exemple.steps");
  return (
    <ol className="flex w-full flex-1 gap-2 overflow-x-auto pb-1 md:gap-4">
      {bubbleIcons.map((Icon, index) => {
        const i = index + 1;
        const current = i === step;
        return (
          <li key={i} className="min-w-[104px] flex-1">
            <button
              type="button"
              aria-current={current ? "step" : undefined}
              onClick={() => onGo(i)}
              className={`flex h-full min-h-[136px] w-full flex-col justify-between rounded-2xl p-2 text-left md:p-3 ${
                current
                  ? "border-2 border-terracotta bg-white shadow-sm"
                  : "border border-line bg-[#fdfbf7] hover:border-terracotta"
              }`}
            >
              <span className="mb-2 flex items-center justify-between">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    current ? "bg-terracotta text-white" : "border border-terracotta text-terracotta"
                  }`}
                >
                  {i}
                </span>
                <Icon aria-hidden size={20} className="text-terracotta" />
              </span>
              <span className="mb-2 block min-h-[3em] flex-1 text-xs leading-[1.4] font-semibold text-ink">
                {t(`${i}.label`)}
              </span>
              <span className="flex justify-end">
                <span
                  className={`flex size-5 items-center justify-center rounded-full border ${
                    current ? "border-terracotta text-terracotta" : "border-line text-line"
                  }`}
                >
                  <ChevronRight aria-hidden size={10} />
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

// "Continuer" with the next step's name under it; on the last step, a link to /creer.
function NextButton({ label, sub, onClick }: { label: string; sub: string; onClick?: () => void }) {
  const className =
    "flex min-w-[140px] flex-1 flex-col items-center justify-center rounded-full bg-terracotta px-6 py-3 leading-tight font-medium text-white shadow-md hover:bg-terracotta-hover";
  const body = (
    <>
      <span className="flex items-center gap-2">
        {label} <ArrowRight aria-hidden size={16} />
      </span>
      <span className="text-[10px] font-normal whitespace-nowrap">{sub}</span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  ) : (
    <Link href="/creer" className={className}>
      {body}
    </Link>
  );
}

// Toggles its icon only: no track yet (see `hasMusic`).
function MusicButton() {
  const t = useTranslations("Exemple.header");
  const [playing, setPlaying] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={playing}
      onClick={() => setPlaying(!playing)}
      className="flex min-h-11 items-center gap-3 rounded-full border border-line bg-white px-4 py-1.5 shadow-sm hover:border-terracotta"
    >
      <Music aria-hidden size={16} className="text-terracotta" />
      <span className="text-xs font-semibold">{t("music")}</span>
      <span className="flex size-6 items-center justify-center rounded-full border border-terracotta text-terracotta">
        {playing ? <Pause aria-hidden size={10} /> : <Play aria-hidden size={10} />}
      </span>
    </button>
  );
}

const quote = "font-serif text-lg text-terracotta italic";
const dot = <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-terracotta" />;

function StepBody({ step, onInfo }: { step: number; onInfo: (key: InfoKey) => void }) {
  const t = useTranslations("Exemple.steps");
  const paragraphs = (n: number): ReactNode =>
    numbered(t.has(`${n}.p`) && t.raw(`${n}.p`)).map((i) => <p key={i}>{t.rich(`${n}.p.${i}`, rich)}</p>);
  // Fill-in lines some stages add (a label and a free text field each).
  // La transmission's lines are names and signatures: no "Votre précision" hint there.
  const hint = !t.has("5.letter");
  const fields = (n: number): ReactNode =>
    numbered(t.has(`${n}.fields`) && t.raw(`${n}.fields`)).map((i) => (
      <Prompt key={i} label={t(`${n}.fields.${i}`)} hint={hint} />
    ));

  switch (step) {
    case 0:
      return (
        <>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-serif text-lg">
            {[..."CARNET"].map((letter, i) => (
              <div key={i} className="contents">
                <dt className="text-xl font-bold text-terracotta">{letter}</dt>
                <dd>{t(`0.acrostic.${i + 1}`)}</dd>
              </div>
            ))}
          </dl>
          <p className="pt-2 font-bold text-oxblood">{t("0.creates")}</p>
          <ul className="space-y-1">
            {range(4).map((i) => (
              <li key={i} className="flex gap-2">
                {dot}
                <span>{t(`0.items.${i}`)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg border border-[#f0dfcc] bg-[#fbf6f0] p-5 shadow-sm">
            <p className={quote}>{t.rich("0.quote", rich)}</p>
          </div>
        </>
      );
    case 1:
      return (
        <>
          {paragraphs(1)}
          <p className={quote}>{t("1.quote")}</p>
        </>
      );
    case 2:
      return <Articles />;
    case 3:
      return <Questions onInfo={onInfo} />;
    case 4:
      return (
        <>
          {paragraphs(4)}
          {fields(4)}
          {t.has("4.after") && <p>{t("4.after")}</p>}
          {t.has("4.quote") && <p className={quote}>{t("4.quote")}</p>}
          {t.has("4.invite") && <p>{t("4.invite")}</p>}
        </>
      );
    default:
      if (t.has("5.letter")) return <Letter />;
      return (
        <>
          <ul className="space-y-2 pl-1 font-medium text-terracotta">
            {numbered(t.raw("5.items")).map((i) => (
              <li key={i} className="flex items-start gap-2">
                {dot}
                {t(`5.items.${i}`)}
              </li>
            ))}
          </ul>
          {fields(5)}
          <div className="flex flex-wrap gap-4 pt-6 pb-4">
            {(
              [
                ["photo", Camera],
                ["video", Video],
                ["audio", Mic],
                ["text", PenLine],
              ] as const
            ).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => onInfo(key)}
                className="flex min-h-11 items-center gap-2 rounded-xl border border-[#f0dfcc] bg-white px-5 py-2.5 text-sm font-semibold text-terracotta hover:border-terracotta"
              >
                <Icon aria-hidden size={16} /> {t(`5.${key}`)}
              </button>
            ))}
          </div>
          <p className={quote}>{t.rich("5.quote", rich)}</p>
        </>
      );
  }
}

// La transmission ends on a choice: add a personal letter or leave the Carnet
// as it is. The letter shows once the first choice ("add a letter") is picked,
// right under the choices so it comes next in reading order.
function Letter() {
  const t = useTranslations("Exemple.steps.5");
  const [writing, setWriting] = useState(false);
  const group = useId();
  const titleId = useId();
  return (
    <>
      <fieldset className="space-y-3">
        <legend className="mb-3">{t("lead")}</legend>
        {numbered(t.raw("choices")).map((i) => (
          <label
            key={i}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-2 font-medium text-terracotta has-checked:border-terracotta"
          >
            <input
              type="radio"
              name={group}
              onChange={() => setWriting(i === "1")}
              className="size-5 shrink-0 accent-terracotta"
            />
            {t(`choices.${i}`)}
          </label>
        ))}
      </fieldset>
      {writing && (
        <section aria-labelledby={titleId} className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h3 id={titleId} className="text-[17px] font-bold text-oxblood">
            {t("letter.title")}
          </h3>
          {numbered(t.raw("letter.p")).map((i) => (
            <p key={i}>{t.rich(`letter.p.${i}`, rich)}</p>
          ))}
          <textarea
            aria-labelledby={titleId}
            rows={5}
            className="block min-h-[120px] w-full resize-y rounded-xl border border-line bg-[#fffdf9] p-3 text-ink"
          />
          {numbered(t.raw("letter.fields")).map((i) => (
            <Prompt key={i} label={t(`letter.fields.${i}`)} hint={false} />
          ))}
        </section>
      )}
      <p className={quote}>{t("quote")}</p>
    </>
  );
}

// Same look as the "Plus particulièrement" field under each question.
function Prompt({ label, hint = true }: { label: string; hint?: boolean }) {
  const t = useTranslations("Exemple.steps.3");
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] text-ink-2">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        placeholder={hint ? t("detailsPlaceholder") : undefined}
        className="block min-h-[82px] w-full resize-y rounded-xl border border-line bg-[#fffdf9] p-3 text-ink"
      />
    </div>
  );
}
