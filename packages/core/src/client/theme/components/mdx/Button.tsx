import React from "react";
import "./Button.css";

export type ButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Visual variant */
    variant?:
      | "primary"
      | "secondary"
      | "outline"
      | "ghost"
      | "danger"
      | "success"
      | "warning"
      | "info"
      | "subtle"
      | "link";
    /** Size */
    size?: "sm" | "md" | "lg";
    /** If provided, renders as a link */
    href?: string;
    /** Custom color theme */
    color?: string;
    /** Border radius maturity */
    rounded?: "none" | "sm" | "md" | "lg" | "full";
    /** Optional icon element */
    icon?: React.ReactNode;
    /** Position of the icon */
    iconPosition?: "left" | "right";
    children: React.ReactNode;
  };

/**
 * A versatile button/link component for use in MDX pages and the home page.
 *
 * ```mdx
 * <Button variant="primary" href="/docs/getting-started" icon={<ArrowRight />}>Get Started</Button>
 * <Button variant="danger" icon={<Trash />} iconPosition="right">Delete</Button>
 * ```
 */
export function Button({
  variant = "primary",
  size = "md",
  rounded = "md",
  href,
  color,
  icon,
  iconPosition = "left",
  children,
  className = "",
  style,
  ...rest
}: ButtonProps) {
  const cls = `ld-btn ld-btn--${variant} ld-btn--${size} ld-btn--rounded-${rounded} ${
    color ? `ld-btn--color-${color}` : ""
  } ${className}`.trim();

  const content = (
    <>
      {icon && iconPosition === "left" && (
        <span className="ld-btn__icon ld-btn__icon--left">{icon}</span>
      )}
      <span className="ld-btn__text">{children}</span>
      {icon && iconPosition === "right" && (
        <span className="ld-btn__icon ld-btn__icon--right">{icon}</span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        style={{ textDecoration: "none", ...style }}
        className={cls}
        {...(rest as any)}
      >
        {content}
      </a>
    );
  }

  return (
    <button className={cls} style={style} {...(rest as any)}>
      {content}
    </button>
  );
}
