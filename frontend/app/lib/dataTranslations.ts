import { type Locale } from "@/src/i18n/routing";

type DataTranslations = Record<string, unknown>;

const cache: Partial<Record<Locale, Record<string, DataTranslations>>> = {};

async function loadTranslations(locale: Locale): Promise<Record<string, DataTranslations>> {
  if (cache[locale]) return cache[locale]!;

  const files = ["careers", "majors", "scholarships", "universities", "workshops"];
  const result: Record<string, DataTranslations> = {};

  await Promise.all(
    files.map(async (file) => {
      try {
        const mod = await import(`../data-translations/${locale}/${file}.json`);
        result[file] = mod.default ?? mod;
      } catch {
        // Fallback to English if locale file missing
        const mod = await import(`../data-translations/en/${file}.json`);
        result[file] = mod.default ?? mod;
      }
    })
  );

  cache[locale] = result;
  return result;
}

export async function getDataTranslations<T = Record<string, unknown>>(
  locale: Locale,
  namespace: string
) {
  const all = await loadTranslations(locale);
  return (all[namespace] ?? {}) as {
    items?: Record<string, T>;
    categories?: { id: string; name: string }[];
    [key: string]: unknown;
  };
}

export async function getDataItem<T>(locale: Locale, namespace: string, id: string): Promise<T | undefined> {
  const data = await getDataTranslations(locale, namespace);
  const items = data.items as Record<string, T> | undefined;
  return items?.[id];
}

export async function getDataItems<T>(locale: Locale, namespace: string): Promise<T[]> {
  const data = await getDataTranslations(locale, namespace);
  const items = data.items as Record<string, T> | undefined;
  return items ? Object.values(items) : [];
}

export async function getDataCategories(locale: Locale, namespace: string) {
  const data = await getDataTranslations(locale, namespace);
  return (data.categories ?? []) as { id: string; name: string }[];
}

/* ── Comprehensive Khmer Translation Dictionaries & Helpers ── */

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

export function toKhmerDigits(val: number | string): string {
  return String(val).replace(/\d/g, (d) => KHMER_DIGITS[Number(d)] ?? d);
}

