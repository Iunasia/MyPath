/**
 * Utility functions for detecting and embedding video and media formats
 * across campaigns, pop-up ads, and previews (YouTube, TikTok, MP4, Images).
 */

/**
 * Extracts a YouTube 11-character video ID from any YouTube URL variation:
 * - youtu.be/<id>
 * - youtube.com/watch?v=<id>
 * - youtube.com/embed/<id>
 * - youtube.com/shorts/<id>
 * - youtube.com/v/<id>
 */
export function getYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Returns the standard high-quality YouTube video thumbnail URL.
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Returns a privacy-conscious, responsive YouTube iframe embed URL.
 * Uses standard youtube.com with enablejsapi=1, autoplay=1, and mute=1
 * to satisfy modern browser autoplay policies.
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}`;
}

/**
 * Extracts a TikTok numeric video/post ID from TikTok URLs:
 * - tiktok.com/@username/video/<id>
 * - tiktok.com/@username/photo/<id>
 * - m.tiktok.com/v/<id>.html
 * - tiktok.com/embed/v3/<id>
 * - tiktok.com/v/<id>
 */
export function getTikTokId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Match standard, mobile, photo, or embed URLs containing numeric ID (15-22 digits)
  const match = trimmed.match(/(?:tiktok\.com\/.*(?:video|photo|v)\/|tiktok\.com\/embed\/v\d\/)(\d{15,22})/);
  if (match) return match[1];

  // Fallback: any 17-21 digit string within a tiktok URL
  if (trimmed.includes("tiktok.com")) {
    const numMatch = trimmed.match(/(\d{17,21})/);
    if (numMatch) return numMatch[1];
  }

  return null;
}

/**
 * Returns the responsive TikTok embed player URL with autoplay enabled.
 */
export function getTikTokEmbedUrl(videoId: string): string {
  return `https://www.tiktok.com/embed/v3/${videoId}?autoplay=1`;
}

/**
 * Checks if a URL is a shortened TikTok share link (vt.tiktok.com or tiktok.com/t/...)
 */
export function isTikTokShortUrl(url?: string | null): boolean {
  if (!url) return false;
  return /(?:vt\.tiktok\.com|tiktok\.com\/t\/)/i.test(url.trim());
}

/**
 * Checks if a media URL points directly to an HTML5 video file (.mp4, .webm, .ogg).
 */
export function isDirectVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url.trim());
}

/**
 * Extracts a Google Drive file ID from standard sharing/view URLs:
 * - drive.google.com/file/d/<id>/view
 * - drive.google.com/open?id=<id>
 * - drive.google.com/uc?id=<id>
 */
export function getGoogleDriveId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed.includes("drive.google.com")) return null;

  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Returns a high-res direct image URL for a public Google Drive image file.
 */
export function getGoogleDriveImageUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

/**
 * Returns the embedded player URL for a public Google Drive video file.
 */
export function getGoogleDriveEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Checks if a URL is from Google Drive.
 */
export function isGoogleDriveUrl(url?: string | null): boolean {
  return Boolean(getGoogleDriveId(url));
}

/**
 * Categorizes a media URL into its primary media type.
 */
export function detectMediaType(url?: string | null): "youtube" | "tiktok" | "gdrive" | "video" | "image" {
  if (!url) return "image";
  if (getYouTubeId(url)) return "youtube";
  if (getTikTokId(url) || isTikTokShortUrl(url)) return "tiktok";
  if (isGoogleDriveUrl(url)) return "gdrive";
  if (isDirectVideoUrl(url)) return "video";
  return "image";
}

