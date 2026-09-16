import { Request, Response } from 'express';
import SavedItem, { isSavedItemType } from '../models/SavedItem';
import { isAuthenticated, getAuthUserId } from '../middleware/auth';
import { parseId } from '../utils/params';

const router = require('express').Router();

/** Everything the signed-in student has saved, newest first. */
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  const userId = getAuthUserId(req)!;
  const items = await SavedItem.listForUser(userId);
  res.json(items);
});

/**
 * Save one item. Idempotent: saving twice keeps a single row and still
 * answers 201, so the client never has to check first.
 * Accepts numeric id or slug/identifier (e.g. "cadt" for university).
 */
router.post('/:type/:id', isAuthenticated, async (req: Request, res: Response) => {
  const { type } = req.params;

  if (!isSavedItemType(type)) {
    return res.status(400).json({ error: 'Unknown item type.' });
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const target = await SavedItem.resolveTarget(type, rawId);
  if (!target) {
    return res.status(404).json({ error: `No ${type} with that id.` });
  }

  const userId = getAuthUserId(req)!;
  await SavedItem.save(userId, type, target.id);

  res.status(201).json({ message: 'Saved', itemId: target.id, slug: target.slug });
});

/** Remove one item. Answers 204 whether or not it was saved. */
router.delete('/:type/:id', isAuthenticated, async (req: Request, res: Response) => {
  const { type } = req.params;

  if (!isSavedItemType(type)) {
    return res.status(400).json({ error: 'Unknown item type.' });
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const target = await SavedItem.resolveTarget(type, rawId);
  if (target) {
    const userId = getAuthUserId(req)!;
    await SavedItem.remove(userId, type, target.id);
  }

  res.status(204).end();
});

module.exports = router;
