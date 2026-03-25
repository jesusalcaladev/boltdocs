import { normalizePath } from "../utils";
import type { BoltdocsConfig } from "../config";
import type { BoltdocsPluginOptions } from "./types";
import path from "path";

/**
 * Generates the raw source code for the virtual entry file (`\0virtual:boltdocs-entry`).
 * This code initializes the client-side React application.
 *
 * @param options - Plugin options containing potential custom overrides (like `homePage` or `customCss`)
 * @param config - The resolved Boltdocs configuration containing custom plugins and components
 * @returns A string of JavaScript code to be evaluated by the browser
 */
export function generateEntryCode(
  options: BoltdocsPluginOptions,
  config?: BoltdocsConfig,
): string {
  const homeImport = options.homePage
    ? `import HomePage from '${normalizePath(options.homePage)}';`
    : "";
  const homeOption = options.homePage ? "homePage: HomePage," : "";
  const customCssImport = options.customCss
    ? `import '${normalizePath(options.customCss)}';`
    : "";

  const pluginComponents =
    config?.plugins?.flatMap((p) => Object.entries(p.components || {})) || [];

  const componentImports = pluginComponents
    .map(
      ([
        name,
        path,
      ]) => `import * as _comp_${name} from '${normalizePath(path)}';
const ${name} = _comp_${name}.default || _comp_${name}['${name}'] || _comp_${name};`,
    )
    .join("\n");
  const componentMap = pluginComponents.map(([name]) => name).join(", ");

  const docsDirName = path.basename(options.docsDir || "docs");

  const externalEntries = Object.entries(config?.external || {});
  const externalImports = externalEntries
    .map(
      ([_routePath, compPath], i) =>
        `import _ext_${i} from '${normalizePath(compPath)}';`
    )
    .join("\n");
  const externalOption =
    externalEntries.length > 0
      ? `externalPages: { ${externalEntries
          .map(([path], i) => `"${path}": _ext_${i}`)
          .join(", ")} },`
      : "";

  return `
import { createBoltdocsApp as _createApp } from 'boltdocs/client';
import 'boltdocs/style.css';
${customCssImport}
import _routes from 'virtual:boltdocs-routes';
import _config from 'virtual:boltdocs-config';
${homeImport}
${componentImports}
${externalImports}

_createApp({
  target: '#root',
  routes: _routes,
  docsDirName: '${docsDirName}',
  config: _config,
  modules: import.meta.glob('/${docsDirName}/**/*.{md,mdx}'),
  hot: import.meta.hot,
  ${homeOption}
  ${externalOption}
  components: { ${componentMap} },
});
`;
}
