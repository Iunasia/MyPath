"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  Award,
  Settings,
  Plus,
  Search,
  Trash2,
  Edit3,
  ExternalLink,
  X,
  Check,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Eye,
  Briefcase,
  TrendingUp,
  MapPin,
  Globe,
  Phone,
  ShieldCheck,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Info,
  ArrowUpRight,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import { MAJORS_DATA } from "@/app/data/majors";
import { UNIVERSITIES_DATA } from "@/app/data/universities";
import { SCHOLARSHIPS_DATA } from "@/app/data/scholarships";

/* ── TypeScript Entity Interfaces ──────────────────────────────── */

export interface AdminMajor {
  id: string;
  name: string;
  category: string;
  description: string;
  whatStudentsStudy: string;
  relatedCareers: string;
  requiredSkills: string;
  careerOpportunities: string;
  universities: string;
  jobMarketDemand: "Very High" | "High" | "Growing" | "Moderate";
  reliableSource: string;
  lastUpdated: string;
}

export interface AdminUniversity {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  description: string;
  location: string;
  website: string;
  phone: string;
  programsOffered: string;
  programsCount: number;
  availableScholarships: string;
  scholarshipsCount: number;
  status: "Active" | "Draft";
  lastUpdated: string;
}

export interface AdminScholarship {
  id: string;
  title: string;
  provider: string;
  description: string;
  eligibility: string;
  amountBenefit: string;
  deadline: string;
  applicationLink: string;
  relatedMajor: string;
  status: "Active" | "Closed" | "Upcoming";
  lastUpdated: string;
}

export interface DeletedItem {
  id: string;
  type: "major" | "university" | "scholarship";
  title: string;
  deletedAt: string;
  payload: AdminMajor | AdminUniversity | AdminScholarship;
}

/* ── Category options ─────────────────────────────────────────── */
const MAJOR_CATEGORIES = [
  "Technology & Computing",
  "Business & Management",
  "Engineering & Architecture",
  "Health & Life Sciences",
  "Arts & Humanities",
  "Social Sciences & Law",
];

