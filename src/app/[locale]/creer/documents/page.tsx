import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalText } from "@/components/brand/LegalText";
import { legalDocuments as docs } from "@/components/brand/legal-documents";
import { Documents } from "./Documents";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Creation.steps"))("documents") };
}

// The four drafts are rendered here, on the server, and handed to the client
// step ready-made: their text never ships in a client bundle.
export default function Page() {
  return <Documents texts={Object.fromEntries(docs.map((d) => [d, <LegalText key={d} doc={d} />]))} />;
}
