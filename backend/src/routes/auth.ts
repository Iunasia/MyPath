import { Request, Response } from 'express';
import passport from 'passport';
import User from '../models/User';
import EmailVerification from '../models/EmailVerification';
import { sendVerificationEmail } from '../utils/email';
import { isGuest } from '../middleware/auth';

const router = require('express').Router();
const { authLimiter } = require('../../middleware/security');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// GET /register
router.get('/register', isGuest, (_req: Request, res: Response) => {
  res.json({ message: 'Registration form endpoint' });
});

// POST /register
router.post('/register', authLimiter, isGuest, async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are all required.' });
    }

    // 1. Create the user (is_verified defaults to false in Postgres)
    const user = await User.create({ name, email, password, role: 'student' });

    // 2. Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Save it to the email_verifications table
    await EmailVerification.create(user.id, code);
    
    // 4. Send the email via your team's Gmail
    await sendVerificationEmail(user.email, code);

    // 🚨 DO NOT SET SESSION HERE. They must verify first.
    
    res.status(201).json({ 
      message: 'User registered successfully. Please check your email for the verification code.',
      requiresVerification: true 
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Email already registered or error occurred.' });
  }
});

// POST /verify-email
router.post('/verify-email',authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.is_verified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    // Check if code matches and is not expired
    const isValid = await EmailVerification.findValidCode(user.id, code);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    // Mark user as verified in the database
    await User.markAsVerified(user.id);
    
    // Clean up the used code
    await EmailVerification.deleteByUserId(user.id);

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Server error during verification.' });
  }
});

// GET /login
router.get('/login', isGuest, (_req: Request, res: Response) => {
  res.json({ message: 'Login form endpoint' });
});

// POST /login
router.post('/login', authLimiter, isGuest, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findByEmail(email);

    if (!user || !user.password || !(await User.comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 🚨 BLOCK UNVERIFIED USERS
    if (!user.is_verified) {
      return res.status(403).json({ 
        error: 'Please verify your email address before logging in.',
        requiresVerification: true 
      });
    }

    const session = req.session as any;
    session.userId = user.id;
    session.userName = user.name;
    session.userRole = user.role;

    const { password: _passwordHash, ...safeUser } = user;
    res.status(200).json({ message: 'Login successful', user: safeUser });
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
    const user = (req.user as any);
    if (user) {
      // 🚨 BLOCK UNVERIFIED GOOGLE USERS
      if (!user.is_verified) {
        // Redirect them to your frontend verification page with their email
        return res.redirect(`${FRONTEND_URL}/auth/verify?email=${user.email}`);
      }

      const session = req.session as any;
      session.userId = user.id;
      session.userName = user.name;
      session.userRole = user.role;
    }
    req.session.save((err) => {
      if (err) console.error('Session save error on OAuth callback:', err);
      res.redirect(FRONTEND_URL);
    });
  }
);

// GET /logout
router.get('/logout', (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: 'Failed to log out' });
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } else {
    res.status(200).json({ message: 'Logged out successfully' });
  }
});

module.exports = router;