import { Plugin } from "vite";
import { litedocsPlugin } from "./plugin/index";
import { litedocsMdxPlugin } from "./mdx";
import { LitedocsPluginOptions } from "./plugin/index";

import { resolveConfig } from "./config";

export default async function litedocs(
  options?: LitedocsPluginOptions,
): Promise<Plugin[]> {
  const docsDir = options?.docsDir || "docs";
  const config = await resolveConfig(docsDir);

  return [...litedocsPlugin(options, config), litedocsMdxPlugin(config)];
}

export type { LitedocsPluginOptions };
export { generateStaticPages } from "./ssg";
export type { SSGOptions } from "./ssg";
export type { RouteMeta } from "./routes";
export type { LitedocsConfig, LitedocsThemeConfig } from "./config";
