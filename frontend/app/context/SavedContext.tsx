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
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const getStorageKey = (userId: number) => {
  return `domner_saved_items_user_${userId}`;
};

const SavedContext = createContext<SavedContextType | undefined>(undefined);

/** The API accepts either a numeric id or a slug (for universities/majors/careers). */
const apiIdOf = (item: { apiId?: number; id: string; slug?: string; type: SavedItemType }): number | string | null => {
  if (typeof item.apiId === "number" && item.apiId > 0) return item.apiId;
  if (item.type === "scholarship") return null; // Static scholarships without a DB id cannot be sent to the backend
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
  if (typeof window === "undefined" || !userId) return [];
  try {
    const userStored = localStorage.getItem(getStorageKey(userId));
    if (userStored) {
      const parsed = JSON.parse(userStored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return [];
  } catch {
    return [];
  }
};

const writeLocal = (items: SavedItem[], userId?: number | null): void => {
  if (typeof window === "undefined" || !userId) return;
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(items));
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
  const [showAuthModal, setShowAuthModal] = useState(false);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const closeAuthModal = useCallback(() => setShowAuthModal(false), []);

  const mergedForUser = useRef<number | null>(null);

  // 1. Initial client-side local hydration
  useEffect(() => {
    try {
      localStorage.removeItem("domner_saved_items_guest");
    } catch {}

    let initialUserId: number | null = user?.id ?? null;
    if (!initialUserId && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("domner_user");
        const u = cached ? JSON.parse(cached) : null;
        if (u?.id) initialUserId = Number(u.id);
      } catch {}
    }

    if (initialUserId) {
      const local = readLocal(initialUserId);
      if (local.length > 0) {
        setSavedItems(local);
      }
    } else {
      setSavedItems([]);
    }
    setIsInitialized(true);
  }, []);

  /**
   * Syncs saves: hydrates from user's local cache and merges with server.
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
          setSavedItems([]);
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
    (id: string) => {
      if (!user) return false;
      return savedItems.some((item) => matchesItem(item, id));
    },
    [savedItems, user]
  );

  const dismissToast = useCallback(() => setShowToast(false), []);

  const saveItem = useCallback(
    (item: Omit<SavedItem, "savedAt">) => {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      const fullItem: SavedItem = { ...item, savedAt: Date.now() };
      const currentUserId = user.id;

      setSavedItems((prev) => {
        const next = prev.some((i) => matchesItem(i, item.id) || (item.apiId && i.apiId === item.apiId))
          ? prev
          : [fullItem, ...prev];
        writeLocal(next, currentUserId);
        return next;
      });
      setLastSavedTitle(item.title);
      setShowToast(true);

      const id = apiIdOf(item);
      if (id) void saveItemRequest(item.type, id).catch(() => {});
    },
    [user]
  );

  const unsaveItem = useCallback(
    (id: string) => {
      if (!user) return;
      const currentUserId = user.id;

      const existing = savedItems.find((item) => matchesItem(item, id));
      setSavedItems((prev) => {
        const next = prev.filter((item) => !matchesItem(item, id));
        writeLocal(next, currentUserId);
        return next;
      });

      if (existing) {
        const targetId = apiIdOf(existing);
        if (targetId) void unsaveItemRequest(existing.type, targetId).catch(() => {});
      }
    },
    [savedItems, user]
  );

  const toggleSave = useCallback(
    (item: Omit<SavedItem, "savedAt">): boolean => {
      if (!user) {
        setShowAuthModal(true);
        return false;
      }
      const wasSaved = savedItems.some(
        (i) => matchesItem(i, item.id) || (item.apiId && i.apiId === item.apiId)
      );
      if (wasSaved) unsaveItem(item.id);
      else saveItem(item);
      return !wasSaved;
    },
    [savedItems, saveItem, unsaveItem, user]
  );

  const clearAll = useCallback(() => {
    if (!user) return;
    const currentUserId = user.id;

    const previous = savedItems;
    setSavedItems([]);
    writeLocal([], currentUserId);
    try {
      localStorage.removeItem("domner_saved_items_cache");
    } catch {}

    for (const item of previous) {
      const id = apiIdOf(item);
      if (id) void unsaveItemRequest(item.type, id).catch(() => {});
    }
  }, [savedItems, user]);

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
        showAuthModal,
        setShowAuthModal,
        openAuthModal,
        closeAuthModal,
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
  showAuthModal: false,
  setShowAuthModal: () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
};

export function useSaved() {
  return useContext(SavedContext) ?? defaultSavedContext;
}
