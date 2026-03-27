import React, { Children } from "react";
import { Check, ChevronRight } from "lucide-react";
import "./List.css";

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Visual variant */
  variant?: "checked" | "arrow" | "default";
  children: React.ReactNode;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  checked: <Check size={14} className="ld-list__icon" />,
  arrow: <ChevronRight size={14} className="ld-list__icon" />,
};

/**
 * Enhanced list component with icon variants.
 *
 * ```mdx
 * <List variant="checked">
 *   <li>File-system routing</li>
 *   <li>MDX support</li>
 *   <li>Syntax highlighting</li>
 * </List>
 * ```
 */
export function List({
  variant = "default",
  children,
  className = "",
  ...rest
}: ListProps) {
  if (variant === "default") {
    return (
      <ul className={`ld-list ${className}`.trim()} {...rest}>
        {children}
      </ul>
    );
  }

  const icon = ICON_MAP[variant];

  return (
    <ul className={`ld-list ld-list--${variant} ${className}`.trim()} {...rest}>
      {Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return (
          <li className="ld-list__item">
            {icon}
            <span className="ld-list__text">
              {(child as React.ReactElement<any>).props.children}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
