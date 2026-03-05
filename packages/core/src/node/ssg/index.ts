import fs from "fs";
import path from "path";
import { generateRoutes } from "../routes";
import { escapeHtml } from "../utils";
import { fileURLToPath } from "url";
import { createRequire } from "module";

import { SSGOptions } from "./options";
import { replaceMetaTags } from "./meta";
import { generateSitemap } from "./sitemap";

// Re-export options for consumers
export type { SSGOptions };

// Polyfill __dirname and require for ESM
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const _require = createRequire(import.meta.url);

/**
 * Generates static HTML files and a \`sitemap.xml\` for all documentation routes.
 * Called automatically in the \`closeBundle\` hook of the Vite plugin during a production build.
 *
 * @param options - Configuration for paths and site metadata
 */
export async function generateStaticPages(options: SSGOptions): Promise<void> {
  const { docsDir, outDir, config } = options;
  const routes = await generateRoutes(docsDir, config);
  const siteTitle = config?.themeConfig?.title || "Litedocs";
  const siteDescription = config?.themeConfig?.description || "";

  // Resolve the SSR module (compiled by tsup)
  const ssrModulePath = path.resolve(_dirname, "../../client/ssr.js");
  if (!fs.existsSync(ssrModulePath)) {
    console.error(
      "[litedocs] SSR module not found at",
      ssrModulePath,
      "- Did you build the core package?",
    );
    return;
  }
  const { render } = _require(ssrModulePath);

  // Read the built index.html as template
  const templatePath = path.join(outDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.warn("[litedocs] No index.html found in outDir, skipping SSG.");
    return;
  }
  const template = fs.readFileSync(templatePath, "utf-8");

  // Load user's homePage if configured
  let homePageComp;
  if ((config as any)?._homePagePath) {
    try {
      // Simplistic: if there's a custom home page compiled, we'd need it available to SSR.
      // In a full framework this is complex, but for Litedocs we assume it's bundled if needed.
    } catch (e) {}
  }

  // Generate an HTML file for each route concurrently
  await Promise.all(
    routes.map(async (route) => {
      const pageTitle = `${route.title} | ${siteTitle}`;
      const pageDescription = route.description || siteDescription;

      // We mock the modules for SSR so it doesn't crash trying to dynamically import
      const fakeModules: Record<string, any> = {};
      fakeModules[route.componentPath] = { default: () => {} }; // Mock MDX component

      try {
        const appHtml = await render({
          path: route.path,
          routes: routes,
          config: config || {},
          modules: fakeModules,
          homePage: homePageComp,
        });

        const html = replaceMetaTags(template, {
          title: escapeHtml(pageTitle),
          description: escapeHtml(pageDescription),
        })
          .replace("<!--app-html-->", appHtml)
          .replace(`<div id="root"></div>`, `<div id="root">${appHtml}</div>`);

        const routeDir = path.join(outDir, route.path);
        await fs.promises.mkdir(routeDir, { recursive: true });
        await fs.promises.writeFile(
          path.join(routeDir, "index.html"),
          html,
          "utf-8",
        );
      } catch (e) {
        console.error(`[litedocs] Error SSR rendering route ${route.path}:`, e);
      }
    }),
  );

  // Generate sitemap.xml
  const sitemap = generateSitemap(
    routes.map((r) => r.path),
    config,
  );
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap, "utf-8");

  console.log(
    `[litedocs] Generated ${routes.length} static pages + sitemap.xml`,
  );
}
