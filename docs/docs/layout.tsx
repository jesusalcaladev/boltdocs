import {
  DocsLayout,
  Navbar,
  Sidebar,
  OnThisPage,
  Head,
  Breadcrumbs,
  PageNav,
  ErrorBoundary,
  CopyMarkdown,
  useRoutes,
  useConfig,
} from 'boltdocs/client'
import { useLocation } from 'boltdocs/hooks'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { routes: filteredRoutes, allRoutes, currentRoute } = useRoutes()
  const { pathname } = useLocation()
  const config = useConfig()

  const isHome = pathname === '/' || pathname === ''

  return (
    <DocsLayout>
      {/* Modern Spotlight Gradients */}
      <div aria-hidden="true">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[120px]" />
        <div className="absolute -top-[5%] -right-[5%] w-[35%] h-[35%] rounded-full bg-purple-500/5 blur-[100px]" />
        <div className="absolute top-[20%] left-[20%] w-[20%] h-[20%] rounded-full bg-blue-400/5 blur-[80px]" />
      </div>
      <Head
        siteTitle={config.theme?.title}
        siteDescription={config.theme?.description}
        routes={allRoutes}
      />
      <Navbar />

      <DocsLayout.Body>
        {!isHome && <Sidebar routes={filteredRoutes} config={config} />}

        <DocsLayout.Content>
          {!isHome && (
            <DocsLayout.ContentHeader>
              <Breadcrumbs />
              <CopyMarkdown
                mdxRaw={currentRoute?._rawContent}
                route={currentRoute}
                config={config.theme?.copyMarkdown}
              />
            </DocsLayout.ContentHeader>
          )}

          <ErrorBoundary>{children}</ErrorBoundary>

          {!isHome && (
            <DocsLayout.ContentFooter>
              <PageNav />
            </DocsLayout.ContentFooter>
          )}
        </DocsLayout.Content>

        {!isHome && (
          <OnThisPage
            headings={currentRoute?.headings}
            editLink={config.theme?.editLink}
            communityHelp={config.theme?.communityHelp}
            filePath={currentRoute?.filePath}
          />
        )}
      </DocsLayout.Body>
    </DocsLayout>
  )
}
