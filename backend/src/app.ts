/**
 * The Express application.
 *
 * This file is also the production entry point: Vercel detects an Express app
 * by looking for `app`/`index`/`server` at the project root or under `src/`,
 * and invokes the default export below for every request — no `vercel.json`
 * and no `api/` folder involved. Renaming or moving this file will therefore
 * break the deploy, not just the imports.
 *
 * `src/server.ts` wraps it in `app.listen()` for local and Docker runs.
 */
import dotenv from 'dotenv';
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import passport from './config/passport';
import connectPgSimple from 'connect-pg-simple';
import pool from './config/db';

const { generalLimiter } = require('../middleware/security');
const authRoutes = require('./routes/auth');
const pagesRoutes = require('./routes/pages');
const scholarshipsRoutes = require('./routes/scholarships');
const careersRoutes = require('./routes/careers');
const majorsRoutes = require('./routes/majors');
const universitiesRoutes = require('./routes/universities');
const savedRoutes = require('./routes/saved');
const verificationRoutes = require('./routes/verificationRequests');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express();

// Never advertise the framework. (helmet also does this; belt and braces.)
app.disable('x-powered-by');

const isProduction = process.env.NODE_ENV === 'production';

// Vercel terminates TLS at the edge and forwards plain HTTP to the function.
// Without this, Express sees an insecure request and silently refuses to send
// any cookie marked `secure` — which in production is every session cookie.
app.set('trust proxy', 1);

app.use(
  helmet({
    // The API is read cross-origin by the Next.js frontend, so the default
    // same-origin resource policy would block every response in the browser.
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(generalLimiter);

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
/**
 * express-session's default MemoryStore keeps sessions inside the process.
 * That is fine for one long-running server, but the production deploy is
 * serverless: each request can land on a cold instance, so the session the
 * OAuth callback just wrote would be gone by the next `GET /auth/me`, and
 * every login would appear to succeed and then immediately log the user out.
 * Persist sessions in Postgres instead.
 *
 * Development and tests stay on MemoryStore — the suite runs against a
 * throwaway database that is created and dropped on every run.
 */
const sessionStore = isProduction
  ? new (connectPgSimple(session))({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    })
  : undefined;

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'mypath-secret',
  resave: false,
  saveUninitialized: false,
  // Trust X-Forwarded-Proto when deciding whether the connection was secure.
  proxy: isProduction,
  cookie: {
    // In production the frontend and this API sit on different domains, so the
    // session cookie travels cross-site and must be marked SameSite=None.
    // Browsers only accept None together with Secure.
    sameSite: isProduction ? 'none' : 'lax',
    httpOnly: true,
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', pagesRoutes);
// The brute-force limiter is applied inside the router, on POST /login and
// POST /register only. Mounting it here would also cover GET /auth/me, which
// the frontend calls on every page load — that logged real users out after a
// handful of navigations.
app.use('/auth', authRoutes);
app.use('/scholarships', scholarshipsRoutes);
app.use('/careers', careersRoutes);
app.use('/majors', majorsRoutes);
app.use('/universities', universitiesRoutes);
app.use('/saved', savedRoutes);
app.use('/verification-requests', verificationRoutes);

/** Unknown route — JSON, so clients never have to parse an HTML error page. */
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

/**
 * Last line of defence. Express 5 forwards rejected promises from async
 * handlers here, so an unexpected database failure becomes a generic JSON 500
 * instead of an HTML page carrying the query, constraint names and file paths.
 * The detail goes to the server log, never to the client.
 */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
