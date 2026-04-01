import type { Plugin, InlineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { boltdocsPlugin } from './plugin/index'
import { boltdocsMdxPlugin } from './mdx'
import type { BoltdocsPluginOptions } from './plugin/index'

import { resolveConfig, type BoltdocsConfig } from './config'

export default async function boltdocs(
  options?: BoltdocsPluginOptions,
): Promise<Plugin[]> {
  const docsDir = options?.docsDir || 'docs'
  const config = await resolveConfig(docsDir)

  // Merge options with config
  const mergedOptions: BoltdocsPluginOptions = {
    ...options,
    homePage: options?.homePage || config.homePage,
  }

  return [...boltdocsPlugin(mergedOptions, config), boltdocsMdxPlugin(config)]
}

/**
 * Generates the complete Vite configuration for a Boltdocs project.
 * This is used by the Boltdocs CLI to run Vite without a user-defined vite.config.ts.
 */
export async function createViteConfig(
  root: string,
  mode: 'development' | 'production' = 'development',
): Promise<InlineConfig> {
  const config = await resolveConfig('docs', root)

  const viteConfig: InlineConfig = {
    root,
    mode,
    plugins: [
      react(),
      tailwindcss(),
      await boltdocs({
        docsDir: config.docsDir,
        homePage: config.homePage,
      }),
    ],
    ...config.vite,
  }

  return viteConfig
}

export type { BoltdocsPluginOptions }
export { generateStaticPages } from './ssg'
export type { SSGOptions } from './ssg'
export type { RouteMeta } from './routes'
export type { BoltdocsConfig, BoltdocsThemeConfig } from './config'
export { resolveConfig, defineConfig } from './config'
