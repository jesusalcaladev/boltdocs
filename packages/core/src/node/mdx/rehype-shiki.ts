import { visit } from 'unist-util-visit'
import type { BoltdocsConfig } from '../config'
import { getShikiHighlighter } from './highlighter'

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
    const codeTheme = config?.theme?.codeTheme || {
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
