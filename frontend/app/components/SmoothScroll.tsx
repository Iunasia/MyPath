"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { LenisProvider } from "../context/LenisContext";

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    setLenis(lenisInstance);

    let animationFrameId: number;

    function raf(time: number) {
      lenisInstance.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          lenisInstance.scrollTo(targetElement as HTMLElement, {
            offset: -70,
            duration: 1.2,
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    // Watch for content mutations and DOM size changes
    const resizeObserver = new ResizeObserver(() => {
      lenisInstance.resize();
    });

    if (document.body) {
      resizeObserver.observe(document.body);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("click", handleAnchorClick);
      resizeObserver.disconnect();
      lenisInstance.destroy();
      setLenis(null);
    };
  }, []);

  // Reset scroll position and recalculate limit on route change
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => {
        lenis.resize();
      });
    }
  }, [pathname, lenis]);

  return <LenisProvider lenis={lenis}>{children}</LenisProvider>;
}
