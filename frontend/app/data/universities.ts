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

export interface TuitionDetail {
  facultyOrCategory: string;
  fee: string;
}

export interface FacultyGroup {
  facultyName: string;
  majors: string[];
}

export interface UniversityBranch {
  name: string;
  mapUrl: string;
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
  phone?: string;
  tuitionFee?: string;
  tuitionDetails?: TuitionDetail[];
  facultiesList?: FacultyGroup[];
  scholarshipsList?: string[];
  branches?: UniversityBranch[];
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
    description:
      "Cambodia's national flagship digital higher education institute, specializing in software engineering, artificial intelligence, cybersecurity, and digital entrepreneurship.",
    popularMajors: [
      "Computer Science",
      "Data Science",
      "Cybersecurity",
      "Digital Business & FinTech",
    ],
    website: "https://www.cadt.edu.kh",
    phone: "+855 23 901 111",
    established: "2014",
    studentCount: "1,500+",
    taglinePrefix: "National Flagship Institute for",
    taglineHighlight: "Digital Technology & AI",
    tuitionFee: "$1,200 / year (Full Techo Scholarships Available)",
    tuitionDetails: [
      { facultyOrCategory: "Computer Science (CS)", fee: "$1,200 / year" },
      { facultyOrCategory: "Telecoms & Networking (TN)", fee: "$1,200 / year" },
      { facultyOrCategory: "Digital Business (DB)", fee: "$1,200 / year" },
      { facultyOrCategory: "Techo Digital Talent Scholarship", fee: "100% Full Waiver + Monthly Stipend" },
    ],
    scholarshipsList: [
      "Techo Digital Talent Scholarship 2026 (100% Tuition + Stipend)",
      "CADT Female Tech Leaders Fellowship",
      "MPTC Digital Research & Innovation Grant",
    ],
    facultiesList: [
      {
        facultyName: "Institute of Digital Technology (IDT)",
        majors: [
          "Computer Science (Software Engineering)",
          "Computer Science (Data Science)",
          "Telecommunications & Networking Engineering",
          "Cybersecurity",
          "Digital Business & FinTech",
          "Artificial Intelligence & Machine Learning",
        ],
      },
      {
        facultyName: "Institute of Digital Governance (IDG)",
        majors: [
          "Digital Public Administration",
          "E-Governance & Public Policy",
        ],
      },
    ],
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description:
        "A 4-year intensive project-based curriculum preparing students to innovate and lead Cambodia's digital transformation.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Graduate Degree (Master of Science)",
      description:
        "Specialized 2-year postgraduate degrees in Artificial Intelligence, Big Data Analytics, and Advanced Network Security.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Computer Science (CS)",
        shortCode: "CS",
        description:
          "Advanced software engineering, distributed cloud computing, algorithmic design, and full-stack systems.",
        iconName: "laptop",
      },
      {
        title: "Digital Business (DB)",
        shortCode: "DB",
        description:
          "Technopreneurship, FinTech product design, digital business strategy, and e-commerce analytics.",
        iconName: "briefcase",
      },
      {
        title: "Telecoms & Networking (TN)",
        shortCode: "TN",
        description:
          "Cyber defense, 5G wireless networks, cloud virtualization, and enterprise network architecture.",
        iconName: "globe",
      },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II with Grade Priority)",
      "CADT National Entrance Examination (Math & Logic)",
      "English Proficiency Evaluation & Interview",
    ],
    applicationDeadline: "August 31, 2026",
    facilities: [
      {
        name: "CADT Innovation Center & AI Labs",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Makerspace & IoT Prototyping Workshop",
        image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Digital Library & Tech Incubator",
        image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80",
      },
    ],
    scholarship: {
      title: "Techo Digital Talent Scholarship 2026",
      deadline: "15 Oct, 2026",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/y2XhNsTKEDqKwhzS1",
  },
  {
    id: "rupp",
    name: "Royal University of Phnom Penh",
    shortName: "RUPP",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=1600&auto=format&fit=crop&q=80",
    description:
      "Cambodia's oldest and largest public university, established in 1960. Strong in science, technology, social sciences, humanities and languages.",
    popularMajors: [
      "Computer Science",
      "Information Technology Engineering",
      "Data Science and Engineering",
      "International Relations",
    ],
    website: "https://www.rupp.edu.kh/",
    phone: "+855 23 724 370",
    established: "1960",
    studentCount: "20,000+",
    taglinePrefix: "Cambodia's Oldest & Largest Flagship",
    taglineHighlight: "Public University",
    tuitionFee: "$250 – $500 / year (or 1,440,000 KHR / year)",
    tuitionDetails: [
      { facultyOrCategory: "Faculty of Science: Biology", fee: "$350 / year" },
      { facultyOrCategory: "Faculty of Science: Chemistry", fee: "$300 / year" },
      { facultyOrCategory: "Faculty of Science: Biochemistry", fee: "$300 / year" },
      { facultyOrCategory: "Faculty of Science: Physics", fee: "1,440,000 KHR / year" },
      { facultyOrCategory: "Faculty of Science: Mathematics", fee: "$250 / year" },
      { facultyOrCategory: "Faculty of Science: Environmental Science", fee: "$500 / year" },
      { facultyOrCategory: "Faculty of Science: Computer Science", fee: "$450 / year" },
      { facultyOrCategory: "Faculty of Engineering: Food Technology Engineering", fee: "$300 / year" },
      { facultyOrCategory: "Faculty of Social Sciences: Geography and Land Management", fee: "$250 / year" },
      { facultyOrCategory: "Faculty of Social Sciences: History", fee: "$250 / year" },
      { facultyOrCategory: "Faculty of Social Sciences: Khmer Literature", fee: "$250 / year" },
      { facultyOrCategory: "Faculty of Social Sciences: Philosophy", fee: "$250 / year" },
      { facultyOrCategory: "Faculty of Social Sciences: Psychology", fee: "$250 / year" },
      { facultyOrCategory: "Faculty of Social Sciences: Sociology", fee: "$300 / year" },
    ],
    scholarshipsList: [
      "Techo Digital Talent Scholarship 2026",
      "ÆON 1% Club Foundation Scholarship 2026–27",
    ],
    facultiesList: [
      {
        facultyName: "Faculty of Science",
        majors: [
          "Biology",
          "Chemistry",
          "Biochemistry",
          "Physics",
          "Mathematics",
          "Environmental Science",
          "Computer Science",
        ],
      },
      {
        facultyName: "Faculty of Engineering",
        majors: [
          "Information Technology Engineering",
          "Data Science and Engineering",
          "Telecommunication & Electronics Engineering",
          "Environmental Engineering",
          "Bioengineering",
          "Food Technology Engineering",
          "Mechanical Engineering",
          "Business & Supply Chain Analytics",
        ],
      },
      {
        facultyName: "Faculty of Development Studies",
        majors: [
          "Community Development",
          "Economic Development",
          "Natural Resources Management and Development",
        ],
      },
      {
        facultyName: "Faculty of Social Sciences and Humanities",
        majors: [
          "Geography and Land Management",
          "History",
          "International Business Management",
          "Khmer Literature",
          "Linguistics",
          "Media Management",
          "Philosophy",
          "Psychology",
          "Sociology",
          "Social Work",
          "Tourism",
        ],
      },
      {
        facultyName: "Institute for International Studies and Public Policy (IISPP)",
        majors: [
          "International Relations",
          "International Economics",
          "Political Science and Public Policy",
        ],
      },
      {
        facultyName: "Institute of Foreign Languages (IFL)",
        majors: ["English", "Chinese", "French", "Japanese", "Korean"],
      },
    ],
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description:
        "Comprehensive 4-year bachelor degrees across natural sciences, cutting-edge engineering, humanities, and international languages.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Graduate Degree (Master & PhD)",
      description:
        "Distinguished postgraduate research degrees in data science, public policy, environmental management, and translation studies.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Computer Science & IT Engineering",
        shortCode: "CS",
        description: "Software engineering, data analytics, artificial intelligence, and network infrastructure.",
        iconName: "laptop",
      },
      {
        title: "International Studies & Diplomacy",
        shortCode: "IISPP",
        description: "Diplomatic policy, global political economy, international law, and regional affairs.",
        iconName: "globe",
      },
      {
        title: "Bioengineering & Food Technology",
        shortCode: "BIO",
        description: "Biotechnological research, agricultural processing, biochemical analysis, and food safety.",
        iconName: "briefcase",
      },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "Entrance Exam for Selective Faculties (IT, Engineering, IFL)",
      "Completed National Application Form",
    ],
    applicationDeadline: "September 01, 2026",
    facilities: [
      { name: "CJCC Cambodia-Japan Cooperation Center", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80" },
      { name: "Central Science Discovery Complex", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
      { name: "Hun Sen Central Library", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Techo Digital Talent & ÆON Scholarship",
      deadline: "15 Oct, 2026",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/WB5dLiBXZekXCVfk7",
  },
  {
    id: "itc",
    name: "Institute of Technology of Cambodia",
    shortName: "ITC",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&auto=format&fit=crop&q=80",
    description:
      "Cambodia's leading public engineering and technology institution, known particularly for engineering, science and technology.",
    popularMajors: [
      "Civil Engineering",
      "Information and Communication Engineering",
      "Electrical and Energy Engineering",
      "Food Technology and Chemical Engineering",
    ],
    website: "https://itc.edu.kh/",
    phone: "+855 23 880 370",
    established: "1964",
    studentCount: "7,000+",
    taglinePrefix: "Leading Center for Cambodian",
    taglineHighlight: "Engineering & Technology",
    tuitionFee: "Female: $650 / year | Male: $800 / year (All 12 Majors)",
    tuitionDetails: [
      { facultyOrCategory: "Female students (All 12 majors)", fee: "$650 / year" },
      { facultyOrCategory: "Male students (All 12 majors)", fee: "$800 / year" },
    ],
    scholarshipsList: ["Techo Digital Talent Scholarship 2026"],
    facultiesList: [
      {
        facultyName: "Faculty of Chemical and Food Engineering",
        majors: ["Food Technology and Chemical Engineering"],
      },
      {
        facultyName: "Faculty of Civil Engineering",
        majors: ["Civil Engineering", "Architectural Engineering", "Transportation Engineering"],
      },
      {
        facultyName: "Faculty of Electrical Engineering",
        majors: ["Electrical and Energy Engineering"],
      },
      {
        facultyName: "Faculty of Industrial and Mechanical Engineering",
        majors: ["Industrial and Mechanical Engineering"],
      },
      {
        facultyName: "Faculty of Information and Communication Engineering",
        majors: ["Information and Communication Engineering"],
      },
      {
        facultyName: "Faculty of Telecommunication and Network Engineering",
        majors: ["Telecommunication and Network Engineering"],
      },
      {
        facultyName: "Faculty of Geo-resources and Geotechnical Engineering",
        majors: ["Geo-resources and Geotechnical Engineering"],
      },
      {
        facultyName: "Faculty of Hydrology and Water Resources Engineering",
        majors: ["Water Resources Engineering and Rural Infrastructure", "Water and Environmental Engineering"],
      },
      {
        facultyName: "Faculty of Applied Mathematics and Statistics",
        majors: ["Applied Mathematics and Statistics"],
      },
    ],
    undergraduate: {
      title: "Engineering Degree (Ingénieur) & Bachelor",
      description:
        "Rigorous 5-year French-Cambodian accredited engineering program combining fundamental mathematics with heavy industrial practice.",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Engineering & Research",
      description:
        "Advanced graduate research tackling infrastructure sustainability, renewable energy grids, and water resource management.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Information & Communication Engineering",
        shortCode: "GIC",
        description: "Intelligent software systems, AI algorithms, cloud computing, and telecommunications.",
        iconName: "laptop",
      },
      {
        title: "Civil & Transportation Engineering",
        shortCode: "GCI",
        description: "Bridge, highway, building structures, structural testing, and urban infrastructure.",
        iconName: "building",
      },
      {
        title: "Electrical & Energy Engineering",
        shortCode: "GEE",
        description: "Smart grids, renewable electricity, industrial automation, and power engineering.",
        iconName: "shield",
      },
    ],
    admissionRequirements: [
      "High School Diploma with Science Track (Bac II)",
      "ITC National Competitive Entrance Examination",
      "Official Transcript & Registration Dossier",
    ],
    applicationDeadline: "September 10, 2026",
    facilities: [
      { name: "Heavy Structural Materials Testing Lab", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" },
      { name: "FabLab & Robotics Workshop", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Techo Digital Talent Scholarship 2026",
      deadline: "10 Oct, 2026",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/6F3d7NAnjjc6Gsd77",
  },
  {
    id: "paragon",
    name: "Paragon International University",
    shortName: "Paragon.U",
    location: "Phnom Penh",
    type: "International",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80",
    description:
      "Private international university focused strongly on engineering, ICT, business, mathematics and international education.",
    popularMajors: [
      "Computer Science",
      "Architecture",
      "Data Science",
      "Banking and Finance",
    ],
    website: "https://www.paragoniu.edu.kh",
    phone: "+855 23 996 111",
    established: "2010",
    studentCount: "2,500+",
    taglinePrefix: "Inspiring Leadership through",
    taglineHighlight: "International Education",
    tuitionFee: "$1,750 – $2,250 / semester",
    tuitionDetails: [
      { facultyOrCategory: "Faculty of Engineering: Architecture", fee: "$2,250 / semester" },
      { facultyOrCategory: "Faculty of Engineering: Civil Engineering", fee: "$2,250 / semester" },
      { facultyOrCategory: "Faculty of Engineering: Industrial Engineering", fee: "$2,250 / semester" },
      { facultyOrCategory: "Faculty of ICT: Computer Science", fee: "$2,000 / semester" },
      { facultyOrCategory: "Faculty of ICT: Digital Arts and Design", fee: "$2,000 / semester" },
      { facultyOrCategory: "Faculty of ICT: Management of Information Systems", fee: "$2,000 / semester" },
      { facultyOrCategory: "Faculty of Economics: Banking and Finance", fee: "$1,750 / semester" },
      { facultyOrCategory: "Faculty of Economics: Business Administration", fee: "$1,750 / semester" },
      { facultyOrCategory: "Faculty of Economics: Economics", fee: "$1,750 / semester" },
      { facultyOrCategory: "Faculty of Economics: International Trade & Logistics", fee: "$1,750 / semester" },
      { facultyOrCategory: "Faculty of Economics: International Relations", fee: "$1,750 / semester" },
      { facultyOrCategory: "Faculty of Mathematics & Sciences: Mathematics", fee: "$1,750 / semester" },
      { facultyOrCategory: "Faculty of Mathematics & Sciences: Data Science", fee: "$1,750 / semester" },
      { facultyOrCategory: "Faculty of Media: Media & Communication Management", fee: "$1,750 / semester" },
    ],
    scholarshipsList: ["Paragon.U Scholarship Exam 2026"],
    facultiesList: [
      {
        facultyName: "Faculty of Engineering",
        majors: ["Architecture", "Civil Engineering", "Industrial Engineering"],
      },
      {
        facultyName: "Faculty of Information and Computer Technologies",
        majors: ["Computer Science", "Digital Arts and Design", "Management of Information Systems"],
      },
      {
        facultyName: "Faculty of Economics and Administrative Sciences",
        majors: [
          "Banking and Finance",
          "Business Administration",
          "Economics",
          "International Trade and Logistics",
          "International Relations",
        ],
      },
      {
        facultyName: "Faculty of Mathematics and Sciences",
        majors: ["Mathematics", "Data Science"],
      },
      {
        facultyName: "Faculty of Media and Communications",
        majors: ["Media and Communication Management"],
      },
    ],
    undergraduate: {
      title: "Bachelor Degrees (English-Medium)",
      description:
        "100% English-instruction programs with accredited international curricula, modern labs, and foreign university partnerships.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Science Programs",
      description:
        "Master degrees concentrating on management of information systems, enterprise analytics, and civil engineering technology.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Computer Science & Data Science",
        shortCode: "CS",
        description: "Cloud computing, machine learning, algorithms, full-stack software development, and big data.",
        iconName: "laptop",
      },
      {
        title: "Architecture & Civil Engineering",
        shortCode: "ACE",
        description: "Sustainable architecture, 3D digital BIM drafting, structural analysis, and geotechnical engineering.",
        iconName: "building",
      },
      {
        title: "International Trade & Logistics",
        shortCode: "ITL",
        description: "Supply chain management, international customs, maritime economics, and corporate financial strategy.",
        iconName: "briefcase",
      },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II or International Equivalent)",
      "Paragon English Proficiency Assessment",
      "Math & Aptitude Diagnostic Test",
    ],
    applicationDeadline: "August 15, 2026",
    facilities: [
      { name: "Paragon Robotics & AI Lab", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
      { name: "Modern Sports & Recreation Complex", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Paragon.U Scholarship Exam 2026",
      deadline: "01 Aug, 2026",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/uNmh8B18t12wYNkeA",
  },
  {
    id: "uc",
    name: "The University of Cambodia",
    shortName: "UC",
    location: "Phnom Penh",
    type: "Private",
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1600&auto=format&fit=crop&q=80",
    description:
      "Private university established in 2003 offering programs across business, law, education, media, technology, social sciences and international relations.",
    popularMajors: [
      "Computer Science",
      "International Relations",
      "Law",
      "Accounting",
    ],
    website: "https://www.uc.edu.kh/",
    phone: "+855 23 993 274",
    established: "2003",
    studentCount: "4,000+",
    taglinePrefix: "Building Future Leaders for",
    taglineHighlight: "Cambodia & the World",
    tuitionFee: "$450 / semester (All Bachelor Majors)",
    tuitionDetails: [
      { facultyOrCategory: "All Bachelor Program Majors", fee: "$450 / semester" },
    ],
    scholarshipsList: ["UC Academic & Leadership Scholarships"],
    facultiesList: [
      {
        facultyName: "College of Arts and Humanities",
        majors: ["Asian Studies", "Psychology", "Sociology", "Social Work"],
      },
      {
        facultyName: "College of Education",
        majors: ["Education"],
      },
      {
        facultyName: "College of Law",
        majors: ["Law"],
      },
      {
        facultyName: "The Tony Fernandes School of Business",
        majors: [
          "Accounting",
          "Business Management",
          "Economics",
          "Finance and Banking",
          "Hospitality and Tourism Management",
          "Human Resource Management",
          "International Business",
          "Marketing",
          "Organizational Development",
        ],
      },
      {
        facultyName: "College of Science and Technology",
        majors: [
          "Computer Science",
          "Information Technology",
          "Electronics and Telecommunications",
          "Biology",
          "Chemistry",
          "Mathematics",
          "Physics",
        ],
      },
      {
        facultyName: "College of Social Sciences",
        majors: [
          "History",
          "Development Studies",
          "International Relations",
          "Political Science",
          "Public Administration",
          "Public Policy",
        ],
      },
      {
        facultyName: "College of Media and Communications",
        majors: [
          "Media Arts and Studies",
          "Visual Communications",
          "Communication Studies",
          "Journalism",
        ],
      },
      {
        facultyName: "School of Creative Arts",
        majors: ["Dance Arts", "Dramatic Arts", "Music and Song"],
      },
      {
        facultyName: "School of Foreign Languages",
        majors: [
          "Chinese Language",
          "English Language and Literature",
          "French Language",
          "Japanese Language",
          "Korean Language",
        ],
      },
    ],
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description:
        "English and Khmer track bachelor degree programs delivering modern career competency, critical thinking, and leadership.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Graduate Degree (Master & PhD)",
      description:
        "Rigorous doctoral and master dissertations in international relations, educational management, public policy, and business.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Science & Technology Division",
        shortCode: "CST",
        description: "Computer science, network telecommunications, electronics, and database systems.",
        iconName: "laptop",
      },
      {
        title: "Tony Fernandes Business School",
        shortCode: "TFBS",
        description: "Accounting, corporate marketing, organizational leadership, and finance.",
        iconName: "briefcase",
      },
      {
        title: "College of Law & Social Sciences",
        shortCode: "LAW",
        description: "Judicial procedures, human rights, public policy, and international diplomatic relations.",
        iconName: "shield",
      },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "English Placement Assessment",
      "Completed Admissions Dossier",
    ],
    applicationDeadline: "August 30, 2026",
    facilities: [
      { name: "Toshu Fukami Central Library", image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&auto=format&fit=crop&q=80" },
      { name: "Moot Court & Debate Hall", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Samdech Techo Vision Scholarship",
      deadline: "25 Sep, 2026",
      image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/McywmeZnA3m9qyE47",
  },
  {
    id: "puc",
    name: "Paññāsāstra University of Cambodia",
    shortName: "PUC",
    location: "Phnom Penh",
    type: "Private",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&auto=format&fit=crop&q=80",
    description:
      "Private university emphasizing English-language and international-style education, with programs in business, law, education, social sciences and technology.",
    popularMajors: [
      "Business Administration",
      "Law",
      "Computer Science",
      "TESOL",
    ],
    website: "https://www.puc.edu.kh/",
    phone: "+855 23 990 153",
    established: "1997",
    studentCount: "12,000+",
    taglinePrefix: "Excellence in English-Medium",
    taglineHighlight: "Higher Education & Leadership",
    tuitionFee: "$399 (Yr 1) to $474.50 (Yr 4) / semester",
    tuitionDetails: [
      { facultyOrCategory: "Year 1 Tuition (All Bachelor Majors)", fee: "$399.00 / semester" },
      { facultyOrCategory: "Year 2 Tuition (All Bachelor Majors)", fee: "$424.50 / semester" },
      { facultyOrCategory: "Year 3 Tuition (All Bachelor Majors)", fee: "$449.50 / semester" },
      { facultyOrCategory: "Year 4 Tuition (All Bachelor Majors)", fee: "$474.50 / semester" },
    ],
    scholarshipsList: [
      "Paññāsāstra University of Cambodia (PUC) Entrance Scholarship",
    ],
    facultiesList: [
      {
        facultyName: "Faculty of Business and Economics",
        majors: [
          "Accounting",
          "Business Administration",
          "Economics",
          "Entrepreneurship",
          "Finance and Banking",
          "Global Business Studies",
          "Marketing",
          "Tourism and Hospitality Management",
        ],
      },
      {
        facultyName: "Faculty of Arts, Letters and Humanities",
        majors: [
          "English for Business Communication",
          "History",
          "Khmer Studies",
          "Anthropology",
        ],
      },
      {
        facultyName: "Faculty of Communication and Media Arts",
        majors: ["Journalism", "Mass Media"],
      },
      {
        facultyName: "Faculty of Education",
        majors: [
          "Early Childhood Education",
          "Teaching English to Speakers of Other Languages (TESOL)",
          "Special Education",
        ],
      },
      {
        facultyName: "Faculty of Law and Public Affairs",
        majors: ["Law", "Public Affairs"],
      },
      {
        facultyName: "Faculty of Mathematics, Sciences and Engineering",
        majors: ["Computer Science"],
      },
    ],
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description:
        "Comprehensive English-medium instruction spanning business finance, legal jurisprudence, education, and computer science.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master & Doctoral Graduate Studies",
      description:
        "Postgraduate education in international commercial arbitration, educational administration, and peace studies.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Faculty of Business & Economics",
        shortCode: "FBE",
        description: "Banking, entrepreneurial venture creation, corporate finance, and global marketing.",
        iconName: "briefcase",
      },
      {
        title: "Faculty of Law & Public Affairs",
        shortCode: "LAW",
        description: "Cambodian legal systems, international human rights law, public affairs, and arbitration.",
        iconName: "shield",
      },
      {
        title: "Faculty of Education & TESOL",
        shortCode: "EDU",
        description: "Pedagogical theory, modern English language instruction, and educational leadership.",
        iconName: "globe",
      },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "PUC English Proficiency Test (EPT)",
      "Completed Admissions Dossier",
    ],
    applicationDeadline: "September 18, 2026",
    facilities: [
      { name: "Toul Kork Main Campus Complex", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80" },
      { name: "Peace & Conflict Resolution Institute", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "PUC Entrance Scholarship 2026",
      deadline: "30 Sep, 2026",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/PVMWz24irUFhFave6",
  },
  {
    id: "rua",
    name: "Royal University of Agriculture",
    shortName: "RUA",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop&q=80",
    description:
      "Cambodia's specialized public university for agriculture, food, natural resources, veterinary science and rural development.",
    popularMajors: [
      "Agricultural Sciences",
      "Veterinary Medicine",
      "Food Science and Technology",
      "Agricultural Engineering",
    ],
    website: "https://www.rua.edu.kh/",
    phone: "+855 11 967 877",
    established: "1964",
    studentCount: "5,000+",
    taglinePrefix: "Pioneering Sustainable Agricultural Science &",
    taglineHighlight: "Rural Innovation",
    tuitionFee: "$500 / semester (All Bachelor Programs)",
    tuitionDetails: [
      { facultyOrCategory: "All Bachelor Program Majors", fee: "$500 / semester" },
    ],
    scholarshipsList: [
      "RUA Agricultural Excellence & Government Sponsorship Grants",
    ],
    facultiesList: [
      {
        facultyName: "Faculty of Agronomy",
        majors: ["Agricultural Sciences"],
      },
      {
        facultyName: "Faculty of Animal Science",
        majors: ["Animal Science"],
      },
      {
        facultyName: "Faculty of Veterinary Medicine",
        majors: ["Veterinary Medicine"],
      },
      {
        facultyName: "Faculty of Forestry",
        majors: ["Forest and Climate Change"],
      },
      {
        facultyName: "Faculty of Fisheries and Aquaculture",
        majors: ["Fisheries and Aquaculture Sciences"],
      },
      {
        facultyName: "Faculty of Agricultural Biosystems Engineering",
        majors: ["Agricultural Engineering"],
      },
      {
        facultyName: "Faculty of Agricultural Economics and Rural Development",
        majors: ["Agricultural Economics and Rural Development"],
      },
      {
        facultyName: "Faculty of Agro-Industry",
        majors: ["Food Science and Technology", "Food and Nutrition"],
      },
      {
        facultyName: "Faculty of Land Management and Land Administration",
        majors: ["Land Management and Land Administration"],
      },
      {
        facultyName: "Faculty of Agricultural Education and Communications",
        majors: ["Agricultural Education and Extension"],
      },
    ],
    undergraduate: {
      title: "Bachelor of Agricultural Sciences & Engineering",
      description:
        "Hands-on scientific training in climate-smart agriculture, livestock health, food technology, and forestry conservation.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master & Doctoral Research",
      description:
        "Postgraduate programs dedicated to sustainable crop development, animal genetics, and agricultural trade economics.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Veterinary Medicine & Animal Science",
        shortCode: "VET",
        description: "Clinical veterinary care, animal epidemiology, nutrition, and livestock husbandry.",
        iconName: "heart",
      },
      {
        title: "Food Science & Agro-Industry",
        shortCode: "FOOD",
        description: "Food safety microbiology, nutritional processing, post-harvest systems, and agro-business.",
        iconName: "briefcase",
      },
      {
        title: "Forestry & Climate Change",
        shortCode: "FOR",
        description: "Forest ecosystem preservation, climate resilience, biodiversity mapping, and watershed ecology.",
        iconName: "globe",
      },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "National Agricultural Entrance Examination",
      "Registration Document Verification",
    ],
    applicationDeadline: "September 15, 2026",
    facilities: [
      { name: "Agricultural Demonstration Research Farms", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80" },
      { name: "Veterinary Teaching Hospital & Lab", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "National Agricultural Talent Sponsorship",
      deadline: "20 Sep, 2026",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/Z22MpuhFyxepHBQaA",
  },
  {
    id: "aupp",
    name: "American University of Phnom Penh",
    shortName: "AUPP",
    location: "Phnom Penh",
    type: "International",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80",
    description:
      "International private university offering American-style education and several dual-degree partnerships with U.S. universities.",
    popularMajors: [
      "Artificial Intelligence",
      "Computer Science",
      "Cybersecurity",
      "Business Administration",
    ],
    website: "https://www.aupp.edu.kh/",
    phone: "+855 23 990 023",
    established: "2013",
    studentCount: "2,000+",
    taglinePrefix: "American-Standard Degrees in the",
    taglineHighlight: "Heart of Cambodia",
    tuitionFee: "Single: $3,000 / semester | Dual: $4,500 / semester",
    tuitionDetails: [
      { facultyOrCategory: "Single Degree (AUPP Degree)", fee: "$3,000 / semester" },
      { facultyOrCategory: "Dual Degree (AUPP + University of Arizona)", fee: "$4,500 / semester" },
    ],
    scholarshipsList: [
      "Techo Digital Talent Scholarship 2026",
      "AMT Scholarship 2026",
      "UYFC Scholarship 2026",
      "Rookaiyal Ammal's Girls Scholarship",
      "AUPP Academic Excellence Scholarship",
      "AUPP Financial Need Scholarship",
    ],
    facultiesList: [
      {
        facultyName: "Faculty of Business and Management",
        majors: ["Business Administration", "Communication", "e-Society (Digital Marketing)"],
      },
      {
        facultyName: "Faculty of Digital Technologies",
        majors: [
          "Artificial Intelligence",
          "Computer Science",
          "Cybersecurity",
          "Data Analytics",
          "Digital Infrastructure",
          "Information & Communications Technology",
          "Interactive App Design & Development",
          "Software Development",
        ],
      },
      {
        facultyName: "Faculty of Law",
        majors: ["Law"],
      },
      {
        facultyName: "Faculty of Social Sciences",
        majors: ["International Relations and Diplomacy"],
      },
    ],
    undergraduate: {
      title: "Undergraduate Dual Degree Program",
      description:
        "US-accredited degrees awarded directly by the University of Arizona and Fort Hays State University studied in Phnom Penh.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Business Administration (MBA)",
      description:
        "Executive master curricula cultivating strategic leadership, corporate innovation, and global commercial strategy.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Artificial Intelligence & Software",
        shortCode: "AI",
        description: "Full-stack software engineering, deep learning models, cloud systems, and data analytics.",
        iconName: "laptop",
      },
      {
        title: "Cybersecurity & Infrastructure",
        shortCode: "CYB",
        description: "Ethical hacking, enterprise network defenses, cryptography, and digital forensics.",
        iconName: "shield",
      },
      {
        title: "Business & Digital Marketing",
        shortCode: "BUS",
        description: "Corporate finance, venture entrepreneurship, international marketing, and e-society.",
        iconName: "briefcase",
      },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II or International Equivalent)",
      "IELTS 6.0+ or AUPP English Proficiency Assessment",
      "Personal Statement & Admissions Interview",
    ],
    applicationDeadline: "August 20, 2026",
    facilities: [
      { name: "Ultra-Modern 7-Hectare Eco Campus", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80" },
      { name: "Bloomberg Financial Trading Terminal", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "Techo Digital Talent & AUPP Merit Awards",
      deadline: "10 Aug, 2026",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/CLvpnA48QuM8JhGj9",
  },
  {
    id: "rufa",
    name: "Royal University of Fine Arts",
    shortName: "RUFA",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1600&auto=format&fit=crop&q=80",
    description:
      "Cambodia's leading public institution specializing in arts, architecture, culture, fine arts and performing arts.",
    popularMajors: [
      "Architecture",
      "Urbanism and Regional Planning",
      "Archaeology",
      "Communication Design",
    ],
    website: "https://www.rufa.edu.kh/",
    phone: "+855 23 986 417",
    established: "1917",
    studentCount: "3,000+",
    taglinePrefix: "Preserving Heritage & Inspiring Contemporary",
    taglineHighlight: "Khmer Arts & Architecture",
    tuitionFee: "$300 – $750 / year (by faculty & year)",
    tuitionDetails: [
      { facultyOrCategory: "Architecture & Urbanism (Yr 1)", fee: "$550 / year" },
      { facultyOrCategory: "Architecture & Urbanism (Yrs 2–5)", fee: "$750 / year" },
      { facultyOrCategory: "Archaeology & Conservation (Yr 1)", fee: "$300 / year" },
      { facultyOrCategory: "Archaeology & Conservation (Yrs 2–5)", fee: "$400 / year" },
      { facultyOrCategory: "Fine Arts: Painting, Sculpture, Design (Yr 1)", fee: "$500 / year" },
      { facultyOrCategory: "Fine Arts: Painting, Sculpture, Design (Yrs 2–4)", fee: "$600 / year" },
      { facultyOrCategory: "Faculty of Music", fee: "$400 / year" },
    ],
    scholarshipsList: ["National Arts & Cultural Heritage Scholarship"],
    branches: [
      { name: "Branch 1 (Main Campus)", mapUrl: "https://maps.app.goo.gl/9GRa7RARzGm6FYR79" },
      { name: "Branch 2", mapUrl: "https://maps.app.goo.gl/9uX2R88EwycbX9cd7" },
    ],
    facultiesList: [
      {
        facultyName: "Faculty of Architecture",
        majors: ["Architecture", "Urbanism and Regional Planning"],
      },
      {
        facultyName: "Faculty of Archaeology",
        majors: ["Archaeology", "Cultural Heritage Conservation"],
      },
      {
        facultyName: "Faculty of Fine Arts",
        majors: [
          "Painting",
          "Sculpture",
          "Communication Design",
          "Architectural Decoration / Interior Design",
        ],
      },
      {
        facultyName: "Faculty of Music",
        majors: ["Music", "Traditional Khmer Music"],
      },
      {
        facultyName: "Faculty of Choreographic Arts",
        majors: ["Classical Khmer Dance", "Traditional Dance", "Lakhon Khol"],
      },
      {
        facultyName: "Faculty of Dramatic Arts",
        majors: ["Lakhon Bassac", "Lakhon Yike", "Lakhon Niyeay"],
      },
    ],
    undergraduate: {
      title: "Bachelor of Fine Arts & Architecture",
      description:
        "Five-year immersive studio training in classical Khmer craftsmanship, modern architectural theory, and fine arts.",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Cultural Heritage & Archaeology",
      description:
        "Advanced field excavations, temple conservation research, epigraphy, and museum curatorial studies.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Faculty of Architecture & Urbanism",
        shortCode: "FAU",
        description: "Sustainable Khmer architecture, historic monument restoration, and contemporary urban spaces.",
        iconName: "building",
      },
      {
        title: "Faculty of Archaeology",
        shortCode: "ARCH",
        description: "Angkorian material culture, conservation science, ceramic analysis, and field excavation.",
        iconName: "globe",
      },
      {
        title: "Faculty of Visual Arts & Graphic Design",
        shortCode: "FVA",
        description: "Painting, sculpture, digital visual communication, modern typography, and illustration.",
        iconName: "laptop",
      },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "RUFA Specialized Drawing & Talent Examination",
      "Official Application Dossier Submission",
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
    mapUrl: "https://maps.app.goo.gl/9GRa7RARzGm6FYR79",
  },
  {
    id: "up",
    name: "University of Puthisastra",
    shortName: "UP",
    location: "Phnom Penh",
    type: "Private",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&auto=format&fit=crop&q=80",
    description:
      "Private university specializing strongly in health sciences, medicine, pharmacy, dentistry, nursing and technology.",
    popularMajors: [
      "Medical Sciences (Medicine)",
      "Pharmacy",
      "Doctor of Dental Surgery",
      "Information Technology",
    ],
    website: "https://www.puthisastra.edu.kh/",
    phone: "+855 23 221 624",
    established: "2007",
    studentCount: "3,500+",
    taglinePrefix: "Advancing Cambodian Healthcare and",
    taglineHighlight: "Life Sciences Education",
    tuitionFee: "$534 – $1,363 / semester",
    tuitionDetails: [
      { facultyOrCategory: "Faculty of Health Sciences: Medicine", fee: "$1,363 / semester" },
      { facultyOrCategory: "Faculty of Health Sciences: Pharmacy", fee: "$1,363 / semester" },
      { facultyOrCategory: "Faculty of Health Sciences: Dentistry", fee: "$1,363 / semester" },
      { facultyOrCategory: "Faculty of Health Sciences: Nursing", fee: "$820 / semester" },
      { facultyOrCategory: "Faculty of Health Sciences: Midwifery", fee: "$820 / semester" },
      { facultyOrCategory: "Faculty of Science & Tech: IT (Networking / DB)", fee: "$1,363 / semester" },
      { facultyOrCategory: "Other: Laboratory", fee: "$534 / semester" },
      { facultyOrCategory: "Other: Health Counseling, 3+1 Midwifery, BSN", fee: "$820 / semester" },
    ],
    scholarshipsList: ["UP Healthcare Talent & Academic Merit Scholarships"],
    facultiesList: [
      {
        facultyName: "Faculty of Pharmacy",
        majors: ["Pharmacy"],
      },
      {
        facultyName: "Faculty of Medicine",
        majors: ["Medical Sciences / Doctor of Medicine (General Medicine)"],
      },
      {
        facultyName: "Faculty of Dentistry",
        majors: ["Doctor of Dental Surgery (Dentistry)"],
      },
      {
        facultyName: "Faculty of Nursing & Midwifery",
        majors: ["Science of Nursing", "Science of Midwifery"],
      },
      {
        facultyName: "Faculty of Health Sciences & Biotechnology",
        majors: ["Medical Laboratory Technology (bridging/bachelor pathway)"],
      },
      {
        facultyName: "Faculty of Science and Technology",
        majors: [
          "Information Technology",
          "Database & Programming",
          "Networking & System Administration",
          "Science Research",
        ],
      },
      {
        facultyName: "Faculty of Arts, Humanities & Languages",
        majors: ["English, Business and Entrepreneurship (BAEBE)"],
      },
    ],
    undergraduate: {
      title: "Undergraduate Degrees in Health & Tech",
      description:
        "Comprehensive clinical and technical curriculum preparing compassionate healthcare practitioners and tech innovators.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Specialized Medical Residencies",
      description:
        "Clinical specialty rotations, dental surgery apprenticeships, and advanced health research certifications.",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Doctor of Dental Surgery (DDS)",
        shortCode: "DDS",
        description: "Modern oral maxillofacial healthcare, orthodontic procedures, and community dental clinics.",
        iconName: "heart",
      },
      {
        title: "Doctor of Medicine (MD)",
        shortCode: "MD",
        description: "Comprehensive medical diagnostics, patient treatment, hospital rotations, and surgical fundamentals.",
        iconName: "shield",
      },
      {
        title: "IT & System Administration",
        shortCode: "IT",
        description: "Enterprise networking, database management, digital health systems, and cybersecurity.",
        iconName: "laptop",
      },
    ],
    admissionRequirements: [
      "High School Diploma with Science Track (Bac II)",
      "University Health Sciences Entrance Exam",
      "Medical Fitness Assessment",
    ],
    applicationDeadline: "September 15, 2026",
    facilities: [
      { name: "UP Dental Clinic Simulation Hospital", image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80" },
      { name: "Medical Research & Biochemistry Labs", image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "UP Health Sciences Excellence Grant",
      deadline: "20 Sep, 2026",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/igK1YAgJfMcqUado6",
  },
  {
    id: "num",
    name: "National University of Management",
    shortName: "NUM",
    location: "Phnom Penh",
    type: "Public",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80",
    description:
      "Public university focused on business, economics, management, finance, accounting, IT and related fields.",
    popularMajors: [
      "Information Technology",
      "Digital Economy",
      "Robotics and AI",
      "Financial Technology (FinTech)",
    ],
    website: "https://www.num.edu.kh/",
    phone: "+855 23 428 120",
    established: "1983",
    studentCount: "10,000+",
    taglinePrefix: "Excellence in Management, Economics &",
    taglineHighlight: "Digital Innovation",
    tuitionFee: "$600 / year (Standard) | $1,200 / year (International)",
    tuitionDetails: [
      { facultyOrCategory: "Standard Bachelor's Degree", fee: "$600 / year" },
      { facultyOrCategory: "NUM International College", fee: "$1,200 / year" },
    ],
    scholarshipsList: [
      "ÆON 1% Club Foundation Scholarship 2026–27",
      "National University of Management (NUM) Undergraduate Scholarship",
      "NUM School of Public Policy Merit Grant",
    ],
    facultiesList: [
      {
        facultyName: "Faculty of Information Technology",
        majors: ["Information Technology", "Business Information Technology", "Robotics and AI"],
      },
      {
        facultyName: "Faculty of Digital Economy",
        majors: ["Digital Economy", "Financial Technology (FinTech)", "Smart City Planning and Management"],
      },
      {
        facultyName: "School of Public Policy",
        majors: ["Public Policy", "International Relations"],
      },
      {
        facultyName: "International College",
        majors: ["International Business (iBBA)", "Global Entrepreneurship & Innovation"],
      },
      {
        facultyName: "International Program of Legal Studies",
        majors: ["International Bachelor of Laws (iLaw)"],
      },
    ],
    undergraduate: {
      title: "Undergraduate Degree (Bachelor)",
      description:
        "Practical training in managerial economics, digital financial technologies, robotics, and international law.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Master of Business Administration (MBA)",
      description:
        "Executive graduate programs tailored for Cambodia's emerging digital economy and financial landscape.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Digital Economy & FinTech",
        shortCode: "FIN",
        description: "Data-driven financial technologies, mobile banking systems, and blockchain economy.",
        iconName: "database",
      },
      {
        title: "Robotics & Artificial Intelligence",
        shortCode: "ROB",
        description: "Autonomous robotics, industrial automation, AI models, and intelligent computing.",
        iconName: "laptop",
      },
      {
        title: "International Business (iBBA)",
        shortCode: "iBBA",
        description: "Global enterprise management, venture innovation, and cross-border trade strategy.",
        iconName: "briefcase",
      },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II)",
      "University Enrollment Registration",
      "Entrance Placement Evaluation",
    ],
    applicationDeadline: "September 08, 2026",
    facilities: [
      { name: "NUM Digital Innovation Center", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80" },
      { name: "Stock Exchange Simulation Room", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "ÆON & NUM Undergraduate Merit Grants",
      deadline: "22 Sep, 2026",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/YFAB1qB7Lxt139p49",
  },
  {
    id: "dmuc",
    name: "De Montfort University Cambodia",
    shortName: "DMUC",
    location: "Phnom Penh",
    type: "International",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
    heroImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80",
    description:
      "De Montfort University Cambodia is the first British university campus in Cambodia, located in Phnom Penh. Students study in Cambodia and graduate with a UK degree awarded by De Montfort University (Leicester, UK). The undergraduate degrees are designed around employability, practical skills, internships, and international career opportunities.",
    popularMajors: [
      "Computer Science",
      "Cyber Security",
      "Finance and Investment",
      "Business Management",
    ],
    website: "https://dmuc.edu.kh/",
    phone: "+855 98 999 682",
    established: "2024",
    studentCount: "500+",
    taglinePrefix: "UK Degree in Cambodia: Empowering",
    taglineHighlight: "Global Employability & Careers",
    tuitionFee: "$10,000 / year ($5,000 / semester) | Award: $8,000 / year",
    tuitionDetails: [
      { facultyOrCategory: "Standard Tuition", fee: "$10,000 / year ($5,000 / semester)" },
      { facultyOrCategory: "Global Gateway Award (20% reduction)", fee: "$8,000 / year ($4,000 / semester)" },
      { facultyOrCategory: "Application Fee (One-Time)", fee: "$100" },
      { facultyOrCategory: "Security Deposit", fee: "$1,500" },
    ],
    scholarshipsList: [
      "DMUC Academic Excellence Scholarship",
      "DMUC Creative Arts Scholarship",
      "DMUC Sporting Excellence Scholarship",
      "DMUC Community Service & Social Impact Scholarship",
    ],
    facultiesList: [
      {
        facultyName: "Undergraduate Degree Programs (Awarded by DMU Leicester, UK)",
        majors: [
          "Accounting and Finance",
          "Business and Marketing",
          "Business Entrepreneurship and Innovation",
          "Business Management",
          "Politics and International Relations",
          "Finance and Investment",
          "Computer Science",
          "Cyber Security",
        ],
      },
    ],
    undergraduate: {
      title: "British Bachelor Honours Degrees",
      description:
        "Complete your entire British degree in Phnom Penh with identical academic credits and diploma awarded by De Montfort University (Leicester, UK).",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80",
    },
    graduate: {
      title: "Global Internship & Career Pathways",
      description:
        "International industry placements, global mobility options to the UK campus, and professional accreditation.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80",
    },
    programs: [
      {
        title: "Computer Science & Cyber Security",
        shortCode: "CS",
        description: "UK-standard computing syllabus, security architecture, cryptography, and full-stack software development.",
        iconName: "laptop",
      },
      {
        title: "Finance & Investment",
        shortCode: "FIN",
        description: "Capital markets, corporate finance, investment analysis, and financial instruments.",
        iconName: "database",
      },
      {
        title: "Business & Marketing",
        shortCode: "BUS",
        description: "Global business strategy, entrepreneurial brand creation, and managerial economics.",
        iconName: "briefcase",
      },
    ],
    admissionRequirements: [
      "High School Diploma (Bac II or International Equivalent)",
      "English Proficiency (IELTS 6.0 or DMUC English Test)",
      "Application Form & Interview",
    ],
    applicationDeadline: "September 20, 2026",
    facilities: [
      { name: "DMUC Modern British Academic Campus", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80" },
      { name: "Computing & Collaborative Co-working Lab", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    ],
    scholarship: {
      title: "DMUC Academic & Leadership Scholarships",
      deadline: "15 Sep, 2026",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
    },
    mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80",
    mapUrl: "https://maps.app.goo.gl/SUnHqW8K3Cne3szj9",
  },
];

export function getUniversityById(id: string): University | undefined {
  return UNIVERSITIES_DATA.find((u) => u.id.toLowerCase() === id.toLowerCase());
}
