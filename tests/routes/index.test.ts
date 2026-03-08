import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateRoutes } from "../../packages/core/src/node/routes/index";
import * as parser from "../../packages/core/src/node/routes/parser";
import fastGlob from "fast-glob";
import { docCache } from "../../packages/core/src/node/routes/cache";

// Mock fast-glob
vi.mock("fast-glob", () => {
  const mock = vi.fn();
  return {
    default: mock,
    __esModule: true,
  };
});

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
  const docsDir = "/docs";
  const basePath = "/docs";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate routes for found files", async () => {
    // The issue might be that fastGlob itself needs to be mocked, not just .default
    (fastGlob as any).mockResolvedValue(["/docs/a.md", "/docs/b.md"]);

    (parser.parseDocFile as any).mockImplementation((file: string) => ({
      route: { path: file.replace(".md", ""), title: "Title" },
      relativeDir: undefined,
    }));

    const routes = await generateRoutes(docsDir, undefined, basePath);

    expect(routes).toHaveLength(2);
    expect(fastGlob).toHaveBeenCalled();
    expect(docCache.save).toHaveBeenCalled();
  });

  it("should handle group directories correctly", async () => {
    (fastGlob as any).mockResolvedValue(["/docs/group/page.md"]);

    (parser.parseDocFile as any).mockReturnValue({
      route: { path: "/docs/group/page", title: "Page" },
      relativeDir: "group",
      inferredGroupPosition: 1,
    });

    const routes = await generateRoutes(docsDir, undefined, basePath);

    expect(routes).toHaveLength(1);
    expect(routes[0].group).toBe("group");
    expect(routes[0].groupTitle).toBe("Group");
    expect(routes[0].groupPosition).toBe(1);
  });
});
