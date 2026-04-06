import { type Plugin, type ResolvedConfig, loadEnv } from 'vite'
import { generateRoutes, invalidateRouteCache, invalidateFile } from '../routes'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { resolveConfig, type BoltdocsConfig, CONFIG_FILES } from '../config'
import { generateStaticPages } from '../ssg'
import { normalizePath, isDocFile } from '../utils'
import path from 'path'
import type { BoltdocsPluginOptions } from './types'
import { generateEntryCode } from './entry'
import { injectHtmlMeta, getHtmlTemplate } from './html'
import { generateRobotsTxt } from '../ssg/robots'
import { generateSearchData } from '../search'
import fs from 'fs'

export * from './types'

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
  const docsDir = path.resolve(process.cwd(), options.docsDir || 'docs')
  const normalizedDocsDir = normalizePath(docsDir)
  let config: BoltdocsConfig = passedConfig!
  let viteConfig: ResolvedConfig
  let isBuild = false

  const extraVitePlugins =
    config?.plugins?.flatMap((p) => p.vitePlugins || []) || []

  return [
    {
      name: 'vite-plugin-boltdocs',
      enforce: 'pre',

      async config(userConfig, env) {
        isBuild = env.command === 'build'

        // Load env variables and inject into process.env so they are available in boltdocs.config.js
        const envDir = userConfig.envDir || process.cwd()
        const envs = loadEnv(env.mode, envDir, '')
        Object.assign(process.env, envs)

        // Resolve config async if not already passed
        if (!config) {
          config = await resolveConfig(docsDir)
        }

        return {
          optimizeDeps: {
            include: ['react', 'react-dom'],
            exclude: [
              'boltdocs',
              'boltdocs/client',
              'boltdocs/hooks',
              'boltdocs/primitives',
              'boltdocs/base-ui',
              'boltdocs/mdx',
              'boltdocs/integrations',
              'boltdocs/client/hooks',
              'boltdocs/client/primitives',
            ],
          },
        }
      },

      configResolved(resolved) {
        viteConfig = resolved
      },

      configureServer(server) {
        // Serve robots.txt from config
        server.middlewares.use((req, res, next) => {
          if (req.url === '/robots.txt') {
            const robots = generateRobotsTxt(config)
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/plain')
            res.end(robots)
            return
          }
          next()
        })

        // Serve default HTML for documentation routes or if index.html is missing
        server.middlewares.use(async (req, res, next) => {
          const url = req.url?.split('?')[0] || '/'
          const accept = req.headers.accept || ''

          const isDocRoute =
            url === '/' ||
            url.startsWith('/docs') ||
            (config.i18n &&
              Object.keys(config.i18n.locales).some(
                (locale) =>
                  url.startsWith(`/${locale}/docs`) || url === `/${locale}`,
              )) ||
            (config.external &&
              Object.keys(config.external).some((extPath) =>
                url.startsWith(extPath),
              ))

          // Improved check: If it's a doc route, serve HTML even if it has a dot (e.g. version 1.1)
          // We only skip if it has a known asset extension to prevent serving HTML for images/js/etc.
          const isAsset =
            /\.(js|css|png|jpe?g|gif|svg|ico|webp|woff2?|ttf|otf|mp4|webm|ogg|mp3|wav|flac|aac|pdf|zip|gz|map|json)$/i.test(
              url,
            )

          if (accept.includes('text/html') && !isAsset && isDocRoute) {
            let html = getHtmlTemplate(config)
            html = injectHtmlMeta(html, config)
            html = await server.transformIndexHtml(req.url || '/', html)
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            res.end(html)
            return
          }

          next()
        })

        // Explicitly watch config files...

        const configPaths = CONFIG_FILES.map((c) =>
          path.resolve(process.cwd(), c),
        )
        const compExtensions = ['tsx', 'jsx']
        const layoutCompPaths = compExtensions.map((ext) =>
          path.resolve(docsDir, `layout.${ext}`),
        )
        const mdxCompExtensions = ['tsx', 'ts', 'jsx', 'js']
        const mdxCompPaths = mdxCompExtensions.map((ext) =>
          path.resolve(docsDir, `mdx-components.${ext}`),
        )

        server.watcher.add([
          ...configPaths,
          ...mdxCompPaths,
          ...layoutCompPaths,
        ])

        const handleFileEvent = async (
          file: string,
          type: 'add' | 'unlink' | 'change',
        ) => {
          try {
            const normalized = normalizePath(file)

            // Restart the Vite server if the Boltdocs config changes
            if (CONFIG_FILES.some((c) => normalized.endsWith(c))) {
              server.restart()
              return
            }

            // If mdx-components file changes, invalidate the virtual module
            if (
              mdxCompExtensions.some((ext) =>
                normalized.endsWith(`mdx-components.${ext}`),
              )
            ) {
              const mod = server.moduleGraph.getModuleById(
                '\0virtual:boltdocs-mdx-components',
              )
              if (mod) server.moduleGraph.invalidateModule(mod)
              server.ws.send({ type: 'full-reload' })
              return
            }

            // If layout.tsx/jsx file changes, invalidate the virtual module
            if (
              compExtensions.some((ext) => normalized.endsWith(`layout.${ext}`))
            ) {
              const mod = server.moduleGraph.getModuleById(
                '\0virtual:boltdocs-layout',
              )
              if (mod) server.moduleGraph.invalidateModule(mod)
              server.ws.send({ type: 'full-reload' })
              return
            }

            if (
              !normalized.startsWith(normalizedDocsDir) ||
              !isDocFile(normalized)
            )
              return

            // Invalidate appropriately
            if (type === 'add' || type === 'unlink') {
              invalidateRouteCache()
              // Re-resolve config as it might affect versions/routes
              config = await resolveConfig(docsDir)

              const configMod = server.moduleGraph.getModuleById(
                '\0virtual:boltdocs-config',
              )
              if (configMod) server.moduleGraph.invalidateModule(configMod)

              server.ws.send({
                type: 'custom',
                event: 'boltdocs:config-update',
                data: {
                  theme: config?.theme,
                  integrations: config?.integrations,
                  i18n: config?.i18n,
                  versions: config?.versions,
                  siteUrl: config?.siteUrl,
                },
              })
            } else {
              invalidateFile(file)
            }

            // Regenerate and push to client
            // Optimization: generateRoutes is mostly incremental thanks to docCache
            // We only force a full disk scan on add/unlink events
            const newRoutes = await generateRoutes(
              docsDir,
              config,
              '/docs',
              type !== 'change',
            )

            const routesMod = server.moduleGraph.getModuleById(
              '\0virtual:boltdocs-routes',
            )
            if (routesMod) server.moduleGraph.invalidateModule(routesMod)

            server.ws.send({
              type: 'custom',
              event: 'boltdocs:routes-update',
              data: newRoutes,
            })
          } catch (e) {
            console.error(`[boltdocs] HMR error during ${type} event:`, e)
          }
        }

        server.watcher.on('add', (f) => handleFileEvent(f, 'add'))
        server.watcher.on('unlink', (f) => handleFileEvent(f, 'unlink'))
        server.watcher.on('change', (f) => handleFileEvent(f, 'change'))
      },

      resolveId(id) {
        if (
          id === 'virtual:boltdocs-routes' ||
          id === 'virtual:boltdocs-config' ||
          id === 'virtual:boltdocs-entry' ||
          id === 'virtual:boltdocs-mdx-components' ||
          id === 'virtual:boltdocs-layout' ||
          id === 'virtual:boltdocs-search'
        ) {
          return '\0' + id
        }
      },

      async load(id) {
        if (id === '\0virtual:boltdocs-routes') {
          const routes = await generateRoutes(docsDir, config)
          return `export default ${JSON.stringify(routes, null, 2)};`
        }
        if (id === '\0virtual:boltdocs-config') {
          const clientConfig = {
            theme: config?.theme,
            integrations: config?.integrations,
            i18n: config?.i18n,
            versions: config?.versions,
            siteUrl: config?.siteUrl,
            plugins: config?.plugins?.map((p) => ({ name: p.name })),
          }
          return `export default ${JSON.stringify(clientConfig, null, 2)};`
        }
        if (id === '\0virtual:boltdocs-entry') {
          const code = generateEntryCode(options, config)
          return code
        }
        if (id === '\0virtual:boltdocs-mdx-components') {
          const extensions = ['tsx', 'ts', 'jsx', 'js']
          let userMdxPath = null

          for (const ext of extensions) {
            const p = path.resolve(docsDir, `mdx-components.${ext}`)
            if (fs.existsSync(p)) {
              userMdxPath = p
              break
            }
          }

          if (userMdxPath) {
            const normalizedPath = normalizePath(userMdxPath)
            return `import * as components from '${normalizedPath}';
const mdxComponents = components.default || components;
export default mdxComponents;
export * from '${normalizedPath}';`
          }

          return `export default {};`
        }
        if (id === '\0virtual:boltdocs-layout') {
          const extensions = ['tsx', 'jsx']
          let userLayoutPath = null

          for (const ext of extensions) {
            const p = path.resolve(docsDir, `layout.${ext}`)
            if (fs.existsSync(p)) {
              userLayoutPath = p
              break
            }
          }

          if (userLayoutPath) {
            const normalizedPath = normalizePath(userLayoutPath)
            return `import UserLayout from '${normalizedPath}';
export default UserLayout;`
          }

          // No user layout — return the built-in default
          return `import { DefaultLayout } from 'boltdocs/client';
export default DefaultLayout;`
        }

        if (id === '\0virtual:boltdocs-search') {
          const routes = await generateRoutes(docsDir, config)
          const searchData = generateSearchData(routes)
          return `export default ${JSON.stringify(searchData, null, 2)};`
        }
      },

      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          return injectHtmlMeta(html, config)
        },
      },

      async closeBundle() {
        if (!isBuild) return
        const outDir = viteConfig?.build?.outDir
          ? path.resolve(viteConfig.root, viteConfig.build.outDir)
          : path.resolve(process.cwd(), 'dist')

        const docsDirName = path.basename(docsDir || 'docs')
        await generateStaticPages({ docsDir, docsDirName, outDir, config })

        const { flushCache } = await import('../cache')
        await flushCache()
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
            name: 'preset-default',
          },
        ] as any,
      },
    }),
    ...extraVitePlugins.filter((p): p is Plugin => !!p),
  ]
}
