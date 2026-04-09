import mdxPlugin from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeSlug from 'rehype-slug'
import type { Plugin } from 'vite'
import crypto from 'crypto'

import type { BoltdocsConfig } from '../config'
import { mdxCache, MDX_PLUGIN_VERSION } from './cache'
import { remarkShiki } from './remark-shiki'
import { rehypeShiki } from './rehype-shiki'
import { remarkCodeMeta } from './remark-code-meta'
import { PluginSandbox } from '../plugins'

let mdxCacheLoaded = false
let hits = 0
let total = 0

/**
 * Configures the MDX compiler for Vite using `@mdx-js/rollup`.
 * Includes standard remark and rehype plugins for GitHub Flavored Markdown (GFM),
 * frontmatter extraction, and auto-linking headers.
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
    config?.plugins?.flatMap((p) => {
      const caps = PluginSandbox.getSanitizedCapabilities(p as any)
      return caps.remarkPlugins || []
    }) || []
  const extraRehypePlugins =
    config?.plugins?.flatMap((p) => {
      const caps = PluginSandbox.getSanitizedCapabilities(p as any)
      return caps.rehypePlugins || []
    }) || []

  const baseMdxPlugin = compiler({
    remarkPlugins: [
      remarkGfm,
      remarkFrontmatter,
      remarkCodeMeta,
      [remarkShiki, config],
      ...(extraRemarkPlugins as any[]),
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeShiki, config],
      ...(extraRehypePlugins as any[]),
    ],
    jsxRuntime: 'automatic',
    providerImportSource: '@mdx-js/react',
  }) as Plugin

  return {
    ...baseMdxPlugin,
    name: 'vite-plugin-boltdocs-mdx',

    async buildStart() {
      hits = 0
      total = 0
      if (!mdxCacheLoaded) {
        mdxCache.load()
        mdxCacheLoaded = true
      }
      // @ts-ignore
      if (baseMdxPlugin.buildStart) {
        // @ts-ignore
        await baseMdxPlugin.buildStart.call(this)
      }
    },

    async transform(code, id, options) {
      if (!id.endsWith('.md') && !id.endsWith('.mdx')) {
        // @ts-ignore
        return baseMdxPlugin.transform?.call(this, code, id, options)
      }

      console.log(`[boltdocs] Transforming MDX: ${id}`)
      total++
      // Create a cache key based on path, content, and plugin version
      const contentHash = crypto.createHash('md5').update(code).digest('hex')
      const cacheKey = `${id}:${contentHash}:${MDX_PLUGIN_VERSION}`

      const cached = mdxCache.get(cacheKey)
      if (cached) {
        hits++
        return { code: cached, map: null }
      }

      // @ts-ignore
      const result = await baseMdxPlugin.transform.call(this, code, id, options)

      if (result && typeof result === 'object' && result.code) {
        mdxCache.set(cacheKey, result.code)
      }

      return result
    },

    async buildEnd() {
      if (total > 0) {
        console.log(
          `[boltdocs] MDX Cache Performance: ${hits}/${total} hits (${Math.round((hits / total) * 100) || 0}%)`,
        )
      }
      mdxCache.save()
      await mdxCache.flush()
      // @ts-ignore
      if (baseMdxPlugin.buildEnd) {
        // @ts-ignore
        await baseMdxPlugin.buildEnd.call(this)
      }
    },
  }
}
