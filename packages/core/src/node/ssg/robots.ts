import type { BoltdocsConfig } from '../config'

/**
 * Generates the content for a robots.txt file based on the Boltdocs configuration.
 *
 * @param config - The resolved Boltdocs configuration
 * @returns The formatted robots.txt string
 */
export function generateRobotsTxt(config: BoltdocsConfig): string {
  if (typeof config.robots === 'string') {
    return config.robots
  }

  const siteUrl = config.siteUrl?.replace(/\/$/, '') || ''
  const robots = config.robots || {}
  const rules = (robots as any).rules || [
    {
      userAgent: '*',
      allow: '/',
    },
  ]
  const sitemaps =
    (robots as any).sitemaps || (siteUrl ? [`${siteUrl}/sitemap.xml`] : [])

  let content = ''

  for (const rule of rules) {
    content += `User-agent: ${rule.userAgent}\n`

    if (rule.disallow) {
      const disallows = Array.isArray(rule.disallow)
        ? rule.disallow
        : [rule.disallow]
      for (const d of disallows) {
        content += `Disallow: ${d}\n`
      }
    }

    if (rule.allow) {
      const allows = Array.isArray(rule.allow) ? rule.allow : [rule.allow]
      for (const a of allows) {
        content += `Allow: ${a}\n`
      }
    }
    content += '\n'
  }

  for (const sitemap of sitemaps) {
    content += `Sitemap: ${sitemap}\n`
  }

  return content.trim()
}
