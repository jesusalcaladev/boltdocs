import { describe, it, expect } from 'vitest'
import { generateSitemap } from '../../packages/core/src/node/ssg/sitemap'
import { replaceMetaTags } from '../../packages/core/src/node/ssg/meta'

describe('SSG Security Tests', () => {
  describe('Sitemap Path Injection', () => {
    it('should not allow malicious paths to break XML structure (escaping check)', () => {
      const malicousPaths = [
        '/docs/normal',
        '/docs/test</loc><url><loc>https://hacker.com</loc></url><loc>',
      ]
      const sitemap = generateSitemap(malicousPaths)

      // If it's not escaped, the XML will be technically valid but contain an extra URL entry
      // This is a common sitemap injection vector.
      // Requirement check: does generateSitemap escape URLs?

      const hackerOccurrences = (sitemap.match(/hacker\.com/g) || []).length

      // If it's 1, it means the tag was injected. If we escaped it, it would be &lt;loc&gt;...
      // Let's see current behavior.
      expect(sitemap).not.toContain('<loc>https://hacker.com</loc>')
    })
  })

  describe('Meta Tag XSS Injection', () => {
    const template = `<title></title><meta name="description" content="">`

    it('should be resilient to XSS payloads (pre-sanitized by caller check)', () => {
      // index.ts calls escapeHtml(pageTitle) before calling replaceMetaTags
      // But let's see if replaceMetaTags itself handles raw injection safely if someone uses it directly
      const meta = {
        title: '"><script>alert(1)</script>',
        description: '"><img src=x onerror=alert(1)>',
      }

      const result = replaceMetaTags(template, meta)

      // If not escaped, this will break the title/meta tags and inject the script
      expect(result).not.toContain('"><script>')
      expect(result).not.toContain('"><img')
    })
  })
})
