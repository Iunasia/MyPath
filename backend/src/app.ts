import dotenv from 'dotenv';
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import helmet from 'helmet';
import passport from './config/passport';
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
const isProduction = process.env.NODE_ENV === 'production';

const PgSession = connectPgSimple(session);

const app = express();

// Trust reverse proxy (Vercel / Cloudflare / Render) for secure cookies & rate limiting
app.set('trust proxy', 1);

// Never advertise the framework. (helmet also does this; belt and braces.)
app.disable('x-powered-by');

app.use(
  helmet({
    // The API is read cross-origin by the Next.js frontend, so the default
    // same-origin resource policy would block every response in the browser.
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(generalLimiter);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow configured FRONTEND_URL and localhost during dev
    if (origin === FRONTEND_URL || (!isProduction && origin.startsWith('http://localhost:'))) {
      return callback(null, true);
    }
    // Allow vercel preview deployments if FRONTEND_URL matches vercel.app
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'mypath-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
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
