import { Request, Response } from 'express';
import University from '../models/University';
import Scholarship from '../models/Scholarship';
import User from '../models/User';
import { isAuthenticated } from '../middleware/auth';

const router = require('express').Router();

router.get('/', async (req: Request, res: Response) => {
  // Use getAll() and calculate the length for the counts
  const [universities, scholarships] = await Promise.all([
    University.getAll(),
    Scholarship.getAll()
  ]);

  // CHANGED to res.json() - sends data to your Next.js frontend
  res.json({ 
    title: 'MyPath — Home', 
    scholarshipCount: scholarships.length, 
    universityCount: universities.length 
  });
});

router.get('/dashboard', isAuthenticated, async (req: Request, res: Response) => {
  // Access session safely
  const session = req.session as any;
  const userId = session.userId;

  // Get user info (returns safe user without password)
  const user = await User.findById(userId);
  
  // Get the user's saved scholarships using the dedicated method
  const saved = await Scholarship.getSavedByUser(userId);

  // CHANGED to res.json() - sends data to your Next.js frontend
  res.json({ title: 'My Dashboard', user, saved });
});

module.exports = router;