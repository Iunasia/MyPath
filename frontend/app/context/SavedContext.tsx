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
  /** Display id — a numeric id, or a slug for universities/majors/careers. Used in links. */
  id: string;
  /** Numeric primary key, required to talk to the API. Falls back to `id`. */
  apiId?: number;
  /** Slug identifier if available. */
  slug?: string;
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
  isServerSynced: boolean;
  isSaved: (id: string) => boolean;
  saveItem: (item: Omit<SavedItem, "savedAt">) => void;
  unsaveItem: (id: string) => void;
  toggleSave: (item: Omit<SavedItem, "savedAt">) => boolean;
  clearAll: () => void;
  lastSavedTitle: string | null;
  showToast: boolean;
  dismissToast: () => void;
}

const getStorageKey = (userId?: number | null) => {
  return userId ? `domner_saved_items_user_${userId}` : "domner_saved_items_guest";
};

const SavedContext = createContext<SavedContextType | undefined>(undefined);

/** The API accepts either a numeric id or a slug (for universities/majors/careers). */
const apiIdOf = (item: { apiId?: number; id: string; slug?: string }): number | string => {
  if (typeof item.apiId === "number" && item.apiId > 0) return item.apiId;
  if (item.slug && item.slug.trim()) return item.slug.trim();
  return item.id;
};

const matchesItem = (item: SavedItem, targetId: string): boolean => {
  if (!targetId) return false;
  const tid = targetId.toLowerCase().trim();
  return (
    item.id.toLowerCase().trim() === tid ||
    (item.slug !== undefined && item.slug.toLowerCase().trim() === tid) ||
    (item.apiId !== undefined && String(item.apiId) === tid)
  );
};

