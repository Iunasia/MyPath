"use client";

import { useEffect, useState, useCallback, useRef, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X, ArrowRight, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { trackCampaign } from "@/app/lib/api";
import {
  getYouTubeId,
  getYouTubeEmbedUrl,
  getTikTokId,
  getTikTokEmbedUrl,
  getGoogleDriveId,
  getGoogleDriveImageUrl,
  getGoogleDriveEmbedUrl,
} from "@/app/lib/mediaUtils";

export interface AdCampaign {
  id: string | number;
  triggerParam?: string;
  trigger_param?: string | null;
  type: "image" | "video";
  mediaSrc?: string;
  media_url?: string;
  linkUrl?: string;
  link_url?: string;
  title: string;
  tagline?: string | null;
  ctaText?: string;
  cta_text?: string;
  countdown_seconds?: number;
  countdownSeconds?: number;
}

export interface AdPopupProps {
  ads: AdCampaign[];
  paramKeys?: string[];
  countdownSeconds?: number;
  alwaysShowForTesting?: boolean;
}

const STORAGE_PREFIX = "domner_ad_seen_";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function AdPopupContent({
  ads,
  paramKeys = ["campaign", "promo", "utm_campaign"],
  countdownSeconds = 3,
  alwaysShowForTesting = false,
}: AdPopupProps) {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);
  const [isMuted, setIsMuted] = useState(true);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset image error on ad navigation
  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);

  // Auto-play HTML5 video reliably across all browsers (muted)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex, isOpen]);

  // Command YouTube iframe to start playing muted as soon as it loads
  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "mute", args: "" }),
          "*"
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: "" }),
          "*"
        );
      } catch {
        // ignore cross-origin errors if any
      }
    }
  };

  const canDismiss = timeLeft <= 0;

  // 1. Identify if a marketing campaign key was passed in URL (?campaign=..., ?promo=...)
  const matchedCampaignKey = useMemo(() => {
    for (const key of paramKeys) {
      const val = searchParams.get(key);
      if (val) return val.toLowerCase().trim();
    }
    return null;
  }, [paramKeys, searchParams]);

  const isTestParam = searchParams.get("test_ad") === "1";
  const forceShow = alwaysShowForTesting || isTestParam;

  // 2. Derive active ads based on URL trigger, test parameter, or general sitewide ads
  const activeAds = useMemo(() => {
    if (!ads || ads.length === 0) return [];

    // Specific campaign query parameter in URL (?campaign=workshop)
    if (matchedCampaignKey) {
      const matched = ads.filter((ad) => {
        const trigger = (ad.trigger_param || ad.triggerParam || "").toLowerCase().trim();
        return trigger && trigger === matchedCampaignKey;
      });
      if (matched.length > 0) return matched;
    }

    // Forced test mode (?test_ad=1 or prop)
    if (forceShow) {
      return ads;
    }

    // Sitewide campaigns (no trigger_param configured, shown to all visitors)
    const sitewide = ads.filter((ad) => {
      const trigger = (ad.trigger_param || ad.triggerParam || "").trim();
      return !trigger;
    });
    if (sitewide.length > 0) {
      return sitewide;
    }

    return [];
  }, [ads, matchedCampaignKey, forceShow]);

  // 3. Open modal if frequency capping allows & track impression
  useEffect(() => {
    if (activeAds.length === 0) {
      setIsOpen(false);
      return;
    }

    const campaignStorageKey = `${STORAGE_PREFIX}${activeAds.map((a) => a.id).join("_")}`;
    const lastSeen = typeof window !== "undefined" ? localStorage.getItem(campaignStorageKey) : null;
    const shouldDisplay = forceShow || !lastSeen || Date.now() - Number(lastSeen) > ONE_DAY_MS;

    if (shouldDisplay) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Track impression
        const current = activeAds[0];
        if (current && typeof current.id === "number") {
          trackCampaign(current.id, "impression").catch(() => {});
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [activeAds, forceShow]);

  const currentAd = activeAds[currentIndex];

  // 4. Countdown timer once opened or when slide changes
  useEffect(() => {
    if (!isOpen || !currentAd) return;

    const adDuration = currentAd.countdown_seconds !== undefined
      ? currentAd.countdown_seconds
      : currentAd.countdownSeconds !== undefined
      ? currentAd.countdownSeconds
      : countdownSeconds;

    const targetSeconds = Math.max(0, Number(adDuration) || 0);
    setTimeLeft(targetSeconds);

    if (targetSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, currentAd?.id, currentAd?.countdown_seconds, countdownSeconds]);

  // 5. Dismiss handler
  const handleClose = useCallback(() => {
    if (!canDismiss) return;
    setIsOpen(false);
    if (activeAds.length > 0) {
      const campaignStorageKey = `${STORAGE_PREFIX}${activeAds.map((a) => a.id).join("_")}`;
      localStorage.setItem(campaignStorageKey, String(Date.now()));
    }
  }, [canDismiss, activeAds]);

  // 6. Escape key support
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && canDismiss) handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, canDismiss, handleClose]);

  const nextAd = () => setCurrentIndex((prev) => (prev + 1) % activeAds.length);
  const prevAd = () => setCurrentIndex((prev) => (prev - 1 + activeAds.length) % activeAds.length);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!isOpen || !currentAd) return null;

  const mediaSource = currentAd.media_url || currentAd.mediaSrc || "/images/cadt-map.png";
  const destinationUrl = currentAd.link_url || currentAd.linkUrl || "/workshops";
  const buttonLabel = currentAd.cta_text || currentAd.ctaText || "Join Now";

  // Check video providers and Google Drive
  const youtubeId = getYouTubeId(mediaSource);
  const tiktokId = getTikTokId(mediaSource);
  const googleDriveId = getGoogleDriveId(mediaSource);
  const isPortraitVideo = Boolean(tiktokId);

  const handleCtaClick = () => {
    if (typeof currentAd.id === "number") {
      trackCampaign(currentAd.id, "click").catch(() => {});
    }
    handleClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ad-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      {/* Sleek Minimalist Poster Card */}
      <div
        className={`relative w-full ${
          isPortraitVideo ? "max-w-xs sm:max-w-[340px]" : "max-w-sm sm:max-w-md"
        } bg-white dark:bg-[#151C24] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top-Right: Countdown / Close Button */}
        <div className="absolute top-3 right-3 z-30">
          {!canDismiss ? (
            <div className="flex items-center justify-center min-w-[34px] h-[34px] px-2.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-semibold select-none border border-white/10 shadow-lg">
              {timeLeft}s
            </div>
          ) : (
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-black/75 hover:bg-black/95 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 border border-white/20 shadow-lg cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Media Container: TikTok Embed, YouTube Iframe, Direct HTML5 Video, or Image */}
        <div
          className={`relative ${
            tiktokId
              ? "aspect-[9/13] sm:aspect-[9/13] max-h-[55vh] sm:max-h-[60vh]"
              : youtubeId
              ? "aspect-[16/9]"
              : currentAd.type === "video"
              ? "aspect-[16/9] sm:aspect-[4/3]"
              : "aspect-[4/3]"
          } w-full bg-black overflow-hidden group`}
        >
          {tiktokId ? (
            <iframe
              key={tiktokId}
              src={getTikTokEmbedUrl(tiktokId)}
              title={currentAd.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : youtubeId ? (
            <iframe
              ref={iframeRef}
              key={youtubeId}
              src={getYouTubeEmbedUrl(youtubeId)}
              title={currentAd.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleIframeLoad}
            />
          ) : googleDriveId && currentAd.type === "video" ? (
            <iframe
              key={googleDriveId}
              src={getGoogleDriveEmbedUrl(googleDriveId)}
              title={currentAd.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : currentAd.type === "video" ? (
            <Link
              href={destinationUrl}
              onClick={handleCtaClick}
              className="block relative w-full h-full"
            >
              <video
                ref={videoRef}
                key={mediaSource}
                src={mediaSource}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md transition-colors border border-white/10"
                title={isMuted ? "Unmute" : "Mute"}
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </Link>
          ) : (
            <Link
              href={destinationUrl}
              onClick={handleCtaClick}
              className="block relative w-full h-full"
            >
              <Image
                key={mediaSource + (imageError ? "_fallback" : "")}
                src={
                  imageError
                    ? "/images/cadt-map.png"
                    : googleDriveId
                    ? getGoogleDriveImageUrl(googleDriveId)
                    : mediaSource
                }
                alt={currentAd.title}
                fill
                sizes="(max-width: 640px) 100vw, 448px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
                unoptimized
                onError={() => setImageError(true)}
              />
            </Link>
          )}

          {/* Carousel Navigation Arrows */}
          {activeAds.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevAd();
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-md"
                aria-label="Previous advertisement"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextAd();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-md"
                aria-label="Next advertisement"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Carousel Indicators */}
          {activeAds.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm pointer-events-auto">
              {activeAds.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex ? "w-5 bg-[#7AB3B7]" : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-white dark:bg-[#151C24]">
          <div className="min-w-0">
            <h3
              id="ad-popup-title"
              className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate"
            >
              {currentAd.title}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {currentAd.tagline || "Tap to explore"}
            </p>
          </div>

          <Link
            href={destinationUrl}
            onClick={handleCtaClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7AB3B7] hover:bg-[#68A2A6] text-white text-xs font-semibold shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#7AB3B7]/25 cursor-pointer"
          >
            <span>{buttonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdPopup(props: AdPopupProps) {
  return (
    <Suspense fallback={null}>
      <AdPopupContent {...props} />
    </Suspense>
  );
}
