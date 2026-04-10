import { defineConfig } from 'tsup'
import type { Options } from 'tsup'

const commonConfig: Options = {
  format: ['cjs', 'esm'],
  dts: true,
  tsconfig: './tsconfig.json',
  minify: true,
  minifySyntax: true,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  shims: true,
  external: [
    'vite',
    'react',
    'react-dom',
    'react-router-dom',
    'virtual:boltdocs-routes',
    'virtual:boltdocs-config',
    'virtual:boltdocs-layout',
    'virtual:boltdocs-mdx-components',
    'virtual:boltdocs-entry',
    /^virtual:boltdocs-/, // Broad catch-all for any virtual modules
  ],
}

export default defineConfig([
  // Node Build
  {
    ...commonConfig,
    clean: true,
    platform: 'node',
    entry: {
      'node/index': 'src/node/index.ts',
      'node/cli-entry': 'src/node/cli-entry.ts',
    },
  },
  // Client Build
  {
    ...commonConfig,
    clean: false, // Don't clean the outDir twice
    platform: 'browser',
    entry: {
      'client/index': 'src/client/index.ts',
    },
  },
  // SSR Build (Needs Node platform for Server-Side Rendering)
  {
    ...commonConfig,
    clean: false, // Don't clean the outDir
    platform: 'node',
    entry: {
      'client/ssr': 'src/client/ssr.tsx',
    },
  },
])
