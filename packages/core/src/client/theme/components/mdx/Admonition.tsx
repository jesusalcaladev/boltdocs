import React from "react";
import {
  Info,
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  Bookmark,
  Zap,
  Flame,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  note: <Bookmark size={18} />,
  tip: <Lightbulb size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
  danger: <ShieldAlert size={18} />,
  important: <Flame size={18} />,
  caution: <Zap size={18} />,
};

const LABEL_MAP: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  info: "Info",
  warning: "Warning",
  danger: "Danger",
  important: "Important",
  caution: "Caution",
};

export interface AdmonitionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Admonition type — controls color and icon */
  type?: "note" | "tip" | "info" | "warning" | "danger" | "important" | "caution";
  /** Override the default title */
  title?: string;
  children: React.ReactNode;
}

/**
 * Callout / admonition box for notes, warnings, etc.
 *
 * ```mdx
 * <Admonition type="warning" title="Breaking Change">
 *   This API has changed in v2.
 * </Admonition>
 * ```
 */
export function Admonition({
  type = "note",
  title,
  children,
  className = "",
  ...rest
}: AdmonitionProps) {
  return (
    <div
      className={`ld-admonition ld-admonition--${type} ${className}`.trim()}
      role={type === "warning" || type === "danger" ? "alert" : "note"}
      {...rest}
    >
      <div className="ld-admonition__header">
        <span className="ld-admonition__icon">{ICON_MAP[type]}</span>
        <span className="ld-admonition__title">{title || LABEL_MAP[type]}</span>
      </div>
      <div className="ld-admonition__body">{children}</div>
    </div>
  );
}

/* ─── Convenience aliases ─────────────────────────────────── */
export const Note = (props: Omit<AdmonitionProps, "type">) => (
  <Admonition type="note" {...props} />
);
export const Tip = (props: Omit<AdmonitionProps, "type">) => (
  <Admonition type="tip" {...props} />
);
export const Warning = (props: Omit<AdmonitionProps, "type">) => (
  <Admonition type="warning" {...props} />
);
export const Danger = (props: Omit<AdmonitionProps, "type">) => (
  <Admonition type="danger" {...props} />
);
export const InfoBox = (props: Omit<AdmonitionProps, "type">) => (
  <Admonition type="info" {...props} />
);
export const Important = (props: Omit<AdmonitionProps, "type">) => (
  <Admonition type="important" {...props} />
);
export const Caution = (props: Omit<AdmonitionProps, "type">) => (
  <Admonition type="caution" {...props} />
);
