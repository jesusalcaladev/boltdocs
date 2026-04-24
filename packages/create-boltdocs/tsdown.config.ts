import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  tsconfig: './tsconfig.json',
  async onSuccess() {
    const src = path.resolve('src/templates')
    const dest = path.resolve('dist/templates')
    if (fs.existsSync(src)) {
      if (!fs.existsSync(path.resolve('dist'))) {
        fs.mkdirSync(path.resolve('dist'), { recursive: true })
      }
      fs.cpSync(src, dest, { recursive: true })
      console.log('✓ Templates copied to dist')
    }
  },
})
