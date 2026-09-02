"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Direction = "up" | "left" | "right";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const dirClass =
      direction === "left"
        ? "sr-hidden-left"
        : direction === "right"
          ? "sr-hidden-right"
          : "sr-hidden";

    el.classList.add(dirClass);

    if (delay > 0) {
      el.classList.add(`sr-delay-${delay}`);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("sr-hidden", "sr-hidden-left", "sr-hidden-right");
          el.classList.add("sr-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [delay, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
