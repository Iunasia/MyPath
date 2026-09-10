"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useCompare, type CompareType } from "@/app/context/CompareContext";

/** Drops a column: updates the tray, then follows the link to the smaller comparison. */
export default function RemoveLink({
  href,
  type,
  apiId,
  title,
}: {
  href: string;
  type: CompareType;
  apiId: number;
  title: string;
}) {
  const { remove } = useCompare();

  return (
    <Link
      href={href}
      onClick={() => remove(type, apiId)}
      className="absolute top-3 right-3 p-1 rounded-full text-gray-soft hover:text-blue-ink hover:bg-sitomo transition-colors"
      aria-label={`Remove ${title} from the comparison`}
      title="Remove"
    >
      <X className="w-4 h-4" />
    </Link>
  );
}
