import { Request, Response } from 'express';
import Career from '../models/Career';

const router = require('express').Router();

router.get('/', async (req: Request, res: Response) => {
  // Use the getAll method from your PostgreSQL Career model
  const careers = await Career.getAll();
  // Changed from res.render to res.json (sends data to Next.js frontend)
  res.json(careers);
});

module.exports = router;