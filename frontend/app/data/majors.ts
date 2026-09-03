import {
  Laptop,
  FlaskConical,
  Briefcase,
  Palette,
  GraduationCap,
  HeartPulse,
  Binary,
  Leaf,
  Brain,
  BarChart3,
  Sparkles,
  Stethoscope,
  Shield,
  ShieldCheck,
  Code2,
  Cpu,
  Coins,
  Megaphone,
  Database,
  Layers,
  FileCode,
  LineChart,
  UserCheck,
  Search,
  Network,
  Activity,
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
  /**
   * 💡 EASY IMAGE CONFIGURATION:
   * Replace this URL with your own local image path (e.g., "/images/universities/itc.jpg")
   * or any web URL.
   */
  image: string;
  websiteUrl?: string;
}

export interface OpportunityItem {
  title: string;
  type: string;
  badgeText: string;
  deadline?: string;
  /**
   * 💡 EASY IMAGE CONFIGURATION:
   * Replace this URL with your own poster/banner image path (e.g., "/images/opportunities/scholarship.png")
   * or any web URL.
   */
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
  relatedMajors: RelatedMajorLink[];
  offerUniversities: UniversityItem[];
  relatedOpportunities: OpportunityItem[];
}

/* ── Categories ────────────────────────────────────────── */

export const CATEGORIES = [
  {
    id: "Computer Science",
    name: "Computer Science",
    icon: Laptop,
    bg: "bg-sitomo",
    iconColor: "text-sky-deep",
  },
  {
    id: "Science",
    name: "Science",
    icon: FlaskConical,
    bg: "bg-momo",
    iconColor: "text-[#D97736]",
  },
  {
    id: "Business",
    name: "Business",
    icon: Briefcase,
    bg: "bg-sitomo",
    iconColor: "text-blue-ink",
  },
  {
    id: "Art & Design",
    name: "Art & Design",
    icon: Palette,
    bg: "bg-momo",
    iconColor: "text-[#8B5CF6]",
  },
  {
    id: "Education",
    name: "Education",
    icon: GraduationCap,
    bg: "bg-sitomo",
    iconColor: "text-[#10B981]",
  },
  {
    id: "Healthcare",
    name: "Healthcare",
    icon: HeartPulse,
    bg: "bg-momo",
    iconColor: "text-[#EF4444]",
  },
];

/* ── 12 Curated Majors ─────────────────────────────────── */

