import { visit } from 'unist-util-visit'
import type { BoltdocsConfig } from '../config'
import { getShikiHighlighter } from './highlighter'

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
    const codeTheme = config?.theme?.codeTheme ?? {
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
          code = expr.match(/^[`'"]([\s\S]+)[`'"]$/)?.[1] ?? expr
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
