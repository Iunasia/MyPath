import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { SavedProvider } from "./context/SavedContext";
import { CompareProvider } from "./context/CompareContext";
import SmoothScroll from "./components/SmoothScroll";
import ScrollToTop from "./components/ScrollToTop";
import SavedToast from "./components/SavedToast";
import CompareTray from "./components/CompareTray";
import SiteHeader from "./components/SiteHeader";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Domner — Navigate Your Future with Confidence",
  description:
    "Domner helps students discover, evaluate, verify, and compare digital information about careers, majors, universities, and scholarships so they can make informed decisions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <SmoothScroll>
          <AuthProvider>
            <SavedProvider>
              <CompareProvider>
                {/* One header for the whole site, mounted once so it stays put
                    while pages change. Named, so the page crossfade below
                    leaves it still instead of fading it with the page. */}
                <ViewTransition name="site-header">
                  <SiteHeader />
                </ViewTransition>
                <ViewTransition>{children}</ViewTransition>
                <SavedToast />
                <CompareTray />
              </CompareProvider>
            </SavedProvider>
          </AuthProvider>
        </SmoothScroll>
        <ScrollToTop />
      </body>
    </html>
  );
}
