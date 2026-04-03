import { useNavigate } from 'react-router-dom'
import { getBaseFilePath } from '@client/utils/get-base-file-path'
import { useRoutes } from './use-routes'
import { useBoltdocsStore } from '../store/use-boltdocs-store'

export interface LocaleOption {
  key: string
  label: string
  value: string
  isCurrent: boolean
}

export interface UseI18nReturn {
  currentLocale: string | undefined
  currentLocaleLabel: string | undefined
  availableLocales: LocaleOption[]
  handleLocaleChange: (locale: string) => void
}

/**
 * Hook to manage and switch between different locales (languages) of the documentation.
 */
export function useI18n(): UseI18nReturn {
  const navigate = useNavigate()
  const routeContext = useRoutes()
  const { allRoutes, currentRoute, currentLocale, config } = routeContext
  const i18n = config.i18n
  const setLocale = useBoltdocsStore((s) => s.setLocale)

  const handleLocaleChange = (locale: string) => {
    if (!i18n || locale === currentLocale) return

    // Update store
    setLocale(locale)

    let targetPath = '/'

    if (currentRoute) {
      const baseFile = getBaseFilePath(
        currentRoute.filePath,
        currentRoute.version,
        currentRoute.locale,
      )
      const targetRoute = allRoutes.find(
        (r) =>
          getBaseFilePath(r.filePath, r.version, r.locale) === baseFile &&
          (r.locale || i18n.defaultLocale) === locale &&
          r.version === currentRoute.version,
      )

      if (targetRoute) {
        targetPath = targetRoute.path
      } else {
        const defaultIndexRoute = allRoutes.find(
          (r) =>
            getBaseFilePath(r.filePath, r.version, r.locale) === 'index.md' &&
            (r.locale || i18n.defaultLocale) === locale &&
            r.version === currentRoute.version,
        )
        targetPath = defaultIndexRoute
          ? defaultIndexRoute.path
          : locale === i18n.defaultLocale
            ? currentRoute.version
              ? `/${currentRoute.version}`
              : '/'
            : currentRoute.version
              ? `/${currentRoute.version}/${locale}`
              : `/${locale}`
      }
    } else {
      // Fallback for when we don't have a current route (e.g. 404 page)
      // Try to find the root documentation page for the target locale
      const targetRoute = allRoutes.find(
        (r) =>
          (r.filePath === 'index.mdx' || r.filePath === 'index.md') &&
          (r.locale || i18n.defaultLocale) === locale &&
          !r.version, // Prefer non-versioned root
      )

      if (targetRoute) {
        targetPath = targetRoute.path
      } else {
        targetPath = locale === i18n.defaultLocale ? '/' : `/${locale}`
      }
    }

    navigate(targetPath)
  }

  const currentLocaleConfig =
    config.i18n?.localeConfigs?.[currentLocale as string]
  const currentLocaleLabel =
    currentLocaleConfig?.label ||
    config.i18n?.locales[currentLocale as string] ||
    currentLocale

  const availableLocales = config.i18n
    ? Object.entries(config.i18n.locales).map(([key, defaultLabel]) => {
        const localeConfig = config.i18n?.localeConfigs?.[key]
        return {
          key,
          label: localeConfig?.label || defaultLabel,
          value: key,
          isCurrent: key === currentLocale,
        }
      })
    : []

  return {
    currentLocale,
    currentLocaleLabel,
    availableLocales,
    handleLocaleChange,
  }
}
