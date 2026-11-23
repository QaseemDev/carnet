import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { defaultStage, isStage, stagePath } from "./app/[locale]/exemple/demo";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

// `/exemple/<stage>` or `/en/exemple/<stage>`.
const stagePage = /^\/(?:(en)\/)?exemple\/([^/]+)\/?$/;

export default function proxy(request: NextRequest) {
  const [, en, stage] = stagePage.exec(request.nextUrl.pathname) ?? [];
  // 4–5 lives at `/exemple` itself.
  if (stage === defaultStage) {
    return NextResponse.redirect(new URL(`${en ? "/en" : ""}${stagePath(defaultStage)}`, request.url));
  }
  // The stage page streams, so its own notFound() can only answer 200. Send an
  // unknown stage to an unmatched path instead: the global 404, with a 404 status.
  if (stage !== undefined && !isStage(stage)) {
    const locale = en ?? routing.defaultLocale;
    const headers = new Headers(request.headers);
    headers.set("x-next-intl-locale", locale);
    return NextResponse.rewrite(new URL(`/${locale}/exemple/${stage}/404`, request.url), { request: { headers } });
  }
  return intl(request);
}

export const config = {
  // Everything except API routes, Next internals and static files. Other dotted
  // paths (e.g. /page.md) still go through, so they get the styled 404.
  matcher:
    "/((?!api|_next|_vercel|.*\\.(?:ico|png|jpe?g|webp|avif|gif|svg|txt|xml|webmanifest|woff2?|pdf|mp3|mp4)$).*)",
};
