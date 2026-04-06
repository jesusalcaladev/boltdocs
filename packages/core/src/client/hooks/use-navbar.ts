import { useLocation } from 'react-router-dom'
import { useConfig } from '@client/app/config-context'
import { useTheme } from '@client/app/theme-context'
import type { NavbarLink } from '@client/types'
import { getTranslated } from '@client/utils/i18n'
import { useRoutes } from './use-routes'

export function useNavbar() {
  const config = useConfig()
  const { theme } = useTheme()
  const location = useLocation()
  const { currentLocale } = useRoutes()

  const themeConfig = config.theme || {}
  const title = getTranslated(themeConfig.title, currentLocale) || 'Boltdocs'
  const rawLinks = themeConfig.navbar || []
  const socialLinks = themeConfig.socialLinks || []
  const githubRepo = themeConfig.githubRepo

  // Transform links to the new NavbarLink structure
  const links: NavbarLink[] = rawLinks.map((item: any) => {
    const href = (item.href || item.to || item.link || '') as string

    // Robust active state calculation
    const getIsActive = (h: string) => {
      if (location.pathname === h) return true
      if (!h || h === '/') return location.pathname === '/'

      const cleanPath = (p: string) => p.split('/').filter(Boolean)
      const hParts = cleanPath(h)
      const pParts = cleanPath(location.pathname)

      const getBaseSegment = (parts: string[]) => {
        let i = 0
        // Skip locale
        if (config.i18n?.locales && parts[i] && config.i18n.locales[parts[i]]) {
          i++
        }
        // Skip version
        if (config.versions?.versions && parts[i]) {
          if (config.versions.versions.some((v) => v.path === parts[i])) {
            i++
          }
        }
        return parts[i]
      }

      const hBase = getBaseSegment(hParts)
      const pBase = getBaseSegment(pParts)

      return hBase != null && hBase === pBase
    }

    return {
      label: getTranslated(item.label || item.text, currentLocale),
      href,
      active: getIsActive(href),
      to:
        href.startsWith('http') || href.startsWith('//')
          ? 'external'
          : undefined,
      items: (item.items as any[])?.map((sub: any) => {
        const subHref = (sub.href || sub.link || sub.to || '') as string
        return {
          label: getTranslated(sub.label || sub.text, currentLocale),
          href: subHref,
          active: getIsActive(subHref),
          to:
            subHref.startsWith('http') || subHref.startsWith('//')
              ? 'external'
              : undefined,
        }
      }),
    }
  })

  const logo = themeConfig.logo
  const logoSrc = !logo
    ? null
    : typeof logo === 'string'
      ? logo
      : theme === 'dark'
        ? (logo as any).dark
        : (logo as any).light

  const logoProps = {
    alt:
      (logo && typeof logo === 'object' ? (logo as any).alt : undefined) ||
      title,
    width: logo && typeof logo === 'object' ? (logo as any).width : undefined,
    height: logo && typeof logo === 'object' ? (logo as any).height : undefined,
  }

  const github = githubRepo ? `https://github.com/${githubRepo}` : null

  return {
    links,
    title,
    logo: logoSrc,
    logoProps,
    github,
    social: socialLinks,
    config,
    theme,
  }
}