export const UNIVERSITY_KM_MAP: Record<string, string> = {
  "beltei international university": "សាកលវិទ្យាល័យ ប៊ែលធី អន្តរជាតិ",
  "beltei": "សាកលវិទ្យាល័យ ប៊ែលធី អន្តរជាតិ",
  "cambodia academy of digital technology": "វិទ្យាស្ថានបច្ចេកវិទ្យាឌីជីថលកម្ពុជា",
  "cadt": "វិទ្យាស្ថានបច្ចេកវិទ្យាឌីជីថលកម្ពុជា",
  "royal university of phnom penh": "សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ",
  "rupp": "សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ",
  "institute of technology of cambodia": "វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា",
  "itc": "វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា",
  "paragon international university": "សាកលវិទ្យាល័យអន្តរជាតិ ផារ៉ាហ្កន",
  "paragon.u": "សាកលវិទ្យាល័យអន្តរជាតិ ផារ៉ាហ្កន",
  "paragon": "សាកលវិទ្យាល័យអន្តរជាតិ ផារ៉ាហ្កន",
  "american university of phnom penh": "សាកលវិទ្យាល័យអាមេរិកាំងភ្នំពេញ",
  "aupp": "សាកលវិទ្យាល័យអាមេរិកាំងភ្នំពេញ",
  "royal university of law and economics": "សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច",
  "rule": "សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច",
  "national university of management": "សាកលវិទ្យាល័យជាតិគ្រប់គ្រង",
  "num": "សាកលវិទ្យាល័យជាតិគ្រប់គ្រង",
  "paññāsāstra university of cambodia": "សាកលវិទ្យាល័យបញ្ញាសាស្ត្រកម្ពុជា",
  "pannasastra university of cambodia": "សាកលវិទ្យាល័យបញ្ញាសាស្ត្រកម្ពុជា",
  "puc": "សាកលវិទ្យាល័យបញ្ញាសាស្ត្រកម្ពុជា",
  "camtech university": "សាកលវិទ្យាល័យខេមតិច",
  "camtech": "សាកលវិទ្យាល័យខេមតិច",
  "camed business school": "សាលាពាណិជ្ជកម្ម CamEd",
  "camed": "សាលាពាណិជ្ជកម្ម CamEd",
  "the university of cambodia": "សាកលវិទ្យាល័យកម្ពុជា",
  "university of cambodia": "សាកលវិទ្យាល័យកម្ពុជា",
  "uc": "សាកលវិទ្យាល័យកម្ពុជា",
  "asia euro university": "សាកលវិទ្យាល័យ អាស៊ី អឺរ៉ុប",
  "aeu": "សាកលវិទ្យាល័យ អាស៊ី អឺរ៉ុប",
  "phnom penh international university": "សាកលវិទ្យាល័យភ្នំពេញអន្តរជាតិ",
  "ppiu": "សាកលវិទ្យាល័យភ្នំពេញអន្តរជាតិ",
  "university of economics and finance": "សាកលវិទ្យាល័យសេដ្ឋកិច្ច និងហិរញ្ញវត្ថុ",
  "uef": "សាកលវិទ្យាល័យសេដ្ឋកិច្ច និងហិរញ្ញវត្ថុ",
  "setec institute": "វិទ្យាស្ថានសេតិច",
  "setec": "វិទ្យាស្ថានសេតិច",
  "vanda institute": "វិទ្យាស្ថានវ៉ាន់ដា",
  "limkokwing university": "សាកលវិទ្យាល័យលីមកុកវីង",
  "western university": "សាកលវិទ្យាល័យវេស្ទើន",
  "norton university": "សាកលវិទ្យាល័យន័រតុន",
  "national polytechnic institute of cambodia": "វិទ្យាស្ថានជាតិពហុបច្ចេកទេសកម្ពុជា",
  "npic": "វិទ្យាស្ថានជាតិពហុបច្ចេកទេសកម្ពុជា",
  "national institute of education": "វិទ្យាស្ថានជាតិអប់រំ",
  "nie": "វិទ្យាស្ថានជាតិអប់រំ",
  "university of health sciences": "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល",
  "uhs": "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល",
  "royal university of agriculture": "សាកលវិទ្យាល័យភូមិន្ទកសិកម្ម",
  "rua": "សាកលវិទ្យាល័យភូមិន្ទកសិកម្ម",
  "mptc": "ក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍ (MPTC)",
  "moeys": "ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS)",
  "uyfc": "សហភាពសហព័ន្ធយុវជនកម្ពុជា (UYFC)",
  "aupp / mptc": "AUPP / MPTC",
  "uyfc / aupp": "UYFC / AUPP",
};

export function translateUniversityName(name?: string | null, locale: string = "en"): string {
  if (!name) return "";
  if (locale !== "km") return name;
  const key = name.trim().toLowerCase();
  return UNIVERSITY_KM_MAP[key] ?? name;
}

export const DEGREE_LEVEL_KM_MAP: Record<string, string> = {
  bachelor: "ថ្នាក់បរិញ្ញាបត្រ",
  undergraduate: "ថ្នាក់បរិញ្ញាបត្រ",
  "bachelor degree": "ថ្នាក់បរិញ្ញាបត្រ",
  master: "ថ្នាក់បរិញ្ញាបត្រជាន់ខ្ពស់",
  graduate: "ថ្នាក់បរិញ្ញាបត្រជាន់ខ្ពស់",
  postgraduate: "ថ្នាក់បរិញ្ញាបត្រជាន់ខ្ពស់",
  "master of science": "ថ្នាក់បរិញ្ញាបត្រជាន់ខ្ពស់",
  phd: "ថ្នាក់បណ្ឌិត",
  doctorate: "ថ្នាក់បណ្ឌិត",
  associate: "ថ្នាក់បរិញ្ញាបត្ររង",
  "associate degree": "ថ្នាក់បរិញ្ញាបត្ររង",
};

