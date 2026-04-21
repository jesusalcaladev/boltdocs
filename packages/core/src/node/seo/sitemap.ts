import type { BoltdocsConfig } from '../config'
import type { SSGRouteData } from '../routes/route-adapter'

/**
 * Generates an XML sitemap for search engines to crawl all documentation routes.
 *
 * @param routes - The processed SSG route metadata.
 * @param config - The Boltdocs configuration containing the site URL.
 * @returns The XML sitemap as a search engine crawlable string.
 */
export function generateSitemap(
  routes: SSGRouteData[],
  config: BoltdocsConfig,
): string {
  const siteUrl = (config.siteUrl || '').replace(/\/$/, '')
  if (!siteUrl) return ''

  const urls = routes
    .map((route) => {
      // Normalize path for the loc tag
      const normalizedPath = route.path.startsWith('/')
        ? route.path
        : `/${route.path}`
      const loc = `${siteUrl}${normalizedPath}`

      return `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}
