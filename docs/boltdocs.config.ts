import { defineConfig } from 'boltdocs'

export default defineConfig({
  siteUrl: 'https://boltdocs.vercel.app/',
  homePage: './src/HomePage.tsx',
  theme: {
    title: 'boltdocs',
    description:
      'Building documentation for your project has never been easier, with boltdocs you can create beautiful documentation, 80% customizable, with 25+ components.',
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
        href: '/',
        label: 'Home',
      },
      {
        label: 'Docs',
        href: '/docs/overview/introduction',
      },
    ],
    editLink:
      'https://github.com/jesusalcaladev/boltdocs/edit/main/docs/docs/:path',
    githubRepo: 'jesusalcaladev/boltdocs',
    tabs: [
      { id: 'guides', text: 'Guides', icon: 'SquareLibrary' },
      { id: 'components', text: 'Components', icon: 'Component' },
      { id: 'plugins', text: 'Plugins', icon: 'Plug' },
      { id: 'integrations', text: 'Integrations', icon: 'Code' },
    ],
  },
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemaps: ['https://boltdocs.vercel.app/sitemap.xml'],
  },
  integrations: {
    sandbox: {
      enable: false,
    },
  },
})
