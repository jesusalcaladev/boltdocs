import { visit } from 'unist-util-visit'

/**
 * A Remark plugin that detects mermaid code blocks and transforms them
 * into <Mermaid /> JSX components. This runs BEFORE any rehype processing,
 * ensuring high reliability in MDX.
 */
export function remarkMermaid() {
  return (tree: any) => {
    visit(tree, 'code', (node: any, index: number | undefined, parent: any) => {
      if (node.lang !== 'mermaid') return

      const rawCode = node.value || ''

      // Replace the code block with a JSX component
      const newNode = {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'chart',
            value: rawCode,
          },
        ],
        children: [],
      }

      if (parent && typeof index === 'number') {
        parent.children[index] = newNode
      }
    })
  }
}

/**
 * The standard Boltdocs Mermaid plugin.
 */
export default function mermaidPlugin() {
  return {
    name: 'boltdocs-plugin-mermaid',
    remarkPlugins: [remarkMermaid],
    components: {
      Mermaid: '@bdocs/plugin-mermaid/client',
    },
  }
}
