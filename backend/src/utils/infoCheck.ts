// Define the shape of a scholarship object so TypeScript is happy
interface ScholarshipData {
  source_url?: string;
  source?: string;
  description?: string;
  [key: string]: any;
}

export const generateInfoCheck = (scholarship: ScholarshipData) => {
  // TODO: Add your real URL risk detection logic here (e.g., check for 'processing fee', 'guaranteed acceptance', non-HTTPS links, etc.)
  const isRisky = false;
  const reasons: string[] = [];

  if (!scholarship.source_url || !scholarship.source_url.startsWith('https://')) {
    // Example logic placeholder
    // reasons.push('Non-secure URL');
    // isRisky = true;
  }

  return { isRisky, reasons };
};