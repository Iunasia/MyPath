import { Link } from "@/src/i18n";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  const t = useTranslations("footer");

  const exploreSection = {
    heading: t("explore"),
    links: [
      { label: t("careers"), href: "/careers" },
      { label: t("majors"), href: "/majors" },
      { label: t("universities"), href: "/universities" },
      { label: t("scholarships"), href: "/scholarships" },
      { label: t("opportunity"), href: "/opportunities" },
      { label: "Verify", href: "/verify" },
    ],
  };

  const toolsSection = {
    heading: t("tools"),
    links: [
      { label: t("informationCheck"), href: "/verify" },
      { label: t("savedOpportunities"), href: "/saved" },
      { label: t("adminPortal"), href: "/admin" },
    ],
  };

  const aboutSection = {
    heading: t("about"),
    links: [
      { label: t("aboutDomner"), href: "/about" },
      { label: t("privacyPolicy"), href: "#" },
      { label: t("termsOfUse"), href: "#" },
      { label: t("contact"), href: "#" },
    ],
  };

  return (
    <footer
      className={`relative overflow-hidden bg-gradient-to-b from-[#EBF5F5] via-[#E2F0F1] to-[#D8ECEE] dark:from-[#0B1215] dark:via-[#0E161A] dark:to-[#080E11] border-t border-[#B9DCDE] dark:border-white/10 mt-auto transition-colors ${className}`}
    >
      {/* Top luminous accent highlight */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#7AB3B7]/70 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Ambient soft lighting glows */}
      <div
        className="absolute -top-20 right-1/4 w-80 h-80 rounded-full bg-white/50 dark:bg-white/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-[#7AB3B7]/20 dark:bg-[#7AB3B7]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle geometric dot pattern */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#6B9EA2_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.14] dark:opacity-[0.05] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full px-[25px] sm:px-10 lg:px-[80px] pt-12 pb-14 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-8 sm:mb-10">
          {/* Brand Info */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <div className="relative w-8 h-8 shrink-0 flex items-center justify-center p-0.5 rounded-lg bg-white/80 dark:bg-white/10 border border-[#7AB3B7]/20 dark:border-white/10 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/images/logo.png"
                  alt="Domner Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-display text-lg font-extrabold text-blue-ink dark:text-white tracking-tight">
                Domner
              </span>
            </Link>
            <p className="text-sm text-gray-body dark:text-gray-300 leading-relaxed font-medium max-w-sm mb-4">
              {t("brandDescription")}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-white/5 text-sky-deep dark:text-sky-bright border border-[#7AB3B7]/30 dark:border-white/10 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F7377] dark:bg-[#7AB3B7]" />
              <span>{t("project")}</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Column 1: Explore */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-ink dark:text-white mb-3.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3F7377] dark:bg-[#7AB3B7] shrink-0" />
                <span>{exploreSection.heading}</span>
              </p>
              <ul className="space-y-1 text-sm text-gray-body dark:text-gray-300 font-medium">
                {exploreSection.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("#") || l.href.startsWith("http") ? (
                      <a
                        href={l.href}
                        className="inline-block py-1 hover:text-[#3F7377] dark:hover:text-white transition-colors duration-150"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="inline-block py-1 hover:text-[#3F7377] dark:hover:text-white transition-colors duration-150"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Tools (and on mobile, also About directly below Tools) */}
            <div className="space-y-6 sm:space-y-0">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-ink dark:text-white mb-3.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3F7377] dark:bg-[#7AB3B7] shrink-0" />
                  <span>{toolsSection.heading}</span>
                </p>
                <ul className="space-y-1 text-sm text-gray-body dark:text-gray-300 font-medium">
                  {toolsSection.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("#") || l.href.startsWith("http") ? (
                        <a
                          href={l.href}
                          className="inline-block py-1 hover:text-[#3F7377] dark:hover:text-white transition-colors duration-150"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          href={l.href}
                          className="inline-block py-1 hover:text-[#3F7377] dark:hover:text-white transition-colors duration-150"
                        >
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mobile-only About block sitting neatly inside Column 2 */}
              <div className="sm:hidden pt-4 border-t border-[#B9DCDE]/70 dark:border-white/10">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-ink dark:text-white mb-3.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3F7377] dark:bg-[#7AB3B7] shrink-0" />
                  <span>{aboutSection.heading}</span>
                </p>
                <ul className="space-y-1 text-sm text-gray-body dark:text-gray-300 font-medium">
                  {aboutSection.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("#") || l.href.startsWith("http") ? (
                        <a
                          href={l.href}
                          className="inline-block py-1 hover:text-[#3F7377] dark:hover:text-white transition-colors duration-150"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          href={l.href}
                          className="inline-block py-1 hover:text-[#3F7377] dark:hover:text-white transition-colors duration-150"
                        >
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 3: About (Tablet & Desktop only) */}
            <div className="hidden sm:block">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-ink dark:text-white mb-3.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3F7377] dark:bg-[#7AB3B7] shrink-0" />
                <span>{aboutSection.heading}</span>
              </p>
              <ul className="space-y-1 text-sm text-gray-body dark:text-gray-300 font-medium">
                {aboutSection.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("#") || l.href.startsWith("http") ? (
                      <a
                        href={l.href}
                        className="inline-block py-1 hover:text-[#3F7377] dark:hover:text-white transition-colors duration-150"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="inline-block py-1 hover:text-[#3F7377] dark:hover:text-white transition-colors duration-150"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#B9DCDE]/80 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-soft dark:text-gray-400 font-medium pr-16 sm:pr-0">
          <p className="leading-relaxed">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-gray-faint dark:text-gray-500 shrink-0">
            {t("project")}
          </p>
        </div>
      </div>
    </footer>
  );
}
