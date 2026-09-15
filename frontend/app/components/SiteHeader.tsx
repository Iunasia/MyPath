"use client";

import { usePathname } from "@/src/i18n";
import Header, { type HeaderProps } from "./Header";
import { SkipLink } from "./ui";

const SECTIONS: Record<string, NonNullable<HeaderProps["activeNav"]>> = {
  careers: "careers",
  majors: "majors",
  universities: "universities",
  scholarships: "scholarships",
  workshops: "workshops",
  verify: "verify",
  saved: "saved",
};

/**
 * The one header, rendered from the root layout so it stays mounted while
 * pages change underneath it. When every page rendered its own copy, each
 * navigation tore the header down and built it again, and the bar flickered.
 * Admin has its own sidebar and the sign-in pages have none.
 */
export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const section = pathname.split("/")[1] ?? "";

  if (section === "admin" || section === "auth") return <SkipLink />;

  return (
    <>
      <SkipLink />
      <Header variant={pathname === "/" ? "home" : "default"} activeNav={SECTIONS[section]} />
    </>
  );
}
