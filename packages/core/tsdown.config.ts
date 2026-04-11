import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'tsdown'

const banner = `/**
 * Boltdocs - https://boltdocs.vercel.app
 * Copyright (c) 2026 Jesus Alcala
 * Licensed under the MIT License.
 */`

export default defineConfig([
  // Node Build
  {
    entry: {
      'node/index': 'src/node/index.ts',
      'node/cli-entry': 'src/node/cli-entry.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    tsconfig: './tsconfig.json',
    minify: true,
    platform: 'node',
    shims: true,
    clean: true,
    banner: {
      js: banner,
      css: banner,
    },
    deps: {
      skipNodeModulesBundle: true,
      neverBundle: [
        'virtual:boltdocs-routes',
        'virtual:boltdocs-config',
        'virtual:boltdocs-layout',
        'virtual:boltdocs-mdx-components',
        'virtual:boltdocs-entry',
      ],
    },
    async onSuccess() {
      const src = path.resolve(__dirname, 'src/client/theme/neutral.css')
      const destDir = path.resolve(__dirname, 'dist/client/theme')
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }
      fs.copyFileSync(src, path.resolve(destDir, 'neutral.css'))
      console.log('✓ Theme neutral.css copied to dist')
    },
  },
  // Client Build
  {
    entry: {
      'client/index': 'src/client/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    tsconfig: './tsconfig.json',
    minify: true,
    platform: 'browser',
    shims: true,
    clean: false,
    banner: {
      js: banner,
      css: banner,
    },
    deps: {
      skipNodeModulesBundle: true,
      neverBundle: [
        'virtual:boltdocs-routes',
        'virtual:boltdocs-config',
        'virtual:boltdocs-layout',
        'virtual:boltdocs-mdx-components',
        'virtual:boltdocs-entry',
      ],
    },
  },
  // SSR Build (Needs Node platform for Server-Side Rendering)
  {
    entry: {
      'client/ssr': 'src/client/ssr.tsx',
    },
    format: ['cjs', 'esm'],
    dts: true,
    tsconfig: './tsconfig.json',
    minify: true,
    platform: 'node',
    shims: true,
    clean: false,
    banner: {
      js: banner,
      css: banner,
    },
    deps: {
      skipNodeModulesBundle: true,
      neverBundle: [
        'virtual:boltdocs-routes',
        'virtual:boltdocs-config',
        'virtual:boltdocs-layout',
        'virtual:boltdocs-mdx-components',
        'virtual:boltdocs-entry',
      ],
    },
  },
])
