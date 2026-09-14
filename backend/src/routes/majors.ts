import { Request, Response } from 'express';
import Major from '../models/Major';
import ContentAudit from '../models/ContentAudit';
import { isAdmin } from '../middleware/admin';
import { parseId } from '../utils/params';
import { parseMajorWrite } from '../utils/majorInput';
import { actorOf, diff, isUniqueViolation, reasonOf, toCsv, wantsArchived } from '../utils/adminWrite';

const router = require('express').Router();

const CSV_COLUMNS = [
  'id',
  'name',
  'field',
  'description',
  'duration',
  'degree_type',
  'subjects',
  'personality_fit',
  'job_market_demand',
  'related_careers',
  'universities',
  'related_scholarships',
  'source',
  'source_url',
  'archived_at',
  'edited_at'
] as const;

router.get('/', async (req: Request, res: Response) => {
  const includeArchived = await wantsArchived(req);
  res.json(await Major.getAll({ includeArchived }));
});

router.get('/export', isAdmin, async (req: Request, res: Response) => {
  const includeArchived = req.query.includeArchived === '1';
  const majors = await Major.getAll({ includeArchived });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="majors.csv"');
  res.send(toCsv(CSV_COLUMNS, majors as unknown as Record<string, unknown>[]));
});

router.post('/', isAdmin, async (req: Request, res: Response) => {
  const { fields, errors } = parseMajorWrite(req.body, { partial: false });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: Object.values(errors)[0], fields: errors });
  }

  try {
    const major = await Major.create(fields as never, actorOf(req));
    await ContentAudit.record({
      entity: 'major',
      row_id: major.id,
      action: 'create',
      actor_id: actorOf(req),
      changes: { name: major.name }
    });
    res.status(201).json({ major });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: 'A major with that name already exists.' });
    }
    throw err;
  }
});

router.patch('/:id', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Major id must be a positive integer.' });

  const before = await Major.getById(id);
  if (!before) return res.status(404).json({ error: 'Major not found' });

  const { fields, errors } = parseMajorWrite(req.body, { partial: true });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: Object.values(errors)[0], fields: errors });
  }
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Send at least one field to change.' });
  }

  const changes = diff(before as unknown as Record<string, unknown>, fields);

  let updated;
  try {
    updated = await Major.update(id, fields, actorOf(req));
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: 'A major with that name already exists.' });
    }
    throw err;
  }
  if (!updated) return res.status(404).json({ error: 'Major not found' });

  await ContentAudit.record({
    entity: 'major',
    row_id: id,
    action: 'update',
    actor_id: actorOf(req),
    changes
  });

  res.json({ major: updated });
});

router.post('/:id/archive', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Major id must be a positive integer.' });

  const major = await Major.archive(id, actorOf(req));
  if (!major) return res.status(404).json({ error: 'Major not found' });

  await ContentAudit.record({
    entity: 'major',
    row_id: id,
    action: 'archive',
    actor_id: actorOf(req),
    reason: reasonOf(req)
  });

  res.json({ major });
});

router.post('/:id/restore', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Major id must be a positive integer.' });

  const major = await Major.restore(id);
  if (!major) return res.status(404).json({ error: 'Major not found' });

  await ContentAudit.record({
    entity: 'major',
    row_id: id,
    action: 'restore',
    actor_id: actorOf(req),
    reason: reasonOf(req)
  });

  res.json({ major });
});

router.get('/:id/history', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Major id must be a positive integer.' });

  const major = await Major.getById(id);
  if (!major) return res.status(404).json({ error: 'Major not found' });

  res.json(await ContentAudit.listFor('major', id));
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Major id must be a positive integer.' });

  const major = await Major.getById(id);
  if (!major || major.archived_at) return res.status(404).json({ error: 'Major not found' });

  res.json(major);
});

module.exports = router;
