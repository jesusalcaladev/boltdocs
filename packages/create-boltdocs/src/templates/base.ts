import path from "node:path";
import fs from "node:fs";

export function generateBaseTemplate(projectDir: string, projectName: string) {
  const srcDir = path.join(projectDir, "src");
  fs.mkdirSync(srcDir, { recursive: true });

  const componentsDir = path.join(srcDir, "components");
  fs.mkdirSync(componentsDir, { recursive: true });

  const buttonContent = `import React from 'react';

export function Button({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '0.25rem',
        border: 'none',
        backgroundColor: 'var(--ld-color-primary)',
        color: 'var(--ld-color-primary-text)',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      {children}
    </button>
  );
}
`;
  const buttonFile = "Button.tsx";
  const mainContent = `export { Button } from './components/Button';\n`;

  fs.writeFileSync(path.join(componentsDir, buttonFile), buttonContent);
  fs.writeFileSync(path.join(srcDir, "main.ts"), mainContent);

  const homePageContent = `import React from 'react';

export default function HomePage() {
  return (
    <main style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "6rem 2rem", 
      textAlign: "center",
      fontFamily: "var(--ld-font-sans)"
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        Welcome to your <span style={{ color: "var(--ld-color-primary)" }}>${projectName}</span>
      </h1>
      <p style={{ fontSize: "1.25rem", color: "var(--ld-text-muted)", marginBottom: "2rem" }}>
        This is a more complete base template for Boltdocs, featuring custom components and structure.
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <a href="/docs" style={{ 
          padding: "0.75rem 1.5rem", 
          backgroundColor: "var(--ld-color-primary)", 
          color: "var(--ld-color-primary-text)", 
          borderRadius: "0.5rem",
          textDecoration: "none",
          fontWeight: "bold"
        }}>
          Get Started
        </a>
        <a href="https://github.com/jesusalcaladev/boltdocs" target="_blank" rel="noreferrer" style={{ 
          padding: "0.75rem 1.5rem", 
          backgroundColor: "transparent", 
          color: "var(--ld-text-main)",
          border: "1px solid var(--ld-border-strong)",
          borderRadius: "0.5rem",
          textDecoration: "none"
        }}>
          GitHub
        </a>
      </div>
    </main>
  );
}
`;
  fs.writeFileSync(path.join(srcDir, "HomePage.tsx"), homePageContent);

  const docsDir = path.join(projectDir, "docs");
  fs.mkdirSync(docsDir, { recursive: true });

  const indexMdx = `# Welcome to ${projectName}

This is your new Boltdocs project using the **base template**.

## Getting Started

Edit \`docs/index.mdx\` to change this page, or \`src/HomePage.tsx\` to edit the landing page.

## Example Component

Below is an interactive custom component that we scaffolded in \`src/components/Button.tsx\`.

<Button onClick={() => alert('Button clicked!')}>Click Me</Button>
`;
  fs.writeFileSync(path.join(docsDir, "index.mdx"), indexMdx);
}