export const MAJORS_DATA: MajorItem[] = [
  {
    id: "computer-science",
    name: "Computer Science",
    category: "Computer Science",
    badge: {
      text: "Featured",
      bg: "bg-[#E2F1F1]",
      textColor: "text-sky-deep",
    },
    icon: Laptop,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description:
      "Dive into the world of algorithms, data structures, and software engineering. Computer Science is the foundation of the digital age, empowering you to build the systems and applications that drive innovation across every industry.",
    tags: ["Algorithms", "Python", "Systems", "AI"],
    duration: "4 Years",
    degreeType: "Bachelor of Science",
    source: "ACM / IEEE Computing Curricula Standards",
    sourceUrl: "https://www.acm.org",
    lastVerified: "28 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Data Structures & Algorithms",
        description:
          "Learn to optimize code efficiency, solve complex computational problems, and evaluate time complexities.",
        icon: Binary,
      },
      {
        title: "Programming Languages",
        description:
          "Master foundational and modern languages like Python, Java, C++, TypeScript, and modern frameworks.",
        icon: FileCode,
      },
      {
        title: "Software Engineering",
        description:
          "Understand the full software development lifecycle from concept and architecture to CI/CD deployment.",
        icon: Layers,
      },
      {
        title: "Database Management",
        description:
          "Design, implement, and secure large-scale relational and distributed data storage systems.",
        icon: Database,
      },
    ],
    skillsDeveloped: [
      "Problem Solving",
      "Logical Thinking",
      "System Architecture",
      "Debugging",
      "Team Collaboration",
      "Analytical Skills",
    ],
    careerPathways: [
      {
        title: "Software Engineer",
        description:
          "Design and build complex applications, operating systems, cloud backends, and network control systems.",
        icon: Code2,
      },
      {
        title: "Data Scientist",
        description:
          "Analyze and interpret complex digital data to help organizations forecast trends and make data-driven decisions.",
        icon: LineChart,
      },
      {
        title: "Cybersecurity Analyst",
        description:
          "Protect computer networks, servers, and cloud environments by identifying vulnerabilities and preventing security breaches.",
        icon: Shield,
      },
    ],
    relatedMajors: [
      { id: "software-engineering", name: "Software Engineering", icon: Laptop },
      { id: "data-science", name: "Data Science", icon: Database },
      { id: "cybersecurity", name: "Cybersecurity", icon: ShieldCheck },
    ],
    offerUniversities: [
      {
        name: "Institute of Technology of Cambodia",
        shortName: "ITC",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
        websiteUrl: "https://www.itc.edu.kh",
      },
      {
        name: "Cambodia Academy of Digital Technology",
        shortName: "CADT",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
        websiteUrl: "https://www.cadt.edu.kh",
      },
      {
        name: "American University of Phnom Penh",
        shortName: "AUPP",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
        websiteUrl: "https://www.aupp.edu.kh",
      },
      {
        name: "Royal University of Phnom Penh",
        shortName: "RUPP",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&auto=format&fit=crop&q=80",
        websiteUrl: "https://www.rupp.edu.kh",
      },
    ],
    relatedOpportunities: [
      {
        title: "Call for Volunteering: Be Part of Code-C 2026",
        type: "Volunteer Program",
        badgeText: "Youth Program",
        deadline: "15 Oct 2026",
        image:
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
        link: "#",
      },
      {
        title: "Global Tech Leaders Scholarship (100% Tuition)",
        type: "Full Scholarship",
        badgeText: "Merit-Based",
        deadline: "30 Nov 2026",
        image:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
        link: "#",
      },
    ],
  },
  {
    id: "data-science",
    name: "Data Science",
    category: "Computer Science",
    badge: {
      text: "High Demand",
      bg: "bg-[#FCEAE6]",
      textColor: "text-[#D96B54]",
    },
    icon: Binary,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description:
      "Extract insights from complex data sets to inform strategic business decisions. Blends statistics, computer science, predictive modeling, and machine learning to turn raw data into strategic intelligence.",
    tags: ["Python", "Machine Learning", "Statistics", "SQL"],
    duration: "4 Years",
    degreeType: "Bachelor of Science",
    source: "ACM / IEEE Computing Curricula & BLS",
    sourceUrl: "https://www.acm.org",
    lastVerified: "28 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Applied Probability & Statistics",
        description:
          "Master regression modeling, probability theory, hypothesis testing, and Bayesian statistical techniques.",
        icon: LineChart,
      },
      {
        title: "Machine Learning & Neural Nets",
        description:
          "Train supervised and unsupervised models, computer vision systems, and modern deep neural architectures.",
        icon: Binary,
      },
      {
        title: "Big Data Pipelines",
        description:
          "Process massive streams using Apache Spark, Kafka, cloud data warehouses, and distributed storage.",
        icon: Database,
      },
      {
        title: "Data Visualization & Storytelling",
        description:
          "Communicate technical insights effectively through interactive dashboards and executive reports.",
        icon: BarChart3,
      },
    ],
    skillsDeveloped: [
      "Statistical Inference",
      "Model Evaluation",
      "Python / R",
      "Data Cleaning",
      "Communication",
      "Predictive Analytics",
    ],
    careerPathways: [
      {
        title: "Data Scientist",
        description:
          "Build predictive models and algorithms to solve high-impact commercial and research challenges.",
        icon: Binary,
      },
      {
        title: "Machine Learning Engineer",
        description:
          "Deploy machine learning pipelines into high-availability cloud environments.",
        icon: Cpu,
      },
      {
        title: "Business Intelligence Lead",
        description:
          "Translate analytical data into business strategy and operational KPIs.",
        icon: LineChart,
      },
    ],
    relatedMajors: [
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "business-analytics", name: "Business Analytics", icon: BarChart3 },
      { id: "ai-robotics", name: "AI & Robotics", icon: Cpu },
    ],
    offerUniversities: [
      {
        name: "Cambodia Academy of Digital Technology",
        shortName: "CADT",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "American University of Phnom Penh",
        shortName: "AUPP",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
      },
    ],
    relatedOpportunities: [
      {
        title: "Data Science Fellowship 2026",
        type: "Fellowship",
        badgeText: "Sponsored",
        image:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "software-engineering",
    name: "Software Engineering",
    category: "Computer Science",
    badge: {
      text: "High Demand",
      bg: "bg-[#FCEAE6]",
      textColor: "text-[#D96B54]",
    },
    icon: Code2,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description:
      "Focus on the systematic design, development, testing, and maintenance of scalable software systems. Emphasizes enterprise architecture, cloud deployment, and collaborative development standards.",
    tags: ["Full-Stack", "DevOps", "Cloud Architecture", "Agile"],
    duration: "4 Years",
    degreeType: "Bachelor of Engineering",
    source: "IEEE Computer Society Standards",
    sourceUrl: "https://www.computer.org",
    lastVerified: "20 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Enterprise Architecture",
        description:
          "Design microservices, serverless systems, and event-driven backends capable of scaling to millions of users.",
        icon: Layers,
      },
      {
        title: "Full-Stack Web & Mobile",
        description:
          "Build responsive interfaces, native apps, and resilient REST/GraphQL APIs.",
        icon: Laptop,
      },
      {
        title: "DevOps & Cloud Infrastructure",
        description:
          "Automate deployment pipelines using Docker, Kubernetes, Terraform, and AWS/GCP.",
        icon: Network,
      },
      {
        title: "Software Quality & Testing",
        description:
          "Implement unit tests, integration suites, performance benchmarking, and security audits.",
        icon: Shield,
      },
    ],
    skillsDeveloped: [
      "Full-Stack Dev",
      "CI/CD Automation",
      "System Design",
      "Code Refactoring",
      "Git & Team Workflows",
    ],
    careerPathways: [
      {
        title: "Full-Stack Developer",
        description: "Deliver end-to-end features across frontend and backend web technologies.",
        icon: Code2,
      },
      {
        title: "DevOps Engineer",
        description: "Maintain cloud infrastructure, scalability, and automated deployments.",
        icon: Network,
      },
      {
        title: "Cloud Solutions Architect",
        description: "Architect secure, fault-tolerant enterprise cloud platforms and microservices.",
        icon: Layers,
      },
    ],
    relatedMajors: [
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "cybersecurity", name: "Cybersecurity", icon: Shield },
      { id: "data-science", name: "Data Science", icon: Binary },
    ],
    offerUniversities: [
      {
        name: "Institute of Technology of Cambodia",
        shortName: "ITC",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Cambodia Academy of Digital Technology",
        shortName: "CADT",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
      },
    ],
    relatedOpportunities: [
      {
        title: "Junior Developer Internship Scheme",
        type: "Internship",
        badgeText: "Paid",
        image:
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity & Information Defense",
    category: "Computer Science",
    badge: {
      text: "Critical Need",
      bg: "bg-[#FEE2E2]",
      textColor: "text-[#DC2626]",
    },
    icon: Shield,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description:
      "Protect critical national infrastructure, corporate digital assets, and user data. Master ethical hacking, threat intelligence, cryptography, and regulatory compliance.",
    tags: ["Ethical Hacking", "Cryptography", "Network Defense", "Forensics"],
    duration: "4 Years",
    degreeType: "Bachelor of Science",
    source: "NIST Cybersecurity Framework",
    sourceUrl: "https://www.nist.gov",
    lastVerified: "19 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Penetration Testing & Red Teaming",
        description: "Simulate real-world attacks to find zero-day weaknesses in apps and networks.",
        icon: Shield,
      },
      {
        title: "Digital Forensics & Incident Response",
        description: "Investigate breaches, recover evidence, and neutralize persistent threats.",
        icon: Search,
      },
      {
        title: "Cryptography & Protocol Security",
        description: "Implement public key infrastructure, zero-knowledge proofs, and secure protocols.",
        icon: Binary,
      },
      {
        title: "Cloud & Network Hardening",
        description: "Configure firewalls, zero-trust architectures, and identity access controls.",
        icon: Network,
      },
    ],
    skillsDeveloped: [
      "Vulnerability Assessment",
      "Network Protocol Analysis",
      "Security Auditing",
      "Risk Governance",
    ],
    careerPathways: [
      {
        title: "Security Operations Analyst (SOC)",
        description: "Monitor and defend networks against real-time cyber intrusions.",
        icon: Shield,
      },
      {
        title: "Penetration Tester",
        description: "Ethically break into systems to discover vulnerabilities before adversaries do.",
        icon: UserCheck,
      },
      {
        title: "Security Systems Architect",
        description: "Design zero-trust architectures and organizational defense policies.",
        icon: Layers,
      },
    ],
    relatedMajors: [
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "software-engineering", name: "Software Engineering", icon: Code2 },
      { id: "ai-robotics", name: "AI & Robotics", icon: Cpu },
    ],
    offerUniversities: [
      {
        name: "Cambodia Academy of Digital Technology",
        shortName: "CADT",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
      },
    ],
    relatedOpportunities: [
      {
        title: "National Cyber Defense Competition",
        type: "Competition",
        badgeText: "Annual",
        image:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "environmental-engineering",
    name: "Environmental Engineering",
    category: "Science",
    badge: {
      text: "Sustainability",
      bg: "bg-[#E6F4EA]",
      textColor: "text-[#137333]",
    },
    icon: Leaf,
    iconBg: "bg-[#FDF0E9]",
    iconColor: "text-[#E07A5F]",
    description:
      "Develop innovative technical solutions to ecological challenges, including water sanitation, renewable energy infrastructure, climate resilience, and industrial waste mitigation.",
    tags: ["Sustainability", "Fluid Mechanics", "Ecology", "Renewables"],
    duration: "4 Years",
    degreeType: "Bachelor of Engineering",
    source: "ABET Engineering Accreditation & EPA",
    sourceUrl: "https://www.abet.org",
    lastVerified: "20 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Water Resources & Treatment",
        description: "Design biological and physical purification systems for municipal water supplies.",
        icon: Activity,
      },
      {
        title: "Renewable Energy Systems",
        description: "Engineer solar, hydro, and wind integration for sustainable power generation.",
        icon: Leaf,
      },
      {
        title: "Environmental Impact Assessment",
        description: "Quantify carbon emissions, pollutant dispersion, and regulatory standards.",
        icon: LineChart,
      },
      {
        title: "Circular Economy & Waste Systems",
        description: "Develop closed-loop manufacturing, recycling, and materials recovery processes.",
        icon: Layers,
      },
    ],
    skillsDeveloped: [
      "Environmental Auditing",
      "GIS Mapping",
      "Fluid Dynamics",
      "Climate Risk Analysis",
    ],
    careerPathways: [
      {
        title: "Sustainability Consultant",
        description: "Advise governments and multinationals on zero-carbon transitions.",
        icon: Leaf,
      },
      {
        title: "Water Resource Engineer",
        description: "Design flood prevention and clean water infrastructure.",
        icon: Activity,
      },
      {
        title: "Renewable Energy Specialist",
        description: "Design, test, and implement solar, wind, and bioenergy technologies.",
        icon: Sparkles,
      },
    ],
    relatedMajors: [
      { id: "biomedical-sciences", name: "Biomedical Sciences", icon: Stethoscope },
      { id: "cognitive-science", name: "Cognitive Science", icon: Brain },
      { id: "software-engineering", name: "Software Engineering", icon: Code2 },
    ],
    offerUniversities: [
      {
        name: "Institute of Technology of Cambodia",
        shortName: "ITC",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Royal University of Phnom Penh",
        shortName: "RUPP",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&auto=format&fit=crop&q=80",
      },
    ],
    relatedOpportunities: [
      {
        title: "Mekong Basin Sustainability Research Grant",
        type: "Research Grant",
        badgeText: "Funded",
        image:
          "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "cognitive-science",
    name: "Cognitive Science",
    category: "Science",
    badge: {
      text: "Growing",
      bg: "bg-[#FDF0E6]",
      textColor: "text-[#CF7A42]",
    },
    icon: Brain,
    iconBg: "bg-sitomo",
    iconColor: "text-[#4F868A]",
    description:
      "Explore the interdisciplinary study of mind and intelligence. Integrates cognitive psychology, computational neuroscience, linguistics, philosophy, and human-computer interaction.",
    tags: ["Neuroscience", "Psychology", "HCI", "Research"],
    duration: "4 Years",
    degreeType: "Bachelor of Science",
    source: "Cognitive Science Society",
    sourceUrl: "https://cognitivesciencesociety.org",
    lastVerified: "15 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Neural Computation & Memory",
        description: "Study biological neural circuits, synaptic plasticity, and perceptual processing.",
        icon: Brain,
      },
      {
        title: "Human-Centered Interaction",
        description: "Evaluate user mental models, cognitive load, and decision architecture.",
        icon: UserCheck,
      },
      {
        title: "Linguistics & Natural Language",
        description: "Analyze semantic representation, speech synthesis, and language acquisition.",
        icon: FileCode,
      },
      {
        title: "Experimental Research Design",
        description: "Conduct eye-tracking, behavioral experiments, and neuroimaging studies.",
        icon: Search,
      },
    ],
    skillsDeveloped: [
      "User Research",
      "Experimental Design",
      "Cognitive Modeling",
      "Data Analysis",
    ],
    careerPathways: [
      {
        title: "UX Researcher",
        description: "Investigate how users perceive and navigate digital products.",
        icon: UserCheck,
      },
      {
        title: "AI Interaction Specialist",
        description: "Design intuitive interfaces between human users and autonomous AI agents.",
        icon: Cpu,
      },
      {
        title: "Cognitive Systems Researcher",
        description: "Develop human-aligned cognitive models and decision frameworks.",
        icon: Brain,
      },
    ],
    relatedMajors: [
      { id: "digital-design", name: "UI/UX & Interactive Design", icon: Sparkles },
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "data-science", name: "Data Science", icon: Binary },
    ],
    offerUniversities: [
      {
        name: "American University of Phnom Penh",
        shortName: "AUPP",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
      },
    ],
    relatedOpportunities: [
      {
        title: "Cognitive AI Lab Fellowship",
        type: "Fellowship",
        badgeText: "International",
        image:
          "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "business-analytics",
    name: "Business Analytics",
    category: "Business",
    badge: {
      text: "High Demand",
      bg: "bg-[#FCEAE6]",
      textColor: "text-[#D96B54]",
    },
    icon: BarChart3,
    iconBg: "bg-sitomo",
    iconColor: "text-blue-ink",
    description:
      "Bridge commercial strategy and quantitative modeling. Use descriptive, predictive, and prescriptive analytics to optimize supply chains, financial assets, and market growth.",
    tags: ["Financial Modeling", "SQL", "Strategy", "Tableau"],
    duration: "3-4 Years",
    degreeType: "Bachelor of Business Administration",
    source: "AACSB Business Accreditation Standards",
    sourceUrl: "https://www.aacsb.edu",
    lastVerified: "18 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Commercial Forecasting & Econometrics",
        description: "Model market volatility, consumer demand curves, and price elasticity.",
        icon: LineChart,
      },
      {
        title: "Supply Chain & Operations Optimization",
        description: "Apply linear programming and queuing theory to eliminate operational bottlenecks.",
        icon: Layers,
      },
      {
        title: "Data Visualization & Dashboards",
        description: "Build automated PowerBI and Tableau dashboards for executive decision-makers.",
        icon: BarChart3,
      },
      {
        title: "Strategic Decision Frameworks",
        description: "Evaluate M&A opportunities, venture capital investments, and market entry strategies.",
        icon: Briefcase,
      },
    ],
    skillsDeveloped: [
      "Financial Analysis",
      "Executive Storytelling",
      "Spreadsheet Modeling",
      "SQL Querying",
    ],
    careerPathways: [
      {
        title: "Management Consultant",
        description: "Solve complex operational challenges for top corporate clients.",
        icon: Briefcase,
      },
      {
        title: "Operations Analyst",
        description: "Streamline logistics and production costs across global supply chains.",
        icon: LineChart,
      },
      {
        title: "Strategic Growth Strategist",
        description: "Model market expansion and quantitative forecasting frameworks.",
        icon: Layers,
      },
    ],
    relatedMajors: [
      { id: "data-science", name: "Data Science", icon: Binary },
      { id: "financial-technology", name: "Financial Technology", icon: Coins },
      { id: "software-engineering", name: "Software Engineering", icon: Code2 },
    ],
    offerUniversities: [
      {
        name: "American University of Phnom Penh",
        shortName: "AUPP",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "National University of Management",
        shortName: "NUM",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
      },
    ],
    relatedOpportunities: [
      {
        title: "Future Business Leaders Case Challenge",
        type: "Case Competition",
        badgeText: "$5,000 Prize",
        image:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "financial-technology",
    name: "Financial Technology (FinTech)",
    category: "Business",
    badge: {
      text: "Fast Growth",
      bg: "bg-[#EBF7F2]",
      textColor: "text-[#059669]",
    },
    icon: Coins,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description:
      "At the intersection of finance, cryptography, and modern software. Learn digital payments, decentralized finance (DeFi), algorithmic trading, and modern regulatory compliance (RegTech).",
    tags: ["Blockchain", "Digital Banking", "Algorithmic Trading", "Risk"],
    duration: "4 Years",
    degreeType: "Bachelor of Science",
    source: "Global FinTech Institute",
    sourceUrl: "https://www.gfintech.org",
    lastVerified: "21 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Digital Payments & Neo-Banking",
        description: "Architect instant payment settlement rails and mobile wallet infrastructure.",
        icon: Coins,
      },
      {
        title: "Algorithmic Trading Systems",
        description: "Implement high-frequency order routing, market making, and automated execution.",
        icon: LineChart,
      },
      {
        title: "Smart Contracts & Distributed Ledgers",
        description: "Develop audited smart contracts and tokenized asset platforms.",
        icon: Binary,
      },
      {
        title: "Anti-Money Laundering & RegTech",
        description: "Implement automated compliance checks and fraud detection algorithms.",
        icon: Shield,
      },
    ],
    skillsDeveloped: [
      "Quantitative Finance",
      "Smart Contract Auditing",
      "Risk Mitigation",
      "API Integration",
    ],
    careerPathways: [
      {
        title: "FinTech Product Manager",
        description: "Lead consumer banking apps and merchant payment gateway solutions.",
        icon: Coins,
      },
      {
        title: "Quantitative Risk Analyst",
        description: "Forecast capital exposure and automate credit scoring models.",
        icon: LineChart,
      },
      {
        title: "Blockchain Protocol Engineer",
        description: "Develop decentralized settlement layers and audited digital contracts.",
        icon: Binary,
      },
    ],
    relatedMajors: [
      { id: "business-analytics", name: "Business Analytics", icon: BarChart3 },
      { id: "software-engineering", name: "Software Engineering", icon: Code2 },
      { id: "cybersecurity", name: "Cybersecurity", icon: Shield },
    ],
    offerUniversities: [
      {
        name: "Cambodia Academy of Digital Technology",
        shortName: "CADT",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
      },
    ],
    relatedOpportunities: [
      {
        title: "National Digital Currency Innovation Award",
        type: "Hackathon",
        badgeText: "Sponsored by NBC",
        image:
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "digital-design",
    name: "UI/UX & Interactive Design",
    category: "Art & Design",
    badge: {
      text: "Popular",
      bg: "bg-[#F3EEFE]",
      textColor: "text-[#7C3AED]",
    },
    icon: Sparkles,
    iconBg: "bg-momo",
    iconColor: "text-[#8B5CF6]",
    description:
      "Design accessible user interfaces, interactive design systems, and engaging experiences across web, mobile, AR, and next-generation device ecosystems.",
    tags: ["Design Systems", "Prototyping", "User Research", "Figma"],
    duration: "4 Years",
    degreeType: "Bachelor of Fine Arts",
    source: "AIGA Design Standards & Nielsen Norman Group",
    sourceUrl: "https://www.nngroup.com",
    lastVerified: "24 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Interaction Design & Prototyping",
        description: "Craft high-fidelity micro-interactions, responsive states, and accessible flows in Figma.",
        icon: Sparkles,
      },
      {
        title: "Design Systems & Token Architecture",
        description: "Build comprehensive component libraries adhering to WCAG 2.2 accessibility standards.",
        icon: Layers,
      },
      {
        title: "Usability Testing & Analytics",
        description: "Run moderated user testing sessions, heatmaps, and conversion optimization.",
        icon: UserCheck,
      },
      {
        title: "Motion & Spatial Design",
        description: "Integrate kinetic UI principles, 3D interaction, and augmented reality assets.",
        icon: Palette,
      },
    ],
    skillsDeveloped: [
      "Figma Mastery",
      "Wireframing",
      "Information Architecture",
      "Accessibility (WCAG)",
      "Design Systems",
    ],
    careerPathways: [
      {
        title: "Product Designer",
        description: "Lead product usability and visual identity from discovery to launch.",
        icon: Sparkles,
      },
      {
        title: "Design Systems Lead",
        description: "Standardize design tokens and component kits across large engineering organizations.",
        icon: Layers,
      },
      {
        title: "Creative Director & UX Strategist",
        description: "Oversee interactive brand narrative and multi-platform consumer journeys.",
        icon: Palette,
      },
    ],
    relatedMajors: [
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "cognitive-science", name: "Cognitive Science", icon: Brain },
      { id: "digital-marketing", name: "Digital Marketing", icon: Megaphone },
    ],
    offerUniversities: [
      {
        name: "Royal University of Fine Arts",
        shortName: "RUFA",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Cambodia Academy of Digital Technology",
        shortName: "CADT",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
      },
    ],
    relatedOpportunities: [
      {
        title: "Young Creative Designers Exhibition",
        type: "Showcase",
        badgeText: "Annual",
        image:
          "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "biomedical-sciences",
    name: "Biomedical Sciences",
    category: "Healthcare",
    badge: {
      text: "High Growth",
      bg: "bg-[#EBF7F2]",
      textColor: "text-[#059669]",
    },
    icon: Stethoscope,
    iconBg: "bg-momo",
    iconColor: "text-[#EF4444]",
    description:
      "Investigate cellular biology, pharmacology, diagnostics, and human genetics to accelerate therapies, develop vaccines, and advance precision healthcare technology.",
    tags: ["Genetics", "Clinical Trials", "Biochemistry", "Pathology"],
    duration: "4 Years",
    degreeType: "Bachelor of Science",
    source: "NIH & Biomedical Science Institute Standards",
    sourceUrl: "https://www.nih.gov",
    lastVerified: "22 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Molecular Genetics & CRISPR",
        description: "Study DNA sequencing, genetic modification, and cellular pathology.",
        icon: FlaskConical,
      },
      {
        title: "Immunology & Virology",
        description: "Analyze immune system responses, antibody therapies, and vaccine vectors.",
        icon: Activity,
      },
      {
        title: "Clinical Trial Protocols",
        description: "Understand FDA/EMA approval phases, patient safety ethics, and trial data management.",
        icon: UserCheck,
      },
      {
        title: "Bio-Instrumentation & Imaging",
        description: "Operate spectrometry, electron microscopes, and automated diagnostic analyzers.",
        icon: Stethoscope,
      },
    ],
    skillsDeveloped: [
      "Laboratory Protocols",
      "Clinical Analysis",
      "Bioethics",
      "Scientific Writing",
    ],
    careerPathways: [
      {
        title: "Clinical Research Associate",
        description: "Oversee trial compliance and patient safety in medical research centers.",
        icon: Stethoscope,
      },
      {
        title: "Biotech Laboratory Scientist",
        description: "Conduct cutting-edge diagnostic tests and therapeutic discovery.",
        icon: FlaskConical,
      },
      {
        title: "Bioinformatics Scientist",
        description: "Analyze genomic datasets and computational biology algorithms for precision medicine.",
        icon: Binary,
      },
    ],
    relatedMajors: [
      { id: "environmental-engineering", name: "Environmental Engineering", icon: Leaf },
      { id: "data-science", name: "Data Science", icon: Binary },
      { id: "cognitive-science", name: "Cognitive Science", icon: Brain },
    ],
    offerUniversities: [
      {
        name: "University of Health Sciences",
        shortName: "UHS",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
      },
    ],
    relatedOpportunities: [
      {
        title: "Global Medical Research Fellowship",
        type: "Grant",
        badgeText: "Full Funding",
        image:
          "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "ai-robotics",
    name: "Artificial Intelligence & Robotics",
    category: "Computer Science",
    badge: {
      text: "NextGen",
      bg: "bg-[#F3EEFE]",
      textColor: "text-[#7C3AED]",
    },
    icon: Cpu,
    iconBg: "bg-sitomo",
    iconColor: "text-sky-deep",
    description:
      "Combine autonomous robotics, computer vision, kinematics, and generative artificial intelligence. Engineer machines and intelligent agents that perceive, reason, and act in the physical and digital world.",
    tags: ["Robotics", "Computer Vision", "Control Systems", "Deep Learning"],
    duration: "4 Years",
    degreeType: "Bachelor of Engineering",
    source: "IEEE Robotics & Automation Society",
    sourceUrl: "https://www.ieee-ras.org",
    lastVerified: "27 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Robot Kinematics & Motion Planning",
        description: "Model robotic arms, inverse kinematics, trajectory generation, and motor controls.",
        icon: Cpu,
      },
      {
        title: "Computer Vision & Spatial Mapping",
        description: "Process LiDAR point clouds, visual SLAM, and real-time object tracking.",
        icon: Search,
      },
      {
        title: "Reinforcement Learning & Autonomy",
        description: "Train agents using policy gradients, simulation environments, and reward models.",
        icon: Binary,
      },
      {
        title: "Embedded Systems & Sensor Fusion",
        description: "Integrate IMUs, microcontrollers, real-time operating systems (RTOS), and ROS2.",
        icon: Layers,
      },
    ],
    skillsDeveloped: [
      "ROS / ROS2",
      "Sensor Fusion",
      "Control Theory",
      "C++ & Python",
      "3D Spatial Math",
    ],
    careerPathways: [
      {
        title: "Robotics Software Engineer",
        description: "Program autonomous mobile robots, warehouse automation, and drone navigation.",
        icon: Cpu,
      },
      {
        title: "Computer Vision Engineer",
        description: "Build visual recognition systems for autonomous vehicles and industrial quality control.",
        icon: Search,
      },
      {
        title: "Autonomous Systems Architect",
        description: "Engineer motion planning, perception fusion, and vehicle hardware integrations.",
        icon: Network,
      },
    ],
    relatedMajors: [
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "data-science", name: "Data Science", icon: Binary },
      { id: "software-engineering", name: "Software Engineering", icon: Code2 },
    ],
    offerUniversities: [
      {
        name: "Institute of Technology of Cambodia",
        shortName: "ITC",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Cambodia Academy of Digital Technology",
        shortName: "CADT",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
      },
    ],
    relatedOpportunities: [
      {
        title: "Asia-Pacific Robocon Championship",
        type: "International Event",
        badgeText: "National Team Selection",
        image:
          "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing & Media Strategy",
    category: "Business",
    badge: {
      text: "Creative",
      bg: "bg-[#FFF4E5]",
      textColor: "text-[#B76E00]",
    },
    icon: Megaphone,
    iconBg: "bg-momo",
    iconColor: "text-[#B76E00]",
    description:
      "Master modern content strategy, consumer psychology, search engine optimization (SEO), performance advertising, and multi-channel campaign analytics in the creator economy.",
    tags: ["SEO", "Performance Ads", "Content Strategy", "Brand"],
    duration: "3-4 Years",
    degreeType: "Bachelor of Arts",
    source: "Digital Marketing Institute Standards",
    sourceUrl: "https://digitalmarketinginstitute.com",
    lastVerified: "25 August 2026",
    heroImage:
      "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1000&auto=format&fit=crop&q=80",
    whatYouLearn: [
      {
        title: "Search & Algorithmic Discovery",
        description: "Master technical SEO, schema architecture, and algorithmic social recommendations.",
        icon: Search,
      },
      {
        title: "Performance Ads & Paid Growth",
        description: "Manage programmatic campaigns across Meta, Google Ads, TikTok, and DSP networks.",
        icon: LineChart,
      },
      {
        title: "Audience Psychology & Copywriting",
        description: "Craft compelling narrative hooks and conversion-centered landing page architecture.",
        icon: Megaphone,
      },
      {
        title: "Marketing Attribution & Analytics",
        description: "Track customer acquisition cost (CAC), lifetime value (LTV), and multi-touch attribution models.",
        icon: BarChart3,
      },
    ],
    skillsDeveloped: [
      "Campaign Management",
      "Copywriting",
      "Google Analytics 4",
      "Conversion Rate Optimization",
    ],
    careerPathways: [
      {
        title: "Growth Marketing Manager",
        description: "Scale organic and paid user acquisition for high-growth tech startups.",
        icon: Megaphone,
      },
      {
        title: "Brand Strategy Director",
        description: "Define corporate brand positioning and strategic media campaigns.",
        icon: Palette,
      },
      {
        title: "Marketing Analytics Lead",
        description: "Model customer lifetime values, attribution models, and conversion optimization.",
        icon: LineChart,
      },
    ],
    relatedMajors: [
      { id: "business-analytics", name: "Business Analytics", icon: BarChart3 },
      { id: "digital-design", name: "UI/UX & Interactive Design", icon: Sparkles },
      { id: "financial-technology", name: "Financial Technology", icon: Coins },
    ],
    offerUniversities: [
      {
        name: "National University of Management",
        shortName: "NUM",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "American University of Phnom Penh",
        shortName: "AUPP",
        location: "Phnom Penh",
        image:
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80",
      },
    ],
    relatedOpportunities: [
      {
        title: "Digital Creator Accelerator Grant",
        type: "Incubator",
        badgeText: "Seed Funding",
        image:
          "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&auto=format&fit=crop&q=80",
      },
    ],
  },
];

