#!/usr/bin/env node
import cac from 'cac'
import { devAction, buildAction, previewAction } from './cli'

const cli = cac('boltdocs')

cli.command('[root]', 'Start development server').alias('dev').action(devAction)

cli.command('build [root]', 'Build for production').action(buildAction)

cli.command('preview [root]', 'Preview production build').action(previewAction)

cli.help()
// This will be replaced at build time or package publishing, but hardcoded to 2.0.0 for now
cli.version('2.0.0')

cli.parse()
