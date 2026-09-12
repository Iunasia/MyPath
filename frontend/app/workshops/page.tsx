"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Send,
  UserCheck,
  Megaphone,
  ArrowRight,
  UserCircle2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import Footer from "@/app/components/Footer";
import {
  WORKSHOPS_DATA,
  MENTORS_DATA,
  PROMOTE_CONTACT,
  WorkshopItem,
  MentorItem,
} from "@/app/data/workshops";

export default function WorkshopsPage() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopItem | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<MentorItem | null>(null);
  const [showAllMentorsModal, setShowAllMentorsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [inquiryOrg, setInquiryOrg] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");

  const handleRegisterWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisteredSuccess(true);
    setTimeout(() => {
      setRegisteredSuccess(false);
      setSelectedWorkshop(null);
      setRegName("");
      setRegEmail("");
    }, 2000);
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setShowContactModal(false);
      setInquiryOrg("");
      setInquiryMsg("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-powder text-blue-ink flex flex-col">
      {/* ── Page Container (25px mobile, 80px desktop) ── */}
      <div className="w-full flex-1 px-[25px] py-6 sm:px-10 lg:px-[80px] flex flex-col">

        <main className="w-full pb-16 flex flex-col gap-10 sm:gap-12 flex-1">
          {/* ── Hero Title Section ───────────────────────────── */}
          <section className="text-left pt-2 sm:pt-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#5B9DA2] tracking-tight leading-[1.15] mb-2.5">
              Our Services
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-soft font-medium leading-relaxed max-w-xl">
              Empowering your journey with expert-led workshops, personal mentorship, and career opportunities.
            </p>
          </section>

          {/* ── Section 1: Workshops ─────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink tracking-tight">
                Workshops
              </h2>
              <span className="text-xs font-semibold text-sky-deep">
                {WORKSHOPS_DATA.length} Sessions Available
              </span>
            </div>

            {/* Responsive Workshop Cards: 2 cards per row on mobile matching reference image, 3 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
              {WORKSHOPS_DATA.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => setSelectedWorkshop(ws)}
                  className="group flex flex-col rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 bg-white border border-sky/20 bubble-shadow-sm hover:border-sky hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                >
                  {/* Speaker Top Bar */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-2.5 px-1">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-sitomo flex items-center justify-center text-blue-ink overflow-hidden shrink-0 border border-sky/20">
                      {ws.instructor.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ws.instructor.avatar}
                          alt={ws.instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle2 className="w-4 h-4 text-sky-deep" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-[11px] sm:text-xs font-bold text-blue-ink truncate leading-tight group-hover:text-sky-deep transition-colors">
                        {ws.instructor.name}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-gray-soft truncate">
                        {ws.instructor.role}
                      </p>
                    </div>
                  </div>

                  {/* Workshop Poster Frame */}
                  <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 border border-sky/15 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ws.posterImage}
                      alt={ws.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay for high contrast flyer text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

                    {/* Flyer Content Mockup (Matching AUPP Poster from uploaded image) */}
                    <div className="absolute inset-0 p-2.5 sm:p-3 flex flex-col justify-between text-white">
                      <div className="flex items-center justify-end">
                        <span className="bg-white/25 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                          {ws.price}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-tight text-sitomo leading-snug line-clamp-2 drop-shadow-sm">
                          {ws.title}
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-white/90 font-medium mt-0.5 truncate">
                          {ws.date} · {ws.time}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Tap to RSVP hint */}
                  <div className="mt-2.5 pt-2 border-t border-sky/10 flex items-center justify-between px-1 text-[10px] sm:text-xs">
                    <span className="text-emerald-700 font-bold">
                      {ws.seatsLeft} seats left
                    </span>
                    <span className="text-sky-deep font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Lower Row: Mentorship & Promote With Us ───────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* ── Section 2: Mentorship Card ─────────────────── */}
            <section className="rounded-3xl bg-white border border-sky/15 p-6 sm:p-7 bubble-shadow-sm flex flex-col justify-between">
              <div>
                {/* Header Icon + Titles */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-momo/80 flex items-center justify-center shrink-0 border border-momo/60 shadow-2xs">
                    <UserCheck className="w-6 h-6 text-sky-deep" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                      Mentorship
                    </h2>
                    <p className="text-xs text-gray-body leading-relaxed mt-1 font-medium">
                      Get personal guidance from experienced mentors to explore your career path.
                    </p>
                  </div>
                </div>

                {/* Mentor List Items */}
                <div className="space-y-3 mb-6">
                  {MENTORS_DATA.slice(0, 2).map((mentor) => (
                    <button
                      key={mentor.id}
                      onClick={() => setSelectedMentor(mentor)}
                      className="w-full text-left rounded-2xl border border-sky/35 hover:border-sky p-3 sm:p-3.5 flex items-center justify-between transition-all bg-white hover:bg-sitomo/10 group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-sky/30 overflow-hidden bg-sitomo/40 shrink-0">
                          {mentor.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={mentor.avatar}
                              alt={mentor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-sitomo" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display text-sm font-bold text-blue-ink group-hover:text-sky-deep transition-colors truncate">
                            {mentor.name}
                          </h3>
                          <p className="text-xs text-gray-soft truncate font-medium">
                            {mentor.role}
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="w-5 h-5 text-blue-ink group-hover:text-sky-deep group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              {/* View All Mentors Outlined Button */}
              <button
                onClick={() => setShowAllMentorsModal(true)}
                className="w-full py-2.5 sm:py-3 rounded-full border border-sky text-sky-deep hover:bg-sky hover:text-white text-xs sm:text-sm font-bold transition-all text-center cursor-pointer shadow-2xs"
              >
                View All Mentors
              </button>
            </section>

            {/* ── Section 3: Promote With Us Card ────────────── */}
            <section className="rounded-3xl bg-white border border-sky/15 p-6 sm:p-7 bubble-shadow-sm flex flex-col justify-between">
              <div>
                {/* Header Icon + Titles */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-momo/80 flex items-center justify-center shrink-0 border border-momo/60 shadow-2xs">
                    <Megaphone className="w-6 h-6 text-sky-deep" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                      Promote With Us
                    </h2>
                    <p className="text-xs text-gray-body leading-relaxed mt-1 font-medium">
                      Want to promote your university, workshop, or educational opportunity?
                    </p>
                  </div>
                </div>

                {/* Contact List */}
                <div className="space-y-3.5 mb-6 text-xs sm:text-sm font-semibold text-blue-ink">
                  <a
                    href={`tel:${PROMOTE_CONTACT.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-3 text-gray-body hover:text-sky-deep transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-sitomo/40 flex items-center justify-center shrink-0 text-sky-deep">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>{PROMOTE_CONTACT.phone}</span>
                  </a>

                  <a
                    href={`mailto:${PROMOTE_CONTACT.email}`}
                    className="flex items-center gap-3 text-gray-body hover:text-sky-deep transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-sitomo/40 flex items-center justify-center shrink-0 text-sky-deep">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>{PROMOTE_CONTACT.email}</span>
                  </a>

                  <a
                    href={PROMOTE_CONTACT.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-body hover:text-sky-deep transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-sitomo/40 flex items-center justify-center shrink-0 text-sky-deep">
                      <Send className="w-4 h-4" />
                    </div>
                    <span>{PROMOTE_CONTACT.telegram}</span>
                  </a>
                </div>
              </div>

              {/* Filled Contact Us Button */}
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full py-3 sm:py-3.5 rounded-full bg-[#7AB3B7] hover:bg-sky-deep text-white text-xs sm:text-sm font-bold transition-all text-center shadow-xs cursor-pointer"
              >
                Contact Us
              </button>
            </section>
          </div>
        </main>
      </div>

      {/* ── Modal 1: Workshop Detail & Registration ───────── */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative border border-sky/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedWorkshop(null);
                setRegisteredSuccess(false);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 flex items-center justify-center text-blue-ink hover:bg-sitomo cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-sitomo text-sky-deep text-[11px] font-bold uppercase tracking-wider mb-2">
                {selectedWorkshop.institution}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                {selectedWorkshop.title}
              </h3>
            </div>

            {/* Poster Preview */}
            <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-4 bg-slate-900 border border-sky/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedWorkshop.posterImage}
                alt={selectedWorkshop.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Key Schedule Information */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-powder border border-sky/15 text-xs mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-deep shrink-0" />
                <span className="font-semibold text-blue-ink">{selectedWorkshop.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-deep shrink-0" />
                <span className="font-semibold text-blue-ink">{selectedWorkshop.time}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="w-4 h-4 text-sky-deep shrink-0" />
                <span className="font-semibold text-blue-ink">{selectedWorkshop.location}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-body leading-relaxed mb-4 font-medium">
              {selectedWorkshop.description}
            </p>

            {/* Highlights */}
            <div className="space-y-1.5 mb-6">
              {selectedWorkshop.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-blue-ink font-medium">
                  <CheckCircle2 className="w-4 h-4 text-sky-deep shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* RSVP Form */}
            {registeredSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800 font-bold text-sm">
                🎉 Registration confirmed! Check your email for event access.
              </div>
            ) : (
              <form onSubmit={handleRegisterWorkshop} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sky/25 text-xs text-blue-ink focus:outline-none focus:ring-2 focus:ring-sky"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sky/25 text-xs text-blue-ink focus:outline-none focus:ring-2 focus:ring-sky"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-sky hover:bg-sky-bright text-white font-bold text-sm transition-colors cursor-pointer shadow-sm"
                >
                  Reserve My Seat (Free RSVP)
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Modal 2: All Mentors Directory ───────────────── */}
      {showAllMentorsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative border border-sky/20 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowAllMentorsModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 flex items-center justify-center text-blue-ink hover:bg-sitomo cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-ink">
                Verified Academic Mentors
              </h3>
              <p className="text-xs text-gray-soft mt-1">
                Book a 1-on-1 career or university exploration consultation.
              </p>
            </div>

            <div className="space-y-3">
              {MENTORS_DATA.map((mentor) => (
                <div
                  key={mentor.id}
                  className="rounded-2xl border border-sky/25 p-4 flex flex-col gap-3 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky/30 bg-sitomo shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-blue-ink">
                        {mentor.name}
                      </h4>
                      <p className="text-xs text-sky-deep font-semibold">
                        {mentor.role} · {mentor.organization}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-body leading-relaxed font-medium">
                    {mentor.bio}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-sky/10">
                    <span className="text-[11px] text-emerald-700 font-bold">
                      ● {mentor.availableSessions}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowAllMentorsModal(false);
                      }}
                      className="px-4 py-1.5 rounded-full bg-sky text-white text-xs font-bold hover:bg-sky-bright transition-colors cursor-pointer"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 3: Mentor Booking ──────────────────────── */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 relative border border-sky/20 shadow-2xl">
            <button
              onClick={() => setSelectedMentor(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 flex items-center justify-center text-blue-ink hover:bg-sitomo cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky/30 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedMentor.avatar}
                  alt={selectedMentor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-blue-ink">
                  {selectedMentor.name}
                </h3>
                <p className="text-xs text-gray-soft">{selectedMentor.role}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-powder border border-sky/15 text-xs text-blue-ink mb-4">
              <p className="font-bold text-sky-deep mb-1">Focus Area:</p>
              <p className="font-medium">{selectedMentor.specialty}</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-body leading-relaxed font-medium">
                Select your preferred inquiry topic and our team will connect you via Telegram or Email within 24 hours.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  className="p-2 rounded-xl border border-sky/30 hover:border-sky bg-sitomo/20 text-blue-ink font-bold text-center"
                >
                  Major Choice
                </button>
                <button
                  type="button"
                  className="p-2 rounded-xl border border-sky/30 hover:border-sky bg-sitomo/20 text-blue-ink font-bold text-center"
                >
                  Scholarship Essay
                </button>
              </div>

              <a
                href={PROMOTE_CONTACT.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#7AB3B7] hover:bg-sky-deep text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                Connect on Telegram
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 4: Promote With Us Inquiry ─────────────── */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 relative border border-sky/20 shadow-2xl">
            <button
              onClick={() => {
                setShowContactModal(false);
                setInquirySubmitted(false);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sitomo/50 flex items-center justify-center text-blue-ink hover:bg-sitomo cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-momo/80 flex items-center justify-center shrink-0">
                <Megaphone className="w-4.5 h-4.5 text-sky-deep" />
              </div>
              <h3 className="font-display text-lg font-bold text-blue-ink">
                Promote on Domner
              </h3>
            </div>

            <p className="text-xs text-gray-body leading-relaxed mb-4 font-medium">
              Feature your academic workshops, university admissions, or scholarships to thousands of active students across Cambodia.
            </p>

            {inquirySubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800 font-bold text-sm">
                Message received! Our team will contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="University / Organization Name"
                  value={inquiryOrg}
                  onChange={(e) => setInquiryOrg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky/25 text-xs text-blue-ink focus:outline-none focus:ring-2 focus:ring-sky"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about the event or program you wish to promote..."
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky/25 text-xs text-blue-ink focus:outline-none focus:ring-2 focus:ring-sky resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#7AB3B7] hover:bg-sky-deep text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
                >
                  Send Inquiry
                </button>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-sky/15 flex items-center justify-center gap-4 text-xs font-bold text-gray-soft">
              <a
                href={PROMOTE_CONTACT.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-deep flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-sky-deep" />
                Telegram Support
              </a>
              <span>·</span>
              <a
                href={`tel:${PROMOTE_CONTACT.phone.replace(/\s+/g, "")}`}
                className="hover:text-sky-deep flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-sky-deep" />
                Hotline
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}

