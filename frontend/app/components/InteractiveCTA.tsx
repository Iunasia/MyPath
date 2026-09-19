"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, ShieldCheck, Compass } from "lucide-react";
import { Button } from "./ui";

export default function InteractiveCTA() {
  const t = useTranslations("interactiveCTA");

  return (
    <section id="start" className="py-10 lg:py-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-blue-ink tracking-tight mb-4 leading-tight">
          {t("title1")} <br />
          <span className="text-[#5B9DA2]">
            {t("titleHighlight")}
          </span>
        </h2>

        <p className="text-sm sm:text-base text-gray-body font-medium leading-relaxed max-w-2xl mx-auto mb-8">
          {t("subtitle")}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pb-8 max-w-3xl mx-auto">
          <Button
            href="/auth/signup"
            size="lg"
            className="w-full sm:w-auto"
          >
            <span>{t("createFreeStudentAccount")}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button
            href="/verify"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            <ShieldCheck className="w-4 h-4 text-sky-deep" aria-hidden="true" />
            <span>{t("testLinkVerifierTool")}</span>
          </Button>
          <Button
            href="#explorers"
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Compass className="w-4 h-4" aria-hidden="true" />
            <span>{t("browseAllPathways")}</span>
          </Button>
        </div>
      </div>
    </section>
  );
}