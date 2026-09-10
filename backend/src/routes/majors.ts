import { Request, Response } from 'express';
import Major from '../models/Major';
import { parseId } from '../utils/params';

const router = require('express').Router();

router.get('/', async (_req: Request, res: Response) => {
  const majors = await Major.getAll();
  res.json(majors);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Major id must be a positive integer.' });

  const major = await Major.getById(id);
  if (!major) return res.status(404).json({ error: 'Major not found' });

  res.json(major);
});

module.exports = router;
