export interface AcademicProgram {
  title: string;
  shortCode: string;
  description: string;
  iconName: "laptop" | "globe" | "briefcase" | "database" | "heart" | "building" | "shield";
}

export interface DegreeLevel {
  title: string;
  description: string;
  image: string;
}

export interface Facility {
  name: string;
  image: string;
}

export interface UniversityScholarship {
  title: string;
  deadline: string;
  image: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  location: string;
  type: "Public" | "Private" | "International";
  image: string;
  heroImage?: string;
  description: string;
  popularMajors: string[];
  website: string;
  established?: string;
  studentCount?: string;
  taglinePrefix: string;
  taglineHighlight: string;
  undergraduate: DegreeLevel;
  graduate: DegreeLevel;
  programs: AcademicProgram[];
  admissionRequirements: string[];
  applicationDeadline: string;
  facilities: Facility[];
  scholarship: UniversityScholarship;
  mapImage: string;
  mapUrl: string;
}

export const LOCATIONS = [
  "All Locations",
  "Phnom Penh",
  "Battambang",
  "Siem Reap",
  "Kampong Speu",
];

export const UNIVERSITIES_DATA: University[] = [
  {
    id: "cadt",
    name: "Cambodia Academy of Digital Technology",
    shortName: "CADT",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80",
    description: "National flagship institute specializing in digital technology, software engineering, and AI research.",
    popularMajors: ["Computer Science", "Data Science", "Cybersecurity", "FinTech"],
    website: "https://cadt.edu.kh",
    established: "2014",
    studentCount: "1,200+",
    taglinePrefix: "Turn Your Ambition into",
    taglineHighlight: "Technology",
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description:
        "A 4-year program with 3 core degrees and 5 specializations, preparing students to lead and innovate in the digital age.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Graduate Degree (Master)",
      description:
        "A 2-year program providing advanced and in-depth knowledge and skills in both artificial intelligence and data science, applicable in research or industrial fields.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Computer Science (CS)",
        shortCode: "CS",
        description: "Focuses on software development, data, and advanced computing. Specializations: Software Engineering or Data Science.",
        iconName: "laptop",
      },
      {
        title: "Digital Business (DB)",
        shortCode: "DB",
        description: "Combines technology, data analysis, entrepreneurship, and modern digital business strategies.",
        iconName: "briefcase",
      },
      {
        title: "Telecommunications and Network Engineering (TN)",
        shortCode: "TN",
        description: "Focuses on communication networks, cloud computing, and wireless technologies. Specializations: Cybersecurity or 5G Technology.",
        iconName: "globe",
      },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "National Entrance Exam Score",
      "Completed Application Form",
    ],
    applicationDeadline: "August 31, 2026",
    facilities: [
      { name: "Institute of Digital Technology (IDT)", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80" },
      { name: "Innovation Labs & AI Center", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
      { name: "Digital Library & Co-working", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Techo Digital Talent Scholarship",
      deadline: "15 Oct, 2026",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/y2XhNsTKEDqKwhzS1",
  },
  {
    id: "uhs",
    name: "University of Health Sciences",
    shortName: "UHS",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1600&auto=format&fit=crop&q=80",
    description: "Cambodia's premier public medical university providing accredited clinical, dental, and biomedical education.",
    popularMajors: ["Biomedical Sciences", "Medicine", "Pharmacy", "Dentistry"],
    website: "https://uhs.edu.kh",
    established: "1946",
    studentCount: "5,000+",
    taglinePrefix: "Dedication to Healing and",
    taglineHighlight: "Life Sciences",
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description: "Comprehensive clinical and pre-clinical curriculum preparing compassionate healthcare leaders and medical researchers.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Specialized Medical Residencies",
      description: "Advanced clinical rotations in general surgery, internal medicine, pediatrics, and public health policy.",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Doctor of Medicine (MD)", shortCode: "MD", description: "Eight-year rigorous clinical training curriculum covering diagnostics, patient care, pathology, and clinical surgery.", iconName: "heart" },
      { title: "Pharmacy Science (PharmD)", shortCode: "PHARM", description: "Pharmaceutical chemistry, clinical pharmacology, and hospital medication management systems.", iconName: "shield" },
      { title: "Dental Sciences (DDS)", shortCode: "DDS", description: "Modern oral maxillofacial healthcare, orthodontic procedures, and community dental outreach.", iconName: "building" },
    ],
    admissionRequirements: [
      "High School Diploma with Science Track (Bac II)",
      "Ministry of Health National Entrance Examination",
      "Medical Fitness Certificate",
    ],
    applicationDeadline: "September 15, 2026",
    facilities: [
      { name: "National Clinical Simulation Center", image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80" },
      { name: "Biomedical Research Laboratories", image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "National Health Excellence Fellowship",
      deadline: "20 Sep, 2026",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/uhsPhnomPenhLocation",
  },
  {
    id: "ifl",
    name: "Institute of Foreign Languages",
    shortName: "IFL",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80",
    description: "The renowned languages and international studies division of Royal University of Phnom Penh.",
    popularMajors: ["International Studies", "English Literature", "Linguistics", "Media Communication"],
    website: "https://rupp.edu.kh/ifl",
    established: "1985",
    studentCount: "8,000+",
    taglinePrefix: "Connecting Cambodia to the",
    taglineHighlight: "World",
    undergraduate: {
      title: "Bachelor of Arts & International Studies",
      description: "Interdisciplinary training in global diplomacy, cross-cultural communication, literature, and international relations.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master in Applied Linguistics & TESOL",
      description: "Advanced curriculum in language acquisition pedagogy, translation science, and comparative cultural studies.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Department of International Studies (DIS)", shortCode: "DIS", description: "Global diplomacy, international political economy, regional integration, and multilateral negotiation.", iconName: "globe" },
      { title: "Department of English (DOE)", shortCode: "DOE", description: "Academic English mastery, applied pedagogy, literature critique, and professional communication.", iconName: "briefcase" },
      { title: "Asian & European Language Divisions", shortCode: "LANG", description: "Comprehensive immersion in French, Japanese, Korean, Chinese, and Thai language and culture.", iconName: "building" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "IFL Competitive English Entrance Examination",
      "Official Application Submission",
    ],
    applicationDeadline: "August 28, 2026",
    facilities: [
      { name: "Iconic Vann Molyvann Architectural Complex", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80" },
      { name: "Digital Language Audio Lab", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "ASEAN International Exchange Grant",
      deadline: "12 Oct, 2026",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/iflPhnomPenhLocation",
  },
  {
    id: "num",
    name: "National University of Management",
    shortName: "NUM",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80",
    description: "Leading public university centered on business administration, economics, finance, and entrepreneurship.",
    popularMajors: ["Business Analytics", "Digital Marketing", "Accounting", "Finance"],
    website: "https://num.edu.kh",
    established: "1983",
    studentCount: "10,000+",
    taglinePrefix: "Shaping Leaders in Commerce and",
    taglineHighlight: "Management",
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description: "Rigorous training in managerial economics, corporate finance, digital marketing, and venture creation.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Business Administration (MBA)",
      description: "Executive and professional graduate programs tailored for Cambodia's emerging financial and corporate landscape.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Business Analytics & FinTech", shortCode: "BAF", description: "Data-driven decision making, financial modeling, and modern digital payment ecosystems.", iconName: "laptop" },
      { title: "International Business Management", shortCode: "IBM", description: "Global corporate operations, supply chain logistics, and cross-border commercial law.", iconName: "briefcase" },
      { title: "Finance & Investment Banking", shortCode: "FIB", description: "Capital markets, securities analysis, corporate auditing, and investment strategy.", iconName: "database" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "University Enrollment Registration",
      "Entrance Placement Test",
    ],
    applicationDeadline: "September 08, 2026",
    facilities: [
      { name: "NUM Digital Innovation Center", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80" },
      { name: "Stock Exchange Simulation Room", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Future Entrepreneurs Merit Grant",
      deadline: "22 Sep, 2026",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/numPhnomPenhLocation",
  },
  {
    id: "aupp",
    name: "American University of Phnom Penh",
    shortName: "AUPP",
    location: "Phnom Penh",
    type: "International",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80",
    description: "American-curriculum accredited university providing dual-degree programs with US partner universities.",
    popularMajors: ["Software Engineering", "Business Administration", "Cognitive Science", "Law"],
    website: "https://aupp.edu.kh",
    established: "2013",
    studentCount: "2,000+",
    taglinePrefix: "Global Dual Degrees in",
    taglineHighlight: "Cambodia",
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description: "US-accredited bachelor degrees offered in partnership with the University of Arizona and Fort Hays State University.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Graduate Degree (Master)",
      description: "Executive master programs in business administration, digital leadership, and international commercial law.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Software Engineering & Cloud", shortCode: "SE", description: "Dual degree with University of Arizona covering full-stack systems, mobile engineering, and DevOps.", iconName: "laptop" },
      { title: "Business Administration & Finance", shortCode: "BA", description: "International corporate management, investment banking, data-driven marketing, and venture creation.", iconName: "briefcase" },
      { title: "Global Affairs & Diplomacy", shortCode: "GA", description: "International jurisprudence, multilateral negotiations, foreign economic policy, and governance.", iconName: "globe" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II or International Equivalent)",
      "IELTS 6.0+ or AUPP English Proficiency Placement Test",
      "Personal Essay & Admissions Interview",
    ],
    applicationDeadline: "August 20, 2026",
    facilities: [
      { name: "Ultra-Modern 7-Hectare Eco Campus", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80" },
      { name: "Bloomberg Financial Trading Terminal", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "AUPP Merit & Global Leadership Scholarship",
      deadline: "10 Aug, 2026",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/auppPhnomPenhLocation",
  },
  {
    id: "setec",
    name: "Setec Institute",
    shortName: "SETEC",
    location: "Phnom Penh",
    type: "Private",
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&auto=format&fit=crop&q=80",
    description: "Pioneer higher education institute focusing on design, software technology, and multimedia arts.",
    popularMajors: ["UI/UX & Interactive Design", "Graphic Design", "Software Engineering"],
    website: "https://setec.edu.kh",
    established: "2007",
    studentCount: "3,500+",
    taglinePrefix: "Innovate through Creative",
    taglineHighlight: "Technology",
    undergraduate: {
      title: "Bachelor of Design & Software Engineering",
      description: "Project-driven curriculum merging aesthetic principles, motion graphics, and robust frontend/backend systems.",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master in Multimedia & Digital Systems",
      description: "Advanced study in 3D visual production, user experience research, and interactive system architecture.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Design & Multimedia Arts", shortCode: "DMA", description: "UI/UX interaction, branding typography, 3D computer animation, and motion design.", iconName: "laptop" },
      { title: "Information Technology & Software", shortCode: "ITS", description: "Full-stack web applications, mobile architectures, database design, and cloud hosting.", iconName: "database" },
      { title: "Network Technology & Security", shortCode: "NTS", description: "Enterprise routing, firewall implementation, server administration, and cybersecurity.", iconName: "shield" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "Design Portfolio or Placement Review",
      "Registration Dossier",
    ],
    applicationDeadline: "September 02, 2026",
    facilities: [
      { name: "Apple Multimedia Design Lab", image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&auto=format&fit=crop&q=80" },
      { name: "Digital Audio & Video Studio", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Creative Tech Pioneer Award",
      deadline: "18 Sep, 2026",
      image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/setecPhnomPenhLocation",
  },
  {
    id: "uc",
    name: "The University of Cambodia",
    shortName: "UC",
    location: "Phnom Penh",
    type: "Private",
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1600&auto=format&fit=crop&q=80",
    description: "Dynamic university offering undergraduate and postgraduate programs across sciences, humanities, and technology.",
    popularMajors: ["Computer Science", "International Relations", "Business", "Communication"],
    website: "https://uc.edu.kh",
    established: "2003",
    studentCount: "4,000+",
    taglinePrefix: "Preparing Future Leaders for",
    taglineHighlight: "Southeast Asia",
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description: "English and Khmer track bachelor degree programs delivering modern career competency and global perspectives.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Graduate Degree (Master & PhD)",
      description: "Rigorous doctoral and master dissertations in international affairs, education management, and digital business.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Science & Technology Division", shortCode: "CST", description: "Computer science, network systems, database management, and software solutions.", iconName: "laptop" },
      { title: "School of International Relations", shortCode: "SIR", description: "Diplomatic protocol, foreign policy analysis, human rights law, and international commerce.", iconName: "globe" },
      { title: "School of Business & Economics", shortCode: "SBE", description: "Accounting, strategic brand marketing, organizational leadership, and finance.", iconName: "briefcase" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "English Proficiency Evaluation",
      "Completed Admissions Form",
    ],
    applicationDeadline: "August 30, 2026",
    facilities: [
      { name: "Toshu Fukami Central Library", image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&auto=format&fit=crop&q=80" },
      { name: "Moot Court & Debate Hall", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Samdech Techo Hun Sen Vision Scholarship",
      deadline: "25 Sep, 2026",
      image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/ucPhnomPenhLocation",
  },
  {
    id: "nubb",
    name: "National University of Battambang",
    shortName: "NUBB",
    location: "Battambang",
    type: "Public",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80",
    description: "Key regional university driving agriculture, sustainable engineering, and business in Northwestern Cambodia.",
    popularMajors: ["Environmental Engineering", "Agronomy", "Business Analytics", "IT"],
    website: "https://nubb.edu.kh",
    established: "2007",
    studentCount: "6,000+",
    taglinePrefix: "Empowering Northwestern Cambodia through",
    taglineHighlight: "Innovation",
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description: "Applied practical curricula in agricultural sciences, sustainable engineering, business management, and modern computing.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master in Sustainable Agriculture & IT",
      description: "Regional research programs focused on smart food supply chains, precision farming, and digital entrepreneurship.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Agricultural Technology & Smart Farming", shortCode: "AGRI", description: "IoT soil sensors, drone crop monitoring, hydroponics, and sustainable bio-fertilizer.", iconName: "globe" },
      { title: "Applied Computer Science", shortCode: "CS", description: "Web application development, database management systems, and regional IT service solutions.", iconName: "laptop" },
      { title: "Agribusiness & International Trade", shortCode: "AB", description: "Supply chain management, agricultural exports, enterprise finance, and cooperative business.", iconName: "briefcase" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "University Enrollment Registration",
      "National ID / Residence Verification",
    ],
    applicationDeadline: "September 05, 2026",
    facilities: [
      { name: "Modern Agricultural Greenhouse Lab", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
      { name: "Regional Information Technology Center", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Battambang Regional Development Grant",
      deadline: "20 Sep, 2026",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/nubbBattambangLocation",
  },
  {
    id: "rupp",
    name: "Royal University of Phnom Penh",
    shortName: "RUPP",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=1600&auto=format&fit=crop&q=80",
    description: "Cambodia's oldest and largest national university spanning science, engineering, social sciences, and humanities.",
    popularMajors: ["Computer Science", "Environmental Science", "Biomedical Sciences", "Psychology"],
    website: "https://rupp.edu.kh",
    established: "1960",
    studentCount: "20,000+",
    taglinePrefix: "Inspiring Leadership through",
    taglineHighlight: "Knowledge",
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description: "Broad 4-year multi-disciplinary degrees combining academic rigor, critical thinking, and collaborative community engagement.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master & Doctoral Research",
      description: "Advanced graduate studies across environmental science, public policy, data science, and cultural preservation.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Computer Science & IT", shortCode: "CS", description: "Software algorithms, distributed computing, database architecture, and cybersecurity principles.", iconName: "laptop" },
      { title: "Environmental Science & Climate", shortCode: "ENV", description: "Ecological research, watershed conservation, biodiversity analysis, and environmental policy.", iconName: "globe" },
      { title: "International Business & Trade", shortCode: "IB", description: "Macroeconomics, cross-border commercial strategy, enterprise marketing, and logistics.", iconName: "briefcase" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "Entrance Examination for Selective Faculties",
      "Completed National Registration Form",
    ],
    applicationDeadline: "September 01, 2026",
    facilities: [
      { name: "CJCC Cambodia-Japan Cooperation Center", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80" },
      { name: "Central Science Discovery Complex", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "RUPP Royal Academic Merit Scholarship",
      deadline: "25 Sep, 2026",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/ruppPhnomPenhLocation",
  },
  {
    id: "itc",
    name: "Institute of Technology of Cambodia",
    shortName: "ITC",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&auto=format&fit=crop&q=80",
    description: "Prestigious engineering school renowned for rigorous civil, electrical, chemical, and software engineering.",
    popularMajors: ["Software Engineering", "AI & Robotics", "Environmental Engineering", "Civil Engineering"],
    website: "https://itc.edu.kh",
    established: "1964",
    studentCount: "7,000+",
    taglinePrefix: "Engineering Excellence for National",
    taglineHighlight: "Development",
    undergraduate: {
      title: "Engineering Degree (Ingénieur)",
      description: "A comprehensive 5-year French-Cambodian accredited engineering diploma program combining core foundational sciences with specialized field projects.",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Engineering & Research",
      description: "Postgraduate research programs addressing national infrastructure, renewable energy, and intelligent robotics.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Software & Intelligent Systems", shortCode: "GIC", description: "Computer systems, AI algorithms, cloud computing architectures, and enterprise software engineering.", iconName: "laptop" },
      { title: "Civil & Structural Engineering", shortCode: "GCI", description: "Urban infrastructure design, geotechnical analysis, and sustainable construction materials.", iconName: "building" },
      { title: "Electrical & Energy Engineering", shortCode: "GEE", description: "Smart grids, renewable power generation, microelectronics, and automation robotics.", iconName: "globe" },
    ],
    admissionRequirements: [
      "High School Diploma with Math/Physics (Bac II)",
      "ITC National Competitive Entrance Examination",
      "Official Transcript & Portfolio",
    ],
    applicationDeadline: "September 10, 2026",
    facilities: [
      { name: "Heavy Structural Materials Testing Lab", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
      { name: "FabLab & IoT Prototyping Workshop", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "ITC Young Engineers Full Tuition Award",
      deadline: "05 Oct, 2026",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/itcPhnomPenhLocation",
  },
  {
    id: "nu",
    name: "Norton University",
    shortName: "NU",
    location: "Phnom Penh",
    type: "Private",
    image: "https://images.unsplash.com/photo-1568792923760-d70635a89fa8?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1568792923760-d70635a89fa8?w=1600&auto=format&fit=crop&q=80",
    description: "The first private university established in Cambodia, delivering degrees in engineering, IT, and health.",
    popularMajors: ["Computer Science", "Civil Engineering", "Architecture", "Health Sciences"],
    website: "https://norton-u.com",
    established: "1996",
    studentCount: "9,000+",
    taglinePrefix: "Pioneering Higher Education in",
    taglineHighlight: "Cambodia",
    undergraduate: {
      title: "Bachelor Degrees in Applied Sciences",
      description: "Comprehensive 4-year programs combining architectural studios, software development labs, and civil surveying.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Science & Technology",
      description: "Postgraduate programs covering construction management, enterprise networking, and biomedical laboratory operations.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Computer Science & Software", shortCode: "CS", description: "Database management, software development, cloud computing, and mobile application engineering.", iconName: "laptop" },
      { title: "Architecture & Urban Planning", shortCode: "ARCH", description: "Tropical green architecture, BIM 3D modeling, structural aesthetics, and interior design.", iconName: "building" },
      { title: "Civil Engineering & Construction", shortCode: "CIVIL", description: "Soil mechanics, concrete structural analysis, highway planning, and project estimation.", iconName: "shield" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "Norton Placement Test",
      "Registration Dossier",
    ],
    applicationDeadline: "September 12, 2026",
    facilities: [
      { name: "Chroy Changvar Main Campus Tower", image: "https://images.unsplash.com/photo-1568792923760-d70635a89fa8?w=600&auto=format&fit=crop&q=80" },
      { name: "Engineering Design Studios", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Norton Founder's Merit Award",
      deadline: "28 Sep, 2026",
      image: "https://images.unsplash.com/photo-1568792923760-d70635a89fa8?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/nuPhnomPenhLocation",
  },
  {
    id: "rufa",
    name: "Royal University of Fine Arts",
    shortName: "RUFA",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1600&auto=format&fit=crop&q=80",
    description: "Historic cultural institution preserving national heritage while innovating contemporary arts and design.",
    popularMajors: ["UI/UX & Interactive Design", "Architecture", "Visual Arts", "Archaeology"],
    website: "https://rufa.edu.kh",
    established: "1917",
    studentCount: "3,000+",
    taglinePrefix: "Preserving Heritage and Creating",
    taglineHighlight: "Masterpieces",
    undergraduate: {
      title: "Bachelor of Fine Arts & Architecture",
      description: "Five-year immersive studio training in classical Khmer craftsmanship, modern architectural theory, and fine arts.",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Cultural Heritage & Archaeology",
      description: "Advanced field excavations, temple conservation research, epigraphy, and museum curatorial studies.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Faculty of Architecture & Urbanism", shortCode: "FAU", description: "Sustainable Khmer architecture, historic monument restoration, and contemporary urban spaces.", iconName: "building" },
      { title: "Faculty of Archaeology", shortCode: "ARCH", description: "Angkorian material culture, conservation science, ceramic analysis, and field excavation.", iconName: "globe" },
      { title: "Faculty of Visual Arts & Graphic Design", shortCode: "FVA", description: "Painting, sculpture, digital visual communication, modern typography, and illustration.", iconName: "laptop" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "RUFA Specialized Drawing & Talent Examination",
      "Official Application Submission",
    ],
    applicationDeadline: "August 25, 2026",
    facilities: [
      { name: "Traditional Khmer Sculpture Studios", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80" },
      { name: "Archaeological Restoration Laboratory", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "National Heritage Artisan Scholarship",
      deadline: "10 Oct, 2026",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/rufaPhnomPenhLocation",
  },
  {
    id: "paragon",
    name: "Paragon International University",
    shortName: "Paragon.U",
    location: "Phnom Penh",
    type: "International",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80",
    description: "International standard university focusing on STEM education, management, and global economics.",
    popularMajors: ["Computer Science", "Civil Engineering", "International Trade", "MIS"],
    website: "https://paragoniu.edu.kh",
    established: "2010",
    studentCount: "2,500+",
    taglinePrefix: "Global Education for Tomorrow's",
    taglineHighlight: "Innovators",
    undergraduate: {
      title: "Bachelor of Science in Engineering & IT",
      description: "100% English-instruction degrees delivered by international faculty using accredited global syllabi.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Science in Information Systems",
      description: "Cloud enterprise architecture, cyber intelligence, and digital organizational transformations.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Computer Science (CS)", shortCode: "CS", description: "Algorithm theory, mobile app programming, full stack software development, and AI tools.", iconName: "laptop" },
      { title: "Civil & Environmental Engineering", shortCode: "CEE", description: "Seismic engineering, hydrology, structural mechanics, and infrastructure design.", iconName: "building" },
      { title: "Management of Information Systems", shortCode: "MIS", description: "Enterprise databases, ERP systems, business process automation, and tech consulting.", iconName: "briefcase" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II or Equivalent)",
      "Paragon English Proficiency Assessment",
      "Math & Science Aptitude Test",
    ],
    applicationDeadline: "August 15, 2026",
    facilities: [
      { name: "Paragon Robotics & AI Lab", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
      { name: "Modern Sports & Recreation Complex", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Paragon High Achievers Full Tuition Exam",
      deadline: "01 Aug, 2026",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/paragonPhnomPenhLocation",
  },
  {
    id: "puc",
    name: "Paññāsāstra University of Cambodia",
    shortName: "PUC",
    location: "Phnom Penh",
    type: "Private",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&auto=format&fit=crop&q=80",
    description: "English-based institution committed to peace education, social justice, and international business leadership.",
    popularMajors: ["Business Administration", "Law", "International Relations", "Education"],
    website: "https://puc.edu.kh",
    established: "1997",
    studentCount: "12,000+",
    taglinePrefix: "Empowering Minds for Peace and",
    taglineHighlight: "Prosperity",
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description: "Comprehensive English medium instruction across governance, international trade, environmental ethics, and legal studies.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master & Doctoral Graduate Studies",
      description: "Leadership graduate certificates in public administration, educational leadership, and international commercial arbitration.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Faculty of Law & Public Policy", shortCode: "LAW", description: "Constitutional law, commercial arbitration, corporate compliance, and human rights.", iconName: "shield" },
      { title: "Faculty of Business & Economics", shortCode: "FBE", description: "Strategic marketing, banking operations, entrepreneurship, and organizational theory.", iconName: "briefcase" },
      { title: "Faculty of Communication & Media", shortCode: "FCM", description: "Journalism, digital media broadcasting, public relations, and cross-cultural communication.", iconName: "globe" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "PUC English Proficiency Test (EPT)",
      "Admissions Dossier Submission",
    ],
    applicationDeadline: "September 18, 2026",
    facilities: [
      { name: "Toul Kork Main Campus Complex", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80" },
      { name: "Peace & Conflict Resolution Institute", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "PUC Chancellor Leadership Grant",
      deadline: "30 Sep, 2026",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/pucPhnomPenhLocation",
  },
  {
    id: "kit",
    name: "Kirirom Institute of Technology",
    shortName: "KIT",
    location: "Kampong Speu",
    type: "International",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&auto=format&fit=crop&q=80",
    description: "Innovative nature-immersed tech campus known for project-based software engineering and AI incubation.",
    popularMajors: ["Software Engineering", "AI & Robotics", "Tourism Management"],
    website: "https://kit.edu.kh",
    established: "2014",
    studentCount: "800+",
    taglinePrefix: "Ignite Future Innovation in the",
    taglineHighlight: "Pine Forest",
    undergraduate: {
      title: "Bachelor of Software Engineering (BSE)",
      description: "Full-immersion 4-year boarding campus where students work on real-world industrial software projects with Japanese enterprises.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Advanced Software Incubation Fellowship",
      description: "Post-graduate startup accelerator focusing on artificial intelligence, game development, and cloud robotics.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Software Engineering (SE)", shortCode: "SE", description: "Full-stack development, mobile systems, cloud infrastructure, and enterprise agile practices.", iconName: "laptop" },
      { title: "Artificial Intelligence (AI)", shortCode: "AI", description: "Deep learning models, computer vision, natural language processing, and robotics algorithms.", iconName: "database" },
      { title: "Sustainable Tourism Management", shortCode: "TM", description: "Eco-tourism design, hospitality management, resort operations, and cultural travel planning.", iconName: "globe" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II with Math priority)",
      "KIT Competitive Mathematics & Logic Exam",
      "English Interview & Coding Aptitude Assessment",
    ],
    applicationDeadline: "August 10, 2026",
    facilities: [
      { name: "Kirirom Pine Forest Eco Campus", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80" },
      { name: "vKirirom Technology Incubator Hub", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "KIT 100% Full Sponsorship Program",
      deadline: "20 Jul, 2026",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/kitKampongSpeuLocation",
  },
  {
    id: "usea",
    name: "University of South-East Asia",
    shortName: "USEA",
    location: "Siem Reap",
    type: "Private",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80",
    description: "Prominent regional university in Siem Reap providing accessible education in hospitality, IT, and law.",
    popularMajors: ["Tourism & Hospitality", "Information Technology", "Business Management"],
    website: "https://usea.edu.kh",
    established: "2006",
    studentCount: "4,500+",
    taglinePrefix: "Gateway to Higher Education in",
    taglineHighlight: "Siem Reap",
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description: "Practical bachelor degrees in international hospitality management, culinary business, computing, and regional law.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Tourism & Business Administration",
      description: "Specialized postgraduate research in heritage tourism economics, hotel management, and community sustainable growth.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Tourism & Hotel Hospitality", shortCode: "THM", description: "Resort management, ecotourism development, international culinary operations, and guest relations.", iconName: "building" },
      { title: "Information Technology", shortCode: "IT", description: "Database architectures, networking solutions, e-commerce systems, and web programming.", iconName: "laptop" },
      { title: "Business Economics & Banking", shortCode: "BEB", description: "Financial management, microfinance administration, business entrepreneurship, and accounting.", iconName: "briefcase" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "USEA Enrollment Dossier",
      "Placement Evaluation",
    ],
    applicationDeadline: "September 15, 2026",
    facilities: [
      { name: "USEA Siem Reap Central Campus", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80" },
      { name: "Hospitality Practice Hotel Lab", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Angkor Regional Youth Scholarship",
      deadline: "28 Sep, 2026",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/useaSiemReapLocation",
  },
  {
    id: "sru",
    name: "Svay Rieng University",
    shortName: "SRU",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop&q=80",
    description: "Public university offering cross-border economic studies, agriculture, and technical training.",
    popularMajors: ["Agricultural Technology", "Business Management", "Computer Science"],
    website: "https://sru.edu.kh",
    established: "2006",
    studentCount: "3,200+",
    taglinePrefix: "Connecting Regional Growth to",
    taglineHighlight: "National Success",
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description: "Applied curricula geared toward cross-border trade, agronomy, industrial logistics, and information technology.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Rural Economy & Logistics",
      description: "Regional research focusing on Special Economic Zone supply chains, agricultural processing, and border economics.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Agronomy & Animal Sciences", shortCode: "AGRI", description: "Livestock management, crop disease diagnosis, soil conservation, and post-harvest technology.", iconName: "globe" },
      { title: "Business Administration & Logistics", shortCode: "BAL", description: "Trade logistics, customs documentation, enterprise finance, and supply chain operations.", iconName: "briefcase" },
      { title: "Computer Science & IT", shortCode: "CS", description: "Network administration, database management systems, web applications, and technical support.", iconName: "laptop" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "SRU National Registration Form",
      "Official Transcript Submission",
    ],
    applicationDeadline: "September 10, 2026",
    facilities: [
      { name: "Agricultural Research Experimental Farm", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80" },
      { name: "Central Academic Building & IT Lab", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Eastern Corridor Agricultural Fellowship",
      deadline: "20 Sep, 2026",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/sruLocation",
  },
  {
    id: "mcu",
    name: "Mean Chey University",
    shortName: "MCU",
    location: "Battambang",
    type: "Public",
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1600&auto=format&fit=crop&q=80",
    description: "Regional institution in Banteay Meanchey focused on rural community development and rural technologies.",
    popularMajors: ["Rural Development", "Environmental Science", "Business"],
    website: "https://mcu.edu.kh",
    established: "2007",
    studentCount: "2,800+",
    taglinePrefix: "Empowering Rural Communities with",
    taglineHighlight: "Knowledge",
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description: "Community-centered education spanning rural technology, local governance, ecology, and small enterprise finance.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Community Development",
      description: "Field research on sustainable rural livelihoods, water resource governance, and rural community microfinance.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      { title: "Rural Development & Governance", shortCode: "RDG", description: "Community organization, project monitoring, microcredit management, and rural sociology.", iconName: "globe" },
      { title: "Information & Communication Technology", shortCode: "ICT", description: "Database design, web solutions, technical hardware systems, and digital literacy training.", iconName: "laptop" },
      { title: "Business Administration & Accounting", shortCode: "BAA", description: "Small business management, commercial bookkeeping, marketing strategies, and taxation.", iconName: "briefcase" },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "University Enrollment Form",
      "Residence Document Verification",
    ],
    applicationDeadline: "September 08, 2026",
    facilities: [
      { name: "MCU Main Campus Academic Center", image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80" },
      { name: "Rural Technology Demonstration Workshop", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Northwest Community Empowerment Award",
      deadline: "24 Sep, 2026",
      image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/mcuLocation",
  },
];

export function getUniversityById(id: string): University | undefined {
  return UNIVERSITIES_DATA.find((u) => u.id === id);
}
