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

  useEffect(() => {
    // Generate a unique ID for this mermaid diagram to avoid DOM collisions
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        setSvgStr(svg)
      })
      .catch((e) => {
        console.error('[Boltdocs] Failed to render Mermaid diagram:', e)
        // Display fallback errors
        setSvgStr(`<div class="mermaid-error">Failed to render diagram</div>`)
      })
  }, [chart])

  return (
    <div
      ref={containerRef}
      className="mermaid-container"
      dangerouslySetInnerHTML={{ __html: svgStr }}
    />
  )
}
