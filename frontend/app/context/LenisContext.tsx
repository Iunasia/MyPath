"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export function LenisProvider({
  children,
  lenis,
}: {
  children: ReactNode;
  lenis: Lenis | null;
}) {
  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
