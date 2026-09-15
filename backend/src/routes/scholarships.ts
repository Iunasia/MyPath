import { Request, Response } from 'express';
import Scholarship from '../models/Scholarship';
import ContentAudit from '../models/ContentAudit';
import { isAdmin } from '../middleware/admin';
import { generateInfoCheck } from '../utils/infoCheck';
import { parseId } from '../utils/params';
import { parseScholarshipWrite } from '../utils/scholarshipInput';
import { actorOf, diff, isUniqueViolation, reasonOf, toCsv, wantsArchived } from '../utils/adminWrite';

const router = require('express').Router();

const CSV_COLUMNS = [
  'id',
  'title',
  'provider',
  'provider_type',
  'description',
  'amount',
  'coverage',
  'eligibility',
  'degree_level',
  'field_of_study',
  'documents',
  'application_process',
  'deadline',
  'deadline_note',
  'application_link',
  'image_url',
  'country',
  'opportunity_type',
  'source',
  'source_url',
  'source_type',
  'verified_status',
  'safety_warnings',
  'last_verified',
  'archived_at',
  'edited_at'
] as const;

router.get('/', async (req: Request, res: Response) => {
  const includeArchived = await wantsArchived(req);
  const scholarships = await Scholarship.getAll({ includeArchived });
  res.json(scholarships.map(s => ({ ...s, infoCheck: generateInfoCheck(s) })));
});

/**
 * A spreadsheet-shaped export of the catalogue, so the data can still be
 * edited in bulk. Declared before `/:id` so the literal path wins the match.
 */
router.get('/export', isAdmin, async (req: Request, res: Response) => {
  const includeArchived = req.query.includeArchived === '1';
  const scholarships = await Scholarship.getAll({ includeArchived });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="scholarships.csv"');
  res.send(toCsv(CSV_COLUMNS, scholarships as unknown as Record<string, unknown>[]));
});

/** Create a listing by hand — the intake path for an opportunity found in the queue. */
router.post('/', isAdmin, async (req: Request, res: Response) => {
  const { fields, errors } = parseScholarshipWrite(req.body, { partial: false });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: Object.values(errors)[0], fields: errors });
  }

  try {
    const scholarship = await Scholarship.create(fields as never, actorOf(req));
    await ContentAudit.record({
      entity: 'scholarship',
      row_id: scholarship.id,
      action: 'create',
      actor_id: actorOf(req),
      changes: { title: scholarship.title }
    });
    res.status(201).json({ scholarship, infoCheck: generateInfoCheck(scholarship) });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: 'A scholarship with that title already exists.' });
    }
    throw err;
  }
});

/** Edit the fields that make a listing accurate: dates, links, provider, award. */
router.patch('/:id', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Scholarship id must be a positive integer.' });
  }

  const before = await Scholarship.getById(id);
  if (!before) return res.status(404).json({ error: 'Scholarship not found' });

  const { fields, errors } = parseScholarshipWrite(req.body, { partial: true });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: Object.values(errors)[0], fields: errors });
  }
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Send at least one field to change.' });
  }

  const changes = diff(before as unknown as Record<string, unknown>, fields);

  let updated;
  try {
    updated = await Scholarship.update(id, fields, actorOf(req));
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: 'A scholarship with that title already exists.' });
    }
    throw err;
  }
  if (!updated) return res.status(404).json({ error: 'Scholarship not found' });

  await ContentAudit.record({
    entity: 'scholarship',
    row_id: id,
    action: 'update',
    actor_id: actorOf(req),
    changes
  });

  res.json({ scholarship: updated, infoCheck: generateInfoCheck(updated) });
});

/** Soft delete: hidden from students, recoverable, saved items and history intact. */
router.post('/:id/archive', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Scholarship id must be a positive integer.' });
  }

  const archived = await Scholarship.archive(id, actorOf(req));
  if (!archived) return res.status(404).json({ error: 'Scholarship not found' });

  await ContentAudit.record({
    entity: 'scholarship',
    row_id: id,
    action: 'archive',
    actor_id: actorOf(req),
    reason: reasonOf(req)
  });

  res.json({ scholarship: archived });
});

router.post('/:id/restore', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Scholarship id must be a positive integer.' });
  }

  const restored = await Scholarship.restore(id);
  if (!restored) return res.status(404).json({ error: 'Scholarship not found' });

  await ContentAudit.record({
    entity: 'scholarship',
    row_id: id,
    action: 'restore',
    actor_id: actorOf(req),
    reason: reasonOf(req)
  });

  res.json({ scholarship: restored });
});

/** The change log for one listing — who edited what, and when. */
router.get('/:id/history', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Scholarship id must be a positive integer.' });
  }

  const scholarship = await Scholarship.getById(id);
  if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });

  res.json(await ContentAudit.listFor('scholarship', id));
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

/** Public detail. Archived listings are gone as far as students are concerned. */
router.get('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Scholarship id must be a positive integer.' });
  }

  const scholarship = await Scholarship.getById(id);
  if (!scholarship || scholarship.archived_at) {
    return res.status(404).json({ error: 'Scholarship not found' });
  }

  res.json({
    title: scholarship.title,
    scholarship,
    infoCheck: generateInfoCheck(scholarship)
  });
});

// Saving lives in routes/saved.ts (`POST /saved/scholarship/:id`), which covers
// majors, careers and universities too.

module.exports = router;
