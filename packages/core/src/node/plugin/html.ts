import type { BoltdocsConfig } from '../config'

/**
 * Injects OpenGraph, Twitter, and generic SEO meta tags into the final HTML output.
 * Also ensures the virtual entry file is injected if it's missing (e.g., standard Vite index.html).
 *
 * @param html - The original HTML string
 * @param config - The resolved Boltdocs configuration containing site metadata
 * @returns The modified HTML string with injected tags
 */
export function injectHtmlMeta(html: string, config: BoltdocsConfig): string {
  const title = config.themeConfig?.title || 'Boltdocs'
  const description = config.themeConfig?.description || ''

  const seoTags = [
    `<meta name="description" content="${description}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:type" content="website">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="generator" content="Boltdocs">`,
  ].join('\n    ')

  const themeScript = `
    <script>
      (function() {
        try {
          var stored = localStorage.getItem("boltdocs-theme");
          var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
          if (theme === "light") {
            document.documentElement.classList.add("theme-light");
            document.documentElement.dataset.theme = "light";
          } else {
            document.documentElement.classList.remove("theme-light");
            document.documentElement.dataset.theme = "dark";
          }
        } catch (e) {}
      })();
    </script>
  `

  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  html = html.replace('</head>', `    ${seoTags}\n${themeScript}  </head>`)

  if (!html.includes('src/main')) {
    html = html.replace(
      '</body>',
      '  <script type="module">import "virtual:boltdocs-entry";</script>\n  </body>',
    )
  }

  return html
}
