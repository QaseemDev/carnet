"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { CloseButton, Dialog, InfoDialog } from "@/components/brand/Dialog";
import { Field, useValidation } from "@/components/brand/Field";
import { Link } from "@/i18n/navigation";

// Visual only until Phase 1: nothing is checked, saved or sent.
export function LoginForm() {
  const t = useTranslations("Login");
  const tf = useTranslations("Forms");
  const info = useRef<HTMLDialogElement>(null);
  const help = useRef<HTMLDialogElement>(null);
  const [helpSent, setHelpSent] = useState(false);
  const login = useValidation(() => info.current?.showModal());
  const reset = useValidation(() => setHelpSent(true));

  return (
    <>
      <form {...login.formProps}>
        <Field
          id="login-email"
          type="email"
          label={t("email")}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          error={login.errors["login-email"]}
        />
        <Field
          id="login-password"
          type="password"
          label={t("password")}
          placeholder="••••••••"
          autoComplete="current-password"
          error={login.errors["login-password"]}
        />
        <button
          type="submit"
          className="mt-2.5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-terracotta p-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-terracotta-hover"
        >
          <Lock aria-hidden size={16} strokeWidth={1.5} />
          {t("submit")} <span aria-hidden>→</span>
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => {
            setHelpSent(false);
            help.current?.showModal();
          }}
          className="min-h-11 py-2 text-sm text-terracotta underline underline-offset-4"
        >
          {t("forgot")}
        </button>
        <p className="my-[18px] leading-[1.8]">{t("noCarnet")}</p>
        <Link
          href="/creer"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-white px-[22px] py-3.5 text-[13px] font-semibold text-teal hover:bg-paper"
        >
          {t("create")}
        </Link>
        <p className="mt-[18px] font-serif leading-[1.8] text-terracotta italic">{t("quote")}</p>
      </div>

      <InfoDialog ref={info} title={t("infoTitle")} text={t("infoText")} />

      <Dialog
        ref={help}
        title={t("forgot")}
        top={
          <CloseButton className="mb-5 inline-flex min-h-11 items-center py-2 text-sm text-terracotta">
            {tf("back")}
          </CloseButton>
        }
        className="w-[640px] max-w-full rounded-xl border border-line bg-card px-5 py-6 sm:p-[30px] [&>h2]:mb-[18px] [&>h2]:text-[30px] [&>h2]:leading-tight [&>h2]:font-bold"
      >
        <p className="mb-[18px] leading-[1.8]">{t("help.intro")}</p>
        <form {...reset.formProps}>
          <Field
            id="password-help-email"
            type="email"
            label={t("help.email")}
            autoComplete="email"
            error={reset.errors["password-help-email"]}
          />
          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-terracotta px-[22px] py-3.5 text-[13px] font-semibold text-white hover:bg-terracotta-hover sm:w-auto"
          >
            {t("help.submit")}
          </button>
        </form>
        <p
          role="status"
          className="mt-5 rounded-lg border border-line bg-paper px-[17px] py-[13px] text-[13px] leading-[1.6] empty:hidden"
        >
          {helpSent ? t("help.sent") : ""}
        </p>
      </Dialog>
    </>
  );
}
