import { describe, it, expect, vi } from 'vitest'
import { parseDocFile } from '../../packages/core/src/node/routes/parser'
import * as utils from '../../packages/core/src/node/utils'
import path from 'path'

// Mock utils for security testing
vi.mock('../../packages/core/src/node/utils', async () => {
  const actual = await vi.importActual('../../packages/core/src/node/utils')
  return {
    ...(actual as any),
    parseFrontmatter: vi.fn(),
  }
})

describe('Security: Route Parser', () => {
  const docsDir = 'C:\\docs'
  const basePath = '/docs'

  it('should reflect the path provided without allowing traversal in the route (Functional Check)', () => {
    const maliciousPath = 'C:\\docs\\..\\..\\windows\\system32\\cmd.exe'

    ;(utils.parseFrontmatter as any).mockReturnValue({
      data: {},
      content: '',
    })

    // The parser should now throw an error if the file is outside docsDir
    expect(() => parseDocFile(maliciousPath, docsDir, basePath)).toThrow(
      /Security breach/,
    )
  })

  it('should handle malicious frontmatter keys', () => {
    ;(utils.parseFrontmatter as any).mockReturnValue({
      data: {
        __proto__: { admin: true },
        constructor: { prototype: { hacked: true } },
      },
      content: '',
    })

    const result = parseDocFile('C:\\docs\\test.md', docsDir, basePath)

    // Ensure the route object isn't compromised by prototype pollution
    expect((result.route as any).admin).toBeUndefined()
    expect((Object.prototype as any).hacked).toBeUndefined()
  })

  it('should handle extremely long values in frontmatter', () => {
    const longTitle = 'A'.repeat(1000000)
    ;(utils.parseFrontmatter as any).mockReturnValue({
      data: { title: longTitle },
      content: '',
    })

    const result = parseDocFile('C:\\docs\\test.md', docsDir, basePath)
    expect(result.route.title).toBe(longTitle)
  })

  describe('Advanced Path Traversal', () => {
    it('should block null byte injection', () => {
      const malicious = 'C:\\docs\\secret.md\0.txt'
      ;(utils.parseFrontmatter as any).mockReturnValue({
        data: {},
        content: '',
      })
      // path.resolve might strip null bytes or throw, but we should check our logic
      expect(() => parseDocFile(malicious, docsDir, basePath)).toThrow()
    })

    it('should block URL encoded traversal', () => {
      // Vitest/Node path doesn't automatically decode %2e, but some environments might
      const malicious = 'C:\\docs\\%2e%2e\\%2e%2e\\windows\\system32\\cmd.exe'
      ;(utils.parseFrontmatter as any).mockReturnValue({
        data: {},
        content: '',
      })
      expect(() => parseDocFile(malicious, docsDir, basePath)).toThrow(
        /Security breach/,
      )
    })

    it('should handle mixed separators and repetitive dots', () => {
      const malicious = 'C:\\docs\\..././..\\..\\secret.txt'
      ;(utils.parseFrontmatter as any).mockReturnValue({
        data: {},
        content: '',
      })
      expect(() => parseDocFile(malicious, docsDir, basePath)).toThrow(
        /Security breach/,
      )
    })
  })

  describe('XSS Injection', () => {
    it('should detect XSS in metadata fields', () => {
      const xssScript = "<script>alert('xss')</script>"
      ;(utils.parseFrontmatter as any).mockReturnValue({
        data: {
          title: `Title ${xssScript}`,
          description: `Desc ${xssScript}`,
          badge: xssScript,
        },
        content: '',
      })

      const result = parseDocFile('C:\\docs\\test.md', docsDir, basePath)

      // These should be sanitized. Currently they are NOT.
      expect(result.route.title).not.toContain('<script>')
      expect(result.route.description).not.toContain('<script>')
      expect(result.route.badge).not.toContain('<script>')
    })

    it('should detect XSS in headings', () => {
      const xssScript = '<img src=x onerror=alert(1)>'
      ;(utils.parseFrontmatter as any).mockReturnValue({
        data: {},
        content: `## Normal Heading\n### Malicious ${xssScript}`,
      })

      const result = parseDocFile('C:\\docs\\test.md', docsDir, basePath)
      expect(result.route.headings![1].text).not.toContain('<img')
    })
  })

  describe('ReDoS (Regular Expression Denial of Service)', () => {
    it('should not hang on maliciously crafted headings', () => {
      const start = Date.now()
      // Construct a string that might trigger catastrophic backtracking in a poorly designed regex
      // Our regex: /^(#{2,4})\s+(.+)$/gm
      // Let's try many spaces or nested structures if the regex was more complex
      const maliciousContent = '## ' + ' '.repeat(10000) + 'A'

      ;(utils.parseFrontmatter as any).mockReturnValue({
        data: {},
        content: maliciousContent,
      })

      parseDocFile('C:\\docs\\test.md', docsDir, basePath)
      const duration = Date.now() - start
      expect(duration).toBeLessThan(100) // Should be very fast
    })
  })
})
