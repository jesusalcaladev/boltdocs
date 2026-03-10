import { describe, it, expect, vi } from "vitest";
import {
  normalizePath,
  stripNumberPrefix,
  extractNumberPrefix,
  isDocFile,
  getFileMtime,
  parseFrontmatter,
  escapeHtml,
  escapeXml,
  fileToRoutePath,
  capitalize,
} from "../packages/core/src/node/utils";
import fs from "fs";
import path from "path";
import os from "os";

describe("utils", () => {
  it("normalizePath should convert backslashes to forward slashes", () => {
    expect(normalizePath("foo\\bar\\baz")).toBe("foo/bar/baz");
    expect(normalizePath("foo/bar/baz")).toBe("foo/bar/baz");
  });

  it("stripNumberPrefix should remove numeric prefixes", () => {
    expect(stripNumberPrefix("1.guide")).toBe("guide");
    expect(stripNumberPrefix("10.advanced")).toBe("advanced");
    expect(stripNumberPrefix("guide")).toBe("guide");
  });

  it("extractNumberPrefix should extract numeric prefixes", () => {
    expect(extractNumberPrefix("1.guide")).toBe(1);
    expect(extractNumberPrefix("10.advanced")).toBe(10);
    expect(extractNumberPrefix("guide")).toBeUndefined();
  });

  it("isDocFile should identify md/mdx files", () => {
    expect(isDocFile("test.md")).toBe(true);
    expect(isDocFile("test.mdx")).toBe(true);
    expect(isDocFile("test.txt")).toBe(false);
  });

  it("getFileMtime should return mtime or 0 on error", () => {
    const tempFile = path.join(
      os.tmpdir(),
      `boltdocs-utils-test-${Date.now()}.txt`,
    );
    fs.writeFileSync(tempFile, "hello");
    expect(getFileMtime(tempFile)).toBeGreaterThan(0);
    expect(getFileMtime("nonexistent")).toBe(0);
    fs.unlinkSync(tempFile);
  });

  it("parseFrontmatter should parse YAML frontmatter", () => {
    const tempFile = path.join(
      os.tmpdir(),
      `boltdocs-utils-test-fm-${Date.now()}.md`,
    );
    fs.writeFileSync(tempFile, "---\ntitle: Hello\n---\n# World");
    const { data, content } = parseFrontmatter(tempFile);
    expect(data.title).toBe("Hello");
    expect(content.trim()).toBe("# World");
    fs.unlinkSync(tempFile);
  });

  it("escapeHtml and escapeXml should escape special characters", () => {
    const raw = '<script src="bad.js">&</script>';
    const escaped = "&lt;script src=&quot;bad.js&quot;&gt;&amp;&lt;/script&gt;";
    expect(escapeHtml(raw)).toBe(escaped);
    expect(escapeXml(raw)).toBe(escaped);
  });

  it("fileToRoutePath should convert relative paths to routes", () => {
    expect(fileToRoutePath("1.guide/2.advanced.md")).toBe("/guide/advanced");
    expect(fileToRoutePath("index.md")).toBe("/");
    expect(fileToRoutePath("docs/index.md")).toBe("/docs");
    expect(fileToRoutePath("docs/page.md")).toBe("/docs/page");
    expect(fileToRoutePath("/docs/page.md/")).toBe("/docs/page");
  });

  it("capitalize should uppercase the first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("Hello")).toBe("Hello");
  });
});
