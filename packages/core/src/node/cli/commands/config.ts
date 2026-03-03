import path from "path";
import { resolveConfig } from "../../config";

export async function configAction(root?: string) {
  const rootDir = root ? path.resolve(root) : process.cwd();
  const docsDir = path.resolve(rootDir, "docs");

  try {
    const config = await resolveConfig(docsDir);
    process.stdout.write(JSON.stringify(config, null, 2) + "\n");
  } catch (e) {
    process.stderr.write("Failed to resolve configuration: " + e + "\n");
    process.exit(1);
  }
}
