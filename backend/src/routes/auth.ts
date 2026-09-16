import { Request, Response } from 'express';
import passport from 'passport';
import multer from 'multer';
import sharp from 'sharp';
import User from '../models/User';
import { isAuthenticated, isGuest } from '../middleware/auth';

const router = require('express').Router();
const { authLimiter } = require('../../middleware/security');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

    // `role` is deliberately NOT read from the request body — accepting it
    // would let anyone register themselves as an admin. Roles are granted
    // server-side only.
    const user = await User.create({ name, email, password, role: 'student' });

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
router.post('/login', authLimiter, isGuest, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findByEmail(email);

    // One message for both "no such user" and "wrong password" — separate
    // wording would let an attacker enumerate registered accounts.
    if (!user || !user.password || !(await User.comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const session = req.session as any;
    session.userId = user.id;
    session.userName = user.name;
    session.userRole = user.role;

    // findByEmail returns the whole row, bcrypt hash included. Strip it before
    // it ever reaches the client.
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

// PATCH /me - Update the logged-in user's own name
router.patch('/me', isAuthenticated, async (req: Request, res: Response) => {
  const session = req.session as any;
  const { name } = req.body;

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  const trimmed = name.trim();
  if (trimmed.length > 100) {
    return res.status(400).json({ error: 'Name must be 100 characters or fewer.' });
  }

  try {
    const user = await User.updateName(session.userId, trimmed);
    if (!user) {
      session.destroy(() => {});
      return res.status(401).json({ error: 'User not found' });
    }
    session.userName = user.name;
    res.status(200).json({ message: 'Profile updated successfully', user });
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

      const user = await User.updateAvatar(session.userId, resized, 'image/jpeg');
      if (!user) {
        session.destroy(() => {});
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
  const session = req.session as any;
  try {
    const user = await User.removeAvatar(session.userId);
    if (!user) {
      session.destroy(() => {});
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
    // Also set session data for consistency with manual login
    const user = (req.user as any);
    if (user) {
      const session = req.session as any;
      session.userId = user.id;
      session.userName = user.name;
      session.userRole = user.role;
    }
    req.session.save((err) => {
      if (err) {
        console.error('Session save error on OAuth callback:', err);
      }
      res.redirect(FRONTEND_URL);
    });
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
