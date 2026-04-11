import path from 'node:path'
import fs from 'node:fs'
import { getIndexCss, getLayoutPage, generateHomePage } from './shared.js'

export function generateI18nTemplate(projectDir: string, projectName: string) {
  const srcDir = path.join(projectDir, 'src')
  fs.mkdirSync(srcDir, { recursive: true })

  const componentsDir = path.join(srcDir, 'components')
  fs.mkdirSync(componentsDir, { recursive: true })

  const buttonContent = `import React from 'react';

export function Button({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={\`bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all cursor-pointer \${className}\`}
      {...props}
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
  fs.writeFileSync(path.join(projectDir, 'index.css'), getIndexCss())
  fs.writeFileSync(path.join(docsDir, 'layout.tsx'), getLayoutPage())

  // English docs
  fs.writeFileSync(
    path.join(docsDir, 'index.mdx'),
    `---
title: Introduction
---

# Internationalization

This project is configured with English and Spanish support.

Check the \`es/\` folder for Spanish content.
`,
  )

  // Spanish docs
  const esDocsDir = path.join(docsDir, 'es')
  fs.mkdirSync(esDocsDir, { recursive: true })
  fs.writeFileSync(
    path.join(esDocsDir, 'index.mdx'),
    `---
title: Introducción
---

# Internacionalización

Este proyecto está configurado con soporte para Inglés y Español.

Boltdocs detecta automáticamente las carpetas de idiomas.
`,
  )
}
