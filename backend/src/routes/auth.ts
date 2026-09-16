import { Request, Response } from 'express';
import crypto from 'crypto';
import passport from 'passport';
import pool from '../config/db';
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
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  const { name, email, password, locale = 'en' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // ── Step 1: Check for existing email BEFORE creating anything ──────────
  try {
    const existing = await User.findByEmail(email);
    if (existing) {
      if (!existing.is_verified) {
        // Stale unverified account from a previous failed attempt → clean up
        await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [existing.id]);
        await pool.query('DELETE FROM users WHERE id = $1', [existing.id]);
      } else {
        return res.status(409).json({ error: 'This email is already registered. Please log in.' });
      }
    }
  } catch (err) {
    console.error('Register – lookup error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }

  // ── Step 2: Create the user (is_verified defaults to false) ────────────
  let user: any;
  try {
    user = await User.create({ name, email, password, role: 'student' });
  } catch (err) {
    console.error('Register – create user error:', err);
    return res.status(500).json({ error: 'Could not create account. Please try again.' });
  }

  // ── Step 3: Generate + save a 6-digit verification code & Magic Link UUID ─
  const code = crypto.randomInt(100000, 999999).toString();
  const uuidToken = crypto.randomUUID();
  
  try {
    await EmailVerification.create(user.id, code, uuidToken);
  } catch (err) {
    console.error('Register – save code error:', err);
    await pool.query('DELETE FROM users WHERE id = $1', [user.id]).catch(console.error);
    return res.status(500).json({ error: 'Could not save verification code. Please try again.' });
  }

  // ── Step 4: Send verification email ────────────────────────────────────
  try {
    await sendVerificationEmail(user.email, code, uuidToken, locale);
  } catch (err) {
    console.error('Register – send email error:', err);
    // Roll back so the user can retry with the same email
    await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [user.id]).catch(console.error);
    await pool.query('DELETE FROM users WHERE id = $1', [user.id]).catch(console.error);
    return res.status(500).json({ error: 'Verification email failed to send. Please try again.' });
  }

  // Set pendingUserId so this specific browser can poll for verification status
  const session = req.session as any;
  session.pendingUserId = user.id;

  req.session.save((err) => {
    if (err) console.error('Session save error on register:', err);
    return res.status(201).json({
      message: 'Registered successfully. Please check your email for the verification code.',
      requiresVerification: true,
    });
  });
});

// GET /check-verification
// Called by the frontend polling mechanism to magically auto-login when verified on another device.
router.get('/check-verification', async (req: Request, res: Response) => {
  const session = req.session as any;
  if (!session.pendingUserId) {
    return res.status(200).json({ verified: false });
  }

  try {
    const user = await User.findById(session.pendingUserId);
    if (user && user.is_verified) {
      // User was verified on another device! Upgrade to a full session.
      session.userId = user.id;
      session.userName = user.name;
      session.userRole = user.role;
      delete session.pendingUserId;

      return req.session.save((err) => {
        if (err) {
          console.error('Session upgrade error:', err);
          return res.status(500).json({ error: 'Session upgrade failed' });
        }
        return res.status(200).json({ verified: true });
      });
    }
    return res.status(200).json({ verified: false });
  } catch (err) {
    console.error('Check verification error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /verify-email
router.post('/verify-email', authLimiter, async (req: Request, res: Response) => {
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

    // ── Auto-login the user ──────────────────────────────────────────────
    const session = req.session as any;
    session.userId = user.id;
    session.userName = user.name;
    session.userRole = user.role;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error on verify:', err);
        return res.status(500).json({ error: 'Server error during session save.' });
      }
      res.status(200).json({ message: 'Email verified successfully! You are now logged in.' });
    });
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
      const session = req.session as any;
      session.pendingUserId = user.id;
      return req.session.save(() => {
        res.status(403).json({
          error: 'Please verify your email address before logging in.',
          requiresVerification: true
        });
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
      // Google users are auto-verified — set session immediately
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