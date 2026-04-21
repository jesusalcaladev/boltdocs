import path from 'path'
import GithubSlugger from 'github-slugger'
import type { BoltdocsConfig } from '../config'
import type { ParsedDocFile } from './types'
import {
  normalizePath,
  parseFrontmatter,
  fileToRoutePath,
  capitalize,
  stripNumberPrefix,
  extractNumberPrefix,
  sanitizeHtml,
  stripHtmlTags,
  logSecurityEvent,
} from '../utils'
import { MAX_PATH_LENGTH, ALLOWED_PATH_CHARS } from '../security/constants'
import { EncodingSecurityError, PathTraversalError } from '../errors'

/**
 * Parses a single Markdown/MDX file and extracts its metadata for routing.
 * Checks frontmatter for explicit titles, descriptions, and sidebar positions.
 *
 * Also performs security validation to prevent path traversal and basic
 * XSS sanitization for metadata and headings.
 *
 * @param file - The absolute path to the file
 * @param docsDir - The root documentation directory (e.g., 'docs')
 * @param basePath - The base URL path for the routes (default: '/docs')
 * @param config - The Boltdocs configuration for versions and i18n
 * @returns A parsed structure ready for route assembly and caching
 */
export function parseDocFile(
  file: string,
  docsDir: string,
  basePath: string,
  config?: BoltdocsConfig,
): ParsedDocFile {
  // Security: Prevent path traversal and malicious encoding
  let decodedFile: string
  try {
    decodedFile = decodeURIComponent(file)
  } catch {
    const fileName = path.basename(file)
    logSecurityEvent('ENCODING_ERROR', 'Invalid character encoding', {
      file: fileName,
    })
    throw new EncodingSecurityError(
      `Security breach: Invalid characters or encoding in path: ${fileName}`,
    )
  }

  // Validation: Path length
  if (decodedFile.length > MAX_PATH_LENGTH) {
    const fileName = path.basename(decodedFile)
    logSecurityEvent('PATH_TOO_LONG', 'Path length exceeds limit', {
      length: decodedFile.length,
      file: fileName,
    })
    throw new PathTraversalError(
      `Security breach: Path length exceeds limit of ${MAX_PATH_LENGTH} characters: ${fileName}`,
    )
  }

  const absoluteFile = path.resolve(decodedFile)
  const absoluteDocsDir = path.resolve(docsDir)
  const relativePath = normalizePath(
    path.relative(absoluteDocsDir, absoluteFile),
  )

  if (
    relativePath.startsWith('../') ||
    relativePath === '..' ||
    absoluteFile.includes('\0') ||
    !ALLOWED_PATH_CHARS.test(relativePath)
  ) {
    const fileName = path.basename(file)
    logSecurityEvent(
      'PATH_TRAVERSAL_ATTEMPT',
      'Path traversal or invalid characters detected',
      {
        path: relativePath,
      },
    )
    throw new PathTraversalError(
      `Security breach: File is outside of docs directory, contains null bytes, or invalid characters: ${fileName}`,
    )
  }

  const { data, content } = parseFrontmatter(file)
  let parts = relativePath.split('/')

  let locale: string | undefined
  let version: string | undefined

  // Level 1: Check for version
  if (config?.versions && parts.length > 0) {
    const potentialVersion = parts[0]
    const prefix = config.versions.prefix || ''

    const versionMatch = config.versions.versions.find((v) => {
      const fullPath = prefix + v.path
      return potentialVersion === fullPath || potentialVersion === v.path
    })

    if (versionMatch) {
      version = versionMatch.path
      parts = parts.slice(1)
    }
  }

  // Level 2: Check for locale
  if (config?.i18n && parts.length > 0) {
    const potentialLocale = parts[0]
    if (config.i18n.locales[potentialLocale]) {
      locale = potentialLocale
      parts = parts.slice(1)
    }
  }

  // Level 3: Check for Tab hierarchy (name)
  let inferredTab: string | undefined
  if (parts.length > 0) {
    const tabMatch = parts[0].match(/^\((.+)\)$/)
    if (tabMatch) {
      inferredTab = tabMatch[1].toLowerCase()
      parts = parts.slice(1)
    }
  }

  const cleanRelativePath = parts.join('/')

  let cleanRoutePath: string
  if (data.permalink) {
    // If a permalink is specified, ensure it starts with a slash
    cleanRoutePath = data.permalink.startsWith('/')
      ? data.permalink
      : `/${data.permalink}`
  } else {
    cleanRoutePath = fileToRoutePath(cleanRelativePath || 'index.md')
  }

  let finalPath = basePath
  if (version) {
    finalPath += '/' + version
  }
  if (locale) {
    finalPath += '/' + locale
  }
  if (inferredTab) {
    finalPath += '/' + inferredTab
  }
  finalPath += cleanRoutePath === '/' ? '' : cleanRoutePath

  if (!finalPath || finalPath === '') finalPath = '/'

  const rawFileName = parts[parts.length - 1]
  const cleanFileName = stripNumberPrefix(rawFileName)
  const inferredTitle = stripNumberPrefix(
    path.basename(file, path.extname(file)),
  )
  const sidebarPosition =
    data.sidebarPosition ?? extractNumberPrefix(rawFileName)

  const rawDirName = parts.length >= 2 ? parts[0] : undefined
  const cleanDirName = rawDirName ? stripNumberPrefix(rawDirName) : undefined

  const isGroupIndex = parts.length >= 2 && /^index\.mdx?$/.test(cleanFileName)

  const slugger = new GithubSlugger()
  const headings: { level: number; text: string; id: string }[] = []
  const headingsRegex = /^(#{2,4})\s+(.+)$/gm

  for (const match of content.matchAll(headingsRegex)) {
    const level = match[1].length
    const rawText = match[2]
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Strip markdown links
      .replace(/[_*`]/g, '') // Strip markdown formatting
      .trim()

    const sanitizedText = sanitizeHtml(rawText).trim()
    const id = slugger.slug(sanitizedText)

    headings.push({ level, text: sanitizedText, id })
  }

  const sanitizedTitle = data.title
    ? sanitizeHtml(String(data.title))
    : inferredTitle
  let sanitizedDescription = data.description
    ? sanitizeHtml(String(data.description))
    : ''

  // If no description is provided, extract a summary from the content
  if (!sanitizedDescription && content) {
    const plainExcerpt = stripHtmlTags(
      content
        .replace(/^#+.*$/gm, '') // Remove headers
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Simplify links
        .replace(/[_*`]/g, '') // Remove formatting
        .replace(/\s+/g, ' '), // Normalize whitespace
    )
      .trim()
      .slice(0, 160)

    sanitizedDescription = plainExcerpt
  }

  const sanitizedBadge = data.badge
    ? sanitizeHtml(String(data.badge))
    : undefined
  const icon = data.icon ? String(data.icon) : undefined

  // Extract full content as plain text for search indexing
  const plainText = parseContentToPlainText(content)

  return {
    route: {
      path: finalPath,
      componentPath: file,
      filePath: relativePath,
      title: sanitizedTitle,
      description: sanitizedDescription,
      sidebarPosition,
      headings,
      locale,
      version,
      badge: sanitizedBadge,
      icon,
      tab: inferredTab,
      _content: plainText,
      _rawContent: content,
    },
    relativeDir: cleanDirName,
    isGroupIndex,
    inferredTab,
    groupMeta: isGroupIndex
      ? {
          title:
            data.groupTitle ||
            data.title ||
            (cleanDirName ? capitalize(cleanDirName) : ''),
          position:
            data.groupPosition ??
            data.sidebarPosition ??
            (rawDirName ? extractNumberPrefix(rawDirName) : undefined),
          icon,
        }
      : undefined,
    inferredGroupPosition: rawDirName
      ? extractNumberPrefix(rawDirName)
      : undefined,
  }
}

/**
 * Converts markdown content to plain text for search indexing.
 * Strips headers, links, tags, and formatting.
 */
function parseContentToPlainText(content: string): string {
  const plainText = content
    .replace(/^#+.*$/gm, '') // Remove headers
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Simplify links
    .replace(/\{[^\}]+\}/g, '') // Remove JS expressions/curly braces
    .replace(/[_*`]/g, '') // Remove formatting
    .replace(/\s+/g, ' ') // Normalize whitespace

  return stripHtmlTags(plainText).trim()
}
