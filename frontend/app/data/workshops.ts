export interface WorkshopItem {
  id: string;
  title: string;
  instructor: {
    name: string;
    role: string;
    avatar?: string;
  };
  institution: string;
  date: string;
  time: string;
  location: string;
  format: "In-Person" | "Online Webinar" | "Hybrid";
  price: "Free" | string;
  seatsLeft: number;
  posterImage: string;
  description: string;
  highlights: string[];
  registrationUrl?: string;
}

export interface MentorItem {
  id: string;
  name: string;
  role: string;
  organization: string;
  avatar: string;
  specialty: string;
  bio: string;
  availableSessions: string;
}

export interface PromoteContact {
  phone: string;
  email: string;
  telegram: string;
  telegramUrl: string;
}

/* ── Workshops Data ─────────────────────────────────────── */
export const WORKSHOPS_DATA: WorkshopItem[] = [
  {
    id: "discover-aupp-majors-scholarships",
    title: "Discover AUPP: Majors & Scholarships 2026",
    instructor: {
      name: "Dr. Sad",
      role: "Academic Advisor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    },
    institution: "American University of Phnom Penh (AUPP)",
    date: "18th March 2026",
    time: "3:00 PM - 5:00 PM",
    location: "AUPP Campus, Phnom Penh & Zoom Live",
    format: "Hybrid",
    price: "Free",
    seatsLeft: 14,
    posterImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80",
    description:
      "Join Dr. Sad for an exclusive deep dive into dual-degree accreditation, dual-major pathways, and full tuition merit scholarships available for the 2026 academic year.",
    highlights: [
      "Overview of US-accredited dual degree programs",
      "Step-by-step scholarship application breakdown",
      "Direct Q&A with admissions officers and alumni",
    ],
  },
  {
    id: "cadt-ai-software-masterclass",
    title: "CADT: AI & Software Engineering Career Roadmap",
    instructor: {
      name: "Dr. Sopheak",
      role: "Academic Advisor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    },
    institution: "Cambodia Academy of Digital Technology (CADT)",
    date: "22nd March 2026",
    time: "9:00 AM - 11:30 AM",
    location: "CADT Innovation Center & Online Stream",
    format: "Hybrid",
    price: "Free",
    seatsLeft: 8,
    posterImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80",
    description:
      "Explore Cambodia's digital industry demands, technical competencies required for high-paying software careers, and Techo Digital Talent Fellowships.",
    highlights: [
      "Industry tech stack overview for 2026",
      "Hands-on portfolio building advice",
      "Techo Scholarship exam preparation tips",
    ],
  },
  {
    id: "paragon-design-robotics-open-lab",
    title: "Paragon.U: Hands-on Robotics & UI/UX Design Sprint",
    instructor: {
      name: "Ms. Bopha Chan",
      role: "Design Lead & Mentor",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    },
    institution: "Paragon International University",
    date: "29th March 2026",
    time: "1:30 PM - 4:30 PM",
    location: "Paragon.U FabLab & Design Studio",
    format: "In-Person",
    price: "Free",
    seatsLeft: 12,
    posterImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1000&auto=format&fit=crop&q=80",
    description:
      "Experience practical prototyping in robotics and user experience design with Paragon faculty and current scholarship recipients.",
    highlights: [
      "Live 3D printing & microcontroller demo",
      "Figma user interface workshop for beginners",
      "Campus tour and scholarship portfolio review",
    ],
  },
];

/* ── Mentors Data ───────────────────────────────────────── */
export const MENTORS_DATA: MentorItem[] = [
  {
    id: "dr-sopheak",
    name: "Dr. Sopheak",
    role: "Academic Advisor",
    organization: "National Higher Education Council",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    specialty: "STEM & Digital Curriculum Selection",
    bio: "Over 12 years advising students on university transitions, major selections, and graduate scholarship essays.",
    availableSessions: "3 slots open this week",
  },
  {
    id: "ms-bopha-chan",
    name: "Ms. Bopha Chan",
    role: "Academic Advisor",
    organization: "Cambodian Education Pathway Initiative",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    specialty: "International Scholarships & Career Strategy",
    bio: "Fulbright alumna specializing in scholarship interviews, resume refinement, and major-to-career alignment.",
    availableSessions: "2 slots open this week",
  },
  {
    id: "mr-rithy-sovann",
    name: "Mr. Rithy Sovann",
    role: "Tech Industry Mentor",
    organization: "Senior Engineer & Tech Founder",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    specialty: "Software Engineering & Startup Career",
    bio: "Mentoring high school and university students preparing for careers in fintech, artificial intelligence, and startup leadership.",
    availableSessions: "4 slots open this week",
  },
];

/* ── Promote Contact Details ────────────────────────────── */
export const PROMOTE_CONTACT: PromoteContact = {
  phone: "+855 12 345 678",
  email: "hello@mypath.com",
  telegram: "@MyPathTeam",
  telegramUrl: "https://t.me/MyPathTeam",
};

