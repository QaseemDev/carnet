"use client";

import type { ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { useCreation } from "../creation";
import type { OfferSlug } from "../offers";
import * as ui from "../ui";

// Choosing another offer undoes the demo payment, as in the prototype.
export function ChooseOffer({ slug, children }: { slug: OfferSlug; children: ReactNode }) {
  const { update } = useCreation();
  const router = useRouter();
  return (
    <button
      type="button"
      className={ui.primary}
      onClick={() => {
        update((s) => ({ offer: slug, paid: s.offer === slug && s.paid }));
        router.push("/creer/compte");
      }}
    >
      {children}
    </button>
  );
}
