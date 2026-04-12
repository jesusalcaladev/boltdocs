import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  stripNumberPrefix,
  extractNumberPrefix,
  isDocFile,
  getFileMtime,
  fileToRoutePath,
  escapeHtml,
  escapeXml,
  sanitizeFilename,
  capitalize,
  stripHtmlTags,
  normalizePath,
  logSecurityEvent,
} from '../packages/core/src/node/utils'
import fs from 'fs'
import path from 'path'
import os from 'os'

describe('utils', () => {
  describe('stripNumberPrefix', () => {
    it('should remove numeric prefix with dot', () => {
      expect(stripNumberPrefix('01-introduction.md')).toBe('01-introduction.md')
      expect(stripNumberPrefix('01.introduction.md')).toBe('introduction.md')
      expect(stripNumberPrefix('10.getting-started')).toBe('getting-started')
    })

    it('should not modify strings without numeric prefix', () => {
      expect(stripNumberPrefix('introduction.md')).toBe('introduction.md')
      expect(stripNumberPrefix('README.md')).toBe('README.md')
    })
  })

  describe('extractNumberPrefix', () => {
    it('should extract numeric prefix with dot', () => {
      expect(extractNumberPrefix('01.introduction.md')).toBe(1)
      expect(extractNumberPrefix('10.getting-started')).toBe(10)
      expect(extractNumberPrefix('999.test')).toBe(999)
    })

    it('should return undefined for strings without numeric dot prefix', () => {
      expect(extractNumberPrefix('01-introduction.md')).toBeUndefined()
      expect(extractNumberPrefix('introduction.md')).toBeUndefined()
    })
  })

  describe('isDocFile', () => {
    it('should identify markdown files', () => {
      expect(isDocFile('test.md')).toBe(true)
      expect(isDocFile('test.mdx')).toBe(true)
      expect(isDocFile('/path/to/test.md')).toBe(true)
    })

    it('should reject non-markdown files', () => {
      expect(isDocFile('test.txt')).toBe(false)
      expect(isDocFile('test.js')).toBe(false)
      expect(isDocFile('test.tsx')).toBe(false)
    })
  })

  describe('getFileMtime', () => {
    it('should return modification time for existing files', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'boltdocs-mtime-'))
      const filePath = path.join(tempDir, 'test.txt')
      fs.writeFileSync(filePath, 'test')

      const mtime = getFileMtime(filePath)
      expect(mtime).toBeGreaterThan(0)

      fs.rmSync(tempDir, { recursive: true, force: true })
    })

    it('should return 0 for non-existent files', () => {
      expect(getFileMtime('/nonexistent/file.txt')).toBe(0)
    })
  })

  describe('fileToRoutePath', () => {
    it('should convert markdown file to route path', () => {
      expect(fileToRoutePath('test.md')).toBe('/test')
      expect(fileToRoutePath('guide/install.md')).toBe('/guide/install')
    })

    it('should handle index files', () => {
      expect(fileToRoutePath('index.md')).toBe('/')
      expect(fileToRoutePath('guide/index.md')).toBe('/guide')
    })

    it('should strip number prefixes', () => {
      expect(fileToRoutePath('01-introduction.md')).toBe('/01-introduction')
      expect(fileToRoutePath('guide/01.install.md')).toBe('/guide/install')
    })

    it('should ensure leading slash', () => {
      expect(fileToRoutePath('test.md')).toBe('/test')
    })

    it('should remove trailing slash for non-root paths', () => {
      expect(fileToRoutePath('guide/index.md')).toBe('/guide')
    })

    it('should handle nested index files', () => {
      expect(fileToRoutePath('api/v1/index.md')).toBe('/api/v1')
    })

    it('should sanitize filenames', () => {
      expect(fileToRoutePath('guide/<script>.md')).toBe('/guide/script')
    })
  })

  describe('escapeHtml', () => {
    it('should escape ampersand', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b')
    })

    it('should escape quotes', () => {
      expect(escapeHtml('quote "test"')).toBe('quote &quot;test&quot;')
      expect(escapeHtml("quote 'test'")).toBe('quote &apos;test&apos;')
    })

    it('should escape angle brackets', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;')
    })

    it('should escape all special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      )
    })
  })

  describe('escapeXml', () => {
    it('should escape XML special characters', () => {
      expect(escapeXml('<tag attr="value">')).toBe(
        '&lt;tag attr=&quot;value&quot;&gt;',
      )
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove dangerous characters including path separators', () => {
      expect(sanitizeFilename('test<file>.md')).toBe('testfile.md')
      expect(sanitizeFilename('test?file.md')).toBe('testfile.md')
      expect(sanitizeFilename('test*file.md')).toBe('testfile.md')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('')
    })

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A')
    })
  })

  describe('stripHtmlTags', () => {
    it('should remove HTML tags', () => {
      expect(stripHtmlTags('<p>text</p>')).toBe('text')
      expect(stripHtmlTags('<div class="test">content</div>')).toBe('content')
    })

    it('should handle nested tags', () => {
      expect(stripHtmlTags('<p><strong>bold</strong></p>')).toBe('bold')
    })

    it('should handle self-closing tags', () => {
      expect(stripHtmlTags('text<br/>more')).toBe('textmore')
      expect(stripHtmlTags('text<hr>more')).toBe('textmore')
    })

    it('should handle strings without tags', () => {
      expect(stripHtmlTags('plain text')).toBe('plain text')
    })
  })

  describe('normalizePath', () => {
    it('should convert backslashes to forward slashes', () => {
      expect(normalizePath('C:\\docs\\test.md')).toBe('C:/docs/test.md')
    })

    it('should keep forward slashes unchanged', () => {
      expect(normalizePath('/docs/test.md')).toBe('/docs/test.md')
    })

    it('should handle mixed slashes', () => {
      expect(normalizePath('C:/docs\\test.md')).toBe('C:/docs/test.md')
    })
  })

  describe('logSecurityEvent', () => {
    it('should be a function', () => {
      expect(typeof logSecurityEvent).toBe('function')
    })
  })
})
