"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function InformationCheckDemo() {
  const t = useTranslations("infoCheckDemo");
  const [isScamView, setIsScamView] = useState(false);

  return (
    <div className="rounded-3xl bg-white border-2 border-sky/20 p-6 sm:p-7 bubble-shadow relative overflow-hidden transition-all duration-300">
      {/* Subtle Switcher */}
      <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-sky/15">
        <span className="text-xs font-bold text-gray-faint">
          {t("interactiveSample")}
        </span>
        <div className="inline-flex p-1 rounded-full bg-powder/80 border border-sky/20">
          <button
            type="button"
            onClick={() => setIsScamView(false)}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              !isScamView
                ? "bg-white text-blue-ink shadow-xs"
                : "text-gray-soft hover:text-blue-ink"
            }`}
          >
            {t("verified")}
          </button>
          <button
            type="button"
            onClick={() => setIsScamView(true)}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sitomo flex items-center justify-center text-sky-deep font-extrabold text-xs shrink-0 border border-sky/20">
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
          <div className="rounded-2xl bg-powder/60 border border-sky/15 p-4 mb-4">
            <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-sky/15 text-[11px] font-bold text-sky-deep">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <FileCheck2 className="w-3.5 h-3.5" />
                {t("informationCheck")}
              </span>
              <span className="text-gray-soft flex items-center gap-1">
                <CalendarCheck className="w-3 h-3 text-sky-deep" />
                {t("auditedDate")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[11px] text-gray-faint font-semibold uppercase">{t("source")}</p>
                <p className="font-bold text-blue-ink mt-0.5">{t("sourceValue")}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-faint font-semibold uppercase">{t("provider")}</p>
                <p className="font-bold text-blue-ink mt-0.5">{t("providerValue")}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-faint font-semibold uppercase">{t("accreditation")}</p>
                <p className="font-bold text-blue-ink mt-0.5">{t("accreditationValue")}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-faint font-semibold uppercase">{t("status")}</p>
                <p className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("validated")}
                </p>
              </div>
            </div>
          </div>

          {/* Reassurance text */}
          <div className="rounded-2xl bg-momo/80 border border-momo p-3.5 mb-5">
            <p className="text-xs font-bold text-blue-ink flex items-center gap-1.5 mb-0.5">
              <ShieldCheck className="w-4 h-4 text-sky-deep shrink-0" />
              {t("whyTrustListing")}
            </p>
            <p className="text-xs text-gray-body leading-relaxed">
              {t("whyTrustDesc")}
            </p>
          </div>

          {/* Single clean action button */}
          <a
            href="https://www.rupp.edu.kh"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-sky-deep px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-sky-dark transition-all bubble-shadow-sm"
          >
            <span>{t("visitOfficialPortal")}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div>
          {/* Scam Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 font-extrabold text-base shrink-0 border border-rose-200">
                ⚠️
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
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              {t("scamFlagged")}
            </span>
          </div>

          {/* Scam Warnings List */}
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 mb-4">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{t("dmilScamWarnings")}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-rose-700">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>{t("scamWarning1")}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>{t("scamWarning2")}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-500 font-bold">✕</span>
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

          {/* Single clean action button */}
          <Link
            href="/verify"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-rose-700 transition-all shadow-xs"
          >
            <span>{t("scanOnVerifier")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
