import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  FileCache,
  TransformCache,
  AssetCache,
  flushCache,
} from "../packages/core/src/node/cache";
import fs from "fs";
import path from "path";
import os from "os";

describe("cache", () => {
  let tempDir: string;

  beforeEach(() => {
    vi.clearAllMocks();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "boltdocs-cache-test-"));
    process.env.BOLTDOCS_NO_CACHE = "0";
  });

  describe("FileCache", () => {
    it("should load and save correctly", async () => {
      const cache = new FileCache<string>({ name: "test", root: tempDir });
      cache.set("file1.md", "data1");

      // Mock mtime to match
      vi.spyOn(fs, "statSync").mockReturnValue({ mtimeMs: 1000 } as any);

      cache.save();
      await cache.flush();

      const cache2 = new FileCache<string>({ name: "test", root: tempDir });
      cache2.load();
      expect(cache2.size).toBe(1);
    });

    it("should handle error in save/load", async () => {
      const cache = new FileCache<string>({ name: "error", root: tempDir });
      cache.set("f", "d");
      // Mock writeFile to throw
      const spy = vi.spyOn(fs, "writeFile" as any).mockImplementation(() => {
        throw new Error("Disk full");
      });
      cache.save();
      await cache.flush();
      spy.mockRestore();
    });
  });

  describe("TransformCache", () => {
    it("should handle disk reads and hits", async () => {
      const cache = new TransformCache("disk", tempDir);
      cache.set("k1", "v1");
      await cache.flush();

      // Force disk load by clearing memory
      (cache as any).memoryCache.clear();

      expect(cache.get("k1")).toBe("v1");
      expect(cache.size).toBe(1);
    });

    it("should handle getMany disk loading", async () => {
      const cache = new TransformCache("many-disk", tempDir);
      cache.set("k1", "v1");
      cache.set("k2", "v2");
      await cache.flush();

      (cache as any).memoryCache.clear();

      const results = await cache.getMany(["k1", "k2"]);
      expect(results.get("k1")).toBe("v1");
      expect(results.get("k2")).toBe("v2");
    });

    it("should handle corruption", async () => {
      const cache = new TransformCache("corrupt", tempDir);
      cache.set("k1", "v1");
      await cache.flush();

      // Corrupt shard
      const hash = (cache as any).index.get("k1");
      const shardPath = path.join(
        tempDir,
        ".boltdocs",
        "transform-corrupt",
        "shards",
        `${hash}.gz`,
      );
      fs.writeFileSync(shardPath, "not a gzip");

      (cache as any).memoryCache.clear();
      expect(cache.get("k1")).toBeNull();
    });
  });

  describe("AssetCache", () => {
    it("should store and retrieve assets", async () => {
      const cache = new AssetCache(tempDir);
      const source = path.join(tempDir, "source.txt");
      fs.writeFileSync(source, "hello");

      cache.set(source, "v1", "content");
      await cache.flush();

      const hit = cache.get(source, "v1");
      expect(hit).not.toBeNull();
    });
  });
});
