import React, { useState, Children, isValidElement, useRef } from "react";
import { CodeBlock } from "../CodeBlock";
import { NPM } from "../../icons/npm";
import { Pnpm } from "../../icons/pnpm";
import { Bun } from "../../icons/bun";
import { Deno } from "../../icons/deno";
import { Yarn } from "../../icons/yarn";

/* ─── Tab (individual panel) ──────────────────────────────── */
export interface TabProps {
  /** The label shown in the tab bar */
  label: string;
  children: React.ReactNode;
}

/**
 * A single tab panel. Must be used inside `<Tabs>`.
 *
 * ```mdx
 * <Tab label="npm">npm install boltdocs</Tab>
 * ```
 */
export function Tab({ children }: TabProps) {
  // If children is a simple string, wrap it in a CodeBlock for syntax highlighting
  const content =
    typeof children === "string" ? (
      <CodeBlock className="language-bash">
        <code>{children.trim()}</code>
      </CodeBlock>
    ) : (
      children
    );

  return <div className="ld-tab-panel">{content}</div>;
}

/* ─── Tabs (container) ────────────────────────────────────── */
export interface TabsProps {
  /** Which tab index is initially active (0-based, default 0) */
  defaultIndex?: number;
  children: React.ReactNode;
}

const getIconForLabel = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("npm")) return <NPM />;
  if (l.includes("pnpm")) return <Pnpm />;
  if (l.includes("yarn")) return <Yarn />;
  if (l.includes("bun")) return <Bun />;
  if (l.includes("deno")) return <Deno />;
  return null;
};

/**
 * Tab container that manages active state.
 *
 * ```mdx
 * <Tabs>
 *   <Tab label="npm">npm install boltdocs</Tab>
 *   <Tab label="pnpm">pnpm add boltdocs</Tab>
 *   <Tab label="yarn">yarn add boltdocs</Tab>
 * </Tabs>
 * ```
 */
export function Tabs({ defaultIndex = 0, children }: TabsProps) {
  const [active, setActive] = useState(defaultIndex);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Extract Tab children
  const tabs = Children.toArray(children).filter(
    (child) => isValidElement(child) && (child as any).props?.label,
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newIndex = active;
    if (e.key === "ArrowRight") {
      newIndex = (active + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      newIndex = (active - 1 + tabs.length) % tabs.length;
    }

    if (newIndex !== active) {
      setActive(newIndex);
      tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div className="ld-tabs">
      <div className="ld-tabs__bar" role="tablist" onKeyDown={handleKeyDown}>
        {tabs.map((child, i) => {
          const label = (child as React.ReactElement<TabProps>).props.label;
          const Icon = getIconForLabel(label);
          return (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-controls={`tabpanel-${i}`}
              id={`tab-${i}`}
              tabIndex={i === active ? 0 : -1}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              className={`ld-tabs__trigger ${
                i === active ? "ld-tabs__trigger--active" : ""
              }`}
              onClick={() => setActive(i)}
            >
              {Icon}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <div
        className="ld-tabs__content"
        role="tabpanel"
        id={`tabpanel-${active}`}
        aria-labelledby={`tab-${active}`}
      >
        {tabs[active]}
      </div>
    </div>
  );
}
