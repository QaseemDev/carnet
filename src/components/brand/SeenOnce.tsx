"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Marks its box `data-seen="true"` the first time it scrolls into view and
// never again, so CSS can play a moment once. Scrolling back doesn't replay it.
export function SeenOnce({ className, children }: { className?: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      // A ratio threshold would never be met by a box wider than the screen
      // (Chemin on phones), so: any part of it above the bottom fifth.
      { rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(box.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} data-seen={seen} className={className}>
      {children}
    </div>
  );
}
