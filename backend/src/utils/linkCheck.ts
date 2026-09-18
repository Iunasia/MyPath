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

/**
 * Phrases that recur in fake scholarship offers.
 *
 * `negatable` marks the ones where a leading "no"/"without" flips the meaning
 * entirely: a page saying "there is no application fee" is advertising the
 * opposite of a scam, and flagging it hit precisely the legitimate listings —
 * real scholarships say this *because* scams are common. Patterns whose own
 * wording already contains the negation ("no documents required") are NOT
 * negatable, or the guard would cancel the very thing they look for.
 */
interface ScamPattern {
  pattern: RegExp;
  message: string;
  negatable: boolean;
}

const SCAM_PATTERNS: ScamPattern[] = [
  { pattern: /processing fee|application fee|admin(istration)? fee/i, message: 'Mentions a fee to apply — legitimate scholarships do not charge one.', negatable: true },
  { pattern: /pay(ment)? (is )?required|pay to (apply|register)/i, message: 'Asks for payment to apply.', negatable: true },
  { pattern: /wire transfer|western union|money ?gram/i, message: 'Asks for an untraceable money transfer.', negatable: true },
  { pattern: /send.{0,20}bank (details|account)|account (number|details)/i, message: 'Asks for bank account details.', negatable: true },
  { pattern: /credit card (number|details)/i, message: 'Asks for card details.', negatable: true },
  { pattern: /social security number|national id number/i, message: 'Asks for a national identity number up front.', negatable: true },
  { pattern: /guaranteed (acceptance|approval|scholarship)|100% guaranteed/i, message: 'Promises a guaranteed award — no real scholarship can.', negatable: true },
  { pattern: /act now|apply (within|in) 24 hours|limited (spots|slots|time)/i, message: 'Uses urgency pressure.', negatable: false },
  { pattern: /no essay required|no documents required/i, message: 'Claims no documents are needed.', negatable: false },
  { pattern: /congratulations.{0,30}(selected|won)|winner.{0,20}(selected|chosen)/i, message: 'Says you have already won something you never entered.', negatable: false },
  { pattern: /free (iphone|laptop|phone|gift)/i, message: 'Offers an unrelated free gift.', negatable: false },
  { pattern: /t\.me\/|telegram|whatsapp/i, message: 'Directs applicants to a private messaging app rather than an official portal.', negatable: false }
];

/** A negation within the few words immediately before a match cancels it. */
const NEGATION_BEFORE = /\b(no|not|never|without|free of|zero|waived|exempt from|isn'?t|aren'?t|does ?n'?t|do ?n'?t)\b[^.!?]{0,24}$/i;

/** True when the URL already carries a scheme, e.g. "https://" or "ftp://". */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

/**
 * Whether a scam pattern genuinely fires, ignoring matches that a negation
 * immediately precedes. Every match is considered, so "no application fee, but
 * pay a processing fee" is still caught on the second clause.
 */
const firesFor = ({ pattern, negatable }: ScamPattern, text: string): boolean => {
  if (!negatable) return pattern.test(text);

  const scan = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
  for (const match of text.matchAll(scan)) {
    const preceding = text.slice(Math.max(0, match.index - 40), match.index);
    if (!NEGATION_BEFORE.test(preceding)) return true;
  }
  return false;
};

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

  const raw = rawUrl.trim();

  if (!raw) {
    findings.push('No link was provided, so the source could not be checked at all.');
    return { score: 50, level: 'caution', findings, passed, hostname: null, sourceType: 'unknown' };
  }

  let url = raw;
  let host = hostnameOf(raw);

  /**
   * Students paste bare domains constantly — "facebook.com/somepost" with no
   * scheme. `new URL()` rejects those, so they used to score 70/high with "not
   * a valid web address", which is both wrong and alarming. Retry with a scheme
   * before writing the address off.
   */
  let schemeAssumed = false;
  if (!host && !HAS_SCHEME.test(raw)) {
    const retried = hostnameOf(`https://${raw}`);
    if (retried) {
      host = retried;
      url = `https://${raw}`;
      schemeAssumed = true;
    }
  }

  if (!host) {
    findings.push('That does not look like a valid web address.');
    return { score: 70, level: 'high', findings, passed, hostname: null, sourceType: 'unknown' };
  }

  /* -------------------------------------------------- URL structure */

  // When we supplied the scheme ourselves we know nothing about the real one,
  // so neither credit nor penalise encryption — saying either would be a guess.
  if (!schemeAssumed) {
    if (!/^https:\/\//i.test(url)) {
      findings.push('The link is not HTTPS, so information sent to it is not encrypted.');
      score += 15;
    } else {
      passed.push('Uses an encrypted HTTPS connection.');
    }
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
  for (const scam of SCAM_PATTERNS) {
    if (firesFor(scam, haystack)) {
      findings.push(scam.message);
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
