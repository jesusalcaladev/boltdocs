import { Link } from './link'
import * as RAC from 'react-aria-components'
import { ChevronRight } from 'lucide-react'
import { cn } from '@client/utils/cn'
import type { ComponentBase } from './types'
import type { ComponentRoute } from '@client/types'

export interface SidebarGroupProps extends ComponentBase {
  title?: string
  icon?: React.ElementType
  isOpen?: boolean
  onToggle?: () => void
}

export interface SidebarLinkProps extends ComponentBase {
  label: string
  href: string
  active?: boolean
  icon?: React.ElementType
  badge?: ComponentRoute['badge']
}

const Badge = ({ badge }: { badge: ComponentRoute['badge'] }) => {
  const colors = {
    new: 'bg-primary-500/20 text-primary-500',
    updated: 'bg-gray-500/20 text-gray-500',
    deprecated: 'bg-red-500/20 text-red-500',
  }

  // Expire Badge
  if (typeof badge === 'object' && badge?.expires) {
    const expireDate = new Date(badge.expires)
    const today = new Date()
    const diffTime = expireDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return null
    }
  }

  const text = typeof badge === 'string' ? badge : badge?.text

  return (
    <span
      className={cn(
        'ml-auto flex h-4.5 items-center rounded-full text-[9px] font-medium px-1.5 py-0.5 text-center whitespace-nowrap',
        colors[text as keyof typeof colors] || colors.new,
      )}
    >
      {text}
    </span>
  )
}

export const SidebarRoot = ({ children, className }: ComponentBase) => {
  return (
    <aside
      className={cn(
        'boltdocs-sidebar sticky top-navbar hidden lg:flex flex-col shrink-0',
        'w-sidebar h-full',
        'overflow-y-auto border-r border-border-subtle bg-bg-main',
        'py-6 px-4',
        className,
      )}
    >
      <nav className="flex-1 space-y-6">{children}</nav>
    </aside>
  )
}

export const SidebarGroup = ({
  children,
  title,
  icon: Icon,
  isOpen = true,
  onToggle,
  className,
}: SidebarGroupProps) => {
  return (
    <div className={cn('space-y-1', className)}>
      {title && (
        <RAC.Button
          onPress={onToggle}
          className={cn(
            'flex w-full items-center justify-between px-2 py-1.5 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer',
            'text-text-muted hover:text-text-main transition-colors',
            'focus-visible:ring-2 focus-visible:ring-primary-500/30 rounded-md',
          )}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon size={14} />}
            {title}
          </div>
          <ChevronRight
            size={14}
            className={cn(
              'transition-transform duration-200',
              isOpen && 'rotate-90',
            )}
          />
        </RAC.Button>
      )}
      {isOpen && <div className="space-y-0.5">{children}</div>}
    </div>
  )
}

export const SidebarGroupItem = ({ children, className }: ComponentBase) => {
  return <div className={cn(className)}>{children}</div>
}

export const SidebarLink = ({
  label,
  href,
  active,
  icon: Icon,
  badge,
  className,
}: SidebarLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors',
        'focus-visible:ring-2 focus-visible:ring-primary-500/30',
        active
          ? 'bg-primary-500/10 text-primary-500 font-medium'
          : 'text-text-muted hover:bg-bg-surface hover:text-text-main',
        className,
      )}
    >
      {Icon && (
        <Icon
          size={16}
          className={cn(
            active
              ? 'text-primary-500'
              : 'text-text-muted group-hover:text-text-main',
          )}
        />
      )}
      <span className="truncate">{label}</span>
      {badge && <Badge badge={badge} />}
    </Link>
  )
}

export default {
  SidebarRoot,
  SidebarGroup,
  SidebarGroupItem,
  SidebarLink,
}
