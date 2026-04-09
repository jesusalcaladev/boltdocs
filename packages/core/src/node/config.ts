import path from 'path'
import fs from 'fs'
import { loadConfigFromFile, type Plugin as VitePlugin } from 'vite'
import { BoltdocsConfigSchema } from './schema/config'
import { ValidationError } from './errors'
import type {
  PluginLifecycleHooks,
  PluginPermission,
} from './plugins/plugin-types'

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
  /** The global title of the documentation site (can be translated) */
  title?: string | Record<string, string>
  /** The global description of the site (can be translated) */
  description?: string | Record<string, string>
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
    /** Text to display (can be a string or a map of translations) */
    label: string | Record<string, string>
    /** URL path or external link */
    href: string
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
  /**
   * URL path to the site favicon.
   * If not specified, the logo will be used if available.
   */
  favicon?: string
  /**
   * The Open Graph image URL to display when the site is shared on social media.
   */
  ogImage?: string
  /** Whether to show the 'Powered by LiteDocs' badge in the sidebar (default: true) */
  poweredBy?: boolean
  /**
   * Top-level tabs for organizing documentation groups.
   * Tab discovery uses the (tab-id) directory syntax.
   */
  tabs?: Array<{
    id: string
    /** Text to display (can be a string or a map of translations) */
    text: string | Record<string, string>
    icon?: string
  }>
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
 * Configuration for the robots.txt file.
 */
export type BoltdocsRobotsConfig =
  | string
  | {
      /** User-agent rules */
      rules?: Array<{
        userAgent: string
        /** Paths allowed to be crawled */
        allow?: string | string[]
        /** Paths disallowed to be crawled */
        disallow?: string | string[]
      }>
      /** Sitemaps to include in the robots.txt */
      sitemaps?: string[]
    }

/**
 * Configuration for a specific locale.
 */
export interface BoltdocsLocaleConfig {
  /** The display name of the locale */
  label?: string
  /** The text direction (ltr or rtl) */
  direction?: 'ltr' | 'rtl'
  /** The HTML lang attribute value (e.g., 'en-US') */
  htmlLang?: string
  /** The calendar system to use (e.g., 'gregory') */
  calendar?: string
}

/**
 * Configuration for internationalization (i18n).
 */
export interface BoltdocsI18nConfig {
  /** The default locale (e.g., 'en') */
  defaultLocale: string
  /** Available locales and their basic display names (e.g., { en: 'English', es: 'Español' }) */
  locales: Record<string, string>
  /** Detailed configuration for each locale */
  localeConfigs?: Record<string, BoltdocsLocaleConfig>
}

/**
 * Configuration for a specific documentation version.
 */
export interface BoltdocsVersionConfig {
  /** The display name of the version (e.g., 'v2.0') */
  label: string
  /** The URL path prefix for the version (e.g., '2.0') */
  path: string
}

/**
 * Configuration for documentation versioning.
 */
export interface BoltdocsVersionsConfig {
  /** The default version path (e.g., 'v2') */
  defaultVersion: string
  /**
   * Optional prefix for all version paths (e.g., 'v').
   * If set to 'v', version '1.1' will be available at '/docs/v1.1'.
   */
  prefix?: string
  /** Available versions configurations */
  versions: BoltdocsVersionConfig[]
}

/**
 * Defines a Boltdocs plugin that can extend the build process and client-side functionality.
 */
