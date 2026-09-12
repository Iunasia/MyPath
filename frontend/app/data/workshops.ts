export interface WorkshopItem {
  id: string;
  category: "Workshop" | "Competition" | "Leadership Program" | "Training" | string;
  title: string;
  organization: string;
  description: string;
  role: string;
  requirement: string;
  benefit: string;
  location: string;
  date: string;
  deadline: string;
  applicationLink: string;
  source: string;
  posterImage: string;
  price?: string;
  format?: "In-Person" | "Online Webinar" | "Hybrid" | "Online / Showcase";
  time?: string;
  instructor?: {
    name: string;
    role: string;
    avatar?: string;
  };
  institution?: string;
  seatsLeft?: number | string;
  highlights?: string[];
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

/* ── Workshops & Opportunities Data (From Official Verified Registry) ── */
export const WORKSHOPS_DATA: WorkshopItem[] = [
  {
    id: "green-season-video-competition-2026",
    category: "Competition",
    title: "Video Competition – “Visit Cambodia in Green Season 2026”",
    organization: "Ministry of Tourism",
    description:
      "Create promotional videos highlighting Cambodia's tourism potential and natural beauty under the Green Season 2026 theme.",
    role: "Contestant / Video Creator",
    requirement: "Video submission before deadline, 18 years old and above.",
    benefit:
      "1st Place: 8,000,000 Riels + trophy, certificate, gifts/vouchers, Creator Ambassador title, and LED/billboard promo. 2nd Place: 4,000,000 Riels + trophy. 3rd Place: 2,000,000 Riels + trophy. Top 10 special category awards & souvenirs for all participants.",
    location: "Cambodia (Online Submission)",
    date: "Stated in application link",
    deadline: "21 September 2026",
    applicationLink: "https://www.tnaot.app/green-season?lang=km",
    source: "https://www.facebook.com/100064523029158/posts/1491112229716197/",
    posterImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1000&auto=format&fit=crop&q=80",
    price: "Free Entry",
    format: "Online / Showcase",
    time: "Before 11:59 PM",
    highlights: [
      "8,000,000 KHR First Prize & National Broadcast",
      "Official Creator Ambassador designation from Ministry of Tourism",
      "Nationwide billboard and digital LED promotion",
    ],
  },
  {
    id: "journey-beyond-workshop-tsa",
    category: "Workshop",
    title: "A Journey Beyond Workshop",
    organization: "Techo Digital Scholarship Student Association (TSA)",
    description:
      "Workshop providing participants with an opportunity for digital skills development, university transition insights, and networking with senior scholars.",
    role: "Participant",
    requirement: "No requirement — open to all university and high school students.",
    benefit:
      "Build connections with senior students and alumni from diverse tech majors; learn insider tips for scholarship applications; receive practical academic advice.",
    location: "AUPP University, Phnom Penh",
    date: "5 September 2026",
    deadline: "Maximum capacity reached upon RSVP",
    applicationLink: "https://forms.gle/VUo9fnitucCxporJ6",
    source: "https://www.facebook.com/61591337463254/posts/122117541225377915/",
    posterImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80",
    price: "Free",
    format: "In-Person",
    time: "2:00 PM - 5:00 PM",
    highlights: [
      "Direct networking with Techo Digital Scholarship recipients",
      "Application roadmap for Cambodian top scholarships",
      "Interactive Q&A session with alumni across engineering & tech",
    ],
  },
  {
    id: "free-ux-ui-workshop-siem-reap",
    category: "Workshop",
    title: "Free UX/UI Workshop in Siem Reap",
    organization: "Sisters of Code × USEA Job Center",
    description:
      "Free interactive workshop opportunity for participants interested in learning digital product design, user interface principles, and creative career pathways.",
    role: "Participant",
    requirement: "No requirement — suitable for beginners and aspiring designers.",
    benefit:
      "Learn essential UX/UI career skills; hear expert industry insights from Senior UX/UI Designer Ms. Sokun Bopha; free admission in Siem Reap.",
    location: "USEA Job Center, Siem Reap",
    date: "30 August 2026",
    deadline: "Maximum capacity reached upon RSVP",
    applicationLink: "https://forms.gle/a2fLcqjJcK8CkHGr5",
    source: "https://www.facebook.com/sistersofcode/posts/pfbid02cydMU6zw88YtM6YbAWLxpuR88GLb4jkJLLyXvYF5jkNhrg9MABdFCPuF1bjWkwNWl",
    posterImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80",
    price: "Free",
    format: "In-Person",
    time: "9:00 AM - 12:00 PM",
    highlights: [
      "Hands-on Figma user interface prototyping",
      "Speaker session with Senior Designer Ms. Sokun Bopha",
      "Free career guidance certificate upon completion",
    ],
  },
  {
    id: "cambodia-nationwide-odoo-rupp-pitch-cup",
    category: "Competition",
    title: "Cambodia Nationwide Odoo × RUPP Pitch Cup",
    organization: "Odoo × RUPP",
    description:
      "Nationwide pitching competition where university students solve real-world business challenges, learn global ERP software, and compete for cash prizes.",
    role: "Pitcher / Contestant",
    requirement:
      "Open to students from any university in Cambodia. Form a team of 3 from the same school. Must attend the on-site round in person at CJCC, RUPP.",
    benefit:
      "1st Winner: $1,000 USD; 2nd Winner: $600 USD; 3rd Winner: $400 USD; Consolation (x2): $200 USD. Hands-on global software experience and elite networking.",
    location: "CJCC, RUPP, Phnom Penh",
    date: "2 October 2026",
    deadline: "2 October 2026",
    applicationLink: "https://www.odoo.com/event/pitch-cup-2026-12279/register",
    source: "https://www.facebook.com/story.php?story_fbid=1087405047193803&id=100077729520512",
    posterImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1000&auto=format&fit=crop&q=80",
    price: "Free Entry",
    format: "In-Person",
    time: "8:00 AM - 5:00 PM",
    highlights: [
      "$2,400 USD total cash prize pool",
      "Official Odoo ERP business software certification",
      "Direct recruitment opportunities with leading tech sponsors",
    ],
  },
  {
    id: "8-week-leadership-journey-iatss-japan",
    category: "Leadership Program",
    title: "8-Week Leadership Journey in Japan",
    organization: "IATSS FORUM",
    description:
      "Eight-week prestigious international leadership development program taking place in Japan focused on climate justice, sustainable policy, and human security.",
    role: "Participant",
    requirement:
      "National of Cambodia; aged 35 or under; at least 2 years of full-time professional experience; available for May–July 2027 or September–November 2027.",
    benefit:
      "Fully funded 8-week leadership program in Japan including flights, accommodation, and stipend. Field studies in Yokkaichi, Hiroshima, and Kamaishi.",
    location: "Suzuka, Hiroshima & Kamaishi, Japan",
    date: "May–July 2027 or Sep–Nov 2027",
    deadline: "30 September 2026",
    applicationLink: "https://www.iatssforum.jp/en/applications/",
    source: "https://www.facebook.com/story.php?story_fbid=1071752718835379&id=100080019816164",
    posterImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop&q=80",
    price: "Fully Funded",
    format: "In-Person",
    time: "8-Week Full Program",
    highlights: [
      "100% Fully Funded international scholarship to Japan",
      "Field research in Hiroshima on human security & climate justice",
      "Lifelong international alumni network across ASEAN & Japan",
    ],
  },
  {
    id: "nava-thon-season-4-climate-architecture",
    category: "Competition",
    title: "NAVA-Thon Season 4: Architectural Prototype",
    organization: "NAVA × Save the Children",
    description:
      "Innovation competition empowering youth and young innovators to design, build, and test real architectural prototypes for passive school cooling.",
    role: "Innovator / Contestant",
    requirement: "No requirement — open to youth, architecture students, and young climate advocates.",
    benefit:
      "Build and test physical architectural prototypes for school cooling; expand network with architects & climate experts; receive real project seed funding.",
    location: "Cambodia (Phnom Penh & Field Sites)",
    date: "31 August 2026",
    deadline: "31 August 2026",
    applicationLink: "https://forms.gle/Rw2H9nEghboqQZa1A",
    source: "https://www.facebook.com/SavetheChildreninCambodia/posts/pfbid0LUjKg2C1roEx6Ctw4Ld7JsiuFVpoFo1HSieFgW9XbPE7w2aeNbFSzQ32ehTrhNqjl",
    posterImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000&auto=format&fit=crop&q=80",
    price: "Free Entry",
    format: "In-Person",
    time: "Full-day hackathon sprint",
    highlights: [
      "Seed funding to build your eco-architectural prototype",
      "Mentorship from leading Cambodian sustainable architects",
      "Real-world climate impact for local public schools",
    ],
  },
  {
    id: "academic-research-skills-elibraryusa",
    category: "Workshop",
    title: "Enhancing Academic Research Skills with eLibraryUSA",
    organization: "eLibraryUSA",
    description:
      "Specialized academic training workshop focused on developing research methodologies, evaluating digital source credibility, and mastering citations.",
    role: "Participant",
    requirement: "No requirement — open to university students, thesis researchers, and educators.",
    benefit:
      "Learn to discover authoritative peer-reviewed data; master proper international citation formatting; free access to digital research databases.",
    location: "Phnom Penh",
    date: "29 August 2026",
    deadline: "29 August 2026",
    applicationLink: "https://forms.gle/Zavhx3YuFdafyR379",
    source: "https://www.facebook.com/story.php?story_fbid=1599488231969825&id=100057259907580",
    posterImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1000&auto=format&fit=crop&q=80",
    price: "Free",
    format: "In-Person",
    time: "2:00 PM - 4:30 PM",
    highlights: [
      "Free access to top international peer-reviewed journals",
      "Master academic citation styles (APA, MLA, IEEE)",
      "Digital media verification & scam fact-checking methods",
    ],
  },
  {
    id: "ai-for-work-masterclass-kape",
    category: "Training",
    title: "AI for Work Masterclass",
    organization: "Kampuchea Action to Promote Education (KAPE)",
    description:
      "Practical AI training for ASEAN youth to harness artificial intelligence tools for modern workplace productivity, job hunting, and professional branding.",
    role: "Participant",
    requirement: "Youth aged 18–35; TVET students, recent graduates, or job seekers.",
    benefit:
      "Free comprehensive training; 1-year complimentary LinkedIn Premium; 2 verified certificates from ASEAN Foundation & KAPE; snacks & networking.",
    location: "Phnom Penh",
    date: "30 September 2026",
    deadline: "30 September 2026 (Limited Seats)",
    applicationLink: "https://forms.gle/kape-ai-work",
    source: "https://www.facebook.com/kapekh",
    posterImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1000&auto=format&fit=crop&q=80",
    price: "Free",
    format: "In-Person",
    time: "8:30 AM - 4:30 PM",
    highlights: [
      "1-Year Free LinkedIn Premium subscription ($360 value)",
      "Dual certificates from ASEAN Foundation and KAPE",
      "CV & portfolio AI review session with career advisors",
    ],
  },
  {
    id: "us-university-application-session-amcam",
    category: "Workshop",
    title: "U.S. University Application Information Session",
    organization: "AmCam Exchange",
    description:
      "Comprehensive information session on undergraduate & graduate admissions to United States universities, financial aid, and visa preparation.",
    role: "Participant",
    requirement: "People interested in applying to colleges or universities in the United States.",
    benefit:
      "Practical step-by-step guidance on U.S. university applications, personal statement strategies, and understanding international admissions criteria.",
    location: "AmCam Exchange, Ground Floor, Exchange Square Mall, Phnom Penh",
    date: "14 September 2026",
    deadline: "14 September 2026",
    applicationLink: "https://forms.gle/amcam-us-application",
    source: "AmCam Exchange Facebook Page",
    posterImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&auto=format&fit=crop&q=80",
    price: "Free",
    format: "In-Person",
    time: "2:00 PM - 4:00 PM",
    highlights: [
      "Guidance directly from EducationUSA advisors",
      "Common App essay breakdown and scholarship insights",
      "F-1 student visa application process overview",
    ],
  },
  {
    id: "youth-voice-digital-video-contest-ccim",
    category: "Competition",
    title: "Short Video Contest – “Youth Voice in a Changing Digital World”",
    organization: "Cambodian Center for Independent Media (CCIM)",
    description:
      "Short video competition giving young people a national platform to showcase their creative storytelling, digital media perspectives, and youth advocacy.",
    role: "Contest Participant / Video Creator",
    requirement: "Must adhere to participant guidelines and thematic areas; submit a short video via application form.",
    benefit:
      "1st Prize: Professional Digital Camera + certificate; 2nd Prize: DJI Action Camera + certificate; 3rd Prize: DJI Action Camera + certificate.",
    location: "Phnom Penh (Online Video Submission)",
    date: "5 October 2026",
    deadline: "5 October 2026",
    applicationLink: "https://forms.gle/ccim-youth-voice-video",
    source: "CCIM Facebook Page",
    posterImage: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1000&auto=format&fit=crop&q=80",
    price: "Free Entry",
    format: "Online / Showcase",
    time: "Submit before 5:00 PM",
    highlights: [
      "Win high-end DSLR Camera and DJI Action Cameras",
      "Broadcast on CCIM social channels to over 500k audience",
      "Official certificate of journalistic & digital media merit",
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
  email: "hello@domner.com",
  telegram: "@DomnerTeam",
  telegramUrl: "https://t.me/DomnerTeam",
};
