import { Request, Response } from 'express';
import Career from '../models/Career';
import { parseId } from '../utils/params';

const router = require('express').Router();

router.get('/', async (_req: Request, res: Response) => {
  const careers = await Career.getAll();
  res.json(careers);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Career id must be a positive integer.' });

  const career = await Career.getById(id);
  if (!career) return res.status(404).json({ error: 'Career not found' });

  res.json(career);
});

module.exports = router;
