import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "../Link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePreload } from "../../../app/preload";
import { BoltdocsConfig } from "../../../../node/config";
import { ComponentRoute } from "../../../types";
export { Navbar } from "../Navbar";
export { Sidebar } from "../Sidebar";
export { OnThisPage } from "../OnThisPage";
export { Head } from "../Head";
export { Breadcrumbs } from "../Breadcrumbs";

import { Navbar } from "../Navbar";
import { Sidebar } from "../Sidebar";
import { OnThisPage } from "../OnThisPage";
import { Head } from "../Head";
import { Breadcrumbs } from "../Breadcrumbs";
import { ProgressBar } from "../ProgressBar";
import { ErrorBoundary } from "../ErrorBoundary";
import { CopyMarkdown } from "../CopyMarkdown";
import "../../styles.css";

export interface ThemeLayoutProps {
  config: BoltdocsConfig;
  routes: ComponentRoute[];
  children: React.ReactNode;
  /** Custom navbar component (slots) */
  navbar?: React.ReactNode;
  /** Custom sidebar component (slots) */
  sidebar?: React.ReactNode;
  /** Custom table of contents (OnThisPage) component (slots) */
  toc?: React.ReactNode;
  /** Custom background component (slots) */
  background?: React.ReactNode;
  /** Custom head/metadata component (slots) */
  head?: React.ReactNode;
  /** Custom breadcrumbs component (slots) */
  breadcrumbs?: React.ReactNode;
  /** Custom class name for the root layout element */
  className?: string;
  /** Custom styles for the root layout element */
  style?: React.CSSProperties;
}

/**
 * The main structural layout for documentation pages.
 * Integrates the Navbar, Sidebar, and OnThisPage components into a cohesive shell.
 * It also manages mobile interaction states like the sidebar overlay toggle.
 *
 * @param config - The global Boltdocs configuration object
 * @param routes - The array of available doc routes (used to render the sidebar)
 */
export function ThemeLayout({
  config,
  routes,
  children,
  navbar,
  sidebar,
  toc,
  background,
  head,
  breadcrumbs,
  className = "",
  style,
}: ThemeLayoutProps) {
  const siteTitle = config.themeConfig?.title || "Boltdocs";
  const siteDescription = config.themeConfig?.description || "";
  const location = useLocation();

  // Compute prev/next pages and locale
  const currentIndex = routes.findIndex((r) => r.path === location.pathname);
  const currentRoute = routes[currentIndex];
  // Determine current locale (fallback to default)
  const currentLocale = config.i18n
    ? currentRoute?.locale || config.i18n.defaultLocale
    : undefined;

  // Determine current version (fallback to default)
  const currentVersion = config.versions
    ? currentRoute?.version || config.versions.defaultVersion
    : undefined;

  // Filter routes for sidebar, search, and navigation to only ones in the current locale and version
  const filteredRoutes = routes.filter((r) => {
    const localeMatch = config.i18n
      ? (r.locale || config.i18n.defaultLocale) === currentLocale
      : true;
    const versionMatch = config.versions
      ? (r.version || config.versions.defaultVersion) === currentVersion
      : true;
    return localeMatch && versionMatch;
  });

  const localIndex = filteredRoutes.findIndex(
    (r) => r.path === location.pathname,
  );
  const prevPage = localIndex > 0 ? filteredRoutes[localIndex - 1] : null;
  const nextPage =
    localIndex >= 0 && localIndex < filteredRoutes.length - 1
      ? filteredRoutes[localIndex + 1]
      : null;

  const { preload } = usePreload();
  React.useEffect(() => {
    if (prevPage?.path) preload(prevPage.path);
    if (nextPage?.path) preload(nextPage.path);
  }, [prevPage, nextPage, preload]);

  return (
    <div className={`boltdocs-layout ${className}`} style={style}>
      <ProgressBar />
      {head !== undefined ? (
        head
      ) : (
        <Head
          siteTitle={siteTitle}
          siteDescription={siteDescription}
          routes={routes}
        />
      )}
      {navbar !== undefined ? (
        navbar
      ) : (
        <Navbar
          config={config}
          routes={filteredRoutes}
          allRoutes={routes}
          currentLocale={currentLocale}
          currentVersion={currentVersion}
        />
      )}
      <div className="boltdocs-main-container">
        {sidebar !== undefined ? (
          sidebar
        ) : (
          <Sidebar routes={filteredRoutes} config={config} />
        )}

        <main className="boltdocs-content">
          <div className="boltdocs-content-header">
            {breadcrumbs !== undefined ? (
              breadcrumbs
            ) : (
              <Breadcrumbs routes={filteredRoutes} config={config} />
            )}
            <CopyMarkdown
              content={routes[currentIndex]?._rawContent}
              config={config.themeConfig?.copyMarkdown}
            />
          </div>
          <div className="boltdocs-page">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>

          {/* Prev / Next Navigation */}
          {(prevPage || nextPage) && (
            <nav className="page-nav" aria-label="Pagination">
              {prevPage ? (
                <Link
                  to={prevPage.path || "/"}
                  className="page-nav-link page-nav-link--prev"
                >
                  <div className="page-nav-info">
                    <span className="page-nav-label">Previous</span>
                    <span className="page-nav-title">{prevPage.title}</span>
                  </div>
                  <ChevronLeft className="page-nav-arrow" size={16} />
                </Link>
              ) : (
                <span />
              )}
              {nextPage ? (
                <Link
                  to={nextPage.path || "/"}
                  className="page-nav-link page-nav-link--next"
                >
                  <div className="page-nav-info">
                    <span className="page-nav-label">Next</span>
                    <span className="page-nav-title">{nextPage.title}</span>
                  </div>
                  <ChevronRight className="page-nav-arrow" size={16} />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </main>
        {toc !== undefined ? (
          toc
        ) : (
          <OnThisPage
            headings={routes[currentIndex]?.headings}
            editLink={config.themeConfig?.editLink}
            communityHelp={config.themeConfig?.communityHelp}
            filePath={routes[currentIndex]?.filePath}
          />
        )}
      </div>
    </div>
  );
}
