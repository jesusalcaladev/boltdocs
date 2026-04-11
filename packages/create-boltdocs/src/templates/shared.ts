export function getPackageJson(projectName: string) {
  return {
    name: projectName,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'boltdocs',
      build: 'boltdocs build',
      preview: 'boltdocs preview',
      doctor: 'boltdocs doctor',
      'lint:md': 'markdownlint-cli2 "docs/**/*.{md,mdx}"',
      'lint:md:fix': 'markdownlint-cli2 --fix "docs/**/*.{md,mdx}"',
    },
    dependencies: {
      react: '19.2.5',
      'react-dom': '19.2.5',
      boltdocs: 'latest',
    },
    devDependencies: {
      typescript: '^5.7.0',
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
      'markdownlint-cli2': '^0.22.0',
      vite: '^7.0.0',
      tailwindcss: '^4.0.0',
      '@tailwindcss/vite': '^4.2.2',
    },
  }
}

export const gitignoreContent = `node_modules
dist
.DS_Store
.boltdocs
`

export const markdownlintContent = `# Default state for all rules
default: true

# MD013/line-length - Line length
MD013: false # Too restrictive for technical docs with long URLs and strings

# MD024/no-duplicate-heading/no-duplicate-header
MD024:
  siblings_only: true

# MD033/no-inline-html - Inline HTML
MD033: false # Disabled because we use MDX which uses JSX and HTML extensively

# MD041/first-line-heading/first-line-h1 - First line in a file should be a top-level heading
MD041: false # Disabled since we use frontmatter for title/metadata

# MD025/single-title/single-h1
MD025: false

# MD051/link-fragments
MD051: false # Sometimes fragments aren't fully resolved locally by the linter
`

export const markdownlintignoreContent = `.git
**/node_modules
node_modules
dist
`

export function getLogoLight() {
  return `<svg width="60" height="51" viewBox="0 0 60 51" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29.4449 0H19.4449V16.5L29.4449 6.5V0Z" fill="white"/>
<path d="M26.9449 22.7265C26.9449 22.5077 21.2201 27.0658 16.9449 28.5C13.7491 29.5721 12.3156 29.5038 8.94486 29.5C5.59532 29.4963 0 28.5 0 28.5C0 28.5 5.57953 28.5146 8.94486 27.5C12.5409 26.4158 14.8203 25.5843 17.9449 23.5C23.3445 19.898 29.4449 11.5 29.4449 11.5L29.9449 18C29.9449 18 33.5825 15.8308 36.4449 15C39.4452 14.1291 44.4449 14 44.4449 14C44.4449 14 36.9449 19 34.4449 21.5C31.5322 24.4126 29.8582 26.9017 29.4449 31C29.1217 34.2041 29.4771 36.4508 31.4449 39C33.5792 41.765 35.952 43.0183 39.4449 43C42.677 42.9831 45.3003 42.4182 47.4449 40C49.7406 37.4113 50.2495 34.4466 49.9449 31C49.6603 27.7804 48.4876 25.4953 45.9449 23.5C43.2931 21.4191 36.4449 24 36.4449 24L47.9449 15C47.9449 15 51.5761 16.771 53.4449 18.5C55.711 20.5967 56.7467 22.1546 57.9449 25C59.1784 27.9295 59.4832 29.8216 59.4449 33C59.4089 35.9867 59.179 37.78 57.9449 40.5C56.8475 42.9185 55.8511 44.6507 53.9449 46.5C51.9236 48.4609 50.5803 49.0076 47.9449 50C45.5414 50.9051 44.0131 51 41.4449 51C38.8766 51 37.3235 50.9685 34.9449 50C32.4851 48.9985 29.4449 46 29.4449 46V51H19.4449V37.9904L22.9449 31.4226L26.9449 22.7265Z" fill="white"/>
</svg>`
}

export function getLogoDark() {
  return `<svg width="60" height="52" viewBox="0 0 60 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29.4449 0H19.4449V16.5L29.4449 6.5V0Z" fill="black"/>
<path d="M26.9449 22.7265C26.9449 22.5077 21.2201 27.0658 16.9449 28.5C13.7491 29.5721 12.3156 29.5038 8.94486 29.5C5.59532 29.4963 0 28.5 0 28.5C0 28.5 5.57953 28.5146 8.94486 27.5C12.5409 26.4158 14.8203 25.5843 17.9449 23.5C23.3445 19.898 29.4449 11.5 29.4449 11.5L29.9449 18.5C29.9449 18.5 33.5124 15.5332 36.4449 15C41.9449 14 45.4449 15 45.4449 15C45.4449 15 36.9449 19 34.4449 21.5C31.5322 24.4126 29.8582 26.9017 29.4449 31C29.1217 34.2041 29.4771 36.4508 31.4449 39C33.5792 41.765 35.952 43.0183 39.4449 43C42.677 42.9831 45.3003 42.4182 47.4449 40C49.7406 37.4113 50.2495 34.4466 49.9449 31C49.6603 27.7804 48.4876 25.4953 45.9449 23.5C43.2931 21.4191 36.4449 24 36.4449 24L47.4449 15.5C47.4449 15.5 50.4449 16 53.4449 19C56.4449 22 57.4449 23.5 57.9449 24.5C58.4449 25.5 59.9449 28.5 59.9449 33.5C59.9449 36.4869 59.9449 37.5 57.9449 41.5C55.9449 45.5 52.9449 47.5 52.9449 47.5C52.9449 47.5 51.9449 48.5 49.9449 49.5C47.9449 50.5 45.9289 50.8863 44.9449 51.1121C43.2783 51.4944 42.7023 51.5 41.4449 51.5C40.6256 51.5 39.3731 51.3693 37.9449 51.0624C36.9972 50.8587 35.9722 50.5774 34.9449 50.2051C33.7409 49.7688 32.5339 49.2076 31.4449 48.5C30.6262 47.9681 29.4449 47 29.4449 47V51H19.4449V37.9904L22.9449 31.4226L26.9449 22.7265Z" fill="black"/>
</svg>`
}

