import { useLocation } from 'react-router-dom'
import { useConfig } from '@client/app/config-context'
import { usePreload } from '@client/app/preload'

/**
 * Hook to access the framework's routing state.
 * Returns both the complete set of routes and a filtered list based on the current
 * version and locale.
 */
export function useRoutes() {
  const { routes: allRoutes } = usePreload()
  const config = useConfig()
  const location = useLocation()

  // Find the current route exactly matching the pathname
  const currentRoute = allRoutes.find((r) => r.path === location.pathname)

  // Derive current locale and version from the route or defaults
  const currentLocale = config.i18n
    ? currentRoute?.locale || config.i18n.defaultLocale
    : undefined

  const currentVersion = config.versions
    ? currentRoute?.version || config.versions.defaultVersion
    : undefined

  // Filter routes to those matching the current version and locale
  const routes = allRoutes.filter((r) => {
    const localeMatch = config.i18n
      ? (r.locale || config.i18n.defaultLocale) === currentLocale
      : true
    const versionMatch = config.versions
      ? (r.version || config.versions.defaultVersion) === currentVersion
      : true
    return localeMatch && versionMatch
  })

  // Labels and lists for UI convenience
  const currentLocaleLabel =
    config.i18n?.locales[currentLocale as string] || currentLocale
  const currentVersionLabel =
    config.versions?.versions[currentVersion as string] || currentVersion

  const availableLocales = config.i18n
    ? Object.entries(config.i18n.locales).map(([key, label]) => ({
        key,
        label,
        isCurrent: key === currentLocale,
      }))
    : []

  const availableVersions = config.versions
    ? Object.entries(config.versions.versions).map(([key, label]) => ({
        key,
        label,
        isCurrent: key === currentVersion,
      }))
    : []

  return {
    routes,
    allRoutes,
    currentRoute,
    currentLocale,
    currentLocaleLabel,
    availableLocales,
    currentVersion,
    currentVersionLabel,
    availableVersions,
    config,
  }
}
