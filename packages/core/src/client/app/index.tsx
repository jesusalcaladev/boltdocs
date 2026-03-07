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
import { ComponentRoute, CreateBoltdocsAppOptions } from "../types";
import {
  createContext,
  useContext,
  Suspense,
  lazy,
  useLayoutEffect,
} from "react";
import { Link as LucideLink } from "lucide-react";

export const ConfigContext = createContext<any>(null);

export function useConfig() {
  return useContext(ConfigContext);
}

const CodeBlock = lazy(() =>
  import("../theme/components/CodeBlock").then((m) => ({
    default: m.CodeBlock,
  })),
);
const Video = lazy(() =>
  import("../theme/components/Video").then((m) => ({ default: m.Video })),
);
const PackageManagerTabs = lazy(() =>
  import("../theme/components/PackageManagerTabs").then((m) => ({
    default: m.PackageManagerTabs,
  })),
);
declare global {
  interface ImportMeta {
    env: Record<string, any>;
  }
}

import { PreloadProvider } from "./preload";

const Heading = ({
  level,
  id,
  children,
}: {
  level: number;
  id?: string;
  children: React.ReactNode;
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag id={id} className="boltdocs-heading">
      {children}
      {id && (
        <a href={`#${id}`} className="header-anchor" aria-label="Anchor">
          <LucideLink size={16} />
        </a>
      )}
    </Tag>
  );
};

const mdxComponents = {
  h1: (props: any) => <Heading level={1} {...props} />,
  h2: (props: any) => <Heading level={2} {...props} />,
  h3: (props: any) => <Heading level={3} {...props} />,
  h4: (props: any) => <Heading level={4} {...props} />,
  h5: (props: any) => <Heading level={5} {...props} />,
  h6: (props: any) => <Heading level={6} {...props} />,
  pre: (props: any) => {
    return (
      <Suspense fallback={<div className="code-block-skeleton" />}>
        <CodeBlock {...props}>{props.children}</CodeBlock>
      </Suspense>
    );
  },
  video: (props: any) => (
    <Suspense fallback={<div className="video-skeleton" />}>
      <Video {...props} />
    </Suspense>
  ),
  PackageManagerTabs: (props: any) => (
    <Suspense fallback={<div className="pkg-tabs-skeleton" />}>
      <PackageManagerTabs {...props} />
    </Suspense>
  ),
};

export function AppShell({
  initialRoutes,
  initialConfig,
  modules,
  hot,
  homePage: HomePage,
  components: customComponents = {},
}: {
  initialRoutes: ComponentRoute[];
  initialConfig: any;
  modules: Record<string, () => Promise<any>>;
  hot?: any;
  homePage?: React.ComponentType;
  components?: Record<string, React.ComponentType<any>>;
}) {
  const [routesInfo, setRoutesInfo] = useState<ComponentRoute[]>(initialRoutes);
  const [config] = useState(initialConfig);

  const resolveRoutes = (infos: ComponentRoute[]) => {
    return infos
      .filter(
        (route) => !(HomePage && (route.path === "/" || route.path === "")),
      )
      .map((route) => {
        const loaderKey = Object.keys(modules).find((k) =>
          k.endsWith("/" + route.filePath),
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
  }, [routesInfo, modules]);

  return (
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
  );
}

/**
 * Handles scroll restoration and hash scrolling on navigation.
 */
function ScrollHandler() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    // Only scroll if we are not in a pending transition state (if we were using useTransition)
    // For now, we ensure the scroll happens.
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        return;
      }
    }
    window.scrollTo(0, 0);
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
  const allComponents = { ...mdxComponents, ...customComponents };
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
  const { target, routes, config, modules, hot, homePage } = options;
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
          modules={modules}
          hot={hot}
          homePage={homePage}
          components={options.components}
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
