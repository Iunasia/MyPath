"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  User,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  getGoogleAuthUrl,
} from "@/app/lib/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginUser(email, password);
      if (data.user) setUser(data.user);
      router.push("/");
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await registerUser(name, email, password);
      if (data.user) setUser(data.user);
      router.push("/");
    },
    [router]
  );

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      // Ignore API failure on logout; ensure state clears
    }
    setUser(null);
    router.push("/");
    // Smooth timing for the progress bar and exit transition
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 1100);
  }, [router]);

  const loginWithGoogle = useCallback(() => {
    window.location.href = getGoogleAuthUrl();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isLoggingOut, login, register, logout, loginWithGoogle }}>
      {children}

      {/* Professional Logout Transition Modal */}
      {isLoggingOut && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-ink/35 backdrop-blur-md transition-all duration-300 p-4"
        >
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-9 max-w-sm w-full border border-white/80 shadow-[0_25px_60px_-15px_rgba(61,112,116,0.35)] flex flex-col items-center text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top ambient color glow */}
            <div className="absolute -top-16 inset-x-0 h-28 bg-gradient-to-b from-sky/30 to-transparent pointer-events-none rounded-full blur-xl" />

            {/* Icon Graphic Container */}
            <div className="relative w-18 h-18 mb-5 flex items-center justify-center">
              {/* Outer soft glowing pulse */}
              <div className="absolute inset-0 rounded-full bg-sky/20 animate-ping opacity-30" />
              
              {/* Rotating gradient ring */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-deep border-r-sky animate-spin" />
              
              {/* Center icon badge */}
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-sitomo to-powder border border-sky/30 text-sky-deep flex items-center justify-center shadow-inner">
                <LogOut className="w-6 h-6 text-sky-deep" strokeWidth={2.2} />
              </div>
            </div>

            {/* Typography */}
            <h3 className="font-display text-xl sm:text-2xl font-black text-blue-ink tracking-tight mb-1.5">
              Signed Out
            </h3>
            <p className="text-xs sm:text-sm text-gray-soft font-semibold mb-6 flex items-center justify-center gap-1.5">
              <span>Redirecting to homepage</span>
              <span className="inline-flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-sky-deep animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-1 rounded-full bg-sky-deep animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1 rounded-full bg-sky-deep animate-bounce" />
              </span>
            </p>

            {/* Sleek Animated Progress Bar */}
            <div className="w-full h-1.5 bg-powder rounded-full overflow-hidden border border-sky/15">
              <div className="h-full bg-gradient-to-r from-sky via-sky-deep to-sky-dark rounded-full w-full animate-[progress_1s_ease-in-out_forwards] origin-left" />
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
