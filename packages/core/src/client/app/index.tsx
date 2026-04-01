import React, { useEffect, useState, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NotFound } from '@components/ui-base/not-found'
import { Loading } from '@components/ui-base/loading'
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
  modules: Record<string, () => Promise<{ default: React.ComponentType<any> }>>
  hot?: CreateBoltdocsAppOptions['hot']
  homePage?: React.ComponentType
  externalPages?: Record<string, React.ComponentType>
  components?: Record<string, React.ComponentType>
}) {
  const [routesInfo, setRoutesInfo] = useState<ComponentRoute[]>(initialRoutes)
  const [config] = useState(initialConfig)
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
            k.endsWith(`/${docsDirName}\\${route.filePath.replace(/\\/g, '/')}`), // Windows fallback
        )
        const loader = loaderKey ? modules[loaderKey] : null

        return {
          ...route,
          Component: React.lazy<React.ComponentType<any>>(async () => {
            if (!loader) return { default: NotFound as React.ComponentType<any> }
            const mod = await loader()
            return mod
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
    }
  }, [hot])

  const allComponents = useMemo(
    () => ({ ...mdxComponentsDefault, ...customComponents }),
    [customComponents],
  )

  return (
    <ThemeProvider>
      <MdxComponentsProvider components={allComponents}>
        <ConfigContext.Provider value={config}>
          <BoltdocsRouterProvider>
            <PreloadProvider routes={routesInfo} modules={modules}>
              <ScrollHandler />
              <Routes>
                {/* Custom home page with user layout */}
                {HomePage && (
                  <Route
                    path="/"
                    element={
                      <UserLayout>
                        <HomePage />
                      </UserLayout>
                    }
                  />
                )}

                {/* Custom External Pages with user layout */}
                {Object.entries(computedExternalPages).map(
                  ([extPath, ExtComponent]) => (
                    <Route
                      key={extPath}
                      path={extPath}
                      element={
                        <UserLayout>
                          <ExtComponent />
                        </UserLayout>
                      }
                    />
                  ),
                )}

                <Route key="docs-layout" element={<DocsLayout />}>
                  {resolvedRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path === '' ? '/' : route.path}
                      element={
                        <React.Suspense fallback={<Loading />}>
                          <MdxPage Component={route.Component} />
                        </React.Suspense>
                      }
                    />
                  ))}
                </Route>

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
