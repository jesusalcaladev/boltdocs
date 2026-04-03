import fs from 'fs'
import matter from 'gray-matter'
import DOMPurify from 'isomorphic-dompurify'

/**
 * Normalizes a file path by replacing Windows backslashes with forward slashes.
 * Ensures consistent path handling across different operating systems.
 *
 * @param p - The file path to normalize
 * @returns The normalized path using forward slashes
 */
export function normalizePath(p: string): string {
  return p.replace(/\\/g, '/')
}

/**
 * Strips a numeric prefix from a file or directory name (e.g., '1.guide' -> 'guide').
 *
 * @param name - The name to strip
 * @returns The name without the numeric prefix
 */
export function stripNumberPrefix(name: string): string {
  return name.replace(/^\d+\./, '')
}

/**
 * Extracts the numeric prefix from a file or directory name if it exists.
 *
 * @param name - The name to parse
 * @returns The extracted number, or undefined if none exists
 */
export function extractNumberPrefix(name: string): number | undefined {
  const match = name.match(/^(\d+)\./)
  return match ? parseInt(match[1], 10) : undefined
}

/**
 * Checks if a given file path points to a Markdown or MDX file.
 *
 * @param filePath - The path to check
 * @returns True if the file ends with .md or .mdx, false otherwise
 */
export function isDocFile(filePath: string): boolean {
  return /\.mdx?$/.test(filePath)
}

/**
 * Retrieves the modification time (mtime) of a file in milliseconds.
 * Useful for caching strategies to detect if a file has changed.
 * Returns 0 if the file doesn't exist or cannot be accessed.
 *
 * @param filePath - The absolute path to the file
 * @returns The modification time in milliseconds, or 0 on error
 */
export function getFileMtime(filePath: string): number {
  try {
    return fs.statSync(filePath).mtimeMs
  } catch {
    return 0
  }
}

/**
 * Parses frontmatter and markdown content from a file synchronously.
 * Uses `gray-matter` for parsing. Returns the parsed data and the remaining markdown content.
 *
 * @param filePath - The absolute path to the markdown/mdx file
 * @returns An object containing the parsed metadata (`data`) and the raw markdown (`content`)
 */
export function parseFrontmatter(filePath: string): {
  data: Record<string, any>
  content: string
} {
  const raw = fs.readFileSync(filePath, 'utf-8')
  try {
    const { data, content } = matter(raw)
    return { data, content }
  } catch (e) {
    // If frontmatter is malformed (e.g. while editing), return empty data and raw content
    return { data: {}, content: raw }
  }
}

/**
 * Escapes special HTML characters in a string to prevent XSS and ensure
 * safe injection into HTML attributes or text content.
 *
 * @param str - The raw string to escape
 * @returns The escaped string
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Alias for escapeHtml to be used in XML contexts (like sitemaps).
 *
 * @param str - The raw string to escape
 * @returns The escaped string
 */
export function escapeXml(str: string): string {
  return escapeHtml(str)
}

/**
 * Converts a file path relative to the `docsDir` into a URL route path.
 * Handles removing extensions, converting `index` files to directory roots,
 * and ensuring proper slash formatting.
 *
 * @param relativePath - The file path relative to the documentation source directory (e.g., 'guide/index.md')
 * @returns The corresponding route path (e.g., '/guide')
 */
export function fileToRoutePath(relativePath: string): string {
  // Strip number prefixes from every segment
  let cleanedPath = relativePath.split('/').map(stripNumberPrefix).join('/')

  // Remove trailing slash if present
  let routePath = cleanedPath.replace(/\/$/, '')

  routePath = routePath.replace(/\.mdx?$/, '')

  // Handle index files → directory root
  if (routePath === 'index' || routePath.endsWith('/index')) {
    routePath = routePath.replace(/index$/, '')
  }

  // Ensure leading slash
  if (!routePath.startsWith('/')) {
    routePath = '/' + routePath
  }

  // Remove trailing slash (except for root '/')
  if (routePath.length > 1 && routePath.endsWith('/')) {
    routePath = routePath.slice(0, -1)
  }

  return routePath
}

/**
 * Sanitizes an HTML string using DOMPurify to prevent XSS.
 * By default, it allows a safe subset of HTML tags.
 *
 * @param html - The raw HTML string
 * @returns The sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html)
}

/**
 * Strips all HTML tags from a string, returning only the text content.
 * Uses DOMPurify for secure and complete tag removal.
 *
 * @param html - The string containing HTML tags
 * @returns The plain text content
 */
export function stripHtmlTags(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], KEEP_CONTENT: true })
}

/**
 * Capitalizes the first letter of a given string.
 * Used primarily for generating default group titles.
 *
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Retrieves the correct translation from a value that can be either
 * a simple string or a map of locale-specific strings.
 * Node-side version for SSG and config resolution.
 *
 * @param value - The text to translate
 * @param locale - The current active locale (e.g., 'en', 'es')
 * @returns The translated string
 */
export function getTranslated(
  value: string | Record<string, string> | undefined,
  locale?: string,
): string {
  if (!value) return ''
  if (typeof value === 'string') return value

  if (locale && value[locale]) {
    return value[locale]
  }

  // Fallback: Use the first available translation or an empty string
  const firstValue = Object.values(value)[0]
  return firstValue || ''
}
