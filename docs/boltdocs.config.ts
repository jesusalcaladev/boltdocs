import { defineConfig } from 'boltdocs'
import mermaidPlugin from '@bdocs/plugin-mermaid'

export default defineConfig({
  plugins: [mermaidPlugin()],
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
        label: 'Docs',
        href: '/docs/overview/introduction',
      },
      {
        label: 'API',
        href: '/docs/hooks/use-routes',
      },
      {
        label: 'Components',
        href: '/docs/components/overview',
      },
    ],
    editLink:
      'https://github.com/jesusalcaladev/boltdocs/edit/main/docs/docs/:path',
    githubRepo: 'jesusalcaladev/boltdocs',
    tabs: [
      { id: 'guides', text: 'Guides', icon: 'SquareLibrary' },
      { id: 'api', text: 'API', icon: 'Braces' },
      { id: 'primitives', text: 'Primitives', icon: 'Boxes' },
      { id: 'components', text: 'Components', icon: 'Component' },
      { id: 'plugins', text: 'Plugins', icon: 'Plug' },
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
