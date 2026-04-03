import React, { useEffect, useState, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NotFound } from '@components/ui-base/not-found'
import { ThemeProvider } from './theme-context'
import type { ComponentRoute, CreateBoltdocsAppOptions } from '../types'
import type { BoltdocsConfig } from '@node/config'

import UserLayout from 'virtual:boltdocs-layout'

import { PreloadProvider } from './preload'
import { BoltdocsRouterProvider } from './router'
import { ConfigContext } from './config-context'
import { ScrollHandler } from './scroll-handler'
import { DocsLayout } from './docs-layout'
import { MdxPage } from './mdx-page'
import { MdxComponentsProvider } from './mdx-components-context'
import { mdxComponentsDefault } from './mdx-component'
import { useRoutes } from '../hooks/use-routes'
import { useLocation } from 'react-router-dom'
import { useBoltdocsStore } from '../store/use-boltdocs-store'

/**
 * Updates the HTML lang and dir attributes based on the current locale configuration.
 */
function I18nUpdater() {
  const { currentLocale, config } = useRoutes()

  useEffect(() => {
    if (!config.i18n) return
    const localeConfig = config.i18n.localeConfigs?.[currentLocale as string]
    document.documentElement.lang =
      localeConfig?.htmlLang || currentLocale || 'en'
    document.documentElement.dir = localeConfig?.direction || 'ltr'
  }, [currentLocale, config.i18n])

  return null
}

/**
 * Synchronizes the Zustand store with the current URL pathname.
 */
function StoreSync() {
  const location = useLocation()
  const { config } = useRoutes()
  const setLocale = useBoltdocsStore((s) => s.setLocale)
  const setVersion = useBoltdocsStore((s) => s.setVersion)
  const currentLocaleStore = useBoltdocsStore((s) => s.currentLocale)
  const currentVersionStore = useBoltdocsStore((s) => s.currentVersion)

  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    let cIdx = 0
    let detectedVersion = config.versions?.defaultVersion
    let detectedLocale = config.i18n?.defaultLocale

    // 0. Skip docs prefix if present
    if (parts[cIdx] === 'docs') cIdx++

    // 1. Version detection
    if (config.versions && parts.length > cIdx) {
      const versionMatch = config.versions.versions.find(
        (v) => v.path === parts[cIdx],
      )
      if (versionMatch) {
        detectedVersion = versionMatch.path
        cIdx++
      }
    }

    // 2. Locale detection
    if (
      config.i18n &&
      parts.length > cIdx &&
      config.i18n.locales[parts[cIdx]]
    ) {
      detectedLocale = parts[cIdx]
    } else if (config.i18n && parts.length === 0) {
      // On root, use the stored preference if it exists, otherwise default
      detectedLocale = currentLocaleStore || config.i18n.defaultLocale
    }

    // Only update if changed to avoid loops
    if (detectedLocale !== currentLocaleStore) setLocale(detectedLocale)
    if (detectedVersion !== currentVersionStore) setVersion(detectedVersion)
  }, [
    location.pathname,
    config,
    setLocale,
    setVersion,
    currentLocaleStore,
    currentVersionStore,
  ])

  return null
}

