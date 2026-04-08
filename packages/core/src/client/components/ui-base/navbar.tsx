import { Suspense, lazy } from 'react'
import { useNavbar } from '@hooks/use-navbar'
import { useVersion } from '@hooks/use-version'
import { useI18n } from '@hooks/use-i18n'
import { useRoutes } from '@hooks/use-routes'
import NavbarPrimitive from '@components/primitives/navbar'
import { ThemeToggle } from './theme-toggle'
import { GithubStars } from './github-stars'
import { Tabs } from './tabs'
import { useLocation } from 'react-router-dom'
import type { BoltdocsSocialLink } from '@node/config'
import Menu from '@components/primitives/menu'
import { Button } from '@components/primitives/button'
import { ChevronDown, Languages } from 'lucide-react'
import { useLocalizedTo } from '@hooks/use-localized-to'
import type { NavbarLink as NavbarLinkType } from '@client/types'

const SearchDialog = lazy(() =>
  import('./search-dialog').then((m) => ({
    default: m.SearchDialog,
  })),
)

export function Navbar() {
  const { links, title, logo, logoProps, github, social, config } = useNavbar()
  const { routes, allRoutes, currentVersion, currentLocale } = useRoutes()
  const { pathname } = useLocation()
  const themeConfig = config.theme || {}
  const isDocs = pathname.startsWith('/docs')
  const hasTabs = themeConfig?.tabs && themeConfig.tabs.length > 0

  return (
    <NavbarPrimitive.NavbarRoot className={hasTabs ? 'border-b-0' : ''}>
      <NavbarPrimitive.Content>
        <NavbarPrimitive.NavbarLeft>
          {logo && (
            <NavbarPrimitive.NavbarLogo
              src={logo}
              alt={logoProps?.alt || title}
              width={logoProps?.width ?? 24}
              height={logoProps?.height ?? 24}
            />
          )}
          <NavbarPrimitive.Title>{title}</NavbarPrimitive.Title>

          {config.versions && currentVersion && <NavbarVersion />}
        </NavbarPrimitive.NavbarLeft>
        <NavbarPrimitive.NavbarCenter>
          <Suspense
            fallback={
              <div className="h-9 w-32 animate-pulse rounded-md bg-bg-surface" />
            }
          >
            <SearchDialog routes={routes || []} />
          </Suspense>
        </NavbarPrimitive.NavbarCenter>
        <NavbarPrimitive.NavbarRight>
          <NavbarPrimitive.Links>
            {links.map((link) => (
              <>
                <NavbarLinkItem key={link.href} link={link} />
              </>
            ))}
          </NavbarPrimitive.Links>
          {config.i18n && currentLocale && <NavbarI18n />}
          <NavbarPrimitive.Split />
          <ThemeToggle />
          {github && <GithubStars repo={themeConfig?.githubRepo ?? ''} />}
          {social.length > 0 && <NavbarPrimitive.Split />}
          <div className="flex items-center gap-1">
            {social.map(({ icon, link }: BoltdocsSocialLink) => (
              <NavbarPrimitive.Socials
                key={link}
                icon={icon}
                link={link}
                className="p-1.5"
              />
            ))}
          </div>
        </NavbarPrimitive.NavbarRight>
      </NavbarPrimitive.Content>

      {isDocs && hasTabs && themeConfig?.tabs && (
        <div className="w-full border-b border-border-subtle bg-bg-main">
          <Tabs tabs={themeConfig.tabs} routes={allRoutes || routes || []} />
        </div>
      )}
    </NavbarPrimitive.NavbarRoot>
  )
}

function NavbarLinkItem({ link }: { link: NavbarLinkType }) {
  const localizedHref = useLocalizedTo(link.href || '')
  return <NavbarPrimitive.Link {...(link as any)} href={localizedHref} />
}

function NavbarVersion() {
  const { currentVersionLabel, availableVersions, handleVersionChange } =
    useVersion()

  if (availableVersions.length === 0) return null

  return (
    <Menu.Trigger>
      <Button
        variant={'outline'}
        size="sm"
        rounded="lg"
        iconPosition="right"
        icon={<ChevronDown className="w-3.5 h-3.5 text-text-muted/60" />}
        className="h-8 border-border-subtle/60 bg-bg-surface/30 backdrop-blur-sm transition-all duration-200 hover:border-primary-500/50 hover:bg-primary-500/5"
      >
        <span className="font-semibold text-[0.8125rem]">
          {currentVersionLabel}
        </span>
      </Button>
      <Menu.Root>
        <Menu.Section items={availableVersions}>
          {(version) => (
            <Menu.Item
              key={`${version.value ?? ''}`}
              onPress={() => handleVersionChange(version.value)}
            >
              {version.label as string}
            </Menu.Item>
          )}
        </Menu.Section>
      </Menu.Root>
    </Menu.Trigger>
  )
}

function NavbarI18n() {
  const { currentLocale, availableLocales, handleLocaleChange } = useI18n()

  if (availableLocales.length === 0) return null

  return (
    <Menu.Trigger>
      <Button
        variant={'outline'}
        size="sm"
        rounded="lg"
        iconPosition="right"
        icon={<ChevronDown className="w-3.5 h-3.5 text-text-muted/60" />}
        className="h-8 border-border-subtle/60 bg-bg-surface/30 backdrop-blur-sm transition-all duration-200 hover:border-primary-500/50 hover:bg-primary-500/5 px-2.5"
      >
        <div className="flex items-center gap-1.5">
          <Languages className="w-3.5 h-3.5 text-primary-500" />
          <span className="font-bold text-[0.75rem] tracking-wider uppercase opacity-90">
            {currentLocale || 'en'}
          </span>
        </div>
      </Button>
      <Menu.Root>
        <Menu.Section items={availableLocales}>
          {(locale) => (
            <Menu.Item
              key={`${locale.value ?? ''}`}
              onPress={() => handleLocaleChange(locale.value)}
            >
              <div className="flex items-center justify-between w-full gap-4">
                <span>{locale.label as string}</span>
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                  {locale.value}
                </span>
              </div>
            </Menu.Item>
          )}
        </Menu.Section>
      </Menu.Root>
    </Menu.Trigger>
  )
}
