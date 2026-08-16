import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { generateRoutes } from '../src/node/routes'

describe('native parser probe', () => {
  it('generates routes with the native parser', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'boltdocs-parser-probe-'))
    fs.writeFileSync(path.join(root, 'intro.mdx'), '---\ntitle: Intro\n---\n# Hola\n')
    const routes = await generateRoutes(root, { theme: { title: 'T' } } as any)
    expect(routes.length).toBe(1)
    expect(routes[0].title).toBe('Intro')
    fs.rmSync(root, { recursive: true, force: true })
  })
})
