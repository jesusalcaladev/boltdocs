/**
 * @type {import('boltdocs').BoltdocsConfig}
 */
export default {
  title: 'Boltdocs',
  siteUrl: "https://boltdocs.vercel.app/",
  themeConfig: {
    navbar:[
      {
        href: "/",
        text: "Home"
      },
      {
        text: "Docs",
        href: "/docs/overview/introduction",
      },
    ],
    editLink: "https://github.com/jesusalcaladev/boltdocs/edit/main/docs/docs/:path",
    githubRepo: "jesusalcaladev/boltdocs",
    description: "Documentation for Boltdocs - The best documentation generator for React",
    tabs: [
      { id: "guides", text: "Guides", icon: "SquareLibrary" },
      { id: "components", text: "Components", icon: "Component" },
      { id: "plugins", text: "Plugins", icon: "Plug" }
    ]
  }
};
