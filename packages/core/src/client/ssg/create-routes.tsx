import type { RouteRecord } from '@bdocs/ssg'
import type { ComponentRoute, BoltdocsConfig } from '../types'
import { MdxPage } from './mdx-page'
import { BoltdocsShell } from './boltdocs-shell'
import { NotFound } from '../components/ui-base/not-found'

interface CreateRoutesOptions {
  routesData: ComponentRoute[]
  config: BoltdocsConfig
  mdxModules: Record<string, { default?: React.ComponentType }>
  Layout: React.ComponentType<{ children: React.ReactNode }>
  homePage?: React.ComponentType
  externalPages?: Record<string, React.ComponentType>
  externalLayout?: React.ComponentType<{ children: React.ReactNode }>
  components?: Record<string, React.ComponentType>
}

/**
 * Finds the matching module key from import.meta.glob for a given filePath.
 */
function findModuleKey(
  modules: Record<string, any>,
  filePath: string,
): string | undefined {
  const normalizedFilePath = filePath.replace(/\\/g, '/')
  return Object.keys(modules).find(
    (key) =>
      key.endsWith(`/${normalizedFilePath}`) ||
      key.endsWith(normalizedFilePath),
  )
}

export function createRoutes(options: CreateRoutesOptions): RouteRecord[] {
  const {
    routesData,
    config,
    mdxModules,
    Layout,
    homePage: HomePage,
    externalPages,
    externalLayout,
    components,
  } = options

  const EffectiveExternalLayout = externalLayout || Layout

  const withBase = (path: string) => {
    // Future support for base path in config
    const base = config.base || '/'
    if (path.startsWith(base)) return path
    const b = base === '/' ? '' : base.replace(/\/$/, '')
    const p = path.startsWith('/') ? path : `/${path}`
    return `${b}${p}` || '/'
  }

  // 1. Documentation routes
  const docRoutes: RouteRecord[] = routesData.map((route) => {
    const moduleKey = findModuleKey(mdxModules, route.filePath)
    const MDXComponent = moduleKey ? mdxModules[moduleKey]?.default : null

    const path = withBase(route.path === '' ? '/' : route.path)

    return {
      path,
      element: (
        <MdxPage MDXComponent={MDXComponent} mdxComponents={components} />
      ),
      loader: async () => ({
        path,
        frontmatter: {
          title: route.title,
          description: route.description || '',
        },
        headings: route.headings || [],
        filePath: route.filePath,
        locale: route.locale,
        version: route.version,
        group: route.group,
        groupTitle: route.groupTitle,
      }),
      getStaticPaths: () => [path],
    }
  })

  const children: RouteRecord[] = [...docRoutes]

  // 2. Home page route
  if (HomePage) {
    const homePaths = [withBase('/')]
    if (config.i18n) {
      Object.keys(config.i18n.locales).forEach((locale) => {
        homePaths.push(withBase(`/${locale}`))
      })
    }

    homePaths.forEach((path) => {
      // Avoid duplicate routes if documentation also maps to '/'
      if (!children.find((r) => r.path === path)) {
        children.push({
          path,
          element: (
            <EffectiveExternalLayout>
              <HomePage />
            </EffectiveExternalLayout>
          ),
          getStaticPaths: () => [path],
        })
      }
    })
  }

  // 3. External pages
  if (externalPages) {
    Object.entries(externalPages).forEach(([rawPath, ExtComponent]) => {
      const path = withBase(rawPath)
      if (!children.find((r) => r.path === path)) {
        children.push({
          path,
          element: (
            <EffectiveExternalLayout>
              <ExtComponent />
            </EffectiveExternalLayout>
          ),
          getStaticPaths: () => [path],
        })

        // Also add i18n variants for external pages if needed
        if (config.i18n) {
          Object.keys(config.i18n.locales).forEach((locale) => {
            const localePath = withBase(
              `/${locale}${rawPath === '/' ? '' : rawPath}`,
            )
            if (!children.find((r) => r.path === localePath)) {
              children.push({
                path: localePath,
                element: (
                  <EffectiveExternalLayout>
                    <ExtComponent />
                  </EffectiveExternalLayout>
                ),
                getStaticPaths: () => [localePath],
              })
            }
          })
        }
      }
    })
  }

  // --- 4. 404 catch-all ---
  children.push({
    path: '*',
    element: (
      <EffectiveExternalLayout>
        <NotFound />
      </EffectiveExternalLayout>
    ),
  })

  // --- 5. Construct Metadata for UI Providers ---
  // We need to pass the full metadata to BoltdocsShell so that Sidebar/Tabs can work.
  const allMetadata: ComponentRoute[] = [...routesData]

  // Wrap everything in the Boltdocs shell (providers)
  return [
    {
      // No path = Layout Route
      // This allows children to retain their absolute paths while being wrapped in the shell.
      element: (
        <BoltdocsShell
          config={config}
          routes={allMetadata}
          components={components}
        />
      ),
      children,
    },
  ]
}
