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

it('fm delta', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bd-hmr-dbg-'))
  const docsDir = path.join(root, 'docs')
  fs.mkdirSync(docsDir, { recursive: true })
  fs.writeFileSync(path.join(root, 'index.html'), '<div id="root"></div>')
  fs.writeFileSync(path.join(docsDir, 'guide.mdx'), '---\ntitle: Guide v1\n---\n# Body\n', 'utf-8')

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
  await new Promise<void>((resolve) => {
    const started = Date.now()
    const timer = setInterval(() => {
      const watched = server.watcher.getWatched() as Record<string, string[]>
      if (watched[normalizePath(docsDir)] !== undefined) { clearInterval(timer); resolve(); return }
      if (Date.now() - started > 5000) { clearInterval(timer); resolve() }
    }, 50)
  })
  const wsSend = vi.spyOn(server.ws, 'send')

  await server.transformRequest('/docs/guide.mdx')

  // change 1: body only
  fs.writeFileSync(path.join(docsDir, 'guide.mdx'), '---\ntitle: Guide v1\n---\n# Body updated\n', 'utf-8')
  const t0 = Date.now()
  while (Date.now() - t0 < 8000) {
    const hit = wsSend.mock.calls.find(([p]) => p?.event === 'boltdocs:mdx-update')
    if (hit) { console.log('change1 mdx-update at', Date.now() - t0, 'ms'); break }
    await new Promise((r) => setTimeout(r, 50))
  }
  console.log('change1 ws:', JSON.stringify(wsSend.mock.calls.map((c) => c[0])))
  wsSend.mockClear()

  // change 2: frontmatter change
  fs.writeFileSync(path.join(docsDir, 'guide.mdx'), '---\ntitle: Guide v2\n---\n# Body updated\n', 'utf-8')
  const t1 = Date.now()
  while (Date.now() - t1 < 8000) {
    const hit = wsSend.mock.calls.find(([p]) => p?.event === 'boltdocs:frontmatter-update')
    if (hit) { console.log('change2 frontmatter-update at', Date.now() - t1, 'ms'); break }
    await new Promise((r) => setTimeout(r, 50))
  }
  console.log('change2 ws:', JSON.stringify(wsSend.mock.calls.map((c) => c[0])))

  await server.close()
  fs.rmSync(root, { recursive: true, force: true })
}, 30000)
