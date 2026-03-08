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

  const cleanRelativePath = parts.join("/");
  const cleanRoutePath = fileToRoutePath(cleanRelativePath || "index.md");

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
    headings.push({ level, text: escapeHtml(text), id });
  }

  const sanitizedTitle = data.title ? escapeHtml(data.title) : inferredTitle;
  const sanitizedDescription = data.description
    ? escapeHtml(data.description)
    : "";
  const sanitizedBadge = data.badge ? escapeHtml(data.badge) : undefined;

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
    },
    relativeDir: cleanDirName,
    isGroupIndex,
    groupMeta: isGroupIndex
      ? {
          title: escapeHtml(
            data.groupTitle ||
              data.title ||
              (cleanDirName ? capitalize(cleanDirName) : ""),
          ),
          position:
            data.groupPosition ??
            data.sidebarPosition ??
            (rawDirName ? extractNumberPrefix(rawDirName) : undefined),
        }
      : undefined,
    inferredGroupPosition: rawDirName
      ? extractNumberPrefix(rawDirName)
      : undefined,
  };
}
