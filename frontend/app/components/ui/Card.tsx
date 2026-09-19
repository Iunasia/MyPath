import { Link } from "@/src/i18n";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  interactive?: boolean;
  ariaLabel?: string;
  /** Header title, e.g. for admin-style data cards. Omit for a plain surface. */
  title?: string;
  meta?: string;
  /** Draws a 1px accent bar across the top — reserve for the one card that matters most. */
  accent?: boolean;
  /** Divides direct children with hairline rules instead of nesting sub-cards. */
  divide?: boolean;
}

/**
 * Base flat surface used across listing, detail, and admin pages. Give it
 * `interactive` and optionally `href` for a hairline-border hover shift —
 * no shadow, no lift, no scale.
 */
export function Card({
  children,
  className = "",
  href,
  interactive = false,
  ariaLabel,
  title,
  meta,
  accent = false,
  divide = false,
}: CardProps) {
  const cls = `rounded-lg border border-sky/15 bg-panel overflow-hidden ${
    interactive ? "transition-colors duration-150 ease-out hover:border-sky cursor-pointer" : ""
  } ${divide ? "divide-y divide-sky/15" : ""} ${className}`.trim();

  const content = (
    <>
      {accent && <div className="h-1 bg-sky-deep" aria-hidden="true" />}
      {title && (
        <header className="flex items-baseline justify-between gap-3 px-4 py-3 border-b border-sky/15">
          <h2 className="font-display text-sm font-extrabold text-blue-ink">{title}</h2>
          {meta && <span className="text-[11px] text-gray-soft">{meta}</span>}
        </header>
      )}
      {children}
    </>
  );

  if (href) {
    if (href.startsWith("#") || href.startsWith("http")) {
      return (
        <a href={href} aria-label={ariaLabel} className={`${cls} block`}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} aria-label={ariaLabel} className={`${cls} block`}>
        {content}
      </Link>
    );
  }
  return <div className={cls}>{content}</div>;
}
