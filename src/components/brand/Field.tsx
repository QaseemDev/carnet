"use client";

import { useTranslations } from "next-intl";
import { useState, type ChangeEvent, type FormEvent } from "react";

type FieldError = "required" | "email" | "tooShort" | "mismatch";

type Props = {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  // Small grey line under the field (prototype `.auth-form-group small`).
  hint?: string;
  error?: FieldError;
  // Controlled use (/creer keeps answers across steps); uncontrolled otherwise.
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  // Prototype contact form: cream fields; login: white; /creer: white, softer corners.
  tone?: "white" | "cream" | "creer";
};

// Label, input and its error line (prototype `.auth-form-group`, `.contact-form-group`).
// Inputs have no `name`: a submit before hydration carries none of what was typed.
export function Field({
  id,
  label,
  type = "text",
  multiline,
  rows = 5,
  placeholder,
  autoComplete,
  required = true,
  minLength,
  hint,
  error,
  value,
  onChange,
  tone = "white",
}: Props) {
  const t = useTranslations("Forms");
  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  const control = {
    id,
    placeholder,
    autoComplete,
    required,
    minLength,
    value,
    onChange,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": described || undefined,
    className: `w-full border px-[15px] transition-colors focus:border-terracotta ${
      error ? "border-terracotta" : tone === "creer" ? "border-[#d9d4c9]" : "border-line"
    } ${
      tone === "creer"
        ? "rounded-[9px] bg-white py-[13px] text-teal"
        : `rounded-md py-3 text-ink ${tone === "cream" ? "bg-paper" : "bg-white"}`
    }`,
  };

  return (
    <div className="mb-5">
      <label htmlFor={id} className="mb-2 block text-[13px] font-semibold text-teal">
        {label}
      </label>
      {multiline ? <textarea rows={rows} {...control} /> : <input type={type} {...control} />}
      {hint && (
        <small id={`${id}-hint`} className="mt-1.5 block text-xs leading-[1.7] text-[#666]">
          {hint}
        </small>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-terracotta">
          {t(error)}
        </p>
      )}
    </div>
  );
}

// Validates with the browser's own rules (`required`, `type="email"`, `minLength`)
// but shows our messages, in the page's language, under each field. Focus goes to
// the first invalid field; an error clears as soon as its field is edited.
// `onValid` may return further errors (e.g. passwords that differ) to show the same way.
export function useValidation(onValid: () => Record<string, FieldError> | void) {
  const [errors, setErrors] = useState<Record<string, FieldError>>({});

  const formProps = {
    noValidate: true,
    onSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      let found: Record<string, FieldError> = {};
      for (const el of event.currentTarget.elements) {
        if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) continue;
        // `validity.tooShort` only counts keystrokes, so length is checked here.
        if (el.validity.valueMissing) found[el.id] = "required";
        else if (el.validity.typeMismatch) found[el.id] = "email";
        else if (el.value && el.value.length < el.minLength) found[el.id] = "tooShort";
      }
      if (!Object.keys(found).length) found = onValid() ?? {};
      setErrors(found);
      const first = Object.keys(found)[0];
      if (first) document.getElementById(first)?.focus();
    },
    onInput(event: FormEvent<HTMLFormElement>) {
      const id = (event.target as HTMLElement).id;
      setErrors((errors) => {
        const rest = { ...errors };
        delete rest[id];
        // A mismatch involves two fields: editing either one clears it.
        for (const key in rest) if (rest[key] === "mismatch") delete rest[key];
        return rest;
      });
    },
  };

  return { errors, formProps };
}
