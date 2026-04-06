import type { SandboxOptions } from '../../types'
import { CodeBlock } from './code-block'
import { useComponentPreview } from './hooks/use-component-preview'

export interface ComponentPreviewProps {
  code?: string
  highlightedHtml?: string
  children?: string
  preview?: React.ReactNode
  hideCode?: boolean
  hideSandbox?: boolean
  hideCopy?: boolean
  sandboxOptions?: SandboxOptions
}

export function ComponentPreview(props: ComponentPreviewProps) {
  const {
    highlightedHtml,
    hideCode = false,
    hideSandbox = false,
    hideCopy = false,
    sandboxOptions = {},
  } = props
  const { initialCode, previewElement } = useComponentPreview(props)

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border-subtle">
      <div className="flex items-center justify-center p-8 bg-bg-surface">
        {previewElement}
      </div>

      {!hideCode && (
        <div className="border-t border-border-subtle">
          <CodeBlock
            hideSandbox={hideSandbox}
            hideCopy={hideCopy}
            title={sandboxOptions.title}
            lang="tsx"
            highlightedHtml={highlightedHtml}
            plain={true}
          >
            {initialCode}
          </CodeBlock>
        </div>
      )}
    </div>
  )
}
