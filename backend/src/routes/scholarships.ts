import { Request, Response } from 'express';
import Scholarship from '../models/Scholarship';
import { generateInfoCheck } from '../utils/infoCheck';
import { parseId } from '../utils/params';

const router = require('express').Router();

router.get('/', async (_req: Request, res: Response) => {
  const scholarships = await Scholarship.getAll();
  res.json(scholarships.map(s => ({ ...s, infoCheck: generateInfoCheck(s) })));
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Scholarship id must be a positive integer.' });
  }

  const scholarship = await Scholarship.getById(id);
  if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });

  res.json({
    title: scholarship.title,
    scholarship,
    infoCheck: generateInfoCheck(scholarship)
  });
});

// Saving lives in routes/saved.ts (`POST /saved/scholarship/:id`), which covers
// majors, careers and universities too.

module.exports = router;
