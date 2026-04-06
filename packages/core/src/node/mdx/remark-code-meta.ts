import { visit } from 'unist-util-visit'

/**
 * Remark plugin that preserves code fence meta strings (e.g., title="file.ts")
 * and the language identifier by copying them to hProperties so they survive
 * the remark → rehype conversion and are accessible as props on the `<pre>` element.
 *
 * Usage in MDX: ```ts title="app.ts"
 */
export function remarkCodeMeta() {
  return (tree: any) => {
    visit(tree, 'code', (node: any) => {
      node.data = node.data || {}
      node.data.hProperties = node.data.hProperties || {}

      // Always pass the lang through
      if (node.lang) {
        node.data.hProperties['data-lang'] = node.lang
      }

      if (!node.meta) return

      const meta: string = node.meta

      // Extract title="..." from the meta string
      const titleMatch = meta.match(/title\s*=\s*"([^"]*)"/)
      if (titleMatch) {
        node.data.hProperties.title = titleMatch[1]
      }

      // Preserve the full meta string for other plugins
      node.data.hProperties.metastring = meta
    })
  }
}
