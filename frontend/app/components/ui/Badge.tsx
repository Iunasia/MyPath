import type { LucideIcon } from "lucide-react";

export type BadgeTone = "teal" | "cream" | "green" | "red" | "slate" | "outline";

const TONES: Record<BadgeTone, string> = {
  teal: "bg-sitomo text-sky-deep border-sky/20",
  cream: "bg-momo text-blue-ink border-momo",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-rose-50 text-rose-700 border-rose-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  outline: "bg-transparent text-blue-ink border-sky/25",
};

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  icon?: LucideIcon;
  className?: string;
}

export function Badge({ children, tone = "teal", icon: Icon, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {Icon ? <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}