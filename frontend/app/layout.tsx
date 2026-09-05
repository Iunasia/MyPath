import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { SavedProvider } from "./context/SavedContext";
import SmoothScroll from "./components/SmoothScroll";
import ScrollToTop from "./components/ScrollToTop";
import SavedToast from "./components/SavedToast";

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
          <SavedProvider>
            <AuthProvider>{children}</AuthProvider>
            <SavedToast />
          </SavedProvider>
        </SmoothScroll>
        <ScrollToTop />
      </body>
    </html>
  );
}
