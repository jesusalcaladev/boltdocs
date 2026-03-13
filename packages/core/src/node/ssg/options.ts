import { BoltdocsConfig } from "../config";

/**
 * Options for the Static Site Generation process.
 */
export interface SSGOptions {
  /** The root directory containing markdown documentation files */
  docsDir: string;
  /** The name of the documentation directory (e.g. 'docs') */
  docsDirName: string;
  /** The output directory where Vite placed the compiled `index.html` and assets */
  outDir: string;
  /** Pre-resolved config (avoids re-resolving during the SSG phase) */
  config?: BoltdocsConfig;
}
