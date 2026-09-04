import {
  Laptop,
  Briefcase,
  Cpu,
  GraduationCap,
  Compass,
  Palette,
  ShieldCheck,
  Database,
  Brain,
  Layers,
  Coins,
  Megaphone,
  LineChart,
  Building,
  Building2,
  Wrench,
  Globe,
  Scale,
  UtensilsCrossed,
  Network,
  Code2,
  LucideIcon,
} from "lucide-react";

/* ── Interfaces ────────────────────────────────────────── */

export interface LearnItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface CareerPathway {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface RelatedMajorLink {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface UniversityItem {
  name: string;
  shortName: string;
  location: string;
  image: string;
  websiteUrl?: string;
}

export interface OpportunityItem {
  title: string;
  type: string;
  badgeText: string;
  deadline?: string;
  image: string;
  link?: string;
}

export interface MajorItem {
  id: string;
  name: string;
  category: string;
  badge?: {
    text: string;
    bg: string;
    textColor: string;
  };
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  description: string;
  extendedDescription?: string;
  tags: string[];
  duration: string;
  degreeType: string;
  source: string;
  sourceUrl: string;
  lastVerified: string;
  heroImage: string;
  whatYouLearn: LearnItem[];
  skillsDeveloped: string[];
  careerPathways: CareerPathway[];
  careerOpportunities: string;
  jobMarketDemand: string;
  relatedMajors: RelatedMajorLink[];
  offerUniversities: UniversityItem[];
  relatedOpportunities: OpportunityItem[];
}

/* ── Categories (6 Exact Categories from Official Resource) ── */

export const CATEGORIES = [
  {
    id: "Technology & Computing",
    name: "Technology & Computing",
    icon: Laptop,
    bg: "bg-sitomo",
    iconColor: "text-sky-deep",
  },
  {
    id: "Business & Management",
    name: "Business & Management",
    icon: Briefcase,
    bg: "bg-momo",
    iconColor: "text-[#D97736]",
  },
  {
    id: "Engineering & Architecture",
    name: "Engineering & Architecture",
    icon: Cpu,
    bg: "bg-sitomo",
    iconColor: "text-blue-ink",
  },
  {
    id: "Social Sciences & Humanities",
    name: "Social Sciences & Humanities",
    icon: GraduationCap,
    bg: "bg-momo",
    iconColor: "text-[#8B5CF6]",
  },
  {
    id: "Tourism & Hospitality",
    name: "Tourism & Hospitality",
    icon: Compass,
    bg: "bg-sitomo",
    iconColor: "text-[#10B981]",
  },
  {
    id: "Arts, Design & Media",
    name: "Arts, Design & Media",
    icon: Palette,
    bg: "bg-momo",
    iconColor: "text-[#EF4444]",
  },
];

/* ── University Directory Helper for Majors ─────────────── */

const UNI_MAP: Record<string, UniversityItem> = {
  PUC: {
    name: "Paññāsāstra University of Cambodia",
    shortName: "PUC",
    location: "Phnom Penh",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://puc.edu.kh",
  },
  "Paragon.U": {
    name: "Paragon International University",
    shortName: "Paragon.U",
    location: "Phnom Penh",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://paragoniu.edu.kh",
  },
  AUPP: {
    name: "American University of Phnom Penh",
    shortName: "AUPP",
    location: "Phnom Penh",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://aupp.edu.kh",
  },
  CADT: {
    name: "Cambodia Academy of Digital Technology",
    shortName: "CADT",
    location: "Phnom Penh",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://cadt.edu.kh",
  },
  UME: {
    name: "University of Management and Economics",
    shortName: "UME",
    location: "Battambang & Phnom Penh",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://ume.edu.kh",
  },
  CamTech: {
    name: "Cambodia University of Technology and Science",
    shortName: "CamTech",
    location: "Phnom Penh",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://camtech.edu.kh",
  },
  RUPP: {
    name: "Royal University of Phnom Penh",
    shortName: "RUPP",
    location: "Phnom Penh",
    image: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://rupp.edu.kh",
  },
  ITC: {
    name: "Institute of Technology of Cambodia",
    shortName: "ITC",
    location: "Phnom Penh",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://itc.edu.kh",
  },
};

function parseUniversities(uniListStr: string): UniversityItem[] {
  const items: UniversityItem[] = [];
  const rawParts = uniListStr.split(",").map((s) => s.trim());
  for (const part of rawParts) {
    if (UNI_MAP[part]) {
      items.push(UNI_MAP[part]);
    } else if (part.toLowerCase().includes("other") || part.toLowerCase().includes("selected")) {
      items.push({
        name: part,
        shortName: "HEI",
        location: "Cambodia",
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
      });
    }
  }
  return items.length > 0
    ? items
    : [
        {
          name: "Accredited Cambodian Universities",
          shortName: "Cambodia",
          location: "Phnom Penh",
          image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
        },
      ];
}

/* ── Badge Helper ───────────────────────────────────────── */

function getDemandBadge(demand: string) {
  if (demand.includes("High / Growing") || demand.includes("Growing / High Potential")) {
    return {
      text: demand,
      bg: "bg-purple-100",
      textColor: "text-purple-800",
    };
  }
  if (demand.startsWith("High")) {
    return {
      text: demand,
      bg: "bg-emerald-100",
      textColor: "text-emerald-800",
    };
  }
  if (demand.includes("Growing")) {
    return {
      text: demand,
      bg: "bg-blue-100",
      textColor: "text-blue-800",
    };
  }
  return {
    text: demand,
    bg: "bg-amber-100",
    textColor: "text-amber-800",
  };
}

/* ── 20 Majors with Detailed Overviews ───────────────────── */

export const MAJORS_DATA: MajorItem[] = [
  // 1. Computer Science
  {
    id: "computer-science",
    name: "Computer Science",
    category: "Technology & Computing",
    badge: getDemandBadge("High"),
    icon: Laptop,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description: "Study of computers, software, algorithms, and computing systems.",
    extendedDescription:
      "Computer Science is the foundational study of computation, algorithmic logic, computer systems, and software engineering. Students engage in hands-on development, exploring how data structures, scalable algorithms, and modern programming languages solve real-world technical problems.\n\nThroughout the program, students master backend architectures, cloud computing frameworks, and practical artificial intelligence. In Cambodia and across the global digital economy, graduates power the next generation of software applications, fintech solutions, and innovative digital startups.",
    tags: ["Programming", "Algorithms", "Databases", "AI"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "MLVT, CDRI, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Programming", description: "Mastery of multiple programming paradigms and modern software languages.", icon: Code2 },
      { title: "Algorithms", description: "Design, analysis, and optimization of efficient algorithmic computations.", icon: Cpu },
      { title: "Databases", description: "Relational modeling, SQL, distributed databases, and high-volume data storage.", icon: Database },
      { title: "Software Development & AI", description: "Full-stack lifecycle development combined with practical artificial intelligence.", icon: Brain },
    ],
    skillsDeveloped: ["Programming", "Logical Thinking", "Problem-Solving", "Teamwork"],
    careerPathways: [
      { title: "Software Engineer", description: "Architect and build enterprise-grade software systems and applications.", icon: Laptop },
      { title: "Software Developer", description: "Write, test, and maintain robust client and server software features.", icon: Code2 },
      { title: "Programmer & Systems Analyst", description: "Translate client requirements into high-performance computing solutions.", icon: Database },
    ],
    careerOpportunities: "Software companies, banks, fintech, telecom, startups",
    jobMarketDemand: "High",
    relatedMajors: [
      { id: "information-technology", name: "Information Technology", icon: Network },
      { id: "cybersecurity", name: "Cybersecurity", icon: ShieldCheck },
      { id: "data-science", name: "Data Science", icon: LineChart },
    ],
    offerUniversities: parseUniversities("PUC, Paragon.U, AUPP, CADT"),
    relatedOpportunities: [
      {
        title: "Techo Digital Talent Fellowship",
        type: "Full Tuition Scholarship",
        badgeText: "Merit Based",
        deadline: "Aug 2026",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 2. Information Technology
  {
    id: "information-technology",
    name: "Information Technology",
    category: "Technology & Computing",
    badge: getDemandBadge("High"),
    icon: Network,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description: "Focuses on using and managing technology to support organizations.",
    extendedDescription:
      "Information Technology focuses on the strategic deployment, operational management, and systematic maintenance of computing infrastructure and enterprise systems. Students delve into enterprise networking, server administration, cloud virtual infrastructure, and database management systems.\n\nRather than solely coding software, IT specialists master how hardware components, operating systems, and communication platforms integrate to sustain business workflows. In Cambodia's rapidly growing digital landscape, IT specialists safeguard uptime, streamline operations, and support organizational growth.",
    tags: ["Networking", "Databases", "IT Systems", "Web Tech"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "MLVT, CDRI, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Networking", description: "Local and wide area networks, routing, switching, and cloud topology.", icon: Network },
      { title: "Databases & Storage", description: "Database administration, SQL query tuning, and reliable backup systems.", icon: Database },
      { title: "IT Systems & Tech Support", description: "Hardware diagnostics, operating systems, and end-user enterprise support.", icon: Wrench },
      { title: "Web Technologies", description: "Modern web standards, responsive design, and content management deployments.", icon: Globe },
    ],
    skillsDeveloped: ["Technical Skills", "Troubleshooting", "Communication", "Systems Support"],
    careerPathways: [
      { title: "IT Officer", description: "Coordinate technology infrastructure and operational digital systems.", icon: Network },
      { title: "System Administrator", description: "Oversee server maintenance, user permissions, and reliable uptime.", icon: Cpu },
      { title: "Network Administrator", description: "Implement, protect, and optimize enterprise data networks.", icon: Database },
    ],
    careerOpportunities: "Companies, banks, schools, hospitals, government",
    jobMarketDemand: "High",
    relatedMajors: [
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "cybersecurity", name: "Cybersecurity", icon: ShieldCheck },
      { id: "business-information-systems", name: "Business Information Systems", icon: Layers },
    ],
    offerUniversities: parseUniversities("CADT, PUC, UME, other Cambodian universities"),
    relatedOpportunities: [
      {
        title: "National Digital Infrastructure Internship",
        type: "Paid Traineeship",
        badgeText: "Enterprise",
        deadline: "Sep 2026",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 3. Cybersecurity
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    category: "Technology & Computing",
    badge: getDemandBadge("High / Growing"),
    icon: ShieldCheck,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description: "Focuses on protecting systems, networks, and data from cyber threats.",
    extendedDescription:
      "Cybersecurity is the specialized discipline dedicated to safeguarding mission-critical digital assets, enterprise networks, sensitive user data, and cloud infrastructure against cyber threats and unauthorized intrusions. Students master defensive network architectures, penetration testing, cryptography, incident response management, and digital forensics.\n\nThrough practical lab simulations, learners analyze vulnerabilities, mitigate security incidents, and enforce compliance with modern cybersecurity standards. As financial institutions, government agencies, and digital platforms expand across Cambodia, cybersecurity professionals serve as essential guardians of digital integrity and trust.",
    tags: ["Network Security", "Digital Forensics", "Risk Management"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "MLVT, CDRI, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Network Security", description: "Firewalls, intrusion detection, defense-in-depth, and secure communication.", icon: ShieldCheck },
      { title: "Security Systems", description: "Identity access management, cryptographic protocols, and security audits.", icon: Cpu },
      { title: "Digital Forensics", description: "Evidence acquisition, incident response, and cyber threat investigation.", icon: Brain },
      { title: "Risk Management", description: "Compliance frameworks, vulnerability assessments, and mitigation policies.", icon: Layers },
    ],
    skillsDeveloped: ["Networking", "Analytical Thinking", "Problem-Solving", "Forensic Analysis"],
    careerPathways: [
      { title: "Cybersecurity Analyst", description: "Monitor systems, detect anomalies, and prevent unauthorized breaches.", icon: ShieldCheck },
      { title: "Security Engineer", description: "Implement defensive security architectures and secure encryption pipelines.", icon: Cpu },
      { title: "SOC Analyst", description: "Respond to live incidents and investigate anomalous network events.", icon: Network },
    ],
    careerOpportunities: "Banks, fintech, telecom, government, technology companies",
    jobMarketDemand: "High / Growing",
    relatedMajors: [
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "information-technology", name: "Information Technology", icon: Network },
      { id: "data-science", name: "Data Science", icon: LineChart },
    ],
    offerUniversities: parseUniversities("CADT, PUC, AUPP, CamTech"),
    relatedOpportunities: [
      {
        title: "ASEAN Cyber Shield Defense Grant",
        type: "Fellowship & Bootcamp",
        badgeText: "Security",
        deadline: "Oct 2026",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 4. Data Science
  {
    id: "data-science",
    name: "Data Science",
    category: "Technology & Computing",
    badge: getDemandBadge("Growing"),
    icon: LineChart,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description: "Combines programming, statistics, and data analysis to find useful insights.",
    extendedDescription:
      "Data Science represents the powerful convergence of statistical mathematics, computational programming, and domain strategy designed to extract actionable intelligence from complex datasets. Students explore predictive modeling, big data pipelines, machine learning algorithms, and high-impact visual storytelling.\n\nPractical projects prepare learners to build automated analytical pipelines that guide strategic decisions across commerce, finance, and technology. From banking credit scoring and market forecasting to healthcare analytics, data science graduates turn raw data into valuable strategic insights.",
    tags: ["Statistics", "Programming", "Databases", "Machine Learning"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "CDRI, University Websites",
    sourceUrl: "https://cdri.org.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Statistics & Probability", description: "Mathematical modeling, predictive inference, and hypothesis testing.", icon: LineChart },
      { title: "Programming for Data", description: "Python, R, scientific libraries, and data transformation pipelines.", icon: Code2 },
      { title: "Databases & Warehousing", description: "SQL, data lakes, distributed storage, and ETL data flows.", icon: Database },
      { title: "Machine Learning", description: "Supervised and unsupervised models, clustering, and predictive algorithms.", icon: Brain },
    ],
    skillsDeveloped: ["Statistics", "Programming", "Analytical Thinking", "Data Visualization"],
    careerPathways: [
      { title: "Data Analyst", description: "Interpret metrics, generate visual reports, and support executive decisions.", icon: LineChart },
      { title: "Data Scientist", description: "Build predictive algorithms and automated statistical forecasting models.", icon: Brain },
      { title: "BI & Data Engineer", description: "Design scalable data pipelines, dashboards, and enterprise warehouses.", icon: Database },
    ],
    careerOpportunities: "Banks, fintech, telecom, retail, technology, consulting",
    jobMarketDemand: "Growing",
    relatedMajors: [
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "artificial-intelligence", name: "Artificial Intelligence", icon: Brain },
      { id: "business-information-systems", name: "Business Information Systems", icon: Layers },
    ],
    offerUniversities: parseUniversities("CADT, PUC and selected universities"),
    relatedOpportunities: [
      {
        title: "National Data Analytics Innovation Challenge",
        type: "Prize & Traineeship",
        badgeText: "FinTech",
        deadline: "Nov 2026",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 5. Artificial Intelligence
  {
    id: "artificial-intelligence",
    name: "Artificial Intelligence",
    category: "Technology & Computing",
    badge: getDemandBadge("Growing / High Potential"),
    icon: Brain,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description: "Studies technologies that allow computers to perform intelligent tasks.",
    extendedDescription:
      "Artificial Intelligence studies computational architectures and algorithms that empower computer systems to simulate cognitive functions, recognize visual patterns, interpret human language, and solve complex problems. Students engage with state-of-the-art machine learning paradigms, deep neural networks, computer vision, and natural language processing.\n\nThe curriculum bridges rigorous mathematics with advanced software engineering, challenging students to train transformer models, deploy edge AI devices, and investigate ethical AI governance. Graduates lead advancements in intelligent automation, smart software, robotics, and generative computing.",
    tags: ["Machine Learning", "AI", "Computer Vision", "Algorithms"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "CDRI, University Websites",
    sourceUrl: "https://cdri.org.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Machine Learning", description: "Deep neural networks, backpropagation, and reinforcement learning.", icon: Brain },
      { title: "Computer Vision", description: "Image recognition, object detection, and visual processing models.", icon: Laptop },
      { title: "Natural Language & AI", description: "Transformer models, speech recognition, and conversational systems.", icon: Code2 },
      { title: "AI Ethics & Deployment", description: "Responsible AI safety, cloud model hosting, and edge deployment.", icon: Cpu },
    ],
    skillsDeveloped: ["Programming", "Mathematics", "Statistics", "Problem-Solving"],
    careerPathways: [
      { title: "AI Engineer", description: "Deploy deep learning models into production software systems.", icon: Brain },
      { title: "Machine Learning Engineer", description: "Train and optimize neural networks for predictive automation.", icon: Cpu },
      { title: "AI Developer & Data Scientist", description: "Create customized intelligent solutions and AI agents.", icon: Laptop },
    ],
    careerOpportunities: "Technology, fintech, automation, research, startups",
    jobMarketDemand: "Growing / High Potential",
    relatedMajors: [
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "data-science", name: "Data Science", icon: LineChart },
      { id: "electrical-engineering", name: "Electrical Engineering", icon: Cpu },
    ],
    offerUniversities: parseUniversities("AUPP, CamTech"),
    relatedOpportunities: [
      {
        title: "Cambodia AI Pioneer Research Grant",
        type: "Full Sponsorship",
        badgeText: "Emerging Tech",
        deadline: "Aug 2026",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 6. Business Information Systems
  {
    id: "business-information-systems",
    name: "Business Information Systems",
    category: "Technology & Computing",
    badge: getDemandBadge("High / Growing"),
    icon: Layers,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description: "Combines business knowledge with information technology and systems.",
    extendedDescription:
      "Business Information Systems (BIS) bridges corporate strategy with technological innovation, combining management theory with database engineering, enterprise resource planning, and systems design. Students learn to assess organizational workflows, implement enterprise ERP platforms, and orchestrate technical solutions toward measurable business objectives.\n\nBy developing the capability to communicate fluidly between executive leadership and software engineering teams, graduates become pivotal catalysts for organizational change. They lead digital transformation roadmaps, modernize enterprise architectures, and ensure technology investments deliver sustainable value.",
    tags: ["Business Processes", "Databases", "Information Systems", "Analytics"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "MLVT, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Business Processes", description: "Organizational workflows, enterprise mapping, and supply chain management.", icon: Briefcase },
      { title: "Information Systems", description: "ERP implementation, CRM systems, and cloud business software.", icon: Layers },
      { title: "Databases & SQL", description: "Business data modeling, relational querying, and data consistency.", icon: Database },
      { title: "Business Analytics", description: "KPI tracking, reporting dashboards, and technological cost-benefit analysis.", icon: LineChart },
    ],
    skillsDeveloped: ["Business Analysis", "Databases", "Communication", "Problem-Solving"],
    careerPathways: [
      { title: "Business Analyst", description: "Bridge corporate needs with technical development teams.", icon: Briefcase },
      { title: "Systems Analyst", description: "Design and implement modernized technical workflows.", icon: Layers },
      { title: "MIS Officer & IT Consultant", description: "Manage enterprise software systems and business databases.", icon: Database },
    ],
    careerOpportunities: "Banks, corporations, consulting, technology companies",
    jobMarketDemand: "High / Growing",
    relatedMajors: [
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "digital-business", name: "Digital Business / Digital Economy", icon: LineChart },
    ],
    offerUniversities: parseUniversities("CADT, PUC, Paragon.U"),
    relatedOpportunities: [
      {
        title: "Enterprise Systems Digital Fellowship",
        type: "Corporate Traineeship",
        badgeText: "Consulting",
        deadline: "Sep 2026",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 7. Business Administration
  {
    id: "business-administration",
    name: "Business Administration",
    category: "Business & Management",
    badge: getDemandBadge("High / Broad"),
    icon: Briefcase,
    iconBg: "bg-momo",
    iconColor: "text-[#D97736]",
    description: "Studies how businesses are created, managed, and operated.",
    extendedDescription:
      "Business Administration is the comprehensive study of commercial management, corporate strategy, executive leadership, and organizational performance. Students acquire a balanced business perspective covering managerial accounting, corporate finance, market intelligence, human capital development, and venture entrepreneurship.\n\nThrough real-world case studies and collaborative projects, students develop leadership acumen, problem-solving skills, and strategic vision. Whether launching an innovative startup or leading operational divisions in established corporations, graduates are equipped to steer organizations toward sustainable profitability.",
    tags: ["Management", "Marketing", "Finance", "HR", "Entrepreneurship"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "MLVT, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Management & Leadership", description: "Strategic planning, organizational behavior, and effective executive leadership.", icon: Briefcase },
      { title: "Marketing & Sales", description: "Market positioning, competitive intelligence, and customer retention strategies.", icon: Megaphone },
      { title: "Corporate Finance", description: "Cash flow analysis, capital budgeting, and financial performance evaluation.", icon: Coins },
      { title: "Operations & HR", description: "Talent acquisition, organizational culture, and operational efficiency.", icon: Layers },
    ],
    skillsDeveloped: ["Communication", "Leadership", "Problem-Solving", "Teamwork"],
    careerPathways: [
      { title: "Business Analyst", description: "Analyze organizational efficiency and market expansion opportunities.", icon: LineChart },
      { title: "Operations Manager", description: "Oversee daily corporate logistics, supply chains, and departmental goals.", icon: Briefcase },
      { title: "Entrepreneur & Founder", description: "Launch and scale new ventures in emerging commercial markets.", icon: Coins },
    ],
    careerOpportunities: "Almost all industries, SMEs, corporations, startups",
    jobMarketDemand: "High / Broad",
    relatedMajors: [
      { id: "marketing", name: "Marketing", icon: Megaphone },
      { id: "finance-banking", name: "Finance & Banking", icon: Coins },
      { id: "business-information-systems", name: "Business Information Systems", icon: Layers },
    ],
    offerUniversities: parseUniversities("PUC, Paragon.U, AUPP, UME"),
    relatedOpportunities: [
      {
        title: "ASEAN Young Entrepreneurs Grant",
        type: "Startup Funding",
        badgeText: "Business",
        deadline: "Aug 2026",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 8. Marketing
  {
    id: "marketing",
    name: "Marketing",
    category: "Business & Management",
    badge: getDemandBadge("High / Broad"),
    icon: Megaphone,
    iconBg: "bg-momo",
    iconColor: "text-[#D97736]",
    description: "Studies how businesses understand customers and promote products or services.",
    extendedDescription:
      "Marketing investigates the science and art of consumer psychology, strategic brand identity, market positioning, and omni-channel customer acquisition. Students explore market research methodologies, digital growth strategies, advertising campaign planning, and predictive consumer analytics.\n\nThe curriculum blends creative visual storytelling with data-driven performance metrics, enabling students to craft compelling brand narratives across modern digital channels. In an increasingly connected marketplace, skilled marketers drive revenue growth, build brand equity, and foster lasting customer loyalty.",
    tags: ["Consumer Behavior", "Digital Marketing", "Branding", "Market Research"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "MLVT, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Consumer Behavior", description: "Psychological drivers behind customer decisions and purchasing habits.", icon: Brain },
      { title: "Digital Marketing", description: "SEO, performance advertising, email funnels, and social campaigns.", icon: Megaphone },
      { title: "Brand Management", description: "Brand identity, narrative storytelling, and value proposition design.", icon: Palette },
      { title: "Market Research", description: "Quantitative surveys, qualitative focus groups, and competitor tracking.", icon: LineChart },
    ],
    skillsDeveloped: ["Creativity", "Communication", "Analytics", "Digital Skills"],
    careerPathways: [
      { title: "Marketing Officer", description: "Plan and execute comprehensive marketing campaigns across channels.", icon: Megaphone },
      { title: "Digital Marketer", description: "Manage online ad budgets, viral content, and social media engagement.", icon: Laptop },
      { title: "Brand Executive", description: "Build and protect commercial brand reputation and market presence.", icon: Palette },
    ],
    careerOpportunities: "Companies, agencies, e-commerce, startups, media",
    jobMarketDemand: "High / Broad",
    relatedMajors: [
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
      { id: "digital-business", name: "Digital Business / Digital Economy", icon: LineChart },
      { id: "graphic-design", name: "Graphic Design / Digital Arts & Design", icon: Palette },
    ],
    offerUniversities: parseUniversities("PUC, UME and other universities"),
    relatedOpportunities: [
      {
        title: "Digital Creator & Marketer Fellowship",
        type: "Media Grant",
        badgeText: "Marketing",
        deadline: "Sep 2026",
        image: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 9. Digital Business / Digital Economy
  {
    id: "digital-business",
    name: "Digital Business / Digital Economy",
    category: "Business & Management",
    badge: getDemandBadge("Growing / High Potential"),
    icon: LineChart,
    iconBg: "bg-momo",
    iconColor: "text-[#D97736]",
    description: "Combines business with digital technologies and the digital economy.",
    extendedDescription:
      "Digital Business examines the economic paradigms, platform architectures, and commercial transformations catalyzed by global digital connectivity and e-commerce. Students master digital marketplace dynamics, API-driven platform economics, supply chain digitalization, mobile payment integration, and growth analytics.\n\nThe coursework emphasizes innovative platform management, digital consumer trends, and fintech adoption. Graduates emerge ready to lead e-commerce expansions, advise digital ventures, and pioneer commercial initiatives in Cambodia's rapidly evolving digital economy.",
    tags: ["E-commerce", "Digital Platforms", "Data Analytics", "Digital Strategy"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "CDRI, PUC, University Websites",
    sourceUrl: "https://cdri.org.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "E-commerce Architecture", description: "Digital storefronts, multi-vendor platforms, and mobile checkout flows.", icon: LineChart },
      { title: "Digital Platform Strategy", description: "Network effects, ecosystem monetization, and API-driven economies.", icon: Layers },
      { title: "Data Analytics for Commerce", description: "Customer journey mapping, conversion rate optimization, and cohort data.", icon: Database },
      { title: "FinTech & Digital Payments", description: "Mobile wallets, blockchain settlements, and cross-border digital trade.", icon: Coins },
    ],
    skillsDeveloped: ["Digital Literacy", "Analytics", "Business Thinking", "Communication"],
    careerPathways: [
      { title: "Digital Business Analyst", description: "Evaluate digital channels and advise on tech monetization opportunities.", icon: LineChart },
      { title: "E-commerce Manager", description: "Direct online store performance, conversion funnels, and vendor networks.", icon: Briefcase },
      { title: "Innovation Consultant", description: "Guide corporate transformation toward digital-first business models.", icon: Brain },
    ],
    careerOpportunities: "E-commerce, fintech, startups, technology companies",
    jobMarketDemand: "Growing / High Potential",
    relatedMajors: [
      { id: "business-information-systems", name: "Business Information Systems", icon: Layers },
      { id: "marketing", name: "Marketing", icon: Megaphone },
      { id: "finance-banking", name: "Finance & Banking", icon: Coins },
    ],
    offerUniversities: parseUniversities("CADT, PUC and selected universities"),
    relatedOpportunities: [
      {
        title: "National FinTech Accelerator Grant",
        type: "Incubation Grant",
        badgeText: "FinTech",
        deadline: "Oct 2026",
        image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 10. Accounting
  {
    id: "accounting",
    name: "Accounting",
    category: "Business & Management",
    badge: getDemandBadge("High / Stable"),
    icon: Coins,
    iconBg: "bg-momo",
    iconColor: "text-[#D97736]",
    description: "Focuses on recording, analyzing, and reporting financial information.",
    extendedDescription:
      "Accounting is the authoritative language of commercial enterprise, governing the systematic recording, measurement, verification, and presentation of financial health and performance. Students gain deep mastery over financial accounting, managerial cost accounting, corporate taxation laws, and international auditing standards (IFRS).\n\nBeyond balancing ledgers, students learn to interpret balance sheets to evaluate operational risks, ensure regulatory compliance, and support strategic fiduciary decisions. Certified accountants and financial controllers play indispensable roles in public corporations, commercial banks, government bodies, and international advisory firms.",
    tags: ["Financial Accounting", "Management Accounting", "Taxation", "Auditing"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "MLVT, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Financial Accounting", description: "Double-entry bookkeeping, balance sheets, and IFRS financial statements.", icon: Coins },
      { title: "Management Accounting", description: "Cost accounting, budget forecasting, and corporate margin analysis.", icon: LineChart },
      { title: "Taxation & Compliance", description: "Cambodian tax laws, corporate withholding, and VAT filings.", icon: Scale },
      { title: "Auditing & Internal Controls", description: "Audit trail verification, fraud prevention, and regulatory compliance.", icon: ShieldCheck },
    ],
    skillsDeveloped: ["Numerical Skills", "Attention to Detail", "Excel Mastery", "Accounting Software"],
    careerPathways: [
      { title: "Certified Accountant", description: "Manage ledger accounts, balance reconciliations, and tax compliance.", icon: Coins },
      { title: "Financial Auditor", description: "Examine financial records for accuracy, compliance, and fiduciary honesty.", icon: ShieldCheck },
      { title: "Tax Officer & Controller", description: "Ensure corporate compliance with national tax policies and regulations.", icon: LineChart },
    ],
    careerOpportunities: "Banks, companies, accounting firms, government",
    jobMarketDemand: "High / Stable",
    relatedMajors: [
      { id: "finance-banking", name: "Finance & Banking", icon: Coins },
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
      { id: "economics", name: "Economics", icon: LineChart },
    ],
    offerUniversities: parseUniversities("PUC, UME and other Cambodian universities"),
    relatedOpportunities: [
      {
        title: "ACCA Professional Fast-Track Fellowship",
        type: "Certification Grant",
        badgeText: "Accounting",
        deadline: "Aug 2026",
        image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 11. Finance & Banking
  {
    id: "finance-banking",
    name: "Finance & Banking",
    category: "Business & Management",
    badge: getDemandBadge("High / Stable"),
    icon: Coins,
    iconBg: "bg-momo",
    iconColor: "text-[#D97736]",
    description: "Studies financial institutions, investments, money, and financial decisions.",
    extendedDescription:
      "Finance & Banking explores capital creation, resource allocation, investment portfolio management, asset valuation, and central monetary policy. Students analyze capital markets, debt and equity instruments, commercial lending mechanisms, financial risk modeling, and algorithmic portfolio management.\n\nThrough practical financial analysis and macroeconomic case studies, students learn how global trends influence credit liquidity, interest rates, and exchange rate stability. Graduates are prepared to manage corporate treasuries, direct retail and commercial banking branches, lead microfinance initiatives, and advise on investment portfolios.",
    tags: ["Banking", "Investment", "Financial Management", "Risk Management"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "MLVT, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Commercial Banking", description: "Credit scoring, retail deposit mechanics, and central bank regulations.", icon: Building },
      { title: "Investment & Capital Markets", description: "Securities valuation, equity analysis, and portfolio diversification.", icon: LineChart },
      { title: "Financial Management", description: "Corporate capital structure, dividend policies, and liquidity management.", icon: Coins },
      { title: "Financial Risk Assessment", description: "Credit risk, currency exposure, and hedging instruments.", icon: ShieldCheck },
    ],
    skillsDeveloped: ["Numerical Analysis", "Financial Literacy", "Communication", "Market Valuation"],
    careerPathways: [
      { title: "Bank Officer", description: "Administer branch operations, retail products, and corporate accounts.", icon: Building },
      { title: "Financial Analyst", description: "Model company valuations and guide executive capital allocations.", icon: LineChart },
      { title: "Credit & Investment Officer", description: "Evaluate commercial loan applications and manage asset portfolios.", icon: Coins },
    ],
    careerOpportunities: "Banks, microfinance, fintech, insurance, investment",
    jobMarketDemand: "High / Stable",
    relatedMajors: [
      { id: "accounting", name: "Accounting", icon: Coins },
      { id: "economics", name: "Economics", icon: LineChart },
      { id: "digital-business", name: "Digital Business / Digital Economy", icon: LineChart },
    ],
    offerUniversities: parseUniversities("PUC, Paragon.U, UME"),
    relatedOpportunities: [
      {
        title: "National Bank of Cambodia Young Bankers Award",
        type: "Banking Traineeship",
        badgeText: "Banking",
        deadline: "Sep 2026",
        image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 12. Civil Engineering
  {
    id: "civil-engineering",
    name: "Civil Engineering",
    category: "Engineering & Architecture",
    badge: getDemandBadge("High / Stable"),
    icon: Building2,
    iconBg: "bg-sitomo",
    iconColor: "text-blue-ink",
    description: "Applies engineering principles to buildings, roads, and infrastructure.",
    extendedDescription:
      "Civil Engineering is the foundational discipline dedicated to the planning, structural design, construction management, and maintenance of the physical built environment. Students master structural mechanics, geotechnical soil analysis, reinforced concrete design, steel frame engineering, transportation planning, and municipal hydrology.\n\nThrough technical drafting, BIM software, and rigorous field testing, students ensure bridges, residential high-rises, highways, and drainage systems withstand environmental demands. As Cambodia accelerates its infrastructure modernization, civil engineers serve as essential nation-builders transforming urban landscapes and regional transport corridors.",
    tags: ["Structural Engineering", "Construction", "Materials", "Surveying"],
    duration: "4-5 Years",
    degreeType: "Bachelor of Engineering",
    source: "MLVT, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Structural Engineering", description: "Reinforced concrete, steel beam design, and load-bearing static calculations.", icon: Building2 },
      { title: "Construction Materials", description: "Soil mechanics, concrete durability, asphalt chemistry, and quality tests.", icon: Wrench },
      { title: "Surveying & Geomatics", description: "Topographic mapping, total stations, GPS surveying, and elevation grading.", icon: Compass },
      { title: "Transportation & Hydrology", description: "Highway geometry, drainage networks, and flood prevention infrastructure.", icon: Globe },
    ],
    skillsDeveloped: ["Mathematics", "Technical Drawing", "Project Management", "Structural Analysis"],
    careerPathways: [
      { title: "Civil Engineer", description: "Design, oversee, and certify public and private construction infrastructure.", icon: Building2 },
      { title: "Site Engineer", description: "Manage on-site contractors, safety standards, and daily construction schedules.", icon: Wrench },
      { title: "Structural Engineer", description: "Perform structural calculations and ensure seismic and wind safety.", icon: Cpu },
    ],
    careerOpportunities: "Construction, infrastructure, real estate, engineering firms",
    jobMarketDemand: "High / Stable",
    relatedMajors: [
      { id: "architecture", name: "Architecture", icon: Building },
      { id: "mechanical-engineering", name: "Mechanical Engineering", icon: Wrench },
      { id: "electrical-engineering", name: "Electrical Engineering", icon: Cpu },
    ],
    offerUniversities: parseUniversities("PUC, Paragon.U, other universities"),
    relatedOpportunities: [
      {
        title: "National Infrastructure Builders Grant",
        type: "Field Traineeship",
        badgeText: "Engineering",
        deadline: "Oct 2026",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 13. Electrical Engineering
  {
    id: "electrical-engineering",
    name: "Electrical Engineering",
    category: "Engineering & Architecture",
    badge: getDemandBadge("High / Growing"),
    icon: Cpu,
    iconBg: "bg-sitomo",
    iconColor: "text-blue-ink",
    description: "Studies electricity, electrical systems, electronics, and power technologies.",
    extendedDescription:
      "Electrical Engineering explores the theory and practical application of electricity, electromagnetism, microelectronics, power distribution, and automated control systems. Students master circuit theory, semiconductor devices, high-voltage power grid transmission, renewable energy systems, and industrial programmable logic controllers (PLCs).\n\nThrough hands-on laboratory experimentation and engineering design projects, learners design efficient electrical architectures that power modern machinery, buildings, and smart grids. With the expansion of clean energy, telecommunications, and industrial automation, electrical engineers drive sustainable electrification and technological progress.",
    tags: ["Circuits", "Electronics", "Power Systems", "Control Systems"],
    duration: "4-5 Years",
    degreeType: "Bachelor of Engineering",
    source: "MLVT, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Circuits & Electronics", description: "Semiconductors, analog/digital circuits, and signal amplification.", icon: Cpu },
      { title: "Power Systems & Grids", description: "High voltage transmission, transformer substations, and grid stability.", icon: Building },
      { title: "Renewable Energy", description: "Solar photovoltaic design, wind turbines, and energy battery storage.", icon: Compass },
      { title: "Control Systems & Automation", description: "PLC programming, microcontrollers, sensor integration, and robotics.", icon: Wrench },
    ],
    skillsDeveloped: ["Mathematics", "Technical Skills", "Problem-Solving", "Engineering Design"],
    careerPathways: [
      { title: "Electrical Engineer", description: "Design electrical wiring systems, generation plants, and equipment.", icon: Cpu },
      { title: "Electronics Engineer", description: "Develop circuit boards, embedded systems, and consumer electronics.", icon: Laptop },
      { title: "Maintenance & Power Engineer", description: "Ensure operational safety across industrial manufacturing plants.", icon: Wrench },
    ],
    careerOpportunities: "Manufacturing, construction, energy, telecom, technology",
    jobMarketDemand: "High / Growing",
    relatedMajors: [
      { id: "mechanical-engineering", name: "Mechanical Engineering", icon: Wrench },
      { id: "civil-engineering", name: "Civil Engineering", icon: Building2 },
      { id: "artificial-intelligence", name: "Artificial Intelligence", icon: Brain },
    ],
    offerUniversities: parseUniversities("PUC and other engineering universities"),
    relatedOpportunities: [
      {
        title: "Clean Energy & Smart Grid Fellowship",
        type: "Full Tuition Award",
        badgeText: "Energy",
        deadline: "Aug 2026",
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 14. Mechanical Engineering
  {
    id: "mechanical-engineering",
    name: "Mechanical Engineering",
    category: "Engineering & Architecture",
    badge: getDemandBadge("High / Stable"),
    icon: Wrench,
    iconBg: "bg-sitomo",
    iconColor: "text-blue-ink",
    description: "Focuses on machines, mechanical systems, manufacturing, and industrial equipment.",
    extendedDescription:
      "Mechanical Engineering applies physics, thermodynamics, and material science to design, analyze, manufacture, and maintain mechanical machinery and thermal systems. Students study kinematic motion, thermodynamic energy cycles, fluid dynamics, computer-aided design (CAD/CAM), and CNC manufacturing.\n\nThrough hands-on design labs and simulation testing, students learn to engineer reliable mechanical assemblies, HVAC climate control systems, robotics, and heavy industrial machinery. Mechanical engineers are the versatile problem-solvers behind modern manufacturing factories, automotive transport, power plants, and industrial processing lines.",
    tags: ["Mechanics", "Thermodynamics", "Manufacturing", "Machine Design"],
    duration: "4-5 Years",
    degreeType: "Bachelor of Engineering",
    source: "MLVT",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Mechanics & Dynamics", description: "Kinematics, fluid dynamics, stress analysis, and mechanical vibration.", icon: Wrench },
      { title: "Thermodynamics & Heat", description: "Thermal energy transfer, refrigeration, HVAC systems, and combustion.", icon: Cpu },
      { title: "Manufacturing & Materials", description: "CNC machining, casting, 3D additive printing, and metallurgy.", icon: Building2 },
      { title: "Machine Design & CAD", description: "3D parametric modeling, mechanical assembly, and simulation testing.", icon: Laptop },
    ],
    skillsDeveloped: ["Mathematics", "CAD Mastery", "Engineering Design", "Troubleshooting"],
    careerPathways: [
      { title: "Mechanical Engineer", description: "Design complex mechanical machinery, engines, and automated lines.", icon: Wrench },
      { title: "Maintenance Engineer", description: "Diagnose and prevent industrial equipment failures in factories.", icon: Cpu },
      { title: "Manufacturing Engineer", description: "Optimize plant production lines for high throughput and safety.", icon: Building },
    ],
    careerOpportunities: "Manufacturing, factories, construction, automotive, industry",
    jobMarketDemand: "High / Stable",
    relatedMajors: [
      { id: "electrical-engineering", name: "Electrical Engineering", icon: Cpu },
      { id: "civil-engineering", name: "Civil Engineering", icon: Building2 },
      { id: "architecture", name: "Architecture", icon: Building },
    ],
    offerUniversities: parseUniversities("Cambodian engineering universities"),
    relatedOpportunities: [
      {
        title: "Industrial Manufacturing Excellence Grant",
        type: "Apprenticeship",
        badgeText: "Industry",
        deadline: "Sep 2026",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 15. Architecture
  {
    id: "architecture",
    name: "Architecture",
    category: "Engineering & Architecture",
    badge: getDemandBadge("Moderate / Specialized"),
    icon: Building,
    iconBg: "bg-sitomo",
    iconColor: "text-blue-ink",
    description: "Combines design, technology, and planning to create buildings and spaces.",
    extendedDescription:
      "Architecture is the creative fusion of artistic vision, structural science, human culture, and environmental planning that shapes the buildings and public spaces we inhabit. Students immerse themselves in design studios, master architectural drafting, explore sustainable building techniques, and utilize Building Information Modeling (BIM) software.\n\nBy balancing spatial aesthetics with structural integrity, climate sustainability, and functional accessibility, learners develop the skill to turn conceptual ideas into buildable realities. Architects leave lasting marks on cultural heritage and urban landscapes, designing residential communities, commercial landmarks, and sustainable green cities.",
    tags: ["Architectural Design", "Drawing", "Construction", "Urban Planning", "CAD"],
    duration: "5 Years",
    degreeType: "Bachelor of Architecture",
    source: "MLVT, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Architectural Studio Design", description: "Concept development, spatial layout, facade aesthetics, and scale models.", icon: Building },
      { title: "CAD & 3D Visualization", description: "AutoCAD, Revit BIM modeling, Lumion rendering, and digital walkthroughs.", icon: Laptop },
      { title: "Construction Documentation", description: "Building codes, structural integration, materials, and MEP coordination.", icon: Wrench },
      { title: "Urban Planning & Landscape", description: "City zoning, sustainable tropical architecture, and community spaces.", icon: Globe },
    ],
    skillsDeveloped: ["Creativity", "Spatial Design", "CAD / BIM", "Technical Drawing"],
    careerPathways: [
      { title: "Licensed Architect", description: "Design residential, commercial, and cultural landmark buildings.", icon: Building },
      { title: "Architectural Designer", description: "Develop innovative facade concepts and interior spatial layouts.", icon: Palette },
      { title: "Urban Planner & Project Coordinator", description: "Plan community developments, zoning schemes, and sustainable cities.", icon: Globe },
    ],
    careerOpportunities: "Architecture firms, construction, real estate, urban development",
    jobMarketDemand: "Moderate / Specialized",
    relatedMajors: [
      { id: "civil-engineering", name: "Civil Engineering", icon: Building2 },
      { id: "graphic-design", name: "Graphic Design / Digital Arts & Design", icon: Palette },
      { id: "mechanical-engineering", name: "Mechanical Engineering", icon: Wrench },
    ],
    offerUniversities: parseUniversities("PUC, Paragon.U, other universities"),
    relatedOpportunities: [
      {
        title: "Vann Molyvann Heritage Architecture Prize",
        type: "Design Competition & Studio",
        badgeText: "Architecture",
        deadline: "Nov 2026",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 16. Economics
  {
    id: "economics",
    name: "Economics",
    category: "Social Sciences & Humanities",
    badge: getDemandBadge("Moderate / Specialized"),
    icon: LineChart,
    iconBg: "bg-momo",
    iconColor: "text-[#8B5CF6]",
    description: "Studies how people, businesses, and governments make decisions about resources.",
    extendedDescription:
      "Economics is the social science that investigates how societies, businesses, and governments allocate resources to satisfy human needs and drive economic prosperity. Students master microeconomic behavior, macroeconomic policy, econometric statistical modeling, fiscal taxation, monetary theory, and international trade dynamics.\n\nThe curriculum develops analytical thinking, quantitative modeling, and empirical research capabilities to evaluate the societal impact of public policies and market trends. Economists serve as influential advisors in government ministries, central banks, multilateral development institutions, and economic policy think tanks.",
    tags: ["Microeconomics", "Macroeconomics", "Statistics", "Finance", "Economic Policy"],
    duration: "4 Years",
    degreeType: "Bachelor of Economics",
    source: "MLVT, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Microeconomic Theory", description: "Price mechanisms, supply and demand equilibria, and firm market structures.", icon: LineChart },
      { title: "Macroeconomic Analysis", description: "National GDP, inflation, interest rates, and monetary policy impacts.", icon: Coins },
      { title: "Econometrics & Statistics", description: "Regression analysis, causal modeling, and econometric forecasting.", icon: Database },
      { title: "Public & Economic Policy", description: "Fiscal taxation, welfare economics, and trade tariffs evaluation.", icon: Scale },
    ],
    skillsDeveloped: ["Data Analysis", "Mathematics", "Research", "Critical Thinking"],
    careerPathways: [
      { title: "Economist", description: "Analyze economic trends and provide macroeconomic forecasts.", icon: LineChart },
      { title: "Policy Analyst", description: "Evaluate government regulations, taxation, and social economic policies.", icon: Scale },
      { title: "Economic Researcher", description: "Conduct empirical field research for development banks and think tanks.", icon: Globe },
    ],
    careerOpportunities: "Government, banks, NGOs, research, consulting",
    jobMarketDemand: "Moderate / Specialized",
    relatedMajors: [
      { id: "finance-banking", name: "Finance & Banking", icon: Coins },
      { id: "international-relations", name: "International Relations", icon: Globe },
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
    ],
    offerUniversities: parseUniversities("PUC, Paragon.U, UME"),
    relatedOpportunities: [
      {
        title: "Cambodia Economic Policy Forum Fellowship",
        type: "Policy Research Grant",
        badgeText: "Economics",
        deadline: "Aug 2026",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 17. International Relations
  {
    id: "international-relations",
    name: "International Relations",
    category: "Social Sciences & Humanities",
    badge: getDemandBadge("Moderate / Specialized"),
    icon: Globe,
    iconBg: "bg-momo",
    iconColor: "text-[#8B5CF6]",
    description: "Studies relationships between countries, international organizations, and global issues.",
    extendedDescription:
      "International Relations examines diplomatic relations, global political dynamics, multilateral institutions, international law, and cross-border trade. Students analyze foreign policy decision-making, bilateral negotiations, conflict mediation, human rights treaties, and the economic integration of ASEAN and global bodies.\n\nThe program cultivates keen cross-cultural intelligence, persuasive debate skills, policy writing, and geopolitical awareness. Graduates pursue distinguished careers in diplomatic corps, foreign affairs ministries, international non-governmental organizations (NGOs), and multilateral development agencies.",
    tags: ["Diplomacy", "International Politics", "International Law", "Global Affairs"],
    duration: "4 Years",
    degreeType: "Bachelor of Arts",
    source: "University Websites",
    sourceUrl: "https://rupp.edu.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Diplomacy & Foreign Affairs", description: "Bilateral negotiations, diplomatic protocol, and conflict mediation.", icon: Globe },
      { title: "International Politics", description: "Geopolitical alliances, balance of power, and global governance institutions.", icon: Building },
      { title: "International Public Law", description: "Treaties, human rights conventions, maritime law, and state sovereignty.", icon: Scale },
      { title: "Global Political Economy", description: "Trade organizations, international aid, and regional ASEAN integration.", icon: LineChart },
    ],
    skillsDeveloped: ["Communication", "Research", "Foreign Languages", "Critical Thinking"],
    careerPathways: [
      { title: "Diplomat & Foreign Affairs Officer", description: "Represent national interests in embassies and multilateral summits.", icon: Globe },
      { title: "International NGO Officer", description: "Direct cross-border humanitarian aid and sustainable development initiatives.", icon: Globe },
      { title: "Policy & Strategic Advisor", description: "Analyze global risks and author foreign trade policy briefs.", icon: Scale },
    ],
    careerOpportunities: "Government, NGOs, international organizations, development sector",
    jobMarketDemand: "Moderate / Specialized",
    relatedMajors: [
      { id: "law", name: "Law", icon: Scale },
      { id: "economics", name: "Economics", icon: LineChart },
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
    ],
    offerUniversities: parseUniversities("PUC, Paragon.U, RUPP"),
    relatedOpportunities: [
      {
        title: "ASEAN Youth Diplomatic Delegation",
        type: "International Summit Grant",
        badgeText: "Diplomacy",
        deadline: "Sep 2026",
        image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 18. Law
  {
    id: "law",
    name: "Law",
    category: "Social Sciences & Humanities",
    badge: getDemandBadge("Moderate / Stable"),
    icon: Scale,
    iconBg: "bg-momo",
    iconColor: "text-[#8B5CF6]",
    description: "Studies legal systems, rights, contracts, and legal institutions.",
    extendedDescription:
      "Law is the cornerstone of societal justice, governance, and commercial certainty, studying legal doctrines, judicial systems, contracts, and constitutional rights. Students master Cambodian civil and criminal codes, corporate commercial law, property ownership, labor rights, and international arbitration procedures.\n\nThrough case law analysis, statutory interpretation, and mock trial advocacy, students develop rigorous legal reasoning, precise legal drafting, and courtroom presentation skills. Legal graduates protect citizen rights, resolve complex commercial disputes, ensure regulatory compliance, and uphold the rule of law across society.",
    tags: ["Cambodian Law", "International Law", "Contracts", "Constitutional Law"],
    duration: "4 Years",
    degreeType: "Bachelor of Laws (LL.B)",
    source: "PUC, University Websites",
    sourceUrl: "https://puc.edu.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Cambodian Civil & Penal Code", description: "Criminal justice, tort law, property rights, and courtroom procedures.", icon: Scale },
      { title: "Commercial & Contract Law", description: "Commercial arbitration, corporate governance, and contract drafting.", icon: Briefcase },
      { title: "Constitutional & Administrative Law", description: "State powers, separation of branches, and public administration ethics.", icon: Building },
      { title: "International Jurisprudence", description: "Human rights, cross-border commercial arbitration, and comparative law.", icon: Globe },
    ],
    skillsDeveloped: ["Legal Research", "Analytical Writing", "Logical Reasoning", "Persuasive Communication"],
    careerPathways: [
      { title: "Attorney & Legal Counsel", description: "Represent clients in legal litigation, criminal defense, and settlements.", icon: Scale },
      { title: "Corporate Compliance Officer", description: "Ensure business activities adhere strictly to national regulations.", icon: ShieldCheck },
      { title: "Legal Consultant", description: "Advise institutions on commercial contracts, mergers, and liability.", icon: Briefcase },
    ],
    careerOpportunities: "Law firms, companies, banks, government, NGOs",
    jobMarketDemand: "Moderate / Stable",
    relatedMajors: [
      { id: "international-relations", name: "International Relations", icon: Globe },
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
      { id: "economics", name: "Economics", icon: LineChart },
    ],
    offerUniversities: parseUniversities("PUC and other Cambodian universities"),
    relatedOpportunities: [
      {
        title: "National Moot Court Championship Award",
        type: "Legal Fellowship",
        badgeText: "Jurisprudence",
        deadline: "Oct 2026",
        image: "https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 19. Tourism & Hospitality Management
  {
    id: "tourism-hospitality",
    name: "Tourism & Hospitality Management",
    category: "Tourism & Hospitality",
    badge: getDemandBadge("High / Recovering"),
    icon: Compass,
    iconBg: "bg-sitomo",
    iconColor: "text-[#10B981]",
    description: "Focuses on tourism, hotels, restaurants, and visitor experiences.",
    extendedDescription:
      "Tourism & Hospitality Management focuses on the strategic leadership, operational excellence, and guest experience curation across hotels, resorts, travel networks, and culinary destinations. Students study hospitality operations, hotel revenue management, destination marketing, eco-tourism development, and international event coordination (MICE).\n\nThe curriculum blends customer service psychology with financial accounting, human resources, and high service standards. As Cambodia's world-renowned cultural and coastal destinations welcome millions of international travelers, hospitality managers direct premier visitor experiences and sustainable tourism growth.",
    tags: ["Tourism Management", "Hotel Operations", "Customer Service", "Hospitality"],
    duration: "4 Years",
    degreeType: "Bachelor's Degree",
    source: "MLVT, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Hotel Operations & Front Office", description: "Reservations, guest management, revenue management, and housekeeping standards.", icon: Building },
      { title: "Tourism Planning & Eco-Travel", description: "Destination marketing, cultural heritage preservation, and sustainable itineraries.", icon: Compass },
      { title: "Food & Beverage Management", description: "Restaurant operations, culinary hospitality, and sanitation certifications.", icon: UtensilsCrossed },
      { title: "Event & MICE Coordination", description: "Conferences, exhibitions, wedding galas, and corporate retreats.", icon: Briefcase },
    ],
    skillsDeveloped: ["Customer Service", "Communication", "Foreign Languages", "Event Organization"],
    careerPathways: [
      { title: "Hotel & Resort General Manager", description: "Direct operations, guest satisfaction, and financial performance.", icon: Building },
      { title: "Tourism Development Officer", description: "Coordinate regional travel marketing and eco-tourism projects.", icon: Compass },
      { title: "Event & Travel Consultant", description: "Design international travel experiences and manage corporate conventions.", icon: Globe },
    ],
    careerOpportunities: "Hotels, airlines, travel companies, tourism businesses",
    jobMarketDemand: "High / Recovering",
    relatedMajors: [
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
      { id: "marketing", name: "Marketing", icon: Megaphone },
      { id: "international-relations", name: "International Relations", icon: Globe },
    ],
    offerUniversities: parseUniversities("PUC, UME, other universities"),
    relatedOpportunities: [
      {
        title: "Cambodia Hospitality Leadership Traineeship",
        type: "Luxury Resort Residency",
        badgeText: "Hospitality",
        deadline: "Nov 2026",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },

  // 20. Graphic Design / Digital Arts & Design
  {
    id: "graphic-design",
    name: "Graphic Design / Digital Arts & Design",
    category: "Arts, Design & Media",
    badge: getDemandBadge("Growing / Competitive"),
    icon: Palette,
    iconBg: "bg-momo",
    iconColor: "text-[#EF4444]",
    description: "Focuses on visual communication, digital media, and creative design.",
    extendedDescription:
      "Graphic Design & Digital Arts explores the strategic craft of visual communication, aesthetic theory, brand identity creation, and interactive digital design. Students master typography, composition, color psychology, vector illustration, digital photo manipulation, 3D motion graphics, and UI/UX design systems.\n\nThrough hands-on studio projects, learners transform abstract concepts into striking visual narratives that captivate users across print, digital media, mobile apps, and video platforms. In an attention-driven digital economy, creative designers build memorable brand identities, intuitive user interfaces, and compelling multimedia assets.",
    tags: ["Graphic Design", "Typography", "Illustration", "Multimedia", "UI Design"],
    duration: "4 Years",
    degreeType: "Bachelor of Fine Arts",
    source: "MLVT, University Websites",
    sourceUrl: "https://www.mlvt.gov.kh",
    lastVerified: "2026",
    heroImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1600&auto=format&fit=crop&q=80",
    whatYouLearn: [
      { title: "Visual Communication & Layout", description: "Composition, color theory, visual hierarchy, and brand guidelines.", icon: Palette },
      { title: "Typography & Illustration", description: "Font pairing, custom lettering, vector artwork, and commercial illustration.", icon: Code2 },
      { title: "Digital UI & Interaction Design", description: "Figma wireframing, component design systems, and responsive interfaces.", icon: Laptop },
      { title: "Multimedia & Motion Graphics", description: "Video editing, 2D/3D animation, social media reels, and visual effects.", icon: Layers },
    ],
    skillsDeveloped: ["Creativity", "Design Software (Adobe, Figma)", "Communication", "Visual Thinking"],
    careerPathways: [
      { title: "Graphic Designer", description: "Craft visual brand identities, advertising posters, and publication layouts.", icon: Palette },
      { title: "UI / Product Designer", description: "Design user interfaces for mobile apps, websites, and SaaS platforms.", icon: Laptop },
      { title: "Creative & Multimedia Designer", description: "Produce video motion graphics, 3D assets, and interactive media.", icon: Layers },
    ],
    careerOpportunities: "Agencies, media, e-commerce, technology, freelance work",
    jobMarketDemand: "Growing / Competitive",
    relatedMajors: [
      { id: "marketing", name: "Marketing", icon: Megaphone },
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "architecture", name: "Architecture", icon: Building },
    ],
    offerUniversities: parseUniversities("PUC, Paragon.U, other universities"),
    relatedOpportunities: [
      {
        title: "Creative Arts Young Designer Award",
        type: "Studio Residency",
        badgeText: "Design",
        deadline: "Aug 2026",
        image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
];

/* ── Lookup Helper ──────────────────────────────────────── */

export function getMajorById(id: string): MajorItem | undefined {
  return MAJORS_DATA.find((m) => m.id === id);
}
