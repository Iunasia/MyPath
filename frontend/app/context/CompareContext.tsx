"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CompareType } from "@/app/lib/api";

export type { CompareType };

/** The API compares 2–4 items of one type. */
export const MAX_COMPARE = 4;
export const MIN_COMPARE = 2;

export interface CompareItem {
  type: CompareType;
  /** Numeric API id — what /compare takes. */
  apiId: number;
  title: string;
  subtitle?: string;
}

/**
 * What a toggle did, so the tray can explain it: "full" when a fifth item was
 * refused, "restarted" when a different kind of item started a new comparison.
 */
export type CompareResult = "added" | "removed" | "full" | "restarted";

interface CompareContextType {
  type: CompareType | null;
  items: CompareItem[];
  isHydrated: boolean;
  has: (type: CompareType, apiId: number) => boolean;
  toggle: (item: CompareItem) => CompareResult;
  remove: (type: CompareType, apiId: number) => void;
  /** Replace the whole selection — used when a comparison is opened from a link. */
  replace: (items: CompareItem[]) => void;
  clear: () => void;
  notice: CompareResult | null;
  /** Where the Compare button goes; null until there are enough items. */
  compareHref: string | null;
}

const STORAGE_KEY = "domner_compare_v1";

const readLocal = (): CompareItem[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
};

const writeLocal = (items: CompareItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode or storage full — the tray still works for this visit.
  }
};

export const compareHrefFor = (type: CompareType, ids: number[]): string =>
  `/compare?type=${type}&ids=${ids.join(",")}`;

const CompareContext = createContext<CompareContextType | undefined>(undefined);

/**
 * The "compare tray": which items a student has picked to compare. Kept on the
 * device only — it's a short-lived selection, not something worth an account.
 */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [notice, setNotice] = useState<CompareResult | null>(null);

  useEffect(() => {
    // Wrapped so the state updates don't run synchronously inside the effect.
    void (async () => {
      setItems(readLocal());
      setIsHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (isHydrated) writeLocal(items);
  }, [items, isHydrated]);

  const type = items[0]?.type ?? null;

  const has = useCallback(
    (itemType: CompareType, apiId: number) =>
      items.some((i) => i.type === itemType && i.apiId === apiId),
    [items]
  );

  const toggle = useCallback(
    (item: CompareItem): CompareResult => {
      let result: CompareResult;

      if (items.some((i) => i.type === item.type && i.apiId === item.apiId)) {
        setItems(items.filter((i) => !(i.type === item.type && i.apiId === item.apiId)));
        result = "removed";
      } else if (items.length > 0 && items[0].type !== item.type) {
        // Only one kind at a time — a university and a scholarship share no rows.
        setItems([item]);
        result = "restarted";
      } else if (items.length >= MAX_COMPARE) {
        result = "full";
      } else {
        setItems([...items, item]);
        result = "added";
      }

      setNotice(result);
      return result;
    },
    [items]
  );

  const remove = useCallback((itemType: CompareType, apiId: number) => {
    setItems((prev) => prev.filter((i) => !(i.type === itemType && i.apiId === apiId)));
    setNotice("removed");
  }, []);

  const replace = useCallback((next: CompareItem[]) => {
    setItems(next.slice(0, MAX_COMPARE));
    setNotice(null);
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setNotice(null);
  }, []);

  const compareHref =
    type && items.length >= MIN_COMPARE ? compareHrefFor(type, items.map((i) => i.apiId)) : null;

  return (
    <CompareContext.Provider
      value={{ type, items, isHydrated, has, toggle, remove, replace, clear, notice, compareHref }}
    >
      {children}
    </CompareContext.Provider>
  );
}

const fallback: CompareContextType = {
  type: null,
  items: [],
  isHydrated: false,
  has: () => false,
  toggle: () => "added",
  remove: () => {},
  replace: () => {},
  clear: () => {},
  notice: null,
  compareHref: null,
};

export function useCompare() {
  return useContext(CompareContext) ?? fallback;
}
