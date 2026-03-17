import path from "node:path";
import fs from "node:fs";

export function generateEmptyTemplate(projectDir: string, projectName: string) {
  const srcDir = path.join(projectDir, "src");
  fs.mkdirSync(srcDir, { recursive: true });

  const homePageContent = `import React from 'react';

export default function HomePage() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <h1>Welcome to ${projectName}</h1>
      <p>This is your Boltdocs documentation site.</p>
      <a href="/docs" style={{ color: "var(--ld-color-primary)", textDecoration: "underline" }}>
        Go to documentation
      </a>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(srcDir, "HomePage.tsx"), homePageContent);

  const docsDir = path.join(projectDir, "docs");
  fs.mkdirSync(docsDir, { recursive: true });

  const indexMdx = `# Welcome
  
This is your first documentation page. Edit \`docs/index.mdx\` to change this page.
`;
  fs.writeFileSync(path.join(docsDir, "index.mdx"), indexMdx);
}
