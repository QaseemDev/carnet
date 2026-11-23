"use client";

import { Baby, Gift, WandSparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ChangeEvent } from "react";
import { Field, useValidation } from "@/components/brand/Field";
import { Link, useRouter } from "@/i18n/navigation";
import { Gate, StepTitle, useCreation, type Account } from "../creation";
import * as ui from "../ui";

const box =
  "flex min-h-11 cursor-pointer flex-col items-center gap-2 rounded-xl border border-[#e2d6c7] bg-[#faf7f1] px-4 py-[22px] text-center text-sm font-semibold has-checked:border-terracotta has-checked:bg-[#fbefe7] has-checked:shadow-[inset_0_0_0_1px_rgb(184_74_57/0.12)] has-focus-visible:outline-2 has-focus-visible:outline-terracotta";

// Step 3: the personal-space form. Visual only: nothing is checked against a
// server or saved (no real accounts yet).
export function AccountForm() {
  const t = useTranslations("Creation");
  const ta = useTranslations("Creation.account");
  const tl = useTranslations("Login");
  const { state, update } = useCreation();
  const router = useRouter();
  const { account } = state;

  // Any change un-validates the step, as in the prototype.
  const set =
    <K extends keyof Account>(key: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update((s) => ({ account: { ...s.account, [key]: event.target.value }, validated: false, paid: false }));

  // Nothing reads the passwords after this step, so they are not kept.
  const pass = () => {
    update((s) => ({ validated: true, account: { ...s.account, password: "", confirm: "" } }));
    router.push("/creer/documents");
  };

  const { errors, formProps } = useValidation(() => {
    if (account.password !== account.confirm) return { "create-password-confirm": "mismatch" };
    pass();
  });

  return (
    <Gate need="offer">
      <section>
        <Link href={`/creer/formule/${state.offer}`} className={ui.back}>
          <span aria-hidden>←</span> {t("back")}
        </Link>
        <div className={`${ui.panel} mx-auto max-w-[760px]`}>
          <StepTitle>{ta("title")}</StepTitle>
          <p className={ui.lead}>{ta("lead")}</p>

          <form {...formProps}>
            <fieldset className="my-7 grid min-w-0 grid-cols-2 gap-3">
              <legend className="sr-only">{ta("forWhom")}</legend>
              {(
                [
                  ["child", ta("forChild"), Baby],
                  ["gift", ta("gift"), Gift],
                ] as const
              ).map(([value, label, Icon]) => (
                <label key={value} className={box}>
                  <input
                    type="radio"
                    name="creation-for"
                    className="sr-only"
                    checked={account.forWhom === value}
                    onChange={() => update((s) => ({ account: { ...s.account, forWhom: value } }))}
                  />
                  <Icon aria-hidden size={22} strokeWidth={1.5} className="text-terracotta" />
                  {label}
                </label>
              ))}
            </fieldset>

            <div className="grid sm:grid-cols-2 sm:gap-[18px]">
              <Field
                tone="creer"
                id="create-firstname"
                label={ta("firstName")}
                autoComplete="given-name"
                value={account.firstName}
                onChange={set("firstName")}
                error={errors["create-firstname"]}
              />
              <Field
                tone="creer"
                id="create-lastname"
                label={ta("lastName")}
                autoComplete="family-name"
                value={account.lastName}
                onChange={set("lastName")}
                error={errors["create-lastname"]}
              />
            </div>
            <Field
              tone="creer"
              id="create-child"
              label={ta("child")}
              placeholder={ta("childPlaceholder")}
              hint={ta("childHint")}
              required={false}
              value={account.child}
              onChange={set("child")}
            />
            <Field
              tone="creer"
              id="create-email"
              type="email"
              label={tl("email")}
              placeholder={tl("emailPlaceholder")}
              autoComplete="email"
              value={account.email}
              onChange={set("email")}
              error={errors["create-email"]}
            />
            <Field
              tone="creer"
              id="create-password"
              type="password"
              label={ta("password")}
              placeholder={ta("passwordPlaceholder")}
              autoComplete="new-password"
              minLength={8}
              value={account.password}
              onChange={set("password")}
              error={errors["create-password"]}
            />
            <Field
              tone="creer"
              id="create-password-confirm"
              type="password"
              label={ta("confirm")}
              autoComplete="new-password"
              minLength={8}
              value={account.confirm}
              onChange={set("confirm")}
              error={errors["create-password-confirm"]}
            />
            <Field
              tone="creer"
              id="create-identity"
              label={ta("identity")}
              multiline
              rows={3}
              required={false}
              value={account.identity}
              onChange={set("identity")}
            />

            <fieldset className="mt-[15px] mb-5 min-w-0">
              <legend className="mb-[15px] font-semibold">{ta("access")}</legend>
              {(["single", "dual"] as const).map((value) => (
                <label
                  key={value}
                  className="mb-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] border border-[#e3d9cb] bg-[#faf8f3] px-[18px] py-[17px] text-[13px] has-checked:border-[#8fa49b] has-checked:bg-[#f0f5ef]"
                >
                  <input
                    type="radio"
                    name="creation-access"
                    checked={account.access === value}
                    onChange={() =>
                      update((s) => ({ account: { ...s.account, access: value }, validated: false, paid: false }))
                    }
                    className="shrink-0 accent-terracotta"
                  />
                  <span>{ta(value)}</span>
                </label>
              ))}
            </fieldset>
            <p className={`${ui.small} mb-[18px]`}>{ta("contributions")}</p>

            <button type="submit" className={`${ui.primary} w-full flex-col gap-0! text-[15px]!`}>
              <span className="inline-flex items-center gap-2">
                <WandSparkles aria-hidden size={16} strokeWidth={1.5} />
                {ta("submit")}
              </span>
              <small className="mt-1 block text-xs">{ta("submitNote")}</small>
            </button>
          </form>

          <button type="button" className={`${ui.secondary} mt-3.5 w-full`} onClick={pass}>
            {ta("explore")}
          </button>
          {state.welcomeVisited && (
            <Link href="/creer/bienvenue" className={`${ui.textLink} mt-3 block text-center`}>
              {ta("returnWelcome")}
            </Link>
          )}
        </div>
      </section>
    </Gate>
  );
}
