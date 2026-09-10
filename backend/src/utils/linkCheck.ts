/**
 * Automated first-pass check on a link a student asks us to verify.
 *
 * Ported from `backend/utils/urlRiskCheck.js`, which lived outside `src/` and
 * so was never in the TypeScript build or imported anywhere. The offline checks
 * are kept here; the network ones (reachability, Google Safe Browsing) are
 * deliberately left out so a submission is answered in milliseconds and the
 * tests stay deterministic. They belong in a background job that re-checks
 * pending requests.
 *
 * This is a *first pass*, never a verdict. It exists to give the student
 * something immediately and to tell the reviewer where to look.
 */

/** Phrases that recur in fake scholarship offers. */
const SCAM_PATTERNS: Array<[RegExp, string]> = [
  [/processing fee|application fee|admin(istration)? fee/i, 'Mentions a fee to apply — legitimate scholarships do not charge one.'],
  [/pay(ment)? (is )?required|pay to (apply|register)/i, 'Asks for payment to apply.'],
  [/wire transfer|western union|money ?gram/i, 'Asks for an untraceable money transfer.'],
  [/send.{0,20}bank (details|account)|account (number|details)/i, 'Asks for bank account details.'],
  [/credit card (number|details)/i, 'Asks for card details.'],
  [/social security number|national id number/i, 'Asks for a national identity number up front.'],
  [/guaranteed (acceptance|approval|scholarship)|100% guaranteed/i, 'Promises a guaranteed award — no real scholarship can.'],
  [/act now|apply (within|in) 24 hours|limited (spots|slots|time)/i, 'Uses urgency pressure.'],
  [/no essay required|no documents required/i, 'Claims no documents are needed.'],
  [/congratulations.{0,30}(selected|won)|winner.{0,20}(selected|chosen)/i, 'Says you have already won something you never entered.'],
  [/free (iphone|laptop|phone|gift)/i, 'Offers an unrelated free gift.'],
  [/t\.me\/|telegram|whatsapp/i, 'Directs applicants to a private messaging app rather than an official portal.']
];

const RISKY_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.link'];

const SOCIAL_HOSTS = ['facebook.com', 'fb.com', 'instagram.com', 't.me', 'telegram.me', 'tiktok.com', 'x.com', 'twitter.com'];

const SHORTENERS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'cutt.ly'];

const OFFICIAL_PATTERNS = [
  /\.(gov|edu)$/,
  /\.(gov|edu|ac|go)\.[a-z]{2,3}$/,
  /(^|\.)europa\.eu$/
];

export type RiskLevel = 'low' | 'caution' | 'high';

export interface LinkCheck {
  /** 0–100. Higher is more concerning. */
  score: number;
  level: RiskLevel;
  /** Plain-English concerns, safe to show a student directly. */
  findings: string[];
  /** What the automated pass could confirm. */
  passed: string[];
  hostname: string | null;
  /** 'official' | 'organisation' | 'news' | 'social_media' | 'unknown' */
  sourceType: string;
}

const hostnameOf = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

const matches = (host: string, list: string[]): boolean =>
  list.some(d => host === d || host.endsWith(`.${d}`));

/**
 * Runs the offline checks over a URL and any text the student pasted.
 * Never throws — a malformed URL is itself a finding.
 */
export const checkLink = (rawUrl: string, text = ''): LinkCheck => {
  const findings: string[] = [];
  const passed: string[] = [];
  let score = 0;

  const url = rawUrl.trim();
  const host = url ? hostnameOf(url) : null;

  if (!url) {
    findings.push('No link was provided, so the source could not be checked at all.');
    return { score: 50, level: 'caution', findings, passed, hostname: null, sourceType: 'unknown' };
  }

  if (!host) {
    findings.push('That does not look like a valid web address.');
    return { score: 70, level: 'high', findings, passed, hostname: null, sourceType: 'unknown' };
  }

  /* -------------------------------------------------- URL structure */

  if (!/^https:\/\//i.test(url)) {
    findings.push('The link is not HTTPS, so information sent to it is not encrypted.');
    score += 15;
  } else {
    passed.push('Uses an encrypted HTTPS connection.');
  }

  if (/^https?:\/\/(\d{1,3}\.){3}\d{1,3}/.test(url)) {
    findings.push('The link points at a raw IP address instead of a domain name.');
    score += 25;
  }

  if (RISKY_TLDS.some(tld => host.endsWith(tld))) {
    findings.push(`The domain ends in ${host.slice(host.lastIndexOf('.'))}, a cheap ending often used for throwaway sites.`);
    score += 25;
  }

  if (matches(host, SHORTENERS)) {
    findings.push('The link is shortened, which hides where it actually leads.');
    score += 20;
  }

  if (host.split('.').length > 4) {
    findings.push('The address has an unusually long domain, sometimes used to imitate a trusted site.');
    score += 15;
  }

  /* -------------------------------------------------- Source type */

  let sourceType = 'organisation';
  if (OFFICIAL_PATTERNS.some(p => p.test(host))) {
    sourceType = 'official';
    passed.push('Hosted on an official government or academic domain.');
  } else if (matches(host, SOCIAL_HOSTS)) {
    sourceType = 'social_media';
    findings.push('This is a social media post, not an official application page. Anyone can post one.');
    score += 25;
  }

  /* -------------------------------------------------- Wording */

  const haystack = `${text} ${url}`;
  for (const [pattern, message] of SCAM_PATTERNS) {
    if (pattern.test(haystack)) {
      findings.push(message);
      score += 20;
    }
  }

  if (findings.length === 0) {
    passed.push('No common scam warning signs were found in what you sent.');
  }

  score = Math.min(score, 100);
  const level: RiskLevel = score >= 50 ? 'high' : score >= 20 ? 'caution' : 'low';

  return { score, level, findings, passed, hostname: host, sourceType };
};
