import * as RAC from 'react-aria-components'
import { Copy, Check } from 'lucide-react'
import { cn } from '@client/utils/cn'
import { useCodeBlock } from './hooks/use-code-block'
import { useConfig } from '@client/app/config-context'
import { CodeSandbox } from '@components/icons-dev'
import { Tooltip } from '@components/primitives/tooltip'

export interface CodeBlockProps {
  children?: React.ReactNode
  className?: string
  sandbox?: boolean | any
  hideCopy?: boolean
  hideSandbox?: boolean
  title?: string
  lang?: string
  highlightedHtml?: string
  [key: string]: any
}

export function CodeBlock(props: CodeBlockProps) {
  const {
    children,
    sandbox: localSandbox,
    hideSandbox = true,
    hideCopy = false,
    highlightedHtml,
    ...rest
  } = props
  const config = useConfig()
  const globalSandbox = config?.integrations?.sandbox
  const isSandboxEnabled = !!globalSandbox?.enable && !hideSandbox
  const {
    copied,
    isExpanded,
    setIsExpanded,
    isExpandable,
    preRef,
    handleCopy,
    handleSandbox,
    shouldTruncate,
  } = useCodeBlock(props)

  return (
    <div
      className={cn(
        'group relative my-6 overflow-hidden rounded-lg border border-border-subtle bg-(--color-code-bg)',
        shouldTruncate && '[&>pre]:max-h-[250px] [&>pre]:overflow-hidden',
      )}
    >
      {/* Toolbar */}
      <div className="absolute top-3 right-4 z-50 flex items-center gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100">
        {isSandboxEnabled && (
          <Tooltip content="Open in CodeSandbox">
            <RAC.Button
              onPress={handleSandbox}
              className="grid place-items-center w-8 h-8 bg-transparent text-text-muted outline-none cursor-pointer transition-all duration-200 hover:scale-115 hover:text-sky-400 active:scale-95 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-2"
              aria-label="Open in CodeSandbox"
            >
              <CodeSandbox size={20} />
            </RAC.Button>
          </Tooltip>
        )}
        {!hideCopy && (
          <Tooltip content={copied ? 'Copied!' : 'Copy code'}>
            <RAC.Button
              onPress={handleCopy}
              className={cn(
                'grid place-items-center w-8 h-8 bg-transparent outline-none cursor-pointer transition-all duration-200 hover:scale-115 active:scale-95 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-2',
                copied
                  ? 'text-emerald-400'
                  : 'text-text-muted hover:text-text-main',
              )}
              aria-label="Copy code"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </RAC.Button>
          </Tooltip>
        )}
      </div>

      {/* Code Content */}
      {highlightedHtml ? (
        <div
          // @ts-ignore
          ref={preRef}
          className="shiki-wrapper [&>pre]:m-0! [&>pre]:rounded-none! [&>pre]:border-none! [&>pre]:bg-inherit! [&>pre>code]:grid! [&>pre>code]:p-5! [&>.shiki.shiki-themes]:bg-transparent!"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre
          ref={preRef}
          className="m-0! rounded-none! border-none! bg-inherit! font-mono text-[0.8125rem] leading-[1.7]"
          {...rest}
        >
          {children}
        </pre>
      )}

      {/* Expand/Collapse */}
      {isExpandable && (
        <div
          className={cn(
            shouldTruncate
              ? 'absolute bottom-0 inset-x-0 h-24 bg-linear-to-t from-(--color-code-bg) to-transparent flex items-end justify-center pb-4 z-10'
              : 'relative flex justify-center py-4',
          )}
        >
          <RAC.Button
            onPress={() => setIsExpanded(!isExpanded)}
            className="rounded-full bg-bg-surface border border-border-subtle px-5 py-2 text-[0.8125rem] font-medium text-text-main outline-none cursor-pointer transition-all hover:bg-border-subtle hover:-translate-y-px backdrop-blur-md"
          >
            {isExpanded ? 'Show less' : 'Expand code'}
          </RAC.Button>
        </div>
      )}
    </div>
  )
}
