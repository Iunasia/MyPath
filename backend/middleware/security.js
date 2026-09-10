/**
 * Security middleware setup for MyPath backend.
 * Owned by: security team member.
 * Do NOT put app/business logic here — only cross-cutting security controls
 * (headers, rate limiting, session hardening) that wrap around whatever
 * routes the rest of the team builds.
 */

const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for auth endpoints (login/register).
 * Prevents brute-force password guessing and credential stuffing.
 * 10 attempts per 15 minutes per IP is a reasonable starting point —
 * tune based on real usage once the app has traffic.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true, // return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  // A shared 10-request budget would make the API test suite fail as soon as
  // it exercised more than a handful of auth calls. The limiter itself is
  // covered directly in src/tests/security.test.ts.
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: 'Too many attempts. Please try again in 15 minutes.'
  }
});

/**
 * Looser limiter for general API routes — protects against basic
 * scraping/abuse without getting in the way of normal browsing.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  // Every test shares one loopback address, so the whole suite would draw on a
  // single budget and fail once it grew past 300 requests. Covered directly in
  // src/tests/security.test.ts.
  skip: () => process.env.NODE_ENV === 'test'
});

/**
 * Per-account limiter for "is this scholarship real?" submissions.
 *
 * Every accepted submission pings the review team's Telegram group, so the
 * general 300/15min budget would let a single account flood it. Keyed by
 * account rather than IP, so a school sharing one connection doesn't share
 * one budget — and registration is IP-limited, so minting accounts to get
 * around this is slow.
 *
 * Only accepted submissions count: a request rejected with a 4xx (an empty
 * form, an unknown scholarship) never reaches Telegram, so it shouldn't cost
 * the student a slot.
 *
 * Mount AFTER isAuthenticated — the key relies on a signed-in session.
 */
const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user:${req.session.userId}`,
  skipFailedRequests: true,
  // Covered directly in src/tests/verificationRequests.test.ts.
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error:
      "You've sent a lot of requests in the last hour. Please wait a little before sending another — we're still working through the ones you've sent."
  }
});

/**
 * Session cookie configuration.
 * - httpOnly: JS on the page can't read the cookie (mitigates XSS cookie theft)
 * - secure: cookie only sent over HTTPS (set NODE_ENV=production in prod!)
 * - sameSite: 'lax' blocks the cookie being sent on most cross-site requests (CSRF mitigation)
 * - maxAge: sessions expire after 24h of being issued
 */
const sessionCookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

module.exports = {
  authLimiter,
  generalLimiter,
  verificationLimiter,
  sessionCookieConfig
};
