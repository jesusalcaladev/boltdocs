import { preview } from 'vite'
import { build as ssgBuild } from '@bdocs/ssg/node'
import { createViteConfig } from '../index'
import * as ui from './ui'

/**
 * Logic for the `boltdocs build` command.
 * Performs a production build with hydration support via @bdocs/ssg.
 *
 * @param root - The project root directory
 */
export async function buildAction(root: string = process.cwd()) {
  try {
    const viteConfig = await createViteConfig(root, 'production')

    // We use virtual modules and internalized HTML injection,
    // so no physical files need to be written to the project root.
    await ssgBuild({ entry: 'boltdocs/entry' }, viteConfig)
    ui.success('SSG build completed successfully!')
  } catch (e) {
    ui.error('Build failed:', e)
    process.exit(1)
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
