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
  legacyHeaders: false
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
  sessionCookieConfig
};
