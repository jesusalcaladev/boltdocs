import {
  Link as LinkPrimitive,
  type LinkProps as LinkPrimitiveProps,
} from '../primitives/link'
import { cn } from '../../utils/cn'

export type LinkProps = LinkPrimitiveProps & {
  to: string
  children?: React.ReactNode
}

/**
 * A premium Link component for Boltdocs that handles internal and external routing.
 */
export function Link({ to, children, className = '', ...props }: LinkProps) {
  const isExternal =
    to &&
    (to.startsWith('http://') ||
      to.startsWith('https://') ||
      to.startsWith('//'))

  const combinedClassName = cn(
    'text-blue-600 hover:text-blue-800 hover:underline cursor-pointer',
    className,
  )

  return (
    <LinkPrimitive
      href={to}
      className={combinedClassName}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </LinkPrimitive>
  )
}
