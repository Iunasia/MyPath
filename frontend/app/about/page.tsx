import Image from "next/image";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "About Us | Domner",
  description:
    "Domner is an educational digital platform created to help students and youth make clearer, more informed decisions about their future.",
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO IMAGE CONFIGURATION
// You can pass any image link here:
// • An external web URL (e.g. "https://example.com/photo.jpg")
// • A local image path  (e.g. "/images/about/about-hero-clean.png")
// ─────────────────────────────────────────────────────────────────────────────
const HERO_IMAGE_URL =
  "https://public-edsight.ct.gov/-/media/gwc/gradutation.jpg?rev=cc5765b768814d48bd9eef8130f900a8&la=en&h=1598&w=2604&hash=BAE54D7D2716F52A051D0C64E95A7F3B";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-blue-ink flex flex-col">
      <div className="w-full flex-1 px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-10 lg:py-14 flex flex-col justify-center">
        <main className="w-full max-w-4xl lg:max-w-5xl mx-auto flex flex-col">
          {/* ── Top Hero: Photo with organic notch cutout ── */}
          <div className="relative w-full rounded-3xl sm:rounded-[36px] overflow-hidden">
            <Image
              src={HERO_IMAGE_URL}
              alt="Students celebrating graduation"
              width={2604}
              height={1598}
              priority
              unoptimized
              className="w-full h-auto max-h-[420px] md:max-h-[480px] object-cover block select-none pointer-events-none"
            />

            {/* Icon + title nestled in the bottom-left notch */}
            <div className="absolute left-0 bottom-0 bg-white rounded-tr-3xl sm:rounded-tr-[36px] pt-2.5 sm:pt-3.5 md:pt-4 pr-5 sm:pr-7 md:pr-8 pb-1.5 sm:pb-2.5 md:pb-3 pl-2 sm:pl-4 md:pl-5 flex items-center gap-2.5 sm:gap-3.5 md:gap-4">
              {/* Inverted rounded fillet at bottom-right of notch (rounds the photo corner shown in user screenshot) */}
              <svg
                className="absolute bottom-0 left-full w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 pointer-events-none fill-white -ml-[0.5px]"
                viewBox="0 0 32 32"
                aria-hidden="true"
              >
                <path d="M 0 0 C 0 17.673 14.327 32 32 32 L 0 32 Z" />
              </svg>

              {/* Inverted rounded fillet at top-left of notch (rounds the photo corner above the notch) */}
              <svg
                className="absolute bottom-full left-0 w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 pointer-events-none fill-white -mb-[0.5px]"
                viewBox="0 0 32 32"
                aria-hidden="true"
              >
                <path d="M 0 0 C 0 17.673 14.327 32 32 32 L 0 32 Z" />
              </svg>

              <div className="relative h-8 sm:h-11 md:h-14 lg:h-16 aspect-[207/268] shrink-0 flex items-center justify-center">
                <Image
                  src="/images/domner-logo.png"
                  alt="Domner logo"
                  width={60}
                  height={78}
                  className="w-full h-full object-contain"
                />
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-[34px] md:text-[46px] lg:text-[52px] text-[#2BA1B3] tracking-tight leading-none flex items-center">
                About Us
              </h1>
            </div>
          </div>

          {/* ── Content Section directly below the hero ── */}
          <div className="mt-8 sm:mt-10 md:mt-12 space-y-4 sm:space-y-5 md:space-y-6 max-w-4xl">
            {/* Lead Paragraph using site headline font and color */}
            <p className="font-display font-bold text-lg sm:text-xl md:text-2xl text-blue-ink leading-relaxed">
              Domner is an educational digital platform created to help students and youth make clearer, more informed decisions about their future.
            </p>

            {/* Body Paragraph using standard site body font and color */}
            <p className="font-body font-medium text-base sm:text-lg md:text-xl text-gray-body leading-relaxed">
              Whether you are a grade 12 student deciding which major to choose, searching for the right university, looking for scholarships, or exploring future career opportunities, Domner is here to help you navigate your options and find the path that is right for you.
            </p>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}