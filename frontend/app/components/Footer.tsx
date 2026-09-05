import Link from "next/link";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  const footerSections = [
    {
      heading: "Explore",
      links: [
        { label: "Careers", href: "/careers" },
        { label: "Majors", href: "/majors" },
        { label: "Universities", href: "/universities" },
        { label: "Scholarships", href: "/scholarships" },
      ],
    },
    {
      heading: "Tools",
      links: [
        { label: "Compare", href: "#" },
        { label: "Information Check", href: "#" },
        { label: "Deadline Tracker", href: "#" },
        { label: "Saved Opportunities", href: "#" },
      ],
    },
    {
      heading: "About",
      links: [
        { label: "About Domner", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Use", href: "#" },
        { label: "Contact", href: "#" },
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
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky text-white text-xs font-bold font-display">
                D
              </span>
              <span className="font-display text-base font-bold text-blue-ink">
                Domner
              </span>
            </Link>
            <p className="text-sm text-gray-body leading-relaxed font-medium">
              A Digital Information Literacy platform helping students make informed
              decisions about their future.
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
                    <Link
                      href={l.href}
                      className="hover:text-sky-deep transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 border-t border-sky/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-faint font-medium">
            &copy; 2026 Domner. Built to help students navigate digital information responsibly.
          </p>
          <p className="text-xs text-gray-faint font-medium">
            A Digital Information Literacy project.
          </p>
        </div>
      </div>
    </footer>
  );
}

