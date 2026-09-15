"use client";

import { useState } from "react";
import { Link } from "@/src/i18n";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  FileCheck2,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./ui";

export default function InformationCheckDemo({ className = "" }: { className?: string }) {
  const t = useTranslations("infoCheckDemo");
  const [isScamView, setIsScamView] = useState(false);

  return (
    <div className={`rounded-3xl bg-white dark:bg-panel border border-sky/20 dark:border-white/10 p-6 sm:p-7 bubble-shadow relative overflow-hidden flex flex-col justify-between ${className}`}>
      {/* Subtle Switcher */}
      <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-sky/15 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-deep animate-pulse" aria-hidden="true" />
          <span className="text-xs font-bold text-gray-faint">
            {t("interactiveSample")}
          </span>
        </div>
        <div
          className="inline-flex p-1 rounded-full bg-powder/80 dark:bg-panel-raised border border-sky/20 dark:border-white/10"
          role="group"
          aria-label={t("interactiveSample")}
        >
          <button
            type="button"
            onClick={() => setIsScamView(false)}
            aria-pressed={!isScamView}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              !isScamView
                ? "bg-white dark:bg-panel text-blue-ink shadow-xs"
                : "text-gray-soft hover:text-blue-ink"
            }`}
          >
            {t("verified")}
          </button>
          <button
            type="button"
            onClick={() => setIsScamView(true)}
            aria-pressed={isScamView}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              isScamView
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-soft hover:text-rose-600"
            }`}
          >
            {t("scamAlert")}
          </button>
        </div>
      </div>

      {!isScamView ? (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sitomo dark:bg-sitomo/40 flex items-center justify-center text-sky-deep font-extrabold text-xs shrink-0 border border-sky/20 dark:border-white/10">
                  RUPP
                </div>
                <div>
                  <p className="font-display text-base font-bold text-blue-ink leading-snug">
                    {t("ruppGrant")}
                  </p>
                  <p className="text-xs text-gray-faint font-medium">
                    {t("ruppProvider")}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                {t("verifiedLabel")}
              </span>
            </div>

            {/* Clean 4-Grid Specs */}
            <div className="rounded-2xl bg-powder/60 dark:bg-panel-raised/60 border border-sky/15 dark:border-white/10 p-4 mb-4">
              <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-sky/15 dark:border-white/10 text-[11px] font-bold text-sky-deep">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
                  {t("informationCheck")}
                </span>
                <span className="text-gray-soft flex items-center gap-1">
                  <CalendarCheck className="w-3 h-3 text-sky-deep" aria-hidden="true" />
                  {t("auditedDate")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[11px] text-gray-faint font-semibold uppercase tracking-wider">{t("source")}</p>
                  <p className="font-bold text-blue-ink mt-1 truncate">{t("sourceValue")}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-faint font-semibold uppercase tracking-wider">{t("provider")}</p>
                  <p className="font-bold text-blue-ink mt-1 truncate">{t("providerValue")}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-faint font-semibold uppercase tracking-wider">{t("accreditation")}</p>
                  <p className="font-bold text-blue-ink mt-1 truncate">{t("accreditationValue")}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-faint font-semibold uppercase tracking-wider">{t("status")}</p>
                  <p className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {t("validated")}
                  </p>
                </div>
              </div>
            </div>

            {/* Reassurance text */}
            <div className="rounded-2xl bg-momo/80 dark:bg-sitomo/30 border border-momo dark:border-white/10 p-3.5 mb-5">
              <p className="text-xs font-bold text-blue-ink flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-4 h-4 text-sky-deep shrink-0" aria-hidden="true" />
                {t("whyTrustListing")}
              </p>
              <p className="text-xs text-gray-body leading-relaxed">
                {t("whyTrustDesc")}
              </p>
            </div>
          </div>

          {/* Single clean action button */}
          <Button
            href="https://www.rupp.edu.kh"
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            className="w-full mt-2"
          >
            <span>{t("visitOfficialPortal")}</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Scam Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 font-extrabold text-base shrink-0 border border-rose-200">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-blue-ink leading-snug">
                    {t("scamTitle")}
                  </p>
                  <p className="text-xs text-rose-600 font-medium">
                    {t("scamProvider")}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-xs shrink-0">
                <XCircle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                {t("scamFlagged")}
              </span>
            </div>

            {/* Scam Warnings List */}
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 mb-4">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />
                <span>{t("dmilScamWarnings")}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-rose-700">
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold" aria-hidden="true">✕</span>
                  <span>{t("scamWarning1")}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold" aria-hidden="true">✕</span>
                  <span>{t("scamWarning2")}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold" aria-hidden="true">✕</span>
                  <span>{t("scamWarning3")}</span>
                </li>
              </ul>
            </div>

            {/* Protection tip */}
            <div className="rounded-2xl bg-momo/80 border border-momo p-3.5 mb-5">
              <p className="text-xs font-bold text-blue-ink mb-0.5">
                {t("howDomnerProtects")}
              </p>
              <p className="text-xs text-gray-body leading-relaxed">
                {t("howDomnerProtectsDesc")}
              </p>
            </div>
          </div>

          {/* Single clean action button */}
          <Link
            href="/verify"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-xs sm:text-sm font-bold text-white hover:bg-rose-700 transition-colors shadow-xs mt-2"
          >
            <span>{t("scanOnVerifier")}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}