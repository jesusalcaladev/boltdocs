import fastGlob from 'fast-glob'
import type { BoltdocsConfig } from '../config'
import { capitalize } from '../utils'

import type { RouteMeta, ParsedDocFile } from './types'
import { docCache, invalidateRouteCache, invalidateFile } from './cache'
import { parseDocFile } from './parser'
import { sortRoutes } from './sorter'

// Re-export public API
export type { RouteMeta }
export { invalidateRouteCache, invalidateFile }

// Cache for localized path computations
const localizedPathCache = new Map<string, string>()

/**
 * Generates the entire route map for the documentation site.
 * OPTIMIZED: Uses Map-based i18n lookups, chunked processing, and path caching.
 *
 * Automatically handles versioning and i18n routing, including fallback
 * generation for missing translations.
 *
 * @param docsDir - The root documentation directory
 * @param config - The Boltdocs configuration
 * @param basePath - The base URL path for the routes (default: '/docs')
 * @returns A promise resolving to an array of RouteMeta objects
 */
export async function generateRoutes(
  docsDir: string,
  config?: BoltdocsConfig,
  basePath: string = '/docs',
): Promise<RouteMeta[]> {
  const start = performance.now()

  // Load persistent cache
  docCache.load()

  // Clear path computation cache between generations
  localizedPathCache.clear()

  // Force re-parse if specifically requested (e.g. for content/config changes)
  if (process.env.BOLTDOCS_FORCE_REPARSE === 'true' || config?.i18n) {
    docCache.invalidateAll()
  }

  // 1. FAST SCAN
  const files = await fastGlob(['**/*.md', '**/*.mdx'], {
    cwd: docsDir,
    absolute: true,
    suppressErrors: true,
    followSymbolicLinks: false,
  })

  // Prune cache entries for deleted files
  docCache.pruneStale(new Set(files))

  // 2. CHUNKED PROCESSING (prevents blocking event loop)
  const CHUNK_SIZE = 50
  const parsed: ParsedDocFile[] = []
  let cacheHits = 0

  for (let i = 0; i < files.length; i += CHUNK_SIZE) {
    const chunk = files.slice(i, i + CHUNK_SIZE)

    const chunkResults = await Promise.all(
      chunk.map(async (file) => {
        const cached = docCache.get(file)
        if (cached) {
          cacheHits++
          return cached
        }

        const result = parseDocFile(file, docsDir, basePath, config)
        docCache.set(file, result)
        return result
      }),
    )

    parsed.push(...chunkResults)

    // Yield to event loop between chunks if there's more to process
    if (i + CHUNK_SIZE < files.length) {
      await new Promise((resolve) => setImmediate(resolve))
    }
  }

  // Save cache after processing
  docCache.save()

  // 3. OPTIMIZED METADATA COLLECTION
  const groupMeta = new Map<
    string,
    { title: string; position?: number; icon?: string }
  >()
  const groupIndexFiles: ParsedDocFile[] = []

  for (const p of parsed) {
    if (p.isGroupIndex && p.relativeDir) {
      groupIndexFiles.push(p)
    }

    if (p.relativeDir) {
      let entry = groupMeta.get(p.relativeDir)
      if (!entry) {
        entry = {
          title: capitalize(p.relativeDir),
          position: p.inferredGroupPosition,
          icon: p.route.icon,
        }
        groupMeta.set(p.relativeDir, entry)
      } else {
        if (
          entry.position === undefined &&
          p.inferredGroupPosition !== undefined
        ) {
          entry.position = p.inferredGroupPosition
        }
        if (!entry.icon && p.route.icon) {
          entry.icon = p.route.icon
        }
      }
    }
  }

  // Override with explicit group index metadata
  for (const p of groupIndexFiles) {
    const entry = groupMeta.get(p.relativeDir!)!
    if (p.groupMeta) {
      entry.title = p.groupMeta.title
      if (p.groupMeta.position !== undefined)
        entry.position = p.groupMeta.position
      if (p.groupMeta.icon) entry.icon = p.groupMeta.icon
    }
  }

  // 4. BUILD BASE ROUTES
  const routes: RouteMeta[] = new Array(parsed.length)
  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i]
    const dir = p.relativeDir
    const meta = dir ? groupMeta.get(dir) : undefined

    routes[i] = {
      ...p.route,
      group: dir,
      groupTitle: meta?.title || (dir ? capitalize(dir) : undefined),
      groupPosition: meta?.position,
      groupIcon: meta?.icon,
    }
  }

  // 5. OPTIMIZED I18N FALLBACKS
  let finalRoutes = routes
  if (config?.i18n) {
    const fallbacks = generateI18nFallbacks(routes, config, basePath)
    finalRoutes = [...routes, ...fallbacks]
  }

  const sorted = sortRoutes(finalRoutes)

  const duration = performance.now() - start
  console.log(
    `[boltdocs] Route generation: ${duration.toFixed(2)}ms (${files.length} files, ${cacheHits} cache hits)`,
  )

  return sorted
}

