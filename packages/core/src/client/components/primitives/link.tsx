import React from 'react'
import {
  Link as RACLink,
  type LinkProps as RACLinkProps,
} from 'react-aria-components'
import { useLocation } from 'react-router-dom'
import { useLocalizedTo } from '@hooks/use-localized-to'
import { usePreload } from '@client/app/preload'
import { cn } from '@client/utils/cn'

export interface LinkProps extends RACLinkProps {
  /** Should prefetch the page on hover? Default 'hover' */
  prefetch?: 'hover' | 'none'
}

/**
 * A primitive Link component that wraps React Aria Components' Link
 * and adds framework-specific logic for path localization and preloading.
 *
 * It uses the global navigation configuration from BoltdocsRouterProvider
 * to handle seamless client-side transitions.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const { href, prefetch = 'hover', onMouseEnter, onFocus, ...rest } = props

    const localizedHref = useLocalizedTo(href ?? '')
    const { preload } = usePreload()

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(e)
      if (
        prefetch === 'hover' &&
        typeof localizedHref === 'string' &&
        localizedHref.startsWith('/')
      ) {
        preload(localizedHref)
      }
    }

    const handleFocus = (e: React.FocusEvent) => {
      onFocus?.(e as any)
      if (
        prefetch === 'hover' &&
        typeof localizedHref === 'string' &&
        localizedHref.startsWith('/')
      ) {
        preload(localizedHref)
      }
    }

    return (
      <RACLink
        {...rest}
        ref={ref}
        href={localizedHref as string}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus as any}
      />
    )
  },
)
Link.displayName = 'Link'

/**
 * Props for the NavLink component, extending standard Link props.
 */
export interface NavLinkProps
  extends Omit<LinkProps, 'className' | 'children'> {
  /**
   * When true, the active state will only be applied if the paths match exactly.
   * Default is false.
   */
  end?: boolean
  /**
   * Provides access to the active state for conditional children rendering.
   */
  children?:
    | React.ReactNode
    | ((props: { isActive: boolean }) => React.ReactNode)
  /**
   * Provides access to the active state for conditional styling.
   */
  className?: string | ((props: { isActive: boolean }) => string)
}

/**
 * A primitive NavLink component that provides active state detection.
 *
 * It combines the Link primitive with path matching logic to determine
 * if the link is currently active based on the browser's location.
 */
export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (props, ref) => {
    const { href, end = false, className, children, ...rest } = props
    const location = useLocation()
    const localizedHref = useLocalizedTo(href ?? '')

    const isActive = end
      ? location.pathname === localizedHref
      : location.pathname.startsWith(localizedHref as string)

    const resolvedClassName =
      typeof className === 'function'
        ? className({ isActive })
        : cn(className, isActive && 'active')
    const resolvedChildren =
      typeof children === 'function' ? children({ isActive }) : children

    return (
      <Link
        {...rest}
        ref={ref}
        href={href}
        className={resolvedClassName as any}
      >
        {resolvedChildren as any}
      </Link>
    )
  },
)
NavLink.displayName = 'NavLink'
