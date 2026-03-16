#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import prompts from "prompts";
import picocolors from "picocolors";
import {
  getPackageJson,
  customCssContent,
  getBoltdocsConfig,
  getIndexHtml,
  gitignoreContent,
  markdownlintContent,
  markdownlintignoreContent,
  getViteConfig,
} from "./templates/shared.js";
import { generateEmptyTemplate } from "./templates/empty.js";
import { generateBaseTemplate } from "./templates/base.js";

const { green, yellow, bold } = picocolors;

async function run() {
  console.log(bold(green("\n🚀 Welcome to Boltdocs!\n")));

  const response = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: "my-boltdocs-project",
    },
    {
      type: "select",
      name: "framework",
      message: "Choose a framework:",
      choices: [
        { title: "React", value: "react" },
        { title: "Preact", value: "preact" },
        { title: "Svelte", value: "svelte" },
        { title: "Vue", value: "vue" },
        { title: "Solid", value: "solid" },
        { title: "Lit", value: "lit" },
      ],
      initial: 0,
    },
    {
      type: "select",
      name: "template",
      message: "Choose a template:",
      choices: [
        {
          title: "Base (Includes example components and landing page)",
          value: "base",
        },
        { title: "Empty (Minimal docs setup)", value: "empty" },
      ],
      initial: 0,
    },
  ]);

  if (!response.projectName || !response.template || !response.framework) {
    console.log(yellow("Canceled."));
    return;
  }

  const projectDir = path.join(process.cwd(), response.projectName);

  if (fs.existsSync(projectDir)) {
    console.error(`Error: Directory ${response.projectName} already exists.`);
    process.exit(1);
  }

  fs.mkdirSync(projectDir, { recursive: true });

  // 1. Write shared files
  fs.writeFileSync(
    path.join(projectDir, "package.json"),
    JSON.stringify(getPackageJson(response.projectName, response.framework), null, 2),
  );

  fs.writeFileSync(path.join(projectDir, ".gitignore"), gitignoreContent);
  fs.writeFileSync(path.join(projectDir, ".npmignore"), gitignoreContent);
  fs.writeFileSync(
    path.join(projectDir, ".markdownlint.yaml"),
    markdownlintContent,
  );
  fs.writeFileSync(
    path.join(projectDir, ".markdownlintignore"),
    markdownlintignoreContent,
  );
  fs.writeFileSync(path.join(projectDir, "custom.css"), customCssContent);
  fs.writeFileSync(
    path.join(projectDir, "boltdocs.config.js"),
    getBoltdocsConfig(response.projectName, response.framework),
  );
  fs.writeFileSync(path.join(projectDir, "vite.config.ts"), getViteConfig(response.framework));
  fs.writeFileSync(
    path.join(projectDir, "index.html"),
    getIndexHtml(response.projectName),
  );

  // 2. Generate specific template
  if (response.template === "empty") {
    generateEmptyTemplate(projectDir, response.projectName, response.framework);
  } else {
    generateBaseTemplate(projectDir, response.projectName, response.framework);
  }

  console.log(
    green(
      `\nSuccess! Created project at ${projectDir} using '${response.template}' template.`,
    ),
  );
  console.log(`\nInside that directory, you can run several commands:`);
  console.log(`\n  pnpm install`);
  console.log(`  pnpm dev`);
  console.log(`\nTo get started:\n`);
  console.log(`  cd ${response.projectName}`);
  console.log(`  pnpm install`);
  console.log(`  pnpm dev\n`);
}

run().catch(console.error);
