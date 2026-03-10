import { describe, it, expect, vi } from "vitest";
import { parseDocFile } from "../../packages/core/src/node/routes/parser";
import * as utils from "../../packages/core/src/node/utils";
import path from "path";

// Mock utils since we don't want to depend on their implementation here
vi.mock("../../packages/core/src/node/utils", async () => {
  const actual = await vi.importActual("../../packages/core/src/node/utils");
  return {
    ...(actual as any),
    parseFrontmatter: vi.fn(),
  };
});

describe("parseDocFile", () => {
  const docsDir = "C:\\docs";
  const basePath = "/docs";

  it("should parse a simple markdown file and return correct route meta", () => {
    const filePath = "C:\\docs\\getting-started.md";

    (utils.parseFrontmatter as any).mockReturnValue({
      data: { title: "Custom Title", sidebarPosition: 5 },
      content: "## Heading 1\nSome content\n### Heading 2\nMore content",
    });

    const result = parseDocFile(filePath, docsDir, basePath);

    expect(result.route.path).toBe("/docs/getting-started");
    expect(result.route.title).toBe("Custom Title");
    expect(result.route.sidebarPosition).toBe(5);
    expect(result.route.headings).toHaveLength(2);
    expect(result.route.headings![0]).toEqual({
      level: 2,
      text: "Heading 1",
      id: "heading-1",
    });
    expect(result.route.headings![1]).toEqual({
      level: 3,
      text: "Heading 2",
      id: "heading-2",
    });
  });

  it("should infer title from filename if not provided in frontmatter", () => {
    const filePath = "C:\\docs\\installation.md";

    (utils.parseFrontmatter as any).mockReturnValue({
      data: {},
      content: "",
    });

    const result = parseDocFile(filePath, docsDir, basePath);

    expect(result.route.title).toBe("installation");
  });

  it("should handle i18n locales", () => {
    const config: any = {
      i18n: { locales: { es: { label: "Spanish" } } },
    };
    (utils.parseFrontmatter as any).mockReturnValue({ data: {}, content: "" });
    const result = parseDocFile(
      "C:\\docs\\es\\guide.md",
      "C:\\docs",
      "/docs",
      config,
    );
    expect(result.route.locale).toBe("es");
    expect(result.route.path).toBe("/docs/es/guide");
  });

  it("should handle versioning", () => {
    const config: any = {
      versions: { versions: { v1: { label: "v1" } } },
    };
    (utils.parseFrontmatter as any).mockReturnValue({ data: {}, content: "" });
    const result = parseDocFile(
      "C:\\docs\\v1\\install.md",
      "C:\\docs",
      "/docs",
      config,
    );
    expect(result.route.version).toBe("v1");
    expect(result.route.path).toBe("/docs/v1/install");
  });

  it("should handle both version and locale", () => {
    const config: any = {
      versions: { versions: { v1: { label: "v1" } } },
      i18n: { locales: { es: { label: "Spanish" } } },
    };
    (utils.parseFrontmatter as any).mockReturnValue({ data: {}, content: "" });
    const result = parseDocFile(
      "C:\\docs\\v1\\es\\guide.md",
      "C:\\docs",
      "/docs",
      config,
    );
    expect(result.route.version).toBe("v1");
    expect(result.route.locale).toBe("es");
    expect(result.route.path).toBe("/docs/v1/es/guide");
  });

  it("should handle complex headings and markdown links", () => {
    (utils.parseFrontmatter as any).mockReturnValue({
      data: {},
      content: "## Heading with [Link](url)\n### Another `code` heading",
    });
    const result = parseDocFile("C:\\docs\\test.md", "C:\\docs", "/docs");
    expect(result.route.headings![0].text).toBe("Heading with Link");
    expect(result.route.headings![1].text).toBe("Another code heading");
  });

  it("should respect custom permalinks from frontmatter", () => {
    (utils.parseFrontmatter as any).mockReturnValue({
      data: { permalink: "/custom/my-special-url" },
      content: "# Content",
    });

    const result = parseDocFile("C:\\docs\\test.md", "C:\\docs", "/docs");

    expect(result.route.path).toBe("/docs/custom/my-special-url");
  });
});
