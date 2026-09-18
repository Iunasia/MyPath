"use client";

import { useEffect, useState } from "react";
import { ImageOff, Loader2, X } from "lucide-react";
import { fetchVerificationAttachment, type ApiVerificationAttachment } from "@/app/lib/api";

type Loaded = { id: number; url: string | null };

/**
 * Thumbnails of the screenshots on a verification request, with a click-to-
 * enlarge view. Images are fetched with the session cookie and shown from
 * object URLs, since the endpoint is private to the student and admins.
 */
export default function AttachmentGallery({
  requestId,
  attachments,
  labels,
}: {
  requestId: number;
  attachments: ApiVerificationAttachment[];
  labels: { heading: string; unavailable: string; open: string; close: string };
}) {
  const [images, setImages] = useState<Loaded[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const ids = attachments.map((a) => a.id).join(",");

  useEffect(() => {
    if (!ids) return;
    let cancelled = false;
    const created: string[] = [];

    void (async () => {
      const loaded = await Promise.all(
        ids.split(",").map(async (raw) => {
          const id = Number(raw);
          try {
            const url = URL.createObjectURL(await fetchVerificationAttachment(requestId, id));
            created.push(url);
            return { id, url };
          } catch {
            // 404 once the retention sweep has removed it.
            return { id, url: null };
          }
        })
      );
      if (!cancelled) setImages(loaded);
    })();

    return () => {
      cancelled = true;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [requestId, ids]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (attachments.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="text-[11px] font-bold text-gray-soft mb-1.5">{labels.heading}</p>
      <div className="flex flex-wrap gap-2">
        {(images ?? attachments.map((a) => ({ id: a.id, url: undefined }))).map((image) =>
          image.url === undefined ? (
            <div
              key={image.id}
              className="w-24 h-24 rounded-xl border border-sky/20 bg-powder/60 flex items-center justify-center"
            >
              <Loader2 className="w-4 h-4 animate-spin text-gray-soft" aria-hidden="true" />
            </div>
          ) : image.url === null ? (
            <div
              key={image.id}
              className="w-24 h-24 rounded-xl border border-sky/20 bg-powder/60 flex flex-col items-center justify-center gap-1 px-2 text-center"
            >
              <ImageOff className="w-4 h-4 text-gray-soft" aria-hidden="true" />
              <span className="text-[10px] text-gray-soft font-medium leading-tight">{labels.unavailable}</span>
            </div>
          ) : (
            <button
              key={image.id}
              type="button"
              onClick={() => setOpen(image.url)}
              aria-label={labels.open}
              className="w-24 h-24 rounded-xl border border-sky/20 overflow-hidden bg-white cursor-zoom-in hover:ring-2 hover:ring-sky/40 transition-shadow"
            >
              {/* Object URL of a private image — next/image cannot optimise it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="w-full h-full object-cover" />
            </button>
          )
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label={labels.close}
            className="absolute top-4 right-4 text-white/90 hover:text-white p-2 rounded-full bg-black/40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={open}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
