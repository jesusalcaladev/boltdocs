import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'node/index': 'src/node/index.ts',
    'client/index': 'src/client/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'vite', 'mermaid'],
  tsconfig: './tsconfig.json',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs',
    }
  },
})
