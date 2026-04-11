import path from 'node:path'
import fs from 'node:fs'
import { getIndexCss, getLayoutPage, generateHomePage } from './shared.js'

export function generateEmptyTemplate(projectDir: string, projectName: string) {
  const srcDir = path.join(projectDir, 'src')
  fs.mkdirSync(srcDir, { recursive: true })

  const docsDir = path.join(projectDir, 'docs')
  fs.mkdirSync(docsDir, { recursive: true })

  fs.writeFileSync(
    path.join(srcDir, 'home-page.tsx'),
    generateHomePage(),
  )
  fs.writeFileSync(path.join(projectDir, 'index.css'), getIndexCss())
  fs.writeFileSync(path.join(docsDir, 'layout.tsx'), getLayoutPage())

  const indexMdx = `---
title: Welcome
---

# Welcome to ${projectName}

This is a minimal documentation setup. You can start by editing \`docs/index.mdx\`.
`
  fs.writeFileSync(path.join(docsDir, 'index.mdx'), indexMdx)
}
