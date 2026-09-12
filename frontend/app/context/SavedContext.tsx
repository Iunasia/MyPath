"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  fetchSavedItems,
  saveItem as saveItemRequest,
  unsaveItem as unsaveItemRequest,
  type SavedItemType,
} from "@/app/lib/api";

export type { SavedItemType };

export interface SavedItem {
  /** Display id — a numeric id, or a slug for universities. Used in links. */
  id: string;
  /** Numeric primary key, required to talk to the API. Falls back to `id`. */
  apiId?: number;
  type: SavedItemType;
  title: string;
  subtitle?: string; // Provider, faculty, or career category
  image?: string;
  badge?: string; // e.g. "Full Tuition", "High Demand"
  deadline?: string; // For scholarships
  link: string; // Detail page URL
  savedAt: number; // Timestamp
}

interface SavedContextType {
  savedItems: SavedItem[];
  savedCount: number;
  isHydrated: boolean;
  isSaved: (id: string) => boolean;
  saveItem: (item: Omit<SavedItem, "savedAt">) => void;
  unsaveItem: (id: string) => void;
  toggleSave: (item: Omit<SavedItem, "savedAt">) => boolean;
  clearAll: () => void;
  lastSavedTitle: string | null;
  showToast: boolean;
  dismissToast: () => void;
}

const STORAGE_KEY = "domner_saved_items_v1";

const SavedContext = createContext<SavedContextType | undefined>(undefined);

/** The API only knows numeric ids; universities are keyed by slug in the UI. */
const apiIdOf = (item: SavedItem): number | null => {
  if (typeof item.apiId === "number") return item.apiId;
  const numeric = Number(item.id);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
};

const readLocal = (): SavedItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocal = (items: SavedItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to persist saved items:", err);
  }
};

export function SavedProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSavedTitle, setLastSavedTitle] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const signedIn = Boolean(user);
  // Guards the one-time upload of anonymous saves after signing in.
  const mergedForUser = useRef<number | null>(null);

  /**
   * Anonymous visitors keep their list in localStorage; signed-in students keep
   * it on the server so it follows them between devices. On sign-in, anything
   * saved anonymously is pushed up once and then the local copy is cleared.
   */
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    const hydrate = async () => {
      if (!signedIn) {
        mergedForUser.current = null;
        if (!cancelled) {
          setSavedItems(readLocal());
          setIsInitialized(true);
        }
        return;
      }

      try {
        const pending = mergedForUser.current === user!.id ? [] : readLocal();

        for (const item of pending) {
          const id = apiIdOf(item);
          if (id !== null) await saveItemRequest(item.type, id).catch(() => {});
        }
        if (pending.length > 0) writeLocal([]);
        mergedForUser.current = user!.id;

        const rows = await fetchSavedItems();
        if (cancelled) return;

        setSavedItems(
          rows.map((row) => ({
            id: String(row.item_id),
            apiId: row.item_id,
            type: row.item_type,
            title: row.title,
            subtitle: row.subtitle ?? undefined,
            image: row.image ?? undefined,
            link: `/${row.item_type === "university" ? "universities" : `${row.item_type}s`}/${row.item_id}`,
            savedAt: new Date(row.saved_at).getTime(),
          }))
        );
      } catch (err) {
        // Offline or API down — fall back to whatever is on this device.
        console.warn("Could not load saved items from the server:", err);
        if (!cancelled) setSavedItems(readLocal());
      } finally {
        if (!cancelled) setIsInitialized(true);
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [authLoading, signedIn, user]);

  // Anonymous saves persist locally. Signed-in saves live on the server, so
  // writing them here too would resurrect them after signing out.
  useEffect(() => {
    if (!isInitialized || signedIn) return;
    writeLocal(savedItems);
  }, [savedItems, isInitialized, signedIn]);

  const isSaved = useCallback(
    (id: string) => savedItems.some((item) => item.id === id),
    [savedItems]
  );

  const dismissToast = useCallback(() => setShowToast(false), []);

  const saveItem = useCallback(
    (item: Omit<SavedItem, "savedAt">) => {
      setSavedItems((prev) =>
        prev.some((i) => i.id === item.id) ? prev : [{ ...item, savedAt: Date.now() }, ...prev]
      );
      setLastSavedTitle(item.title);
      setShowToast(true);

      if (signedIn) {
        const id = apiIdOf({ ...item, savedAt: 0 });
        if (id !== null) void saveItemRequest(item.type, id).catch(() => {});
      }
    },
    [signedIn]
  );

  const unsaveItem = useCallback(
    (id: string) => {
      const existing = savedItems.find((item) => item.id === id);
      setSavedItems((prev) => prev.filter((item) => item.id !== id));

      if (signedIn && existing) {
        const apiId = apiIdOf(existing);
        if (apiId !== null) void unsaveItemRequest(existing.type, apiId).catch(() => {});
      }
    },
    [savedItems, signedIn]
  );

  const toggleSave = useCallback(
    (item: Omit<SavedItem, "savedAt">): boolean => {
      const wasSaved = savedItems.some((i) => i.id === item.id);
      if (wasSaved) unsaveItem(item.id);
      else saveItem(item);
      return !wasSaved;
    },
    [savedItems, saveItem, unsaveItem]
  );

  const clearAll = useCallback(() => {
    const previous = savedItems;
    setSavedItems([]);

    if (signedIn) {
      for (const item of previous) {
        const id = apiIdOf(item);
        if (id !== null) void unsaveItemRequest(item.type, id).catch(() => {});
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn("Failed to clear saved items:", err);
      }
    }
  }, [savedItems, signedIn]);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <SavedContext.Provider
      value={{
        savedItems,
        savedCount: savedItems.length,
        isHydrated: isInitialized,
        isSaved,
        saveItem,
        unsaveItem,
        toggleSave,
        clearAll,
        lastSavedTitle,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

const defaultSavedContext: SavedContextType = {
  savedItems: [],
  savedCount: 0,
  isHydrated: false,
  isSaved: () => false,
  saveItem: () => {},
  unsaveItem: () => {},
  toggleSave: () => false,
  clearAll: () => {},
  lastSavedTitle: null,
  showToast: false,
  dismissToast: () => {},
};

export function useSaved() {
  return useContext(SavedContext) ?? defaultSavedContext;
}
