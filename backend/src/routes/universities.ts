import { Request, Response } from 'express';
import University from '../models/University';
import ContentAudit from '../models/ContentAudit';
import { isAdmin } from '../middleware/admin';
import { parseId } from '../utils/params';
import { parseUniversityWrite } from '../utils/universityInput';
import { actorOf, diff, isUniqueViolation, reasonOf, toCsv, wantsArchived } from '../utils/adminWrite';

const router = require('express').Router();

const CSV_COLUMNS = [
  'id',
  'slug',
  'name',
  'short_name',
  'country',
  'city',
  'type',
  'ranking',
  'description',
  'website',
  'phone',
  'established',
  'student_count',
  'image_url',
  'tuition_range',
  'acceptance_rate',
  'programs',
  'scholarships',
  'source',
  'source_url',
  'archived_at',
  'edited_at'
] as const;

router.get('/', async (req: Request, res: Response) => {
  const includeArchived = await wantsArchived(req);
  res.json(await University.getAll({ includeArchived }));
});

router.get('/export', isAdmin, async (req: Request, res: Response) => {
  const includeArchived = req.query.includeArchived === '1';
  const universities = await University.getAll({ includeArchived });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="universities.csv"');
  res.send(toCsv(CSV_COLUMNS, universities as unknown as Record<string, unknown>[]));
});

router.post('/', isAdmin, async (req: Request, res: Response) => {
  const { fields, errors } = parseUniversityWrite(req.body, { partial: false });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: Object.values(errors)[0], fields: errors });
  }

  // Friendly messages before the database's unique indexes raise 23505.
  if (typeof fields.slug === 'string') {
    const taken = await University.getBySlug(fields.slug);
    if (taken) return res.status(409).json({ error: `The slug "${fields.slug}" is already in use.` });
  }

  try {
    const university = await University.create(fields as never, actorOf(req));
    await ContentAudit.record({
      entity: 'university',
      row_id: university.id,
      action: 'create',
      actor_id: actorOf(req),
      changes: { name: university.name }
    });
    res.status(201).json({ university });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: 'A university with that name or slug already exists.' });
    }
    throw err;
  }
});

router.patch('/:id', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'University id must be a positive integer.' });

  const before = await University.getById(id);
  if (!before) return res.status(404).json({ error: 'University not found' });

  const { fields, errors } = parseUniversityWrite(req.body, { partial: true });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: Object.values(errors)[0], fields: errors });
  }
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Send at least one field to change.' });
  }

  if (typeof fields.slug === 'string' && fields.slug !== before.slug) {
    const taken = await University.getBySlug(fields.slug);
    if (taken && taken.id !== id) {
      return res.status(409).json({ error: `The slug "${fields.slug}" is already in use.` });
    }
  }

  const changes = diff(before as unknown as Record<string, unknown>, fields);

  let updated;
  try {
    updated = await University.update(id, fields, actorOf(req));
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: 'A university with that name or slug already exists.' });
    }
    throw err;
  }
  if (!updated) return res.status(404).json({ error: 'University not found' });

  await ContentAudit.record({
    entity: 'university',
    row_id: id,
    action: 'update',
    actor_id: actorOf(req),
    changes
  });

  res.json({ university: updated });
});

router.post('/:id/archive', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'University id must be a positive integer.' });

  const university = await University.archive(id, actorOf(req));
  if (!university) return res.status(404).json({ error: 'University not found' });

  await ContentAudit.record({
    entity: 'university',
    row_id: id,
    action: 'archive',
    actor_id: actorOf(req),
    reason: reasonOf(req)
  });

  res.json({ university });
});

router.post('/:id/restore', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'University id must be a positive integer.' });

  const university = await University.restore(id);
  if (!university) return res.status(404).json({ error: 'University not found' });

  await ContentAudit.record({
    entity: 'university',
    row_id: id,
    action: 'restore',
    actor_id: actorOf(req),
    reason: reasonOf(req)
  });

  res.json({ university });
});

router.get('/:id/history', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'University id must be a positive integer.' });

  const university = await University.getById(id);
  if (!university) return res.status(404).json({ error: 'University not found' });

  res.json(await ContentAudit.listFor('university', id));
});

/**
 * Accepts either the numeric id or the slug ("cadt"), so the frontend's
 * existing /universities/cadt links keep working. Archived rows 404.
 */
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  const raw = req.params.idOrSlug;
  if (typeof raw !== 'string' || !raw.trim()) {
    return res.status(400).json({ error: 'A university id or slug is required.' });
  }

  const id = parseId(raw);
  const university = id === null ? await University.getBySlug(raw) : await University.getById(id);

  if (!university || university.archived_at) {
    return res.status(404).json({ error: 'University not found' });
  }

  res.json(university);
});

module.exports = router;