export default function AdminDashboardPage() {
  // Navigation tabs: 'majors' | 'universities' | 'scholarships'
  const [activeTab, setActiveTab] = useState<"majors" | "universities" | "scholarships">("majors");

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [demandFilter, setDemandFilter] = useState("All");
  const [uniStatusFilter, setUniStatusFilter] = useState("All");
  const [scholarshipStatusFilter, setScholarshipStatusFilter] = useState("All");

  // Notification toast with optional undo action
  const [toastMsg, setToastMsg] = useState<{
    text: string;
    type: "success" | "info" | "error";
    onUndo?: () => void;
  } | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "major" | "university" | "scholarship";
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: "major",
    id: "",
    title: "",
  });

  // Add / Edit Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "major" | "university" | "scholarship";
    mode: "add" | "edit";
    data: any;
  }>({
    isOpen: false,
    type: "major",
    mode: "add",
    data: null,
  });

  // Recent updates counter
  const [recentUpdatesCount, setRecentUpdatesCount] = useState<number>(14);

  // Recently Deleted (Trash / Recycle Bin)
  const [recentlyDeleted, setRecentlyDeleted] = useState<DeletedItem[]>([]);

  // Entities state initialized from datasets
  const [majors, setMajors] = useState<AdminMajor[]>(() => {
    return MAJORS_DATA.map((m) => {
      const demand = m.jobMarketDemand?.includes("Very High")
        ? "Very High"
        : m.jobMarketDemand?.includes("High")
        ? "High"
        : m.jobMarketDemand?.includes("Growing")
        ? "Growing"
        : "Moderate";

      return {
        id: m.id,
        name: m.name,
        category: m.category || "Technology & Computing",
        description: m.description || "",
        whatStudentsStudy: m.whatYouLearn?.map((l) => l.title).join(", ") || "Fundamentals, Core Applications, Advanced Systems",
        relatedCareers: m.careerPathways?.map((c) => c.title).join(", ") || "Specialist, Engineer, Analyst",
        requiredSkills: m.skillsDeveloped?.join(", ") || "Analytical Thinking, Problem Solving",
        careerOpportunities: m.careerOpportunities || "Digital tech firms, banks, government agencies, global outsourcing",
        universities: m.offerUniversities?.map((u) => u.shortName || u.name).join(", ") || "RUPP, ITC, Paragon.U",
        jobMarketDemand: demand as any,
        reliableSource: m.sourceUrl || m.source || "MoEYS Higher Education Guidelines",
        lastUpdated: m.lastVerified || "2026-03-01",
      };
    });
  });

  const [universities, setUniversities] = useState<AdminUniversity[]>(() => {
    return UNIVERSITIES_DATA.map((u) => {
      const allMajors = u.facultiesList?.flatMap((f) => f.majors) || u.popularMajors || [];
      return {
        id: u.id,
        name: u.name,
        shortName: u.shortName,
        logo: u.image || "",
        description: u.description || "",
        location: u.location || "Phnom Penh",
        website: u.website || "",
        phone: u.phone || "+855 23 883 640",
        programsOffered: allMajors.slice(0, 4).join(", ") + (allMajors.length > 4 ? ` +${allMajors.length - 4} more` : ""),
        programsCount: allMajors.length || 12,
        availableScholarships: u.scholarshipsList?.join(", ") || "Merit Scholarship, MoEYS Grants",
        scholarshipsCount: u.scholarshipsList?.length || 2,
        status: "Active",
        lastUpdated: "2026-03-01",
      };
    });
  });

  const [scholarships, setScholarships] = useState<AdminScholarship[]>(() => {
    return SCHOLARSHIPS_DATA.map((s) => ({
      id: s.id,
      title: s.title,
      provider: s.provider,
      description: s.eligibility?.join(". ") || "Official Cambodian undergraduate scholarship program.",
      eligibility: s.eligibility?.join(", ") || "Cambodian High School Graduates (Bac II)",
      amountBenefit: s.coverage || "100% Full Tuition",
      deadline: s.deadline || "2026-08-31",
      applicationLink: s.officialSource || "https://moeys.gov.kh",
      relatedMajor: s.targetMajors?.slice(0, 3).join(", ") || "All STEM & Digital Majors",
      status: "Active",
      lastUpdated: s.lastVerified || "2026-03-01",
    }));
  });

  // Local storage persistence
  useEffect(() => {
    try {
      const savedMajors = localStorage.getItem("domner_admin_majors");
      if (savedMajors) setMajors(JSON.parse(savedMajors));
      const savedUnis = localStorage.getItem("domner_admin_universities");
      if (savedUnis) setUniversities(JSON.parse(savedUnis));
      const savedSchols = localStorage.getItem("domner_admin_scholarships");
      if (savedSchols) setScholarships(JSON.parse(savedSchols));
      const savedUpdates = localStorage.getItem("domner_admin_recent_updates");
      if (savedUpdates) setRecentUpdatesCount(Number(savedUpdates));
      const savedTrash = localStorage.getItem("domner_admin_trash");
      if (savedTrash) setRecentlyDeleted(JSON.parse(savedTrash));
    } catch {
      // Local storage fallback
    }
  }, []);

  const persistData = (type: "majors" | "universities" | "scholarships", data: any) => {
    try {
      if (type === "majors") localStorage.setItem("domner_admin_majors", JSON.stringify(data));
      if (type === "universities") localStorage.setItem("domner_admin_universities", JSON.stringify(data));
      if (type === "scholarships") localStorage.setItem("domner_admin_scholarships", JSON.stringify(data));
      const newUpdates = recentUpdatesCount + 1;
      setRecentUpdatesCount(newUpdates);
      localStorage.setItem("domner_admin_recent_updates", String(newUpdates));
    } catch {
      // Ignore storage errors
    }
  };

  const persistTrash = (trash: DeletedItem[]) => {
    try {
      localStorage.setItem("domner_admin_trash", JSON.stringify(trash));
    } catch {}
  };

  const showToast = (
    text: string,
    type: "success" | "info" | "error" = "success",
    onUndo?: () => void
  ) => {
    setToastMsg({ text, type, onUndo });
    setTimeout(() => {
      setToastMsg((cur) => (cur?.text === text ? null : cur));
    }, 5000);
  };

  // Reset to factory defaults
  const handleResetDefaults = () => {
    localStorage.removeItem("domner_admin_majors");
    localStorage.removeItem("domner_admin_universities");
    localStorage.removeItem("domner_admin_scholarships");
    localStorage.removeItem("domner_admin_recent_updates");
    localStorage.removeItem("domner_admin_trash");
    window.location.reload();
  };

  /* ── Filtered Datasets ───────────────────────────────────────── */

  const filteredMajors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return majors.filter((m) => {
      const matchesQuery =
        q === "" ||
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.relatedCareers.toLowerCase().includes(q) ||
        m.universities.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "All" || m.category === categoryFilter;
      const matchesDemand = demandFilter === "All" || m.jobMarketDemand === demandFilter;
      return matchesQuery && matchesCategory && matchesDemand;
    });
  }, [majors, searchQuery, categoryFilter, demandFilter]);

  const filteredUniversities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return universities.filter((u) => {
      const matchesQuery =
        q === "" ||
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.programsOffered.toLowerCase().includes(q);
      const matchesStatus = uniStatusFilter === "All" || u.status === uniStatusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [universities, searchQuery, uniStatusFilter]);

  const filteredScholarships = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return scholarships.filter((s) => {
      const matchesQuery =
        q === "" ||
        s.title.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.relatedMajor.toLowerCase().includes(q) ||
        s.amountBenefit.toLowerCase().includes(q);
      const matchesStatus = scholarshipStatusFilter === "All" || s.status === scholarshipStatusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [scholarships, searchQuery, scholarshipStatusFilter]);

  /* ── Pagination Logic (10 items per page) ───────────────────── */
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset page when tab or any search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, categoryFilter, demandFilter, uniStatusFilter, scholarshipStatusFilter]);

  const currentTotalItems =
    activeTab === "majors"
      ? filteredMajors.length
      : activeTab === "universities"
      ? filteredUniversities.length
      : filteredScholarships.length;

  const currentTotalPages = Math.max(1, Math.ceil(currentTotalItems / ITEMS_PER_PAGE));

  const paginatedMajors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMajors.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMajors, currentPage]);

  const paginatedUniversities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUniversities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUniversities, currentPage]);

  const paginatedScholarships = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredScholarships.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredScholarships, currentPage]);

  /* ── CRUD Handlers ──────────────────────────────────────────── */

  const handleOpenAdd = (type: "major" | "university" | "scholarship") => {
    let initialData = {};
    if (type === "major") {
      initialData = {
        id: "major-" + Date.now(),
        name: "",
        category: "Technology & Computing",
        description: "",
        whatStudentsStudy: "",
        relatedCareers: "",
        requiredSkills: "",
        careerOpportunities: "",
        universities: "RUPP, ITC, Paragon.U",
        jobMarketDemand: "High",
        reliableSource: "https://moeys.gov.kh",
        lastUpdated: new Date().toISOString().split("T")[0],
      };
    } else if (type === "university") {
      initialData = {
        id: "uni-" + Date.now(),
        name: "",
        shortName: "",
        logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
        description: "",
        location: "Phnom Penh",
        website: "https://",
        phone: "+855 ",
        programsOffered: "",
        programsCount: 10,
        availableScholarships: "Merit Scholarship",
        scholarshipsCount: 1,
        status: "Active",
        lastUpdated: new Date().toISOString().split("T")[0],
      };
    } else {
      initialData = {
        id: "schol-" + Date.now(),
        title: "",
        provider: "",
        description: "",
        eligibility: "Cambodian citizens, Bac II graduates",
        amountBenefit: "100% Full Tuition",
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        applicationLink: "https://",
        relatedMajor: "Computer Science, IT",
        status: "Active",
        lastUpdated: new Date().toISOString().split("T")[0],
      };
    }
    setModalState({ isOpen: true, type, mode: "add", data: initialData });
  };

  const handleOpenEdit = (type: "major" | "university" | "scholarship", item: any) => {
    setModalState({ isOpen: true, type, mode: "edit", data: { ...item } });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const { type, mode, data } = modalState;

    if (type === "major") {
      let updated: AdminMajor[];
      if (mode === "add") {
        updated = [data, ...majors];
        showToast(`Major "${data.name}" added successfully`);
      } else {
        updated = majors.map((m) => (m.id === data.id ? { ...data, lastUpdated: new Date().toISOString().split("T")[0] } : m));
        showToast(`Major "${data.name}" updated successfully`);
      }
      setMajors(updated);
      persistData("majors", updated);
    } else if (type === "university") {
      let updated: AdminUniversity[];
      if (mode === "add") {
        updated = [data, ...universities];
        showToast(`University "${data.name}" added successfully`);
      } else {
        updated = universities.map((u) => (u.id === data.id ? { ...data, lastUpdated: new Date().toISOString().split("T")[0] } : u));
        showToast(`University "${data.name}" updated successfully`);
      }
      setUniversities(updated);
      persistData("universities", updated);
    } else {
      let updated: AdminScholarship[];
      if (mode === "add") {
        updated = [data, ...scholarships];
        showToast(`Scholarship "${data.title}" added successfully`);
      } else {
        updated = scholarships.map((s) => (s.id === data.id ? { ...data, lastUpdated: new Date().toISOString().split("T")[0] } : s));
        showToast(`Scholarship "${data.title}" updated successfully`);
      }
      setScholarships(updated);
      persistData("scholarships", updated);
    }

    setModalState({ ...modalState, isOpen: false });
  };

  /* ── Restore & Delete Logic ───────────────────────────────────── */

  const handleRestoreItem = (item: DeletedItem) => {
    if (item.type === "major") {
      const restored = [item.payload as AdminMajor, ...majors];
      setMajors(restored);
      persistData("majors", restored);
      showToast(`Restored major "${item.title}" successfully`, "success");
    } else if (item.type === "university") {
      const restored = [item.payload as AdminUniversity, ...universities];
      setUniversities(restored);
      persistData("universities", restored);
      showToast(`Restored university "${item.title}" successfully`, "success");
    } else {
      const restored = [item.payload as AdminScholarship, ...scholarships];
      setScholarships(restored);
      persistData("scholarships", restored);
      showToast(`Restored scholarship "${item.title}" successfully`, "success");
    }

    const updatedTrash = recentlyDeleted.filter((t) => t.id !== item.id);
    setRecentlyDeleted(updatedTrash);
    persistTrash(updatedTrash);
  };

  const handleRestoreAll = () => {
    let newMajors = [...majors];
    let newUnis = [...universities];
    let newSchols = [...scholarships];

    recentlyDeleted.forEach((item) => {
      if (item.type === "major") newMajors.unshift(item.payload as AdminMajor);
      if (item.type === "university") newUnis.unshift(item.payload as AdminUniversity);
      if (item.type === "scholarship") newSchols.unshift(item.payload as AdminScholarship);
    });

    setMajors(newMajors);
    persistData("majors", newMajors);
    setUniversities(newUnis);
    persistData("universities", newUnis);
    setScholarships(newSchols);
    persistData("scholarships", newSchols);

    const count = recentlyDeleted.length;
    setRecentlyDeleted([]);
    persistTrash([]);
    setIsTrashOpen(false);
    showToast(`Restored all ${count} items from Recycle Bin`, "success");
  };

  const handleEmptyTrash = () => {
    setRecentlyDeleted([]);
    persistTrash([]);
    showToast("Recycle Bin emptied", "info");
  };

  const handleConfirmDelete = () => {
    const { type, id, title } = deleteConfirm;
    let deletedRecord: any = null;

    if (type === "major") {
      deletedRecord = majors.find((m) => m.id === id);
      const updated = majors.filter((m) => m.id !== id);
      setMajors(updated);
      persistData("majors", updated);
    } else if (type === "university") {
      deletedRecord = universities.find((u) => u.id === id);
      const updated = universities.filter((u) => u.id !== id);
      setUniversities(updated);
      persistData("universities", updated);
    } else {
      deletedRecord = scholarships.find((s) => s.id === id);
      const updated = scholarships.filter((s) => s.id !== id);
      setScholarships(updated);
      persistData("scholarships", updated);
    }

    if (deletedRecord) {
      const trashEntry: DeletedItem = {
        id: `${type}-${id}-${Date.now()}`,
        type,
        title,
        deletedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        payload: deletedRecord,
      };
      const updatedTrash = [trashEntry, ...recentlyDeleted];
      setRecentlyDeleted(updatedTrash);
      persistTrash(updatedTrash);

      // Offer immediate Undo action in the toast!
      showToast(
        `Deleted ${type} "${title}"`,
        "info",
        () => handleRestoreItem(trashEntry)
      );
    }

    setDeleteConfirm({ isOpen: false, type: "major", id: "", title: "" });
  };

  return (
    <div className="min-h-screen bg-powder flex flex-col md:flex-row text-blue-ink font-sans antialiased">
      {/* ── Left Sidebar ────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-white border-r border-sky/20 shrink-0 flex flex-col justify-between select-none">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7AB3B7] to-[#4F868A] flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5 transition-transform group-hover:scale-105" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-800 tracking-tight">DOMNER</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#E1F2F2] text-[#4F868A] tracking-wider uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Education Platform</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <p className="px-3 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Management
            </p>

            <button
              onClick={() => {
                setActiveTab("majors");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "majors"
                  ? "bg-[#E1F2F2] text-[#4F868A] shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className={`w-4 h-4 ${activeTab === "majors" ? "text-[#4F868A]" : "text-slate-400"}`} />
                <span>Majors</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "majors" ? "bg-white text-[#4F868A]" : "bg-slate-100 text-slate-500"}`}>
                {majors.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("universities");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "universities"
                  ? "bg-[#E1F2F2] text-[#4F868A] shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className={`w-4 h-4 ${activeTab === "universities" ? "text-[#4F868A]" : "text-slate-400"}`} />
                <span>Universities</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "universities" ? "bg-white text-[#4F868A]" : "bg-slate-100 text-slate-500"}`}>
                {universities.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("scholarships");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "scholarships"
                  ? "bg-[#E1F2F2] text-[#4F868A] shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className={`w-4 h-4 ${activeTab === "scholarships" ? "text-[#4F868A]" : "text-slate-400"}`} />
                <span>Scholarships</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "scholarships" ? "bg-white text-[#4F868A]" : "bg-slate-100 text-slate-500"}`}>
                {scholarships.length}
              </span>
            </button>

            <div className="pt-4">
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                System & Recovery
              </p>

              {/* Recycle Bin / Restore Button */}
              <button
                onClick={() => setIsTrashOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Recycle Bin</span>
                </div>
                {recentlyDeleted.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                    {recentlyDeleted.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings & Data</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#4F868A] hover:bg-slate-50 rounded-lg transition-colors border border-sky/20"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              View Public Website
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-[#7AB3B7] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">DOMNER Admin</p>
              <p className="text-[10px] text-slate-400 truncate">admin@domner.edu.kh</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-powder/90 backdrop-blur-md border-b border-sky/20 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              Dashboard
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                Live Data
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Manage education opportunities and information
            </p>
          </div>

          <div className="flex items-center gap-3">
            {recentlyDeleted.length > 0 && (
              <button
                onClick={() => setIsTrashOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                title="View deleted items you can restore"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>{recentlyDeleted.length} Deleted (Restore)</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-sky/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Cambodia Catalog Sync
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-sky/20"
              title="Platform Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7AB3B7] to-[#4F868A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                DA
              </div>
            </div>
          </div>
        </header>

        {/* Inner Container */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Toast Notification Banner with UNDO Button */}
          {toastMsg && (
            <div
              className={`flex items-center justify-between px-4 py-3 rounded-xl shadow-sm text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2 ${
                toastMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : toastMsg.type === "info"
                  ? "bg-sky-50 text-sky-800 border border-sky-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{toastMsg.text}</span>
              </div>
              <div className="flex items-center gap-2">
                {toastMsg.onUndo && (
                  <button
                    onClick={() => {
                      toastMsg.onUndo?.();
                      setToastMsg(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-[#4F868A]/30 text-xs font-bold text-[#4F868A] hover:bg-[#E1F2F2] transition-colors shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Undo Delete
                  </button>
                )}
                <button onClick={() => setToastMsg(null)} className="p-1 hover:opacity-75">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── 1. Overview Section: 4 Statistic Cards ──────────────── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Majors */}
            <div
              onClick={() => setActiveTab("majors")}
              className="cursor-pointer bg-white rounded-2xl p-5 border border-sky/20 shadow-xs hover:border-sky hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Majors</span>
                <div className="w-9 h-9 rounded-xl bg-[#E1F2F2] text-[#4F868A] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 tracking-tight">{majors.length}</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> 6 Categories
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Verified high-demand career pathways
              </p>
            </div>

            {/* Card 2: Total Universities */}
            <div
              onClick={() => setActiveTab("universities")}
              className="cursor-pointer bg-white rounded-2xl p-5 border border-sky/20 shadow-xs hover:border-sky hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Universities</span>
                <div className="w-9 h-9 rounded-xl bg-[#F8F3E3] text-[#D97736] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 tracking-tight">{universities.length}</span>
                <span className="text-xs font-semibold text-slate-500">Cambodia Higher Ed</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Public, Private & International institutes
              </p>
            </div>

            {/* Card 3: Active Scholarships */}
            <div
              onClick={() => setActiveTab("scholarships")}
              className="cursor-pointer bg-white rounded-2xl p-5 border border-sky/20 shadow-xs hover:border-sky hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Scholarships</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 tracking-tight">
                  {scholarships.filter((s) => s.status === "Active").length}
                </span>
                <span className="text-xs font-semibold text-emerald-600">Active & Open</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Government, University & Foundation grants
              </p>
            </div>

            {/* Card 4: Recent Updates */}
            <div className="bg-white rounded-2xl p-5 border border-sky/20 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Updates</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 tracking-tight">{recentUpdatesCount}</span>
                <span className="text-xs font-semibold text-[#4F868A]">Modifications</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                CRUD actions logged in local session
              </p>
            </div>
          </section>

          {/* ── 2. Management Section: Tab System ─────────────────── */}
          <div className="bg-white rounded-2xl border border-sky/20 shadow-xs overflow-hidden">
            {/* Tab Navigation Header */}
            <div className="p-4 sm:p-5 border-b border-sky/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-xl max-w-fit">
                <button
                  onClick={() => {
                    setActiveTab("majors");
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "majors"
                      ? "bg-white text-[#4F868A] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Majors</span>
                  <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-[#E1F2F2] text-[#4F868A]">
                    {majors.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("universities");
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "universities"
                      ? "bg-white text-[#4F868A] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Universities</span>
                  <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-[#F8F3E3] text-[#D97736]">
                    {universities.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("scholarships");
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "scholarships"
                      ? "bg-white text-[#4F868A] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Scholarships</span>
                  <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
                    {scholarships.length}
                  </span>
                </button>
              </div>

              {/* Action Button: + Add Entity */}
              <div>
                {activeTab === "majors" && (
                  <button
                    onClick={() => handleOpenAdd("major")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F868A] text-white text-xs font-bold hover:bg-[#3D6B6E] transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Major</span>
                  </button>
                )}
                {activeTab === "universities" && (
                  <button
                    onClick={() => handleOpenAdd("university")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F868A] text-white text-xs font-bold hover:bg-[#3D6B6E] transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add University</span>
                  </button>
                )}
                {activeTab === "scholarships" && (
                  <button
                    onClick={() => handleOpenAdd("scholarship")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F868A] text-white text-xs font-bold hover:bg-[#3D6B6E] transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Scholarship</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search & Filters Subheader */}
            <div className="p-4 bg-sitomo/50 border-b border-sky/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab} by name, keywords, category...`}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#7AB3B7] focus:ring-1 focus:ring-[#7AB3B7] transition-all text-slate-700"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dynamic Filter Dropdowns */}
              <div className="flex items-center gap-2 flex-wrap">
                {activeTab === "majors" && (
                  <>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-[#7AB3B7]"
                    >
                      <option value="All">All Categories</option>
                      {MAJOR_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <select
                      value={demandFilter}
                      onChange={(e) => setDemandFilter(e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-[#7AB3B7]"
                    >
                      <option value="All">All Demand Levels</option>
                      <option value="Very High">Very High</option>
                      <option value="High">High</option>
                      <option value="Growing">Growing</option>
                      <option value="Moderate">Moderate</option>
                    </select>
                  </>
                )}

                {activeTab === "universities" && (
                  <select
                    value={uniStatusFilter}
                    onChange={(e) => setUniStatusFilter(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-[#7AB3B7]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                )}

                {activeTab === "scholarships" && (
                  <select
                    value={scholarshipStatusFilter}
                    onChange={(e) => setScholarshipStatusFilter(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-[#7AB3B7]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                )}
              </div>
            </div>

            {/* ── 3. Table Content ─────────────────────────────────── */}

            {/* TAB 1: MAJORS TABLE */}
            {activeTab === "majors" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-sky/20 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Major Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Related Careers</th>
                      <th className="py-3.5 px-4">Job Demand</th>
                      <th className="py-3.5 px-4">Universities</th>
                      <th className="py-3.5 px-4">Last Updated</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredMajors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="font-semibold text-slate-600">No majors found</p>
                          <p className="text-xs mt-1">Try adjusting your search query or filter.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedMajors.map((major, index) => (
                        <tr key={major.id} className="hover:bg-slate-50/70 transition-colors group">
                          {/* Major Name */}
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-slate-400 shrink-0 min-w-[22px]">
                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}.
                              </span>
                              <div>
                                <span className="font-bold text-slate-800">{major.name}</span>
                                <p className="text-[11px] text-slate-400 font-normal line-clamp-1 max-w-xs">
                                  {major.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                              {major.category}
                            </span>
                          </td>

                          {/* Related Careers */}
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                            {major.relatedCareers || "—"}
                          </td>

                          {/* Job-Market Demand */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                major.jobMarketDemand === "Very High"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : major.jobMarketDemand === "High"
                                  ? "bg-[#E1F2F2] text-[#4F868A] border border-[#8DC4C8]/40"
                                  : major.jobMarketDemand === "Growing"
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {major.jobMarketDemand}
                            </span>
                          </td>

                          {/* Universities */}
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                            {major.universities || "—"}
                          </td>

                          {/* Last Updated */}
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                            {major.lastUpdated}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEdit("major", major)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#4F868A] hover:bg-[#E1F2F2] transition-colors"
                                title="Edit Major"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: "major",
                                    id: major.id,
                                    title: major.name,
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Major"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: UNIVERSITIES TABLE */}
            {activeTab === "universities" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-sky/20 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">University Name</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Programs Offered</th>
                      <th className="py-3.5 px-4">Scholarships</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Last Updated</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredUniversities.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="font-semibold text-slate-600">No universities found</p>
                          <p className="text-xs mt-1">Try adjusting your search query.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedUniversities.map((uni, index) => (
                        <tr key={uni.id} className="hover:bg-slate-50/70 transition-colors group">
                          {/* Name & Shortcode */}
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-slate-400 shrink-0 min-w-[22px]">
                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}.
                              </span>
                              <div>
                                <span className="font-bold text-slate-800 hover:text-[#4F868A] transition-colors">
                                  {uni.name}
                                </span>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-normal">
                                  <span>{uni.shortName}</span>
                                  {uni.website && (
                                    <a
                                      href={uni.website}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[#4F868A] hover:underline flex items-center gap-0.5"
                                    >
                                      Visit site <ArrowUpRight className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{uni.location}</span>
                            </div>
                          </td>

                          {/* Programs Offered */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{uni.programsCount}</span>
                              <span className="text-slate-400 text-[11px] truncate max-w-xs">
                                ({uni.programsOffered})
                              </span>
                            </div>
                          </td>

                          {/* Scholarships */}
                          <td className="py-3.5 px-4 text-slate-600">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                              <Award className="w-3 h-3" />
                              {uni.scholarshipsCount} Available
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {uni.status}
                            </span>
                          </td>

                          {/* Last Updated */}
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                            {uni.lastUpdated}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEdit("university", uni)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#4F868A] hover:bg-[#E1F2F2] transition-colors"
                                title="Edit University"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: "university",
                                    id: uni.id,
                                    title: uni.name,
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete University"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: SCHOLARSHIPS TABLE */}
            {activeTab === "scholarships" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-sky/20 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Scholarship Name</th>
                      <th className="py-3.5 px-4">Provider / University</th>
                      <th className="py-3.5 px-4">Related Major</th>
                      <th className="py-3.5 px-4">Benefit / Amount</th>
                      <th className="py-3.5 px-4">Deadline</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredScholarships.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="font-semibold text-slate-600">No scholarships found</p>
                          <p className="text-xs mt-1">Try adjusting your search query.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedScholarships.map((schol, index) => (
                        <tr key={schol.id} className="hover:bg-slate-50/70 transition-colors group">
                          {/* Name */}
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-slate-400 shrink-0 min-w-[22px]">
                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}.
                              </span>
                              <div>
                                <span className="font-bold text-slate-800 hover:text-[#4F868A] transition-colors">
                                  {schol.title}
                                </span>
                                <p className="text-[11px] text-slate-400 font-normal line-clamp-1 max-w-xs">
                                  {schol.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Provider */}
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px]">
                              {schol.provider}
                            </span>
                          </td>

                          {/* Related Major */}
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                            {schol.relatedMajor || "All Majors"}
                          </td>

                          {/* Benefit */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#4F868A] bg-[#E1F2F2] px-2 py-0.5 rounded-md text-[11px]">
                              {schol.amountBenefit}
                            </span>
                          </td>

                          {/* Deadline */}
                          <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{schol.deadline}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                schol.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : schol.status === "Closed"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  schol.status === "Active"
                                    ? "bg-emerald-500"
                                    : schol.status === "Closed"
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                                }`}
                              ></span>
                              {schol.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEdit("scholarship", schol)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#4F868A] hover:bg-[#E1F2F2] transition-colors"
                                title="Edit Scholarship"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: "scholarship",
                                    id: schol.id,
                                    title: schol.title,
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Scholarship"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer info with Pagination */}
            <div className="p-4 border-t border-sky/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-sitomo/20">
              <div>
                <span>
                  Showing{" "}
                  <span className="font-bold text-slate-800">
                    {currentTotalItems === 0
                      ? 0
                      : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          currentTotalItems
                        )}`}
                  </span>{" "}
                  of <span className="font-bold text-slate-800">{currentTotalItems}</span> records
                </span>
              </div>

              {/* Next / Prev Pagination Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-sky/30 bg-white text-slate-700 hover:bg-sitomo/60 hover:text-[#4F868A] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-xs shadow-2xs"
                  title="Previous 10 items"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: currentTotalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-[#4F868A] text-white shadow-xs"
                          : "bg-white border border-sky/20 text-slate-700 hover:bg-sitomo/60"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(currentTotalPages, p + 1))}
                  disabled={currentPage >= currentTotalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-sky/30 bg-white text-slate-700 hover:bg-sitomo/60 hover:text-[#4F868A] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-xs shadow-2xs"
                  title="Next 10 items"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[11px] text-slate-400 hidden sm:inline">
                DOMNER Catalog Sync
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ── 4. Add / Edit Modal ─────────────────────────────────── */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {modalState.mode === "add" ? "Add New" : "Edit"}{" "}
                  {modalState.type === "major"
                    ? "Major"
                    : modalState.type === "university"
                    ? "University"
                    : "Scholarship"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fill in the verified education details for the DOMNER directory.
                </p>
              </div>
              <button
                onClick={() => setModalState({ ...modalState, isOpen: false })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* MAJOR FORM */}
              {modalState.type === "major" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Major Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={modalState.data?.name || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, name: e.target.value },
                          })
                        }
                        placeholder="e.g. Computer Science"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={modalState.data?.category || "Technology & Computing"}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, category: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      >
                        {MAJOR_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={modalState.data?.description || ""}
                      onChange={(e) =>
                        setModalState({
                          ...modalState,
                          data: { ...modalState.data, description: e.target.value },
                        })
                      }
                      placeholder="Concise overview of what this major is about..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Job-Market Demand
                      </label>
                      <select
                        value={modalState.data?.jobMarketDemand || "High"}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, jobMarketDemand: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      >
                        <option value="Very High">Very High</option>
                        <option value="High">High</option>
                        <option value="Growing">Growing</option>
                        <option value="Moderate">Moderate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Reliable Source URL / Title
                      </label>
                      <input
                        type="text"
                        value={modalState.data?.reliableSource || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, reliableSource: e.target.value },
                          })
                        }
                        placeholder="e.g. MoEYS Guidelines / RUPP Catalog"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">What Students Study</label>
                    <textarea
                      rows={2}
                      value={modalState.data?.whatStudentsStudy || ""}
                      onChange={(e) =>
                        setModalState({
                          ...modalState,
                          data: { ...modalState.data, whatStudentsStudy: e.target.value },
                        })
                      }
                      placeholder="e.g. Data Structures, Algorithms, Software Engineering, Database Systems"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Related Careers</label>
                      <input
                        type="text"
                        value={modalState.data?.relatedCareers || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, relatedCareers: e.target.value },
                          })
                        }
                        placeholder="e.g. Software Engineer, Systems Analyst, IT Lead"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Required Skills</label>
                      <input
                        type="text"
                        value={modalState.data?.requiredSkills || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, requiredSkills: e.target.value },
                          })
                        }
                        placeholder="e.g. Logical Reasoning, Problem Solving, Coding"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Career Opportunities</label>
                    <input
                      type="text"
                      value={modalState.data?.careerOpportunities || ""}
                      onChange={(e) =>
                        setModalState({
                          ...modalState,
                          data: { ...modalState.data, careerOpportunities: e.target.value },
                        })
                      }
                      placeholder="e.g. Banking tech, telecommunications, digital agencies, startups"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Universities Offering</label>
                    <input
                      type="text"
                      value={modalState.data?.universities || ""}
                      onChange={(e) =>
                        setModalState({
                          ...modalState,
                          data: { ...modalState.data, universities: e.target.value },
                        })
                      }
                      placeholder="e.g. RUPP, ITC, Paragon.U, CADT, AUPP"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                    />
                  </div>
                </>
              )}

              {/* UNIVERSITY FORM */}
              {modalState.type === "university" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        University Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={modalState.data?.name || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, name: e.target.value },
                          })
                        }
                        placeholder="e.g. Royal University of Phnom Penh"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Short Name / Acronym <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={modalState.data?.shortName || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, shortName: e.target.value },
                          })
                        }
                        placeholder="e.g. RUPP"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={modalState.data?.location || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, location: e.target.value },
                          })
                        }
                        placeholder="e.g. Russian Federation Blvd, Phnom Penh"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={modalState.data?.phone || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, phone: e.target.value },
                          })
                        }
                        placeholder="e.g. +855 23 883 640"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Website URL</label>
                      <input
                        type="url"
                        value={modalState.data?.website || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, website: e.target.value },
                          })
                        }
                        placeholder="https://www.rupp.edu.kh"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Status</label>
                      <select
                        value={modalState.data?.status || "Active"}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, status: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={modalState.data?.description || ""}
                      onChange={(e) =>
                        setModalState({
                          ...modalState,
                          data: { ...modalState.data, description: e.target.value },
                        })
                      }
                      placeholder="University background and achievements..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Programs / Majors Offered
                    </label>
                    <textarea
                      rows={2}
                      value={modalState.data?.programsOffered || ""}
                      onChange={(e) =>
                        setModalState({
                          ...modalState,
                          data: { ...modalState.data, programsOffered: e.target.value },
                        })
                      }
                      placeholder="e.g. Computer Science, Data Science, Bioengineering, Law"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Available Scholarships</label>
                    <input
                      type="text"
                      value={modalState.data?.availableScholarships || ""}
                      onChange={(e) =>
                        setModalState({
                          ...modalState,
                          data: { ...modalState.data, availableScholarships: e.target.value },
                        })
                      }
                      placeholder="e.g. Techo Digital Talent, MoEYS Scholarship, Merit Grants"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                    />
                  </div>
                </>
              )}

              {/* SCHOLARSHIP FORM */}
              {modalState.type === "scholarship" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Scholarship Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={modalState.data?.title || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, title: e.target.value },
                          })
                        }
                        placeholder="e.g. Techo Digital Talent Scholarship 2026"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Provider / University <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={modalState.data?.provider || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, provider: e.target.value },
                          })
                        }
                        placeholder="e.g. MPTC / CADT"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Benefit / Amount <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={modalState.data?.amountBenefit || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, amountBenefit: e.target.value },
                          })
                        }
                        placeholder="e.g. 100% Full Tuition + Monthly Stipend"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Deadline</label>
                      <input
                        type="text"
                        value={modalState.data?.deadline || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, deadline: e.target.value },
                          })
                        }
                        placeholder="e.g. 2026-08-31"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Related Major(s)</label>
                      <input
                        type="text"
                        value={modalState.data?.relatedMajor || ""}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, relatedMajor: e.target.value },
                          })
                        }
                        placeholder="e.g. AI, Cybersecurity, Software Engineering"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Status</label>
                      <select
                        value={modalState.data?.status || "Active"}
                        onChange={(e) =>
                          setModalState({
                            ...modalState,
                            data: { ...modalState.data, status: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                      >
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                        <option value="Upcoming">Upcoming</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={modalState.data?.description || ""}
                      onChange={(e) =>
                        setModalState({
                          ...modalState,
                          data: { ...modalState.data, description: e.target.value },
                        })
                      }
                      placeholder="Brief background and scope of the scholarship..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Eligibility Criteria</label>
                    <textarea
                      rows={2}
                      value={modalState.data?.eligibility || ""}
                      onChange={(e) =>
                        setModalState({
                          ...modalState,
                          data: { ...modalState.data, eligibility: e.target.value },
                        })
                      }
                      placeholder="e.g. Cambodian national, Grade A, B, or C in Bac II"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Application Link</label>
                    <input
                      type="url"
                      value={modalState.data?.applicationLink || ""}
                      onChange={(e) =>
                        setModalState({
                          ...modalState,
                          data: { ...modalState.data, applicationLink: e.target.value },
                        })
                      }
                      placeholder="https://mptc.gov.kh/scholarship-form"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7AB3B7]"
                    />
                  </div>
                </>
              )}

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalState({ ...modalState, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F868A] text-white font-bold hover:bg-[#3D6B6E] transition-colors shadow-xs"
                >
                  {modalState.mode === "add" ? "Save & Create" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. Delete Confirmation Modal ───────────────────────── */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              Delete {deleteConfirm.type === "major" ? "Major" : deleteConfirm.type === "university" ? "University" : "Scholarship"}?
            </h4>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to delete <span className="font-bold text-slate-700">"{deleteConfirm.title}"</span>?
            </p>
            <div className="mt-3 p-2 bg-emerald-50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-800 flex items-center justify-center gap-1.5 font-medium">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>You can Undo or restore this from the Recycle Bin anytime.</span>
            </div>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, type: "major", id: "", title: "" })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Recycle Bin / Restore Modal ──────────────────────── */}
      {isTrashOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Recycle Bin</h4>
                  <p className="text-[11px] text-slate-400">Restore accidentally deleted items anytime</p>
                </div>
              </div>
              <button
                onClick={() => setIsTrashOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 flex-1 overflow-y-auto space-y-2">
              {recentlyDeleted.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-slate-600">The Recycle Bin is empty</p>
                  <p className="text-xs mt-1">Deleted majors, universities, or scholarships will appear here for safe recovery.</p>
                </div>
              ) : (
                recentlyDeleted.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            item.type === "major"
                              ? "bg-[#E1F2F2] text-[#4F868A]"
                              : item.type === "university"
                              ? "bg-[#F8F3E3] text-[#D97736]"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="font-bold text-slate-800 text-xs truncate">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Deleted at {item.deletedAt}</p>
                    </div>

                    <button
                      onClick={() => handleRestoreItem(item)}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#4F868A]/40 text-xs font-bold text-[#4F868A] hover:bg-[#E1F2F2] transition-colors shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {recentlyDeleted.length > 0 ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRestoreAll}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#4F868A] hover:bg-[#3D6B6E] transition-colors shadow-xs"
                  >
                    Restore All ({recentlyDeleted.length})
                  </button>
                  <button
                    onClick={handleEmptyTrash}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Empty Bin
                  </button>
                </div>
              ) : (
                <div></div>
              )}
              <button
                onClick={() => setIsTrashOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Settings Modal ───────────────────────────────────── */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E1F2F2] text-[#4F868A] flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">Platform Settings</h4>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                <p className="font-bold text-slate-700">DOMNER Education Platform</p>
                <p className="text-slate-500">Version 1.0 (MVP Single-Page Admin)</p>
                <p className="text-slate-400 text-[11px]">Designed for Cambodian Higher Education & Careers</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                <p className="font-bold text-slate-700">Admin Account</p>
                <p className="text-slate-500">DOMNER Super Administrator (admin@domner.edu.kh)</p>
                <p className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active & Authenticated
                </p>
              </div>

              <div className="pt-2">
                <p className="font-bold text-slate-700 mb-1">Data Management & Safety</p>
                <p className="text-slate-500 text-[11px] mb-3">
                  If you ever make unwanted changes or delete items by accident, you can reset to restore the original 12 Cambodian universities, scholarships, and majors catalog.
                </p>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset to Default Cambodian Dataset</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
