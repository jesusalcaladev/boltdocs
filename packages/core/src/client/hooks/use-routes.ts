import { useLocation } from 'react-router-dom'
import { useConfig } from '@client/app/config-context'
import { usePreload } from '@client/app/preload'
import { useBoltdocsStore } from '../store/boltdocs-context'

/**
 * Hook to access the framework's routing state.
 * Returns both the complete set of routes and a filtered list based on the current
 * version and locale.
 */
export function useRoutes() {
  const { routes: allRoutes } = usePreload()
  const config = useConfig()
  const location = useLocation()

  // Use Zustand store for active state
  const currentLocaleStore = useBoltdocsStore((s) => s.currentLocale)
  const currentVersionStore = useBoltdocsStore((s) => s.currentVersion)
  const hasHydrated = useBoltdocsStore((s) => s.hasHydrated)

  // Find the current route matching the pathname
  const currentRoute = allRoutes.find((r) => r.path === location.pathname)

  // Derive current locale and version
  // Priority: URL (currentRoute) > Zustand Store (Persistence) > Config Default
  const currentLocale = config.i18n
    ? currentRoute?.locale ||
      (hasHydrated ? currentLocaleStore : undefined) ||
      config.i18n.defaultLocale
    : undefined

  const currentVersion = config.versions
    ? currentRoute?.version ||
      (hasHydrated ? currentVersionStore : undefined) ||
      config.versions.defaultVersion
    : undefined

  // Filter routes to those matching the current version and locale
  const routes = allRoutes.filter((r) => {
    const localeMatch = config.i18n
      ? (r.locale || config.i18n.defaultLocale) === currentLocale
      : true
    const versionMatch = config.versions
      ? (r.version || config.versions.defaultVersion) === currentVersion
      : true

    if (!(localeMatch && versionMatch)) return false

    // Resolve duplicate paths (aliases) like /docs vs /docs/en
    // We prefer the version that matches the current route's prefix style
    const i18n = config.i18n
    if (i18n) {
      const isCurrentRoutePrefixed = !!currentRoute?.locale
      const isRoutePrefixed = !!r.locale

      const hasAlternate = allRoutes.some(
        (alt) =>
          alt !== r &&
          alt.filePath === r.filePath &&
          alt.version === r.version &&
          (alt.locale || i18n.defaultLocale) ===
            (r.locale || i18n.defaultLocale),
      )

      if (hasAlternate && isCurrentRoutePrefixed !== isRoutePrefixed) {
        return false
      }
    }

    return true
  })

  // Labels and lists for UI convenience
  const currentLocaleConfig =
    config.i18n?.localeConfigs?.[currentLocale as string]
  const currentLocaleLabel =
    currentLocaleConfig?.label ||
    config.i18n?.locales[currentLocale as string] ||
    currentLocale

  const currentVersionConfig = config.versions?.versions.find(
    (v) => v.path === currentVersion,
  )
  const currentVersionLabel = currentVersionConfig?.label || currentVersion

  const availableLocales = config.i18n
    ? Object.entries(config.i18n.locales).map(([key, defaultLabel]) => {
        const localeConfig = config.i18n?.localeConfigs?.[key]
        return {
          key,
          label: localeConfig?.label || defaultLabel,
          isCurrent: key === currentLocale,
        }
      })
    : []

  const availableVersions = config.versions
    ? config.versions.versions.map((v) => ({
        key: v.path,
        label: v.label,
        isCurrent: v.path === currentVersion,
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
