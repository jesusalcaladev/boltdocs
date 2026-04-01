/**
 * Configuration options specifically for the Boltdocs Vite plugin.
 */
export interface BoltdocsPluginOptions {
  /** The root directory containing markdown files (default: 'docs') */
  docsDir?: string
  /** Path to a custom home page component (relative to project root) to render at '/' */
  homePage?: string
}
