/**
 * Security middleware setup for MyPath backend.
 * Owned by: security team member.
 * Do NOT put app/business logic here — only cross-cutting security controls
 * (headers, rate limiting, session hardening) that wrap around whatever
 * routes the rest of the team builds.
 */

const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

/**
 * Where rate-limit counters live.
 *
 * express-rate-limit defaults to an in-process memory store, which silently
 * stops working the moment the API runs as more than one process. On Vercel
 * every cold start is a fresh process with an empty counter, so a memory-backed
 * "10 per 15 minutes" is really "10 per instance" — effectively no limit at all,
 * including on the auth endpoints guarding against password guessing.
 *
 * With REDIS_URL set, every instance shares one counter and the limits mean what
 * they say. Without it we keep the memory store, which is correct for a single
 * local process but NOT safe for production — hence the warning.
 *
 * Tests deliberately never use Redis: security.test.ts exercises the real
 * limiters by defeating the NODE_ENV skip, and a shared counter surviving
 * between runs would make those tests flake.
 */
const isTestEnv = () => String(process.env.NODE_ENV || '').includes('test');

let redisClient = null;
if (process.env.REDIS_URL && !isTestEnv()) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
  redisClient.on('error', err => console.error('Redis rate-limit error:', err.message));
} else if (process.env.NODE_ENV === 'production') {
  console.warn(
    '⚠️  REDIS_URL is not set. Rate limits are stored in memory and will NOT ' +
    'hold across instances — set REDIS_URL to make them effective in production.'
  );
}

/**
 * A Redis-backed store for one limiter, or undefined to fall back to memory.
 * Each limiter needs its own prefix so their counters never collide.
 */
const storeFor = prefix =>
  redisClient
    ? new RedisStore({
        prefix: `mypath:rl:${prefix}:`,
        sendCommand: (...args) => redisClient.call(...args)
      })
    : undefined;

/**
 * Strict limiter for auth endpoints (login/register).
 * Prevents brute-force password guessing and credential stuffing.
 * 10 attempts per 15 minutes per IP is a reasonable starting point —
 * tune based on real usage once the app has traffic.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  store: storeFor('auth'),
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
 * Looeral API rouser limiter for gentes — protects against basic
 * scraping/abuse without getting in the way of normal browsing.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  store: storeFor('general'),
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
  store: storeFor('verification'),
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
  sessionCookieConfig,
  // Exposed for graceful shutdown, and so the session store can share this
  // connection rather than opening a second one (see src/app.ts).
  rateLimitRedis: redisClient
};
