import { Request, Response } from 'express';
import Scholarship from '../models/Scholarship';
import University from '../models/University';
import Major from '../models/Major';
import Career from '../models/Career';
import { buildComparison, CompareType, isCompareType, MAX_ITEMS, MIN_ITEMS } from '../utils/compare';
import { parseId } from '../utils/params';

const router = require('express').Router();

const LOADERS: Record<CompareType, (ids: number[]) => Promise<object[]>> = {
  scholarship: Scholarship.getByIds,
  university: University.getByIds,
  major: Major.getByIds,
  career: Career.getByIds
};

/**
 * Side-by-side comparison of 2–4 items of one type:
 *   GET /compare?type=scholarship&ids=3,7,12
 *
 * Public, like the rest of the catalogue — comparing is free for students.
 * Items come back in the order the ids were given, so the columns stay where
 * the student put them.
 */
router.get('/', async (req: Request, res: Response) => {
  const { type } = req.query;
  if (!isCompareType(type)) {
    return res.status(400).json({ error: 'type must be scholarship, university, major or career.' });
  }

  // Accept ?ids=3,7 and ?ids=3&ids=7 alike.
  const raw = ([] as unknown[])
    .concat(req.query.ids ?? [])
    .filter((value): value is string => typeof value === 'string')
    .join(',');
  const ids = raw
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => parseId(part));

  if (ids.length === 0) {
    return res.status(400).json({ error: 'Send the ids to compare, e.g. ?ids=3,7.' });
  }
  if (ids.some(id => id === null)) {
    return res.status(400).json({ error: 'Every id must be a positive integer.' });
  }

  const unique = [...new Set(ids as number[])];
  if (unique.length < MIN_ITEMS || unique.length > MAX_ITEMS) {
    return res
      .status(400)
      .json({ error: `Compare between ${MIN_ITEMS} and ${MAX_ITEMS} different items.` });
  }

  const records = await LOADERS[type](unique);
  const byId = new Map(records.map(record => [(record as { id: number }).id, record]));

  const missing = unique.filter(id => !byId.has(id));
  if (missing.length > 0) {
    return res.status(404).json({ error: `No ${type} with id ${missing.join(', ')}.`, missing });
  }

  res.json(buildComparison(type, unique.map(id => byId.get(id) as object)));
});

module.exports = router;