export function AppShell({
  initialRoutes,
  initialConfig,
  docsDirName,
  modules,
  hot,
  homePage: HomePage,
  externalPages,
  components: customComponents = {},
}: {
  initialRoutes: ComponentRoute[]
  initialConfig: BoltdocsConfig
  docsDirName: string
  modules: Record<
    string,
    () => Promise<{ default: React.ComponentType<unknown> }>
  >
  hot?: CreateBoltdocsAppOptions['hot']
  homePage?: React.ComponentType
  externalPages?: Record<string, React.ComponentType>
  components?: Record<string, React.ComponentType>
}) {
  const [routesInfo, setRoutesInfo] = useState<ComponentRoute[]>(initialRoutes)
  const [config, setConfig] = useState(initialConfig)
  const computedExternalPages = externalPages || {}

  const resolvedRoutes = useMemo(() => {
    return routesInfo
      .filter(
        (route) =>
          !(HomePage && (route.path === '/' || route.path === '')) &&
          !computedExternalPages[route.path === '' ? '/' : route.path],
      )
      .map((route) => {
        const loaderKey = Object.keys(modules).find(
          (k) =>
            k === `/${docsDirName}/${route.filePath}` || // Vite dev/build relative path
            k.endsWith(`/${docsDirName}/${route.filePath}`) || // SSG absolute path fallback
            k.endsWith(
              `/${docsDirName}\\${route.filePath.replace(/\\/g, '/')}`,
            ), // Windows fallback
        )
        const loader = loaderKey ? modules[loaderKey] : null

        return {
          ...route,
          Component: React.lazy<React.ComponentType<unknown>>(async () => {
            if (!loader)
              return { default: NotFound as React.ComponentType<unknown> }
            const mod = await loader()
            return mod as { default: React.ComponentType<unknown> }
          }),
        }
      })
  }, [routesInfo, modules, docsDirName, HomePage, computedExternalPages])

  // Subscribe to HMR events
  useEffect(() => {
    if (hot) {
      hot.on('boltdocs:routes-update', (newRoutes: ComponentRoute[]) => {
        setRoutesInfo(newRoutes)
      })
      hot.on('boltdocs:config-update', (newConfig: BoltdocsConfig) => {
        setConfig(newConfig)
      })
    }
  }, [hot])

  const allComponents = useMemo(
    () => ({ ...mdxComponentsDefault, ...customComponents }),
    [customComponents],
  )

  const LoadingFallback = allComponents.Loading as React.ComponentType

  return (
    <ThemeProvider>
      <MdxComponentsProvider components={allComponents}>
        <ConfigContext.Provider value={config}>
          <BoltdocsRouterProvider>
            <PreloadProvider routes={routesInfo} modules={modules}>
              <ScrollHandler />
              <StoreSync />
              <I18nUpdater />
              <Routes>
                <Route key="docs-layout" element={<DocsLayout />}>
                  {resolvedRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path === '' ? '/' : route.path}
                      element={
                        <React.Suspense fallback={<LoadingFallback />}>
                          <MdxPage Component={route.Component} />
                        </React.Suspense>
                      }
                    />
                  ))}
                </Route>

                {/* Custom home page with user layout */}
                {HomePage && (
                  <>
                    <Route
                      path="/"
                      element={
                        <UserLayout>
                          <HomePage />
                        </UserLayout>
                      }
                    />
                    {config.i18n &&
                      Object.keys(config.i18n.locales).map((locale) => (
                        <Route
                          key={`home-${locale}`}
                          path={`/${locale}`}
                          element={
                            <UserLayout>
                              <HomePage />
                            </UserLayout>
                          }
                        />
                      ))}
                  </>
                )}

                {/* Custom External Pages with user layout */}
                {Object.entries(computedExternalPages).map(
                  ([extPath, ExtComponent]) => {
                    const cleanPath = extPath === '/' ? '' : extPath
                    return (
                      <React.Fragment key={extPath}>
                        <Route
                          path={extPath}
                          element={
                            <UserLayout>
                              <ExtComponent />
                            </UserLayout>
                          }
                        />
                        {config.i18n &&
                          Object.keys(config.i18n.locales).map((locale) => (
                            <Route
                              key={`${extPath}-${locale}`}
                              path={`/${locale}${cleanPath}`}
                              element={
                                <UserLayout>
                                  <ExtComponent />
                                </UserLayout>
                              }
                            />
                          ))}
                      </React.Fragment>
                    )
                  },
                )}

                <Route
                  path="*"
                  element={
                    <UserLayout>
                      <NotFound />
                    </UserLayout>
                  }
                />
              </Routes>
            </PreloadProvider>
          </BoltdocsRouterProvider>
        </ConfigContext.Provider>
      </MdxComponentsProvider>
    </ThemeProvider>
  )
}

/**
 * Creates and mounts the Boltdocs documentation app.
 *
 * Usage:
 * ```tsx
 * import { createBoltdocsApp } from 'boltdocs/client'
 * import routes from 'virtual:boltdocs-routes'
 * import config from 'virtual:boltdocs-config'
 * import 'boltdocs/style.css'
 * import HomePage from './HomePage'
 *
 * createBoltdocsApp({
 *   target: '#root',
 *   routes,
 *   config,
 *   modules: import.meta.glob('/docs/**\/*.{md,mdx}'),
 *   hot: import.meta.hot,
 *   homePage: HomePage,
 * })
 * ```
 */
export function createBoltdocsApp(options: CreateBoltdocsAppOptions) {
  const {
    target,
    routes,
    docsDirName,
    config,
    modules,
    hot,
    homePage,
    externalPages,
    components,
  } = options
  const container = document.querySelector(target)
  if (!container) {
    throw new Error(
      `[boltdocs] Mount target "${target}" not found in document.`,
    )
  }

  const app = (
    <React.StrictMode>
      <BrowserRouter>
        <AppShell
          initialRoutes={routes}
          initialConfig={config}
          docsDirName={docsDirName}
          modules={modules}
          hot={hot}
          homePage={homePage}
          externalPages={externalPages}
          components={components}
        />
      </BrowserRouter>
    </React.StrictMode>
  )

  // SSG pre-renders a shell with mock components for SEO crawlers.
  // We always use createRoot because the SSG output doesn't match the
  // real client-side component tree (components are lazy/dynamic).
  // Clear any SSG placeholder content before mounting.
  container.innerHTML = ''
  ReactDOM.createRoot(container as HTMLElement).render(app)
}
