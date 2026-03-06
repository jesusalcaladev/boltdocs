import { Plugin, ResolvedConfig, loadEnv } from "vite";
import {
  generateRoutes,
  invalidateRouteCache,
  invalidateFile,
} from "../routes";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { resolveConfig, BoltdocsConfig, CONFIG_FILES } from "../config";
import { generateStaticPages } from "../ssg";
import { normalizePath, isDocFile } from "../utils";
import path from "path";

import { BoltdocsPluginOptions } from "./types";
import { generateEntryCode } from "./entry";
import { injectHtmlMeta } from "./html";

export * from "./types";

/**
 * The core Boltdocs Vite plugin.
 * Handles virtual module resolution, HMR for documentation files,
 * injecting HTML meta tags for SEO, and triggering the SSG process on build.
 *
 * @param options - Optional configuration for the plugin
 * @param passedConfig - Pre-resolved configuration (internal use)
 * @returns An array of Vite plugins
 */
export function boltdocsPlugin(
  options: BoltdocsPluginOptions = {},
  passedConfig?: BoltdocsConfig,
): Plugin[] {
  const docsDir = path.resolve(process.cwd(), options.docsDir || "docs");
  const normalizedDocsDir = normalizePath(docsDir);
  let config: BoltdocsConfig = passedConfig!;
  let viteConfig: ResolvedConfig;
  let isBuild = false;

  const extraVitePlugins =
    config?.plugins?.flatMap((p) => p.vitePlugins || []) || [];

  return [
    {
      name: "vite-plugin-boltdocs",
      enforce: "pre",

      async config(userConfig, env) {
        isBuild = env.command === "build";

        // Load env variables and inject into process.env so they are available in boltdocs.config.js
        const envDir = userConfig.envDir || process.cwd();
        const envs = loadEnv(env.mode, envDir, "");
        Object.assign(process.env, envs);

        // Resolve config async if not already passed
        if (!config) {
          config = await resolveConfig(docsDir);
        }

        // If customCss specified in user's config file, use it
        if (!options.customCss && config.themeConfig?.customCss) {
          options.customCss = config.themeConfig.customCss;
        }

        return {
          optimizeDeps: { include: ["react", "react-dom"] },
        };
      },

      configResolved(resolved) {
        viteConfig = resolved;
      },

      configureServer(server) {
        // Explicitly watch config files to trigger server restarts
        const configPaths = CONFIG_FILES.map((c) =>
          path.resolve(process.cwd(), c),
        );
        server.watcher.add(configPaths);

        const handleFileEvent = async (
          file: string,
          type: "add" | "unlink" | "change",
        ) => {
          const normalized = normalizePath(file);

          // Restart the Vite server if the Boltdocs config changes
          if (CONFIG_FILES.some((c) => normalized.endsWith(c))) {
            server.restart();
            return;
          }

          if (
            !normalized.startsWith(normalizedDocsDir) ||
            !isDocFile(normalized)
          )
            return;

          // Invalidate appropriately
          if (type === "add" || type === "unlink") {
            invalidateRouteCache();
          } else {
            invalidateFile(file);
          }

          // Regenerate and push to client
          const newRoutes = await generateRoutes(docsDir, config);

          const routesMod = server.moduleGraph.getModuleById(
            "\0virtual:boltdocs-routes",
          );
          if (routesMod) server.moduleGraph.invalidateModule(routesMod);

          server.ws.send({
            type: "custom",
            event: "boltdocs:routes-update",
            data: newRoutes,
          });
        };

        server.watcher.on("add", (f) => handleFileEvent(f, "add"));
        server.watcher.on("unlink", (f) => handleFileEvent(f, "unlink"));
        server.watcher.on("change", (f) => handleFileEvent(f, "change"));
      },

      resolveId(id) {
        if (
          id === "virtual:boltdocs-routes" ||
          id === "virtual:boltdocs-config" ||
          id === "virtual:boltdocs-entry"
        ) {
          return "\0" + id;
        }
      },

      async load(id) {
        if (id === "\0virtual:boltdocs-routes") {
          const routes = await generateRoutes(docsDir, config);
          return `export default ${JSON.stringify(routes, null, 2)};`;
        }
        if (id === "\0virtual:boltdocs-config") {
          const clientConfig = {
            themeConfig: config?.themeConfig,
            i18n: config?.i18n,
            versions: config?.versions,
            siteUrl: config?.siteUrl,
          };
          return `export default ${JSON.stringify(clientConfig, null, 2)};`;
        }
        if (id === "\0virtual:boltdocs-entry") {
          const code = generateEntryCode(options, config);
          return code;
        }
      },

      transformIndexHtml: {
        order: "pre",
        handler(html) {
          return injectHtmlMeta(html, config);
        },
      },

      async closeBundle() {
        if (!isBuild) return;
        const outDir = viteConfig?.build?.outDir
          ? path.resolve(viteConfig.root, viteConfig.build.outDir)
          : path.resolve(process.cwd(), "dist");

        await generateStaticPages({ docsDir, outDir, config });
      },
    },
    ViteImageOptimizer({
      includePublic: true,
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 80 },
      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: { overrides: { removeViewBox: false } },
          },
        ] as any,
      },
    }),
    ...extraVitePlugins.filter((p): p is Plugin => !!p),
  ];
}