export function translateDegreeLevel(degree?: string | null, locale: string = "en"): string {
  if (!degree) return locale === "km" ? "ថ្នាក់បរិញ្ញាបត្រ" : "Bachelor";
  if (locale !== "km") return degree;
  const key = degree.trim().toLowerCase();
  return DEGREE_LEVEL_KM_MAP[key] ?? degree;
}

export const COVERAGE_KM_MAP: Record<string, string> = {
  "100% full tuition": "១០០% ថ្លៃសិក្សាពេញ",
  "full tuition + stipend": "ថ្លៃសិក្សាពេញ + ប្រាក់ឧបត្ថម្ភ",
  "partial tuition (20% - 75%)": "ថ្លៃសិក្សាមួយផ្នែក (២០% - ៧៥%)",
  "tuition discount (up to $5,000)": "ការបញ្ចុះថ្លៃសិក្សា (រហូតដល់ ៥,០០០ ដុល្លារ)",
  "full tuition": "ថ្លៃសិក្សាពេញ",
};

export function translateCoverage(coverage?: string | null, locale: string = "en"): string {
  if (!coverage) return "";
  if (locale !== "km") return coverage;
  const key = coverage.trim().toLowerCase();
  return COVERAGE_KM_MAP[key] ?? coverage;
}

export const CATEGORY_KM_MAP: Record<string, string> = {
  government: "រដ្ឋាភិបាល",
  university: "សាកលវិទ្យាល័យ",
  "foundation / non-profit": "មូលនិធិ / អង្គការមិនរកប្រាក់ចំណេញ",
  "all categories": "គ្រប់ប្រភេទ",
};

export function translateCategory(cat?: string | null, locale: string = "en"): string {
  if (!cat) return "";
  if (locale !== "km") return cat;
  const key = cat.trim().toLowerCase();
  return CATEGORY_KM_MAP[key] ?? cat;
}

export function translateScholarshipTitle(
  title?: string | null,
  provider?: string | null,
  locale: string = "en"
): string {
  if (!title) return "";
  if (locale !== "km") return title;

  const lowerTitle = title.trim().toLowerCase();
  const kmProvider = translateUniversityName(provider, locale);

  if (lowerTitle.includes("scholarship")) {
    if (lowerTitle.includes("techo")) return "អាហារូបករណ៍ទេពកោសល្យឌីជីថលតេជោ ២០២៦";
    if (lowerTitle.includes("uyfc")) return "អាហារូបករណ៍ UYFC ២០២៦";
    if (lowerTitle.includes("paragon")) return "ការប្រឡងអាហារូបករណ៍ Paragon.U ២០២៦";
    if (lowerTitle.includes("architecture")) return "អាហារូបករណ៍ស្ថាបត្យកម្ម";
    if (lowerTitle.includes("gen z")) return "អាហារូបករណ៍សមត្ថភាពសិក្សា Gen Z ២០២៧";
    if (lowerTitle.includes("data science")) return "អាហារូបករណ៍ផ្នែកគណិតវិទ្យា (វិទ្យាសាស្ត្រទិន្នន័យ)";
    if (lowerTitle.includes("itc")) return "អាហារូបករណ៍ឧត្តមភាពនៃវិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (ITC)";
    if (lowerTitle.includes("puc")) return "អាហារូបករណ៍ចូលសិក្សាសាកលវិទ្យាល័យបញ្ញាសាស្ត្រកម្ពុជា (PUC)";
    if (lowerTitle.includes("num")) return "អាហារូបករណ៍បរិញ្ញាបត្រនៃសាកលវិទ្យាល័យជាតិគ្រប់គ្រង (NUM)";
    if (lowerTitle.includes("media")) return "អាហារូបករណ៍ ៦០% សារព័ត៌មាន និងទំនាក់ទំនង";

    // General fallback for University Scholarship
    if (kmProvider) {
      return `អាហារូបករណ៍ ${kmProvider}`;
    }
  }

  return title;
}

