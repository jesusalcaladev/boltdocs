import { Plugin } from "vite";
import { boltdocsPlugin } from "./plugin/index";
import { boltdocsMdxPlugin } from "./mdx";
import { BoltdocsPluginOptions } from "./plugin/index";

import { resolveConfig } from "./config";

export default async function boltdocs(
  options?: BoltdocsPluginOptions,
): Promise<Plugin[]> {
  const docsDir = options?.docsDir || "docs";
  const config = await resolveConfig(docsDir);

  return [...boltdocsPlugin(options, config), boltdocsMdxPlugin(config)];
}

export type { BoltdocsPluginOptions };
export { generateStaticPages } from "./ssg";
export type { SSGOptions } from "./ssg";
export type { RouteMeta } from "./routes";
export type { BoltdocsConfig, BoltdocsThemeConfig } from "./config";
