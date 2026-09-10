"use client";

import { useEffect } from "react";
import { useCompare, type CompareItem } from "@/app/context/CompareContext";

/**
 * A comparison opened from a link becomes the tray's selection, so "Add a
 * scholarship" leads back to the list with these already picked.
 */
export default function CompareSync({ items }: { items: CompareItem[] }) {
  const { replace, isHydrated } = useCompare();

  useEffect(() => {
    if (isHydrated) replace(items);
  }, [isHydrated, replace, items]);

  return null;
}
