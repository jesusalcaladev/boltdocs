import { useNavigate } from 'react-router-dom'
import { getBaseFilePath } from '@client/utils/get-base-file-path'
import { useRoutes } from './use-routes'

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

  const handleLocaleChange = (locale: string) => {
    if (!i18n || locale === currentLocale) return

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
      targetPath = locale === i18n.defaultLocale ? '/' : `/${locale}`
    }

    navigate(targetPath)
  }

  const availableLocales = routeContext.availableLocales.map((l) => ({
    ...l,
    label: l.label as string,
    value: l.key,
  }))

  return {
    currentLocale,
    currentLocaleLabel: routeContext.currentLocaleLabel,
    availableLocales,
    handleLocaleChange,
  }
}
