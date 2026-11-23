"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { NavLinks } from "./NavLinks";

// Native <dialog>: showModal() makes the page behind inert, Esc closes it and
// focus returns to the menu button.
export function MobileMenu() {
  const t = useTranslations("Nav");
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm border border-line px-2.5 text-[13px] font-semibold text-teal sm:px-3"
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="sr-only sm:not-sr-only">{t("menu")}</span>
      </button>
      <dialog
        ref={dialog}
        aria-label={t("label")}
        onClick={(event) => event.target === dialog.current && close()}
        className="m-0 ml-auto h-dvh max-h-none w-[min(22rem,100vw)] max-w-none bg-paper p-0 text-ink"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-serif text-lg font-bold text-teal">{t("menu")}</span>
          <button
            type="button"
            onClick={close}
            aria-label={t("closeMenu")}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-sm text-teal"
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav aria-label={t("label")} className="p-4">
          <NavLinks stacked onNavigate={close} />
        </nav>
      </dialog>
    </>
  );
}
