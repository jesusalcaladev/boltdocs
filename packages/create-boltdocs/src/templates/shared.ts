export function getPackageJson(projectName: string) {
  return {
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
      "@mdx-js/react": "^3.0.0",
    },
    devDependencies: {
      typescript: "^5.0.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      vite: "^8.0.0",
      "markdownlint-cli2": "^0.21.0",
    },
  };
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

export function getBoltdocsConfig(projectName: string) {
  return `/**
 * @type {import('boltdocs').BoltdocsConfig}
 */
export default {
  title: '${projectName}',
};
`;
}

export function getViteConfig() {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import boltdocs from 'boltdocs';

export default defineConfig({
  plugins: [
    react(),
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
