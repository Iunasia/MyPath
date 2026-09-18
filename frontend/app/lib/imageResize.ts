/**
 * Shrinks a screenshot in the browser before it is uploaded.
 *
 * Phone photos are routinely 4–12MB, and the API runs on Vercel, which refuses
 * any request body over 4.5MB. Re-drawing onto a canvas at 2000px on the long
 * side keeps small print legible at roughly 300KB–1MB, and turns whatever the
 * phone produced (including HEIC on iPhone, where the browser can decode it)
 * into a JPEG the server accepts. The server re-encodes again regardless — this
 * step is about fitting through the door, not about trust.
 */

export const MAX_SCREENSHOTS = 3;

const MAX_EDGE = 2000;
/** Per file, under the server's 4MB cap so three fit in one request. */
const TARGET_BYTES = 1.4 * 1024 * 1024;

const loadImage = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
  try {
    // Applies the EXIF rotation, so portrait photos stay upright.
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Older Safari: fall back to an <img>, which also honours orientation.
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
};

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))),
      "image/jpeg",
      quality
    )
  );

/** Throws when the browser cannot read the file as an image at all. */
export async function downscaleImage(file: File): Promise<Blob> {
  const source = await loadImage(file);
  const width = "naturalWidth" in source ? source.naturalWidth : source.width;
  const height = "naturalHeight" in source ? source.naturalHeight : source.height;

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  // White under transparent PNGs, which would otherwise turn black as JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ("close" in source) source.close();

  for (const quality of [0.85, 0.72, 0.6]) {
    const blob = await toJpeg(canvas, quality);
    if (blob.size <= TARGET_BYTES || quality === 0.6) return blob;
  }
  throw new Error("unreachable");
}
