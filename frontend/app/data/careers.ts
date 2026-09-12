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
  Code2,
  LucideIcon,
  Network,
} from "lucide-react";

/* ── Interfaces ────────────────────────────────────────── */

export interface CareerMajorLink {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface CareerItem {
  id: string;
  title: string;
  category: string;
  shortOverview: string;
  description: string;
  whatYouDo: string;
  icon: LucideIcon;
  image: string;
  relatedMajorsText: string[];
  relatedMajors: CareerMajorLink[];
  keySkills: string[];
  skillsFromMajors: string[];
  educationRequired: string;
  bestFitPersonality: string[];
  jobMarketDemand: string;
}

/* ── Career categories ─────────────────────────────────── */

export const CAREER_CATEGORIES = [
  {
    id: "Technology & Digital",
    name: "Technology & Digital",
    icon: Laptop,
    bg: "bg-sitomo",
    iconColor: "text-sky-deep",
  },
  {
    id: "Business & Finance",
    name: "Business & Finance",
    icon: Briefcase,
    bg: "bg-momo",
    iconColor: "text-[#D97736]",
  },
  {
    id: "Engineering & Construction",
    name: "Engineering & Construction",
    icon: Cpu,
    bg: "bg-sitomo",
    iconColor: "text-blue-ink",
  },
  {
    id: "Social Sciences & Public Affairs",
    name: "Social Sciences & Public Affairs",
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
    id: "Creative & Design",
    name: "Creative & Design",
    icon: Palette,
    bg: "bg-momo",
    iconColor: "text-[#EF4444]",
  },
];

/* ── 20 Careers Data ───────────────────────────────────── */

export const CAREERS_DATA: CareerItem[] = [
  // 1. Software Developer
  {
    id: "software-developer",
    title: "Software Developer",
    category: "Technology & Digital",
    shortOverview:
      "A software developer is someone who creates, builds, and maintains software applications, websites, and digital programs. They use programming languages and problem-solving skills to turn ideas into working technology that can be used by individuals, businesses, and organizations. Software developers can work in areas such as web development, mobile applications, gaming, or enterprise software.",
    description:
      "A software developer is someone who creates, builds, and maintains software applications, websites, and digital programs. They use programming languages and problem-solving skills to turn ideas into working technology that can be used by individuals, businesses, and organizations.",
    whatYouDo: "Develops and maintains software applications and systems.",
    icon: Code2,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Computer Science", "IT", "Software Engineering"],
    relatedMajors: [
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "information-technology", name: "Information Technology", icon: Network },
    ],
    keySkills: ["Programming", "Problem-solving", "Databases", "Teamwork"],
    skillsFromMajors: ["Programming", "Problem-solving", "Databases", "Teamwork"],
    educationRequired: "Bachelor's in CS, IT, Software Engineering, or related major",
    bestFitPersonality: ["Logical", "Curious", "Persistent", "Tech-oriented"],
    jobMarketDemand: "High",
  },
  // 2. IT Support Specialist
  {
    id: "it-support-specialist",
    title: "IT Support Specialist",
    category: "Technology & Digital",
    shortOverview:
      "An IT support specialist is someone who helps people and organizations solve problems related to computers, software, networks, and other technology. They troubleshoot technical issues, install and maintain systems, and guide users when they have difficulties using technology. This career is important for keeping an organization's technology working smoothly and efficiently.",
    description:
      "An IT support specialist is someone who helps people and organizations solve problems related to computers, software, networks, and other technology. They troubleshoot technical issues, install and maintain systems, and guide users when they have difficulties using technology.",
    whatYouDo: "Helps organizations solve hardware, software, and technical problems.",
    icon: Wrench,
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["IT", "CS", "Information Systems"],
    relatedMajors: [
      { id: "information-technology", name: "Information Technology", icon: Network },
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "business-information-systems", name: "Business Information Systems", icon: Layers },
    ],
    keySkills: ["Troubleshooting", "Communication", "Networking", "Customer service"],
    skillsFromMajors: ["Troubleshooting", "Communication", "Networking", "Customer service"],
    educationRequired: "Bachelor's in IT, CS, or related major",
    bestFitPersonality: ["Practical", "Patient", "Organized", "Helpful"],
    jobMarketDemand: "High",
  },
  // 3. Cybersecurity Analyst
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    category: "Technology & Digital",
    shortOverview:
      "A cybersecurity analyst is someone who protects computer systems, networks, and sensitive information from cyber threats. They monitor systems for suspicious activity, identify security weaknesses, and respond to potential attacks or data breaches. Cybersecurity analysts play an important role in helping organizations protect their digital information and prevent security incidents.",
    description:
      "A cybersecurity analyst is someone who protects computer systems, networks, and sensitive information from cyber threats. They monitor systems for suspicious activity, identify security weaknesses, and respond to potential attacks or data breaches.",
    whatYouDo: "Protects systems and information from security threats.",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Cybersecurity", "CS", "IT"],
    relatedMajors: [
      { id: "cybersecurity", name: "Cybersecurity", icon: ShieldCheck },
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "information-technology", name: "Information Technology", icon: Network },
    ],
    keySkills: ["Network security", "Analysis", "Problem-solving", "Risk awareness"],
    skillsFromMajors: ["Network security", "Analysis", "Problem-solving", "Risk awareness"],
    educationRequired: "Bachelor's in Cybersecurity, CS, IT, or related major",
    bestFitPersonality: ["Observant", "Analytical", "Curious", "Cautious", "Calm"],
    jobMarketDemand: "High / Growing",
  },
  // 4. Data Analyst
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Technology & Digital",
    shortOverview:
      "A data analyst is someone who collects, organizes, and studies data to help organizations understand what is happening and make better decisions. They use tools such as spreadsheets, databases, and data visualization software to identify patterns and trends in information. Data analysts can work across many industries, including business, finance, healthcare, technology, and marketing.",
    description:
      "A data analyst is someone who collects, organizes, and studies data to help organizations understand what is happening and make better decisions. They use tools such as spreadsheets, databases, and data visualization software to identify patterns and trends in information.",
    whatYouDo: "Uses data to identify patterns and support business decisions.",
    icon: LineChart,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Data Science", "CS", "Economics", "Business"],
    relatedMajors: [
      { id: "data-science", name: "Data Science", icon: LineChart },
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "economics", name: "Economics", icon: LineChart },
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
    ],
    keySkills: ["Excel", "SQL", "Statistics", "Visualization", "Analytical thinking"],
    skillsFromMajors: ["Excel", "SQL", "Statistics", "Visualization", "Analytical thinking"],
    educationRequired: "Bachelor's in Data Science, CS, Statistics, Economics, or related major",
    bestFitPersonality: ["Analytical", "Curious", "Numbers-oriented", "Detail-oriented"],
    jobMarketDemand: "Growing",
  },
  // 5. AI / Machine Learning Engineer
  {
    id: "ai-machine-learning-engineer",
    title: "AI / Machine Learning Engineer",
    category: "Technology & Digital",
    shortOverview:
      "An AI or machine learning engineer is someone who develops computer systems that can learn from data and perform tasks that normally require human intelligence. They create, train, and improve machine learning models that can be used for prediction, automation, recommendation systems, image recognition, and other applications. This career combines programming, mathematics, statistics, and problem-solving to develop intelligent technologies.",
    description:
      "An AI or machine learning engineer is someone who develops computer systems that can learn from data and perform tasks that normally require human intelligence. They create, train, and improve machine learning models for prediction, automation, and intelligent applications.",
    whatYouDo: "Develops systems using AI and machine learning.",
    icon: Brain,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["AI", "CS", "Data Science"],
    relatedMajors: [
      { id: "artificial-intelligence", name: "Artificial Intelligence", icon: Brain },
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "data-science", name: "Data Science", icon: LineChart },
    ],
    keySkills: ["Python", "Mathematics", "Statistics", "ML", "Programming"],
    skillsFromMajors: ["Python", "Mathematics", "Statistics", "ML", "Programming"],
    educationRequired: "Bachelor's in AI, CS, Data Science, or related major",
    bestFitPersonality: ["Innovative", "Analytical", "Curious", "Mathematical"],
    jobMarketDemand: "Growing / High Potential",
  },
  // 6. Business Analyst
  {
    id: "business-analyst",
    title: "Business Analyst",
    category: "Technology & Digital",
    shortOverview:
      "A business analyst is someone who studies how an organization works and helps identify problems, opportunities, and ways to improve its performance. They communicate with different teams, analyze business information, and help design solutions that meet an organization's needs. Business analysts often work between business and technology teams to make sure new systems or processes are useful and effective.",
    description:
      "A business analyst is someone who studies how an organization works and helps identify problems, opportunities, and ways to improve its performance. They communicate with different teams and help design effective solutions.",
    whatYouDo: "Analyzes business problems and helps improve processes and decisions.",
    icon: Layers,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Business Administration", "BIS", "Economics"],
    relatedMajors: [
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
      { id: "business-information-systems", name: "Business Information Systems", icon: Layers },
      { id: "economics", name: "Economics", icon: LineChart },
    ],
    keySkills: ["Analysis", "Communication", "Research", "Problem-solving"],
    skillsFromMajors: ["Analysis", "Communication", "Research", "Problem-solving"],
    educationRequired: "Bachelor's in Business, BIS, Economics, or related major",
    bestFitPersonality: ["Analytical", "Organized", "Communicative", "Strategic"],
    jobMarketDemand: "High / Growing",
  },
  // 7. Marketing Specialist
  {
    id: "marketing-specialist",
    title: "Marketing Specialist",
    category: "Business & Finance",
    shortOverview:
      "A marketing specialist is someone who helps a business promote its products, services, or brand and connect with its target customers. They may work on social media, advertising, content creation, market research, branding, and marketing campaigns. Their goal is to understand customers and create strategies that increase awareness, engagement, and sales.",
    description:
      "A marketing specialist is someone who helps a business promote its products, services, or brand and connect with its target customers. They work on social media, advertising, branding, and market research to drive growth.",
    whatYouDo: "Plans marketing activities to attract and retain customers.",
    icon: Megaphone,
    image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Marketing", "Business", "Digital Business"],
    relatedMajors: [
      { id: "marketing", name: "Marketing", icon: Megaphone },
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
      { id: "digital-business", name: "Digital Business", icon: LineChart },
    ],
    keySkills: ["Communication", "Creativity", "Digital marketing", "Analytics"],
    skillsFromMajors: ["Communication", "Creativity", "Digital marketing", "Analytics"],
    educationRequired: "Bachelor's in Marketing, Business, Digital Business, or related major",
    bestFitPersonality: ["Creative", "Persuasive", "People-oriented", "Expressive"],
    jobMarketDemand: "High",
  },
  // 8. Accountant
  {
    id: "accountant",
    title: "Accountant",
    category: "Business & Finance",
    shortOverview:
      "An accountant is someone who manages and records the financial information of individuals, businesses, or organizations. They prepare financial statements, track income and expenses, manage financial records, and help ensure that financial activities follow relevant rules and regulations. Accountants are important for helping organizations understand their financial situation and make responsible financial decisions.",
    description:
      "An accountant is someone who manages and records the financial information of individuals, businesses, or organizations. They prepare financial statements, track expenses, and ensure regulatory compliance.",
    whatYouDo: "Records and manages financial information.",
    icon: Coins,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Accounting", "Finance", "Business"],
    relatedMajors: [
      { id: "accounting", name: "Accounting", icon: Coins },
      { id: "finance-banking", name: "Finance & Banking", icon: Coins },
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
    ],
    keySkills: ["Accounting", "Excel", "Numerical skills", "Attention to detail"],
    skillsFromMajors: ["Accounting", "Excel", "Numerical skills", "Attention to detail"],
    educationRequired: "Bachelor's in Accounting, Finance, or related major",
    bestFitPersonality: ["Precise", "Organized", "Disciplined", "Detail-oriented"],
    jobMarketDemand: "High / Stable",
  },
  // 9. Financial Analyst
  {
    id: "financial-analyst",
    title: "Financial Analyst",
    category: "Business & Finance",
    shortOverview:
      "A financial analyst is someone who studies financial information to help businesses, investors, or organizations make informed financial decisions. They analyze company performance, investments, market trends, and financial risks to develop forecasts and recommendations. Financial analysts can work in areas such as banking, investment, corporate finance, and financial planning.",
    description:
      "A financial analyst is someone who studies financial information to help businesses, investors, or organizations make informed financial decisions. They analyze investments, market trends, and risk to develop recommendations.",
    whatYouDo: "Analyzes financial information for investment and business decisions.",
    icon: LineChart,
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Finance", "Accounting", "Economics"],
    relatedMajors: [
      { id: "finance-banking", name: "Finance & Banking", icon: Coins },
      { id: "accounting", name: "Accounting", icon: Coins },
      { id: "economics", name: "Economics", icon: LineChart },
    ],
    keySkills: ["Financial analysis", "Excel", "Statistics", "Critical thinking"],
    skillsFromMajors: ["Financial analysis", "Excel", "Statistics", "Critical thinking"],
    educationRequired: "Bachelor's in Finance, Accounting, Economics, or related major",
    bestFitPersonality: ["Analytical", "Strategic", "Numbers-oriented", "Goal-driven"],
    jobMarketDemand: "High",
  },
  // 10. HR Specialist
  {
    id: "hr-specialist",
    title: "HR Specialist",
    category: "Business & Finance",
    shortOverview:
      "An HR specialist is someone who helps organizations manage their employees and create an effective workplace. They may be involved in recruiting new employees, organizing training, supporting employee development, managing workplace policies, and handling employee-related matters. HR specialists help organizations find and retain the right people while supporting a healthy working environment.",
    description:
      "An HR specialist is someone who helps organizations manage their employees and create an effective workplace. They handle recruitment, employee development, and workplace policies.",
    whatYouDo: "Supports recruitment and employee management.",
    icon: Briefcase,
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Business", "HR", "Management", "Psychology"],
    relatedMajors: [
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
    ],
    keySkills: ["Communication", "Organization", "Interviewing", "People skills"],
    skillsFromMajors: ["Communication", "Organization", "Interviewing", "People skills"],
    educationRequired: "Bachelor's in Business, HR, Management, or related major",
    bestFitPersonality: ["Empathetic", "Organized", "Approachable", "People-oriented"],
    jobMarketDemand: "Moderate / Stable",
  },
  // 11. Project Manager
  {
    id: "project-manager",
    title: "Project Manager",
    category: "Business & Finance",
    shortOverview:
      "A project manager is someone who plans, organizes, and leads projects from beginning to completion. They coordinate team members, manage budgets and resources, track deadlines, and solve problems that may affect the project. Project managers can work in almost any industry and are responsible for making sure projects achieve their intended goals.",
    description:
      "A project manager is someone who plans, organizes, and leads projects from beginning to completion. They coordinate teams, manage budgets, and ensure projects achieve intended goals.",
    whatYouDo: "Plans and manages projects from start to completion.",
    icon: Layers,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Business", "Management", "Engineering", "IT"],
    relatedMajors: [
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
      { id: "civil-engineering", name: "Civil Engineering", icon: Building2 },
      { id: "information-technology", name: "Information Technology", icon: Network },
    ],
    keySkills: ["Leadership", "Organization", "Communication", "Budgeting"],
    skillsFromMajors: ["Leadership", "Organization", "Communication", "Budgeting"],
    educationRequired: "Bachelor's in Business, Management, Engineering, IT, or related major",
    bestFitPersonality: ["Leadership-oriented", "Organized", "Decisive", "Adaptable"],
    jobMarketDemand: "High / Growing",
  },
  // 12. Civil Engineer
  {
    id: "civil-engineer",
    title: "Civil Engineer",
    category: "Engineering & Construction",
    shortOverview:
      "A civil engineer is someone who designs, develops, and maintains infrastructure such as roads, bridges, buildings, water systems, and other public structures. They use engineering principles, mathematics, and technical knowledge to create structures that are safe, durable, and practical. Civil engineers can work in construction, transportation, environmental projects, urban development, and infrastructure planning.",
    description:
      "A civil engineer is someone who designs, develops, and maintains infrastructure such as roads, bridges, buildings, and water systems to create safe, durable public structures.",
    whatYouDo: "Designs and manages construction and infrastructure projects.",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Civil Engineering", "Architecture"],
    relatedMajors: [
      { id: "civil-engineering", name: "Civil Engineering", icon: Building2 },
      { id: "architecture", name: "Architecture", icon: Building },
    ],
    keySkills: ["Engineering", "Mathematics", "CAD", "Project management"],
    skillsFromMajors: ["Engineering", "Mathematics", "CAD", "Project management"],
    educationRequired: "Bachelor's in Civil Engineering",
    bestFitPersonality: ["Practical", "Structured", "Spatially aware", "Problem-solving"],
    jobMarketDemand: "High",
  },
  // 13. Electrical Engineer
  {
    id: "electrical-engineer",
    title: "Electrical Engineer",
    category: "Engineering & Construction",
    shortOverview:
      "An electrical engineer is someone who designs, develops, tests, and maintains electrical systems and equipment. Their work can involve electricity, electronics, power systems, telecommunications, automation, and other technologies. Electrical engineers are involved in developing and improving many of the technologies and systems used in homes, businesses, industries, and infrastructure.",
    description:
      "An electrical engineer is someone who designs, develops, tests, and maintains electrical systems and equipment, including power grids, electronics, and telecommunications.",
    whatYouDo: "Designs and maintains electrical systems and equipment.",
    icon: Cpu,
    image: "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Electrical Engineering", "Electronics"],
    relatedMajors: [
      { id: "electrical-engineering", name: "Electrical Engineering", icon: Cpu },
    ],
    keySkills: ["Electrical systems", "Mathematics", "Technical problem-solving"],
    skillsFromMajors: ["Electrical systems", "Mathematics", "Technical problem-solving"],
    educationRequired: "Bachelor's in Electrical Engineering",
    bestFitPersonality: ["Systematic", "Analytical", "Practical", "Detail-oriented"],
    jobMarketDemand: "High / Growing",
  },
  // 14. Mechanical Engineer
  {
    id: "mechanical-engineer",
    title: "Mechanical Engineer",
    category: "Engineering & Construction",
    shortOverview:
      "A mechanical engineer is someone who designs, develops, tests, and improves machines, equipment, and mechanical systems. They use principles of physics, mathematics, and engineering to create products and systems that work safely and efficiently. Mechanical engineers can work in industries such as manufacturing, automotive, robotics, energy, aerospace, and product development.",
    description:
      "A mechanical engineer is someone who designs, develops, tests, and improves machines, equipment, and mechanical systems across manufacturing, robotics, energy, and automotive industries.",
    whatYouDo: "Designs and maintains machines and mechanical systems.",
    icon: Wrench,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Mechanical Engineering"],
    relatedMajors: [
      { id: "mechanical-engineering", name: "Mechanical Engineering", icon: Wrench },
    ],
    keySkills: ["Engineering design", "Mathematics", "CAD", "Troubleshooting"],
    skillsFromMajors: ["Engineering design", "Mathematics", "CAD", "Troubleshooting"],
    educationRequired: "Bachelor's in Mechanical Engineering",
    bestFitPersonality: ["Hands-on", "Inventive", "Practical", "Technically curious"],
    jobMarketDemand: "Moderate / High",
  },
  // 15. Architect
  {
    id: "architect",
    title: "Architect",
    category: "Engineering & Construction",
    shortOverview:
      "An architect is someone who designs buildings and physical spaces based on the needs of the people who will use them. They combine creativity, design, engineering knowledge, and technical skills to develop spaces that are functional, safe, and visually appealing. Architects may work on homes, offices, schools, commercial buildings, public spaces, and large development projects.",
    description:
      "An architect is someone who designs buildings and physical spaces based on the needs of the people who will use them, combining creativity and structural engineering.",
    whatYouDo: "Designs buildings and spaces considering function and aesthetics.",
    icon: Building,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Architecture", "Civil Engineering"],
    relatedMajors: [
      { id: "architecture", name: "Architecture", icon: Building },
      { id: "civil-engineering", name: "Civil Engineering", icon: Building2 },
    ],
    keySkills: ["Design", "CAD", "Drawing", "Creativity", "Communication"],
    skillsFromMajors: ["Design", "CAD", "Drawing", "Creativity", "Communication"],
    educationRequired: "Bachelor's in Architecture",
    bestFitPersonality: ["Creative", "Imaginative", "Visually minded", "Detail-oriented"],
    jobMarketDemand: "Moderate / Specialized",
  },
  // 16. Economist / Economic Analyst
  {
    id: "economist-economic-analyst",
    title: "Economist / Economic Analyst",
    category: "Social Sciences & Public Affairs",
    shortOverview:
      "An economist or economic analyst is someone who studies how money, resources, markets, and economic policies affect people, businesses, and society. They collect and analyze economic data, study trends, and use their findings to provide recommendations and forecasts. Their work can support government policies, business strategies, financial decisions, and economic planning.",
    description:
      "An economist or economic analyst is someone who studies how money, resources, markets, and economic policies affect society and businesses, providing forecasts and strategic policy guidance.",
    whatYouDo: "Studies economic data and trends to support decisions and policy.",
    icon: LineChart,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Economics", "Finance", "Business"],
    relatedMajors: [
      { id: "economics", name: "Economics", icon: LineChart },
      { id: "finance-banking", name: "Finance & Banking", icon: Coins },
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
    ],
    keySkills: ["Statistics", "Research", "Data analysis", "Critical thinking"],
    skillsFromMajors: ["Statistics", "Research", "Data analysis", "Critical thinking"],
    educationRequired: "Bachelor's in Economics, Finance, or related major",
    bestFitPersonality: ["Analytical", "Curious", "Objective", "Big-picture thinker"],
    jobMarketDemand: "Moderate / Specialized",
  },
  // 17. International Relations Officer
  {
    id: "international-relations-officer",
    title: "International Relations Officer",
    category: "Social Sciences & Public Affairs",
    shortOverview:
      "An international relations officer is someone who works with organizations, governments, institutions, or international partners to build and maintain relationships across countries. They may support international programs, partnerships, diplomacy, communication, research, and cooperation projects. This career is suitable for people interested in global issues, international organizations, communication, and cross-cultural collaboration.",
    description:
      "An international relations officer works with governments, international partners, and organizations to foster diplomacy, manage cross-border programs, and support global cooperation.",
    whatYouDo: "Supports international affairs, partnerships, and programs.",
    icon: Globe,
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["IR", "Political Science", "Law"],
    relatedMajors: [
      { id: "international-relations", name: "International Relations", icon: Globe },
      { id: "law", name: "Law", icon: Scale },
    ],
    keySkills: ["Communication", "Research", "Languages", "Diplomacy"],
    skillsFromMajors: ["Communication", "Research", "Languages", "Diplomacy"],
    educationRequired: "Bachelor's in IR, Political Science, or related major",
    bestFitPersonality: ["Diplomatic", "Globally minded", "Empathetic", "Culturally curious"],
    jobMarketDemand: "Moderate / Specialized",
  },
  // 18. Legal Officer
  {
    id: "legal-officer",
    title: "Legal Officer",
    category: "Social Sciences & Public Affairs",
    shortOverview:
      "A legal officer is someone who provides legal support and helps an organization understand and follow laws, regulations, and legal requirements. They may review contracts and official documents, identify potential legal risks, conduct legal research, and assist with legal procedures. Legal officers can work in companies, government institutions, NGOs, financial organizations, and other sectors.",
    description:
      "A legal officer provides legal support, reviews contracts, evaluates regulatory compliance, and mitigates legal risks for organizations.",
    whatYouDo: "Provides legal support and helps organizations comply with laws.",
    icon: Scale,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Law", "IR", "Business"],
    relatedMajors: [
      { id: "law", name: "Law", icon: Scale },
      { id: "international-relations", name: "International Relations", icon: Globe },
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
    ],
    keySkills: ["Legal research", "Writing", "Reasoning", "Attention to detail"],
    skillsFromMajors: ["Legal research", "Writing", "Reasoning", "Attention to detail"],
    educationRequired: "Bachelor's in Law or related major",
    bestFitPersonality: ["Analytical", "Articulate", "Justice-oriented", "Meticulous"],
    jobMarketDemand: "Moderate / Stable",
  },
  // 19. Hotel / Tourism Manager
  {
    id: "hotel-tourism-manager",
    title: "Hotel / Tourism Manager",
    category: "Tourism & Hospitality",
    shortOverview:
      "A hotel or tourism manager is someone who manages the daily operations of a hotel, resort, travel company, or other hospitality business. They oversee staff, customer service, facilities, budgets, and business activities to ensure guests have a positive experience. This career combines management, communication, customer service, and business skills and can offer opportunities in the growing hospitality and tourism industry.",
    description:
      "A hotel or tourism manager manages the operations of hotels, resorts, or travel companies to deliver exceptional customer experiences and run profitable hospitality businesses.",
    whatYouDo: "Manages hospitality operations and customer experiences.",
    icon: Compass,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Tourism & Hospitality", "Business"],
    relatedMajors: [
      { id: "tourism-hospitality", name: "Tourism & Hospitality Management", icon: Compass },
      { id: "business-administration", name: "Business Administration", icon: Briefcase },
    ],
    keySkills: ["Leadership", "Customer service", "Communication", "Organization"],
    skillsFromMajors: ["Leadership", "Customer service", "Communication", "Organization"],
    educationRequired: "Bachelor's in Tourism, Hospitality, Business, or related major",
    bestFitPersonality: ["Friendly", "Energetic", "Adaptable", "Service-oriented"],
    jobMarketDemand: "High / Recovering",
  },
  // 20. Graphic / UI Designer
  {
    id: "graphic-ui-designer",
    title: "Graphic / UI Designer",
    category: "Creative & Design",
    shortOverview:
      "A graphic or UI designer is someone who creates visual designs that communicate ideas and make products, brands, and digital experiences more appealing and easier to use. Graphic designers often work on branding, posters, advertisements, social media content, and other visual materials, while UI designers focus on the appearance and layout of websites and applications. Both careers combine creativity, design skills, and an understanding of how people interact with visual information.",
    description:
      "A graphic or UI designer creates visual communications, branding assets, and digital interfaces for web and mobile applications.",
    whatYouDo: "Creates visual designs and digital interfaces.",
    icon: Palette,
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
    relatedMajorsText: ["Graphic Design", "Digital Arts", "CS", "Digital Business"],
    relatedMajors: [
      { id: "graphic-design", name: "Graphic Design / Digital Arts & Design", icon: Palette },
      { id: "computer-science", name: "Computer Science", icon: Laptop },
      { id: "digital-business", name: "Digital Business", icon: LineChart },
    ],
    keySkills: ["Design software", "Typography", "Visual communication", "Creativity"],
    skillsFromMajors: ["Design software", "Typography", "Visual communication", "Creativity"],
    educationRequired: "Bachelor's in Graphic Design, Digital Arts, UI/UX, or related major",
    bestFitPersonality: ["Creative", "Imaginative", "Visual", "Detail-oriented", "Trend-aware"],
    jobMarketDemand: "Growing / Competitive",
  },
];

