import fastGlob from "fast-glob";
import { BoltdocsConfig } from "../config";
import { capitalize } from "../utils";

import { RouteMeta, ParsedDocFile } from "./types";
import { docCache, invalidateRouteCache, invalidateFile } from "./cache";
import { parseDocFile } from "./parser";
import { sortRoutes } from "./sorter";

// Re-export public API
export type { RouteMeta };
export { invalidateRouteCache, invalidateFile };

/**
 * Generates the entire route map for the documentation site.
 * This reads all `.md` and `.mdx` files in the `docsDir`, parses them (using cache),
 * infers group hierarchies based on directory structure and `index.md` files,
 * and returns a sorted array of RouteMeta objects intended for the client.
 *
 * @param docsDir - The root directory containing markdown files
 * @param config - Optional configuration for i18n and versioning
 * @param basePath - The base URL path to prefix to generated routes (e.g., '/docs')
 * @returns A promise that resolves to the final list of RouteMeta objects
 */
export async function generateRoutes(
  docsDir: string,
  config?: BoltdocsConfig,
  basePath: string = "/docs",
): Promise<RouteMeta[]> {
  // Load persistent cache on first call
  docCache.load();
  docCache.invalidateAll(); // FORCE RE-PARSE to pick up new _content field

  const files = await fastGlob(["**/*.md", "**/*.mdx"], {
    cwd: docsDir,
    absolute: true,
  });

  // Prune cache entries for deleted files
  docCache.pruneStale(new Set(files));

  // Invalidate all caches if config changes drastically (e.g. i18n enabled)
  if (config?.i18n) {
    docCache.invalidateAll();
  }

  // Parse files in parallel using Promise.all for increased efficiency
  let cacheHits = 0;
  const parsed: ParsedDocFile[] = await Promise.all(
    files.map(async (file) => {
      const cached = docCache.get(file);
      if (cached) {
        cacheHits++;
        return cached;
      }

      const result = parseDocFile(file, docsDir, basePath, config);
      docCache.set(file, result);
      return result;
    }),
  );

  if (files.length > 0) {
    console.log(
      `[boltdocs] Routes generated: ${files.length} files (${cacheHits} from cache, ${files.length - cacheHits} parsed)`,
    );
  }

  // Save cache after batch processing
  docCache.save();

  // Collect group metadata from directory names and index files
  const groupMeta = new Map<
    string,
    { title: string; position?: number; icon?: string }
  >();
  for (const p of parsed) {
    if (p.relativeDir) {
      if (!groupMeta.has(p.relativeDir)) {
        groupMeta.set(p.relativeDir, {
          title: capitalize(p.relativeDir),
          position: p.inferredGroupPosition,
          icon: p.route.icon,
        });
      } else {
        const entry = groupMeta.get(p.relativeDir)!;
        if (
          entry.position === undefined &&
          p.inferredGroupPosition !== undefined
        ) {
          entry.position = p.inferredGroupPosition;
        }
        if (!entry.icon && p.route.icon) {
          entry.icon = p.route.icon;
        }
      }
    }

    if (p.isGroupIndex && p.relativeDir && p.groupMeta) {
      const entry = groupMeta.get(p.relativeDir)!;
      entry.title = p.groupMeta.title;
      if (p.groupMeta.position !== undefined) {
        entry.position = p.groupMeta.position;
      }
      if (p.groupMeta.icon) {
        entry.icon = p.groupMeta.icon;
      }
    }
  }

  // Build final routes with group info
  const routes: RouteMeta[] = parsed.map((p) => {
    const dir = p.relativeDir;
    const meta = dir ? groupMeta.get(dir) : undefined;

    return {
      ...p.route,
      group: dir,
      groupTitle: meta?.title || (dir ? capitalize(dir) : undefined),
      groupPosition: meta?.position,
      groupIcon: meta?.icon,
    };
  });

  // Add fallbacks if i18n is enabled
  if (config?.i18n) {
    const defaultLocale = config.i18n.defaultLocale;
    const allLocales = Object.keys(config.i18n.locales);

    const fallbackRoutes: RouteMeta[] = [];
    const defaultRoutes = routes.filter(
      (r) => (r.locale || defaultLocale) === defaultLocale,
    );

    for (const locale of allLocales) {
      if (locale === defaultLocale) continue;

      const localeRoutePaths = new Set(
        routes.filter((r) => r.locale === locale).map((r) => r.path),
      );

      for (const defRoute of defaultRoutes) {
        let prefix = basePath;
        if (defRoute.version) {
          prefix += "/" + defRoute.version;
        }

        let pathAfterVersion = defRoute.path.substring(prefix.length);

        if (pathAfterVersion.startsWith("/" + defaultLocale + "/")) {
          pathAfterVersion = pathAfterVersion.substring(
            defaultLocale.length + 1,
          );
        } else if (pathAfterVersion === "/" + defaultLocale) {
          pathAfterVersion = "/";
        }
        const targetPath =
          prefix +
          "/" +
          locale +
          (pathAfterVersion === "/" || pathAfterVersion === ""
            ? ""
            : pathAfterVersion);

        if (!localeRoutePaths.has(targetPath)) {
          fallbackRoutes.push({
            ...defRoute,
            path: targetPath,
            locale: locale,
          });
        }
      }
    }

    return sortRoutes([...routes, ...fallbackRoutes]);
  }

  return sortRoutes(routes);
}
