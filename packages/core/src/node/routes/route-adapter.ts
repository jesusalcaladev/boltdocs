import type { RouteMeta } from './types'

/**
 * Serializable route data for the client-side @bdocs/ssg loader.
 * This maps closely to ComponentRoute in the client types.
 */
export interface SSGRouteData {
  path: string
  filePath: string
  title: string
  description?: string
  sidebarPosition?: number
  badge?: string | { text: string; expires?: string }
  icon?: string
  headings: Array<{ level: number; text: string; id: string }>
  _content: string
  locale?: string
  version?: string
  tab?: string
  group?: string
  groupTitle?: string
  groupPosition?: number
  groupIcon?: string
  subRouteGroup?: string
}

/**
 * Adapter layer between Boltdocs route parser and @bdocs/ssg.
 *
 * Transforms internal RouteMeta objects into the serializable format
 * expected by the client-side createRoutes() helper.
 */
export function adaptRoutesForSSG(routes: RouteMeta[]): SSGRouteData[] {
  return routes.map((route) => ({
    path: route.path,
    filePath: route.filePath,
    title: route.title,
    description: route.description || '',
    sidebarPosition: route.sidebarPosition,
    badge: route.badge,
    icon: route.icon,
    headings: route.headings || [],
    _content: route._content || '',
    locale: route.locale,
    version: route.version,
    tab: route.tab,
    group: route.group,
    groupTitle: route.groupTitle,
    groupPosition: route.groupPosition,
    groupIcon: route.groupIcon,
    subRouteGroup: route.subRouteGroup,
  }))
}
