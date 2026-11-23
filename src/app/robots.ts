import type { MetadataRoute } from "next";
import { siteUrl } from "@/i18n/site-url";

// Same switch as the X-Robots-Tag header in next.config.ts: staging, previews
// and local builds block everything; set ALLOW_INDEXING=true at launch. Sign-up
// and login stay crawlable on purpose: their noindex tag keeps them out.
export default function robots(): MetadataRoute.Robots {
  if (process.env.ALLOW_INDEXING !== "true") return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml` };
}
