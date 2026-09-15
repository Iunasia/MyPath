"use client";

interface FilterPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
  count?: number;
  title?: string;
}

export function FilterPill({ label, selected, onClick, className = "", count, title }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      title={title}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors duration-200 cursor-pointer ${
        selected
          ? "bg-sky-deep text-white bubble-shadow-sm"
          : "bg-panel text-blue-ink border border-sky/25 hover:border-sky"
      } ${className}`}
    >
      {label}
      {typeof count === "number" ? (
        <span
          className={`inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-extrabold leading-none ${
            selected ? "bg-white/20 text-white" : "bg-sitomo text-sky-deep"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}