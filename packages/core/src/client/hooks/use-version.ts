import { useNavigate } from 'react-router-dom'
import { getBaseFilePath } from '@client/utils/get-base-file-path'
import { useRoutes } from './use-routes'

export interface VersionOption {
  key: string
  label: string
  value: string
  isCurrent: boolean
}

export interface UseVersionReturn {
  currentVersion: string | undefined
  currentVersionLabel: string | undefined
  availableVersions: VersionOption[]
  handleVersionChange: (version: string) => void
}

/**
 * Hook to manage and switch between different versions of the documentation.
 */
export function useVersion(): UseVersionReturn {
  const navigate = useNavigate()
  const routeContext = useRoutes()
  const { allRoutes, currentRoute, currentVersion, currentLocale, config } =
    routeContext
  const versions = config.versions

  const handleVersionChange = (version: string) => {
    if (!versions || version === currentVersion) return

    let targetPath = `/docs/${version}`

    if (currentRoute) {
      const baseFile = getBaseFilePath(
        currentRoute.filePath,
        currentRoute.version,
        currentRoute.locale,
      )

      const targetRoute = allRoutes.find(
        (r) =>
          getBaseFilePath(r.filePath, r.version, r.locale) === baseFile &&
          (r.version || versions.defaultVersion) === version &&
          (currentLocale ? r.locale === currentLocale : !r.locale),
      )

      if (targetRoute) {
        targetPath = targetRoute.path
      } else {
        const versionIndexRoute = allRoutes.find(
          (r) =>
            getBaseFilePath(r.filePath, r.version, r.locale) === 'index.md' &&
            (r.version || versions.defaultVersion) === version &&
            (currentLocale ? r.locale === currentLocale : !r.locale),
        )
        targetPath = versionIndexRoute
          ? versionIndexRoute.path
          : `/docs/${version}${currentLocale ? `/${currentLocale}` : ''}`
      }
    }

    navigate(targetPath)
  }

  const availableVersions = routeContext.availableVersions.map((v) => ({
    ...v,
    label: v.label as string,
    value: v.key,
  }))

  return {
    currentVersion,
    currentVersionLabel: routeContext.currentVersionLabel,
    availableVersions,
    handleVersionChange,
  }
}
