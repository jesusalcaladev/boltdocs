import type React from 'react'
import { cn } from '@client/utils/cn'

/**
 * Props shared by all layout slot components.
 */
interface SlotProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * Root layout shell. Renders a full-height flex column.
 *
 * Usage:
 * ```tsx
 * <DocsLayout>
 *   <Navbar />
 *   <DocsLayout.Body>...</DocsLayout.Body>
 * </DocsLayout>
 * ```
 */
function DocsLayoutRoot({ children, className, style }: SlotProps) {
  return (
    <div
      className={cn(
        'h-screen flex flex-col overflow-hidden bg-bg-main text-text-main',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  )
}

/**
 * Horizontal flex container for sidebar + content + toc.
 */
function Body({ children, className, style }: SlotProps) {
  return (
    <div
      className={cn(
        'mx-auto flex flex-1 w-full max-w-(--breakpoint-3xl) bg-bg-main overflow-hidden',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  )
}

/**
 * Main scrollable content area.
 */
function Content({ children, className, style }: SlotProps) {
  return (
    <main
      className={cn(
        'boltdocs-content flex-1 min-w-0 overflow-y-auto',
        'contain-layout', // Optimization: isolate main content layout
        className,
      )}
      style={style}
    >
      <div className="boltdocs-page mx-auto max-w-content-max pt-4 pb-20 px-4 sm:px-8">
        {children}
      </div>
    </main>
  )
}

/**
 * Content header row (breadcrumbs + copy markdown).
 */
function ContentHeader({ children, className, style }: SlotProps) {
  return (
    <div
      className={cn('flex items-center justify-between mb-10', className)}
      style={style}
    >
      {children}
    </div>
  )
}

/**
 * Footer area inside the content section (page nav).
 */
function ContentFooter({ children, className, style }: SlotProps) {
  return (
    <div className={cn('mt-20', className)} style={style}>
      {children}
    </div>
  )
}

// Attach sub-components to the root
export const DocsLayout = Object.assign(DocsLayoutRoot, {
  Body,
  Content,
  ContentHeader,
  ContentFooter,
})
