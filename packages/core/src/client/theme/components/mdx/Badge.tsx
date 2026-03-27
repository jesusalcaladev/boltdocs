import React from "react";
import "./Badge.css";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color variant */
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}

/**
 * Inline badge / pill for labels, statuses, or tags.
 *
 * ```mdx
 * <Badge variant="success">Stable</Badge>
 * <Badge variant="warning">Beta</Badge>
 * ```
 */
export function Badge({
  variant = "default",
  children,
  className = "",
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`ld-badge ld-badge--${variant} ${className}`.trim()}
      {...rest}
    >
      {children}
    </span>
  );
}
