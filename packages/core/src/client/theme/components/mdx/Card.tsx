import React from "react";
import "./Card.css";

/* ─── Cards (grid container) ─────────────────────────────── */
export interface CardsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns (defaults to 3) */
  cols?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}

/**
 * Grid wrapper for `<Card>` components.
 *
 * ```mdx
 * <Cards cols={3}>
 *   <Card title="Fast" icon="⚡">Instant HMR.</Card>
 *   <Card title="Simple" icon="📁">File-system routing.</Card>
 * </Cards>
 * ```
 */
export function Cards({
  cols = 3,
  children,
  className = "",
  ...rest
}: CardsProps) {
  return (
    <div className={`ld-cards ld-cards--${cols} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

/* ─── Card ─────────────────────────────────────────────────── */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card heading */
  title?: string;
  /** Emoji or icon string displayed above the title */
  icon?: React.ReactNode;
  /** If provided, the entire card becomes a link */
  href?: string;
  children?: React.ReactNode;
}

/**
 * Individual feature/info card.
 */
export function Card({
  title,
  icon,
  href,
  children,
  className = "",
  ...rest
}: CardProps) {
  const inner = (
    <>
      <div className="ld-card__glow" />
      {icon && (
        <div className="ld-card__icon-wrapper">
          <span className="ld-card__icon">{icon}</span>
        </div>
      )}
      <div className="ld-card__content">
        {title && <h3 className="ld-card__title">{title}</h3>}
        {children && <div className="ld-card__body">{children}</div>}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`ld-card ld-card--link ${className}`.trim()}
        {...(rest as any)}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={`ld-card ${className}`.trim()} {...rest}>
      {inner}
    </div>
  );
}
