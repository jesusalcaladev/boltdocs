import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolveConfig } from '../packages/core/src/node/config'
import fs from 'fs'
import path from 'path'
import os from 'os'

describe('config', () => {
  let tempProjectDir: string

  beforeEach(() => {
    vi.clearAllMocks()
    tempProjectDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'boltdocs-config-test-'),
    )
  })

  afterEach(() => {
    if (fs.existsSync(tempProjectDir)) {
      fs.rmSync(tempProjectDir, { recursive: true, force: true })
    }
  })

  it('should return defaults if no user config is found', async () => {
    // Pass tempProjectDir as both docsDir and root
    const config = await resolveConfig(tempProjectDir, tempProjectDir)
    expect(config.themeConfig?.title).toBe('Boltdocs')
  })

  it('should merge user config correctly from a real file', async () => {
    const configPath = path.resolve(tempProjectDir, 'boltdocs.config.js')
    fs.writeFileSync(
      configPath,
      'module.exports = { themeConfig: { title: "Real User Title" } };',
    )

    // We pass tempProjectDir as the root
    const config = await resolveConfig(tempProjectDir, tempProjectDir)
    expect(config.themeConfig?.title).toBe('Real User Title')
  })

  it('should handle nested themeConfig correctly', async () => {
    const configPath = path.resolve(tempProjectDir, 'boltdocs.config.js')
    fs.writeFileSync(configPath, 'module.exports = { title: "Direct Title" };')

    const config = await resolveConfig(tempProjectDir, tempProjectDir)
    expect(config.themeConfig?.title).toBe('Direct Title')
  })

  it('should handle errors during config import gracefully', async () => {
    const configPath = path.resolve(tempProjectDir, 'boltdocs.config.js')
    fs.writeFileSync(configPath, 'throw new Error("Config Error");')

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const config = await resolveConfig(tempProjectDir, tempProjectDir)

    expect(config.themeConfig?.title).toBe('Boltdocs')
    expect(warnSpy).toHaveBeenCalled()
  })
})
