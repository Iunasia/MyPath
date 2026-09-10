"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

/**
 * Gate for admin-only pages.
 *
 * This is a convenience guard, not a security boundary — anything rendered on
 * the client can be bypassed with devtools. Every admin action must also be
 * authorised on the server (see `isAdmin` in backend/src/middleware/admin.ts).
 * Its job is to keep the admin UI out of the way of ordinary students.
 */
export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Signed out entirely — send them to sign in and come back here after.
    if (!loading && !user) {
      router.replace("/auth/signin?next=/admin");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-powder flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-soft">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">Checking your access…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // The redirect above is in flight; render nothing rather than flashing the
    // dashboard for a frame.
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-powder flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-sky/15 bubble-shadow-sm p-8 text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-momo mb-4">
            <ShieldAlert className="w-6 h-6 text-blue-ink" />
          </span>
          <h1 className="font-display text-xl font-extrabold text-blue-ink mb-2">
            Admin access only
          </h1>
          <p className="text-sm text-gray-body font-medium mb-6">
            You are signed in as <strong>{user.name}</strong>, which is a student
            account. Managing content requires an administrator.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-sky px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-bright transition-colors"
          >
            Back to Domner
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
