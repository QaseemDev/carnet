import cgu from "@/content/legal/fr/cgu.json";
import cgv from "@/content/legal/fr/cgv.json";
import charte from "@/content/legal/fr/charte.json";
import confidentialite from "@/content/legal/fr/confidentialite.json";
import type { LegalDocument } from "./legal-documents";

// The client's legal drafts, extracted from the prototype as heading/paragraph
// blocks. French only: no translation exists yet, hence `lang="fr"`. Unreviewed
// drafts (placeholders, citation residue) pending the lawyer, so not edited here.
const documents: Record<LegalDocument, unknown> = { cgu, cgv, charte, confidentialite };

type Block = { h: string } | { p: string };

// `heading`: h3 inside the /creer popup (titled h2), h2 on the page (titled h1).
export function LegalText({ doc, heading: Heading = "h3" }: { doc: LegalDocument; heading?: "h2" | "h3" }) {
  return (
    <div lang="fr" className="text-sm leading-[1.8]">
      {(documents[doc] as Block[]).map((block, i) =>
        "h" in block ? (
          <Heading key={i} className="mt-6 mb-3 text-lg leading-snug font-bold">
            {block.h}
          </Heading>
        ) : (
          <p key={i} className="mb-3 whitespace-pre-line">
            {block.p}
          </p>
        ),
      )}
    </div>
  );
}
