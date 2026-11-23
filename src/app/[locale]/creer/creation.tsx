"use client";

import { useTranslations } from "next-intl";
import { useSelectedLayoutSegments } from "next/navigation";
import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { OfferSlug } from "./offers";
import * as ui from "./ui";

import { legalDocuments as docs, type LegalDocument as Doc } from "@/components/brand/legal-documents";

export type Account = {
  forWhom: "child" | "gift";
  firstName: string;
  lastName: string;
  child: string;
  email: string;
  password: string;
  confirm: string;
  identity: string;
  access: "single" | "dual";
};

export type Guest = { id: number; name: string; crossed: boolean };

type State = {
  offer?: OfferSlug;
  account: Account;
  // Step 3 passed (or skipped with "Explorer la suite"); any edit to it clears this.
  validated: boolean;
  consents: Record<Doc, boolean>;
  paid: boolean;
  welcomeVisited: boolean;
  place: string;
  date: string;
  reasons: string;
  guests: Guest[];
  // Chapter notes on step 7, keyed `age-<n>`, `separation` or `birth`.
  notes: Record<string, string>;
};

const initial: State = {
  account: {
    forWhom: "child",
    firstName: "",
    lastName: "",
    child: "",
    email: "",
    password: "",
    confirm: "",
    identity: "",
    access: "single",
  },
  validated: false,
  consents: { cgu: false, cgv: false, charte: false, confidentialite: false },
  paid: false,
  welcomeVisited: false,
  place: "",
  date: "",
  reasons: "",
  guests: [1, 2, 3].map((id) => ({ id, name: "", crossed: false })),
  notes: {},
};

type Context = {
  state: State;
  update: (change: Partial<State> | ((state: State) => Partial<State>)) => void;
  // True once the visitor has moved between steps inside the flow.
  navigated: boolean;
};

const CreationContext = createContext<Context | null>(null);

// Everything typed in the flow lives here, in memory only: it survives moving
// between steps (the layout stays mounted) and is gone on refresh. Nothing is
// written to storage or sent anywhere (visual only: no accounts or payments yet).
export function CreationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial);
  const path = useSelectedLayoutSegments().join("/");
  const [firstPath] = useState(path);
  const [navigated, setNavigated] = useState(false);
  if (!navigated && path !== firstPath) setNavigated(true);

  const update: Context["update"] = useCallback(
    (change) => setState((s) => ({ ...s, ...(typeof change === "function" ? change(s) : change) })),
    [],
  );

  return <CreationContext value={{ state, update, navigated }}>{children}</CreationContext>;
}

export function useCreation() {
  const context = use(CreationContext);
  if (!context) throw new Error("useCreation outside CreationProvider");
  return context;
}

export const allConsents = (state: State) => docs.every((d) => state.consents[d]);

// What a step needs from the earlier ones, as in the prototype's `creationGo`.
const gates = {
  offer: (s: State) => !!s.offer,
  account: (s: State) => gates.offer(s) && s.validated,
  consents: (s: State) => gates.account(s) && allConsents(s),
  paid: (s: State) => gates.consents(s) && s.paid,
  // Once seen, the welcome page stays open even if an edit undoes the payment.
  welcome: (s: State) => s.welcomeVisited || gates.paid(s),
};

// A step opened directly (refresh, pasted link) without the answers it needs
// keeps its URL and points back to step 1 instead of crashing.
export function Gate({ need, children }: { need: keyof typeof gates; children: ReactNode }) {
  const { state } = useCreation();
  const t = useTranslations("Creation");
  if (gates[need](state)) return children;
  return (
    <div className={`${ui.notice} mx-auto max-w-[720px] text-center`}>
      <p className="mb-3">{t("missing")}</p>
      <Link href="/creer" className={ui.secondary}>
        {t("restart")}
      </Link>
    </div>
  );
}

// The step's `h2`. After a move between steps, focus lands on it so a screen
// reader announces the new step (prototype `heading.focus()`).
export function StepTitle({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  const { navigated } = useCreation();
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (navigated) ref.current?.focus();
  }, [navigated]);
  return (
    <h2 ref={ref} id={id} tabIndex={-1} className={`${ui.h2} focus:outline-none ${className}`}>
      {children}
    </h2>
  );
}

const stepKeys = ["offer", "plan", "account", "documents", "payment", "success", "carnet"] as const;
const stepOf: Record<string, number> = { formule: 1, compte: 2, documents: 3, paiement: 4, bienvenue: 5, carnet: 6 };

// Prototype `.creation-progress` (final layer): a framed row of 7, wrapping
// to two rows of 4 on phones, with a hairline between the circles.
export function Progress() {
  const t = useTranslations("Creation");
  const current = stepOf[useSelectedLayoutSegments()[0] ?? ""] ?? 0;
  return (
    <ol
      aria-label={t("progress")}
      className="mb-8 grid list-none grid-cols-4 gap-y-[22px] rounded-2xl border border-[#e7ded2] bg-white/70 px-2 py-[19px] min-[601px]:mb-[45px] min-[601px]:grid-cols-7 min-[601px]:px-3 min-[601px]:py-[22px]"
    >
      {stepKeys.map((key, i) => (
        <li
          key={key}
          aria-current={i === current ? "step" : undefined}
          className={`relative z-0 px-1 text-center text-[9px] leading-[1.4] wrap-break-word min-[601px]:px-[9px] min-[601px]:text-[11px] ${
            i < stepKeys.length - 1
              ? "after:absolute after:top-4 after:left-[calc(50%+21px)] after:-z-10 after:h-px after:w-[calc(100%-42px)] after:bg-[#ded9ce] after:content-[''] max-[600px]:nth-4:after:hidden min-[601px]:after:top-[18px] min-[601px]:after:left-[calc(50%+24px)] min-[601px]:after:w-[calc(100%-48px)]"
              : ""
          } ${i === current ? "font-bold text-[#983d2e]" : "text-[#737c78]"}`}
        >
          <span
            className={`mx-auto mb-3 flex size-8 items-center justify-center rounded-full border text-xs font-semibold min-[601px]:size-[37px] ${
              i === current
                ? "border-terracotta bg-terracotta text-white shadow-[0_0_0_5px_#f6e8df]"
                : i < current
                  ? "border-teal bg-teal text-white"
                  : "border-[#dfd6c8] bg-[#fdfbf7]"
            }`}
          >
            {i + 1}
          </span>
          {t(`steps.${key}`)}
        </li>
      ))}
    </ol>
  );
}
