import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/node/index.ts',
    'src/client/index.ts',
    'src/client/ssr.tsx',
    'src/client/hooks/index.ts',
    'src/client/components/mdx/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  tsconfig: './tsconfig.json',
  clean: true,
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
  ],
})
