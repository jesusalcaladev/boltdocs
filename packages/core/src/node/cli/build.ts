import { build, preview } from 'vite'
import { createViteConfig, resolveConfig } from '../index'
import { getHtmlTemplate } from '../plugin/html'
import path from 'path'
import fs from 'fs'
import * as ui from './ui'

/**
 * Logic for the `boltdocs build` command.
 * Prepares the production bundle and handles dynamic index.html generation.
 *
 * @param root - The project root directory
 */
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
    ui.success('Build completed successfully.')
  } catch (e) {
    ui.error('Build failed:', e)
    process.exit(1)
  } finally {
    if (createdIndexHtml && fs.existsSync(indexPath)) {
      fs.unlinkSync(indexPath)
    }
  }
}

/**
 * Logic for the `boltdocs preview` command.
 * Serves the production build from the disk.
 *
 * @param root - The project root directory
 */
export async function previewAction(root: string = process.cwd()) {
  try {
    const viteConfig = await createViteConfig(root, 'production')
    const previewServer = await preview(viteConfig)
    previewServer.printUrls()
  } catch (e) {
    ui.error('Failed to start preview server:', e)
    process.exit(1)
  }
}
