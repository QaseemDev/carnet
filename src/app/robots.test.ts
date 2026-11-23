import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "./robots";

describe("robots.txt", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("blocks everything unless indexing is allowed", () => {
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });

  // Disallowing /creer or /connexion would hide their noindex tag from crawlers.
  it("at launch: allows every page and points to the sitemap", () => {
    vi.stubEnv("ALLOW_INDEXING", "true");
    expect(robots()).toEqual({ rules: { userAgent: "*", allow: "/" }, sitemap: "http://localhost:3000/sitemap.xml" });
  });
});
