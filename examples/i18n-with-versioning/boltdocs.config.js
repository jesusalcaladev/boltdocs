import { defineConfig } from 'boltdocs'

export default defineConfig({
  siteUrl: 'https://my-docs.com/',
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
  theme: {
    title: 'i18n-with-versioning',
    description: 'Documentation for my project',
    breadcrumbs: true,
    codeTheme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    favicon: '/light.svg',
    logo: {
      dark: '/light.svg',
      light: '/dark.svg',
      alt: 'Boltdocs Logo',
    },
    navbar: [
      {
        label: 'Docs',
        href: '/docs/getting-started',
      },
    ],
    // githubRepo: 'bolt-doc/boltdocs',
  },
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  vite: {
    ssr: {
      optimizeDeps: {
        include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      },
    },
  },
})
