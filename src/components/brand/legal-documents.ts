// The four legal documents, in the order the site lists them. Slugs match their
// future pages (/cgu, /cgv, /charte, /confidentialite) and the content files.
export const legalDocuments = ["cgu", "cgv", "charte", "confidentialite"] as const;
export type LegalDocument = (typeof legalDocuments)[number];

// Flip once the lawyer has signed off: hides the "draft" banner on the legal pages.
export const legalReviewed = false;
