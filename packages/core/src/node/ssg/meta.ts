import { escapeHtml } from '../utils'

/**
 * Replaces placeholder or default meta tags in the HTML template with page-specific values.
 *
 * @param html - The base HTML template string
 * @param meta - An object containing the derived `title` and `description` for the specific page
 * @returns The final HTML string for that specific page
 */
export function replaceMetaTags(
  html: string,
  meta: { title: string; description: string },
): string {
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)

  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${description}$2`,
    )
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(
      /(<meta property="og:description" content=")[^"]*(")/,
      `$1${description}$2`,
    )
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(
      /(<meta name="twitter:description" content=")[^"]*(")/,
      `$1${description}$2`,
    )
}
