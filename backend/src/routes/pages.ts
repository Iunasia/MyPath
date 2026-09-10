import { Request, Response } from 'express';
import University from '../models/University';
import Scholarship from '../models/Scholarship';

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

// The old GET /dashboard (user + saved scholarships) was removed: the frontend
// gets the user from GET /auth/me and the saved list from GET /saved.

module.exports = router;
