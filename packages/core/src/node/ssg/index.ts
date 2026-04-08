import fs from 'fs'
import path from 'path'
import { generateRoutes } from '../routes'
import { escapeHtml, getTranslated } from '../utils'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

import type { SSGOptions } from './options'
import { replaceMetaTags } from './meta'
import { generateSitemap } from './sitemap'
import { generateRobotsTxt } from './robots'

// Re-export options for consumers
export type { SSGOptions }

// Polyfill __dirname and require for ESM
const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)
const _require = createRequire(import.meta.url)

/**
 * Generates static HTML files and a \`sitemap.xml\` for all documentation routes.
 * Called automatically in the \`closeBundle\` hook of the Vite plugin during a production build.
 *
 * @param options - Configuration for paths and site metadata
 */
export async function generateStaticPages(options: SSGOptions): Promise<void> {
  const { docsDir, docsDirName, outDir, config } = options
  const routes = await generateRoutes(docsDir, config)

  // Detect external routes to include in SSG
  const externalModulePath = ['tsx', 'ts', 'jsx', 'js']
    .map((ext) => path.resolve(docsDir, `pages-external/index.${ext}`))
    .find((p) => fs.existsSync(p))

  if (externalModulePath) {
    try {
      // We use a simple way to get the keys of the 'pages' export
      // Since we can't easily execute TSX in this context without a bundler,
      // we'll at least try to generate placeholder pages for them
      // OR we can try to use 'esbuild' to get the exports
      const content = fs.readFileSync(externalModulePath, 'utf-8')
      const pagesMatch = content.match(/pages\s*:\s*{([^}]+)}/s)
      if (pagesMatch) {
        const paths = pagesMatch[1]
          .split(',')
          .map((line) => line.split(':')[0].trim().replace(/['"]/g, ''))
          .filter((p) => p && p.startsWith('/'))

        for (const p of paths) {
          if (!routes.some((r) => r.path === p)) {
            routes.push({
              path: p,
              title: p.slice(1).charAt(0).toUpperCase() + p.slice(2),
              filePath: '',
              componentPath: '',
              _content: '',
            } as any)
          }
        }
      }

      // Always include home page if it might be custom
      if (content.includes('homePage') && !routes.some((r) => r.path === '/')) {
        routes.push({
          path: '/',
          title: 'Home',
          filePath: '',
          componentPath: '',
          _content: '',
        } as any)
      }
    } catch (e) {
      console.warn('[boltdocs] Failed to parse external routes for SSG:', e)
    }
  }

  // Resolve the SSR module (compiled by tsup)
  const ssrModulePath = path.resolve(_dirname, '../client/ssr.js')
  if (!fs.existsSync(ssrModulePath)) {
    console.error(
      '[boltdocs] SSR module not found at',
      ssrModulePath,
      '- Did you build the core package?',
    )
    return
  }

  // Mock require so Node doesn't choke on virtual modules compiled externally
  const Module = _require('module')
  const originalRequire = Module.prototype.require
  ;(Module.prototype as any).require = function (id: string, ...args: any[]) {
    if (id === 'virtual:boltdocs-layout') {
      return {
        __esModule: true,
        default: function SSG_Virtual_Layout(props: any) {
          try {
            const client = originalRequire.apply(this, [
              path.resolve(_dirname, '../client/index.js'),
            ])
            const Comp =
              client.DefaultLayout || (({ children }: any) => children)
            const React = originalRequire.apply(this, ['react'])
            return React.createElement(Comp, props)
          } catch (e) {
            return props.children
          }
        },
      }
    }
    return originalRequire.apply(this, [id, ...args])
  }

  const { render } = _require(ssrModulePath)

  // Restore require after loading the module
  ;(Module.prototype as any).require = originalRequire

  // Read the built index.html as template
  const templatePath = path.join(outDir, 'index.html')
  if (!fs.existsSync(templatePath)) {
    console.warn('[boltdocs] No index.html found in outDir, skipping SSG.')
    return
  }
  const template = fs.readFileSync(templatePath, 'utf-8')

  // Generate an HTML file for each route concurrently
  await Promise.all(
    routes.map(async (route) => {
      const siteTitle =
        getTranslated(config?.theme?.title, route.locale) || 'Boltdocs'
      const siteDescription =
        getTranslated(config?.theme?.description, route.locale) || ''
      const pageTitle = `${route.title} | ${siteTitle}`
      const pageDescription = route.description || siteDescription

      // We mock the modules for SSR so it doesn't crash trying to dynamically import
      const fakeModules: Record<string, any> = {}
      fakeModules[`/${docsDirName}/${route.filePath}`] = { default: () => null } // Mock MDX component

      try {
        const appHtml = await render({
          path: route.path,
          routes: routes,
          config: config || {},
          docsDirName: docsDirName,
          modules: fakeModules,
          homePage: undefined, // No custom home page for now
        })

        const html = replaceMetaTags(template, {
          title: escapeHtml(pageTitle),
          description: escapeHtml(pageDescription),
        })
          .replace('<!--app-html-->', appHtml)
          .replace(`<div id="root"></div>`, `<div id="root">${appHtml}</div>`)

        const routeDir = path.join(outDir, route.path)
        await fs.promises.mkdir(routeDir, { recursive: true })
        await fs.promises.writeFile(
          path.join(routeDir, 'index.html'),
          html,
          'utf-8',
        )
      } catch (e: any) {
        console.error(
          `[boltdocs] Error SSR rendering route ${route.path}:`,
          e ? e.stack || e : e,
        )
      }
    }),
  )

  // Generate sitemap.xml
  const sitemap = generateSitemap(
    routes.map((r) => r.path),
    config,
  )
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf-8')

  // Generate robots.txt
  const robots = generateRobotsTxt(config!)
  fs.writeFileSync(path.join(outDir, 'robots.txt'), robots, 'utf-8')

  console.log(
    `[boltdocs] Generated ${routes.length} static pages + sitemap.xml + robots.txt`,
  )

  // Ensure all cache operations (like index persistence) are finished
  const { flushCache } = await import('../cache')
  await flushCache()
}
