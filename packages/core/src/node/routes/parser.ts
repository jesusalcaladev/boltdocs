import path from "path";
import GithubSlugger from "github-slugger";
import { BoltdocsConfig } from "../config";
import { ParsedDocFile } from "./types";
import {
  normalizePath,
  parseFrontmatter,
  fileToRoutePath,
  capitalize,
  stripNumberPrefix,
  extractNumberPrefix,
  escapeHtml,
} from "../utils";

/**
 * Parses a single Markdown/MDX file and extracts its metadata for routing.
 * Checks frontmatter for explicit titles, descriptions, and sidebar positions.
 *
 * @param file - The absolute path to the file
 * @param docsDir - The root documentation directory (e.g., 'docs')
 * @param basePath - The base URL path for the routes (default: '/docs')
 * @returns A parsed structure ready for route assembly and caching
 */
export function parseDocFile(
  file: string,
  docsDir: string,
  basePath: string,
  config?: BoltdocsConfig,
): ParsedDocFile {
  // Security: Prevent path traversal
  const decodedFile = decodeURIComponent(file);
  const absoluteFile = path.resolve(decodedFile);
  const absoluteDocsDir = path.resolve(docsDir);
  const relativePath = normalizePath(
    path.relative(absoluteDocsDir, absoluteFile),
  );

  if (
    relativePath.startsWith("../") ||
    relativePath === ".." ||
    absoluteFile.includes("\0")
  ) {
    throw new Error(
      `Security breach: File is outside of docs directory or contains null bytes: ${file}`,
    );
  }

  const { data, content } = parseFrontmatter(file);
  let parts = relativePath.split("/");

  let locale: string | undefined;
  let version: string | undefined;

  // Level 1: Check for version
  if (config?.versions && parts.length > 0) {
    const potentialVersion = parts[0];
    if (config.versions.versions[potentialVersion]) {
      version = potentialVersion;
      parts = parts.slice(1);
    }
  }

  // Level 2: Check for locale
  if (config?.i18n && parts.length > 0) {
    const potentialLocale = parts[0];
    if (config.i18n.locales[potentialLocale]) {
      locale = potentialLocale;
      parts = parts.slice(1);
    }
  }

  // Level 3: Check for Tab hierarchy (name)
  let inferredTab: string | undefined;
  if (parts.length > 0) {
    const tabMatch = parts[0].match(/^\((.+)\)$/);
    if (tabMatch) {
      inferredTab = tabMatch[1].toLowerCase();
      parts = parts.slice(1);
    }
  }

  const cleanRelativePath = parts.join("/");

  let cleanRoutePath: string;
  if (data.permalink) {
    // If a permalink is specified, ensure it starts with a slash
    cleanRoutePath = data.permalink.startsWith("/")
      ? data.permalink
      : `/${data.permalink}`;
  } else {
    cleanRoutePath = fileToRoutePath(cleanRelativePath || "index.md");
  }

  let finalPath = basePath;
  if (version) {
    finalPath += "/" + version;
  }
  if (locale) {
    finalPath += "/" + locale;
  }
  finalPath += cleanRoutePath === "/" ? "" : cleanRoutePath;

  if (!finalPath || finalPath === "") finalPath = "/";

  const rawFileName = parts[parts.length - 1];
  const cleanFileName = stripNumberPrefix(rawFileName);
  const inferredTitle = stripNumberPrefix(
    path.basename(file, path.extname(file)),
  );
  const sidebarPosition =
    data.sidebarPosition ?? extractNumberPrefix(rawFileName);

  const rawDirName = parts.length >= 2 ? parts[0] : undefined;
  const cleanDirName = rawDirName ? stripNumberPrefix(rawDirName) : undefined;

  const isGroupIndex = parts.length >= 2 && /^index\.mdx?$/.test(cleanFileName);

  const headings: { level: number; text: string; id: string }[] = [];
  const slugger = new GithubSlugger();
  const headingsRegex = /^(#{2,4})\s+(.+)$/gm;
  let match;
  while ((match = headingsRegex.exec(content)) !== null) {
    const level = match[1].length;
    // Strip simple markdown formatting specifically for the plain-text search index
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/[_*`]/g, "")
      .trim();
    const id = slugger.slug(text);
    // Security: Sanitize heading text for XSS
    headings.push({ level, text, id });
  }

  const sanitizedTitle = data.title ? data.title : inferredTitle;
  let sanitizedDescription = data.description
    ? data.description
    : "";

  // If no description is provided, extract a summary from the content
  if (!sanitizedDescription && content) {
    const summary = content
      .replace(/^#+.*$/gm, "") // Remove headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Simplify links
      .replace(/[_*`]/g, "") // Remove formatting
      .replace(/\n+/g, " ") // Normalize whitespace
      .trim()
      .slice(0, 160);
    sanitizedDescription = summary;
  }

  const sanitizedBadge = data.badge ? data.badge : undefined;
  const icon = data.icon ? String(data.icon) : undefined;

  // Extract full content as plain text for search indexing
  const plainText = content
    .replace(/^#+.*$/gm, "") // Remove headers
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Simplify links
    .replace(/<[^>]+>/g, "") // Remove HTML/JSX tags
    .replace(/\{[^\}]+\}/g, "") // Remove JS expressions/curly braces
    .replace(/[_*`]/g, "") // Remove formatting
    .replace(/\n+/g, " ") // Normalize whitespace
    .trim();

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
    },
    relativeDir: cleanDirName,
    isGroupIndex,
    inferredTab,
    groupMeta: isGroupIndex
      ? {
          title: 
            data.groupTitle ||
              data.title ||
              (cleanDirName ? capitalize(cleanDirName) : ""),
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
  };
}
