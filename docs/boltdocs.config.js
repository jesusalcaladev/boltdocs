/**
 * @type {import('boltdocs').BoltdocsConfig}
 */
export default {
  title: 'boltdocs',
  siteUrl: "https://boltdocs.vercel.app/",
  themeConfig: {
    codeTheme: {
      light: "github-light",
      dark: "github-dark",
    },
    logo: {
      dark: '/light.svg',
      light: '/dark.svg',
      alt: 'Boltdocs Logo',
    },
    navbar:[
      {
        href: "/",
        text: "Home",
        position: 'right',

      },
      {
        text: "Docs",
        position: 'right',
        link: "/docs/overview/introduction",
      },
    ],
    linkPreview: true,
    editLink: "https://github.com/jesusalcaladev/boltdocs/edit/main/docs/docs/:path",
    githubRepo: "jesusalcaladev/boltdocs",
    description: "Documentation for Boltdocs - The best documentation generator for React",
    tabs: [
      { id: "guides", text: "Guides", icon: "SquareLibrary" },
      { id: "components", text: "Components", icon: "Component" },
      { id: "plugins", text: "Plugins", icon: "Plug" },
      { id: "integrations", text: "Integrations", icon: "Code" }
    ]
  },
   integrations: {
    sandbox: {
      enable: false,
    }
  },
};
