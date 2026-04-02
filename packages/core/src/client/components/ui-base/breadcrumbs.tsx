import { useBreadcrumbs } from '@hooks/use-breadcrumbs'
import { Home } from 'lucide-react'
import {
  BreadcrumbsItem,
  BreadcrumbsLink,
  BreadcrumbsRoot,
  BreadcrumbsSeparator,
} from '@components/primitives/breadcrumbs'
import { cn } from '@client/utils/cn'
import { useConfig } from '@client/app/config-context'

export function Breadcrumbs() {
  const { crumbs, activeRoute } = useBreadcrumbs()
  const config = useConfig()
  const themeConfig = config.theme || {}

  if (crumbs.length === 0) return null

  if (!themeConfig?.breadcrumbs) return null

  return (
    <BreadcrumbsRoot>
      <BreadcrumbsItem>
        <BreadcrumbsLink href="/">
          <Home size={14} />
        </BreadcrumbsLink>
      </BreadcrumbsItem>
      {crumbs.map((crumb, i) => (
        <BreadcrumbsItem key={`crumb-${crumb.href}-${crumb.label}-${i}`}>
          <BreadcrumbsSeparator />
          <BreadcrumbsLink
            href={crumb.href}
            className={cn({
              'font-medium text-text-main': crumb.href === activeRoute?.path,
            })}
          >
            {crumb.label}
          </BreadcrumbsLink>
        </BreadcrumbsItem>
      ))}
    </BreadcrumbsRoot>
  )
}
