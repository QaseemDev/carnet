import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import en from "@/i18n/messages/en.json";
import fr from "@/i18n/messages/fr.json";
import "./globals.css";

// Unmatched URLs skip the [locale] layout, so this page carries its own
// <html>, fonts and copy. The locale comes from the header next-intl's proxy sets.
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-playfair" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = { title: "404 · Carnet de Vie" };

// Blocking render on purpose: the 404 status must be set before anything streams.
export const instant = false;

export default async function GlobalNotFound() {
  const header = (await headers()).get("x-next-intl-locale");
  const locale = hasLocale(routing.locales, header) ? header : routing.defaultLocale;
  const m = locale === "en" ? en : fr;
  const home = locale === routing.defaultLocale ? "/" : `/${locale}`;

  return (
    <html lang={locale} className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <header className="border-b border-line px-4 py-3 sm:px-7">
          <a href={home} className="inline-flex min-h-11 flex-col justify-center">
            <span className="block font-serif text-[22px] leading-[1.1] font-bold text-teal">{m.Brand.title}</span>
            <span className="block text-[10.5px] text-ink-2">{m.Brand.subtitle}</span>
          </a>
        </header>
        <main className="mx-auto max-w-2xl flex-1 px-4 py-24 text-center">
          <p className="font-serif text-6xl text-terracotta italic">404</p>
          <h1 className="mt-4 text-3xl">{m.NotFound.title}</h1>
          <p className="mt-3 text-ink-2">{m.NotFound.text}</p>
          <a
            href={home}
            className="mt-8 inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-terracotta px-5 font-semibold text-terracotta transition-colors hover:bg-terracotta hover:text-white"
          >
            {m.NotFound.home}
          </a>
        </main>
      </body>
    </html>
  );
}
