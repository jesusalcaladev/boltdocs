import path from 'node:path'
import fs from 'node:fs'
import { getIndexCss, getLayoutPage } from './shared.js'

export function generateBaseTemplate(projectDir: string) {
  const srcDir = path.join(projectDir, 'src')
  fs.mkdirSync(srcDir, { recursive: true })

  const componentsDir = path.join(srcDir, 'components')
  fs.mkdirSync(componentsDir, { recursive: true })

  const buttonContent = `import React from 'react';

export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={'px-6 py-3 rounded-lg bg-primary text-primary-foreground cursor-pointer font-bold transition-opacity hover:opacity-90 ' + (props.className || '')}
    >
      {children}
    </button>
  );
}
`
  fs.writeFileSync(path.join(componentsDir, 'Button.tsx'), buttonContent)

  const homePageContent = `import { Button, Cards, Card } from 'boltdocs/client';

export default function HomePage() {
  return (
    <div className="hero-section">
      <h1 className="hero-title">my-boltdocs-app</h1>
      <p className="hero-subtitle">
        The modern documentation framework. Fast, efficient, and beautiful by default.
      </p>
      
      <div className="flex gap-4 mb-16">
        <Button href="/docs">
          Get Started
        </Button>
        <Button href="https://github.com/jesusalcaladev/boltdocs" variant={'ghost'}>
          GitHub
        </Button>
      </div>

      <Cards>
        {[
          { 
            title: "Performance First", 
            desc: "Ultra-fast load times and instant HMR with Vite-powered development." 
          },
          { 
            title: "MDX Support", 
            desc: "Write documentation with React components directly in your markdown files." 
          },
          { 
            title: "Fully Customizable", 
            desc: "Custom layouts, components, and themes tailored to your project needs." 
          }
        ].map((feat, i) => (
          <Card key={i} title={feat.title}>
            {feat.desc}
          </Card>
        ))}
      </Cards>
    </div>
  );
}

`
  const docsDir = path.join(projectDir, 'docs')
  fs.mkdirSync(docsDir, { recursive: true })

  fs.writeFileSync(path.join(srcDir, 'home-page.tsx'), homePageContent)
  fs.writeFileSync(path.join(docsDir, 'layout.tsx'), getLayoutPage())
  fs.writeFileSync(path.join(projectDir, 'index.css'), getIndexCss())

  const indexMdx = `---
title: Introduction
---

# Introduction

Welcome to your new documentation site!

## Features

- **Beautiful Design**: Modern and clean interface.
- **Custom Components**: Use React in your markdown.
- **Fast**: Optimized for speed and performance.

<Tip>
  You can find this component in \`src/components/Button.tsx\`.
</Tip>

<Button onClick={() => alert('Hello world!')}>Try me</Button>
`
  fs.writeFileSync(path.join(docsDir, 'index.mdx'), indexMdx)
}
