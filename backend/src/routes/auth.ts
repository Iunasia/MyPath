import { Request, Response } from 'express';
import passport from 'passport';
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