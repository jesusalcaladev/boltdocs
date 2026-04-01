import path from 'path'
import fs from 'fs'
import { loadConfigFromFile, type Plugin as VitePlugin } from 'vite'

/**
 * Represents a single social link in the configuration.
 */
export interface BoltdocsSocialLink {
  /** Identifier for the icon (e.g., 'github') */
  icon: 'discord' | 'x' | 'github' | 'bluesky' | string
  /** The URL the social link points to */
  link: string
}

/**
 * Configuration for the site footer.
 */
export interface BoltdocsFooterConfig {
  /** Text to display in the footer (HTML is supported) */
  text?: string
}

/**
 * Theme-specific configuration options governing the appearance and navigation of the site.
 */
export interface BoltdocsThemeConfig {
  /** The global title of the documentation site */
  title?: string
  /** The global description of the site (used for SEO) */
  description?: string
  /** URL path to the site logo or an object for light/dark versions */
  logo?:
    | string
    | {
        dark: string
        light: string
        alt?: string
        width?: number
        height?: number
      }
  /** Items to display in the top navigation bar */
  navbar?: Array<{
    /** Text to display */
    label: string
    /** URL path or external link */
    href: string
    /** Nested items for NavigationMenu */
    items?: Array<{ label: string; href: string }>
  }>
  /** Items to display in the sidebar, organized optionally by group URLs */
  sidebar?: Record<string, Array<{ text: string; link: string }>>
  /** Social links to display in the navigation bar */
  socialLinks?: BoltdocsSocialLink[]
  /** Site footer configuration */
  footer?: BoltdocsFooterConfig
  /** Whether to show breadcrumbs navigation (default: true) */
  breadcrumbs?: boolean
  /** URL template for 'Edit this page'. Use :path as a placeholder. */
  editLink?: string
  /** URL for the 'Community help' link. */
  communityHelp?: string
  /** The current version of the project (e.g., 'v2.8.9'). Displayed in the Navbar. */
  version?: string
  /** The GitHub repository in the format 'owner/repo' to fetch and display star count. */
  githubRepo?: string
  /** Whether to show the 'Powered by LiteDocs' badge in the sidebar (default: true) */
  poweredBy?: boolean
  /**
   * Top-level tabs for organizing documentation groups.
   * Tab discovery uses the (tab-id) directory syntax.
   */
  tabs?: Array<{ id: string; text: string; icon?: string }>
  /**
   * The syntax highlighting theme for code blocks.
   * Supports any Shiki theme name (e.g., 'github-dark', 'one-dark-pro', 'aurora-x').
   * Can also be an object for multiple themes (e.g., { light: 'github-light', dark: 'github-dark' }).
   * Default: { light: 'github-light', dark: 'one-dark-pro' }
   */
  codeTheme?: string | { light: string; dark: string }
  /**
   * Configuration for the 'Copy Markdown' button.
   * Can be a boolean or an object with text and icon.
   * Default: true
   */
  copyMarkdown?: boolean | { text?: string; icon?: string }
}

/**
 * Configuration for internationalization (i18n).
 */
export interface BoltdocsI18nConfig {
  /** The default locale (e.g., 'en') */
  defaultLocale: string
  /** Available locales and their display names (e.g., { en: 'English', es: 'Español' }) */
  locales: Record<string, string>
}

/**
 * Configuration for documentation versioning.
 */
export interface BoltdocsVersionsConfig {
  /** The default version (e.g., 'v2') */
  defaultVersion: string
  /** Available versions and their display names (e.g., { v1: 'Version 1.x', v2: 'Version 2.x' }) */
  versions: Record<string, string>
}

/**
 * Defines a Boltdocs plugin that can extend the build process and client-side functionality.
 */
export interface BoltdocsPlugin {
  /** A unique name for the plugin */
  name: string
  /** Whether to run this plugin before or after default ones (optional) */
  enforce?: 'pre' | 'post'
  /** Optional remark plugins to add to the MDX pipeline */
  remarkPlugins?: unknown[]
  /** Optional rehype plugins to add to the MDX pipeline */
  rehypePlugins?: unknown[]
  /** Optional Vite plugins to inject into the build process */
  vitePlugins?: VitePlugin[]
  /** Optional custom React components to register in MDX. Map of Name -> Module Path. */
  components?: Record<string, string>
}

/**
 * Configuration for external integrations (e.g., CodeSandbox).
 */
export interface BoltdocsIntegrationsConfig {
  /** CodeSandbox integration settings */
  sandbox?: {
    /** Whether to enable the "Open in Sandbox" button in CodeBlocks */
    enable?: boolean
    /** Default options for the sandbox (files, dependencies, etc.) */
    config?: Record<string, unknown>
  }
}

