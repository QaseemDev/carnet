// Absolute base for canonical, hreflang, share-image and sitemap URLs. Vercel
// sets this at build; adding the client's domain there switches it with no
// code change.
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
