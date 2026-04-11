import { DocsLayout } from '@components/docs-layout'
import { Navbar } from '@components/ui-base/navbar'
import { Sidebar } from '@components/ui-base/sidebar'
import { OnThisPage } from '@components/ui-base/on-this-page'
import { Head } from '@components/ui-base/head'
import { Breadcrumbs } from '@components/ui-base/breadcrumbs'
import { PageNav } from '@components/ui-base/page-nav'
import { ErrorBoundary } from '@components/ui-base/error-boundary'
import { CopyMarkdown } from '@components/ui-base/copy-markdown'
import { useRoutes } from '@client/hooks/use-routes'
import { useConfig } from '@client/app/config-context'
import { useMdxComponents } from '@client/app/mdx-components-context'

import { useLocation } from 'react-router-dom'
import { getTranslated } from '@client/utils/i18n'

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
