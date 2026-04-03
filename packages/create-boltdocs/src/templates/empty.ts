import path from 'node:path'
import fs from 'node:fs'
import { getIndexCss, getLayoutPage } from './shared.js'

export function generateEmptyTemplate(projectDir: string, projectName: string) {
  const srcDir = path.join(projectDir, 'src')
  fs.mkdirSync(srcDir, { recursive: true })

  const homePageContent = `import React from 'react';

export default function HomePage() {
  return (
    <div className="hero-section">
      <h1 className="hero-title">${projectName}</h1>
      <p className="hero-subtitle">
        Your minimal documentation site is ready. Start building something amazing.
      </p>
      <div className="flex gap-4">
        <a href="/docs" className="bg-primary text-primary-foreground px-8 py-3 rounded-lg no-underline font-semibold text-lg hover:opacity-90 transition-opacity">
          Get Started
        </a>
      </div>
    </div>
  );
}
`
  const docsDir = path.join(projectDir, 'docs')
  fs.mkdirSync(docsDir, { recursive: true })

  fs.writeFileSync(path.join(srcDir, 'HomePage.tsx'), homePageContent)
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
