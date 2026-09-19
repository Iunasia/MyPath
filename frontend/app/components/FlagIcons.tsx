import React from "react";

export function UKFlag({ className = "w-4 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 36"
      className={`rounded-xs overflow-hidden shrink-0 ${className}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="36" fill="#012169" />
      <path d="M0,0 L60,36 M60,0 L0,36" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M0,0 L30,18 M60,36 L30,18 M60,0 L30,18 M0,36 L30,18" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v36 M0,18 h60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30,0 v36 M0,18 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

export function CambodiaFlag({ className = "w-4 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      className={`rounded-xs overflow-hidden shrink-0 ${className}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top blue stripe (25%) */}
      <rect width="64" height="10" fill="#032EA6" />
      {/* Middle red stripe (50%) */}
      <rect y="10" width="64" height="20" fill="#E00025" />
      {/* Bottom blue stripe (25%) */}
      <rect y="30" width="64" height="10" fill="#032EA6" />

      {/* Angkor Wat Temple Silhouette */}
      <g fill="#FFFFFF">
        {/* Tiered base platform */}
        <rect x="18.5" y="27" width="27" height="1.8" rx="0.5" />
        <rect x="20.5" y="24.5" width="23" height="1.8" rx="0.5" />
        <rect x="22" y="22.5" width="20" height="1.5" />

        {/* Central main tower */}
        <path d="M30 22.5 L30.5 16 L32 11.5 L33.5 16 L34 22.5 Z" />

        {/* Left flanking tower */}
        <path d="M24 22.5 L24.5 17.5 L26 14 L27.5 17.5 L28 22.5 Z" />

        {/* Right flanking tower */}
        <path d="M36 22.5 L36.5 17.5 L38 14 L39.5 17.5 L40 22.5 Z" />

        {/* Outer step balustrades */}
        <rect x="20.5" y="20.5" width="1.5" height="2" />
        <rect x="42" y="20.5" width="1.5" height="2" />
      </g>
    </svg>
  );
}
