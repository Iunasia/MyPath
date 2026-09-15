interface WaveDividerProps {
  /**
   * Which theme-aware canvas tone the wave is drawn with.
   * `powder` → draws a powder-canvas wave (fills the section that follows);
   * `panel` → draws a card-surface wave (transitions into a panel section).
   * Pass `fill` to use a fixed CSS color instead.
   */
  tone?: "powder" | "panel";
  fill?: string;
  direction?: "top" | "bottom";
  className?: string;
}

/**
 * Decorative SVG wave used to transition between colored sections.
 * `direction="top"` → the wave bumps downward (fills the section above);
 * `direction="bottom"` → the wave bumps upward (fills the section below).
 *
 * The fill follows CSS variables so dark mode maps to the right canvas tone
 * automatically. The transparent half shows the neighboring section through,
 * so the divider sits cleanly between two sections without extra painting.
 */
export function WaveDivider({ tone = "powder", fill, direction = "top", className = "" }: WaveDividerProps) {
  const path =
    direction === "top"
      ? "M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30V0H0V30Z"
      : "M0 30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0V30Z";

  const fillValue = fill ?? `var(--${tone})`;

  return (
    <div className={`w-full leading-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block" preserveAspectRatio="none">
        <path d={path} fill={fillValue} />
      </svg>
    </div>
  );
}