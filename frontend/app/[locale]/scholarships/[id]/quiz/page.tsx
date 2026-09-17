"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "@/src/i18n";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  ListFilter,
  X,
} from "lucide-react";
import {
  QUIZ_SUBJECTS,
  CADT_TECHO_SUBJECTS,
  CADT_TECHO_QUESTIONS,
  QUIZ_LEVELS,
  QUIZ_QUESTIONS,
  isCadtTechoScholarship,
  type QuizLevel,
  type QuizSubject,
} from "@/app/data/quiz";
import { SCHOLARSHIPS_DATA } from "@/app/data/scholarships";
import Footer from "@/app/components/Footer";

export default function ScholarshipQuizPage() {
  const routeParams = useParams();
  const id = typeof routeParams?.id === "string" ? routeParams.id : "";

  // Check if this is the Techo Digital Talent Scholarship 2026 (CADT)
  const isCadt = useMemo(() => isCadtTechoScholarship(id), [id]);

  // Find associated scholarship for context & navigation
  const scholarship = useMemo(() => {
    return (
      SCHOLARSHIPS_DATA.find(
        (s) =>
          s.id.toLowerCase() === id.toLowerCase() ||
          String(s.id) === id ||
          (id === "techo-digital-talent-cadt-2026" && s.id === "techo-digital-talent-2026")
      ) ?? {
        id: id || "techo-digital-talent-2026",
        title: "Techo Digital Talent Scholarship 2026",
        provider: "CADT / MPTC",
      }
    );
  }, [id]);

  // Derive concise institution/scholarship name for heading (e.g., CADT, Paragon.U, PUC, AUPP, etc.)
  const targetName = useMemo(() => {
    if (!scholarship) return "your scholarship";
    const { title = "", provider = "", id = "" } = scholarship;

    const lowerId = id.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const lowerProvider = provider.toLowerCase();

    // Specific university / scholarship mappings
    if (lowerId.includes("cadt") || lowerTitle.includes("cadt") || lowerProvider.includes("cadt") || lowerTitle.includes("techo digital")) {
      return "CADT";
    }
    if (lowerId.includes("dmu") || lowerTitle.includes("dmu") || lowerProvider.includes("de montfort")) {
      return "DMUC";
    }
    if (lowerId.includes("camtech") || lowerTitle.includes("camtech") || lowerProvider.includes("camtech")) {
      return "CamTech";
    }
    if (lowerId.includes("camed") || lowerTitle.includes("camed") || lowerProvider.includes("camed")) {
      return "CamEd";
    }
    if (lowerTitle.includes("uyfc") || lowerProvider.includes("uyfc") || lowerId.includes("uyfc")) {
      return "UYFC";
    }
    if (lowerTitle.includes("paragon") || lowerProvider.includes("paragon") || lowerId.includes("paragon")) {
      return "Paragon.U";
    }
    if (lowerTitle.includes("puc") || lowerProvider.includes("puc") || lowerId.includes("puc") || lowerProvider.includes("paññāsāstra") || lowerProvider.includes("pannasastra")) {
      return "PUC";
    }
    if (lowerTitle.includes("aupp") || lowerProvider.includes("aupp") || lowerId.includes("aupp")) {
      return "AUPP";
    }
    if (lowerTitle.includes("itc") || lowerProvider.includes("itc") || lowerId.includes("itc") || lowerProvider.includes("institute of technology of cambodia")) {
      return "ITC";
    }
    if (lowerTitle.includes("rupp") || lowerProvider.includes("rupp") || lowerId.includes("rupp") || lowerProvider.includes("royal university of phnom penh")) {
      return "RUPP";
    }
    if (lowerTitle.includes("smart") || lowerProvider.includes("smart") || lowerId.includes("smart")) {
      return "SmartEdu";
    }
    if (lowerTitle.includes("mptc") || lowerProvider.includes("mptc") || lowerId.includes("mptc")) {
      return "MPTC";
    }
    if (lowerTitle.includes("rufa") || lowerProvider.includes("rufa") || lowerId.includes("rufa")) {
      return "RUFA";
    }
    if (lowerTitle.includes("rua") || lowerProvider.includes("rua") || lowerId.includes("rua")) {
      return "RUA";
    }
    if (lowerTitle.includes("puthisastra") || lowerProvider.includes("puthisastra") || lowerId.split("-").includes("up")) {
      return "UP";
    }
    if (lowerTitle.includes("num") || lowerProvider.includes("national university of management") || lowerId.includes("num")) {
      return "NUM";
    }
    if (
      lowerTitle.includes("university of cambodia") ||
      lowerProvider.includes("university of cambodia") ||
      lowerProvider.includes("(uc)") ||
      lowerId.split("-").includes("uc")
    ) {
      return "UC";
    }

    const parenMatch = provider.match(/\(([A-Z0-9.\-_]+)\)/i);
    if (parenMatch) return parenMatch[1];

    if (provider.includes("/")) {
      const part = provider.split("/")[0].trim();
      if (part.length <= 15) return part;
    }

    const cleanedTitle = title
      .replace(/\b202\d\b/g, "")
      .replace(/\b(Scholarship|Fellowship|Grant|Vision\s+\d+)\b/gi, "")
      .trim();

    return cleanedTitle || provider || "your exam";
  }, [scholarship]);

  // Available subjects: exactly 3 core subjects
  const availableSubjects = useMemo(() => {
    return isCadt ? CADT_TECHO_SUBJECTS : QUIZ_SUBJECTS;
  }, [isCadt]);

  // Single Page Unified State: Subject, Level, Answers, and Submission status
  const [selectedSubject, setSelectedSubject] = useState<QuizSubject | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<QuizLevel | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dropdown open states for both pills
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);

  // Element refs for outside click detection and smooth scrolling
  const subjectDropdownRef = useRef<HTMLDivElement>(null);
  const levelDropdownRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(target)
      ) {
        setIsSubjectOpen(false);
      }
      if (
        levelDropdownRef.current &&
        !levelDropdownRef.current.contains(target)
      ) {
        setIsLevelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter questions matching chosen subject + level
  const activeQuestions = useMemo(() => {
    if (!selectedSubject || !selectedLevel) return [];
    const pool = isCadt ? CADT_TECHO_QUESTIONS : QUIZ_QUESTIONS;

    if (selectedLevel === "all") {
      return pool.filter((q) => q.subjectId === selectedSubject.id);
    }

    const matched = pool.filter(
      (q) => q.subjectId === selectedSubject.id && q.level === selectedLevel
    );

    // Fallback: If exact match has no questions, show all available for this subject
    if (matched.length === 0) {
      return pool.filter((q) => q.subjectId === selectedSubject.id);
    }
    return matched;
  }, [selectedSubject, selectedLevel, isCadt]);

  // Count answered questions
  const answeredCount = useMemo(() => {
    return Object.keys(selectedAnswers).length;
  }, [selectedAnswers]);

  // Calculate score on submit
  const score = useMemo(() => {
    let correct = 0;
    activeQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  }, [activeQuestions, selectedAnswers]);

  // Score percentage
  const percentage =
    activeQuestions.length > 0 ? Math.round((score / activeQuestions.length) * 100) : 0;

  // Handlers
  const handleSelectSubject = (subject: QuizSubject) => {
    setSelectedSubject(subject);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setIsSubjectOpen(false);

    // If level is not selected yet, prompt user by opening level dropdown
    if (!selectedLevel) {
      setIsLevelOpen(true);
    } else {
      setTimeout(() => {
        questionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleSelectLevel = (level: QuizLevel) => {
    setSelectedLevel(level);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setIsLevelOpen(false);

    // Smooth scroll down to questions when both inputs are selected
    if (selectedSubject) {
      setTimeout(() => {
        questionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleSelectOption = (questionId: string, optionId: "A" | "B" | "C" | "D") => {
    if (isSubmitted) return; // Prevent changing after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    questionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    questionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleResetFilters = () => {
    setSelectedSubject(null);
    setSelectedLevel(null);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setIsSubjectOpen(false);
    setIsLevelOpen(false);
  };

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col justify-between">
      {/* ── Main Viewport Container with signature 80px Desktop Margins ── */}
      <div className="w-full flex-1 px-[25px] py-6 sm:px-8 md:px-10 lg:px-[80px] flex flex-col">
        <div className="w-full flex flex-col">

          {/* ── Top Navigation Bar ────────────────────────────── */}
          <div className="w-full flex items-center justify-between gap-4 mb-6 sm:mb-8">
            <Link
              href={scholarship?.id ? `/scholarships/${scholarship.id}` : "/scholarships"}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-sky-deep hover:text-blue-ink transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>

            {(selectedSubject || selectedLevel) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-gray-soft hover:text-rose-600 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* ── Page Header ───────────────────────────────────── */}
          <div className="text-left mb-8">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-ink tracking-tight mb-2.5">
              Ready for {targetName}? Let&apos;s test your skills.
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-body font-normal max-w-2xl">
              Practice Mathematics, Logical Reasoning, IQ, and English questions to see where you stand and prepare with confidence.
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════
              FILTER BAR (Exact Pill Style: [ ☰ Choose subjects ] [ ☰ Choose level ])
          ══════════════════════════════════════════════════════ */}
          <div className="flex flex-wrap items-center justify-start gap-3.5 sm:gap-5 mb-10">

            {/* ── Pill 1: Choose subjects ────────────────────── */}
            <div ref={subjectDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSubjectOpen((prev) => !prev);
                  setIsLevelOpen(false);
                }}
                className={`flex items-center gap-3 px-6 sm:px-7 py-3 rounded-full border-2 transition-all cursor-pointer select-none ${
                  selectedSubject
                    ? "border-sky-deep bg-white text-blue-ink font-semibold shadow-xs"
                    : isSubjectOpen
                    ? "border-sky-deep bg-white/90 text-blue-ink font-medium shadow-xs"
                    : "border-sky bg-white/60 hover:bg-white text-blue-ink font-medium"
                }`}
              >
                <ListFilter className="w-5 h-5 text-blue-ink stroke-[2.2] shrink-0" />
                <span className="text-sm sm:text-base tracking-normal">
                  {selectedSubject ? selectedSubject.name : "Choose subjects"}
                </span>
                {selectedSubject && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSubject(null);
                      setSelectedAnswers({});
                      setIsSubmitted(false);
                    }}
                    className="ml-1 text-gray-400 hover:text-rose-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
                    title="Clear subject"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>

              {/* Subject Dropdown Menu */}
              {isSubjectOpen && (
                <div className="absolute top-full mt-2.5 left-0 min-w-[240px] sm:min-w-[280px] bg-white rounded-2xl border border-gray-200/80 shadow-xl shadow-black/10 p-4 sm:p-5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex flex-col gap-3">
                    {availableSubjects.map((sub) => {
                      const isSelected = selectedSubject?.id === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSelectSubject(sub)}
                          className={`w-full text-left text-base sm:text-lg transition-colors cursor-pointer ${
                            isSelected
                              ? "font-bold text-blue-ink"
                              : "font-normal text-blue-ink/90 hover:text-sky-deep"
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Pill 2: Choose level ──────────────────────── */}
            <div ref={levelDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsLevelOpen((prev) => !prev);
                  setIsSubjectOpen(false);
                }}
                className={`flex items-center gap-3 px-6 sm:px-7 py-3 rounded-full border-2 transition-all cursor-pointer select-none ${
                  selectedLevel
                    ? "border-sky-deep bg-white text-blue-ink font-semibold shadow-xs"
                    : isLevelOpen
                    ? "border-sky-deep bg-white/90 text-blue-ink font-medium shadow-xs"
                    : "border-sky bg-white/60 hover:bg-white text-blue-ink font-medium"
                }`}
              >
                <ListFilter className="w-5 h-5 text-blue-ink stroke-[2.2] shrink-0" />
                <span className="text-sm sm:text-base tracking-normal">
                  {selectedLevel
                    ? selectedLevel === "all"
                      ? "All Levels"
                      : `${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} Level`
                    : "Choose level"}
                </span>
                {selectedLevel && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLevel(null);
                      setSelectedAnswers({});
                      setIsSubmitted(false);
                    }}
                    className="ml-1 text-gray-400 hover:text-rose-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
                    title="Clear level"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>

              {/* Level Dropdown Menu */}
              {isLevelOpen && (
                <div className="absolute top-full mt-2.5 left-0 min-w-[200px] sm:min-w-[240px] bg-white rounded-2xl border border-gray-200/80 shadow-xl shadow-black/10 p-4 sm:p-5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex flex-col gap-3">
                    {QUIZ_LEVELS.map((lvl) => {
                      const isSelected = selectedLevel === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => handleSelectLevel(lvl.id)}
                          className={`w-full text-left text-base sm:text-lg transition-colors cursor-pointer ${
                            isSelected
                              ? "font-bold text-blue-ink"
                              : "font-normal text-blue-ink/90 hover:text-sky-deep"
                          }`}
                        >
                          {lvl.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Reset Button if any filter active */}
            {(selectedSubject || selectedLevel) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-soft hover:text-rose-600 px-3.5 py-2.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer"
                title="Reset selection"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

          </div>

          {/* ═══════════════════════════════════════════════════
              QUESTIONS DISPLAY AREA (On the Same Page)
          ══════════════════════════════════════════════════════ */}
          <div ref={questionsRef} className="w-full flex flex-col scroll-mt-6">
            {/* Case 1: Both Subject & Level are NOT selected yet */}
            {(!selectedSubject || !selectedLevel) && (
              <div className="bg-white/80 backdrop-blur-xs rounded-3xl p-10 sm:p-14 border border-sky/20 text-center bubble-shadow-sm">
                <div className="w-14 h-14 rounded-full bg-sitomo flex items-center justify-center mx-auto mb-4 border border-sky/25 text-sky-deep">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-blue-ink mb-2">
                  {!selectedSubject
                    ? "Step 1: Choose a Subject Above"
                    : "Step 2: Choose a Difficulty Level Above"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-body max-w-md mx-auto leading-relaxed">
                  {!selectedSubject
                    ? "Click 'Choose subjects' above to select Mathematics, Logical Reasoning & IQ, or English."
                    : `Great! Now click 'Choose level' above to display the practice questions for ${selectedSubject.name}.`}
                </p>
              </div>
            )}

            {/* Case 2: Subject & Level are BOTH selected -> Show Questions on this page */}
            {selectedSubject && selectedLevel && (
              <div className="flex flex-col gap-6">

                {/* Score Banner (Visible upon submission) */}
                {isSubmitted && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky/20 bubble-shadow-sm text-center">
                    <div className="w-14 h-14 rounded-full bg-sitomo flex items-center justify-center mx-auto mb-3.5 border border-sky/20">
                      <Trophy className="w-7 h-7 text-sky-deep" />
                    </div>

                    <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full bg-sitomo text-sky-deep mb-2">
                      {selectedSubject.name} · Level: {selectedLevel.toUpperCase()}
                    </span>

                    <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-ink tracking-tight mb-2">
                      Score: {score} / {activeQuestions.length} ({percentage}%)
                    </h2>

                    <p className="text-sm sm:text-base font-bold text-sky-deep mb-2">
                      {percentage >= 80
                        ? "Outstanding! You are highly prepared for this subject."
                        : percentage >= 50
                        ? "Good Job! Review the step-by-step explanations below to master every question."
                        : "Keep Practicing! Read the detailed explanations below to strengthen your fundamentals."}
                    </p>

                    <p className="text-xs sm:text-sm text-gray-soft max-w-md mx-auto mb-5">
                      Review each question below to see the correct answer, your pick, and full explanations.
                    </p>

                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleRetake}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-sky-deep text-sky-deep font-bold text-xs sm:text-sm hover:bg-sitomo/60 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retake Quiz</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Question Section Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-sitomo text-sky-deep">
                      {selectedSubject.name}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white border border-sky/20 text-blue-ink bubble-shadow-sm">
                      Level: {selectedLevel}
                    </span>
                  </div>

                  <span className="text-xs sm:text-sm font-extrabold text-blue-ink">
                    {activeQuestions.length} Practice Questions Available
                  </span>
                </div>

                {/* List of Questions */}
                {activeQuestions.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-sky/20 text-center">
                    <HelpCircle className="w-10 h-10 text-sky-deep mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-blue-ink mb-1">
                      No questions loaded for this level
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-body mb-4">
                      Please select another difficulty level or choose All Levels.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedLevel("all")}
                      className="px-5 py-2 rounded-full bg-[#7AB3B7] text-white text-xs font-bold hover:bg-[#68A1A5] transition-all cursor-pointer"
                    >
                      View All Questions
                    </button>
                  </div>
                ) : (
                  activeQuestions.map((q, index) => {
                    const studentAnswer = selectedAnswers[q.id];
                    const isCorrect = studentAnswer === q.correctAnswer;

                    return (
                      <div
                        key={q.id}
                        className="bg-white rounded-3xl p-6 sm:p-8 border border-sky/20 bubble-shadow-sm transition-all"
                      >
                        {/* Question Top Bar: Question Number, Topic, Correctness */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-sky/15 mb-4">
                          <div className="flex items-center gap-2.5">
                            <span className="font-display text-sm sm:text-base font-extrabold text-blue-ink">
                              Question {index + 1} of {activeQuestions.length}
                            </span>

                            {q.topic && (
                              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sitomo text-sky-deep border border-sky/20">
                                {q.topic}
                              </span>
                            )}
                          </div>

                          {/* Submission correctness badge */}
                          {isSubmitted && (
                            <div>
                              {isCorrect ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                                  <XCircle className="w-3.5 h-3.5" /> Incorrect
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Question Statement */}
                        <h3 className="font-display text-base sm:text-lg font-bold text-blue-ink mb-5 leading-relaxed">
                          {q.question}
                        </h3>

                        {/* Options (A, B, C, D) */}
                        <div className="flex flex-col gap-2.5 mb-2">
                          {q.options.map((option) => {
                            const isOptionSelected = studentAnswer === option.id;
                            const isTheCorrectOne = q.correctAnswer === option.id;

                            // Dynamic styling depending on whether submitted or not
                            let optionStyle =
                              "bg-white border-gray-200 text-gray-body hover:border-sky/50 hover:bg-gray-50/70";
                            let pillStyle = "bg-gray-100 text-gray-600";

                            if (!isSubmitted) {
                              if (isOptionSelected) {
                                optionStyle =
                                  "bg-sitomo/50 border-sky-deep text-blue-ink font-bold shadow-xs";
                                pillStyle = "bg-sky-deep text-white shadow-xs";
                              }
                            } else {
                              // Submitted mode
                              if (isTheCorrectOne) {
                                optionStyle =
                                  "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
                                pillStyle = "bg-emerald-600 text-white";
                              } else if (isOptionSelected && !isCorrect) {
                                optionStyle =
                                  "bg-rose-50 border-rose-300 text-rose-900 font-bold";
                                pillStyle = "bg-rose-600 text-white";
                              } else {
                                optionStyle =
                                  "bg-gray-50/60 border-gray-200 text-gray-400 opacity-60";
                                pillStyle = "bg-gray-200 text-gray-500";
                              }
                            }

                            return (
                              <button
                                key={option.id}
                                type="button"
                                disabled={isSubmitted}
                                onClick={() => handleSelectOption(q.id, option.id)}
                                className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border-2 transition-all text-left ${
                                  isSubmitted ? "cursor-default" : "cursor-pointer"
                                } ${optionStyle}`}
                              >
                                <span
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 transition-colors ${pillStyle}`}
                                >
                                  {option.id}
                                </span>

                                <span className="text-xs sm:text-sm font-semibold flex-1 leading-snug">
                                  {option.text}
                                </span>

                                {isSubmitted && isTheCorrectOne && (
                                  <span className="text-[10px] uppercase font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
                                    Correct Answer
                                  </span>
                                )}

                                {isSubmitted && isOptionSelected && !isCorrect && (
                                  <span className="text-[10px] uppercase font-extrabold text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-300 shrink-0">
                                    Your Pick
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Step-by-Step Explanation (Revealed on submit) */}
                        {isSubmitted && (
                          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-powder border border-sky/20 text-xs sm:text-sm text-gray-body leading-relaxed">
                            <strong className="font-bold text-sky-deep mr-1.5">
                              Explanation:
                            </strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Bottom Submit Action Button (When not submitted yet) */}
                {!isSubmitted && activeQuestions.length > 0 && (
                  <div className="flex justify-end pt-2 pb-6">
                    <button
                      type="button"
                      disabled={answeredCount === 0}
                      onClick={handleSubmit}
                      className={`px-8 py-3.5 rounded-full text-sm font-bold transition-all ${
                        answeredCount === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-[#7AB3B7] text-white hover:bg-[#68A1A5] shadow-md shadow-sky-950/20 cursor-pointer"
                      }`}
                    >
                      Submit Answer
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
