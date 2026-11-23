"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Gate, StepTitle, useCreation } from "../creation";
import { findOffer } from "../offers";
import * as ui from "../ui";

// Fixed demo card, shown disabled: nothing here can be typed or sent.
const demoCard = [
  ["demo-card-number", "cardNumber", "4242 4242 4242 4242"],
  ["demo-card-expiry", "expiry", "12/30"],
  ["demo-card-cvc", "cvc", "123"],
  ["demo-card-name", "cardName", "AUTEUR DEMO"],
] as const;

const field = "w-full rounded-[9px] border border-[#d9d4c9] bg-white px-[15px] py-[13px] text-[#777]";

// Step 5: demo payment. "Payer" only moves on: no request, no charge (no real payments yet).
export function Payment() {
  const t = useTranslations("Creation");
  const tp = useTranslations("Creation.payment");
  const { state, update } = useCreation();
  const router = useRouter();
  const offer = findOffer(state.offer);

  return (
    <Gate need="consents">
      {offer && (
        <section className="mx-auto max-w-[940px]">
          <Link href="/creer/documents" className={ui.back}>
            <span aria-hidden>←</span> {t("back")}
          </Link>
          <div className={ui.panel}>
            <StepTitle>{tp("title")}</StepTitle>
            {/* Prototype final `.creation-summary`: a sage card with a teal edge. */}
            <div className="mb-[26px] rounded-[10px] border border-l-[3px] border-[#d6dfd7] border-l-teal bg-[#f2f6f1] p-5 min-[601px]:px-7 min-[601px]:py-6">
              <p className="eyebrow text-[11px]! font-bold! tracking-[1.2px]!">{t(`offers.${offer.slug}.age`)}</p>
              <h3 className="my-2 text-[27px] leading-snug">{t(`offers.${offer.slug}.title`)}</h3>
              <p className={`${ui.price} mt-2.5`}>
                {t("offers.price", { price: offer.price })}{" "}
                <span className="mt-[7px] block font-sans text-xs text-[#62736c]">{tp("oneOff")}</span>
              </p>
            </div>

            <p className={ui.notice}>{tp("notice")}</p>

            <fieldset disabled className="mt-[15px] mb-5 min-w-0">
              <legend className="mb-[15px] font-semibold">{tp("legend")}</legend>
              <div className="grid sm:grid-cols-2 sm:gap-x-[18px]">
                {demoCard.map(([id, key, value]) => (
                  <div key={id} className={`mb-5 ${key === "cardNumber" || key === "cardName" ? "sm:col-span-2" : ""}`}>
                    <label htmlFor={id} className="mb-2 block text-[13px] font-semibold">
                      {tp(key)}
                    </label>
                    <input id={id} defaultValue={value} autoComplete="off" className={field} />
                  </div>
                ))}
              </div>
              <label htmlFor="demo-card-country" className="mb-2 block text-[13px] font-semibold">
                {tp("country")}
              </label>
              <select id="demo-card-country" className={field}>
                <option>{tp("france")}</option>
              </select>
            </fieldset>

            <details className="border-y border-line py-[18px]">
              <summary className="min-h-11 cursor-pointer content-center font-semibold">
                {tp("instalments.summary")}
              </summary>
              {(["1", "2", "3", "4"] as const).map((i) => (
                <p key={i} className="mt-4 text-sm leading-[1.8]">
                  {tp(`instalments.text.${i}`)}
                </p>
              ))}
              <p className={`${ui.notice} mt-4`}>{tp("instalments.notice")}</p>
            </details>

            <button
              type="button"
              className={ui.primary}
              onClick={() => {
                update({ paid: true });
                router.push("/creer/bienvenue");
              }}
            >
              {tp("pay", { price: offer.price })}
            </button>
            <p className={`${ui.small} mt-[18px]`}>{tp("note")}</p>
          </div>
        </section>
      )}
    </Gate>
  );
}
