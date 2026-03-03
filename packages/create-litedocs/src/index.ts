#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prompts from "prompts";
import picocolors from "picocolors";

const { green, yellow, bold } = picocolors;

async function run() {
  console.log(bold(green("\n🚀 Welcome to Litedocs!\n")));

  const response = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: "my-litedocs-project",
    },
  ]);

  if (!response.projectName) {
    console.log(yellow("Canceled."));
    return;
  }

  const projectDir = path.join(process.cwd(), response.projectName);

  if (fs.existsSync(projectDir)) {
    console.error(`Error: Directory ${response.projectName} already exists.`);
    process.exit(1);
  }

  fs.mkdirSync(projectDir, { recursive: true });

  const packageJson = {
    name: response.projectName,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      litedocs: "latest",
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^6.22.3",
      "@mdx-js/react": "^3.0.0",
    },
    devDependencies: {
      typescript: "^5.0.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "@vitejs/plugin-react": "^4.2.1",
      vite: "^5.2.0",
    },
  };

  fs.writeFileSync(
    path.join(projectDir, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  const gitignoreContent = `node_modules
dist
.DS_Store
`;
  fs.writeFileSync(path.join(projectDir, ".gitignore"), gitignoreContent);
  fs.writeFileSync(path.join(projectDir, ".npmignore"), gitignoreContent);

  const customCssContent = `:root {
  /* ─ Base palette ─ */
  --ld-bg-main: #0a0a0f;
  --ld-bg-soft: #0f0f18;
  --ld-bg-mute: #141420;
  --ld-surface: #1a1a2e;
  --ld-border-subtle: rgba(255, 255, 255, 0.06);
  --ld-border-strong: rgba(255, 255, 255, 0.12);

  /* ─ Text ─ */
  --ld-text-main: #e4e4ed;
  --ld-text-muted: #9d9db5;
  --ld-text-dim: #6b6b85;

  /* ─ Accent ─ */
  --ld-color-primary: #ffff;
  --ld-color-primary-hover: #f8f8f8;
  --ld-color-primary-muted: rgba(255, 255, 255, 0.05);
  --ld-color-primary-glow: rgba(255, 255, 255, 0.15);
  --ld-color-primary-text: #010101;
  --ld-color-accent: #ffff; /* Yellow accent for TOC */

  /* ─ Code ─ */
  --ld-code-bg: #0d0d14;
  --ld-code-header: #111119;
  --ld-code-text: #d4d4d4;

  /* ─ Typography ─ */
  --ld-font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --ld-font-mono:
    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    monospace;

  /* ─ Dimensions ─ */
  --ld-navbar-height: 3.5rem;
  --ld-sidebar-width: 14.5rem;
  --ld-toc-width: 13rem;
  --ld-content-max-width: 820px;
  --ld-radius-sm: 4px;
  --ld-radius-md: 8px;
  --ld-radius-lg: 12px;
  --ld-radius-full: 9999px;
}

[data-theme="light"],
.theme-light {
  --ld-bg-main: #ffffff;
  --ld-bg-soft: #f9fafb;
  --ld-bg-mute: #f3f4f6;

  --ld-surface: #ffffff;

  --ld-border-subtle: #e5e7eb;
  --ld-border-strong: #d1d5db;

  --ld-text-main: #111827;
  --ld-text-muted: #4b5563;
  --ld-text-dim: #6b7280;

  --ld-color-primary: #010101;
  --ld-color-primary-hover: #010101;
  --ld-color-primary-muted: rgba(127, 19, 236, 0.1);
  --ld-color-primary-glow: rgba(127, 19, 236, 0.25);
  --ld-color-primary-text: #010101;

  --ld-code-bg: #f3f4f6;
  --ld-code-header: #e5e7eb;
  --ld-code-text: #1f2937;
}
`;
  fs.writeFileSync(path.join(projectDir, "custom.css"), customCssContent);

  const configContent = `// litedocs.config.js
export default {
  title: '${response.projectName}',
  theme: {
    padding: '1.5rem',
    customCss: './custom.css'
  }
};
`;
  fs.writeFileSync(path.join(projectDir, "litedocs.config.js"), configContent);

  const viteConfigContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import litedocs from 'litedocs';

export default defineConfig({
  plugins: [
    react(),
    litedocs()
  ]
});
`;
  fs.writeFileSync(path.join(projectDir, "vite.config.ts"), viteConfigContent);

  const indexHtmlContent = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${response.projectName}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;
  fs.writeFileSync(path.join(projectDir, "index.html"), indexHtmlContent);

  const srcDir = path.join(projectDir, "src");
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
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
}
`;
  fs.writeFileSync(path.join(componentsDir, "Button.tsx"), buttonContent);

  const mainTsxContent = `export { Button } from './components/Button';
`;
  fs.writeFileSync(path.join(srcDir, "main.ts"), mainTsxContent);

  const docsDir = path.join(projectDir, "docs");
  fs.mkdirSync(docsDir, { recursive: true });

  const indexMdx = `# Welcome to ${response.projectName}

This is your new Litedocs project.

## Getting Started

Edit \`docs/index.mdx\` to change this page.

## Example Component

<Button onClick={() => alert('Clicked!')}>Click Me</Button>
`;

  fs.writeFileSync(path.join(docsDir, "index.mdx"), indexMdx);

  console.log(green(`\nSuccess! Created project at ${projectDir}`));
  console.log(`\nInside that directory, you can run several commands:`);
  console.log(`\n  pnpm install`);
  console.log(`  pnpm dev`);
  console.log(`\nTo get started:\n`);
  console.log(`  cd ${response.projectName}`);
  console.log(`  pnpm install`);
  console.log(`  pnpm dev\n`);
}

run().catch(console.error);
