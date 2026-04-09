import { describe, it, expect, vi } from 'vitest'
import { resolveConfig } from '../../packages/core/src/node/config'
import path from 'path'
import fs from 'fs'

// Mock Vite's loadConfigFromFile
vi.mock('vite', async () => {
  const actual = await vi.importActual('vite')
  return {
    ...actual,
    loadConfigFromFile: vi.fn(),
  }
})

// Mock fs to bypass file existence check
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs') as any
  return {
    ...actual,
    default: {
      ...actual.default,
      existsSync: vi.fn((p) => p.includes('boltdocs.config.') || actual.existsSync(p)),
    },
    existsSync: vi.fn((p) => p.includes('boltdocs.config.') || actual.existsSync(p)),
  }
})

describe('Configuration Validation', () => {
  const docsDir = 'docs'
  const root = path.resolve(__dirname, '../../')

  it('should validate a correct configuration', async () => {
    const { loadConfigFromFile } = await import('vite')
    vi.mocked(loadConfigFromFile).mockResolvedValue({
      path: 'boltdocs.config.ts',
      config: {
        siteUrl: 'https://example.com',
        theme: {
          title: 'Test Site',
        },
      } as any,
      dependencies: [],
    })

    const config = await resolveConfig(docsDir, root)
    expect(config.siteUrl).toBe('https://example.com')
    expect(config.theme?.title).toBe('Test Site')
  })

  it('should throw an error for invalid siteUrl', async () => {
    const { loadConfigFromFile } = await import('vite')
    vi.mocked(loadConfigFromFile).mockResolvedValue({
      path: 'boltdocs.config.ts',
      config: {
        siteUrl: 'not-a-url',
      } as any,
      dependencies: [],
    })

    await expect(resolveConfig(docsDir, root)).rejects.toThrow(/Invalid Boltdocs configuration/)
    await expect(resolveConfig(docsDir, root)).rejects.toThrow(/siteUrl/)
  })

  it('should validate social links correctly', async () => {
    const { loadConfigFromFile } = await import('vite')
    vi.mocked(loadConfigFromFile).mockResolvedValue({
      path: 'boltdocs.config.ts',
      config: {
        theme: {
          socialLinks: [
            { icon: 'github', link: 'https://github.com/test' }
          ]
        }
      } as any,
      dependencies: [],
    })

    const config = await resolveConfig(docsDir, root)
    expect(config.theme?.socialLinks?.[0].icon).toBe('github')
  })

  it('should throw error for invalid social link URL', async () => {
    const { loadConfigFromFile } = await import('vite')
    vi.mocked(loadConfigFromFile).mockResolvedValue({
      path: 'boltdocs.config.ts',
      config: {
        theme: {
          socialLinks: [
            { icon: 'github', link: 'invalid-url' }
          ]
        }
      } as any,
      dependencies: [],
    })

    await expect(resolveConfig(docsDir, root)).rejects.toThrow(/socialLinks\.0\.link/)
  })

  it('should allow route groups in sidebar config (regression check for earlier fix)', async () => {
    const { loadConfigFromFile } = await import('vite')
    vi.mocked(loadConfigFromFile).mockResolvedValue({
      path: 'boltdocs.config.ts',
      config: {
        theme: {
          sidebar: {
            '(guides)': [{ text: 'Intro', link: '/intro' }]
          }
        }
      } as any,
      dependencies: [],
    })

    const config = await resolveConfig(docsDir, root)
    expect(config.theme?.sidebar?.['(guides)']).toBeDefined()
  })
})
