import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { it, vi } from 'vitest'
import { createServer, type Plugin } from 'vite'

vi.mock('@bdocs/processor-satteri/node', () => ({ invalidateMdxFileCache: vi.fn() }))
vi.mock('../src/node/types-generator', () => ({ generateProjectTypes: vi.fn(), writeLinkTree: vi.fn() }))
vi.mock('../src/node/cli/doctor', () => ({ generateLinkTree: vi.fn(async () => {}) }))

import { createVirtualModulesPlugin } from '../src/node/plugin/virtual-modules'
import { createDevServerPlugin } from '../src/node/dev-server/index'
import { createPluginRuntimeState } from '../src/node/plugins/plugin-context'
import { getRouteCacheContext } from '../src/node/routes/cache'
import { normalizePath } from '../src/node/utils'

function createStubMdxPlugin(): Plugin {
  return {
    name: 'test-stub-mdx',
    enforce: 'pre',
    load(id) {
      const [cleanId] = id.split('?')
      if (!/\.mdx?$/.test(cleanId)) return null
      const content = fs.readFileSync(cleanId, 'utf-8')
      return `export default ${JSON.stringify(content)}`
    },
  }
}

async function waitForWatch(watcher: any, dir: string, timeoutMs = 5000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const watched = watcher.getWatched() as Record<string, string[]>
    if (watched[dir] !== undefined) {
      return true
    }
    await new Promise((r) => setTimeout(r, 50))
  }
  return false
}

it('getWatched gate probe', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bd-hmr-dbg-'))
  const docsDir = path.join(root, 'docs')
  fs.mkdirSync(docsDir, { recursive: true })
  fs.writeFileSync(path.join(root, 'index.html'), '<div id="root"></div>')
  fs.writeFileSync(path.join(docsDir, 'index.mdx'), '# Hello v1\n', 'utf-8')

  const clientStub = path.join(root, 'client-stub.mjs')
  fs.writeFileSync(clientStub, [
    'export const ViteReactSSG = () => null',
    'export const createRoutes = () => ({})',
    'export const RouteRenderer = () => null',
    'export const matchRouteBranch = () => null',
    'export const matchRouteBranchWithParams = () => null',
    'export const resolveRouteBranch = () => null',
  ].join('\n'), 'utf-8')

  const config = { docsDir, theme: { title: 'T' }, experimental: { fileRouting: true } }
  const runtime = createPluginRuntimeState()
  const cacheContext = getRouteCacheContext(docsDir)
  const getConfig = () => config as never
  const getViteConfig = () => ({ command: 'serve' as const }) as never
  const vmPlugin = createVirtualModulesPlugin({ docsDir, root }, getConfig, getViteConfig, docsDir, runtime)
  const devPlugin = createDevServerPlugin(docsDir, normalizePath(docsDir), getConfig, () => {}, () => undefined, runtime, undefined, cacheContext)

  const server = await createServer({
    root, logLevel: 'silent',
    server: { watch: { ignored: ['**/.boltdocs/**'] } },
    resolve: { alias: [{ find: 'boltdocs/client', replacement: clientStub }] },
    plugins: [createStubMdxPlugin(), vmPlugin, devPlugin],
  })
  const watched: string[] = []
  server.watcher.on('all', (e, f) => { watched.push(`${e}:${f}`) })

  await server.transformRequest('/docs/index.mdx')
  const ok = await waitForWatch(server.watcher, docsDir)
  console.log('covered docs dir:', ok, JSON.stringify(Object.keys(server.watcher.getWatched())))
  fs.writeFileSync(path.join(docsDir, 'index.mdx'), '# Hello v2\n', 'utf-8')
  await new Promise((r) => setTimeout(r, 1200))
  console.log('events:', JSON.stringify(watched))
  await server.close()
  fs.rmSync(root, { recursive: true, force: true })
}, 30000)