export function translateApplicationStep(
  stepText: string,
  provider: string,
  locale: string = "en"
): { title: string; description: string } {
  const isKm = locale === "km";
  const kmProvider = translateUniversityName(provider, locale);

  let clean = stepText.replace(/^\d+[\.\)]\s*/, "").trim();
  let rawTitle = "";
  let rawDesc = clean;

  if (clean.includes(" - ")) {
    const parts = clean.split(" - ");
    rawTitle = parts[0].trim();
    rawDesc = parts.slice(1).join(" - ").trim();
  } else if (clean.includes(": ")) {
    const parts = clean.split(": ");
    rawTitle = parts[0].trim();
    rawDesc = parts.slice(1).join(": ").trim();
  }

  if (!isKm) {
    if (!rawTitle) {
      const lower = clean.toLowerCase();
      if (lower.startsWith("visit") || lower.includes("campus") || lower.includes("portal")) {
        rawTitle = "Visit Campus or Official Portal";
      } else if (lower.startsWith("register online and pay")) {
        rawTitle = "Online Registration & Exam Fee";
      } else if (lower.startsWith("register") || lower.includes("registration")) {
        rawTitle = "Register Online for Intake";
      } else if (lower.startsWith("complete the online application")) {
        rawTitle = "Complete Online Application";
      } else if (lower.startsWith("submit") && (lower.includes("form") || lower.includes("application"))) {
        rawTitle = "Submit Application Forms";
      } else if (lower.startsWith("upload") || lower.includes("house photos")) {
        rawTitle = "Upload Required Documents";
      } else if (lower.startsWith("provide") || lower.includes("proof") || lower.includes("income status")) {
        rawTitle = "Verify Financial & Academic Records";
      } else if (lower.includes("mock exam")) {
        rawTitle = "Preparatory Mock Exam";
      } else if (lower.includes("fee") || lower.includes("payment")) {
        rawTitle = "Pay Exam Registration Fee";
      } else if (lower.includes("part 1 exam")) {
        rawTitle = "Sit for Part 1 Examination";
      } else if (lower.includes("part 2 exam")) {
        rawTitle = "Sit for Part 2 Examination";
      } else if (lower.includes("sit for") || lower.includes("entrance exam") || lower.includes("scholarship exam") || lower.includes("evaluation exam")) {
        rawTitle = "Take Scholarship Entrance Exam";
      } else if (lower.includes("interview") || lower.includes("panel")) {
        rawTitle = "Attend Committee Interview";
      } else if (lower.includes("results announcement") || lower.includes("registry")) {
        rawTitle = "Results Announcement & Registry";
      } else if (lower.includes("award letter") || lower.includes("confirmation") || lower.includes("enrollment")) {
        rawTitle = "Confirm Award & Finalize Enrollment";
      } else if (lower.includes("cutoff") || lower.includes("verify national")) {
        rawTitle = "Verify Grade Cutoff Percentiles";
      } else {
        const words = clean.split(" ");
        rawTitle = words.slice(0, Math.min(words.length, 5)).join(" ");
      }
    }
    return { title: rawTitle, description: rawDesc };
  }

  // Khmer translation of steps
  const lower = clean.toLowerCase();

  if (lower.startsWith("apply at") || lower.includes("admission desk") || lower.includes("admissions desk")) {
    return {
      title: `ដាក់ពាក្យនៅ ${kmProvider}`,
      description: `ដាក់ពាក្យស្នើសុំចូលរៀន និងអាហារូបករណ៍នៅតុទទួលចុះឈ្មោះ ឬការិយាល័យចូលរៀនរបស់ ${kmProvider}`
    };
  }

  if (lower.startsWith("visit") || lower.includes("campus") || lower.includes("portal")) {
    return {
      title: "ទស្សនាបរិវេណ ឬគេហទំព័រផ្លូវការ",
      description: `ទស្សនាក្នុងបរិវេណផ្ទាល់ ឬចូលទៅកាន់គេហទំព័រផ្លូវការរបស់ ${kmProvider} ដើម្បីទទួលព័ត៌មានលម្អិត`
    };
  }

  if (lower.startsWith("register online and pay") || lower.includes("exam fee")) {
    return {
      title: "ចុះឈ្មោះតាមអនឡាញ និងបង់ថ្លៃសេវា",
      description: "ចុះឈ្មោះតាមប្រព័ន្ធអនឡាញ និងបង់ថ្លៃសេវាប្រឡងឱ្យបានត្រឹមត្រូវ"
    };
  }

  if (lower.startsWith("complete") && lower.includes("online application")) {
    return {
      title: "បំពេញពាក្យសុំតាមប្រព័ន្ធអនឡាញ",
      description: "បំពេញព័ត៌មានផ្ទាល់ខ្លួន និងប្រវត្តិសិក្សាឱ្យបានពេញលេញនៅលើប្រព័ន្ធផ្លូវការ"
    };
  }

  if (lower.startsWith("submit") && (lower.includes("form") || lower.includes("application"))) {
    return {
      title: "ដាក់ពាក្យស្នើសុំចូលរៀន និងអាហារូបករណ៍",
      description: "ដាក់ពាក្យស្នើសុំចូលរៀន និងសំណើអាហារូបករណ៍ឱ្យបានត្រឹមត្រូវតាមកាលកំណត់"
    };
  }

  if (lower.startsWith("upload") || lower.includes("documents") || lower.includes("photos")) {
    return {
      title: "ភ្ជាប់ ឬបង្ហោះឯកសារចាំបាច់",
      description: "ភ្ជាប់ច្បាប់ចម្លងសញ្ញាបត្របាក់ឌុប អត្តសញ្ញាណប័ណ្ណ និងឯកសារបញ្ជាក់ពាក់ព័ន្ធ"
    };
  }

  if (lower.startsWith("provide") || lower.includes("proof") || lower.includes("income")) {
    return {
      title: "ផ្ទៀងផ្ទាត់កំណត់ត្រាសិក្សា និងហិរញ្ញវត្ថុ",
      description: "ផ្តល់ភស្តុតាងនៃលទ្ធផលប្រឡងបាក់ឌុប និងលិខិតបញ្ជាក់ស្ថានភាពគ្រួសារ"
    };
  }

  if (lower.includes("mock exam")) {
    return {
      title: "ចូលរួមវគ្គប្រឡងសាកល្បងត្រៀម",
      description: "ចូលរួមវគ្គប្រឡងសាកល្បងដើម្បីយល់ដឹងពីទម្រង់វិញ្ញាសា និងការគ្រប់គ្រងពេលវេលា"
    };
  }

  if (lower.includes("part 1 exam") || lower.includes("part 2 exam") || lower.includes("entrance exam") || lower.includes("scholarship exam") || lower.includes("sit for")) {
    return {
      title: "ចូលរួមការប្រឡងតេស្តសមត្ថភាព",
      description: "ចូលរួមការប្រឡងអាហារូបករណ៍លើមុខវិជ្ជាកំណត់ដូចជា គណិតវិទ្យា តក្កវិទ្យា និងភាសាអង់គ្លេស"
    };
  }

  if (lower.includes("interview") || lower.includes("panel")) {
    return {
      title: "ចូលរួមការសម្ភាសន៍ផ្ទាល់ជាមួយគណៈកម្មការ",
      description: "ចូលរួមការសម្ភាសន៍វាយតម្លៃសមត្ថភាព ការលើកទឹកចិត្ត និងចក្ខុវិស័យសិក្សា"
    };
  }

  if (lower.includes("results announcement") || lower.includes("registry") || lower.includes("award letter") || lower.includes("enrollment")) {
    return {
      title: "ប្រកាសលទ្ធផល និងបញ្ចប់ការចុះឈ្មោះ",
      description: "ពិនិត្យបញ្ជីឈ្មោះអ្នកទទួលអាហារូបករណ៍ និងបំពេញនីតិវិធីចុះឈ្មោះចូលរៀនផ្លូវការ"
    };
  }

  // Fallback translation
  return {
    title: rawTitle || `ដំណើរការដាក់ពាក្យនៅ ${kmProvider}`,
    description: rawDesc || clean
  };
}