/**
 * Generates fallback routes for missing translations.
 * Optimization: Uses Map for O(1) existence checks instead of nested filters.
 */
function generateI18nFallbacks(
  routes: RouteMeta[],
  config: BoltdocsConfig,
  basePath: string,
): RouteMeta[] {
  const defaultLocale = config.i18n!.defaultLocale
  const allLocales = Object.keys(config.i18n!.locales)
  const fallbackRoutes: RouteMeta[] = []

  // Index existing routes by locale for O(1) lookup
  const routesByLocale = new Map<string, Set<string>>()
  const defaultRoutes: RouteMeta[] = []

  for (const r of routes) {
    const locale = r.locale || defaultLocale
    if (!routesByLocale.has(locale)) {
      routesByLocale.set(locale, new Set())
    }
    routesByLocale.get(locale)!.add(r.path)

    if (locale === defaultLocale) {
      defaultRoutes.push(r)
    }
  }

  for (const locale of allLocales) {
    if (locale === defaultLocale) continue

    const localePaths = routesByLocale.get(locale) || new Set<string>()

    for (const defRoute of defaultRoutes) {
      const targetPath = computeLocalizedPath(
        defRoute.path,
        defaultLocale,
        locale,
        basePath,
      )

      if (!localePaths.has(targetPath)) {
        fallbackRoutes.push({
          ...defRoute,
          path: targetPath,
          locale,
        })
      }
    }
  }

  return fallbackRoutes
}

/**
 * Computes a localized path based on the default locale and target locale.
 * Uses a cache to avoid redundant string manipulation.
 */
function computeLocalizedPath(
  path: string,
  defaultLocale: string,
  targetLocale: string,
  basePath: string,
): string {
  const cacheKey = `${path}:${targetLocale}`
  const cached = localizedPathCache.get(cacheKey)
  if (cached) return cached

  let prefix = basePath
  const versionMatch = path.match(new RegExp(`^${basePath}/(v[0-9]+)`))
  if (versionMatch) {
    prefix += '/' + versionMatch[1]
  }

  let pathAfterVersion = path.substring(prefix.length)

  // Handle case where path already has default locale
  const defaultLocaleSegment = `/${defaultLocale}`
  if (pathAfterVersion.startsWith(defaultLocaleSegment + '/')) {
    pathAfterVersion =
      '/' +
      targetLocale +
      '/' +
      pathAfterVersion.substring(defaultLocaleSegment.length + 1)
  } else if (pathAfterVersion === defaultLocaleSegment) {
    pathAfterVersion = '/' + targetLocale
  } else if (pathAfterVersion === '/' || pathAfterVersion === '') {
    pathAfterVersion = '/' + targetLocale
  } else {
    // Ensure pathAfterVersion starts with a slash if not already
    const pathPrefix = pathAfterVersion.startsWith('/') ? '' : '/'
    pathAfterVersion = '/' + targetLocale + pathPrefix + pathAfterVersion
  }

  const result = prefix + pathAfterVersion

  // Simple cache eviction to prevent memory leaks in extreme cases
  if (localizedPathCache.size > 2000) localizedPathCache.clear()
  localizedPathCache.set(cacheKey, result)

  return result
}
