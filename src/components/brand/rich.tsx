import type { ReactNode } from "react";

// Tags allowed inside rich messages (`t.rich(key, rich)`).
export const rich = {
  em: (chunks: ReactNode) => <em>{chunks}</em>,
  b: (chunks: ReactNode) => <strong className="font-bold text-ink">{chunks}</strong>,
  br: () => <br />,
};
