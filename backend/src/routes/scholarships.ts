import { Request, Response } from 'express';
import Scholarship from '../models/Scholarship';
import User from '../models/User';
import { isAuthenticated } from '../middleware/auth';
import { generateInfoCheck } from '../utils/infoCheck';

const router = require('express').Router();

router.get('/', async (req: Request, res: Response) => {
  const scholarships = await Scholarship.getAll();
  const scholarshipsWithCheck = scholarships.map(s => ({
    ...s,
    infoCheck: generateInfoCheck(s)
  }));
  // Changed to res.json
  res.json(scholarshipsWithCheck);
});

router.get('/:id', async (req: Request, res: Response) => {
  const scholarship = await Scholarship.getById(Number(req.params.id));
  if (!scholarship) return res.status(404).json({ error: 'Not Found' });
  const infoCheck = generateInfoCheck(scholarship);
  // Changed to res.json
  res.json({ title: scholarship.title, scholarship, infoCheck });
});

router.post('/:id/save', isAuthenticated, async (req: Request, res: Response) => {
  const session = req.session as any;
  const userId = session.userId;
  const scholarshipId = Number(req.params.id);

  // Replaced Mongoose .push() and .save() with your PostgreSQL saveForUser method
  await Scholarship.saveForUser(userId, scholarshipId);
  
  // Changed from res.redirect to res.json (Frontend will handle the redirect)
  res.status(201).json({ message: 'Scholarship saved successfully' });
});

module.exports = router;