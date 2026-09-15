"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";

export default function SignOutButton({
  variant = "inline",
  className = "",
  onClick,
}: {
  variant?: "inline" | "block";
  className?: string;
  onClick?: () => void;
}) {
  const t = useTranslations("common");
  const { logout } = useAuth();

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        void logout();
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border border-sky/30 px-3 py-1.5 text-xs font-bold text-gray-body hover:bg-powder hover:text-blue-ink transition-colors cursor-pointer ${
        variant === "block" ? "w-full justify-center" : ""
      } ${className}`}
    >
      <LogOut className="w-3.5 h-3.5" />
      {t("signOut")}
    </button>
  );
}
