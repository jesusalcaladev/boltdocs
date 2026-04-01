import type { RouteMeta } from './types'

/**
 * Sorts an array of generated routes.
 * Ungrouped items come first. Items within the same group are sorted by position, then alphabetically.
 * Groups are sorted relative to each other by their group position, then alphabetically.
 *
 * @param routes - The unsorted routes
 * @returns A new array of sorted routes suitable for sidebar generation
 */
export function sortRoutes(routes: RouteMeta[]): RouteMeta[] {
  return routes.sort((a, b) => {
    // Ungrouped first
    if (!a.group && !b.group) return compareByPosition(a, b)
    if (!a.group) return -1
    if (!b.group) return 1

    // Different groups: sort by group position
    if (a.group !== b.group) {
      return compareByGroupPosition(a, b)
    }

    // Same group: sort by item position
    return compareByPosition(a, b)
  })
}

function compareByPosition(a: RouteMeta, b: RouteMeta): number {
  if (a.sidebarPosition !== undefined && b.sidebarPosition !== undefined)
    return a.sidebarPosition - b.sidebarPosition
  if (a.sidebarPosition !== undefined) return -1
  if (b.sidebarPosition !== undefined) return 1
  return a.title.localeCompare(b.title)
}

function compareByGroupPosition(a: RouteMeta, b: RouteMeta): number {
  if (a.groupPosition !== undefined && b.groupPosition !== undefined)
    return a.groupPosition - b.groupPosition
  if (a.groupPosition !== undefined) return -1
  if (b.groupPosition !== undefined) return 1
  return (a.groupTitle || a.group!).localeCompare(b.groupTitle || b.group!)
}
