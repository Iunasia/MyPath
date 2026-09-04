import { Request, Response } from 'express';
import passport from 'passport';
import User from '../models/User';
import { isGuest } from '../middleware/auth';

const router = require('express').Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// GET /register
router.get('/register', isGuest, (_req: Request, res: Response) => {
  res.json({ message: 'Registration form endpoint' });
});

// POST /register
router.post('/register', isGuest, async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role: role || 'student' });

    const session = req.session as any;
    session.userId = user.id;
    session.userName = user.name;
    session.userRole = user.role;

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(400).json({ error: 'Email already registered or error occurred.' });
  }
});

// GET /login
router.get('/login', isGuest, (_req: Request, res: Response) => {
  res.json({ message: 'Login form endpoint' });
});

// POST /login
router.post('/login', isGuest, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user || !user.password || !(await User.comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const session = req.session as any;
    session.userId = user.id;
    session.userName = user.name;
    session.userRole = user.role;

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: 'Login error.' });
  }
});

// GET /me - Check current session
router.get('/me', async (req: Request, res: Response) => {
  const session = req.session as any;
  if (!session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await User.findById(session.userId);
    if (!user) {
      session.destroy();
      return res.status(401).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /google - Redirect to Google OAuth
router.get(
  '/google',
  (req: Request, res: Response, next: any) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({ error: 'Google OAuth is not configured on the server.' });
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  }
);

// GET /google/callback - Handle OAuth callback
router.get(
  '/google/callback',
  (req: Request, res: Response, next: any) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${FRONTEND_URL}/auth/signin?error=oauth_not_configured`);
    }
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/auth/signin` })(req, res, next);
  },
  (req: Request, res: Response) => {
    // Also set session data for consistency with manual login
    const user = (req.user as any);
    if (user) {
      const session = req.session as any;
      session.userId = user.id;
      session.userName = user.name;
      session.userRole = user.role;
    }
    res.redirect(FRONTEND_URL);
  }
);

// GET /logout
router.get('/logout', (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log out' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } else {
    res.status(200).json({ message: 'Logged out successfully' });
  }
});

module.exports = router;
