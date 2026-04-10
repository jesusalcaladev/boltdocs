import { useConfig } from '@client/app/config-context'
import { copyToClipboard } from '@client/utils/copy-clipboard'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CodeBlockProps } from '../code-block'

export function useCodeBlock(props: CodeBlockProps) {
  const { title } = props
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
    shouldTruncate: isExpandable && !isExpanded,
  }
}
