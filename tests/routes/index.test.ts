import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { generateRoutes } from "../../packages/core/src/node/routes/index";
import * as parser from "../../packages/core/src/node/routes/parser";
import { docCache } from "../../packages/core/src/node/routes/cache";
import fs from "fs";
import path from "path";
import os from "os";

// We'll use a real temp directory to avoid fast-glob mocking issues
const tempDocsDir = fs.mkdtempSync(path.join(os.tmpdir(), "litedocs-tests-"));

// Mock parser and cache
vi.mock("../../packages/core/src/node/routes/parser");
vi.mock("../../packages/core/src/node/routes/cache", () => ({
  docCache: {
    load: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    pruneStale: vi.fn(),
    save: vi.fn(),
    invalidateAll: vi.fn(),
  },
}));

describe("generateRoutes", () => {
  const basePath = "/docs";

  beforeEach(() => {
    vi.clearAllMocks();
    // Clean temp dir
    const files = fs.readdirSync(tempDocsDir);
    for (const file of files) {
      fs.rmSync(path.join(tempDocsDir, file), { recursive: true, force: true });
    }
  });

  afterAll(() => {
    fs.rmSync(tempDocsDir, { recursive: true, force: true });
  });

  it("should generate routes for found files", async () => {
    fs.writeFileSync(path.join(tempDocsDir, "a.md"), "# A");
    fs.writeFileSync(path.join(tempDocsDir, "b.md"), "# B");

    (parser.parseDocFile as any).mockImplementation((file: string) => ({
      route: {
        path: "/docs/" + path.basename(file, ".md"),
        title: "Title",
        sidebarPosition: undefined,
      },
      relativeDir: undefined,
    }));

    const routes = await generateRoutes(tempDocsDir, undefined, basePath);

    expect(routes).toHaveLength(2);
    expect(docCache.save).toHaveBeenCalled();
  });

  it("should handle group directories correctly", async () => {
    const groupDir = path.join(tempDocsDir, "group");
    if (!fs.existsSync(groupDir)) fs.mkdirSync(groupDir);
    fs.writeFileSync(path.join(groupDir, "page.md"), "# Page");

    (parser.parseDocFile as any).mockReturnValue({
      route: {
        path: "/docs/group/page",
        title: "Page",
        sidebarPosition: undefined,
      },
      relativeDir: "group",
      inferredGroupPosition: 1,
    });

    const routes = await generateRoutes(tempDocsDir, undefined, basePath);

    expect(routes).toHaveLength(1);
    expect(routes[0].group).toBe("group");
    expect(routes[0].groupTitle).toBe("Group");
    expect(routes[0].groupPosition).toBe(1);
  });

  it("should sort routes based on sidebarPosition and then alphabetically", async () => {
    fs.writeFileSync(path.join(tempDocsDir, "z.md"), "# Z");
    fs.writeFileSync(path.join(tempDocsDir, "a.md"), "# A");
    fs.writeFileSync(path.join(tempDocsDir, "b.md"), "# B");

    (parser.parseDocFile as any).mockImplementation((file: string) => {
      if (file.includes("z.md"))
        return { route: { path: "/docs/z", title: "Z", sidebarPosition: 1 } };
      if (file.includes("a.md"))
        return { route: { path: "/docs/a", title: "A", sidebarPosition: 10 } };
      if (file.includes("b.md"))
        return { route: { path: "/docs/b", title: "B", sidebarPosition: 5 } };
      return {};
    });

    const routes = await generateRoutes(tempDocsDir, undefined, basePath);

    expect(routes[0].path).toBe("/docs/z"); // pos 1
    expect(routes[1].path).toBe("/docs/b"); // pos 5
    expect(routes[2].path).toBe("/docs/a"); // pos 10
  });

  it("should use cache if available and not expired", async () => {
    fs.writeFileSync(path.join(tempDocsDir, "cached.md"), "# Cached");
    (docCache.get as any).mockReturnValue({
      route: { path: "/docs/cached", title: "Cached" },
    });

    const routes = await generateRoutes(tempDocsDir, undefined, basePath);

    expect(routes).toHaveLength(1);
    expect(routes[0].title).toBe("Cached");
    expect(parser.parseDocFile).not.toHaveBeenCalled();
  });

  it("should handle empty documentation directory", async () => {
    const routes = await generateRoutes(tempDocsDir, undefined, basePath);
    expect(routes).toHaveLength(0);
  });
});
