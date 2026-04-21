import type { BoltdocsConfig } from './types'

/**
 * Type-safe helper for defining Boltdocs configuration.
 * This is an identity function that provides IntelliSense in both
 * Node.js (config files) and client-side code (MDX examples).
 *
 * @param config - The Boltdocs configuration object
 */
export function defineConfig(config: BoltdocsConfig): BoltdocsConfig {
  return config
}
