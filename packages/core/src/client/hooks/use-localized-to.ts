import { useLocation } from 'react-router-dom'
import { useConfig } from '@client/app/config-context'
import type { LinkProps as RouterLinkProps } from 'react-router-dom'

/**
 * Hook to automatically localize a path based on the current version and locale context.
 * It ensures that navigation within the /docs path preserves the active version and language.
 */
export function useLocalizedTo(to: RouterLinkProps['to']) {
  const location = useLocation()
  const config = useConfig()

  if (!config || typeof to !== 'string') return to
  if (!config.i18n && !config.versions) return to

  const basePath = '/docs'
  if (!to.startsWith(basePath)) return to

  // 1. Detect current context from location
  const curSub = location.pathname.substring(basePath.length)
  const curParts = curSub.split('/').filter(Boolean)

  let currentVersion = config.versions?.defaultVersion
  let currentLocale = config.i18n?.defaultLocale

  let cIdx = 0
  if (config.versions && curParts.length > cIdx) {
    const versionMatch = config.versions.versions.find(
      (v) => v.path === curParts[cIdx],
    )
    if (versionMatch) {
      currentVersion = versionMatch.path
      cIdx++
    }
  }

  if (
    config.i18n &&
    curParts.length > cIdx &&
    config.i18n.locales[curParts[cIdx]]
  ) {
    currentLocale = curParts[cIdx]
    cIdx++
  }

  // 2. Parse the target `to` path
  const toSub = to.substring(basePath.length)
  const toParts = toSub.split('/').filter(Boolean)

  let tIdx = 0
  let hasVersion = false
  let hasLocale = false

  if (config.versions && toParts.length > tIdx) {
    const versionMatch = config.versions.versions.find(
      (v) => v.path === toParts[tIdx],
    )
    if (versionMatch) {
      hasVersion = true
      tIdx++
    }
  }

  if (
    config.i18n &&
    toParts.length > tIdx &&
    config.i18n.locales[toParts[tIdx]]
  ) {
    hasLocale = true
    tIdx++
  }

  // Extract just the actual route parts
  const routeParts = toParts.slice(tIdx)

  // Reconstruct path
  const finalParts = []
  if (config.versions) {
    if (hasVersion) {
      finalParts.push(toParts[0])
    } else if (currentVersion) {
      finalParts.push(currentVersion)
    }
  }
  if (config.i18n) {
    if (hasLocale) {
      finalParts.push(toParts[hasVersion ? 1 : 0])
    } else if (currentLocale) {
      finalParts.push(currentLocale)
    }
  }

  finalParts.push(...routeParts)

  let finalPath = `${basePath}/${finalParts.join('/')}`
  if (finalPath.endsWith('/')) {
    finalPath = finalPath.slice(0, -1)
  }
  return finalPath === basePath ? basePath : finalPath
}
