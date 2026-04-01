import { createServer, build, preview } from 'vite'
import { createViteConfig, resolveConfig } from './index'
import { getHtmlTemplate } from './plugin/html'
import path from 'path'
import fs from 'fs'

/**
 * Core logic for the Boltdocs CLI commands.
 * These functions wrap Vite's JS API to provide a seamless experience.
 */

export async function devAction(root: string = process.cwd()) {
  try {
    const viteConfig = await createViteConfig(root, 'development')
    const server = await createServer(viteConfig)
    await server.listen()
    server.printUrls()
    server.bindCLIShortcuts({ print: true })
  } catch (e) {
    console.error('[boltdocs] Failed to start dev server:', e)
    process.exit(1)
  }
}

export async function buildAction(root: string = process.cwd()) {
  let createdIndexHtml = false
  const indexPath = path.resolve(root, 'index.html')

  try {
    if (!fs.existsSync(indexPath)) {
      const config = await resolveConfig('docs', root)
      fs.writeFileSync(indexPath, getHtmlTemplate(config), 'utf-8')
      createdIndexHtml = true
    }

    const viteConfig = await createViteConfig(root, 'production')
    await build(viteConfig)
    console.log('[boltdocs] Build completed successfully.')
  } catch (e) {
    console.error('[boltdocs] Build failed:', e)
    process.exit(1)
  } finally {
    if (createdIndexHtml && fs.existsSync(indexPath)) {
      fs.unlinkSync(indexPath)
    }
  }
}

export async function previewAction(root: string = process.cwd()) {
  try {
    const viteConfig = await createViteConfig(root, 'production')
    const previewServer = await preview(viteConfig)
    previewServer.printUrls()
  } catch (e) {
    console.error('[boltdocs] Failed to start preview server:', e)
    process.exit(1)
  }
}

