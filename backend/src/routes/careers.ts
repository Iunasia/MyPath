import { Request, Response } from 'express';
import Career from '../models/Career';
import ContentAudit from '../models/ContentAudit';
import { isAdmin } from '../middleware/admin';
import { parseId } from '../utils/params';
import { parseCareerWrite } from '../utils/careerInput';
import { actorOf, diff, isUniqueViolation, reasonOf, toCsv, wantsArchived } from '../utils/adminWrite';

const router = require('express').Router();

const CSV_COLUMNS = [
  'id',
  'title',
  'category',
  'description',
  'responsibilities',
  'average_salary',
  'growth_outlook',
  'education_required',
  'personality_fit',
  'required_skills',
  'related_majors',
  'source',
  'source_url',
  'archived_at',
  'edited_at'
] as const;

router.get('/', async (req: Request, res: Response) => {
  const includeArchived = await wantsArchived(req);
  res.json(await Career.getAll({ includeArchived }));
});

/** Spreadsheet-shaped export. Declared before `/:id` so the literal path wins. */
router.get('/export', isAdmin, async (req: Request, res: Response) => {
  const includeArchived = req.query.includeArchived === '1';
  const careers = await Career.getAll({ includeArchived });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="careers.csv"');
  res.send(toCsv(CSV_COLUMNS, careers as unknown as Record<string, unknown>[]));
});

router.post('/', isAdmin, async (req: Request, res: Response) => {
  const { fields, errors } = parseCareerWrite(req.body, { partial: false });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: Object.values(errors)[0], fields: errors });
  }

  try {
    const career = await Career.create(fields as never, actorOf(req));
    await ContentAudit.record({
      entity: 'career',
      row_id: career.id,
      action: 'create',
      actor_id: actorOf(req),
      changes: { title: career.title }
    });
    res.status(201).json({ career });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: 'A career with that title already exists.' });
    }
    throw err;
  }
});

router.patch('/:id', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Career id must be a positive integer.' });

  const before = await Career.getById(id);
  if (!before) return res.status(404).json({ error: 'Career not found' });

  const { fields, errors } = parseCareerWrite(req.body, { partial: true });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: Object.values(errors)[0], fields: errors });
  }
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Send at least one field to change.' });
  }

  const changes = diff(before as unknown as Record<string, unknown>, fields);

  let updated;
  try {
    updated = await Career.update(id, fields, actorOf(req));
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: 'A career with that title already exists.' });
    }
    throw err;
  }
  if (!updated) return res.status(404).json({ error: 'Career not found' });

  await ContentAudit.record({
    entity: 'career',
    row_id: id,
    action: 'update',
    actor_id: actorOf(req),
    changes
  });

  res.json({ career: updated });
});

router.post('/:id/archive', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Career id must be a positive integer.' });

  const career = await Career.archive(id, actorOf(req));
  if (!career) return res.status(404).json({ error: 'Career not found' });

  await ContentAudit.record({
    entity: 'career',
    row_id: id,
    action: 'archive',
    actor_id: actorOf(req),
    reason: reasonOf(req)
  });

  res.json({ career });
});

router.post('/:id/restore', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Career id must be a positive integer.' });

  const career = await Career.restore(id);
  if (!career) return res.status(404).json({ error: 'Career not found' });

  await ContentAudit.record({
    entity: 'career',
    row_id: id,
    action: 'restore',
    actor_id: actorOf(req),
    reason: reasonOf(req)
  });

  res.json({ career });
});

router.get('/:id/history', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Career id must be a positive integer.' });

  const career = await Career.getById(id);
  if (!career) return res.status(404).json({ error: 'Career not found' });

  res.json(await ContentAudit.listFor('career', id));
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Career id must be a positive integer.' });

  const career = await Career.getById(id);
  if (!career || career.archived_at) return res.status(404).json({ error: 'Career not found' });

  res.json(career);
});

module.exports = router;
