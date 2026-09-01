const https = require('https');
const http = require('http');
const { URL } = require('url');

// Optional Google Safe Browsing key — if missing, that check is just skipped.
const SAFE_BROWSING_API_KEY = process.env.SAFE_BROWSING_API_KEY || null;

// Common scam-related phrases seen in fake scholarship listings.
const SCAM_KEYWORDS = [
  /processing fee/i,
  /application fee/i,
  /pay(ment)? required/i,
  /wire transfer/i,
  /western union/i,
  /send.{0,20}bank details/i,
  /send.{0,20}account (number|details)/i,
  /guaranteed (acceptance|approval)/i,
  /100% guaranteed/i,
  /act now/i,
  /apply (within|in) 24 hours/i,
  /limited (spots|slots|time)/i,
  /no essay required/i,
  /winner.{0,20}(selected|chosen)/i,
  /congratulations.{0,20}(selected|won)/i,
  /social security number/i,
  /credit card (number|details)/i
];

// Checks URL structure only — no network calls.
function checkUrlStructure(rawUrl) {
  const reasons = [];
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch (err) {
    return { valid: false, reasons: ['URL is malformed or missing.'] };
  }

  if (parsed.protocol !== 'https:') {
    reasons.push('Source does not use HTTPS — connection to this site is not encrypted.');
  }

  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname);
  if (isIpAddress) {
    reasons.push('Source links directly to an IP address rather than a domain name.');
  }

  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top'];
  if (suspiciousTlds.some(tld => parsed.hostname.endsWith(tld))) {
    reasons.push(`Domain uses a TLD (${parsed.hostname.split('.').pop()}) commonly associated with low-cost/throwaway domains.`);
  }

  const labelCount = parsed.hostname.split('.').length;
  if (labelCount > 4) {
    reasons.push('Domain has an unusually long/nested hostname, which can be used to imitate a trusted domain.');
  }

  return { valid: true, hostname: parsed.hostname, protocol: parsed.protocol, reasons };
}

// Confirms the URL actually resolves (HEAD request, short timeout).
function checkUrlReachable(rawUrl, timeoutMs = 5000) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return resolve({ reachable: false, reason: 'Malformed URL.' });
    }

    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(
      rawUrl,
      { method: 'HEAD', timeout: timeoutMs },
      (res) => {
        resolve({ reachable: true, statusCode: res.statusCode });
        res.destroy();
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ reachable: false, reason: 'Request timed out — site may be slow or unreachable.' });
    });

    req.on('error', (err) => {
      resolve({ reachable: false, reason: `Could not connect: ${err.message}` });
    });

    req.end();
  });
}

// Checks Google Safe Browsing if a key is configured. Skips (returns null) if not.
async function checkSafeBrowsing(rawUrl) {
  if (!SAFE_BROWSING_API_KEY) return null;

  try {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${SAFE_BROWSING_API_KEY}`;
    const body = {
      client: { clientId: 'mypath', clientVersion: '1.0.0' },
      threatInfo: {
        threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{ url: rawUrl }]
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.error('Safe Browsing API error:', response.status);
      return null;
    }

    const data = await response.json();
    return { flagged: Boolean(data.matches && data.matches.length > 0), matches: data.matches || [] };
  } catch (err) {
    console.error('Safe Browsing check failed:', err.message);
    return null;
  }
}

// Scans description text for scam-related keyword patterns.
function checkDescriptionForScamPatterns(description) {
  if (!description) return [];
  const matches = [];
  for (const pattern of SCAM_KEYWORDS) {
    if (pattern.test(description)) {
      matches.push(pattern.source);
    }
  }
  return matches;
}

// Main entry point — combines all checks into one risk assessment.
async function assessRisk({ url, description }) {
  const reasons = [];
  let score = 0;

  const structural = checkUrlStructure(url);
  if (!structural.valid) {
    return { score: 100, status: 'high_risk', reasons: structural.reasons };
  }
  reasons.push(...structural.reasons);
  score += structural.reasons.length * 15;

  const reachability = await checkUrlReachable(url);
  if (!reachability.reachable) {
    reasons.push(`Source could not be verified as reachable (${reachability.reason})`);
    score += 25;
  } else if (reachability.statusCode >= 400) {
    reasons.push(`Source returned an error response (HTTP ${reachability.statusCode}).`);
    score += 20;
  }

  const safeBrowsing = await checkSafeBrowsing(url);
  if (safeBrowsing && safeBrowsing.flagged) {
    reasons.push('This URL is flagged by Google Safe Browsing as potentially harmful.');
    score += 60;
  }

  const scamPatterns = checkDescriptionForScamPatterns(description);
  if (scamPatterns.length > 0) {
    reasons.push(`Description contains ${scamPatterns.length} common scam-related phrase pattern(s).`);
    score += scamPatterns.length * 10;
  }

  score = Math.min(score, 100);

  let status = 'safe';
  if (score >= 50) status = 'high_risk';
  else if (score >= 20) status = 'caution';

  return { score, status, reasons };
}

module.exports = {
  assessRisk,
  checkUrlStructure,
  checkUrlReachable,
  checkSafeBrowsing,
  checkDescriptionForScamPatterns
};