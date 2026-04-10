import path from 'node:path'
import fs from 'node:fs'
import { getIndexCss } from './shared.js'

export function generateExternalTemplate(projectDir: string) {
  const srcDir = path.join(projectDir, 'src')
  fs.mkdirSync(srcDir, { recursive: true })

  const docsDir = path.join(projectDir, 'docs')
  fs.mkdirSync(docsDir, { recursive: true })

  const externalPagesDir = path.join(docsDir, 'pages-external')
  fs.mkdirSync(externalPagesDir, { recursive: true })

  const externalPagesContent = `import React from 'react'
import { PrimitiveButton } from 'boltdocs/client'
import HomePage from '../../src/home-page'

export const homePage = HomePage

/**
 * External pages are standalone React components mapped to specific routes.
 * They are defined outside the standard docs/ hierarchy.
 */
export const pages = {
  '/contact': () => (
    <div className="p-20 text-center">
      <h1 className="text-6xl font-black mb-6 bg-linear-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
        Contact Us
      </h1>
      <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
        This is a custom page defined in pages-external/index.tsx. 
        It bypassing the standard markdown processing while still being part of your Boltdocs app.
      </p>
      <PrimitiveButton 
        onClick={() => window.location.href = '/'}
        className="px-8 py-4 text-lg"
      >
        Return Home
      </PrimitiveButton>
    </div>
  )
}

/**
 * Custom layout specifically for external pages.
 * If not provided, it will fallback to the default app layout.
 */
export const layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-bg-main text-text-main flex flex-col">
    <header className="p-6 border-b border-border-subtle bg-bg-surface/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="font-black text-2xl tracking-tight">BOLTDOCS <span className="text-primary-500 text-sm font-medium">EXTERNAL</span></div>
        <nav className="flex gap-6 items-center">
          <a href="/" className="text-sm font-medium hover:text-primary-500 transition-colors">Home</a>
          <a href="/docs" className="text-sm font-medium hover:text-primary-500 transition-colors">Documentation</a>
        </nav>
      </div>
    </header>
    <main className="flex-1">
      {children}
    </main>
    <footer className="p-12 border-t border-border-subtle bg-bg-muted/30">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-text-muted font-medium italic">
          "The best way to predict the future is to documenting it."
        </p>
      </div>
    </footer>
  </div>
)
`

  fs.writeFileSync(
    path.join(externalPagesDir, 'index.tsx'),
    externalPagesContent,
  )

  const homePageContent = `import React from 'react'
import { Button } from 'boltdocs/client'

export default function HomePage() {
  return (
    <div className="hero-section">
      <h1 className="hero-title text-center">External Pages</h1>
      <p className="hero-subtitle text-center">
        Boltdocs now supports standalone React pages and custom layouts outside the standard docs structure.
      </p>
      <div className="flex gap-4">
        <a href="/docs" className="no-underline">
          <Button className="text-lg px-10 py-4">Read Docs</Button>
        </a>
        <a href="/contact" className="no-underline">
          <Button variant="ghost" className="text-lg px-10 py-4">External Page</Button>
        </a>
      </div>
    </div>
  )
}
`
  fs.writeFileSync(path.join(srcDir, 'home-page.tsx'), homePageContent)
  fs.writeFileSync(path.join(projectDir, 'index.css'), getIndexCss())

  // Default docs
  fs.writeFileSync(
    path.join(docsDir, 'index.mdx'),
    `---
title: Introduction
---

# External Pages Feature

This project demonstrates the \`pages-external\` feature of Boltdocs.

Check out [Contact Page](/contact) to see it in action.

The source code for that page is located in \`docs/pages-external/index.tsx\`.
`,
  )
}
