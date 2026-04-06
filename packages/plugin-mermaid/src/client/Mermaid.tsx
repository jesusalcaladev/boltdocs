import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

// Use beautiful default styling aligned with Boltdocs themes
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#f3f4f6',
    primaryTextColor: '#111827',
    primaryBorderColor: '#d1d5db',
    lineColor: '#6b7280',
    secondaryColor: '#e5e7eb',
    tertiaryColor: '#ffffff',
    fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
  },
  // Ensure we also look good on dark mode if active
  darkMode:
    typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark'),
})

export interface MermaidProps {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgStr, setSvgStr] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    // Generate a unique ID for this mermaid diagram to avoid DOM collisions
    const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(id, chart)
        if (isMounted) {
          setSvgStr(svg)
          setError(null)
        }
      } catch (e) {
        if (isMounted) {
          console.error('[Boltdocs] Failed to render Mermaid diagram:', e)
          setError('Failed to render diagram. Check your syntax.')
        }
      }
    }

    renderDiagram()

    return () => {
      isMounted = false
    }
  }, [chart])

  if (error) {
    return (
      <div className="my-6 flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-container my-6 flex min-h-[100px] items-center justify-center overflow-auto rounded-lg border border-border-subtle bg-white/50 p-6 backdrop-blur-sm dark:bg-bg-surface/50 ${
        !svgStr ? 'animate-pulse bg-bg-main' : ''
      }`}
      dangerouslySetInnerHTML={{ __html: svgStr }}
    />
  )
}
