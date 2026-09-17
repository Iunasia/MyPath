import { Link } from "@/src/i18n";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  const t = useTranslations("footer");

  const footerSections = [
    {
      heading: t("explore"),
      links: [
        { label: t("careers"), href: "/careers" },
        { label: t("majors"), href: "/majors" },
        { label: t("universities"), href: "/universities" },
        { label: t("scholarships"), href: "/scholarships" },
        { label: "Workshops", href: "/workshops" },
        { label: "Verify", href: "/verify" },
      ],
    },
    {
      heading: t("tools"),
      links: [
        { label: t("informationCheck"), href: "/verify" },
        { label: t("savedOpportunities"), href: "/saved" },
        { label: t("adminPortal"), href: "/admin" },
      ],
    },
    {
      heading: t("about"),
      links: [
        { label: t("aboutDomner"), href: "/about" },
        { label: t("privacyPolicy"), href: "#" },
        { label: t("termsOfUse"), href: "#" },
        { label: t("contact"), href: "#" },
      ],
    },
  ];

  return (
    <footer className={`py-12 bg-white border-t border-sky/10 mt-auto ${className}`}>
      <div className="w-full px-[25px] sm:px-10 lg:px-[80px]">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
                <Image
                  src="/images/domner-logo.png"
                  alt="Domner Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-display text-base font-bold text-blue-ink">
                Domner
              </span>
            </Link>
            <p className="text-sm text-gray-body leading-relaxed font-medium">
              {t("brandDescription")}
            </p>
          </div>

          {/* Nav Columns */}
          {footerSections.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-ink mb-3">
                {col.heading}
              </p>
              <ul className="space-y-2 text-sm text-gray-body font-medium">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("#") || l.href.startsWith("http") ? (
                      <a
                        href={l.href}
                        className="hover:text-sky-deep transition-colors"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="hover:text-sky-deep transition-colors"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-sky/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-soft font-medium">
          <p>
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-gray-faint">
            {t("project")}
          </p>
        </div>
      </div>
    </footer>
  );
}
