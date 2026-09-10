import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  label: string;
  className?: string;
}

/**
 * "← All scholarships" above a page's title. Lives in the page rather than the
 * header, so the header is the same everywhere.
 */
export default function BackLink({ href, label, className = "" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 text-sm font-bold text-sky-deep hover:text-blue-ink transition-colors ${className}`}
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-sky/25 group-hover:border-sky-deep transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.4} aria-hidden="true" />
      </span>
      {label}
    </Link>
  );
}
