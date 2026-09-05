"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type SavedItemType = "scholarship" | "major" | "career" | "university";

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  subtitle?: string; // Provider, faculty, or career category
  image?: string;
  badge?: string;    // e.g. "Full Tuition", "High Demand"
  deadline?: string; // For scholarships
  link: string;      // Detail page URL
  savedAt: number;   // Timestamp
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

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSavedTitle, setLastSavedTitle] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          queueMicrotask(() => {
            setSavedItems(parsed);
            setIsInitialized(true);
          });
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to read saved items from localStorage:", err);
    }
    queueMicrotask(() => {
      setIsInitialized(true);
    });
  }, []);

  // Save to localStorage whenever savedItems changes (after initial mount)
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
    } catch (err) {
      console.warn("Failed to persist saved items to localStorage:", err);
    }
  }, [savedItems, isInitialized]);

  // Check if item is saved
  const isSaved = useCallback(
    (id: string) => {
      return savedItems.some((item) => item.id === id);
    },
    [savedItems]
  );

  // Dismiss toast notification
  const dismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  // Save an item
  const saveItem = useCallback(
    (item: Omit<SavedItem, "savedAt">) => {
      setSavedItems((prev) => {
        if (prev.some((i) => i.id === item.id)) {
          return prev; // already saved
        }
        return [{ ...item, savedAt: Date.now() }, ...prev];
      });
      setLastSavedTitle(item.title);
      setShowToast(true);
    },
    []
  );

  // Unsave an item
  const unsaveItem = useCallback((id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Toggle save
  const toggleSave = useCallback(
    (item: Omit<SavedItem, "savedAt">): boolean => {
      let nowSaved = false;
      setSavedItems((prev) => {
        const exists = prev.some((i) => i.id === item.id);
        if (exists) {
          nowSaved = false;
          return prev.filter((i) => i.id !== item.id);
        } else {
          nowSaved = true;
          return [{ ...item, savedAt: Date.now() }, ...prev];
        }
      });

      if (nowSaved) {
        setLastSavedTitle(item.title);
        setShowToast(true);
      } else {
        setShowToast(false);
      }

      return nowSaved;
    },
    []
  );

  // Clear all
  const clearAll = useCallback(() => {
    setSavedItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Failed to clear localStorage:", err);
    }
  }, []);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 4000);
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
  const context = useContext(SavedContext);
  if (!context) {
    return defaultSavedContext;
  }
  return context;
}

