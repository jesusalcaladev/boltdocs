import { DocsLayout } from './docs-layout'
import { Navbar } from './ui-base/navbar'
import { Sidebar } from './ui-base/sidebar'
import { OnThisPage } from './ui-base/on-this-page'
import { Head } from './ui-base/head'
import { Breadcrumbs } from './ui-base/breadcrumbs'
import { PageNav } from './ui-base/page-nav'
import { ErrorBoundary } from './ui-base/error-boundary'
import { CopyMarkdown } from './ui-base/copy-markdown'
import { useRoutes } from '../hooks/use-routes'
import { useConfig } from '../app/config-context'
import { useMdxComponents } from '../app/mdx-components-context'
import { useLocation } from 'react-router-dom'
import { getTranslated } from '../utils/i18n'

export interface LayoutProps {
  children: React.ReactNode
}

/**
 * The built-in default layout for Boltdocs.
 * Users who create their own `layout.tsx` can import the same building blocks
 * and rearrange, wrap, or replace any section.
 */
export function DefaultLayout({ children }: LayoutProps) {
  const {
    routes: filteredRoutes,
    allRoutes,
    currentRoute,
    currentLocale,
  } = useRoutes()
  const { pathname } = useLocation()
  const config = useConfig()
  const mdxComponents = useMdxComponents()
  const CopyMarkdownComp = (mdxComponents.CopyMarkdown as any) || CopyMarkdown

  const isDocs = pathname.startsWith('/docs')

  return (
    <DocsLayout>
      <Head
        siteTitle={
          getTranslated(config.theme?.title, currentLocale) || 'Boltdocs'
        }
        siteDescription={
          getTranslated(config.theme?.description, currentLocale) || ''
        }
        routes={allRoutes}
      />
      <Navbar />

      <DocsLayout.Body>
        {isDocs && <Sidebar routes={filteredRoutes} config={config} />}

        <DocsLayout.Content>
          <DocsLayout.ContentMdx>
            {isDocs && (
              <DocsLayout.ContentHeader>
                <Breadcrumbs />
                <CopyMarkdownComp
                  mdxRaw={currentRoute?._rawContent}
                  route={currentRoute}
                  config={config.theme?.copyMarkdown}
                />
              </DocsLayout.ContentHeader>
            )}

            <ErrorBoundary>{children}</ErrorBoundary>

            {isDocs && (
              <DocsLayout.ContentFooter>
                <PageNav />
              </DocsLayout.ContentFooter>
            )}
          </DocsLayout.ContentMdx>
        </DocsLayout.Content>

        {isDocs && (
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