/**
 * The root configuration object for Boltdocs.
 */
export interface BoltdocsConfig {
  /** The base URL of the site, used for generating the sitemap */
  siteUrl?: string
  /** Configuration pertaining to the UI and appearance */
  themeConfig?: BoltdocsThemeConfig
  /** The root directory containing markdown documentation files (default: 'docs') */
  docsDir?: string
  /** Configuration for internationalization */
  i18n?: BoltdocsI18nConfig
  /** Configuration for documentation versioning */
  versions?: BoltdocsVersionsConfig
  /** Custom plugins for extending functionality */
  plugins?: BoltdocsPlugin[]
  /** Map of custom external route paths to component file paths */
  external?: Record<string, string>
  /** External integrations configuration */
  integrations?: BoltdocsIntegrationsConfig
}

export const CONFIG_FILES = [
  'boltdocs.config.js',
  'boltdocs.config.mjs',
  'boltdocs.config.ts',
]

/**
 * Small helper to handle partial config objects from user input.
 */
interface RawUserConfig
  extends Partial<BoltdocsConfig>,
    Partial<BoltdocsThemeConfig> {}

/**
 * Loads user's configuration file (e.g., `boltdocs.config.js` or `boltdocs.config.ts`) if it exists,
 * merges it with the default configuration, and returns the final `BoltdocsConfig`.
 *
 * @param docsDir - The directory containing the documentation files
 * @param root - The project root directory (defaults to process.cwd())
 * @returns The merged configuration object
 */
export async function resolveConfig(
  docsDir: string,
  root: string = process.cwd(),
): Promise<BoltdocsConfig> {
  const projectRoot = root

  const defaults: BoltdocsConfig = {
    docsDir: path.resolve(docsDir),
    themeConfig: {
      title: 'Boltdocs',
      description: 'A Vite documentation framework',
      navbar: [
        { label: 'Home', href: '/' },
        { label: 'Documentation', href: '/docs' },
      ],
      codeTheme: {
        light: 'github-light',
        dark: 'github-dark',
      },
      poweredBy: true,
      breadcrumbs: true,
    },
  }

  let userConfig: RawUserConfig = {}

  // Try to load user config
  for (const filename of CONFIG_FILES) {
    const configPath = path.resolve(projectRoot, filename)
    if (fs.existsSync(configPath)) {
      try {
        const loaded = await loadConfigFromFile(
          { command: 'serve', mode: 'development' },
          configPath,
          projectRoot,
        )
        if (loaded) {
          userConfig = loaded.config as RawUserConfig
          break
        }
      } catch (e) {
        console.warn(`[boltdocs] Failed to load config from ${filename}:`, e)
      }
    }
  }

  // Robust merging strategy
  const themeConfigFromTop: BoltdocsThemeConfig = {
    title: userConfig.title,
    description: userConfig.description,
    logo: userConfig.logo,
    navbar: userConfig.navbar,
    sidebar: userConfig.sidebar,
    socialLinks: userConfig.socialLinks,
    footer: userConfig.footer,
    githubRepo: userConfig.githubRepo,
    tabs: userConfig.tabs,
  }

  // User can define properties at top level or inside themeConfig
  const userThemeConfig: BoltdocsThemeConfig = {
    ...themeConfigFromTop,
    ...(userConfig.themeConfig || {}),
  }

  // Clean undefined properties
  const cleanThemeConfig = Object.fromEntries(
    Object.entries(userThemeConfig).filter(([_, v]) => v !== undefined),
  ) as BoltdocsThemeConfig

  // Transform old navbar items if necessary
  if (cleanThemeConfig.navbar) {
    cleanThemeConfig.navbar = cleanThemeConfig.navbar.map((item: any) => ({
      label: item.label || item.text || '',
      href: item.href || item.link || item.to || '',
      items: item.items?.map((sub: any) => ({
        label: sub.label || sub.text || '',
        href: sub.href || sub.link || sub.to || '',
      })),
    }))
  }

  return {
    docsDir: path.resolve(docsDir),
    themeConfig: {
      ...defaults.themeConfig,
      ...cleanThemeConfig,
      codeTheme:
        cleanThemeConfig.codeTheme ||
        (userConfig.themeConfig || userConfig).codeTheme ||
        defaults.themeConfig?.codeTheme,
    },
    i18n: userConfig.i18n,
    versions: userConfig.versions,
    siteUrl: userConfig.siteUrl,
    plugins: userConfig.plugins || [],
    external: userConfig.external,
    integrations: userConfig.integrations,
  }
}
