import mdxPlugin from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeSlug from 'rehype-slug'
import type { Plugin } from 'vite'
import crypto from 'crypto'
import { visit } from 'unist-util-visit'
import { createHighlighter } from 'shiki'

import type { Highlighter } from 'shiki'

import type { BoltdocsConfig } from './config'
import { TransformCache } from './cache'

let shikiHighlighter: Highlighter | null = null

/**
 * Retrieves or initializes the Shiki highlighter instance.
 * Supports dual-theme configurations (light/dark).
 *
 * @param codeTheme - Theme configuration (string for single, object for dual).
 * @returns A promise resolving to the highlighter instance.
 */
async function getShikiHighlighter(codeTheme: any) {
  if (shikiHighlighter) return shikiHighlighter

  const themes =
    typeof codeTheme === 'object'
      ? [codeTheme.light, codeTheme.dark]
      : [codeTheme ?? 'github-dark']

  // Fallbacks for standard themes
  ;['github-light', 'github-dark'].forEach((t) => {
    if (!themes.includes(t)) themes.push(t)
  })

  // Initialize with a core set of languages first to speed up boot
  shikiHighlighter = await createHighlighter({
    themes,
    langs: [
      'tsx',
      'jsx',
      'ts',
      'js',
      'json',
      'md',
      'mdx',
      'css',
      'html',
      'bash',
      'sh',
      'yaml',
      'yml',
    ],
  })

  return shikiHighlighter
}

/**
 * Custom remark plugin to highlight code in ComponentPreview components.
 * This runs before rehype, ensuring that the 'highlightedHtml' prop is correctly
 * attached to the MDX component as a JSX attribute.
 *
 * Supports both string literals and MDX expression values (template literals)
 * for the 'code' attribute.
 *
 * @param config - The Boltdocs configuration
 * @returns A remark plugin function
 */
export function remarkShiki(config?: BoltdocsConfig) {
  return async (tree: any) => {
    const codeTheme = config?.themeConfig?.codeTheme ?? {
      light: 'github-light',
      dark: 'github-dark',
    }
    const highlighter = await getShikiHighlighter(codeTheme)

    visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node: any) => {
      if (node.name !== 'ComponentPreview') return

      const codeAttr = node.attributes?.find((a: any) => a.name === 'code')
      let code = ''

      if (codeAttr) {
        if (typeof codeAttr.value === 'string') {
          code = codeAttr.value
        } else if (codeAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const expr = codeAttr.value.value ?? ''
          code = expr.match(/^[`'"](.+)[`'"]$/)?.[1] ?? expr
        }
      }

      if (!code) return

      const options: any =
        typeof codeTheme === 'object'
          ? {
              themes: { light: codeTheme.light, dark: codeTheme.dark },
              lang: 'tsx',
            }
          : { theme: codeTheme, lang: 'tsx' }

      const html = highlighter.codeToHtml(code, options)

      node.attributes = (node.attributes ?? []).filter(
        (a: any) => a.name !== 'highlightedHtml',
      )
      node.attributes.push({
        type: 'mdxJsxAttribute',
        name: 'highlightedHtml',
        value: html,
      })
    })
  }
}

/**
 * Custom rehype plugin to perform syntax highlighting at build time for
 * standard Markdown code blocks.
 *
 * Injects 'data-highlighted="true"' and 'highlightedHtml' into the 'pre' tag properties,
 * which are then consumed by the client-side CodeBlock component.
 *
 * @param config - The Boltdocs configuration
 * @returns A rehype plugin function
 */
export function rehypeShiki(config?: BoltdocsConfig) {
  return async (tree: any) => {
    const codeTheme = config?.themeConfig?.codeTheme || {
      light: 'github-light',
      dark: 'github-dark',
    }
    const highlighter = await getShikiHighlighter(codeTheme)

    visit(tree, 'element', (node: any) => {
      // Handle standard Markdown code blocks
      if (node.tagName === 'pre' && node.children?.[0]?.tagName === 'code') {
        const codeNode = node.children[0]
        const className = codeNode.properties?.className || []
        const langMatch = className.find((c: string) =>
          c.startsWith('language-'),
        )
        const lang = langMatch ? langMatch.slice(9) : 'text'
        const code = codeNode.children[0]?.value || ''

        const options: any = { lang }
        if (typeof codeTheme === 'object') {
          options.themes = {
            light: codeTheme.light,
            dark: codeTheme.dark,
          }
        } else {
          options.theme = codeTheme
        }

        const html = highlighter.codeToHtml(code, options)

        // Inject highlighted HTML and mark as highlighted for CodeBlock component
        node.properties.dataHighlighted = 'true'
        node.properties.highlightedHtml = html
        node.children = []
      }
    })
  }
}

const MDX_PLUGIN_VERSION = 'v3'

/**
 * Persistent cache for MDX transformations.
 * Saves results to `.boltdocs/transform-mdx.json.gz`.
 */
const mdxCache = new TransformCache('mdx')
let mdxCacheLoaded = false

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
    config?.plugins?.flatMap((p) => p.remarkPlugins || []) || []
  const extraRehypePlugins =
    config?.plugins?.flatMap((p) => p.rehypePlugins || []) || []

  const baseMdxPlugin = compiler({
    remarkPlugins: [
      remarkGfm,
      remarkFrontmatter,
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

  // @ts-ignore
  if (baseMdxPlugin.isMock) {
    console.log('MDX PLUGIN IS MOCKED')
  }

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
      if (baseMdxPlugin.buildStart) {
        await (baseMdxPlugin.buildStart as any).call(this)
      }
    },

    async transform(code, id, options) {
      if (!id.endsWith('.md') && !id.endsWith('.mdx')) {
        return (baseMdxPlugin.transform as any)?.call(this, code, id, options)
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

      const result = await (baseMdxPlugin.transform as any).call(
        this,
        code,
        id,
        options,
      )

      if (result && typeof result === 'object' && result.code) {
        mdxCache.set(cacheKey, result.code)
      }

      return result
    },

    async buildEnd() {
      console.log(
        `[boltdocs] MDX Cache Performance: ${hits}/${total} hits (${Math.round((hits / total) * 100) || 0}%)`,
      )
      mdxCache.save()
      await mdxCache.flush() // Use instance flush or global flushCache
      if (baseMdxPlugin.buildEnd) {
        await (baseMdxPlugin.buildEnd as any).call(this)
      }
    },
  }
}

let hits = 0
let total = 0
