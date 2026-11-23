"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

// Mobile: cards snap one at a time with dot indicators. Desktop (sm+): plain
// horizontal scroll, unchanged — the dots are mobile-only and track the
// nearest snapped card via IntersectionObserver.
export function CardCarousel({ children, count }: { children: ReactNode; count: number }) {
  const t = useTranslations("Home");
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // The scroll container is the parent (`overflow-x-auto` in page.tsx), not
    // the <ul> itself — IntersectionObserver's `root` must be the element
    // that actually scrolls.
    const cards = Array.from(list.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const mostVisible = visible.reduce((a, b) => (b.intersectionRatio > a.intersectionRatio ? b : a));
        setActive(cards.indexOf(mostVisible.target as HTMLElement));
      },
      { root: list.parentElement, threshold: 0.6 },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    const card = listRef.current?.children[index] as HTMLElement | undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", inline: "center", block: "nearest" });
  };

  return (
    <>
      <ul ref={listRef} className="flex w-max gap-[25px] text-left">
        {children}
      </ul>
      {/* `sticky left-0` pins the dots to the viewport edge as the row
          scrolls, so they don't scroll away with it. (A version that moved
          the scroll container into this component instead broke the
          cross-page view-transition morph on the home cards — keep the
          scroll container in page.tsx.) */}
      <div
        className="sticky left-0 mt-5 flex justify-center gap-1 sm:hidden"
        role="group"
        aria-label={t("exploreTitle")}
      >
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-current={index === active}
            aria-label={t("cardIndicator", { index: index + 1, count })}
            onClick={() => goTo(index)}
            className="flex min-h-11 min-w-11 items-center justify-center"
          >
            <span
              aria-hidden
              className={`h-2.5 w-2.5 rounded-full transition-colors ${index === active ? "bg-terracotta" : "bg-line"}`}
            />
          </button>
        ))}
      </div>
    </>
  );
}
