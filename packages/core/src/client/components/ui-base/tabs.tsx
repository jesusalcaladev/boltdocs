import { useTabs as useTabsHook } from '@hooks/use-tabs'
import T from '@components/primitives/tabs'
import { Link } from '@components/primitives/link'
import type { BoltdocsTab, ComponentRoute } from '@client/types'
import * as Icons from 'lucide-react'
import { getTranslated } from '@client/utils/i18n'
import { useRoutes } from '@hooks/use-routes'

export function Tabs({
  tabs,
  routes,
}: {
  tabs: BoltdocsTab[]
  routes: ComponentRoute[]
}) {
  const { currentLocale } = useRoutes()
  const { indicatorStyle, tabRefs, activeIndex } = useTabsHook(tabs, routes)

  const renderTabIcon = (iconName?: string) => {
    if (!iconName) return null
    if (iconName.trim().startsWith('<svg')) {
      return (
        <span
          className="h-4 w-4"
          dangerouslySetInnerHTML={{ __html: iconName }}
        />
      )
    }
    const LucideIcon = (Icons as Record<string, any>)[iconName]
    if (LucideIcon) {
      return <LucideIcon size={16} />
    }
    return <img src={iconName} alt="" className="h-4 w-4 object-contain" />
  }

  return (
    <div className="mx-auto max-w-(--breakpoint-3xl) px-4 md:px-6">
      <T.TabsList className="border-none py-0">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex
          const firstRoute = routes.find(
            (r) => r.tab && r.tab.toLowerCase() === tab.id.toLowerCase(),
          )
          const linkTo = firstRoute ? firstRoute.path : '#'

          return (
            <Link
              key={tab.id}
              href={linkTo}
              ref={(el: HTMLAnchorElement | null) => {
                tabRefs.current[index] = el
              }}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors outline-none ${
                isActive
                  ? 'text-primary-500'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {renderTabIcon(tab.icon)}
              <span>{getTranslated(tab.text, currentLocale)}</span>
            </Link>
          )
        })}
        <T.TabsIndicator style={indicatorStyle} />
      </T.TabsList>
    </div>
  )
}
