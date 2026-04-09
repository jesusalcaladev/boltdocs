export * from './plugin-types'
export * from './plugin-errors'
export * from './plugin-store'
export * from './plugin-validator'
export * from './plugin-sandbox'
export * from './plugin-lifecycle'

import { SecureBoltdocsPlugin } from './plugin-types'

/**
 * Utility to create a Boltdocs plugin with full type safety.
 */
export function createPlugin(plugin: SecureBoltdocsPlugin): SecureBoltdocsPlugin {
  return plugin
}
