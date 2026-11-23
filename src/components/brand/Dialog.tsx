"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, type ReactNode, type Ref } from "react";

type Props = {
  ref: Ref<HTMLDialogElement>;
  title: string;
  // Shown above the title: an icon, or a close button.
  top?: ReactNode;
  className?: string;
  // Placement of the dialog itself (default: centred).
  dialogClassName?: string;
  children: ReactNode;
};

// Native <dialog>, opened by the caller with `ref.current.showModal()`: the page
// behind goes inert, Esc closes it and focus returns to the button that opened
// it. A click on the backdrop closes it too, only when the press also started
// there: a text selection released over the backdrop must not close it.
export function Dialog({ ref, title, top, className, dialogClassName = "m-auto max-w-[calc(100%-2rem)]", children }: Props) {
  const titleId = useId();
  const pressedBackdrop = useRef(false);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onPointerDown={(event) => (pressedBackdrop.current = event.target === event.currentTarget)}
      onClick={(event) => {
        if (pressedBackdrop.current && event.target === event.currentTarget) event.currentTarget.close();
        pressedBackdrop.current = false;
      }}
      className={`${dialogClassName} bg-transparent p-0 text-ink`}
    >
      <div className={className}>
        {top}
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

// Closes the surrounding dialog without JavaScript (`<form method="dialog">`).
export function CloseButton({ className, children }: { className: string; children: ReactNode }) {
  return (
    <form method="dialog">
      <button className={className}>{children}</button>
    </form>
  );
}

// The prototype's general info popup: heart, title, one line, "Compris".
export function InfoDialog({ ref, title, text }: { ref: Ref<HTMLDialogElement>; title: string; text: string }) {
  const t = useTranslations("Forms");
  return (
    <Dialog
      ref={ref}
      title={title}
      top={
        <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-paper text-terracotta shadow-inner">
          <Heart aria-hidden size={24} strokeWidth={1.5} />
        </span>
      }
      className="w-md max-w-full rounded-3xl border border-line bg-white p-6 text-center shadow-2xl md:p-8 [&>h2]:mb-2 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-ink"
    >
      <p className="mb-6 text-sm leading-relaxed text-ink-2">{text}</p>
      <CloseButton className="min-h-11 w-full rounded-xl bg-teal py-3 font-medium text-white shadow-md hover:bg-teal-deep">
        {t("ok")}
      </CloseButton>
    </Dialog>
  );
}
