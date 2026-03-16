export function getPackageJson(projectName: string, framework: string = 'react') {
  const base = {
    name: projectName,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
      "lint:md": 'markdownlint-cli2 "**/*.{md,mdx}"',
      "lint:md:fix": 'markdownlint-cli2 --fix "**/*.{md,mdx}"',
    },
    dependencies: {
      boltdocs: "latest",
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^6.22.3",
      "@mdx-js/react": "^3.0.0",
    },
    devDependencies: {
      typescript: "^5.0.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      vite: "^5.2.0",
      "markdownlint-cli2": "^0.21.0",
    },
  };

  if (framework === 'svelte') {
    Object.assign(base.dependencies, { svelte: "^4.2.0" });
    Object.assign(base.devDependencies, { "@sveltejs/vite-plugin-svelte": "^3.0.0" });
  } else if (framework === 'vue') {
    Object.assign(base.dependencies, { vue: "^3.4.0" });
    Object.assign(base.devDependencies, { "@vitejs/plugin-vue": "^5.0.0" });
  } else if (framework === 'solid') {
    Object.assign(base.dependencies, { "solid-js": "^1.8.0" });
    Object.assign(base.devDependencies, { "vite-plugin-solid": "^2.8.0" });
  } else if (framework === 'preact') {
    Object.assign(base.dependencies, { preact: "^10.19.0" });
    Object.assign(base.devDependencies, { "@preact/preset-vite": "^2.7.0" });
  } else if (framework === 'lit') {
    Object.assign(base.dependencies, { lit: "^3.1.0" });
  }

  return base;
}

export const gitignoreContent = `node_modules
dist
.DS_Store
`;

export const markdownlintContent = `# Default state for all rules
default: true

# MD013/line-length - Line length
MD013: false # Too restrictive for technical docs with long URLs and strings

# MD024/no-duplicate-heading/no-duplicate-header
MD024:
  siblings_only: true

# MD033/no-inline-html - Inline HTML
MD033: false # Disabled because we use MDX which uses JSX and HTML extensively

# MD041/first-line-heading/first-line-h1 - First line in a file should be a top-level heading
MD041: false # Disabled since we use frontmatter for title/metadata

# MD025/single-title/single-h1
MD025: false

# MD051/link-fragments
MD051: false # Sometimes fragments aren't fully resolved locally by the linter
`;

export const markdownlintignoreContent = `.git
**/node_modules
node_modules
dist
`;

export function getBoltdocsConfig(projectName: string, framework: string = 'react') {
  return `/**
 * @type {import('boltdocs').BoltdocsConfig}
 */
export default {
  title: '${projectName}',
  framework: '${framework}',
  themeConfig: {
    customCss: './custom.css'
  }
};
`;
}

export function getViteConfig(framework: string = 'react') {
  let plugins = '';
  let imports = "import react from '@vitejs/plugin-react';\nimport boltdocs from 'boltdocs';";

  if (framework === 'svelte') {
    imports = "import { svelte } from '@sveltejs/vite-plugin-svelte';\nimport boltdocs from 'boltdocs';";
    plugins = "svelte(),";
  } else if (framework === 'vue') {
    imports = "import vue from '@vitejs/plugin-vue';\nimport boltdocs from 'boltdocs';";
    plugins = "vue(),";
  } else if (framework === 'solid') {
    imports = "import solid from 'vite-plugin-solid';\nimport boltdocs from 'boltdocs';";
    plugins = "solid(),";
  } else if (framework === 'preact') {
    imports = "import preact from '@preact/preset-vite';\nimport boltdocs from 'boltdocs';";
    plugins = "preact(),";
  } else {
    plugins = "react(),";
  }

  return `import { defineConfig } from 'vite';
${imports}

export default defineConfig({
  plugins: [
    ${plugins}
    boltdocs({
      docsDir: "./docs",
      homePage: "./src/HomePage.tsx",
    }),
  ],
});
`;
}

export function getIndexHtml(projectName: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;
}

export const customCssContent = `:root {
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
