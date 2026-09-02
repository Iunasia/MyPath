import { Request, Response } from 'express';
import University from '../models/University';

const router = require('express').Router();

router.get('/', async (req: Request, res: Response) => {
  // Use the getAll method from your PostgreSQL University model
  const universities = await University.getAll();
  // Changed to res.json
  res.json(universities);
});

module.exports = router;