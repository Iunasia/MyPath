import dotenv from 'dotenv';
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import passport from './config/passport';

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
app.use(session({
  secret: process.env.SESSION_SECRET || 'mypath-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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