export interface BoltdocsPlugin {
  /** A unique name for the plugin */
  name: string
  /** Whether to run this plugin before or after default ones (optional) */
  enforce?: 'pre' | 'post'
  /** Version of the plugin (optional) */
  version?: string
  /** Minimum compatible Boltdocs version (optional, semver range) */
  boltdocsVersion?: string
  /** List of permissions this plugin requires to operate */
  permissions?: PluginPermission[]
  /** Optional remark plugins to add to the MDX pipeline */
  remarkPlugins?: unknown[]
  /** Optional rehype plugins to add to the MDX pipeline */
  rehypePlugins?: unknown[]
  /** Optional Vite plugins to inject into the build process */
  vitePlugins?: VitePlugin[]
  /** Optional custom React components to register in MDX. Map of Name -> Module Path. */
  components?: Record<string, string>
  /** Implementation of lifecycle hooks */
  hooks?: PluginLifecycleHooks
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
 * Configuration for security-related settings.
 */
export interface BoltdocsSecurityConfig {
  /** Map of standard security headers to override or supplement defaults */
  headers?: Record<string, string>
  /** Whether to enable Content Security Policy (CSP) generation (default: false) */
  enableCSP?: boolean
  /** Additional custom headers to inject into responses */
  customHeaders?: Record<string, string>
}

/**
 * The root configuration object for Boltdocs.
 */
export interface BoltdocsConfig {
  /** The base URL of the site, used for generating the sitemap */
  siteUrl?: string
  /** The root directory containing markdown documentation files (default: 'docs') */
  docsDir?: string
  /** Path to a custom HomePage component */
  homePage?: string
  /** Configuration pertaining to the UI and appearance */
  theme?: BoltdocsThemeConfig
  /** Configuration for internationalization */
  i18n?: BoltdocsI18nConfig
  /** Configuration for documentation versioning */
  versions?: BoltdocsVersionsConfig
  /** Custom plugins for extending functionality */
  plugins?: BoltdocsPlugin[]
  /** External integrations configuration */
  integrations?: BoltdocsIntegrationsConfig
  /** Configuration for the robots.txt file */
  robots?: BoltdocsRobotsConfig
  /** Security-related settings and headers */
  security?: BoltdocsSecurityConfig
  /** Low-level Vite configuration overrides */
  vite?: import('vite').InlineConfig
}

export function defineConfig(config: BoltdocsConfig): BoltdocsConfig {
  return config
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
    Partial<BoltdocsThemeConfig> {
  favicon?: string
  ogImage?: string
  security?: BoltdocsSecurityConfig
}

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
    theme: {
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

  const themeConfigFromTop: BoltdocsThemeConfig = {
    title: userConfig.title,
    description: userConfig.description,
    logo: userConfig.logo,
    favicon: userConfig.favicon,
    ogImage: userConfig.ogImage,
    navbar: userConfig.navbar,
    sidebar: userConfig.sidebar,
    socialLinks: userConfig.socialLinks,
    footer: userConfig.footer,
    githubRepo: userConfig.githubRepo,
    tabs: userConfig.tabs,
    codeTheme: userConfig.codeTheme,
    copyMarkdown: userConfig.copyMarkdown,
    breadcrumbs: userConfig.breadcrumbs,
    poweredBy: userConfig.poweredBy,
    communityHelp: userConfig.communityHelp,
    version: userConfig.version,
    editLink: userConfig.editLink,
  }

  const userThemeConfig: BoltdocsThemeConfig = {
    ...themeConfigFromTop,
    ...(userConfig.theme || {}),
  }

  const cleanThemeConfig = Object.fromEntries(
    Object.entries(userThemeConfig).filter(([_, v]) => v !== undefined),
  ) as BoltdocsThemeConfig
  if (cleanThemeConfig.navbar) {
    cleanThemeConfig.navbar = cleanThemeConfig.navbar.map((item: any) => ({
      label: item.label || item.text || '',
      href: item.href || item.link || item.to || '',
    }))
  }

  const finalConfig: BoltdocsConfig = {
    docsDir: path.resolve(docsDir),
    homePage: userConfig.homePage,
    theme: {
      ...defaults.theme,
      ...cleanThemeConfig,
    },
    i18n: userConfig.i18n,
    versions: userConfig.versions,
    siteUrl: userConfig.siteUrl,
    plugins: userConfig.plugins || [],
    integrations: userConfig.integrations,
    robots: userConfig.robots,
    security: userConfig.security,
    vite: userConfig.vite,
  }

  // Validate the final configuration
  const validation = BoltdocsConfigSchema.safeParse(finalConfig)
  if (!validation.success) {
    const errorMessages = validation.error.issues
      .map((err: any) => {
        const path = err.path.join('.')
        return `  - ${path}: ${err.message}`
      })
      .join('\n')

    throw new ValidationError(
      `Invalid Boltdocs configuration:\n${errorMessages}`,
    )
  }

  return validation.data as BoltdocsConfig
}
