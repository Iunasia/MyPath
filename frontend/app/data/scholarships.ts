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
  // 1. Techo Digital Talent Scholarship 2026 (CADT)
  {
    id: "techo-digital-talent-2026",
    title: "Techo Digital Talent Scholarship 2026",
    provider: "CADT / MPTC",
    degreeLevel: "Bachelor",
    category: "Government",
    coverage: "Full Tuition + Stipend",
    coveragePercent: 100,
    targetMajors: [
      "Computer Science (Software Eng. / Data Science & AI)",
      "Telecommunications & Network Engineering (Cybersecurity / Satellite Comms)",
      "Digital Business (e-Commerce)",
    ],
    eligibility: [
      "High school graduate (Bac II) with an exam Grade A, B, or C",
      "Written entrance exams (Mathematics, Logic/IQ, and English)",
      "Personal interview evaluation with CADT academic committee",
      "Special admission focus and priority given to female students, low-income applicants, provincial students, and people with disabilities",
    ],
    benefits: [
      "100% full tuition coverage for 4 years (200 slots allocated specifically for CADT)",
      "Free high-performance laptop for coding and digital coursework",
      "Potential monthly living stipends for eligible students",
      "Guaranteed tech career pathways and direct industry networking",
    ],
    requiredDocuments: [
      "Digital scans (PDF/JPEG) of National ID or Passport",
      "Official 2026 National Exam (Bac II) result certificate",
      "High School academic transcripts (Grades 10–12)",
      "Recent passport-sized photo (4x6)",
      "Priority proof documentation (like an Equity Card / IDPoor certificate if applicable)",
    ],
    deadline: "30 Sep 2026",
    applicationProcess: [
      "Online application & document screening via CADT and MPTC official portals",
      "Written entrance exams covering Mathematics, Logic/IQ, and English",
      "Personal interview with CADT academic and scholarship selection committee",
      "Final enrollment verification and scholarship award orientation at CADT campus",
    ],
    officialSource: "https://cadt.edu.kh/scholarship/",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqRyw25jKCZGulcvKAWhoxTMWgbq2zRztSJqoIVYb40gw0FE1IS9WlkSc&s=10",
    isVerified: true,
    lastVerified: "September 2026",
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
  // 12. ÆON 1% Club Foundation Scholarship 2026–27
  {
    id: "aeon-1-percent-club-scholarship",
    title: "ÆON 1% Club Foundation Scholarship 2026–27",
    provider: "ÆON 1% Club Foundation / RUPP & NUM",
    degreeLevel: "Bachelor",
    category: "Foundation / Non-Profit",
    coverage: "Partial Tuition (20% - 75%)",
    coveragePercent: 75,
    targetMajors: [
      "Economics",
      "Computer Science",
      "Business Administration",
      "International Relations",
      "Management",
    ],
    eligibility: [
      "Undergraduate students enrolled at Royal University of Phnom Penh (RUPP) or National University of Management (NUM)",
      "Excellent academic track record (GPA 3.0 or higher)",
      "Demonstrated commitment to cross-cultural exchange between Cambodia and Japan",
    ],
    benefits: [
      "Annual tuition stipend of $1,000 to $1,500 per academic year",
      "Invitation to ÆON Asian Youth Leaders international forum in Japan",
      "Networking and internship preference with ÆON Group companies in Cambodia",
    ],
    requiredDocuments: [
      "University enrollment certification",
      "Official academic transcript",
      "Recommendation letter from faculty dean",
      "Copy of National ID card",
    ],
    deadline: "15 Oct 2026",
    applicationProcess: [
      "Apply through RUPP or NUM International Relations Office",
      "Submit academic dossier and essay",
      "Participate in panel interview with ÆON Foundation delegates",
    ],
    officialSource: "https://www.aeon.info/ef/en/about/",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "September 2026",
  },

  // 13. RUA Agricultural Excellence & Government Sponsorship Grants
  {
    id: "rua-agricultural-excellence-grant",
    title: "RUA Agricultural Excellence & Government Sponsorship Grants",
    provider: "Royal University of Agriculture (RUA)",
    degreeLevel: "Bachelor",
    category: "Government",
    coverage: "100% Full Tuition",
    coveragePercent: 100,
    targetMajors: [
      "Agronomy & Soil Science",
      "Animal Science & Veterinary",
      "Agricultural Engineering",
      "Agro-Industry",
      "Fisheries",
    ],
    eligibility: [
      "High school graduates with Bac II science track completion",
      "High ranking on national entrance examination",
      "Dedication to advancing agricultural modernization and food security in Cambodia",
    ],
    benefits: [
      "Full 100% tuition coverage for 4-year Bachelor of Science degrees",
      "Monthly living stipend for outstanding rural and provincial scholars",
      "Access to experimental farms, research greenhouses, and laboratory centers",
    ],
    requiredDocuments: [
      "Bac II exam result sheet",
      "National identification card",
      "High school transcript",
      "Completed RUA application form",
    ],
    deadline: "25 Sep 2026",
    applicationProcess: [
      "Register at RUA admissions office or Ministry of Agriculture portal",
      "Submit academic portfolio and entrance exam registration",
      "Confirm department placement upon entrance result release",
    ],
    officialSource: "http://www.rua.edu.kh/",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },

  // 14. National Arts & Cultural Heritage Scholarship
  {
    id: "rufa-arts-heritage-scholarship",
    title: "National Arts & Cultural Heritage Scholarship",
    provider: "Royal University of Fine Arts (RUFA)",
    degreeLevel: "Bachelor",
    category: "Government",
    coverage: "100% Full Tuition",
    coveragePercent: 100,
    targetMajors: [
      "Architecture",
      "Interior Design",
      "Visual Arts & Sculpture",
      "Traditional Music",
      "Archaeology",
    ],
    eligibility: [
      "Cambodian high school graduates passing RUFA aptitude and creative drawing exams",
      "Proven artistic talent and passion for Cambodian cultural preservation",
      "Passionate commitment to the arts, architectural heritage, or archaeology",
    ],
    benefits: [
      "Full 100% government tuition waiver for the complete 5-year architecture or 4-year fine arts degree",
      "Materials allowance and exhibition opportunities in national art galleries",
      "Participation in UNESCO and national heritage conservation projects",
    ],
    requiredDocuments: [
      "High school graduation diploma / Bac II certificate",
      "Artistic portfolio or sketch samples",
      "National identity card",
      "Passport photos (4x6)",
    ],
    deadline: "20 Sep 2026",
    applicationProcess: [
      "Register for RUFA talent assessment in Phnom Penh",
      "Complete live sketching, spatial drawing, or performance audition",
      "Submit formal scholarship dossier at the RUFA Academic Affairs office",
    ],
    officialSource: "https://rufa.edu.kh/",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },

  // 15. UP Healthcare Talent & Academic Merit Scholarships
  {
    id: "up-healthcare-talent-scholarship",
    title: "UP Healthcare Talent & Academic Merit Scholarships",
    provider: "University of Puthisastra (UP)",
    degreeLevel: "Bachelor",
    category: "University",
    coverage: "Partial Tuition (20% - 75%)",
    coveragePercent: 50,
    targetMajors: [
      "Pharmacy",
      "Dentistry",
      "Medicine",
      "Nursing & Midwifery",
      "Information Technology",
    ],
    eligibility: [
      "High school graduates with strong marks in Biology, Chemistry, and English",
      "Passing score on the University of Puthisastra Entrance & Scholarship Exam",
      "High ethical commitment to community health and patient care",
    ],
    benefits: [
      "Merit-based tuition reduction of 25% to 75% for top entrance exam performers",
      "Clinical training in UP's on-campus dental hospital and simulation centers",
      "International clinical rotations and health sector partnerships",
    ],
    requiredDocuments: [
      "Certified Bac II diploma or provisional grade slip",
      "National ID card or passport",
      "UP scholarship application form",
    ],
    deadline: "15 Oct 2026",
    applicationProcess: [
      "Complete online application via the UP admissions portal",
      "Sit for the UP Health Sciences Scholarship Examination",
      "Attend the admissions interview and claim scholarship award",
    ],
    officialSource: "https://www.puthisastra.edu.kh/",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },

  // 16. DMUC Academic Excellence & Global Leadership Scholarship
  {
    id: "dmuc-academic-excellence-scholarship",
    title: "DMUC Academic Excellence & Global Leadership Scholarship",
    provider: "De Montfort University Cambodia (DMUC)",
    degreeLevel: "Bachelor",
    category: "University",
    coverage: "Partial Tuition (20% - 75%)",
    coveragePercent: 50,
    targetMajors: [
      "Business Administration",
      "Accounting & Finance",
      "Computer Science",
      "Graphic Design & Animation",
    ],
    eligibility: [
      "Grade A, B, or C on Bac II or equivalent international qualifications (A-Levels, IB)",
      "English language proficiency equivalent to IELTS 5.5 or higher (or pass DMUC English test)",
      "Leadership potential and proactive involvement in extracurricular activities",
    ],
    benefits: [
      "Scholarship awards covering up to $4,000/year off British-accredited undergraduate degrees",
      "Opportunity to study or transfer to DMU Leicester campus in the United Kingdom",
      "Modern British curriculum delivered in state-of-the-art Phnom Penh campus",
    ],
    requiredDocuments: [
      "High school completion certificate",
      "Academic transcripts",
      "Proof of English proficiency",
      "Copy of Passport or National ID",
    ],
    deadline: "15 Oct 2026",
    applicationProcess: [
      "Apply through the DMUC online admissions system",
      "Submit academic credentials and personal statement",
      "Interview with the DMUC academic scholarship committee",
    ],
    officialSource: "https://dmuc.edu.kh/",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "September 2026",
  },

  // 17. UC Academic & Leadership Scholarships
  {
    id: "uc-academic-leadership-scholarship",
    title: "UC Academic & Leadership Scholarships",
    provider: "The University of Cambodia (UC)",
    degreeLevel: "Bachelor",
    category: "University",
    coverage: "100% Full Tuition",
    coveragePercent: 100,
    targetMajors: [
      "Business Administration",
      "International Relations",
      "Economics",
      "Law",
      "Media & Communications",
    ],
    eligibility: [
      "High school graduates with Bac II Grade A or B",
      "Passing marks on the UC General Knowledge, English, and Essay Scholarship Exam",
      "Strong leadership record in student clubs or community engagement",
    ],
    benefits: [
      "Full 100% tuition waiver for 4-year undergraduate degree programs",
      "Leadership development workshops and ASEAN youth summit representation",
      "Priority enrollment in English-medium degree tracks",
    ],
    requiredDocuments: [
      "Bac II exam certificate",
      "High school transcripts",
      "Application form",
      "National ID card copy",
    ],
    deadline: "30 Sep 2026",
    applicationProcess: [
      "Submit scholarship application at UC Admissions Office",
      "Take the UC Annual Scholarship Examination",
      "Receive award confirmation from the UC Academic Committee",
    ],
    officialSource: "https://uc.edu.kh/",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80",
    isVerified: true,
    lastVerified: "August 2026",
  },
];

/* ── Lookup Helpers ─────────────────────────────────────── */

export function getScholarshipById(id: string): Scholarship | undefined {
  if (id === "techo-digital-talent-cadt-2026") {
    return SCHOLARSHIPS_DATA.find((s) => s.id === "techo-digital-talent-2026");
  }
  return SCHOLARSHIPS_DATA.find((s) => s.id === id);
}

export function getRelatedScholarships(currentId: string, limit = 3): Scholarship[] {
  const current = getScholarshipById(currentId);
  if (!current) return SCHOLARSHIPS_DATA.slice(0, limit);

  return SCHOLARSHIPS_DATA
    .filter((s) => s.id !== currentId)
    .slice(0, limit);
}