export function getBoltdocsConfig(
  projectName: string,
  options: { homePage?: string; i18n?: boolean } = {},
) {
  const i18nConfig = options.i18n
    ? `
  i18n: {
    defaultLocale: 'en',
    locales: {
      en: 'English',
      es: 'Español'
    },
    localeConfigs: {
      en: { label: 'English', direction: 'ltr' },
      es: { label: 'Español', direction: 'ltr' }
    }
  },`
    : ''

  const homePageConfig = options.homePage
    ? `
  homePage: '${options.homePage}',`
    : ''

  return `import { defineConfig } from 'boltdocs';

export default defineConfig({${homePageConfig}${i18nConfig}
  theme: {
    title: '${projectName}',
    logo: {
      light: '/logo-dark.svg',
      dark: '/logo-light.svg',
      alt: '${projectName} Logo'
    },
    navbar: [
      { label: 'Home', href: '/' },
      { label: 'Documentation', href: '/docs' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/jesusalcaladev/boltdocs' }
    ]
  }
});`
}

export function getIndexCss() {
  return `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');

@import "tailwindcss";
@import "boltdocs/theme/neutral.css";

/* 
  @source directive tells Tailwind to scan Boltdocs client components 
  inside node_modules for class usage and generate the necessary CSS.
*/
@source "./node_modules/boltdocs/src/client";
`
}

export function getLayoutPage() {
  return `import {
  DocsLayout,
  Navbar,
  Sidebar,
  OnThisPage,
  Head,
  Breadcrumbs,
  PageNav,
  ErrorBoundary,
  CopyMarkdown,
  useRoutes,
  useConfig,
  useLocation
} from 'boltdocs/client'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { routes: filteredRoutes, allRoutes, currentRoute } = useRoutes()
  const { pathname } = useLocation()
  const config = useConfig()

  const isDocs = pathname.startsWith('/docs')

  return (
    <DocsLayout>
      <Head
        siteTitle={config.theme?.title}
        siteDescription={config.theme?.description}
        routes={allRoutes}
      />
      <Navbar />

      <DocsLayout.Body>
        {isDocs && <Sidebar routes={filteredRoutes} config={config} />}

        <DocsLayout.Content>
          <DocsLayout.ContentMdx>
            {isDocs && (
              <DocsLayout.ContentHeader>
                <Breadcrumbs />
                <CopyMarkdown
                  mdxRaw={currentRoute?._rawContent}
                  route={currentRoute}
                  config={config.theme?.copyMarkdown}
                />
              </DocsLayout.ContentHeader>
            )}

            <ErrorBoundary>{children}</ErrorBoundary>

            {isDocs && (
              <DocsLayout.ContentFooter>
                <PageNav />
              </DocsLayout.ContentFooter>
            )}
          </DocsLayout.ContentMdx>
        </DocsLayout.Content>

        {isDocs && (
          <OnThisPage
            headings={currentRoute?.headings}
            editLink={config.theme?.editLink}
            communityHelp={config.theme?.communityHelp}
            filePath={currentRoute?.filePath}
          />
        )}
      </DocsLayout.Body>
    </DocsLayout>
  )
}
`
}

export function generateHomePage(): string {
  return `
  import { Button, Cards, Card } from 'boltdocs/client'
import { time } from 'node:console';

const features = [
  {
    title: 'Fast and Lightweight',
    description: 'Boltdocs is built with performance in mind, ensuring your documentation loads quickly and efficiently.',
    icon: '⚡',
    href: "https://boltdocs.vercel.app/docs/guides/overview/introduction"
  },
  {
    title: "I18n & Versioning Support",
    description: "Easily manage multiple languages and versions of your documentation with built-in support.",
    icon: '🌐',
    href: 'https://boltdocs.vercel.app/docs/guides/core-concepts/i18n'
  },
  {
    title: 'Customizable',
    description: 'Tailor your documentation site to your needs with flexible customization options.',
    icon: '🎨',
    href: 'https://boltdocs.vercel.app/docs/guides/customization/theme'

  },
  {
    title: "plugins",
    description: "Extend Boltdocs' functionality with a growing ecosystem of plugins.",
    icon: '🔌',
    href: 'https://boltdocs.vercel.app/docs/plugins'
  }
]

export default function HomePage() {
  return (
    <div className="w-full h-screen flex flex-col items-center pt-10 gap-6">
      <header className='flex flex-col items-center'>
        <h1 className="text-4xl font-bold text-center">Powerful Documentation</h1>
        <p className="text-center">
          Your minimal documentation site is ready. Start building something amazing.
        </p>
        <div className="flex gap-4">
          <Button href="/docs">
            Get Started
          </Button>
        </div>
      </header>
      <Cards className='mx-auto w-[60%]' cols={2}>
        {features.map((feature, index) => (
          <Card href={feature.href} key={index} title={feature.title} icon={feature.icon}>
            <p>{feature.description}</p>
          </Card>
        ))}
      </Cards>
    </div>
  );
}
`
}
