import { Request, Response } from 'express';
import Major from '../models/Major';

const router = require('express').Router();

router.get('/', async (req: Request, res: Response) => {
  // Use the getAll method from your PostgreSQL Major model
  const majors = await Major.getAll();
  // Changed from res.render to res.json (sends data to Next.js frontend)
  res.json(majors);
});

module.exports = router;