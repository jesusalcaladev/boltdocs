import type { BoltdocsConfig } from '../config'

/**
 * Generates a standard robots.txt file for the documentation site.
 *
 * @param config - The Boltdocs configuration containing the site URL.
 * @returns The contents of the robots.txt file.
 */
export function generateRobotsTxt(config: BoltdocsConfig): string {
  const siteUrl = config.siteUrl || ''
  const sitemapUrl = siteUrl ? `${siteUrl.replace(/\/$/, '')}/sitemap.xml` : ''

  return [
    'User-agent: *',
    'Allow: /',
    '',
    sitemapUrl ? `Sitemap: ${sitemapUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}
