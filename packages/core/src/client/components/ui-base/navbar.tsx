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
import { ChevronDown } from 'lucide-react'
import { useConfig } from '@client/app/config-context'

const SearchDialog = lazy(() =>
  import('./search-dialog').then((m) => ({
    default: m.SearchDialog,
  })),
)

export function Navbar() {
  const { links, title, logo, logoProps, github, social, config } = useNavbar()
  const { routes, allRoutes, currentVersion, currentLocale } = useRoutes()
  const { pathname } = useLocation()
  const themeConfig = config.theme || config.themeConfig || {}

  const hasTabs = themeConfig?.tabs && themeConfig.tabs.length > 0

  return (
    <NavbarPrimitive.NavbarRoot className={hasTabs ? 'border-b-0' : ''}>
      <NavbarPrimitive.Content>
        <NavbarPrimitive.NavbarLeft>
          <NavbarPrimitive.NavbarLogo
            src={logo ?? ''}
            alt={logoProps?.alt || title}
            width={logoProps?.width ?? 24}
            height={logoProps?.height ?? 24}
          />
          <NavbarPrimitive.Title>{title}</NavbarPrimitive.Title>

          {config.versions && currentVersion && <NavbarVersion />}

          <NavbarPrimitive.Links>
            {links.map((link) => (
              <NavbarPrimitive.Link key={link.href} {...(link as any)} />
            ))}
          </NavbarPrimitive.Links>
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

      {pathname !== '/' && hasTabs && themeConfig?.tabs && (
        <div className="w-full border-b border-border-subtle bg-bg-main">
          <Tabs
            tabs={themeConfig.tabs}
            routes={allRoutes || routes || []}
          />
        </div>
      )}
    </NavbarPrimitive.NavbarRoot>
  )
}

function NavbarVersion() {
  const { currentVersionLabel, availableVersions, handleVersionChange } =
    useVersion()

  if (availableVersions.length === 0) return null

  return (
    <Menu.Trigger>
      <Button variant={'outline'} iconPosition="right" icon={<ChevronDown />}>
        {currentVersionLabel}
      </Button>
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
    </Menu.Trigger>
  )
}

function NavbarI18n() {
  const { currentLocaleLabel, availableLocales, handleLocaleChange } = useI18n()

  if (availableLocales.length === 0) return null

  return (
    <Menu.Trigger>
      <Button variant={'outline'} iconPosition="right" icon={<ChevronDown />}>
        {currentLocaleLabel}
      </Button>
      <Menu.Section items={availableLocales}>
        {(locale) => (
          <Menu.Item
            key={`${locale.value ?? ''}`}
            onPress={() => handleLocaleChange(locale.value)}
          >
            {locale.label as string}
          </Menu.Item>
        )}
      </Menu.Section>
    </Menu.Trigger>
  )
}
