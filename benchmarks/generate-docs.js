import fs from 'node:fs';
import path from 'node:path';

const NUM_PAGES = parseInt(process.argv[2], 10) || 100;

function createPages(targetDir, isDocusaurus) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Clear existing pages to avoid conflicts/leftovers
  const existingFiles = fs.readdirSync(targetDir);
  for (const file of existingFiles) {
    if (file.endsWith('.mdx') || file.endsWith('.md')) {
      fs.unlinkSync(path.join(targetDir, file));
    }
  }

  for (let i = 1; i <= NUM_PAGES; i++) {
    const filename = `page-${i}.mdx`;
    const filepath = path.join(targetDir, filename);

    const content = `---
title: "Generated Page ${i}"
sidebar_position: ${i}
---

# Benchmark Page ${i}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Section 1

Testing markdown compilation performance. This page is generated automatically to benchmark the build and dev server times.

* Item 1
* Item 2
* Item 3

## Section 2

Morbi leo urna molestie at elementum eu facilisis. Risus feugiat in ante metus dictum at tempor. Faucibus scelerisque eleifend donec pretium vulputate. Sapien faucibus et molestie ac feugiat sed lectus...

${!isDocusaurus ? '<Button>Click Me</Button>' : ''}
`;
    fs.writeFileSync(filepath, content);
  }

  fs.writeFileSync(path.join(targetDir, 'index.mdx'), `---
title: "Benchmark Index"
---
# Index Page
Testing ${NUM_PAGES} pages.
`);

  console.log(`✅ Generated ${NUM_PAGES} pages in ${targetDir}`);
}

const root = process.cwd();
const nextraDocs = path.join(root, 'nextra-site', 'pages');
const litedocsDocs = path.join(root, 'litedocs-site', 'docs');

console.log(`Generating ${NUM_PAGES} pages for each site...`);
createPages(nextraDocs, true);
createPages(litedocsDocs, false);
