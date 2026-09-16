"use client";

import { useState } from "react";
import { API_BASE, User } from "@/app/lib/auth";

interface AvatarProps {
  user: Pick<User, "id" | "name" | "avatar_url" | "avatar_updated_at">;
  size: number;
  className?: string;
}

export default function Avatar({ user, size, className = "" }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  const src = user.avatar_updated_at
    ? `${API_BASE}/auth/avatar/${user.id}?v=${encodeURIComponent(user.avatar_updated_at)}`
    : user.avatar_url || null;

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={src}
        src={src}
        alt=""
        style={{ width: size, height: size }}
        className={`rounded-full object-cover shrink-0 ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className={`rounded-full bg-sky-deep text-white font-bold flex items-center justify-center shrink-0 ${className}`}
    >
      {user.name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
