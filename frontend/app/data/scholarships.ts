/* ── Scholarships Data Model & Directory (Cambodia Only) ───── */

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  degreeLevel: string; // "Bachelor"
  category: "Government" | "University" | "Foundation / Non-Profit";
  coverage: "100% Full Tuition" | "Full Tuition + Stipend" | "Partial Tuition (20% - 75%)" | "Tuition Discount (Up to $5,000)";
  coveragePercent?: number;
  targetMajors: string[];
  eligibility: string[];
  benefits: string[];
  requiredDocuments: string[];
  deadline: string;
  applicationProcess: string[];
  officialSource: string;
  image: string;
  isVerified: boolean;
  lastVerified: string;
}

export const SCHOLARSHIP_CATEGORIES = [
  "All Categories",
  "Government",
  "University",
  "Foundation / Non-Profit",
] as const;

export const COVERAGE_FILTERS = [
  "All Coverage",
  "100% Full Tuition",
  "Full Tuition + Stipend",
  "Partial Tuition (20% - 75%)",
  "Tuition Discount (Up to $5,000)",
] as const;

/* ── Exactly 10 Official Cambodian Scholarships from Ministry & University Records ── */
export const SCHOLARSHIPS_DATA: Scholarship[] = [
  // 1. Techo Digital Talent Scholarship 2026
  {
    id: "techo-digital-talent-2026",
    title: "Techo Digital Talent Scholarship 2026",
    provider: "AUPP / MPTC",
    degreeLevel: "Bachelor",
    category: "Government",
    coverage: "Full Tuition + Stipend",
    coveragePercent: 100,
    targetMajors: [
      "AI",
      "Cybersecurity",
      "Digital Infrastructure",
      "ICT",
      "Software Development",
      "IT Management / CS",
      "Information Systems",
      "Web & Mobile",
    ],
    eligibility: [
      "Cambodian national with Grade A, B, or C in the 2026 National Exam (Bac II)",
      "Strong aptitude in Mathematics, Logic, and English language",
      "Commitment to study full-time at CADT / AUPP",
      "Dedication to contribute to Cambodia's digital development upon graduation",
    ],
    benefits: [
      "100% full tuition fee waiver for the complete 4-year degree",
      "Full coverage of application and administrative fees",
      "English Proficiency Program (EPP) coverage if eligible",
      "Access to state-of-the-art tech laboratories and national digital projects",
    ],
    requiredDocuments: [
      "Copy of National ID Card or Passport",
      "Official 2026 National Exam (Bac II) result certificate",
      "Proof of English proficiency (if available)",
      "Two clear house photos and location map",
    ],
    deadline: "18 Sep 2026, 5:00 PM",
    applicationProcess: [
      "Visit AUPP campus or official MPTC portal",
      "Submit complete university admission and scholarship application forms",
      "Upload verified Bac II certificate, national ID, and house photos with map",
      "Attend the entrance assessment and interview with the scholarship committee",
    ],
    officialSource: "https://cadt.edu.kh/scholarship/",
    image: "https://scontent.fpnh24-1.fna.fbcdn.net/v/t39.99422-6/793144869_1846363919683236_1414880382386846265_n.png?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=s2048x2048&_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGuQsmgXi8nSRzXa3LjdIPK774PB0AE_0_vvg8HQAT_T_PcweNBo5KvFXgWTXTUC6x_m138o6jpFhJhQHAJQCK_&_nc_ohc=BdhCShX6FasQ7kNvwF4IoFC&_nc_oc=Adq3mYkZttMcw91CDkHQUEVh26OMBqB4eug7f0Q6jLtHdlD8nibQUWYXGZCFa669kz4&_nc_zt=14&_nc_ht=scontent.fpnh24-1.fna&_nc_gid=bnlBZ6Q93-ZI8fwnNi7Mqg&_nc_ss=7b2a8&oh=00_AQLOBw9qNpBYMVkE0Qwa3e6jOTUPg7VBeeaYm3sM4guXYw&oe=6AA06AD6",
    isVerified: true,
    lastVerified: "August 2026",
  },

  // 2. UYFC Scholarship 2026
  {
    id: "uyfc-scholarship-2026",
    title: "UYFC Scholarship 2026",
    provider: "UYFC / AUPP",
    degreeLevel: "Bachelor",
    category: "Foundation / Non-Profit",
    coverage: "100% Full Tuition",
    coveragePercent: 100,
    targetMajors: [
      "Business",
      "International Relations & Diplomacy",
      "Law",
      "Cybersecurity",
      "Digital Infrastructure",
      "Artificial Intelligence",
    ],
    eligibility: [
      "Grade A, B, or C on the National High School Exam (Bac II)",
      "Demonstrated low-income status or proven financial need",
      "High motivation and commitment to community development",
    ],
    benefits: [
      "Full tuition fee waiver for the entire undergraduate program",
      "Only a nominal $300/year administrative fee remains for student",
      "Opportunity to earn a recognized American dual-degree qualification in Cambodia",
    ],
    requiredDocuments: [
      "National ID card or valid Passport",
      "National High School Exam (Bac II) official result sheet",
      "Proof of English proficiency",
      "Certificate of financial need or family income verification",
    ],
    deadline: "11 Sep 2026, 5:00 PM",
    applicationProcess: [
      "Submit initial scholarship application through the Union of Youth Federations of Cambodia (UYFC)",
      "Provide proof of Bac II grades and family income status",
      "Shortlisted candidates proceed to final registration and interview at AUPP",
    ],
    officialSource: "https://www.aupp.edu.kh/aupp-scholarships/uyfc-scholarship/",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },

  // 3. Paragon.U Scholarship Exam 2026
  {
    id: "paragon-scholarship-exam-2026",
    title: "Paragon.U Scholarship Exam 2026",
    provider: "Paragon International University",
    degreeLevel: "Bachelor",
    category: "University",
    coverage: "100% Full Tuition",
    coveragePercent: 100,
    targetMajors: [
      "Architecture",
      "Interior Architecture",
      "Civil Engineering",
      "Industrial Engineering",
      "Computer Science",
      "MIS",
      "Digital Arts & Design",
      "Banking & Finance",
      "Business",
      "Economics",
      "International Relations",
      "Mathematics",
    ],
    eligibility: [
      "High school graduates with Bac II diploma or equivalent",
      "Open to all registered scholarship examination applicants",
      "Proficient command of the English language for English-medium curriculum",
    ],
    benefits: [
      "Merit-based tuition discounts of 25%, 50%, 75%, or 100% full tuition",
      "Four-year scholarship continuation based on academic performance",
      "Access to modern laboratories, robotics centers, and international exchange",
    ],
    requiredDocuments: [
      "Official exam registration and application form",
      "Certified Bac II certificate or provisional high school completion letter",
      "National ID card or birth certificate",
    ],
    deadline: "24 Jun 2026",
    applicationProcess: [
      "Register online via the Paragon International University admissions portal",
      "Complete examination fee payment",
      "Participate in the preparatory mock exam session",
      "Sit for the nationwide Paragon.U Scholarship Examination in Mathematics, Logic, and English",
    ],
    officialSource: "https://www.paragoniu.edu.kh/admissions/scholarships/",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "June 2026",
  },

  // 4. Architecture Scholarship (CamTech)
  {
    id: "camtech-architecture-scholarship",
    title: "Architecture Scholarship",
    provider: "CamTech University",
    degreeLevel: "Bachelor",
    category: "University",
    coverage: "100% Full Tuition",
    coveragePercent: 100,
    targetMajors: ["Architecture", "Spatial Planning", "Interior Design"],
    eligibility: [
      "High school graduates or candidates meeting CamTech university admission criteria",
      "Strong interest in architectural design, spatial innovation, and built environment",
      "Passing mark on entrance examination and interview",
    ],
    benefits: [
      "Up to 100% full tuition fee coverage across the degree",
      "254 scholarship spots available for creative and technical students",
      "Direct studio access with state-of-the-art 3D modeling and fabrication tech",
    ],
    requiredDocuments: [
      "Completed official application form (Google Form)",
      "National ID Card or Passport",
      "High school completion certificate and academic transcript",
      "Art/design sketches or portfolio (if available)",
    ],
    deadline: "07 Sep 2026",
    applicationProcess: [
      "Submit application via CamTech University official registration form",
      "Sit for Entrance Exam covering Mathematics, Logic & English",
      "Attend the creative panel interview with architecture faculty",
    ],
    officialSource: "https://camtech.edu.kh/",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },

  // 5. Gen Z Academic Merit Scholarship 2027
  {
    id: "camed-gen-z-merit-2027",
    title: "Gen Z Academic Merit Scholarship 2027",
    provider: "CamEd Business School",
    degreeLevel: "Bachelor",
    category: "University",
    coverage: "Tuition Discount (Up to $5,000)",
    targetMajors: ["Accounting & Finance", "Audit & Taxation", "Financial Analysis"],
    eligibility: [
      "High-school graduate or equivalent",
      "Overall Grade A, B, or C on the National High School Exam (Bac II)",
      "Must successfully pass the CamEd in-person scholarship examination",
    ],
    benefits: [
      "Up to $5,000 tuition financial support for the 2027 academic year",
      "Dual qualification: Bachelor of Accounting & Finance + international CAT qualification",
      "Premier networking and internship connections with Big 4 auditing firms and banks",
    ],
    requiredDocuments: [
      "Completed online application on CamEd portal",
      "Certified high-school certificate or equivalent",
      "National ID card or passport copy",
    ],
    deadline: "30 Sep 2026",
    applicationProcess: [
      "Complete the online application on CamEd portal",
      "Take the in-person English & Mathematics scholarship exam",
      "Attend the personal evaluation interview with CamEd admissions faculty",
    ],
    officialSource: "https://cam-ed.edu.kh/scholarship/",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },

  // 6. Department of Mathematics (Data Science) Scholarship
  {
    id: "paragon-data-science-scholarship",
    title: "Department of Mathematics (Data Science) Scholarship",
    provider: "Paragon International University",
    degreeLevel: "Bachelor",
    category: "University",
    coverage: "100% Full Tuition",
    coveragePercent: 100,
    targetMajors: ["Mathematics – Data Science", "Applied Statistics", "Computational Math"],
    eligibility: [
      "Must have completed National BAC II examination",
      "Must not currently be enrolled at Paragon International University",
      "Strong quantitative aptitude and dedication to mathematics and data analytics",
    ],
    benefits: [
      "Scholarships covering 25%, 50%, 75%, or 100% tuition fees",
      "Specialized curriculum bridging theoretical mathematics with modern data science",
      "Career preparation in data engineering, algorithmic finance, and predictive modeling",
    ],
    requiredDocuments: [
      "Registration and application form",
      "$5 exam fee slip",
      "Certified Bac II transcript and national ID card",
    ],
    deadline: "11 Sep 2026, 23:59",
    applicationProcess: [
      "Register online and pay the $5 exam registration fee",
      "Take Part 1 exam on 17 September",
      "Shortlisted candidates take Part 2 exam on 25 September",
      "Official results announcement on 28 September",
    ],
    officialSource: "https://www.paragoniu.edu.kh/the-department-of-mathematics-data-science-scholarship-is-open/",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },

  // 7. Institute of Technology of Cambodia (ITC) Excellence Scholarship
  {
    id: "itc-excellence-scholarship",
    title: "Institute of Technology of Cambodia (ITC) Excellence Scholarship",
    provider: "Institute of Technology of Cambodia (ITC)",
    degreeLevel: "Bachelor",
    category: "Government",
    coverage: "100% Full Tuition",
    coveragePercent: 100,
    targetMajors: ["Civil Engineering", "Electrical Engineering", "Chemical Engineering", "Technology & Architecture", "Robotics"],
    eligibility: [
      "Top ranking Cambodian students on the National Higher Education Entrance Examination (Bac II)",
      "Strong foundation in Advanced Mathematics, Physics, and Chemistry",
      "High dedication to national industrial and engineering development",
    ],
    benefits: [
      "Full 100% tuition waiver for the complete multi-year engineering cycle",
      "Academic stipends for outstanding research contributions",
      "Access to Cambodia's leading engineering laboratories and research workshops",
    ],
    requiredDocuments: [
      "National Higher Education Examination result certificate",
      "Completed ITC scholarship and intake application form",
      "Recent student ID photos (4x6)",
      "National ID card copy",
    ],
    deadline: "30 Sep 2026",
    applicationProcess: [
      "Submit intake application via the ITC official admissions intake portal",
      "Verify national exam grades against departmental cutoff percentiles",
      "Complete registration verification at the ITC Academic Office in Phnom Penh",
    ],
    officialSource: "https://itc.edu.kh/",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },

  // 8. Paññāsāstra University of Cambodia (PUC) Entrance Scholarship
  {
    id: "puc-entrance-scholarship",
    title: "Paññāsāstra University of Cambodia (PUC) Entrance Scholarship",
    provider: "Paññāsāstra University of Cambodia (PUC)",
    degreeLevel: "Bachelor",
    category: "University",
    coverage: "Partial Tuition (20% - 75%)",
    targetMajors: [
      "Arts & Humanities",
      "Business & Economics",
      "Science & Technology",
      "English & Communication",
      "International Relations",
    ],
    eligibility: [
      "High school graduates passing the PUC entrance evaluation",
      "Commitment to ethical leadership, community service, and peacebuilding",
      "Proficiency in English suitable for English-medium instruction",
    ],
    benefits: [
      "Partial to full tuition fee reduction based on entrance exam scores",
      "Wide choice of academic faculties across business, social science, and tech",
      "Access to vibrant student associations and international student exchanges",
    ],
    requiredDocuments: [
      "Completed PUC application form",
      "High school certificate of graduation / Bac II result",
      "Academic transcript of records",
      "Recent passport-sized photographs",
    ],
    deadline: "30 Sep 2026",
    applicationProcess: [
      "Register for and sit the PUC Entrance Evaluation Exam",
      "Apply through the PUC admissions and financial aid office",
      "Receive scholarship award letter and finalize course selection",
    ],
    officialSource: "https://www.puc.edu.kh/",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },

  // 9. National University of Management (NUM) Undergraduate Scholarship
  {
    id: "num-undergraduate-scholarship",
    title: "National University of Management (NUM) Undergraduate Scholarship",
    provider: "National University of Management (NUM)",
    degreeLevel: "Bachelor",
    category: "University",
    coverage: "100% Full Tuition",
    coveragePercent: 100,
    targetMajors: [
      "Business Administration",
      "Economics",
      "Tourism & Hospitality",
      "Information Technology",
      "Digital Business",
    ],
    eligibility: [
      "High school graduates scoring well on the national Bac II examination or NUM entrance tests",
      "Demonstrated academic excellence and good moral conduct",
      "Enrolled in undergraduate degree programs at NUM",
    ],
    benefits: [
      "Partial to full tuition coverage across all four academic years",
      "Hands-on training in business incubation and innovation centers",
      "Priority consideration for exchange programs with regional partner universities",
    ],
    requiredDocuments: [
      "National exam certificate (Bac II)",
      "High school transcript of grades",
      "Completed NUM scholarship application form",
      "Copy of National ID card",
    ],
    deadline: "30 Sep 2026",
    applicationProcess: [
      "Submit application at the NUM main campus admission office in Phnom Penh",
      "Provide certified academic records and entrance test scores",
      "Check the published scholarship recipient registry and complete enrollment",
    ],
    officialSource: "https://www.num.edu.kh/",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },

  // 10. 60% Media & Communications Scholarship
  {
    id: "uc-media-communications-scholarship",
    title: "60% Media & Communications Scholarship",
    provider: "College of Media & Communications, The University of Cambodia (UC)",
    degreeLevel: "Bachelor",
    category: "University",
    coverage: "Partial Tuition (20% - 75%)",
    targetMajors: [
      "Media Arts and Studies",
      "Visual Communication",
      "Communication Studies",
      "Journalism",
      "Digital Broadcasting",
    ],
    eligibility: [
      "High school students and applicants interested in media, design, and communications degrees",
      "Open to high school graduates of all grade levels meeting university criteria",
      "Passion for digital storytelling, visual production, or media literacy",
    ],
    benefits: [
      "60% immediate scholarship deduction for all grade levels",
      "Training in professional media production, television, radio, and digital newsrooms",
      "Mentorship from experienced media practitioners and journalists",
    ],
    requiredDocuments: [
      "Completed Google Form scholarship application",
      "High school academic transcript and diploma",
      "Personal ID or passport copy",
    ],
    deadline: "07 Sep 2026",
    applicationProcess: [
      "Register via the official University of Cambodia Google Form link",
      "Submit verified copies of high school records and personal identification",
      "Receive 60% scholarship confirmation and finalize semester enrollment at UC",
    ],
    officialSource: "https://uc.edu.kh/",
    image: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },
];

/* ── Lookup Helpers ─────────────────────────────────────── */

export function getScholarshipById(id: string): Scholarship | undefined {
  return SCHOLARSHIPS_DATA.find((s) => s.id === id);
}

export function getRelatedScholarships(currentId: string, limit = 3): Scholarship[] {
  const current = getScholarshipById(currentId);
  if (!current) return SCHOLARSHIPS_DATA.slice(0, limit);

  return SCHOLARSHIPS_DATA
    .filter((s) => s.id !== currentId)
    .slice(0, limit);
}
