import { describe, expect, it } from 'vitest'
import { createServer } from 'vite'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

describe('vite dev server probe', () => {
  it('starts a dev server and transforms a stub MDX file', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'boltdocs-vite-probe-'))
    fs.writeFileSync(path.join(root, 'index.html'), '<div id="root"></div>')

    const mdxPlugin = {
      name: 'stub-mdx',
      enforce: 'pre' as const,
      load(id: string) {
        if (id.endsWith('.mdx')) {
          return 'export default "stub-content"'
        }
        return null
      },
    }

    const server = await createServer({
      root,
      logLevel: 'silent',
      server: { watch: { ignored: ['**/.boltdocs/**'] } },
      plugins: [mdxPlugin],
    })
    try {
      const result = await server.transformRequest('/docs/intro.mdx')
      expect(result).toBeTruthy()
      expect(result?.code).toContain('stub-content')
    } finally {
      await server.close()
    }
  })
})
