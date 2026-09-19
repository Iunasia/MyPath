import { Link } from "@/src/i18n";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-[#7AB3B7] text-white hover:bg-[#68A1A5] active:bg-[#5C9195] border border-transparent",
  secondary:
    "bg-panel text-blue-ink border border-sky/30 hover:border-sky hover:bg-sitomo active:bg-sitomo",
  outline: "border border-[#7AB3B7] text-[#7AB3B7] hover:bg-[#7AB3B7] hover:text-white active:bg-[#68A1A5] bg-transparent",
  ghost: "text-sky-deep hover:bg-sitomo active:bg-sitomo bg-transparent",
  danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-transparent",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "text-xs px-3.5 py-1.5 gap-1.5",
  sm: "text-xs px-4 py-2 gap-1.5",
  md: "text-sm px-5 py-2.5 gap-2",
  lg: "text-sm px-7 py-3.5 gap-2",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButton extends CommonProps {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

interface ButtonAsLink extends CommonProps {
  href: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  ariaLabel?: string;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const base = (variant: ButtonVariant, size: ButtonSize, fullWidth?: boolean) =>
  `inline-flex items-center justify-center rounded-md font-bold cursor-pointer select-none transition-colors duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${
    fullWidth ? "w-full" : ""
  }`;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", loading, fullWidth, className = "", children, ...rest },
    ref
  ) {
    const cls = `${base(variant, size, fullWidth)} ${className}`.trim();

    if ("href" in rest && rest.href) {
      const { href, target, rel, onClick, ariaLabel } = rest;
      if (href.startsWith("#") || href.startsWith("http")) {
        return (
          <a href={href} target={target} rel={rel} onClick={onClick} aria-label={ariaLabel} className={cls} ref={ref as React.Ref<HTMLAnchorElement>}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
            {children}
          </a>
        );
      }
      return (
        <Link href={href} target={target} rel={rel} onClick={onClick} aria-label={ariaLabel} className={cls} ref={ref as React.Ref<HTMLAnchorElement>}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
          {children}
        </Link>
      );
    }

    const { type = "button", onClick, disabled } = rest as ButtonAsButton;
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={cls}
        ref={ref as React.Ref<HTMLButtonElement>}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
        {children}
      </button>
    );
  }
);