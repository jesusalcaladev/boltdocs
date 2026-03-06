import mdxPlugin from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import type { Plugin } from "vite";

import type { BoltdocsConfig } from "./config";

/**
 * Configures the MDX compiler for Vite using `@mdx-js/rollup`.
 * Includes standard remark and rehype plugins for GitHub Flavored Markdown (GFM),
 * frontmatter extraction, auto-linking headers, and syntax highlighting via `rehype-pretty-code`.
 *
 * @param config - The Boltdocs configuration containing custom plugins
 * @returns A Vite plugin configured for MDX parsing
 */
export function boltdocsMdxPlugin(config?: BoltdocsConfig): Plugin {
  const extraRemarkPlugins =
    config?.plugins?.flatMap((p) => p.remarkPlugins || []) || [];
  const extraRehypePlugins =
    config?.plugins?.flatMap((p) => p.rehypePlugins || []) || [];

  return mdxPlugin({
    remarkPlugins: [remarkGfm, remarkFrontmatter, ...extraRemarkPlugins],
    rehypePlugins: [
      rehypeSlug,
      ...extraRehypePlugins,
      [
        rehypePrettyCode,
        {
          theme: "one-dark-pro",
          keepBackground: false,
        },
      ],
    ],
    // Provide React as default for JSX
    jsxRuntime: "automatic",
    providerImportSource: "@mdx-js/react",
  }) as Plugin;
}
