import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { NPM } from "../../icons/npm";
import { Pnpm } from "../../icons/pnpm";
import { Bun } from "../../icons/bun";
import { Deno } from "../../icons/deno";
import { copyToClipboard } from "../../../utils";

interface PackageManagerTabsProps {
  command: string;
  pkg?: string;
  className?: string;
}

type PackageManager = "npm" | "pnpm" | "bun" | "deno";

const MANAGERS: {
  id: PackageManager;
  label: string;
  icon: any;
}[] = [
  { id: "npm", label: "npm", icon: NPM },
  { id: "pnpm", label: "pnpm", icon: Pnpm },
  { id: "bun", label: "bun", icon: Bun },
  { id: "deno", label: "deno", icon: Deno },
];

/**
 * Returns the exact command for a specific package manager based on the action.
 * Maps generic actions like 'install' to their specific permutations (e.g., yarn add, npm install).
 */
function getCommandForManager(
  manager: PackageManager,
  command: string,
  pkg: string,
): string {
  const isInstall =
    command === "install" || command === "add" || command === "i";
  const isCreate = command === "create" || command === "init";
  const isRun = command === "run" || command === "exec";

  // Installation commands
  if (isInstall) {
    const pkgArgs = pkg ? ` ${pkg}` : "";
    if (manager === "npm") return `npm install${pkgArgs}`;
    if (manager === "pnpm") return pkg ? `pnpm add${pkgArgs}` : `pnpm install`;
    if (manager === "bun") return pkg ? `bun add${pkgArgs}` : `bun install`;
    if (manager === "deno")
      return pkg ? `deno install npm:${pkg}` : `deno install`;
  }

  // Create/Init commands
  if (isCreate) {
    const pkgArgs = pkg ? ` ${pkg}` : "";
    if (manager === "npm") return `npm create${pkgArgs}`;
    if (manager === "pnpm") return `pnpm create${pkgArgs}`;
    if (manager === "bun") return `bun create${pkgArgs}`;
    if (manager === "deno") return `deno run -A npm:create-${pkg}`; // Approximation
  }

  // Run/Exec commands
  if (isRun) {
    const pkgArgs = pkg ? ` ${pkg}` : "";
    if (manager === "npm") return `npm run${pkgArgs}`;
    if (manager === "pnpm") return `pnpm run${pkgArgs}`;
    if (manager === "bun") return `bun run${pkgArgs}`;
    if (manager === "deno") return `deno task ${pkg}`;
  }

  // Fallback: just prefix the manager
  const pkgArgs = pkg ? ` ${pkg}` : "";
  return `${manager} ${command}${pkgArgs}`;
}

export function PackageManagerTabs({
  command,
  pkg = "",
  className = "",
}: PackageManagerTabsProps) {
  const [activeTab, setActiveTab] = useState<PackageManager>("npm");
  const [copied, setCopied] = useState(false);

  const activeCommand = getCommandForManager(activeTab, command, pkg);

  const handleCopy = useCallback(async () => {
    copyToClipboard(activeCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeCommand]);

  return (
    <div className={`pkg-tabs-wrapper ${className}`}>
      {/* Tab Headers */}
      <div className="pkg-tabs-header">
        {MANAGERS.map((mgr) => {
          const Icon = mgr.icon;
          const isActive = activeTab === mgr.id;
          return (
            <button
              key={mgr.id}
              className={`pkg-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(mgr.id)}
              aria-selected={isActive}
              role="tab"
            >
              <Icon className="pkg-tab-icon" width="16" height="16" />
              <span>{mgr.label}</span>
            </button>
          );
        })}
      </div>

      {/* Code Block Content */}
      <div className="code-block-wrapper pkg-tabs-content">
        <button
          className={`code-block-copy ${copied ? "copied" : ""}`}
          onClick={handleCopy}
          type="button"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <pre>
          <code>
            <span className="line">{activeCommand}</span>
          </code>
        </pre>
      </div>
    </div>
  );
}
