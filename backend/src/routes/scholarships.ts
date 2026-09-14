import { Request, Response } from 'express';
import Scholarship from '../models/Scholarship';
import { isAdmin } from '../middleware/admin';
import { generateInfoCheck } from '../utils/infoCheck';
import { parseId } from '../utils/params';
import { parseAdminScholarship } from '../utils/scholarshipInput';

const router = require('express').Router();

router.get('/', async (_req: Request, res: Response) => {
  const scholarships = await Scholarship.getAll();
  res.json(scholarships.map(s => ({ ...s, infoCheck: generateInfoCheck(s) })));
});

/**
 * An admin adds a listing. Kept across re-seeds (`origin = 'admin'`). A link
 * that fails the offline checks is still accepted — the warnings are returned
 * in `infoCheck`, and students see them too. Admins only.
 */
router.post('/', isAdmin, async (req: Request, res: Response) => {
  const parsed = parseAdminScholarship(req.body);
  if ('error' in parsed) return res.status(400).json({ error: parsed.error });

  if (await Scholarship.getByTitle(parsed.value.title)) {
    return res.status(409).json({ error: 'A scholarship with this title already exists.' });
  }

  const session = req.session as any;
  try {
    const scholarship = await Scholarship.addByAdmin(parsed.value, session.userId);
    res.status(201).json({ scholarship, infoCheck: generateInfoCheck(scholarship) });
  } catch (err: any) {
    // Two admins adding the same title at once: the unique index decides.
    if (err?.code === '23505') {
      return res.status(409).json({ error: 'A scholarship with this title already exists.' });
    }
    throw err;
  }
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

/**
 * An admin has checked this listing against the provider's own page. Stamps
 * `last_verified`, which students see as "Last verified" (MVP #8). Admins only.
 */
router.post('/:id/verify', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Scholarship id must be a positive integer.' });
  }

  const session = req.session as any;
  const scholarship = await Scholarship.markVerified(id, session.userId);
  if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });

  res.json({ scholarship, infoCheck: generateInfoCheck(scholarship) });
});

/**
 * An admin takes a listing down. Students' saves of it are removed, and an
 * imported listing stays gone across re-seeds. Admins only.
 */
router.delete('/:id', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Scholarship id must be a positive integer.' });
  }

  const session = req.session as any;
  const removed = await Scholarship.remove(id, session.userId);
  if (!removed) return res.status(404).json({ error: 'Scholarship not found' });

  res.status(204).end();
});

// Saving lives in routes/saved.ts (`POST /saved/scholarship/:id`), which covers
// majors, careers and universities too.

module.exports = router;
