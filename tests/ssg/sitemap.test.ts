import { describe, it, expect } from "vitest";
import { generateSitemap } from "../../packages/core/src/node/ssg/sitemap";

describe("generateSitemap", () => {
  it("should generate a valid XML sitemap with default base URL", () => {
    const paths = ["/docs/intro", "/docs/setup"];
    const sitemap = generateSitemap(paths);

    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(sitemap).toContain("<loc>https://example.com/docs/intro</loc>");
    expect(sitemap).toContain("<loc>https://example.com/docs/setup</loc>");
    expect(sitemap).toContain("<loc>https://example.com/</loc>");
  });

  it("should use the provided siteUrl from config", () => {
    const paths = ["/docs/page"];
    const config: any = { siteUrl: "https://docs.litedocs.com/" };
    const sitemap = generateSitemap(paths, config);

    expect(sitemap).toContain("<loc>https://docs.litedocs.com/docs/page</loc>");
    expect(sitemap).not.toContain("https://example.com");
  });

  it("should handle i18n locales in root entries", () => {
    const paths = ["/docs/en/intro", "/docs/es/intro"];
    const config: any = {
      i18n: {
        defaultLocale: "en",
        locales: {
          en: { label: "English" },
          es: { label: "Spanish" },
        },
      },
    };
    const sitemap = generateSitemap(paths, config);

    expect(sitemap).toContain("<loc>https://example.com/</loc>");
    expect(sitemap).toContain("<loc>https://example.com/es/</loc>");
    expect(sitemap).toContain("<loc>https://example.com/docs/en/intro</loc>");
    expect(sitemap).toContain("<loc>https://example.com/docs/es/intro</loc>");
  });

  it("should assign different priorities to root and subpages", () => {
    const paths = ["/docs/subpage"];
    const sitemap = generateSitemap(paths);

    const rootPriority = "<priority>1.0</priority>";
    const subpagePriority = "<priority>0.8</priority>";

    expect(sitemap).toContain(rootPriority);
    expect(sitemap).toContain(subpagePriority);
  });
});
