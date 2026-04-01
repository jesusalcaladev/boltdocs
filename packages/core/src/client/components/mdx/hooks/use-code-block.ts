import { useConfig } from '@client/app/config-context'
import { openSandbox } from '@client/integrations/codesandbox'
import { copyToClipboard } from '@client/utils/copy-clipboard'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CodeBlockProps } from '../code-block'

export function useCodeBlock(props: CodeBlockProps) {
  const { title, sandbox: localSandbox } = props
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isExpandable, setIsExpandable] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)
  const config = useConfig()

  const handleCopy = useCallback(async () => {
    const code = preRef.current?.textContent ?? ''
    copyToClipboard(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const handleSandbox = useCallback(() => {
    const code = preRef.current?.textContent ?? ''
    const globalSandbox = config?.integrations?.sandbox?.config || {}
    const baseOptions =
      typeof localSandbox === 'object' ? localSandbox : globalSandbox

    const entry = baseOptions.entry || 'src/App.tsx'

    openSandbox({
      title: title ?? 'Code Snippet',
      ...baseOptions,
      files: {
        ...baseOptions.files,
        [entry]: { content: code },
      },
    })
  }, [title, config, localSandbox])

  // biome-ignore lint/correctness/useExhaustiveDependencies: updates when content changes
  useEffect(() => {
    const codeLength = preRef.current?.textContent?.length ?? 0
    setIsExpandable(codeLength > 120)
  }, [props.children, props.highlightedHtml])

  return {
    copied,
    isExpanded,
    setIsExpanded,
    isExpandable,
    preRef,
    handleCopy,
    handleSandbox,
    shouldTruncate: isExpandable && !isExpanded,
  }
}
