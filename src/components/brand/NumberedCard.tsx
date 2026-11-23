import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  step: string;
  title: string;
  paragraphs: ReactNode[];
  quote: string;
};

// Icon + numbered eyebrow + heading + text + closing line (prototype `.origin-card`, `.feature-card`).
export function NumberedCard({ icon: Icon, step, title, paragraphs, quote }: Props) {
  return (
    <article className="flex flex-col gap-5 rounded-lg border border-line bg-card px-6 py-8 sm:flex-row sm:gap-6 sm:px-[30px] sm:py-[35px]">
      <span className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-terracotta text-white">
        <Icon aria-hidden size={24} strokeWidth={1.5} />
      </span>
      <div className="flex min-w-0 flex-col">
        <p className="eyebrow mb-2">{step}</p>
        <h2 className="mb-[15px] text-[21px] font-semibold">{title}</h2>
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-3 text-[13.5px] text-ink-2">
            {p}
          </p>
        ))}
        <p className="mt-1 text-[13.5px] font-medium text-teal italic">{quote}</p>
      </div>
    </article>
  );
}
