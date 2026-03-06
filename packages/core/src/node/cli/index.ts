#!/usr/bin/env node
import cac from "cac";
import { configAction } from "./commands/config";
import { generateCssAction } from "./commands/generate-css";

const cli = cac("boltdocs");

cli
  .command("config [root]", "Output the resolved boltdocs configuration")
  .action(configAction);

cli
  .command(
    "generate:css [path]",
    "Generate a custom.css file with default Boltdocs CSS variables",
  )
  .action(generateCssAction);

cli.help();
cli.version("1.0.0");

cli.parse();
