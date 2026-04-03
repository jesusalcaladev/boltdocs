#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import prompts from 'prompts'
import picocolors from 'picocolors'
import {
  getPackageJson,
  gitignoreContent,
  markdownlintContent,
  markdownlintignoreContent,
  getBoltdocsConfig,
  getLogoLight,
  getLogoDark,
} from './templates/shared.js'
import { generateEmptyTemplate } from './templates/empty.js'
import { generateBaseTemplate } from './templates/base.js'
import { generateI18nTemplate } from './templates/i18n.js'

const { green, yellow, bold, cyan, magenta, blue, red, dim } = picocolors

function getPackageManager() {
  const userAgent = process.env.npm_config_user_agent
  if (userAgent?.includes('pnpm')) return 'pnpm'
  if (userAgent?.includes('yarn')) return 'yarn'
  if (userAgent?.includes('bun')) return 'bun'
  return 'npm'
}

async function run() {
  const pkgManager = getPackageManager()

  console.log(
    blue(
      bold(`
  ____   ___  _     _____ ____   ___   ____ ____ 
 | __ ) / _ \\| |   |_   _|  _ \\ / _ \\ / ___/ ___|
 |  _ \\| | | | |     | | | | | | | | | |   \\___ \\
 | |_) | |_| | |___  | | | |_| | |_| | |___ ___) |
 |____/ \\___/|_____| |_| |____/ \\___/ \\____|____/`),
    ),
  )
  console.log(dim(`\n  v0.0.1 - The modern documentation framework\n`))

  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-boltdocs-app',
    },
    {
      type: 'select',
      name: 'template',
      message: 'Select a project preset:',
      choices: [
        {
          title: cyan('Empty'),
          description: 'Minimal documentation setup.',
          value: 'empty',
        },
        {
          title: magenta('Base'),
          description: 'Hero and custom components.',
          value: 'base',
        },
        {
          title: yellow('i18n'),
          description: 'Multi-language support (EN/ES).',
          value: 'i18n',
        },
      ],
      initial: 1,
    },
    {
      type: 'confirm',
      name: 'install',
      message: `Install dependencies with ${bold(pkgManager)}?`,
      initial: true,
    },
  ])

  if (!response.projectName || !response.template) {
    console.log(yellow('\nOperation canceled.'))
    return
  }

  const projectDir = path.join(process.cwd(), response.projectName)

  if (fs.existsSync(projectDir)) {
    console.error(
      red(`\nError: Directory "${response.projectName}" already exists.`),
    )
    process.exit(1)
  }

  console.log(dim(`\nBuilding your documentation site...\n`))

  // 1. Create project structure
  fs.mkdirSync(projectDir, { recursive: true })
  console.log(`${green('✔')} Created project directory`)

  // 2. Generate specific template
  const configOptions: any = { homePage: './src/HomePage.tsx' }

  if (response.template === 'empty') {
    generateEmptyTemplate(projectDir, response.projectName)
  } else if (response.template === 'i18n') {
    configOptions.i18n = true
    generateI18nTemplate(projectDir)
  } else {
    generateBaseTemplate(projectDir)
  }

  console.log(`${green('✔')} Applied "${response.template}" preset`)

  // 3. Write configuration files
  fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(getPackageJson(response.projectName), null, 2),
  )
  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignoreContent)
  fs.writeFileSync(path.join(projectDir, '.npmignore'), gitignoreContent)
  fs.writeFileSync(
    path.join(projectDir, '.markdownlint.yaml'),
    markdownlintContent,
  )
  fs.writeFileSync(
    path.join(projectDir, '.markdownlintignore'),
    markdownlintignoreContent,
  )
  fs.writeFileSync(
    path.join(projectDir, 'boltdocs.config.ts'),
    getBoltdocsConfig(response.projectName, configOptions),
  )

  // 4. Create public directory and logos
  const publicDir = path.join(projectDir, 'public')
  fs.mkdirSync(publicDir, { recursive: true })
  fs.writeFileSync(path.join(publicDir, 'logo-light.svg'), getLogoLight())
  fs.writeFileSync(path.join(publicDir, 'logo-dark.svg'), getLogoDark())

  console.log(`${green('✔')} Finalized configuration and assets`)

  // 5. Install dependencies if requested
  if (response.install) {
    console.log(cyan(`\nInstalling dependencies with ${pkgManager}...\n`))
    try {
      execSync(`${pkgManager} install`, { cwd: projectDir, stdio: 'inherit' })
      console.log(`\n${green('✔')} Dependencies installed successfully`)
    } catch (e) {
      console.log(
        yellow(
          `\nCould not install dependencies automatically. Please run "${pkgManager} install".`,
        ),
      )
    }
  }

  console.log(bold(green('\n✨ All set! Your documentation is ready. ✨\n')))
  console.log(`To start developing:`)
  console.log(`  cd ${response.projectName}`)
  if (!response.install) console.log(`  ${pkgManager} install`)
  console.log(`  ${pkgManager} run dev\n`)
}

run().catch(console.error)
