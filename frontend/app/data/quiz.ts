/* ── Types ─────────────────────────────────────────────── */

export type QuizLevel = "low" | "medium" | "high" | "all";

export interface QuizOption {
  id: "A" | "B" | "C" | "D";
  text: string;
}

export interface QuizQuestion {
  id: string;
  subjectId: string;
  level: "low" | "medium" | "high";
  topic?: string;
  question: string;
  options: QuizOption[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface QuizSubject {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
}

/* ── Subjects (Exclusively 3 Core Subjects) ─────────────── */

export const QUIZ_SUBJECTS: QuizSubject[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Algebra, calculus, geometry, and numerical problem solving",
    color: "text-sky-deep",
    bgColor: "bg-sitomo",
  },
  {
    id: "logical-reasoning",
    name: "Logical Reasoning & IQ",
    description: "Number & alphabet sequences, analytical puzzles, comparisons, and deductive logic",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  {
    id: "english",
    name: "English",
    description: "Grammar, syntax, technical vocabulary, and sentence correction",
    color: "text-[#D97736]",
    bgColor: "bg-momo",
  },
];

export const CADT_TECHO_SUBJECTS: QuizSubject[] = QUIZ_SUBJECTS;

export const isCadtTechoScholarship = (id: string): boolean => {
  const clean = (id || "").toLowerCase().trim();
  return (
    clean === "techo-digital-talent-2026" ||
    clean === "techo-digital-talent-cadt-2026" ||
    clean.includes("techo-digital-talent") ||
    clean.includes("techo")
  );
};

/* ── Level Configuration ───────────────────────────────── */

export const QUIZ_LEVELS: {
  id: QuizLevel;
  name: string;
  badge: string;
  description: string;
}[] = [
  {
    id: "low",
    name: "Low",
    badge: "Foundational / Basics",
    description: "Core algebraic operations, basic sequences, and elementary grammar",
  },
  {
    id: "medium",
    name: "Medium",
    badge: "Standard / Entrance Exam",
    description: "Official Grade 12 & CADT entrance examination standard difficulty",
  },
  {
    id: "high",
    name: "High",
    badge: "Advanced / Competition",
    description: "Challenging permutations, multi-step analytical puzzles, and computer science concepts",
  },
  {
    id: "all",
    name: "All Levels",
    badge: "Complete Exam Practice",
    description: "All available questions for this subject across all difficulty levels",
  },
];

/* ── General Scholarship Quiz Questions ────────────────── */

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  /* ─── Mathematics: Low ─── */
  {
    id: "gen-math-l-1",
    subjectId: "mathematics",
    level: "low",
    topic: "Linear Algebra",
    question: "If 3x + 7 = 22, what is the value of x?",
    options: [
      { id: "A", text: "3" },
      { id: "B", text: "5" },
      { id: "C", text: "7" },
      { id: "D", text: "15" },
    ],
    correctAnswer: "B",
    explanation: "Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.",
  },
  {
    id: "gen-math-l-2",
    subjectId: "mathematics",
    level: "low",
    topic: "Geometry",
    question: "What is the area of a right-angled triangle with base 8 cm and height 5 cm?",
    options: [
      { id: "A", text: "40 cm²" },
      { id: "B", text: "20 cm²" },
      { id: "C", text: "26 cm²" },
      { id: "D", text: "13 cm²" },
    ],
    correctAnswer: "B",
    explanation: "Area = (base × height) / 2 = (8 × 5) / 2 = 40 / 2 = 20 cm².",
  },
  {
    id: "gen-math-l-3",
    subjectId: "mathematics",
    level: "low",
    topic: "Percentages",
    question: "What is 15% of 240?",
    options: [
      { id: "A", text: "24" },
      { id: "B", text: "32" },
      { id: "C", text: "36" },
      { id: "D", text: "48" },
    ],
    correctAnswer: "C",
    explanation: "10% of 240 = 24. 5% of 240 = 12. 24 + 12 = 36 (or 240 × 0.15 = 36).",
  },

  /* ─── Mathematics: Medium ─── */
  {
    id: "gen-math-m-1",
    subjectId: "mathematics",
    level: "medium",
    topic: "Quadratic Equations",
    question: "Find the roots of the quadratic equation: x² - 5x + 6 = 0.",
    options: [
      { id: "A", text: "x = 2 and x = 3" },
      { id: "B", text: "x = -2 and x = -3" },
      { id: "C", text: "x = 1 and x = 6" },
      { id: "D", text: "x = -1 and x = -6" },
    ],
    correctAnswer: "A",
    explanation: "Factor the quadratic expression: (x - 2)(x - 3) = 0, which yields x = 2 and x = 3.",
  },
  {
    id: "gen-math-m-2",
    subjectId: "mathematics",
    level: "medium",
    topic: "Calculus",
    question: "What is the derivative of f(x) = 3x³ - 5x + 9 with respect to x?",
    options: [
      { id: "A", text: "9x² - 5" },
      { id: "B", text: "6x² - 5" },
      { id: "C", text: "9x² - 5x" },
      { id: "D", text: "3x² - 5" },
    ],
    correctAnswer: "A",
    explanation: "Applying the power rule: d/dx(3x³) = 9x², d/dx(-5x) = -5, d/dx(9) = 0. Thus, f'(x) = 9x² - 5.",
  },
  {
    id: "gen-math-m-3",
    subjectId: "mathematics",
    level: "medium",
    topic: "Logarithms",
    question: "If log₁₀(x) = 3, what is the value of x?",
    options: [
      { id: "A", text: "30" },
      { id: "B", text: "300" },
      { id: "C", text: "1,000" },
      { id: "D", text: "10,000" },
    ],
    correctAnswer: "C",
    explanation: "By logarithmic definition: x = 10³ = 1,000.",
  },

  /* ─── Mathematics: High ─── */
  {
    id: "gen-math-h-1",
    subjectId: "mathematics",
    level: "high",
    topic: "Limits",
    question: "Evaluate the limit: lim (x → 0) [sin(3x) / x].",
    options: [
      { id: "A", text: "0" },
      { id: "B", text: "1" },
      { id: "C", text: "3" },
      { id: "D", text: "Does not exist" },
    ],
    correctAnswer: "C",
    explanation: "Using the fundamental trigonometric limit lim (u → 0) [sin(u) / u] = 1: lim (x → 0) [3 · sin(3x) / (3x)] = 3 · 1 = 3.",
  },
  {
    id: "gen-math-h-2",
    subjectId: "mathematics",
    level: "high",
    topic: "Sequences & Series",
    question: "What is the sum of the infinite geometric series: 8 + 4 + 2 + 1 + ...?",
    options: [
      { id: "A", text: "14" },
      { id: "B", text: "15" },
      { id: "C", text: "16" },
      { id: "D", text: "20" },
    ],
    correctAnswer: "C",
    explanation: "First term a = 8, common ratio r = 1/2. Sum S = a / (1 - r) = 8 / (1 - 0.5) = 8 / 0.5 = 16.",
  },
  {
    id: "gen-math-h-3",
    subjectId: "mathematics",
    level: "high",
    topic: "Combinatorics",
    question: "How many distinct 4-letter arrangements can be made from the letters in 'PATH' without repetition?",
    options: [
      { id: "A", text: "12" },
      { id: "B", text: "16" },
      { id: "C", text: "24" },
      { id: "D", text: "64" },
    ],
    correctAnswer: "C",
    explanation: "The number of permutations of 4 distinct letters is 4! = 4 × 3 × 2 × 1 = 24.",
  },

  /* ─── Logical Reasoning & IQ: Low ─── */
  {
    id: "gen-logic-l-1",
    subjectId: "logical-reasoning",
    level: "low",
    topic: "Number Sequences",
    question: "Find the missing number in the sequence: 3, 6, 9, 12, ... ?",
    options: [
      { id: "A", text: "14" },
      { id: "B", text: "15" },
      { id: "C", text: "16" },
      { id: "D", text: "18" },
    ],
    correctAnswer: "B",
    explanation: "The sequence increases by 3 in each step: 12 + 3 = 15.",
  },
  {
    id: "gen-logic-l-2",
    subjectId: "logical-reasoning",
    level: "low",
    topic: "Alphabet Sequences",
    question: "What is the next letter in the series: A, C, E, G, ... ?",
    options: [
      { id: "A", text: "H" },
      { id: "B", text: "I" },
      { id: "C", text: "J" },
      { id: "D", text: "K" },
    ],
    correctAnswer: "B",
    explanation: "The sequence skips one letter each time: A (skip B) → C (skip D) → E (skip F) → G (skip H) → I.",
  },
  {
    id: "gen-logic-l-3",
    subjectId: "logical-reasoning",
    level: "low",
    topic: "Odd One Out",
    question: "Which of the following items does not belong with the others?",
    options: [
      { id: "A", text: "Triangle" },
      { id: "B", text: "Square" },
      { id: "C", text: "Cube" },
      { id: "D", text: "Pentagon" },
    ],
    correctAnswer: "C",
    explanation: "Cube is a three-dimensional solid, whereas Triangle, Square, and Pentagon are two-dimensional polygons.",
  },

  /* ─── Logical Reasoning & IQ: Medium ─── */
  {
    id: "gen-logic-m-1",
    subjectId: "logical-reasoning",
    level: "medium",
    topic: "Number Sequences",
    question: "Find the missing number in the sequence: 2, 6, 12, 20, 30, ... ?",
    options: [
      { id: "A", text: "38" },
      { id: "B", text: "40" },
      { id: "C", text: "42" },
      { id: "D", text: "46" },
    ],
    correctAnswer: "C",
    explanation: "The differences between consecutive terms increase by 2: +4, +6, +8, +10. Next difference is +12, so 30 + 12 = 42.",
  },
  {
    id: "gen-logic-m-2",
    subjectId: "logical-reasoning",
    level: "medium",
    topic: "Comparisons",
    question: "Piseth is older than Vuthy. Vuthy is older than Sopheak. Theara is younger than Sopheak. Who is the youngest among all four?",
    options: [
      { id: "A", text: "Piseth" },
      { id: "B", text: "Vuthy" },
      { id: "C", text: "Sopheak" },
      { id: "D", text: "Theara" },
    ],
    correctAnswer: "D",
    explanation: "The age ranking from oldest to youngest is: Piseth > Vuthy > Sopheak > Theara. Theara is the youngest.",
  },
  {
    id: "gen-logic-m-3",
    subjectId: "logical-reasoning",
    level: "medium",
    topic: "Family Relations",
    question: "Pointing to a photograph, a young man says: \"This person is the daughter of the only son of my father.\" How is the person in the photograph related to the man?",
    options: [
      { id: "A", text: "Sister" },
      { id: "B", text: "Daughter" },
      { id: "C", text: "Niece" },
      { id: "D", text: "Mother" },
    ],
    correctAnswer: "B",
    explanation: "\"The only son of my father\" refers to the speaker himself. Therefore, the daughter of the speaker is his daughter.",
  },

  /* ─── Logical Reasoning & IQ: High ─── */
  {
    id: "gen-logic-h-1",
    subjectId: "logical-reasoning",
    level: "high",
    topic: "Analytical Puzzle",
    question: "Five friends (A, B, C, D, E) are sitting in a row facing north. C is sitting immediately to the left of D. B is at the extreme left end (position 1). E is sitting to the immediate right of A. If D is sitting third from the left, who is sitting at the extreme right end?",
    options: [
      { id: "A", text: "A" },
      { id: "B", text: "C" },
      { id: "C", text: "D" },
      { id: "D", text: "E" },
    ],
    correctAnswer: "D",
    explanation: "Positions 1 to 5 from left to right: B, C, D, A, E. Therefore, E occupies the extreme right end (position 5).",
  },
  {
    id: "gen-logic-h-2",
    subjectId: "logical-reasoning",
    level: "high",
    topic: "Deductive Logic",
    question: "All programmers drink tea. Some tea drinkers are mathematicians. No mathematician is an astronaut. Which statement is definitely true?",
    options: [
      { id: "A", text: "All programmers are mathematicians" },
      { id: "B", text: "No astronaut is a mathematician" },
      { id: "C", text: "All tea drinkers are programmers" },
      { id: "D", text: "Some astronauts drink tea" },
    ],
    correctAnswer: "B",
    explanation: "Since \"No mathematician is an astronaut\", it directly follows by contraposition that \"No astronaut is a mathematician\".",
  },

  /* ─── English: Low ─── */
  {
    id: "gen-eng-l-1",
    subjectId: "english",
    level: "low",
    topic: "Present Simple Tense",
    question: "Choose the correct sentence:",
    options: [
      { id: "A", text: "She don't like coffee." },
      { id: "B", text: "She doesn't likes coffee." },
      { id: "C", text: "She doesn't like coffee." },
      { id: "D", text: "She isn't like coffee." },
    ],
    correctAnswer: "C",
    explanation: "For third-person singular (she/he/it) in negative present simple, use 'doesn't' + base verb: 'She doesn't like coffee.'",
  },
  {
    id: "gen-eng-l-2",
    subjectId: "english",
    level: "low",
    topic: "Vocabulary Antonyms",
    question: "Which word is an antonym (opposite) of 'Generous'?",
    options: [
      { id: "A", text: "Kind" },
      { id: "B", text: "Selfish" },
      { id: "C", text: "Helpful" },
      { id: "D", text: "Polite" },
    ],
    correctAnswer: "B",
    explanation: "'Selfish' is the direct opposite meaning of 'Generous'.",
  },

  /* ─── English: Medium ─── */
  {
    id: "gen-eng-m-1",
    subjectId: "english",
    level: "medium",
    topic: "Conditional Sentences",
    question: "If I _______ earlier, I would not have missed the scholarship interview.",
    options: [
      { id: "A", text: "arrived" },
      { id: "B", text: "had arrived" },
      { id: "C", text: "have arrived" },
      { id: "D", text: "would arrive" },
    ],
    correctAnswer: "B",
    explanation: "Third Conditional structure (unreal past situation): If + past perfect (had arrived), would have + past participle.",
  },
  {
    id: "gen-eng-m-2",
    subjectId: "english",
    level: "medium",
    topic: "Vocabulary Context",
    question: "Identify the word closest in meaning to 'Meticulous':",
    options: [
      { id: "A", text: "Careless" },
      { id: "B", text: "Extremely careful and precise" },
      { id: "C", text: "Quick and hurried" },
      { id: "D", text: "Hesitant" },
    ],
    correctAnswer: "B",
    explanation: "'Meticulous' refers to someone showing great attention to detail, precision, and thoroughness.",
  },

  /* ─── English: High ─── */
  {
    id: "gen-eng-h-1",
    subjectId: "english",
    level: "high",
    topic: "Subject-Verb Agreement",
    question: "Select the sentence free of grammatical or syntactical error:",
    options: [
      { id: "A", text: "Neither the committee members nor the chairperson were in agreement." },
      { id: "B", text: "Neither the committee members nor the chairperson was in agreement." },
      { id: "C", text: "Neither of the candidates have submitted their portfolio." },
      { id: "D", text: "Each of the applicants were notified by email." },
    ],
    correctAnswer: "B",
    explanation: "When correlative conjunctions 'neither... nor...' join subjects, the verb agrees with the closest subject ('the chairperson was').",
  },
  {
    id: "gen-eng-h-2",
    subjectId: "english",
    level: "high",
    topic: "Formal Inversion",
    question: "Choose the correct sentence using negative inversion:",
    options: [
      { id: "A", text: "Rarely we have seen such an exceptional performance." },
      { id: "B", text: "Rarely have we seen such an exceptional performance." },
      { id: "C", text: "Rarely had we saw such an exceptional performance." },
      { id: "D", text: "Rarely we did see such an exceptional performance." },
    ],
    correctAnswer: "B",
    explanation: "When a sentence begins with a negative adverbial like 'Rarely', the auxiliary verb inverts before the subject: 'Rarely have we seen...'.",
  },
];

/* ── CADT Techo Digital Talent Scholarship 2026 Official Practice Questions ───────── */

export const CADT_TECHO_QUESTIONS: QuizQuestion[] = [
  /* ═════════════════════════════════════════════════════════
     SUBJECT 1: MATHEMATICS (CADT Official Questions & Levels)
  ════════════════════════════════════════════════════════════ */
  {
    id: "cadt-math-1",
    subjectId: "mathematics",
    level: "low",
    topic: "Algebra",
    question: "What is the real solution set of the logarithmic equation log₂(x) + log₂(x - 2) = 3?",
    options: [
      { id: "A", text: "x = -2" },
      { id: "B", text: "x = 2" },
      { id: "C", text: "x = 4" },
      { id: "D", text: "x = 8" },
    ],
    correctAnswer: "C",
    explanation: "By logarithmic properties: log₂(x(x - 2)) = 3 ⇒ x(x - 2) = 2³ = 8 ⇒ x² - 2x - 8 = 0. Factoring gives (x - 4)(x + 2) = 0. Since the domain requires x > 2 for real logarithms, x = 4.",
  },
  {
    id: "cadt-math-2",
    subjectId: "mathematics",
    level: "low",
    topic: "Functions",
    question: "What is the sum of the roots of the quadratic equation 3x² - 12x + 9 = 0?",
    options: [
      { id: "A", text: "3" },
      { id: "B", text: "4" },
      { id: "C", text: "-4" },
      { id: "D", text: "12" },
    ],
    correctAnswer: "B",
    explanation: "Using Vieta's formulas, the sum of the roots S = -b / a = -(-12) / 3 = 12 / 3 = 4.",
  },
  {
    id: "cadt-math-3",
    subjectId: "mathematics",
    level: "medium",
    topic: "Calculus",
    question: "What is the derivative of the function f(x) = x³ · eˣ with respect to x?",
    options: [
      { id: "A", text: "3x² eˣ" },
      { id: "B", text: "x³ eˣ" },
      { id: "C", text: "x² eˣ(x + 3)" },
      { id: "D", text: "3x² + eˣ" },
    ],
    correctAnswer: "C",
    explanation: "Applying the product rule (uv)' = u'v + uv': d/dx(x³ · eˣ) = 3x² · eˣ + x³ · eˣ = x² eˣ(3 + x).",
  },
  {
    id: "cadt-math-4",
    subjectId: "mathematics",
    level: "medium",
    topic: "Limits",
    question: "Evaluate the limit: lim (x → 0) [sin(3x) / x].",
    options: [
      { id: "A", text: "0" },
      { id: "B", text: "1" },
      { id: "C", text: "3" },
      { id: "D", text: "+∞" },
    ],
    correctAnswer: "C",
    explanation: "Using the standard trigonometric limit lim (θ → 0) [sin(θ) / θ] = 1, we rewrite: lim (x → 0) 3 · [sin(3x) / (3x)] = 3 · 1 = 3.",
  },
  {
    id: "cadt-math-5",
    subjectId: "mathematics",
    level: "high",
    topic: "Permutations",
    question: "How many unique 4-digit numbers can be formed using the digits 1, 2, 3, 4, and 5 if no digit can be repeated?",
    options: [
      { id: "A", text: "24" },
      { id: "B", text: "60" },
      { id: "C", text: "120" },
      { id: "D", text: "625" },
    ],
    correctAnswer: "C",
    explanation: "This is a permutation of selecting and arranging 4 digits out of 5: P(5, 4) = 5! / (5 - 4)! = 5 × 4 × 3 × 2 = 120.",
  },
  {
    id: "cadt-math-extra-1",
    subjectId: "mathematics",
    level: "high",
    topic: "Integration",
    question: "Evaluate the definite integral: ∫ from 0 to 2 of (3x² - 2x + 1) dx.",
    options: [
      { id: "A", text: "4" },
      { id: "B", text: "6" },
      { id: "C", text: "8" },
      { id: "D", text: "10" },
    ],
    correctAnswer: "B",
    explanation: "The antiderivative is [x³ - x² + x] from 0 to 2 = (2³ - 2² + 2) - 0 = (8 - 4 + 2) = 6.",
  },

  /* ═════════════════════════════════════════════════════════
     SUBJECT 2: LOGICAL REASONING & IQ
  ════════════════════════════════════════════════════════════ */
  {
    id: "cadt-logic-1",
    subjectId: "logical-reasoning",
    level: "low",
    topic: "Number Sequences",
    question: "Find the missing number in the sequence: 2, 6, 12, 20, 30, ... ?",
    options: [
      { id: "A", text: "38" },
      { id: "B", text: "40" },
      { id: "C", text: "42" },
      { id: "D", text: "46" },
    ],
    correctAnswer: "C",
    explanation: "The differences between consecutive terms increase by 2 each time: +4, +6, +8, +10. The next increment must be +12, so 30 + 12 = 42.",
  },
  {
    id: "cadt-logic-2",
    subjectId: "logical-reasoning",
    level: "low",
    topic: "Alphabet Sequences",
    question: "What is the next letter in the series: Z, X, V, T, R, ... ?",
    options: [
      { id: "A", text: "P" },
      { id: "B", text: "Q" },
      { id: "C", text: "O" },
      { id: "D", text: "S" },
    ],
    correctAnswer: "A",
    explanation: "The series steps backwards through the alphabet, skipping one letter each time: Z (skip Y) → X (skip W) → V (skip U) → T (skip S) → R (skip Q) → P.",
  },
  {
    id: "cadt-logic-4",
    subjectId: "logical-reasoning",
    level: "medium",
    topic: "Comparisons",
    question: "Piseth is older than Vuthy. Vuthy is older than Sopheak. Theara is younger than Sopheak. Who is the youngest among all four?",
    options: [
      { id: "A", text: "Piseth" },
      { id: "B", text: "Vuthy" },
      { id: "C", text: "Sopheak" },
      { id: "D", text: "Theara" },
    ],
    correctAnswer: "D",
    explanation: "Order from oldest to youngest: Piseth > Vuthy > Sopheak > Theara. Thus, Theara is the youngest.",
  },
  {
    id: "cadt-logic-5",
    subjectId: "logical-reasoning",
    level: "medium",
    topic: "Family Relations",
    question: "Pointing to a photograph, a young man says: \"This person is the daughter of the only son of my father.\" How is the person in the photograph related to the man?",
    options: [
      { id: "A", text: "Sister" },
      { id: "B", text: "Daughter" },
      { id: "C", text: "Niece" },
      { id: "D", text: "Mother" },
    ],
    correctAnswer: "B",
    explanation: "\"The only son of my father\" is the man himself. Therefore, the daughter of the speaker is his own daughter.",
  },
  {
    id: "cadt-logic-3",
    subjectId: "logical-reasoning",
    level: "high",
    topic: "Analytical Puzzle",
    question: "Five friends (A, B, C, D, E) are sitting in a row facing north. C is sitting immediately to the left of D. B is at the extreme left end (position 1). E is sitting to the immediate right of A. If D is sitting third from the left, who is sitting at the extreme right end?",
    options: [
      { id: "A", text: "A" },
      { id: "B", text: "C" },
      { id: "C", text: "D" },
      { id: "D", text: "E" },
    ],
    correctAnswer: "D",
    explanation: "Position 1 is B. Since D is at 3 and C is immediately left of D, position 2 is C. Positions 4 and 5 must be occupied by A and E respectively since E is immediately right of A. Thus, E is at the extreme right end (position 5).",
  },
  {
    id: "cadt-logic-extra-1",
    subjectId: "logical-reasoning",
    level: "high",
    topic: "Deductive Logic",
    question: "In a code language, 'DIGITAL' is written as 'EJHJUCM'. How is 'FUTURE' written in that same code?",
    options: [
      { id: "A", text: "GVUVSE" },
      { id: "B", text: "GVWXSG" },
      { id: "C", text: "GVUXSF" },
      { id: "D", text: "GVUXTF" },
    ],
    correctAnswer: "C",
    explanation: "Each letter is shifted forward: D(+1)→E, I(+1)→J, G(+1)→H, I(+1)→J, T(+1)→U, A(+2)→C, L(+1)→M. For FUTURE: F(+1)→G, U(+1)→V, T(+1)→U, U(+3)→X, R(+1)→S, E(+1)→F ⇒ GVUXSF.",
  },

  /* ═════════════════════════════════════════════════════════
     SUBJECT 3: ENGLISH & TECH VOCABULARY
  ════════════════════════════════════════════════════════════ */
  {
    id: "cadt-eng-2",
    subjectId: "english",
    level: "low",
    topic: "Subject-Verb Agreement",
    question: "Choose the grammatically correct sentence.",
    options: [
      { id: "A", text: "Neither the project manager nor the developers was aware of the critical bug." },
      { id: "B", text: "Neither the project manager nor the developers were aware of the critical bug." },
      { id: "C", text: "Neither the project manager or the developers were aware of the critical bug." },
      { id: "D", text: "Neither of the manager and developers were aware of the critical bug." },
    ],
    correctAnswer: "B",
    explanation: "In a \"neither... nor...\" structure, the verb agrees in number with the subject closer to it. \"The developers\" is plural, so it takes the plural verb \"were\".",
  },
  {
    id: "cadt-eng-4",
    subjectId: "english",
    level: "low",
    topic: "Cybersecurity",
    question: "What is the primary function of a firewall in computer networking?",
    options: [
      { id: "A", text: "To boost CPU clock speed" },
      { id: "B", text: "To monitor and control incoming and outgoing network traffic" },
      { id: "C", text: "To translate domain names into IP addresses" },
      { id: "D", text: "To store permanent data backups" },
    ],
    correctAnswer: "B",
    explanation: "A firewall functions as a network security device that monitors and filters incoming and outgoing traffic according to established security protocols.",
  },
  {
    id: "cadt-eng-1",
    subjectId: "english",
    level: "medium",
    topic: "Grammar",
    question: "If I had known about the server maintenance schedule in advance, I _______ the software deployment until tomorrow.",
    options: [
      { id: "A", text: "will postpone" },
      { id: "B", text: "postponed" },
      { id: "C", text: "would have postponed" },
      { id: "D", text: "postpone" },
    ],
    correctAnswer: "C",
    explanation: "This is a Third Conditional structure for hypothetical past situations: If + Past Perfect (had known), ... would have + Past Participle (would have postponed).",
  },
  {
    id: "cadt-eng-5",
    subjectId: "english",
    level: "medium",
    topic: "Contextual Vocabulary",
    question: "\"The recursive algorithm exhibits an exponential time complexity, rendering it _______ for processing exceptionally large datasets in real-time.\"",
    options: [
      { id: "A", text: "optimal" },
      { id: "B", text: "efficient" },
      { id: "C", text: "impractical" },
      { id: "D", text: "beneficial" },
    ],
    correctAnswer: "C",
    explanation: "An algorithm with exponential time complexity scale-up becomes prohibitively slow on big datasets, making it 'impractical' for real-time execution.",
  },
  {
    id: "cadt-eng-3",
    subjectId: "english",
    level: "high",
    topic: "Data Structures",
    question: "Which linear data structure operates strictly on a Last-In, First-Out (LIFO) principle?",
    options: [
      { id: "A", text: "Queue" },
      { id: "B", text: "Array" },
      { id: "C", text: "Stack" },
      { id: "D", text: "Binary tree" },
    ],
    correctAnswer: "C",
    explanation: "In a Stack, the last element pushed in is the first element popped out, conforming strictly to the Last-In, First-Out (LIFO) order.",
  },
  {
    id: "cadt-eng-extra-1",
    subjectId: "english",
    level: "high",
    topic: "Advanced Syntax",
    question: "Seldom _______ such rapid advancements in artificial intelligence and quantum computing.",
    options: [
      { id: "A", text: "we have witnessed" },
      { id: "B", text: "have we witnessed" },
      { id: "C", text: "we had witnessed" },
      { id: "D", text: "did we witnessed" },
    ],
    correctAnswer: "B",
    explanation: "Starting a sentence with the negative adverb 'Seldom' triggers subject-auxiliary inversion: 'have we witnessed'.",
  },
];
