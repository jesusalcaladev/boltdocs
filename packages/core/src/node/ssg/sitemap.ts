import type { BoltdocsConfig } from '../config'
import { escapeXml } from '../utils'

/**
 * Generates a standard XML sitemap for search engine crawlers.
 *
 * @param routePaths - An array of existing URL paths (e.g., ['/docs/intro', '/docs/setup'])
 * @param config - The Boltdocs configuration containing i18n and siteUrl settings
 * @returns The formatted XML sitemap string
 */
export function generateSitemap(
  routePaths: string[],
  config?: BoltdocsConfig,
): string {
  const baseUrl = config?.siteUrl?.replace(/\/$/, '') || 'https://example.com'
  const today = new Date().toISOString().split('T')[0]

  const rootEntries = [{ url: '/', priority: '1.0', changefreq: 'daily' }]

  if (config?.i18n) {
    const defaultLocale = config.i18n.defaultLocale
    for (const locale of Object.keys(config.i18n.locales)) {
      if (locale !== defaultLocale) {
        rootEntries.push({
          url: `/${locale}/`,
          priority: '1.0',
          changefreq: 'daily',
        })
      }
    }
  }

  const entries = [
    ...rootEntries,
    ...routePaths.map((p) => ({
      url: p,
      priority: '0.8',
      changefreq: 'weekly',
    })),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${escapeXml(baseUrl)}${escapeXml(e.url)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`
}
