import { useMemo } from 'react'
import type { ComponentPreviewProps } from '../component-preview'

export function useComponentPreview(props: ComponentPreviewProps) {
  const { code: propsCode, children, preview } = props
  const initialCode = useMemo(() => {
    const base = propsCode ?? (typeof children === 'string' ? children : '')
    return base.trim()
  }, [propsCode, children])

  const previewElement = useMemo(() => {
    return preview ?? (typeof children !== 'string' ? children : null)
  }, [preview, children])

  return { initialCode, previewElement }
}
