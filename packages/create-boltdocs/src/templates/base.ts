import path from 'node:path'
import fs from 'node:fs'
import { getIndexCss, getLayoutPage, generateHomePage } from './shared.js'

export function generateBaseTemplate(projectDir: string, projectName: string) {
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

  const docsDir = path.join(projectDir, 'docs')
  fs.mkdirSync(docsDir, { recursive: true })

  fs.writeFileSync(
    path.join(srcDir, 'home-page.tsx'),
    generateHomePage(),
  )
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
