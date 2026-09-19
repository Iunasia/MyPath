import { Request, Response } from 'express';
import crypto from 'crypto';
import passport from 'passport';
import pool from '../config/db';
import multer from 'multer';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import EmailVerification from '../models/EmailVerification';
import { sendVerificationEmail } from '../utils/email';
import { isAuthenticated, isGuest, getAuthUserId } from '../middleware/auth';

const router = require('express').Router();
const { authLimiter } = require('../../middleware/security');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  // Vercel's serverless functions enforce a hard 4.5MB request body limit;
  // this leaves headroom for multipart overhead and headers.
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_AVATAR_TYPES.includes(file.mimetype)) {
      return cb(new Error('UNSUPPORTED_TYPE'));
    }
    cb(null, true);
  },
});

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
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const magicLinkUrl = `${baseUrl}/auth/magic-verify/${uuidToken}`;
    await sendVerificationEmail(user.email, code, magicLinkUrl, locale);
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

// GET /magic-verify/:token (Magic Link Click Handler)
router.get('/magic-verify/:token', async (req: Request, res: Response) => {
  try {
    const token = req.params.token as string;
    const userId = await EmailVerification.findByToken(token);
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://domner.app';

    if (!userId) {
      // Invalid or expired token
      return res.redirect(`${frontendUrl}/verify?error=invalid_magic_link`);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(`${frontendUrl}/verify?error=user_not_found`);
    }

    if (!user.is_verified) {
      await User.markAsVerified(userId);
    }

    await EmailVerification.deleteByUserId(userId);

    // Set session so they are logged in on the device they clicked the link from
    const session = req.session as any;
    session.userId = user.id;
    session.userName = user.name;
    session.userRole = user.role;

    req.session.save((err) => {
      if (err) console.error('Session save error on magic verify:', err);
      res.redirect(`${frontendUrl}/?verified=true`);
    });
  } catch (err) {
    console.error('Magic link verification error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'https://domner.app';
    res.redirect(`${frontendUrl}/verify?error=server_error`);
  }
});

// POST /resend-verification
router.post('/resend-verification', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.is_verified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const uuidToken = crypto.randomUUID();
    await EmailVerification.create(user.id, code, uuidToken);
    
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const magicLinkUrl = `${baseUrl}/auth/magic-verify/${uuidToken}`;
    
    const locale = req.cookies?.NEXT_LOCALE || 'en';
    await sendVerificationEmail(user.email, code, magicLinkUrl, locale);

    res.status(200).json({ message: 'Verification code resent successfully.' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Server error while resending verification code.' });
  }
});

// GET /login
router.get('/login', isGuest, (_req: Request, res: Response) => {
  res.json({ message: 'Login form endpoint' });
});

// POST /login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findByEmail(email);

    if (!user || !user.password || !(await User.comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 🚨 BLOCK UNVERIFIED USERS (Only admin bypasses verification)
    if (user.role !== 'admin' && !user.is_verified) {
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
    if (session.passport) {
      delete session.passport;
    }
    session.userId = user.id;
    session.userName = user.name;
    session.userRole = user.role;

    const { password: _passwordHash, ...safeUser } = user;
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Session save error on login:', saveErr);
        return res.status(500).json({ error: 'Server error saving session.' });
      }
      res.status(200).json({ message: 'Login successful', user: safeUser });
    });
  } catch (err) {
    res.status(500).json({ error: 'Login error.' });
  }
});

