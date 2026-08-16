import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { it, vi } from 'vitest'
import { createServer, type Plugin } from 'vite'

const mocks = vi.hoisted(() => ({ duiError: vi.fn() }))
vi.mock('@bdocs/processor-satteri/node', () => ({ invalidateMdxFileCache: vi.fn() }))
vi.mock('../src/node/types-generator', () => ({ generateProjectTypes: vi.fn(), writeLinkTree: vi.fn() }))
vi.mock('../src/node/cli/doctor', () => ({ generateLinkTree: vi.fn(async () => {}) }))
vi.mock('@bdocs/dui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@bdocs/dui')>()
  return { ...actual, error: mocks.duiError }
})

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

it('replica: gate + dui mock + ws spy after gate', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bd-hmr-dbg-'))
  const docsDir = path.join(root, 'docs')
  fs.mkdirSync(path.join(docsDir, 'pages-external'), { recursive: true })
  fs.writeFileSync(path.join(root, 'index.html'), '<div id="root"></div>')
  fs.writeFileSync(path.join(docsDir, 'pages-external', 'roadmap.mdx'), '# Roadmap v1\n', 'utf-8')

  const clientStub = path.join(root, 'client-stub.mjs')
  fs.writeFileSync(clientStub, [
    'export const ViteReactSSG = () => null',
    'export const createRoutes = () => ({})',
    'export const RouteRenderer = () => null',
    'export const matchRouteBranch = () => null',
    'export const matchRouteBranchWithParams = () => null',
    'export const resolveRouteBranch = () => null',
  ].join('\n'), 'utf-8')

  const config = { docsDir, theme: { title: 'HMR Test' }, experimental: { fileRouting: true } }
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

  // gate
  const dirsToCover = new Set<string>([normalizePath(docsDir)])
  const collectDirs = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const child = path.join(dir, entry.name)
        dirsToCover.add(normalizePath(child))
        collectDirs(child)
      }
    }
  }
  collectDirs(docsDir)
  await new Promise<void>((resolve, reject) => {
    const started = Date.now()
    const timer = setInterval(() => {
      const w = server.watcher.getWatched() as Record<string, string[]>
      if ([...dirsToCover].every((d) => w[d] !== undefined)) { clearInterval(timer); resolve(); return }
      if (Date.now() - started > 5000) { clearInterval(timer); reject(new Error('gate timeout')) }
    }, 50)
  })
  console.log('gate passed')
  const wsSend = vi.spyOn(server.ws, 'send')

  await server.transformRequest('\0virtual:boltdocs-entry.tsx')

  fs.writeFileSync(path.join(docsDir, 'pages-external', 'roadmap.mdx'), '# Roadmap v2\n', 'utf-8')
  await new Promise((r) => setTimeout(r, 2000))
  console.log('events:', JSON.stringify(watched))
  console.log('ws:', JSON.stringify(wsSend.mock.calls.map((c) => c[0])))
  console.log('dui error calls:', JSON.stringify(mocks.duiError.mock.calls.map((c) => String(c[0]).slice(0, 120))))
  await server.close()
  fs.rmSync(root, { recursive: true, force: true })
}, 30000)