const readLocal = (userId?: number | null): SavedItem[] => {
  if (typeof window === "undefined") return [];
  try {
    // 1. Check user-specific storage first if userId is provided
    if (userId) {
      const userStored = localStorage.getItem(getStorageKey(userId));
      if (userStored) {
        const parsed = JSON.parse(userStored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }

    // 2. Check unified fast cache
    const fastCache = localStorage.getItem("domner_saved_items_cache");
    if (fastCache) {
      const parsed = JSON.parse(fastCache);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // 3. Check guest storage
    const guestStored = localStorage.getItem("domner_saved_items_guest");
    if (guestStored) {
      const parsed = JSON.parse(guestStored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // 4. Fallback for legacy key
    const legacy = localStorage.getItem("domner_saved_items_v1");
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    return [];
  } catch {
    return [];
  }
};

const writeLocal = (items: SavedItem[], userId?: number | null): void => {
  if (typeof window === "undefined") return;
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(items));
    // Always persist to unified fast cache for instant retrieval on refresh
    localStorage.setItem("domner_saved_items_cache", JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to persist saved items:", err);
  }
};

export function SavedProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  // Consistent empty initial state on SSR & initial client render to avoid hydration mismatch
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isServerSynced, setIsServerSynced] = useState(false);
  const [lastSavedTitle, setLastSavedTitle] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const mergedForUser = useRef<number | null>(null);

  // 1. Initial client-side local hydration to display items instantly on mount without hydration error
  useEffect(() => {
    let initialUserId: number | null = user?.id ?? null;
    if (!initialUserId && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("domner_user");
        const u = cached ? JSON.parse(cached) : null;
        if (u?.id) initialUserId = Number(u.id);
      } catch {}
    }

    const local = readLocal(initialUserId);
    if (local.length > 0) {
      setSavedItems(local);
    }
    setIsInitialized(true);
  }, []);

  /**
   * Syncs saves: hydrates from user's local cache, merges with server,
   * and pushes any offline/guest saves.
   */
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    const hydrate = async () => {
      let activeUserId = user?.id ?? null;
      if (!activeUserId && typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("domner_user");
          const u = cached ? JSON.parse(cached) : null;
          if (u?.id) activeUserId = Number(u.id);
        } catch {}
      }

      if (!activeUserId) {
        mergedForUser.current = null;
        if (!cancelled) {
          const guestItems = readLocal(null);
          setSavedItems((prev) => (prev.length > 0 ? prev : guestItems));
          setIsInitialized(true);
          setIsServerSynced(true);
        }
        return;
      }

      // Immediately hydrate from this user's local cache
      const localSaves = readLocal(activeUserId);
      if (!cancelled && localSaves.length > 0) {
        setSavedItems((prev) => (prev.length > 0 ? prev : localSaves));
      }

      try {
        // Upload any guest saves after signing in
        const guestPending = mergedForUser.current === activeUserId ? [] : readLocal(null);
        if (guestPending.length > 0) {
          for (const item of guestPending) {
            const id = apiIdOf(item);
            if (id) await saveItemRequest(item.type, id).catch(() => {});
          }
          try {
            localStorage.removeItem("domner_saved_items_guest");
          } catch {}
        }
        mergedForUser.current = activeUserId;

        const rows = await fetchSavedItems();
        if (cancelled) return;

        const serverItems: SavedItem[] = rows.map((row) => {
          const displayId = row.slug ?? String(row.item_id);
          return {
            id: displayId,
            apiId: row.item_id,
            slug: row.slug ?? undefined,
            type: row.item_type,
            title: row.title,
            subtitle: row.subtitle ?? undefined,
            image: row.image ?? undefined,
            link: `/${row.item_type === "university" ? "universities" : `${row.item_type}s`}/${displayId}`,
            savedAt: new Date(row.saved_at).getTime(),
          };
        });

        // Merge server items with any items saved locally
        setSavedItems((prev) => {
          const currentBase = prev.length > 0 ? prev : localSaves;
          const merged = [...serverItems];
          for (const p of currentBase) {
            if (!merged.some((m) => matchesItem(m, p.id) || (p.apiId && m.apiId === p.apiId))) {
              const id = apiIdOf(p);
              if (id) void saveItemRequest(p.type, id).catch(() => {});
              merged.unshift(p);
            }
          }
          writeLocal(merged, activeUserId);
          return merged;
        });
      } catch (err) {
        console.warn("Could not load saved items from the server, preserving local cache:", err);
        if (!cancelled) {
          const cached = readLocal(activeUserId);
          if (cached.length > 0) {
            setSavedItems((prev) => (prev.length > 0 ? prev : cached));
          }
        }
      } finally {
        if (!cancelled) {
          setIsInitialized(true);
          setIsServerSynced(true);
        }
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const isSaved = useCallback(
    (id: string) => savedItems.some((item) => matchesItem(item, id)),
    [savedItems]
  );

  const dismissToast = useCallback(() => setShowToast(false), []);

  const saveItem = useCallback(
    (item: Omit<SavedItem, "savedAt">) => {
      const fullItem: SavedItem = { ...item, savedAt: Date.now() };

      let currentUserId = user?.id ?? null;
      if (!currentUserId && typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("domner_user");
          const u = cached ? JSON.parse(cached) : null;
          if (u?.id) currentUserId = u.id;
        } catch {}
      }

      setSavedItems((prev) => {
        const next = prev.some((i) => matchesItem(i, item.id) || (item.apiId && i.apiId === item.apiId))
          ? prev
          : [fullItem, ...prev];
        writeLocal(next, currentUserId);
        return next;
      });
      setLastSavedTitle(item.title);
      setShowToast(true);

      if (currentUserId) {
        const id = apiIdOf(item);
        if (id) void saveItemRequest(item.type, id).catch(() => {});
      }
    },
    [user?.id]
  );

  const unsaveItem = useCallback(
    (id: string) => {
      let currentUserId = user?.id ?? null;
      if (!currentUserId && typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("domner_user");
          const u = cached ? JSON.parse(cached) : null;
          if (u?.id) currentUserId = u.id;
        } catch {}
      }

      const existing = savedItems.find((item) => matchesItem(item, id));
      setSavedItems((prev) => {
        const next = prev.filter((item) => !matchesItem(item, id));
        writeLocal(next, currentUserId);
        return next;
      });

      if (currentUserId && existing) {
        const targetId = apiIdOf(existing);
        if (targetId) void unsaveItemRequest(existing.type, targetId).catch(() => {});
      }
    },
    [savedItems, user?.id]
  );

  const toggleSave = useCallback(
    (item: Omit<SavedItem, "savedAt">): boolean => {
      const wasSaved = savedItems.some(
        (i) => matchesItem(i, item.id) || (item.apiId && i.apiId === item.apiId)
      );
      if (wasSaved) unsaveItem(item.id);
      else saveItem(item);
      return !wasSaved;
    },
    [savedItems, saveItem, unsaveItem]
  );

  const clearAll = useCallback(() => {
    let currentUserId = user?.id ?? null;
    if (!currentUserId && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("domner_user");
        const u = cached ? JSON.parse(cached) : null;
        if (u?.id) currentUserId = u.id;
      } catch {}
    }

    const previous = savedItems;
    setSavedItems([]);
    writeLocal([], currentUserId);
    try {
      localStorage.removeItem("domner_saved_items_cache");
    } catch {}

    if (currentUserId) {
      for (const item of previous) {
        const id = apiIdOf(item);
        if (id) void unsaveItemRequest(item.type, id).catch(() => {});
      }
    }
  }, [savedItems, user?.id]);

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
        isServerSynced,
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
  isServerSynced: false,
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
