import { Request, Response } from 'express';
import University from '../models/University';
import { parseId } from '../utils/params';

const router = require('express').Router();

router.get('/', async (_req: Request, res: Response) => {
  const universities = await University.getAll();
  res.json(universities);
});

/**
 * Accepts either the numeric id or the slug ("cadt"), so the frontend's
 * existing /universities/cadt links keep working.
 */
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  const raw = req.params.idOrSlug;
  if (typeof raw !== 'string' || !raw.trim()) {
    return res.status(400).json({ error: 'A university id or slug is required.' });
  }

  const id = parseId(raw);
  const university = id === null ? await University.getBySlug(raw) : await University.getById(id);

  if (!university) return res.status(404).json({ error: 'University not found' });

  res.json(university);
});

module.exports = router;
