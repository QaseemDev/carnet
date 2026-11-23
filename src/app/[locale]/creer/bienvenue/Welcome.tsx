"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type ChangeEvent, type CSSProperties, type SVGProps } from "react";
import { Link } from "@/i18n/navigation";
import { Gate, StepTitle, useCreation, type Guest } from "../creation";
import * as ui from "../ui";

const input =
  "min-h-12 w-full min-w-0 rounded-[9px] border border-[#d9d4c9] bg-white px-[15px] py-[13px] text-teal focus:border-terracotta";
// Field labels are semibold, group legends regular, both in italics.
const legend = "mb-2.5 block text-sm leading-[1.6] italic";
const label = `${legend} font-semibold`;
const guestButton =
  "min-h-11 min-w-[62px] shrink-0 rounded-[8px] border border-[#e4d5c5] bg-white px-2 py-2.5 text-xs text-terracotta";

// Step 6: the founders' welcome letter and the "Début du Carnet de Vie" page.
// Child and identity are the same answers as on step 3 (prototype keeps them in sync).
// Open once the demo payment is made, and from then on.
export function Welcome() {
  return (
    <Gate need="welcome">
      <WelcomeStep />
    </Gate>
  );
}

function WelcomeStep() {
  const t = useTranslations("Creation.success");
  const ta = useTranslations("Creation.account");
  const { state, update } = useCreation();
  const { account, guests } = state;
  // The letter reveals line by line and the seal stamps only on the first
  // arrival; read before the effect below marks the step visited.
  const [firstVisit, setFirstVisit] = useState(!state.welcomeVisited);
  const reveal = (i: number, animation = "animate-ink") =>
    firstVisit ? { className: animation, style: { "--i": i } as CSSProperties } : { className: "" };

  useEffect(() => {
    update({ welcomeVisited: true });
    // Leaving keeps this page hidden for Back, and showing it again would
    // restart any CSS animation still set, so they go when it hides. (Strict
    // Mode's mount/unmount/mount in `pnpm dev` clears them at once: the reveal
    // only plays in a production build.)
    return () => setFirstVisit(false);
  }, [update]);

  const setAccount = (key: "child" | "identity") => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    update((s) => ({ account: { ...s.account, [key]: event.target.value } }));
  const setGuest = (id: number, change: Partial<Guest>) =>
    update((s) => ({ guests: s.guests.map((g) => (g.id === id ? { ...g, ...change } : g)) }));
  const addGuest = () => {
    const id = Math.max(0, ...guests.map((g) => g.id)) + 1;
    update((s) => ({ guests: [...s.guests, { id, name: "", crossed: false }] }));
    requestAnimationFrame(() => document.getElementById(`welcome-guest-${id}`)?.focus());
  };

  return (
    <section className="mx-auto max-w-[1140px] rounded-xl border border-line bg-white px-[21px] py-[26px] min-[601px]:p-[38px]">
      <StepTitle className="mb-[30px]! text-center sm:text-[32px]!">{t("title")}</StepTitle>

      <div className="grid items-start gap-7 border-t border-line pt-[30px] min-[851px]:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] min-[851px]:gap-[38px]">
        <div className="rounded-xl border border-[#e9dece] bg-[#faf5ee] p-5 text-sm leading-[1.85] text-[#586864] italic sm:p-6">
          <h3 className="mb-6 text-[25px] leading-[1.3] not-italic">{t("letterTitle")}</h3>
          {Array.from({ length: 10 }, (_, i) => (
            <p key={i} style={reveal(i).style} className={`mb-[15px] ${reveal(i).className}`}>
              {t(`letter.${i + 1}`)}
            </p>
          ))}
          <div className="mt-6 flex items-center justify-between gap-4">
            <p style={reveal(10).style} className={`text-terracotta ${reveal(10).className}`}>
              {t("signature")}
            </p>
            <WaxSeal {...reveal(12, "animate-stamp")} />
          </div>
        </div>

        <div className="min-w-0 text-teal">
          <h3 className="mb-6 border-b border-[#e9dece] pb-4 text-[25px] leading-[1.3] italic">{t("startTitle")}</h3>

          <fieldset className="mb-[23px] min-w-0">
            <legend className={legend}>{t("placeDate")}</legend>
            <div className="grid gap-[18px] sm:grid-cols-2">
              <div>
                <label htmlFor="welcome-place" className={label}>
                  {t("at")}
                </label>
                <input
                  id="welcome-place"
                  value={state.place}
                  onChange={(e) => update({ place: e.target.value })}
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="welcome-date" className={label}>
                  {t("on")}
                </label>
                <input
                  id="welcome-date"
                  type="date"
                  value={state.date}
                  onChange={(e) => update({ date: e.target.value })}
                  className={input}
                />
              </div>
            </div>
          </fieldset>

          <div className="mb-[23px]">
            <label htmlFor="welcome-child" className={label}>
              {t("forAttention")}
            </label>
            <div className="flex items-center gap-3 italic">
              <span aria-hidden>{t("for")}</span>
              <input id="welcome-child" value={account.child} onChange={setAccount("child")} className={input} />
            </div>
          </div>

          <div className="mb-[23px]">
            <label htmlFor="welcome-identity" className={label}>
              {ta("identity")}
            </label>
            <textarea
              id="welcome-identity"
              rows={3}
              value={account.identity}
              onChange={setAccount("identity")}
              className={`${input} min-h-[108px] resize-y leading-[1.7]`}
            />
          </div>

          <fieldset className="mb-[23px] min-w-0">
            <legend className={legend}>{t("guests")}</legend>
            <ul>
              {guests.map((guest) => (
                <li key={guest.id} className="mb-2.5 flex flex-wrap items-center gap-2 min-[601px]:flex-nowrap">
                  <label className="min-w-0 basis-full min-[601px]:flex-1 min-[601px]:basis-auto">
                    <span className="sr-only">{t("guestName")}</span>
                    <input
                      id={`welcome-guest-${guest.id}`}
                      value={guest.name}
                      onChange={(e) => setGuest(guest.id, { name: e.target.value })}
                      className={`${input} ${guest.crossed ? "bg-[#f5f2ed] text-[#666] line-through" : ""}`}
                    />
                  </label>
                  <button
                    type="button"
                    className={guestButton}
                    onClick={() => (guest.crossed ? setGuest(guest.id, { crossed: false }) : addGuest())}
                  >
                    {guest.crossed ? t("guestRestore") : t("guestAdd")}
                  </button>
                  {!guest.crossed && (
                    <button
                      type="button"
                      aria-label={t("guestRemove")}
                      className={`${guestButton} min-w-11! text-xl!`}
                      onClick={() => setGuest(guest.id, { crossed: true })}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <button type="button" className={ui.textLink} onClick={addGuest}>
              {t("addGuest")}
            </button>
          </fieldset>

          <div className="mb-[23px]">
            <label htmlFor="welcome-reasons" className={label}>
              {t("reasons")}
            </label>
            <textarea
              id="welcome-reasons"
              rows={4}
              value={state.reasons}
              onChange={(e) => update({ reasons: e.target.value })}
              className={`${input} min-h-[108px] resize-y leading-[1.7]`}
            />
          </div>

          {(["1", "2", "3"] as const).map((i) => (
            <p key={i} className="mb-[18px] text-[13px] leading-[1.8] text-[#65716c] italic">
              {t(`closing.${i}`)}
            </p>
          ))}
          <Link href="/creer/compte" className={`${ui.secondary} my-3 w-full`}>
            {t("backToAccount")}
          </Link>
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/creer/carnet" className={ui.primary}>
          {t("enter")}
        </Link>
      </div>
    </section>
  );
}

// The "CV" wax seal under the founders' letter. Decorative.
function WaxSeal({ className, ...props }: { className: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden viewBox="0 0 80 80" {...props} className={`size-[72px] shrink-0 ${className}`}>
      {/* Wax spills unevenly past the stamp's edge. */}
      <path
        d="M40 3c6 0 9 4 14 5s10-1 13 3 1 9 4 13 6 7 5 12-5 8-5 13 3 10-1 14-9 2-13 5-6 8-11 9-8-4-13-5-10 2-13-2-1-9-4-13-6-7-5-12 4-8 4-13-3-10 1-14 9-2 13-5S35 3 40 3Z"
        className="fill-terracotta"
      />
      <circle cx="40" cy="40" r="25" fill="none" className="stroke-oxblood/40" strokeWidth="1.5" />
      <text
        x="40"
        y="40"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-paper font-serif text-[22px] font-bold italic"
      >
        CV
      </text>
    </svg>
  );
}
