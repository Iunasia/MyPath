"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Eye,
  MousePointerClick,
  Sparkles,
  Video,
  Play,
  Upload,
  Loader2,
  Timer,
} from "lucide-react";
import {
  getYouTubeId,
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
  getTikTokId,
  getTikTokEmbedUrl,
  isTikTokShortUrl,
  getGoogleDriveId,
  getGoogleDriveImageUrl,
  getGoogleDriveEmbedUrl,
} from "@/app/lib/mediaUtils";
import {
  fetchAdminCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  uploadCampaignMedia,
  resolveShortenedUrl,
  type ApiCampaign,
  type CampaignInput,
} from "@/app/lib/api";
import {
  PageHeader,
  btnPrimary,
  btnSecondary,
  inputClass,
  selectClass,
  tableClass,
  thClass,
  tdClass,
  Toast,
  ConfirmDialog,
  Loading,
  ErrorBox,
} from "../ui";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Modal editor states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<ApiCampaign | null>(null);
  const [formData, setFormData] = useState<CampaignInput>({
    title: "",
    tagline: "",
    trigger_param: "",
    type: "image",
    media_url: "",
    link_url: "",
    cta_text: "Join Now",
    countdown_seconds: 3,
    is_active: true,
    priority: 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete dialog state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedTrigger, setCopiedTrigger] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setEditorError("File exceeds 10MB limit. For larger video ads, please paste a YouTube or TikTok link instead.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setEditorError(null);
    try {
      const res = await uploadCampaignMedia(file);
      setFormData((prev) => ({
        ...prev,
        media_url: res.url,
        type: res.type,
      }));
      showToast("Media file uploaded successfully!");
    } catch (err: any) {
      setEditorError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Load campaigns
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Open editor for new or existing campaign
  const handleOpenEditor = (campaign?: ApiCampaign) => {
    setEditorError(null);
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        title: campaign.title,
        tagline: campaign.tagline || "",
        trigger_param: campaign.trigger_param || "",
        type: campaign.type,
        media_url: campaign.media_url,
        link_url: campaign.link_url,
        cta_text: campaign.cta_text,
        countdown_seconds: campaign.countdown_seconds !== undefined ? campaign.countdown_seconds : 3,
        is_active: campaign.is_active,
        priority: campaign.priority,
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        title: "",
        tagline: "",
        trigger_param: "",
        type: "image",
        media_url: "/images/cadt-map.png",
        link_url: "/workshops",
        cta_text: "Join Now",
        countdown_seconds: 3,
        is_active: true,
        priority: 0,
      });
    }
    setIsEditorOpen(true);
  };

  // Submit editor
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setEditorError("Title is required");
      return;
    }
    if (!formData.media_url.trim()) {
      setEditorError("Media URL or image path is required");
      return;
    }
    if (!formData.link_url.trim()) {
      setEditorError("Destination link URL is required");
      return;
    }

    try {
      setSaving(true);
      setEditorError(null);

      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, formData);
        showToast("Campaign updated successfully!");
      } else {
        await createCampaign(formData);
        showToast("New campaign created successfully!");
      }

      setIsEditorOpen(false);
      loadCampaigns();
    } catch (err: any) {
      setEditorError(err.message || "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  // Quick toggle active state
  const handleToggleActive = async (campaign: ApiCampaign) => {
    try {
      const updated = await updateCampaign(campaign.id, { is_active: !campaign.is_active });
      setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? updated : c)));
      showToast(
        updated.is_active
          ? `Campaign "${campaign.title}" is now ACTIVE`
          : `Campaign "${campaign.title}" is now PAUSED`
      );
    } catch (err: any) {
      setError(err.message || "Failed to toggle campaign status");
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCampaign(deletingId);
      showToast("Campaign deleted");
      setCampaigns((prev) => prev.filter((c) => c.id !== deletingId));
    } catch (err: any) {
      setError(err.message || "Failed to delete campaign");
    } finally {
      setDeletingId(null);
    }
  };

  // Copy trigger link
  const handleCopyLink = (triggerParam?: string | null) => {
    if (!triggerParam) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://domner.app";
    const fullUrl = `${origin}?campaign=${triggerParam}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedTrigger(triggerParam);
    setTimeout(() => setCopiedTrigger(null), 2000);
  };

  const activeCount = campaigns.filter((c) => c.is_active).length;
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Marketing Campaigns & Ads"
        description="Create and manage targeted pop-up announcements, video teasers, and promotional banners triggered by marketing campaign links."
        aside={
          <button onClick={() => handleOpenEditor()} className={btnPrimary}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Campaign
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-sky/15 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Campaigns</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-ink">{activeCount}</span>
            <span className="text-xs text-gray-400">/ {campaigns.length} total</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky/15 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Impressions</p>
          <div className="mt-2 flex items-center gap-2">
            <Eye className="w-5 h-5 text-sky-deep" />
            <span className="text-2xl font-black text-blue-ink">{totalImpressions.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky/15 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total CTA Clicks</p>
          <div className="mt-2 flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-[#7AB3B7]" />
            <span className="text-2xl font-black text-blue-ink">{totalClicks.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-sky/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16">
            <Loading label="Loading campaigns..." />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sitomo text-sky-deep">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-blue-ink">No campaigns yet</h3>
            <p className="text-xs text-gray-body max-w-sm mx-auto">
              Create your first promotional campaign to launch targeted pop-up ads for events, workshops, or scholarships.
            </p>
            <button onClick={() => handleOpenEditor()} className={btnPrimary}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Media Preview</th>
                  <th className={thClass}>Campaign Details</th>
                  <th className={thClass}>URL Trigger</th>
                  <th className={thClass}>Destination</th>
                  <th className={thClass}>Skip Delay</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Performance</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky/10">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-powder/30 transition-colors">
                    {/* Media preview */}
                    <td className={tdClass}>
                      {(() => {
                        const ytId = getYouTubeId(c.media_url);
                        if (ytId) {
                          return (
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-900 border border-sky/15 shrink-0 group">
                              <Image
                                src={getYouTubeThumbnail(ytId)}
                                alt={c.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                                <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white shadow">
                                  <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute bottom-0.5 right-0.5 px-1 rounded text-[8px] font-bold bg-black/80 text-white uppercase">
                                YouTube
                              </span>
                            </div>
                          );
                        }
                        const ttId = getTikTokId(c.media_url);
                        if (ttId) {
                          return (
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-black border border-sky/15 shrink-0 flex flex-col items-center justify-center text-white">
                              <span className="font-black text-[11px] tracking-tight bg-gradient-to-r from-[#00f2fe] to-[#fe0979] bg-clip-text text-transparent">
                                TikTok
                              </span>
                              <span className="absolute bottom-0.5 right-0.5 px-1 rounded text-[7px] font-bold bg-[#fe0979]/80 text-white uppercase">
                                Reel
                              </span>
                            </div>
                          );
                        }
                        const gDriveId = getGoogleDriveId(c.media_url);
                        if (gDriveId) {
                          return (
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 border border-sky/15 shrink-0">
                              <Image
                                src={getGoogleDriveImageUrl(gDriveId)}
                                alt={c.title}
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="64px"
                              />
                              <span className="absolute bottom-0.5 right-0.5 px-1 rounded text-[8px] font-bold bg-amber-600 text-white uppercase">
                                Drive
                              </span>
                            </div>
                          );
                        }
                        if (c.type === "video") {
                          return (
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-900 border border-sky/15 shrink-0 flex items-center justify-center text-white">
                              <Video className="w-5 h-5 text-[#7AB3B7]" />
                              <span className="absolute bottom-0.5 right-0.5 px-1 rounded text-[8px] font-bold bg-black/80 text-white uppercase">
                                MP4
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 border border-sky/15 shrink-0">
                            <Image
                              src={c.media_url}
                              alt={c.title}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="64px"
                            />
                            <span className="absolute bottom-0.5 right-0.5 px-1 rounded text-[8px] font-bold bg-black/80 text-white uppercase">
                              IMG
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Campaign Title & Tagline */}
                    <td className={tdClass}>
                      <div className="max-w-xs">
                        <div className="font-bold text-sm text-blue-ink truncate">{c.title}</div>
                        {c.tagline && (
                          <div className="text-xs text-gray-body truncate mt-0.5">{c.tagline}</div>
                        )}
                        <div className="text-[10px] text-gray-400 mt-1">Button: &ldquo;{c.cta_text}&rdquo;</div>
                      </div>
                    </td>

                    {/* Trigger Parameter */}
                    <td className={tdClass}>
                      {c.trigger_param ? (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sitomo text-sky-deep font-mono text-xs font-semibold">
                            <span>?campaign={c.trigger_param}</span>
                            <button
                              onClick={() => handleCopyLink(c.trigger_param)}
                              className="text-sky-deep/70 hover:text-sky-deep transition-colors ml-1 cursor-pointer"
                              title="Copy full campaign URL"
                            >
                              {copiedTrigger === c.trigger_param ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div>
                            <a
                              href={`/en?campaign=${encodeURIComponent(c.trigger_param)}&test_ad=1`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#5B9DA2] hover:text-sky-deep font-medium hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" /> Test pop-up live
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-xs text-gray-500 font-medium">Sitewide (All visitors)</span>
                          <div>
                            <a
                              href="/en?test_ad=1"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#5B9DA2] hover:text-sky-deep font-medium hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" /> Test pop-up live
                            </a>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Destination link */}
                    <td className={tdClass}>
                      <a
                        href={c.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-sky-deep font-medium hover:underline max-w-[140px] truncate"
                      >
                        <span className="truncate">{c.link_url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>

                    {/* Skip Delay / Countdown */}
                    <td className={tdClass}>
                      {c.countdown_seconds === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          Instant close (0s)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky/20 text-sky-deep border border-sky/30 text-xs font-semibold">
                          <Timer className="w-3.5 h-3.5 text-sky-deep" />
                          <span>{c.countdown_seconds ?? 3}s delay</span>
                        </span>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className={tdClass}>
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-transform active:scale-95 cursor-pointer ${
                          c.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.is_active ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                          }`}
                        />
                        {c.is_active ? "Active" : "Paused"}
                      </button>
                    </td>

                    {/* Performance */}
                    <td className={tdClass}>
                      <div className="text-xs text-blue-ink">
                        <span className="font-semibold">{c.clicks || 0}</span> clicks
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {c.impressions || 0} views
                      </div>
                    </td>

                    {/* Actions */}
                    <td className={`${tdClass} text-right`}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditor(c)}
                          className="p-1.5 rounded-lg hover:bg-sky/10 text-gray-500 hover:text-sky-deep transition-colors cursor-pointer"
                          title="Edit Campaign"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-sky/20 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-sky/15 flex items-center justify-between bg-powder/40">
              <div>
                <h3 className="text-lg font-bold text-blue-ink">
                  {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
                </h3>
                <p className="text-xs text-gray-body">
                  Configure announcement banner details and URL parameters.
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-full hover:bg-white text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
              {editorError && <ErrorBox message={editorError} />}

              {/* Title & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-ink mb-1.5">
                    Campaign Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Special Tech Mentorship Workshop"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-ink mb-1.5">
                    Short Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.tagline || ""}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Free entry · 10 sessions every month"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* URL Trigger & Media Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-ink mb-1.5">
                    URL Trigger Parameter
                  </label>
                  <input
                    type="text"
                    value={formData.trigger_param || ""}
                    onChange={(e) => setFormData({ ...formData, trigger_param: e.target.value })}
                    placeholder="e.g. workshop, scholarship"
                    className={inputClass}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Triggers when link contains <code className="bg-sitomo px-1 rounded">?campaign=your_param</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-ink mb-1.5">
                    Media Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as "image" | "video" })
                    }
                    className={selectClass}
                  >
                    <option value="image">Image Banner</option>
                    <option value="video">Video (YouTube / MP4)</option>
                  </select>
                </div>
              </div>

              {/* Media URL & Direct Upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-blue-ink">
                    Media Source (Direct Upload or URL) <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-powder hover:bg-sitomo text-sky-deep text-xs font-bold transition-all border border-sky/20 cursor-pointer disabled:opacity-50 shadow-sm hover:scale-105 active:scale-95"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-deep" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-sky-deep" />
                          <span>Upload File</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={formData.media_url}
                  onChange={async (e) => {
                    const val = e.target.value;
                    const trimmed = val.trim();
                    const yt = getYouTubeId(trimmed);
                    const tt = getTikTokId(trimmed);

                    if ((yt || tt || isTikTokShortUrl(trimmed)) && formData.type !== "video") {
                      setFormData({ ...formData, media_url: val, type: "video" });
                    } else {
                      setFormData({ ...formData, media_url: val });
                    }

                    // Auto-resolve shortened TikTok share links (vt.tiktok.com)
                    if (isTikTokShortUrl(trimmed)) {
                      try {
                        const data = await resolveShortenedUrl(trimmed);
                        if (data.resolvedUrl && data.resolvedUrl !== trimmed) {
                          setFormData((prev) => ({
                            ...prev,
                            media_url: data.resolvedUrl,
                            type: "video",
                          }));
                        }
                      } catch {
                        // ignore network error
                      }
                    }
                  }}
                  placeholder="e.g. Upload a file above, paste YouTube, TikTok, Google Drive, or image URL"
                  className={inputClass}
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Supports direct file uploads (up to 10MB), or paste YouTube, TikTok, Google Drive share links, MP4, or external image URLs.
                </p>

                {/* Live Media Preview Box */}
                {formData.media_url.trim() && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-gray-50 border border-sky/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                        Live Preview:
                      </p>
                      {getYouTubeId(formData.media_url) ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <Play className="w-2.5 h-2.5 fill-red-600" /> YouTube Video Detected
                        </span>
                      ) : getTikTokId(formData.media_url) ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#fe0979] bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full">
                          TikTok Video Detected
                        </span>
                      ) : getGoogleDriveId(formData.media_url) ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Google Drive {formData.type === "video" ? "Video" : "Image"} Detected
                        </span>
                      ) : null}
                    </div>
                    <div
                      className={`relative ${
                        getTikTokId(formData.media_url)
                          ? "aspect-[9/13] max-h-[380px]"
                          : "aspect-[16/9]"
                      } w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-black shadow-inner`}
                    >
                      {(() => {
                        const ytId = getYouTubeId(formData.media_url);
                        if (ytId) {
                          return (
                            <iframe
                              src={getYouTubeEmbedUrl(ytId)}
                              title="Live Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                          );
                        }
                        const ttId = getTikTokId(formData.media_url);
                        if (ttId) {
                          return (
                            <iframe
                              src={getTikTokEmbedUrl(ttId)}
                              title="TikTok Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                          );
                        }
                        const gDriveId = getGoogleDriveId(formData.media_url);
                        if (gDriveId) {
                          if (formData.type === "video") {
                            return (
                              <iframe
                                src={getGoogleDriveEmbedUrl(gDriveId)}
                                title="Google Drive Preview"
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              />
                            );
                          }
                          return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={getGoogleDriveImageUrl(gDriveId)}
                              alt="Google Drive Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          );
                        }
                        if (formData.type === "video") {
                          return (
                            <video
                              src={formData.media_url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          );
                        }
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={formData.media_url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Destination Link & CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-ink mb-1.5">
                    Destination Link URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="e.g. /workshops or /scholarships/1"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-ink mb-1.5">
                    Button Label (CTA)
                  </label>
                  <input
                    type="text"
                    value={formData.cta_text || "Join Now"}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="e.g. Join Now, Apply Free"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Close Button Delay / Countdown Settings */}
              <div className="p-4 rounded-2xl bg-powder/40 border border-sky/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-sky-deep" />
                    <label className="text-xs font-bold text-blue-ink">
                      Duration Before &ldquo;X&rdquo; Button Appears
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-sky/20 shadow-sm">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={formData.countdown_seconds ?? 3}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          countdown_seconds: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      className="w-14 text-center font-bold text-sm text-blue-ink outline-none"
                    />
                    <span className="text-xs text-gray-500 font-semibold pr-1">sec</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-gray-500">Quick presets:</span>
                  {[
                    { label: "0s (Instant)", value: 0 },
                    { label: "3s (Default)", value: 3 },
                    { label: "5s", value: 5 },
                    { label: "10s", value: 10 },
                  ].map((preset) => {
                    const isSelected = (formData.countdown_seconds ?? 3) === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, countdown_seconds: preset.value })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-sky-deep text-white shadow-sm scale-105"
                            : "bg-white text-gray-600 hover:bg-sitomo hover:text-sky-deep border border-sky/15"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {(formData.countdown_seconds ?? 3) === 0
                    ? "Visitors can close or dismiss the ad immediately upon opening (no countdown badge)."
                    : `Visitors will see a ${formData.countdown_seconds ?? 3}-second countdown badge before the 'X' button appears to close the popup.`}
                </p>
              </div>

              {/* Priority and Active Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-powder/30 border border-sky/15">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active_toggle"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-deep focus:ring-sky-deep cursor-pointer"
                  />
                  <label htmlFor="is_active_toggle" className="text-xs font-bold text-blue-ink cursor-pointer">
                    Enable Campaign (Active immediately on site)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">Priority:</span>
                  <input
                    type="number"
                    value={formData.priority || 0}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-16 px-2 py-1 text-xs text-center border rounded-lg"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-sky/15 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className={btnSecondary}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className={btnPrimary} disabled={saving}>
                  {saving ? "Saving..." : editingCampaign ? "Save Changes" : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete Campaign?"
        description="Are you sure you want to permanently delete this marketing campaign? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* Toast Notification */}
      {toast && <Toast message={toast} />}
    </div>
  );
}
