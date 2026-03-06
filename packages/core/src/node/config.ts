import path from "path";
import { pathToFileURL } from "url";
import fs from "fs";
import type { Plugin as VitePlugin } from "vite";

/**
 * Represents a single social link in the configuration.
 */
export interface BoltdocsSocialLink {
  /** Identifier for the icon (e.g., 'github', 'twitter') */
  icon: "discord" | "x" | string;
  /** The URL the social link points to */
  link: string;
}

/**
 * Configuration for the site footer.
 */
export interface BoltdocsFooterConfig {
  /** Text to display in the footer (HTML is supported) */
  text?: string;
}

/**
 * Theme-specific configuration options governing the appearance and navigation of the site.
 */
export interface BoltdocsThemeConfig {
  /** The global title of the documentation site */
  title?: string;
  /** The global description of the site (used for SEO) */
  description?: string;
  /** URL path to the site logo */
  logo?: string;
  /** Items to display in the top navigation bar */
  navbar?: Array<{ text: string; link: string }>;
  /** Items to display in the sidebar, organized optionally by group URLs */
  sidebar?: Record<string, Array<{ text: string; link: string }>>;
  /** Social links to display in the navigation bar */
  socialLinks?: BoltdocsSocialLink[];
  /** Site footer configuration */
  footer?: BoltdocsFooterConfig;
  /** Whether to show breadcrumbs navigation (default: true) */
  breadcrumbs?: boolean;
  /** Path to a custom CSS file that overrides theme variables */
  customCss?: string;
  /** URL template for 'Edit this page'. Use :path as a placeholder. */
  editLink?: string;
  /** URL for the 'Community help' link. */
  communityHelp?: string;
  /** The current version of the project (e.g., 'v2.8.9'). Displayed in the Navbar. */
  version?: string;
  /** The GitHub repository in the format 'owner/repo' to fetch and display star count. */
  githubRepo?: string;
  /** Whether to show the 'Powered by LiteDocs' badge in the sidebar (default: true) */
  poweredBy?: boolean;
  /** Granular layout customization props */
  layoutProps?: {
    navbar?: any;
    sidebar?: any;
    toc?: any;
    background?: any;
    head?: any;
    breadcrumbs?: any;
    className?: string;
    style?: any;
  };
}

/**
 * Configuration for internationalization (i18n).
 */
export interface BoltdocsI18nConfig {
  /** The default locale (e.g., 'en') */
  defaultLocale: string;
  /** Available locales and their display names (e.g., { en: 'English', es: 'Español' }) */
  locales: Record<string, string>;
}

/**
 * Configuration for documentation versioning.
 */
export interface BoltdocsVersionsConfig {
  /** The default version (e.g., 'v2') */
  defaultVersion: string;
  /** Available versions and their display names (e.g., { v1: 'Version 1.x', v2: 'Version 2.x' }) */
  versions: Record<string, string>;
}

/**
 * Defines a Boltdocs plugin that can extend the build process and client-side functionality.
 */
export interface BoltdocsPlugin {
  /** A unique name for the plugin */
  name: string;
  /** Whether to run this plugin before or after default ones (optional) */
  enforce?: "pre" | "post";
  /** Optional remark plugins to add to the MDX pipeline */
  remarkPlugins?: any[];
  /** Optional rehype plugins to add to the MDX pipeline */
  rehypePlugins?: any[];
  /** Optional Vite plugins to inject into the build process */
  vitePlugins?: VitePlugin[];
  /** Optional custom React components to register in MDX. Map of Name -> Module Path. */
  components?: Record<string, string>;
}

/**
 * The root configuration object for Boltdocs.
 */
export interface BoltdocsConfig {
  /** The base URL of the site, used for generating the sitemap */
  siteUrl?: string;
  /** Configuration pertaining to the UI and appearance */
  themeConfig?: BoltdocsThemeConfig;
  /** The root directory containing markdown documentation files (default: 'docs') */
  docsDir?: string;
  /** Configuration for internationalization */
  i18n?: BoltdocsI18nConfig;
  /** Configuration for documentation versioning */
  versions?: BoltdocsVersionsConfig;
  /** Custom plugins for extending functionality */
  plugins?: BoltdocsPlugin[];
}

export const CONFIG_FILES = [
  "boltdocs.config.js",
  "boltdocs.config.mjs",
  "boltdocs.config.ts",
];

/**
 * Loads user's configuration file (e.g., `boltdocs.config.js` or `boltdocs.config.ts`) if it exists,
 * merges it with the default configuration, and returns the final `BoltdocsConfig`.
 *
 * @param docsDir - The fallback/default documentation directory
 * @returns A promise resolving to the final merged configuration object
 */
export async function resolveConfig(docsDir: string): Promise<BoltdocsConfig> {
  const projectRoot = process.cwd();

  const defaults: BoltdocsConfig = {
    docsDir: path.resolve(docsDir),
    themeConfig: {
      title: "Boltdocs",
      description: "A Vite documentation framework",
      navbar: [
        { text: "Home", link: "/" },
        { text: "Documentation", link: "/docs" },
      ],
    },
  };

  // Try to load user config
  for (const filename of CONFIG_FILES) {
    const configPath = path.resolve(projectRoot, filename);
    if (fs.existsSync(configPath)) {
      try {
        // Add a timestamp query parameter to bust the ESM cache
        const fileUrl = pathToFileURL(configPath).href + "?t=" + Date.now();
        const mod = await import(fileUrl);
        const userConfig = mod.default || mod;

        // Merge user themeConfig into defaults
        // Support new format where user exports BoltdocsConfig directly
        const userThemeConfig = userConfig.themeConfig || userConfig;

        return {
          docsDir: path.resolve(docsDir),
          themeConfig: {
            ...defaults.themeConfig,
            ...userThemeConfig,
          },
          i18n: userConfig.i18n,
          versions: userConfig.versions,
          siteUrl: userConfig.siteUrl,
          plugins: userConfig.plugins || [],
        };
      } catch (e) {
        console.warn(`[boltdocs] Failed to load config from ${filename}:`, e);
      }
    }
  }

  return defaults;
}
