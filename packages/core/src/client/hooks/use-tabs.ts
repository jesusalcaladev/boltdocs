import { useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import type { ComponentRoute, BoltdocsTab } from '../types'

export function useTabs(
  tabs: BoltdocsTab[] = [],
  routes: ComponentRoute[] = [],
) {
  const location = useLocation()
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    opacity: 0,
    transform: 'translateX(0) scaleX(0)',
    width: 0,
  })

  const normalize = (p: string) =>
    p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p
  const currentPath = normalize(location.pathname)

  const activeRoute = routes.find((r) => normalize(r.path) === currentPath)
  const activeTabId = activeRoute?.tab?.toLowerCase()
  const activeIndex = tabs.findIndex(
    (tab) => tab.id.toLowerCase() === activeTabId,
  )
  const finalActiveIndex = activeIndex === -1 ? 0 : activeIndex

  // biome-ignore lint/correctness/useExhaustiveDependencies: Updated pointer to the tab
  useEffect(() => {
    const activeTab = tabRefs.current[finalActiveIndex]
    if (activeTab) {
      setIndicatorStyle({
        opacity: 1,
        width: activeTab.offsetWidth,
        transform: `translateX(${activeTab.offsetLeft}px)`,
      })
    }
  }, [finalActiveIndex, tabs.length, location.pathname])

  return {
    tabs,
    activeIndex: finalActiveIndex,
    indicatorStyle,
    tabRefs,
    activeTabId,
  }
}
