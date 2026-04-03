import path from 'path'
import fs from 'fs'
import fastGlob from 'fast-glob'
import { resolveConfig } from '../config'
import { parseFrontmatter, normalizePath } from '../utils'
import * as ui from './ui'

/**
 * Interface representing a documentation hygiene issue.
 */
interface Issue {
  level: 'high' | 'warning' | 'low'
  message: string
  suggestion?: string
}

/**
 * Logic for the `boltdocs doctor` command.
 * Scans the documentation directory for broken links, missing frontmatter,
 * and orphaned translations.
 *
 * @param root - The project root directory
 */
export async function doctorAction(root: string = process.cwd()) {
  const { colors } = ui
  ui.info(
    `${colors.bold}Running documentation health check...${colors.reset}\n`,
  )
  const start = performance.now()

  try {
    const config = await resolveConfig('docs', root)
    const docsDir = path.resolve(root, 'docs')

    if (!fs.existsSync(docsDir)) {
      ui.error(`Documentation directory not found at ${docsDir}`)
      process.exit(1)
    }

    const files = await fastGlob(['**/*.md', '**/*.mdx'], {
      cwd: docsDir,
      absolute: true,
      suppressErrors: true,
    })

    let highCount = 0
    let warningCount = 0
    let lowCount = 0
    const issuesMap = new Map<string, Issue[]>()

    const addIssue = (file: string, issue: Issue) => {
      const relPath = path.relative(docsDir, file)
      let issues = issuesMap.get(relPath)
      if (!issues) {
        issues = []
        issuesMap.set(relPath, issues)
      }
      issues.push(issue)
      if (issue.level === 'high') highCount++
      else if (issue.level === 'warning') warningCount++
      else if (issue.level === 'low') lowCount++
    }

    const basePath = '/docs'

    // 1. Scan for Frontmatter, Links, and Content Issues
    for (const file of files) {
      const { data, content } = parseFrontmatter(file)

      // Frontmatter Validation
      if (!data.title) {
        addIssue(file, {
          level: 'warning',
          message: 'Missing "title" in frontmatter.',
          suggestion:
            'Add `title: Your Title` to the YAML frontmatter at the top of the file.',
        })
      }

      if (!data.description) {
        addIssue(file, {
          level: 'low',
          message: 'Missing "description" in frontmatter.',
          suggestion:
            'Adding a description helps with SEO and search previews.',
        })
      }

      // Link Validation
      const linkRegex = /\[.*?\]\((.*?)\)/g
      const htmlLinkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/g
      const links = [
        ...content.matchAll(linkRegex),
        ...content.matchAll(htmlLinkRegex),
      ]

      for (const match of links) {
        let link = match[1]
        if (
          !link ||
          link.startsWith('http') ||
          link.startsWith('https') ||
          link.startsWith('#') ||
          link.startsWith('mailto:') ||
          link.startsWith('tel:')
        ) {
          continue
        }

        link = link.split('#')[0]
        if (!link) continue

        let targetPath: string
        if (link.startsWith('/')) {
          let pathAfterBase = link
          if (link.startsWith(basePath + '/') || link === basePath) {
            pathAfterBase = link.substring(basePath.length)
          }
          targetPath = path.join(docsDir, pathAfterBase)
        } else {
          targetPath = path.resolve(path.dirname(file), link)
        }

        const extensions = ['', '.md', '.mdx', '/index.md', '/index.mdx']
        let exists = false
        for (const ext of extensions) {
          const finalPath = targetPath + ext
          if (fs.existsSync(finalPath) && fs.statSync(finalPath).isFile()) {
            exists = true
            break
          }
        }

        if (!exists) {
          addIssue(file, {
            level: 'high',
            message: `Broken internal link: "${link}"`,
            suggestion: `Ensure the file exists at "${targetPath}". If it's a directory, ensure it has an "index.md" or "index.mdx".`,
          })
        }
      }
    }

    // 2. Scan for Orphaned Translations
    if (config.i18n) {
      const { defaultLocale, locales } = config.i18n
      const otherLocales = Object.keys(locales).filter(
        (l) => l !== defaultLocale,
      )

      for (const file of files) {
        const relPath = normalizePath(path.relative(docsDir, file))
        const parts = relPath.split('/')

        if (parts[0] === defaultLocale) {
          const pathAfterLocale = parts.slice(1).join('/')
          for (const locale of otherLocales) {
            const localeParts = [locale, ...parts.slice(1)]
            const targetLocaleFile = path.join(docsDir, ...localeParts)

            if (!fs.existsSync(targetLocaleFile)) {
              addIssue(file, {
                level: 'warning',
                message: `Missing translation for locale "${locale}"`,
                suggestion: `Create a translated version of this file at "${locale}/${pathAfterLocale}".`,
              })
            }
          }
        }
      }
    }

    // Final Reporting
    if (issuesMap.size === 0) {
      ui.success('All documentation files are healthy!\n')
    } else {
      for (const [file, issues] of issuesMap.entries()) {
        console.log(`📄 ${colors.bold}${file}${colors.reset}`)

        const sortedIssues = issues.sort((a, b) => {
          const order = { high: 1, warning: 2, low: 3 }
          return order[a.level] - order[b.level]
        })

        for (const issue of sortedIssues) {
          let prefix = ''
          let color = ''
          if (issue.level === 'high') {
            prefix = '❌'
            color = colors.red
          } else if (issue.level === 'warning') {
            prefix = '⚠️'
            color = colors.yellow
          } else {
            prefix = 'ℹ️'
            color = colors.cyan
          }

          console.log(
            `   ${color}${prefix} ${issue.level.toUpperCase()}:${colors.reset} ${issue.message}`,
          )
          if (issue.suggestion) {
            console.log(
              `      ${colors.gray}💡 Suggestion: ${issue.suggestion}${colors.reset}`,
            )
          }
        }
        console.log('')
      }

      console.log(`${colors.bold}Summary:${colors.reset}`)
      console.log(
        `   ${colors.red}${highCount} high-level errors${colors.reset}`,
      )
      console.log(`   ${colors.yellow}${warningCount} warnings${colors.reset}`)
      console.log(
        `   ${colors.cyan}${lowCount} minor improvements${colors.reset}\n`,
      )

      if (highCount > 0) {
        ui.error(
          'HIGH ERROR: Fix these to ensure your documentation builds correctly.',
        )
      }
      if (warningCount > 0 || lowCount > 0) {
        ui.info(
          'TIP: Address warnings and suggestions for premium quality docs.',
        )
      }
      console.log('')
    }

    const duration = performance.now() - start
    ui.info(`Finished in ${duration.toFixed(2)}ms\n`)

    if (highCount > 0) {
      process.exit(1)
    }
  } catch (e) {
    ui.error('Failed to run doctor check:', e)
    process.exit(1)
  }
}
