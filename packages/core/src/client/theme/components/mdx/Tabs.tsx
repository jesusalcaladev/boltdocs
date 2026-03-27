import React, { Children, isValidElement, useMemo } from "react";
import { useTabs } from "../../hooks/useTabs";
import "./Tabs.css";
import { CodeBlock } from "../CodeBlock";

/* ─── Tab (individual panel) ──────────────────────────────── */
export interface TabProps {
  /** The label shown in the tab bar */
  label: string;
  /** Optional icon to show next to the label */
  icon?: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
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

/**
 * Tab container that manages active state.
 *
 * ```mdx
 * <Tabs>
 *   <Tab label="npm">npm install boltdocs</Tab>
 *   <Tab label="pnpm">pnpm add boltdocs</Tab>
 * </Tabs>
 * ```
 */
export function Tabs({ defaultIndex = 0, children }: TabsProps) {
  // Extract Tab children
  const tabs = useMemo(() => {
    return Children.toArray(children).filter(
      (child) => isValidElement(child) && (child as any).props?.label,
    ) as React.ReactElement<TabProps>[];
  }, [children]);

  const { active, setActive, tabRefs, indicatorStyle, handleKeyDown } = useTabs({
    initialIndex: defaultIndex,
    tabs,
  });

  return (
    <div className="ld-tabs">
      <div className="ld-tabs__bar" role="tablist" onKeyDown={handleKeyDown}>
        {tabs.map((child, i) => {
          const { label, icon, disabled } = child.props;
          const isActive = i === active;
          return (
            <button
              key={i}
              role="tab"
              aria-selected={isActive}
              aria-disabled={disabled}
              aria-controls={`tabpanel-${i}`}
              id={`tab-${i}`}
              tabIndex={isActive ? 0 : -1}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              className={`ld-tabs__trigger ${
                isActive ? "ld-tabs__trigger--active" : ""
              } ${disabled ? "ld-tabs__trigger--disabled" : ""}`}
              onClick={() => !disabled && setActive(i)}
            >
              {icon && <span className="ld-tabs__icon">{icon}</span>}
              <span>{label}</span>
            </button>
          );
        })}
        {/* Sliding Indicator */}
        <div className="ld-tabs__indicator" style={indicatorStyle} />
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
