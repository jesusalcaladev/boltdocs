import mdxPlugin from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import type { Plugin } from "vite";
import crypto from "crypto";

import type { BoltdocsConfig } from "./config";
import { TransformCache } from "./cache";

/**
 * Persistent cache for MDX transformations.
 * Saves results to `.boltdocs/transform-mdx.json.gz`.
 */
const mdxCache = new TransformCache("mdx");
let mdxCacheLoaded = false;

/**
 * Configures the MDX compiler for Vite using `@mdx-js/rollup`.
 * Includes standard remark and rehype plugins for GitHub Flavored Markdown (GFM),
 * frontmatter extraction, auto-linking headers, and syntax highlighting via `rehype-pretty-code`.
 *
 * Also wraps the plugin with a persistent cache to avoid re-compiling unchanged MDX files.
 *
 * @param config - The Boltdocs configuration containing custom plugins
 * @param compiler - The MDX compiler plugin (for testing)
 * @returns A Vite plugin configured for MDX parsing with caching
 */
export function boltdocsMdxPlugin(
  config?: BoltdocsConfig,
  compiler = mdxPlugin,
): Plugin {
  const extraRemarkPlugins =
    config?.plugins?.flatMap((p) => p.remarkPlugins || []) || [];
  const extraRehypePlugins =
    config?.plugins?.flatMap((p) => p.rehypePlugins || []) || [];

  const baseMdxPlugin = compiler({
    remarkPlugins: [remarkGfm, remarkFrontmatter, ...extraRemarkPlugins],
    rehypePlugins: [
      rehypeSlug,
      ...extraRehypePlugins,
      [
        rehypePrettyCode,
        {
          theme: config?.themeConfig?.codeTheme || "one-dark-pro",
          keepBackground: false,
        },
      ],
    ],
    jsxRuntime: "automatic",
    providerImportSource: "@mdx-js/react",
  }) as Plugin;

  // @ts-ignore
  if (baseMdxPlugin.isMock) {
    console.log("MDX PLUGIN IS MOCKED");
  }

  return {
    ...baseMdxPlugin,
    name: "vite-plugin-boltdocs-mdx",

    async buildStart() {
      hits = 0;
      total = 0;
      if (!mdxCacheLoaded) {
        mdxCache.load();
        mdxCacheLoaded = true;
      }
      if (baseMdxPlugin.buildStart) {
        await (baseMdxPlugin.buildStart as any).call(this);
      }
    },

    async transform(code, id, options) {
      if (!id.endsWith(".md") && !id.endsWith(".mdx")) {
        return (baseMdxPlugin.transform as any)?.call(this, code, id, options);
      }

      total++;
      // Create a cache key based on path, content, and config (simplified)
      const contentHash = crypto.createHash("md5").update(code).digest("hex");
      const cacheKey = `${id}:${contentHash}`;

      const cached = mdxCache.get(cacheKey);
      if (cached) {
        hits++;
        return { code: cached, map: null };
      }

      const result = await (baseMdxPlugin.transform as any).call(
        this,
        code,
        id,
        options,
      );

      if (result && typeof result === "object" && result.code) {
        mdxCache.set(cacheKey, result.code);
      }

      return result;
    },

    async buildEnd() {
      mdxCache.save();
      await mdxCache.flush(); // Use instance flush or global flushCache
      if (baseMdxPlugin.buildEnd) {
        await (baseMdxPlugin.buildEnd as any).call(this);
      }
    },
  };
}

/**
 * Returns the current MDX cache statistics.
 * @returns An object with total and hit counts
 * @deprecated Removed for performance
 */
export function getMdxCacheStats() {
  return { hits: 0, total: 0 };
}

let hits = 0;
let total = 0;
