// The four offers. Prices are the prototype's, pending the client's
// confirmation: the CGV draft says 89 / 69 / 69 / 180 €. Copy lives in
// `Creation.offers.<slug>`.
export const offers = [
  { slug: "fondement", price: 149, intro: 1, extra: 0 },
  { slug: "construction", price: 119, intro: 1, extra: 0 },
  { slug: "transmission", price: 119, intro: 0, extra: 6 },
  { slug: "complet", price: 299, was: 387, intro: 6, extra: 0, features: false },
] as const;

export type Offer = (typeof offers)[number];
export type OfferSlug = Offer["slug"];

export const findOffer = (slug: string | undefined) => offers.find((o) => o.slug === slug);

// Number of `Creation.offers.features` items.
export const featureCount = 6;
