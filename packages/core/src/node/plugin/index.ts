import { pathToFileURL } from 'node:url'
import { type Plugin, type ResolvedConfig, loadEnv } from 'vite'
import { generateRoutes, invalidateRouteCache, invalidateFile } from '../routes'
import { adaptRoutesForSSG } from '../routes/route-adapter'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { resolveConfig, type BoltdocsConfig, CONFIG_FILES } from '../config'
import { normalizePath, isDocFile } from '../utils'
import { generateSitemap } from '../seo/sitemap'
import { generateRobotsTxt } from '../seo/robots'
import path from 'node:path'
import fs from 'node:fs'
import type { BoltdocsPluginOptions } from './types'
import { generateEntryCode } from './entry'
import { injectHtmlMeta, getHtmlTemplate } from './html'
import { generateSearchData } from '../search'
import { SECURITY_HEADERS } from '../security/headers'
import { getCSPHeader } from '../security/csp'
import {
  PluginLifecycleManager,
  validatePlugins,
  PluginSandbox,
  type SecureBoltdocsPlugin,
} from '../plugins'

// Internal import to avoid top-level side effects
import * as _node_module from 'node:module'

/**
 * Resolve a package to its absolute path to enforce singleton in monorepo
 */
function resolveSingleton(id: string) {
  // Only attempt to use node:module in a Node environment
  if (typeof process === 'undefined' || !process.versions?.node) {
    return undefined
  }

  try {
    const { createRequire } = _node_module
    const _require = createRequire(import.meta.url)
    return normalizePath(_require.resolve(id))
  } catch (e) {
    return undefined
  }
}


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
  let rawUserConfig: any
  let isBuild = false
  let lifecycle: PluginLifecycleManager

  // Use a placeholder for extra plugins that will be populated once config is resolved
  let resolvedExtraVitePlugins: Plugin[] = []

  return [
    {
      name: 'vite-plugin-boltdocs',
      enforce: 'pre',

      async config(userConfig, env) {
        rawUserConfig = userConfig
        isBuild = env.command === 'build'

        // Load env variables and inject into process.env so they are available in boltdocs.config.js
        const envDir = userConfig.envDir || process.cwd()
        const envs = loadEnv(env.mode, envDir, '')
        Object.assign(process.env, envs)

        // Resolve config async if not already passed
        if (!config) {
          config = await resolveConfig(docsDir)
        }

        // --- NEW: Secure Plugin Initialization ---
        const boltdocsVersion = (await import('../../../package.json')).version
        const validatedPlugins = validatePlugins(
          (config.plugins || []) as SecureBoltdocsPlugin[],
          boltdocsVersion,
        )

        // Replace config plugins with validated ones
        config.plugins = validatedPlugins as any

        // Initialize lifecycle manager
        lifecycle = new PluginLifecycleManager(validatedPlugins, config)

        // Populate validated extra Vite plugins
        resolvedExtraVitePlugins = validatedPlugins.flatMap((p) => {
          const caps = PluginSandbox.getSanitizedCapabilities(p)
          return (caps.vitePlugins || []) as Plugin[]
        })

        // Run beforeBuild if building
        if (isBuild) {
          await lifecycle.runHook('beforeBuild')
        }

        return {
          // @ts-ignore - @bdocs/ssg options
          ssgOptions: {
            entry: 'boltdocs/entry',
            htmlEntry: 'index.html',
            dirStyle: 'nested',
            includeAllRoutes: true,
            mock: true,
            script: 'async',
            beastiesOptions: {
              preload: 'media',
            },
            onFinished: async (outDir: string) => {
              const routes = await generateRoutes(docsDir, config)
              const ssgRoutes = adaptRoutesForSSG(routes)

              const sitemap = generateSitemap(ssgRoutes, config)
              if (sitemap) {
                fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap)
              }

              const robots = generateRobotsTxt(config)
              fs.writeFileSync(path.join(outDir, 'robots.txt'), robots)
            },
          },
          build: {
            ssrManifest: isBuild,
          },
          async config() {
            // Find the core package root and source directory robustly
            let packageRoot = __dirname
            while (
              packageRoot !== path.parse(packageRoot).root &&
              !fs.existsSync(path.join(packageRoot, 'package.json'))
            ) {
              packageRoot = path.dirname(packageRoot)
            }

            // If we found a package.json, verify it's the boltdocs package
            if (fs.existsSync(path.join(packageRoot, 'package.json'))) {
              const pkg = JSON.parse(
                fs.readFileSync(
                  path.join(packageRoot, 'package.json'),
                  'utf-8',
                ),
              )
              if (pkg.name !== 'boltdocs') {
                // Keep looking if it's not our package (e.g. monorepo root)
                let parentDir = path.dirname(packageRoot)
                while (parentDir !== path.parse(parentDir).root) {
                  if (fs.existsSync(path.join(parentDir, 'package.json'))) {
                    const parentPkg = JSON.parse(
                      fs.readFileSync(
                        path.join(parentDir, 'package.json'),
                        'utf-8',
                      ),
                    )
                    if (parentPkg.name === 'boltdocs') {
                      packageRoot = parentDir
                      break
                    }
                  }
                  parentDir = path.dirname(parentDir)
                }
              }
            }

            return {
              optimizeDeps: {
                include: ['react', 'react-dom', 'react-router-dom'],
                exclude: ['boltdocs', 'boltdocs/client'],
              },
              resolve: {
                alias: [
                  // Virtual entries (Keep these as they are truly virtual and generated)
                  {
                    find: 'boltdocs/entry',
                    replacement: normalizePath(
                      path.resolve(
                        options.root || process.cwd(),
                        'boltdocs-entry.cjs',
                      ),
                    ),
                  },
                ],
              },
            }
          },
        }
      },

      configResolved(resolved) {
        viteConfig = resolved
        lifecycle?.runHook('configResolved', config)
      },

      async configureServer(server) {
        await lifecycle?.runHook('beforeDev')

        // Security: Apply hardened headers and CSP
        server.middlewares.use((_req, res, next) => {
          const isProd = process.env.NODE_ENV === 'production'

          if (isProd) {
            Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
              res.setHeader(header, value)
            })
          }

          // Inject CSP if enabled in configuration
          if (config.security?.enableCSP) {
            res.setHeader('Content-Security-Policy', getCSPHeader(config))
          }

          next()
        })

        server.middlewares.use((req, res, next) => {
          if (req.url === '/robots.txt') {
            // robots.txt generation will be handled by the SSG pipeline after build
            // in dev, we just return a default or let it 404
            next()
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
            // Handle any HTML request that isn't a known static file or docs,
            // as it potentially could be an external page.
            // (The client-side router will handle 404s if it doesn't match anything)
            true

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
        const extPagesPaths = mdxCompExtensions.map((ext) =>
          path.resolve(docsDir, `pages-external/index.${ext}`),
        )

        const iconsPaths = mdxCompExtensions.map((ext) =>
          path.resolve(docsDir, `icons.${ext}`),
        )

        server.watcher.add([
          ...configPaths,
          ...mdxCompPaths,
          ...layoutCompPaths,
          ...extPagesPaths,
          ...iconsPaths,
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
                '\0virtual:boltdocs-mdx-components.tsx',
              )
              if (mod) server.moduleGraph.invalidateModule(mod)
              server.ws.send({ type: 'full-reload' })
              return
            }

            // If icons file changes, invalidate the virtual module
            if (
              mdxCompExtensions.some((ext) =>
                normalized.endsWith(`icons.${ext}`),
              )
            ) {
              const mod = server.moduleGraph.getModuleById(
                '\0virtual:boltdocs-icons.tsx',
              )
              if (mod) server.moduleGraph.invalidateModule(mod)
              server.ws.send({ type: 'full-reload' })
              return
            }

            // If layout.tsx/jsx file changes, invalidate the virtual module
            if (
              normalized.endsWith('layout.tsx') ||
              normalized.endsWith('layout.jsx')
            ) {
              const mod = server.moduleGraph.getModuleById(
                '\0virtual:boltdocs-layout.tsx',
              )
              if (mod) server.moduleGraph.invalidateModule(mod)
              server.ws.send({ type: 'full-reload' })
              return
            }

            // If any pages-external file changes, invalidate the entry module
            if (
              normalized.includes('/pages-external/') ||
              normalized.includes('\\pages-external\\')
            ) {
              const mod = server.moduleGraph.getModuleById(
                '\0virtual:boltdocs-entry',
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
                '\0virtual:boltdocs-config.ts',
              )
              if (configMod) server.moduleGraph.invalidateModule(configMod)

              server.ws.send({
                type: 'custom',
                event: 'boltdocs:config-update',
                data: {
                  theme: config?.theme,
                  i18n: config?.i18n,
                  versions: config?.versions,
                  siteUrl: config?.siteUrl,
                },
              })
            } else {
              invalidateFile(file)
            }

            const routesMod = server.moduleGraph.getModuleById(
              '\0virtual:boltdocs-routes.ts',
            )
            if (routesMod) server.moduleGraph.invalidateModule(routesMod)

            const configMod = server.moduleGraph.getModuleById(
              '\0virtual:boltdocs-config.ts',
            )
            if (configMod) server.moduleGraph.invalidateModule(configMod)

            // For SSG stability, we prefer a full-reload on route/config changes
            server.ws.send({ type: 'full-reload' })
          } catch (e) {
            console.error(`[boltdocs] HMR error during ${type} event:`, e)
          }
        }

        server.watcher.on('add', (f) => handleFileEvent(f, 'add'))
        server.watcher.on('unlink', (f) => handleFileEvent(f, 'unlink'))
        server.watcher.on('change', (f) => handleFileEvent(f, 'change'))

        await lifecycle?.runHook('afterDev')
      },

      resolveId(id) {
        const root = viteConfig?.root || process.cwd()
        if (
          id.includes('boltdocs-entry.mjs') ||
          id === 'virtual:boltdocs-entry' ||
          id === 'boltdocs-entry' ||
          id === '\0virtual:boltdocs-entry'
        ) {
          return normalizePath(path.resolve(root, 'boltdocs-entry.mjs'))
        }
        if (
          id.includes('boltdocs-client.mjs') ||
          id === 'virtual:boltdocs-client' ||
          id === 'boltdocs-client' ||
          id === '\0virtual:boltdocs-client.ts'
        ) {
          return normalizePath(path.resolve(root, 'boltdocs-client.mjs'))
        }

        // 3. Handle Virtual modules
        if (id.startsWith('virtual:boltdocs-')) {
          return '\0' + id
        }
        if (id.startsWith('\0virtual:boltdocs-')) {
          return id
        }

        return null
      },

      async load(id) {
        if (
          id.includes('boltdocs-entry.mjs') ||
          id === '\0virtual:boltdocs-entry'
        ) {
          return generateEntryCode(options, config)
        }

        if (
          id.includes('boltdocs-client.mjs') ||
          id === '\0virtual:boltdocs-client.ts' ||
          id === 'virtual:boltdocs-client'
        ) {
          // Find the package root
          let currentDir = __dirname
          let packageRoot = currentDir
          while (currentDir !== path.parse(currentDir).root) {
            if (fs.existsSync(path.join(currentDir, 'package.json'))) {
              const pkg = JSON.parse(
                fs.readFileSync(path.join(currentDir, 'package.json'), 'utf-8'),
              )
              if (pkg.name === 'boltdocs') {
                packageRoot = currentDir
                break
              }
            }
            currentDir = path.dirname(currentDir)
          }

          const srcPath = path.join(packageRoot, 'src/client/index.ts')
          const distPath = path.join(packageRoot, 'dist/client/index.js')

          let filePath = fs.existsSync(srcPath) ? srcPath : distPath

          const normalized = normalizePath(filePath)
          return `export * from '${normalized}';`
        }

        if (!id.startsWith('\0virtual:boltdocs-')) return

        const nameWithExt = id.replace('\0virtual:boltdocs-', '')
        const name = nameWithExt.replace(/\.tsx?$/, '')

        if (name === 'routes') {
          const routes = await generateRoutes(docsDir, config)
          const ssgRoutes = adaptRoutesForSSG(routes)
          return `export default ${JSON.stringify(ssgRoutes, null, 2)};`
        }
        if (name === 'config') {
          const clientConfig = {
            theme: config?.theme,
            i18n: config?.i18n,
            versions: config?.versions,
            siteUrl: config?.siteUrl,
            plugins: config?.plugins?.map((p) => ({ name: p.name })),
          }
          return `export default ${JSON.stringify(clientConfig, null, 2)};`
        }
        if (name === 'entry') {
          const code = generateEntryCode(options, config)
          return code
        }
        if (name === 'mdx-components') {
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
        if (name === 'layout') {
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
          const defaultLayoutPath = normalizePath(
            path.resolve(
              __dirname,
              '../../client/components/default-layout.tsx',
            ),
          )
          return `import { DefaultLayout } from '${defaultLayoutPath}';
export default DefaultLayout;`
        }

        if (name === 'icons') {
          const extensions = ['tsx', 'jsx', 'ts', 'js']
          let userIconsPath = null

          for (const ext of extensions) {
            const p = path.resolve(docsDir, `icons.${ext}`)
            if (fs.existsSync(p)) {
              userIconsPath = p
              break
            }
          }

          if (userIconsPath) {
            const normalizedPath = normalizePath(userIconsPath)
            return `import * as icons from '${normalizedPath}';\nexport default icons;`
          }

          return `export default {};`
        }

        if (name === 'search') {
          const routes = await generateRoutes(docsDir, config)
          const searchData = generateSearchData(routes)
          return `export default ${JSON.stringify(searchData, null, 2)};`
        }

        if (name === 'client') {
          // Determine the client path relative to the core package root.
          // We start from __dirname and look for 'src/client/index.ts' or 'dist/client/index.ts'
          // going up until we find it or reach the workspace root.
          let currentDir = __dirname
          let clientPath = ''

          while (currentDir && currentDir !== path.parse(currentDir).root) {
            const srcPath = path.join(currentDir, 'src/client/index.ts')
            const distPath = path.join(currentDir, 'dist/client/index.mjs')
            const directPath = path.join(currentDir, 'client/index.ts')

            if (fs.existsSync(srcPath)) {
              clientPath = normalizePath(srcPath)
              break
            }
            if (fs.existsSync(distPath)) {
              clientPath = normalizePath(distPath)
              break
            }
            if (fs.existsSync(directPath)) {
              clientPath = normalizePath(directPath)
              break
            }
            currentDir = path.dirname(currentDir)
          }

          if (!clientPath) {
            throw new Error(
              `[boltdocs] Could not resolve boltdocs/client entry point starting from ${__dirname}`,
            )
          }

          return `export * from '${clientPath}';`
        }
      },

      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          return injectHtmlMeta(html, config)
        },
      },

      async closeBundle() {
        if (!isBuild || viteConfig?.build?.ssr) return

        await lifecycle?.runHook('afterBuild')
        await lifecycle?.runHook('buildEnd')
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
    // Re-bind to use the lazily populated extra plugins
    {
      name: 'vite-plugin-boltdocs-extra-plugins',
      async configResolved() {
        // This is a dummy plugin to ensure the extra plugins are integrated
        // Actually, Vite doesn't support changing the plugin list dynamically easily
        // but we can return them in the original array if we initialize them early.
      },
    },
    ...(() => resolvedExtraVitePlugins)(),
  ]
}
