import { getParameters } from "codesandbox/lib/api/define";
import { SandboxOptions } from "../types";

/**
 * Build the files payload for the CodeSandbox Define API.
 * Ensures every file conforms to the `{ content, isBinary }` shape
 * required by the SDK, and auto-generates a `package.json` when one
 * isn't explicitly provided.
 */
function buildSandboxFiles(options: SandboxOptions) {
  const files = options.files || {};
  const dependencies = options.dependencies || {};
  const devDependencies = options.devDependencies || {};
  const title = options.title || "codesandbox-project";
  const description = options.description || "Generic Sandbox";

  const finalFiles: Record<string, { content: string; isBinary: boolean }> = {};

  for (const [path, file] of Object.entries(files)) {
    const content =
      typeof file.content === "object"
        ? JSON.stringify(file.content, null, 2)
        : file.content;
    finalFiles[path] = { content, isBinary: file.isBinary ?? false };
  }

  if (!finalFiles["package.json"]) {
    finalFiles["package.json"] = {
      content: JSON.stringify(
        {
          name: title,
          description,
          version: "1.0.0",
          dependencies,
          devDependencies,
        },
        null,
        2,
      ),
      isBinary: false,
    };
  }

  return finalFiles;
}

/**
 * Helper to define a sandbox and get a URL for the CodeSandbox Define API.
 * Uses the official SDK `getParameters` for proper LZ-string compression.
 */
export function defineSandbox(options: SandboxOptions) {
  const finalFiles = buildSandboxFiles(options);
  const parameters = getParameters({ files: finalFiles });

  return {
    parameters,
    url: `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`,
  };
}

/**
 * CORE API: Open a CodeSandbox using a form POST to the Define API.
 *
 * Uses a hidden form + POST which avoids URL length limits and is the
 * recommended approach from CodeSandbox documentation. The SDK's
 * `getParameters` handles LZ-string compression internally.
 */
export function openSandbox(options: SandboxOptions) {
  if (typeof window === "undefined") return;

  const finalFiles = buildSandboxFiles(options);
  const parameters = getParameters({ files: finalFiles });
  const entry = options.entry || "src/App.tsx";

  // Use form POST – the most reliable method for the Define API
  const form = document.createElement("form");
  form.method = "POST";
  form.target = "_blank";
  form.action = "https://codesandbox.io/api/v1/sandboxes/define";
  form.style.display = "none";

  const addField = (name: string, value: string) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addField("parameters", parameters);
  addField("query", `file=/${entry}`);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

/**
 * Generate an embeddable iframe URL for a CodeSandbox.
 *
 * This gives you more control than `openSandbox` — you can embed the sandbox
 * inline on the page rather than opening a new tab. The returned URL can be
 * used as the `src` of an `<iframe>`.
 *
 * @example
 * ```tsx
 * const url = embedSandbox({
 *   files: { "index.js": { content: "console.log('hello')" } },
 *   embed: { view: "editor", theme: "dark" },
 * });
 * // url → "https://codesandbox.io/api/v1/sandboxes/define?parameters=…&embed=1&view=editor&theme=dark"
 * ```
 */
export function embedSandbox(options: SandboxOptions): string {
  const finalFiles = buildSandboxFiles(options);
  const parameters = getParameters({ files: finalFiles });
  const embedOptions = options.embed || {};

  const query = new URLSearchParams({ parameters, embed: "1" });

  if (embedOptions.view) query.set("view", embedOptions.view);
  if (embedOptions.theme) query.set("theme", embedOptions.theme);
  if (embedOptions.hideNavigation) query.set("hidenavigation", "1");
  if (options.entry) query.set("file", `/${options.entry}`);

  return `https://codesandbox.io/api/v1/sandboxes/define?${query.toString()}`;
}
