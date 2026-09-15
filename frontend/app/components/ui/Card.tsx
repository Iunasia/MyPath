import { Link } from "@/src/i18n";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  interactive?: boolean;
  ariaLabel?: string;
}

/**
 * Base surface used across listing + detail pages. Give it `interactive`
 * and optionally `href` to get the standard hover lift and focus ring.
 */
export function Card({ children, className = "", href, interactive = false, ariaLabel }: CardProps) {
  const cls = `rounded-2xl border border-sky/15 bg-panel bubble-shadow-sm ${
    interactive
      ? "cursor-pointer transition-shadow duration-200 hover:shadow-xl hover:shadow-slate-300/60 dark:hover:shadow-black/40"
      : ""
  } ${className}`.trim();

  if (href) {
    if (href.startsWith("#") || href.startsWith("http")) {
      return (
        <a href={href} aria-label={ariaLabel} className={`${cls} block`}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} aria-label={ariaLabel} className={`${cls} block`}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}