import path from "path";
import fs from "node:fs";
import { DEFAULT_CSS_VARIABLES } from "../constants";

export function generateCssAction(outputPath?: string) {
  try {
    const target = process.cwd();
    const filename = outputPath || "custom.css";
    const filepath = path.resolve(target, filename);

    if (fs.existsSync(filepath)) {
      process.stderr.write(
        "Error: File " + filename + " already exists in " + target + ".\n",
      );
      process.exit(1);
    }

    fs.writeFileSync(filepath, DEFAULT_CSS_VARIABLES);
    process.stdout.write("Success! Generated " + filename + "\n");
  } catch (e) {
    process.stderr.write("Failed to generate CSS: " + e + "\n");
    process.exit(1);
  }
}
