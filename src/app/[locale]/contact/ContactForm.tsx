"use client";

import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { InfoDialog } from "@/components/brand/Dialog";
import { Field, useValidation } from "@/components/brand/Field";

// Visual only until Phase 4: a valid form opens "Message envoyé" and sends nothing.
export function ContactForm() {
  const t = useTranslations("Contact");
  const sent = useRef<HTMLDialogElement>(null);
  const { errors, formProps } = useValidation(() => sent.current?.showModal());

  return (
    <>
      <form {...formProps}>
        <Field
          id="name"
          label={t("name")}
          placeholder={t("namePlaceholder")}
          autoComplete="name"
          error={errors.name}
          tone="cream"
        />
        <Field
          id="email"
          type="email"
          label={t("email")}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          error={errors.email}
          tone="cream"
        />
        <Field
          id="message"
          multiline
          label={t("message")}
          placeholder={t("messagePlaceholder")}
          error={errors.message}
          tone="cream"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-terracotta px-6 py-3 text-sm font-semibold text-white shadow-[0_2px_5px_rgb(184_74_57/0.2)] transition hover:-translate-y-px hover:bg-terracotta-hover"
        >
          <Send aria-hidden size={16} strokeWidth={1.5} />
          {t("submit")}
        </button>
      </form>
      <InfoDialog ref={sent} title={t("sentTitle")} text={t("sentText")} />
    </>
  );
}
