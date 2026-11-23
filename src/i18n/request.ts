import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async () => {
  const param = await rootParams.locale();
  // Paths the proxy skips (anything with a dot, e.g. /robots.md) land here with
  // the first segment as the "locale": those are 404s, not French pages.
  if (!hasLocale(routing.locales, param)) notFound();
  const locale = param;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
