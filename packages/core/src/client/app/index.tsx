import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import { ThemeLayout } from "../theme/ui/Layout";
import { NotFound } from "../theme/ui/NotFound";
import { Loading } from "../theme/ui/Loading";
import { MDXProvider } from "@mdx-js/react";
import { ThemeProvider } from "../theme/ThemeContext";
import { ComponentRoute, CreateBoltdocsAppOptions } from "../types";
import { createContext, useContext, useLayoutEffect } from "react";
import { mdxComponentsDefault } from "./mdx-component";

export const ConfigContext = createContext<any>(null);

export function useConfig() {
  return useContext(ConfigContext);
}
import { PreloadProvider } from "./preload";

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
  initialRoutes: ComponentRoute[];
  initialConfig: any;
  docsDirName: string;
  modules: Record<string, () => Promise<any>>;
  hot?: any;
  homePage?: React.ComponentType;
  externalPages?: Record<string, React.ComponentType<any>>;
  components?: Record<string, React.ComponentType<any>>;
}) {
  const [routesInfo, setRoutesInfo] = useState<ComponentRoute[]>(initialRoutes);
  const [config] = useState(initialConfig);
  const computedExternalPages = externalPages || {};

  const resolveRoutes = (infos: ComponentRoute[]) => {
    return infos
      .filter(
        (route) =>
          !(HomePage && (route.path === "/" || route.path === "")) &&
          !computedExternalPages[route.path === "" ? "/" : route.path],
      )
      .map((route) => {
        const loaderKey = Object.keys(modules).find(
          (k) => k === `/${docsDirName}/${route.filePath}`,
        );
        const loader = loaderKey ? modules[loaderKey] : null;

        return {
          ...route,
          Component: React.lazy(() => {
            if (!loader)
              return Promise.resolve({ default: () => <NotFound /> });
            return loader() as any;
          }),
        };
      });
  };

  const [resolvedRoutes, setResolvedRoutes] = useState<any[]>(() =>
    resolveRoutes(initialRoutes),
  );

  // Subscribe to HMR events
  useEffect(() => {
    if (hot) {
      hot.on("boltdocs:routes-update", (newRoutes: ComponentRoute[]) => {
        setRoutesInfo(newRoutes);
      });
    }
  }, [hot]);

  // Sync resolved routes when info or modules change
  useEffect(() => {
    setResolvedRoutes(resolveRoutes(routesInfo));
  }, [routesInfo, modules, docsDirName]);

  return (
    <ThemeProvider>
      <ConfigContext.Provider value={config}>
        <PreloadProvider routes={routesInfo} modules={modules}>
          <ScrollHandler />
          <Routes>
            {/* Custom home page WITHOUT docs layout */}
            {HomePage && (
              <Route
                path="/"
                element={
                  <ThemeLayout
                    config={config}
                    routes={routesInfo}
                    sidebar={null}
                    toc={null}
                    breadcrumbs={null}
                    {...config.themeConfig?.layoutProps}
                  >
                    <HomePage />
                  </ThemeLayout>
                }
              />
            )}

            {/* Custom External Pages WITHOUT docs layout */}
            {Object.entries(computedExternalPages).map(
              ([extPath, ExtComponent]: [string, React.ComponentType<any>]) => (
                <Route
                  key={extPath}
                  path={extPath}
                  element={
                    <ThemeLayout
                      config={config}
                      routes={routesInfo}
                      sidebar={null}
                      toc={null}
                      breadcrumbs={null}
                      {...config.themeConfig?.layoutProps}
                    >
                      <ExtComponent />
                    </ThemeLayout>
                  }
                />
              ),
            )}

            {/* Documentation pages WITH sidebar + TOC layout */}
            <Route
              key="docs-layout"
              element={<DocsLayout config={config} routes={routesInfo} />}
            >
              {resolvedRoutes.map((route: any) => (
                <Route
                  key={route.path}
                  path={route.path === "" ? "/" : route.path}
                  element={
                    <React.Suspense fallback={<Loading />}>
                      <MdxPage
                        Component={route.Component}
                        customComponents={customComponents}
                      />
                    </React.Suspense>
                  }
                />
              ))}
            </Route>

            <Route
              path="*"
              element={
                <ThemeLayout
                  config={config}
                  routes={routesInfo}
                  {...config.themeConfig?.layoutProps}
                >
                  <NotFound />
                </ThemeLayout>
              }
            />
          </Routes>
        </PreloadProvider>
      </ConfigContext.Provider>
    </ThemeProvider>
  );
}

/**
 * Handles scroll restoration and hash scrolling on navigation.
 */
function ScrollHandler() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    const container = document.querySelector(".boltdocs-content");
    if (!container) return;

    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const containerRect = container.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - containerRect;
        const offsetPosition = elementPosition - offset + container.scrollTop;

        container.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        return;
      }
    }
    container.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

/** Wrapper layout for doc pages (sidebar + content + TOC) */
function DocsLayout({
  config,
  routes,
}: {
  config: any;
  routes: ComponentRoute[];
}) {
  return (
    <ThemeLayout
      config={config}
      routes={routes}
      {...config.themeConfig?.layoutProps}
    >
      <Outlet />
    </ThemeLayout>
  );
}

/**
 * Renders an MDX page securely, injecting required custom components.
 * For example, this overrides the default `<pre>` HTML tags emitted by MDX
 * with the Boltdocs `CodeBlock` component for syntax highlighting.
 *
 * @param props - Contains the dynamically loaded React component representing the MDX page
 */
function MdxPage({
  Component,
  customComponents = {},
}: {
  Component: React.LazyExoticComponent<any>;
  customComponents?: Record<string, React.ComponentType<any>>;
}) {
  const allComponents = { ...mdxComponentsDefault, ...customComponents };
  return (
    <MDXProvider components={allComponents}>
      <Component />
    </MDXProvider>
  );
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
  } = options;
  const container = document.querySelector(target);
  if (!container) {
    throw new Error(
      `[boltdocs] Mount target "${target}" not found in document.`,
    );
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
  );

  // SSG pre-renders a shell with mock components for SEO crawlers.
  // We always use createRoot because the SSG output doesn't match the
  // real client-side component tree (components are lazy/dynamic).
  // Clear any SSG placeholder content before mounting.
  container.innerHTML = "";
  ReactDOM.createRoot(container as HTMLElement).render(app);
}
