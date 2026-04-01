import { useLocation } from 'react-router-dom'
import { useConfig } from '@client/app/config-context'
import { useTheme } from '@client/app/theme-context'
import type { NavbarLink } from '@client/types'

export function useNavbar() {
  const config = useConfig()
  const { theme } = useTheme()
  const location = useLocation()

  const themeConfig = config.theme || config.themeConfig || {}
  const title = themeConfig.title || 'Boltdocs'
  const rawLinks = themeConfig.navbar || []
  const socialLinks = themeConfig.socialLinks || []
  const githubRepo = themeConfig.githubRepo

  // Transform links to the new NavbarLink structure
  const links: NavbarLink[] = rawLinks.map((item: any) => {
    const href = item.href || item.to || item.link || ''
    return {
      label: item.label || item.text || '',
      href,
      active: location.pathname === href,
      to:
        href.startsWith('http') || href.startsWith('//')
          ? 'external'
          : undefined,
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
