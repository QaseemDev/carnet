import { createElement, type ComponentProps } from "react";
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

const navigation = createNavigation(routing);

export const { usePathname, useRouter, redirect, getPathname } = navigation;

// Prefetch is off by default. With `localePrefix: "as-needed"` the client
// router guesses that `/origine` is the `[locale]` route (locale = "origine")
// because it can't see the proxy's rewrite to `/fr/origine`, so segment
// prefetches 404 and log console errors. Pages are small and static, so a
// click-time fetch is fine. Revisit when Next/next-intl handle rewritten
// prefetches (re-run e2e/shell.spec.ts with prefetch on to check).
export function Link(props: ComponentProps<typeof navigation.Link>) {
  return createElement(navigation.Link, { prefetch: false, ...props });
}
