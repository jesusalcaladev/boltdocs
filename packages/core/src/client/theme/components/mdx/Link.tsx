import React from "react";
import { Link as RouterLink } from "react-router-dom";

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  boltdocsPreview?: boolean;
  children?: React.ReactNode;
}

/**
 * A premium Link component for Boltdocs that handles internal and external routing.
 * It also supports specialized preview capabilities via Boltdocs Preview.
 */
export function Link({
  to,
  children,
  boltdocsPreview = true,
  className = "",
  ...props
}: LinkProps) {
  const isExternal =
    to.startsWith("http://") ||
    to.startsWith("https://") ||
    to.startsWith("//");

  const combinedClassName = `ld-link ${className}`.trim();

  if (isExternal) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={combinedClassName}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink
      to={to}
      className={combinedClassName}
      data-boltdocs-preview={boltdocsPreview}
      {...props}
    >
      {children}
    </RouterLink>
  );
}
