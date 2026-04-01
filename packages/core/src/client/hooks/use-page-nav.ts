import { useRoutes } from './use-routes'

/**
 * Hook to manage the previous and next button functionality for documentation pages.
 */
export function usePageNav() {
  const { routes } = useRoutes()
  const currentPath = window.location.pathname

  const currentIndex = routes.findIndex((r) => r.path === currentPath)
  const currentRoute = routes[currentIndex]

  const prevPage = currentIndex > 0 ? routes[currentIndex - 1] : null
  const nextPage =
    currentIndex < routes.length - 1 ? routes[currentIndex + 1] : null

  return {
    prevPage,
    nextPage,
    currentRoute,
  }
}
