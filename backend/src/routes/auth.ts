import { Request, Response } from 'express';
import User from '../models/User';
import { isGuest } from '../middleware/auth';

const router = require('express').Router();

// GET /register - Frontend handles the form UI, backend just confirms endpoint
router.get('/register', isGuest, (req: Request, res: Response) => {
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

    // Changed from res.redirect to res.json
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(400).json({ error: 'Email already registered or error occurred.' });
  }
});

// GET /login
router.get('/login', isGuest, (req: Request, res: Response) => {
  res.json({ message: 'Login form endpoint' });
});

// POST /login
router.post('/login', isGuest, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    
    if (!user || !(await User.comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const session = req.session as any;
    session.userId = user.id;
    session.userName = user.name;
    session.userRole = user.role;

    // Changed from res.redirect to res.json
    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: 'Login error.' });
  }
});

// GET /logout (Logout is usually POST, but keeping GET to match your original)
router.get('/logout', (req: Request, res: Response) => {
  const session = req.session as any;
  session.destroy();
  // Changed from res.redirect to res.json
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;