// GET /me - Check current session
router.get('/me', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const session = req.session as any;
  if (session && !session.userId) session.userId = userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      session?.destroy?.(() => {});
      return res.status(401).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /me - Update the logged-in user's profile fields
router.patch('/me', isAuthenticated, async (req: Request, res: Response) => {
  const userId = getAuthUserId(req)!;
  const session = req.session as any;
  const { name, bio, location, website, date_of_birth, gender } = req.body;

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  const trimmedName = name.trim();
  if (trimmedName.length > 100) {
    return res.status(400).json({ error: 'Name must be 100 characters or fewer.' });
  }

  if (bio !== undefined && typeof bio !== 'string') {
    return res.status(400).json({ error: 'Bio must be text.' });
  }
  const trimmedBio = typeof bio === 'string' ? bio.trim() : '';
  if (trimmedBio.length > 500) {
    return res.status(400).json({ error: 'Bio must be 500 characters or fewer.' });
  }

  if (location !== undefined && typeof location !== 'string') {
    return res.status(400).json({ error: 'Location must be text.' });
  }
  const trimmedLocation = typeof location === 'string' ? location.trim() : '';
  if (trimmedLocation.length > 100) {
    return res.status(400).json({ error: 'Location must be 100 characters or fewer.' });
  }

  if (website !== undefined && typeof website !== 'string') {
    return res.status(400).json({ error: 'Website must be text.' });
  }
  const trimmedWebsite = typeof website === 'string' ? website.trim() : '';
  if (trimmedWebsite.length > 200) {
    return res.status(400).json({ error: 'Website must be 200 characters or fewer.' });
  }
  if (trimmedWebsite) {
    try {
      const parsed = new URL(trimmedWebsite);
      if (!parsed.protocol.startsWith('http')) throw new Error('bad protocol');
    } catch {
      return res.status(400).json({ error: 'Enter a full website URL starting with https://' });
    }
  }

  if (date_of_birth !== undefined && typeof date_of_birth !== 'string') {
    return res.status(400).json({ error: 'Date of birth must be text.' });
  }
  const trimmedDob = typeof date_of_birth === 'string' ? date_of_birth.trim() : '';
  if (trimmedDob) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDob) || Number.isNaN(Date.parse(trimmedDob))) {
      return res.status(400).json({ error: 'Enter a valid date of birth.' });
    }
    if (Date.parse(trimmedDob) > Date.now()) {
      return res.status(400).json({ error: 'Date of birth cannot be in the future.' });
    }
  }

  if (gender !== undefined && typeof gender !== 'string') {
    return res.status(400).json({ error: 'Gender must be text.' });
  }
  const trimmedGender = typeof gender === 'string' ? gender.trim() : '';
  if (trimmedGender && !ALLOWED_GENDERS.includes(trimmedGender)) {
    return res.status(400).json({ error: 'Invalid gender value.' });
  }

  try {
    const user = await User.updateProfile(userId, {
      name: trimmedName,
      bio: trimmedBio || null,
      location: trimmedLocation || null,
      website: trimmedWebsite || null,
      date_of_birth: trimmedDob || null,
      gender: trimmedGender || null,
    });
    if (!user) {
      session?.destroy?.(() => {});
      return res.status(401).json({ error: 'User not found' });
    }
    if (session) session.userName = user.name;
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /me/password - Change the logged-in user's password
router.patch('/me/password', authLimiter, isAuthenticated, async (req: Request, res: Response) => {
  const userId = getAuthUserId(req)!;
  const { currentPassword, newPassword } = req.body;

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  try {
    const user = await User.findAuthById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (!user.password) {
      return res.status(400).json({ error: "This account doesn't have a password. Sign in with Google instead." });
    }
    const matches = await User.comparePassword(currentPassword, user.password);
    if (!matches) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await User.updatePassword(userId, hashed);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /me/avatar - Upload or replace the logged-in user's avatar
router.patch(
  '/me/avatar',
  isAuthenticated,
  (req: Request, res: Response, next: any) => {
    avatarUpload.single('avatar')(req, res, (err: any) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image must be 3MB or smaller.' });
      }
      if (err) {
        return res.status(400).json({ error: 'Unsupported image type. Use JPEG, PNG, or WebP.' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    const userId = getAuthUserId(req)!;
    const session = req.session as any;
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    try {
      const resized = await sharp(file.buffer)
        .rotate()
        .resize(256, 256, { fit: 'cover' })
        .jpeg({ quality: 82 })
        .toBuffer();

      const user = await User.updateAvatar(userId, resized, 'image/jpeg');
      if (!user) {
        session?.destroy?.(() => {});
        return res.status(401).json({ error: 'User not found' });
      }
      res.status(200).json({ message: 'Avatar updated successfully', user });
    } catch (err) {
      res.status(400).json({ error: 'Could not process image. Please try a different file.' });
    }
  }
);

// DELETE /me/avatar - Remove the logged-in user's uploaded avatar
router.delete('/me/avatar', isAuthenticated, async (req: Request, res: Response) => {
  const userId = getAuthUserId(req)!;
  const session = req.session as any;
  try {
    const user = await User.removeAvatar(userId);
    if (!user) {
      session?.destroy?.(() => {});
      return res.status(401).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'Avatar removed successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /avatar/:id - Public avatar image (no auth) with conditional-GET support
router.get('/avatar/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid user id.' });
  }

  try {
    const avatar = await User.getAvatarById(id);
    if (!avatar) {
      return res.status(404).json({ error: 'No avatar for this user.' });
    }

    const etag = `"${new Date(avatar.avatar_updated_at).getTime()}"`;
    res.set('Cache-Control', 'public, max-age=86400, must-revalidate');
    res.set('ETag', etag);

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.set('Content-Type', avatar.avatar_mime);
    res.status(200).send(avatar.avatar_data);
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
  async (req: Request, res: Response) => {
    const user = (req.user as any);
    if (user) {
      // 🚨 BLOCK UNVERIFIED GOOGLE USERS (Admins bypass verification)
      if (user.role !== 'admin' && !user.is_verified) {
        try {
          // Generate 6-digit OTP code and send via email
          const code = crypto.randomInt(100000, 999999).toString();
          const uuidToken = crypto.randomUUID();
          await EmailVerification.create(user.id, code, uuidToken);
          const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
          const magicLinkUrl = `${baseUrl}/auth/magic-verify/${uuidToken}`;
          await sendVerificationEmail(user.email, code, magicLinkUrl);
        } catch (emailErr) {
          console.error('Failed to send verification email for Google user:', emailErr);
        }

        // Clean up temporary passport session so unverified users cannot bypass auth
        if (req.session) {
          req.session.destroy(() => {});
        }
        return res.redirect(`${FRONTEND_URL}/auth/verify?email=${encodeURIComponent(user.email)}`);
      }
      const session = req.session as any;
      if (session.passport) {
        delete session.passport;
      }
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