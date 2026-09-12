import { Request, Response } from 'express';
import SavedItem, { isSavedItemType } from '../models/SavedItem';
import { isAuthenticated } from '../middleware/auth';
import { parseId } from '../utils/params';

const router = require('express').Router();

/** Everything the signed-in student has saved, newest first. */
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  const session = req.session as any;
  const items = await SavedItem.listForUser(session.userId);
  res.json(items);
});

/**
 * Save one item. Idempotent: saving twice keeps a single row and still
 * answers 201, so the client never has to check first.
 */
router.post('/:type/:id', isAuthenticated, async (req: Request, res: Response) => {
  const { type } = req.params;
  const id = parseId(req.params.id);

  if (!isSavedItemType(type)) {
    return res.status(400).json({ error: 'Unknown item type.' });
  }
  if (id === null) {
    return res.status(400).json({ error: 'Item id must be a positive integer.' });
  }
  if (!(await SavedItem.targetExists(type, id))) {
    return res.status(404).json({ error: `No ${type} with that id.` });
  }

  const session = req.session as any;
  await SavedItem.save(session.userId, type, id);

  res.status(201).json({ message: 'Saved' });
});

/** Remove one item. Answers 204 whether or not it was saved. */
router.delete('/:type/:id', isAuthenticated, async (req: Request, res: Response) => {
  const { type } = req.params;
  const id = parseId(req.params.id);

  if (!isSavedItemType(type)) {
    return res.status(400).json({ error: 'Unknown item type.' });
  }
  if (id === null) {
    return res.status(400).json({ error: 'Item id must be a positive integer.' });
  }

  const session = req.session as any;
  await SavedItem.remove(session.userId, type, id);

  res.status(204).end();
});

module.exports = router;
