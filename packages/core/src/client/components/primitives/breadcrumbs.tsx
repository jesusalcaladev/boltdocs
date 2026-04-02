import {
  Breadcrumb,
  Breadcrumbs as BreadcrumbsRAC,
  Link,
} from 'react-aria-components'
import type { LinkProps } from 'react-aria-components'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { ComponentBase } from './types'

export const BreadcrumbsRoot = ({
  children,
  className,
  ...props
}: ComponentBase) => {
  return (
    <BreadcrumbsRAC
      className={cn(
        'flex items-center gap-1.5 pl-0! mb-0 text-sm text-text-muted',
        className,
      )}
      {...props}
    >
      {children as any}
    </BreadcrumbsRAC>
  )
}

export const BreadcrumbsItem = ({
  children,
  className,
  ...props
}: ComponentBase) => {
  return (
    <Breadcrumb
      className={cn('flex items-center mb-0 gap-1.5', className)}
      {...props}
    >
      {children as any}
    </Breadcrumb>
  )
}

export const BreadcrumbsLink = ({
  children,
  href,
  className,
  ...props
}: LinkProps & { className?: string }) => {
  return (
    <Link
      href={href}
      className={cn(
        'transition-colors outline-none hover:text-text-main focus-visible:ring-2 focus-visible:ring-primary-500/30 rounded-sm',
        'current:font-medium current:text-text-main current:pointer-events-none cursor-pointer',
        className,
      )}
      {...props}
    >
      {children as any}
    </Link>
  )
}

export const BreadcrumbsSeparator = ({ className }: ComponentBase) => {
  return (
    <ChevronRight
      size={14}
      className={cn('shrink-0 text-text-dim', className)}
    />
  )
}

export default {
  BreadcrumbsRoot,
  BreadcrumbsItem,
  BreadcrumbsLink,
  BreadcrumbsSeparator,
}
