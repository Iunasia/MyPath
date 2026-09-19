import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`bg-panel rounded-lg p-10 text-center border border-sky/15 max-w-lg mx-auto mt-6 ${className}`}
    >
      {Icon ? (
        <Icon className="w-12 h-12 text-sky-deep mx-auto mb-3 opacity-60" aria-hidden="true" />
      ) : null}
      <p className="font-bold text-blue-ink text-base">{title}</p>
      {description ? <p className="text-xs sm:text-sm text-gray-soft mt-1.5 font-medium">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}