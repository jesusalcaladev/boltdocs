import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { generateStaticPages } from "../../packages/core/src/node/ssg/index";
import * as routes from "../../packages/core/src/node/routes";
import fs from "fs";
import path from "path";
import os from "os";

// We use vi.hoisted to mock the 'module' package BEFORE the ssg/index.ts is loaded
const { mockRender } = vi.hoisted(() => ({
  mockRender: vi.fn().mockResolvedValue("<!--ssr-output-->"),
}));

vi.mock("module", () => ({
  createRequire: () => () => ({
    render: mockRender,
  }),
}));

// Mock the routes and sitemap generation
vi.mock("../../packages/core/src/node/routes", () => ({
  generateRoutes: vi.fn(),
}));

vi.mock("../../packages/core/src/node/ssg/sitemap", () => ({
  generateSitemap: vi.fn().mockReturnValue("<xml>sitemap</xml>"),
}));

vi.mock("../../packages/core/src/node/cache", () => ({
  flushCache: vi.fn().mockResolvedValue(undefined),
}));

// We'll use real temp directories for outDir and docsDir
const tempOutDir = fs.mkdtempSync(path.join(os.tmpdir(), "litedocs-ssg-out-"));
const tempDocsDir = fs.mkdtempSync(
  path.join(os.tmpdir(), "litedocs-ssg-docs-"),
);

describe("generateStaticPages", () => {
  const originalExistsSync = fs.existsSync;

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup template
    fs.writeFileSync(
      path.join(tempOutDir, "index.html"),
      '<html><head><title></title><meta name="description" content=""></head><body><div id="root"></div></body></html>',
    );

    // Ensure ssrModulePath check passes
    vi.spyOn(fs, "existsSync").mockImplementation((p) => {
      if (typeof p === "string" && p.includes("ssr.js")) return true;
      return originalExistsSync(p);
    });
  });

  afterAll(() => {
    vi.restoreAllMocks();
    fs.rmSync(tempOutDir, { recursive: true, force: true });
    fs.rmSync(tempDocsDir, { recursive: true, force: true });
  });

  it("should generate HTML files for each route", async () => {
    const mockRoutes = [
      {
        path: "/intro",
        title: "Intro",
        description: "Intro Description",
        componentPath: "intro.mdx",
      },
    ];
    vi.mocked(routes.generateRoutes).mockResolvedValue(mockRoutes as any);

    await generateStaticPages({
      docsDir: tempDocsDir,
      outDir: tempOutDir,
      config: { siteUrl: "https://example.com" } as any,
    });

    // Check if directory and file were created
    const introDir = path.join(tempOutDir, "intro");
    const introFile = path.join(introDir, "index.html");

    expect(fs.existsSync(introDir)).toBe(true);
    expect(fs.existsSync(introFile)).toBe(true);

    const content = fs.readFileSync(introFile, "utf-8");
    expect(content).toContain("Intro | Boltdocs");
    expect(content).toContain('<div id="root"><!--ssr-output--></div>');
    expect(content).toContain("Intro Description");
  });

  it("should generate a sitemap.xml in the outDir", async () => {
    vi.mocked(routes.generateRoutes).mockResolvedValue([]);

    await generateStaticPages({
      docsDir: tempDocsDir,
      outDir: tempOutDir,
      config: {} as any,
    });

    const sitemapFile = path.join(tempOutDir, "sitemap.xml");
    expect(fs.existsSync(sitemapFile)).toBe(true);
    expect(fs.readFileSync(sitemapFile, "utf-8")).toBe("<xml>sitemap</xml>");
  });

  it("should handle SSR rendering errors gracefully", async () => {
    const mockRoutes = [
      { path: "/error", title: "Error", componentPath: "err.mdx" },
    ];
    vi.mocked(routes.generateRoutes).mockResolvedValue(mockRoutes as any);
    mockRender.mockRejectedValueOnce(new Error("SSR Crash"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await generateStaticPages({
      docsDir: tempDocsDir,
      outDir: tempOutDir,
      config: {} as any,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[boltdocs] Error SSR rendering route /error"),
      expect.any(Error),
    );

    // Should NOT have created the error page index.html
    expect(fs.existsSync(path.join(tempOutDir, "error", "index.html"))).toBe(
      false,
    );
  });
});
