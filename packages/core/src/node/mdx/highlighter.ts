import { createHighlighter } from 'shiki'
import type { Highlighter } from 'shiki'

let shikiHighlighter: Highlighter | null = null

/**
 * Retrieves or initializes the Shiki highlighter instance.
 * Supports dual-theme configurations (light/dark).
 *
 * @param codeTheme - Theme configuration (string for single, object for dual).
 * @returns A promise resolving to the highlighter instance.
 */
export async function getShikiHighlighter(codeTheme: any) {
  if (shikiHighlighter) return shikiHighlighter

  const themes =
    typeof codeTheme === 'object'
      ? [codeTheme.light, codeTheme.dark]
      : [codeTheme ?? 'github-dark']

  // Fallbacks for standard themes
  ;['github-light', 'github-dark'].forEach((t) => {
    if (!themes.includes(t)) themes.push(t)
  })

  // Initialize with a core set of languages first to speed up boot
  shikiHighlighter = await createHighlighter({
    themes,
    langs: [
      'tsx',
      'jsx',
      'ts',
      'js',
      'json',
      'md',
      'mdx',
      'css',
      'html',
      'bash',
      'sh',
      'yaml',
      'yml',
    ],
  })

  return shikiHighlighter
}
