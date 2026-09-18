import { randomUUID, timingSafeEqual } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import VerificationRequest, {
  isStatus,
  isVerdict,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type VerificationRequest as VerificationRequestRow
} from '../models/VerificationRequest';
import VerificationAttachment, { type NewAttachment } from '../models/VerificationAttachment';
import Scholarship from '../models/Scholarship';
import User from '../models/User';
import { isAuthenticated } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import { checkLink } from '../utils/linkCheck';
import { notifyNewRequest } from '../utils/telegram';
import { sendVerdictEmail } from '../utils/email';
import { background } from '../utils/background';
import { getStorage } from '../utils/storage';
import { purgeExpiredAttachments } from '../utils/attachmentRetention';
import {
  ALLOWED_EVIDENCE_TYPES,
  InvalidImageError,
  MAX_EVIDENCE_BYTES,
  MAX_EVIDENCE_FILES,
  processEvidenceImage,
  type ProcessedImage
} from '../utils/evidenceImage';
import { parseId } from '../utils/params';

const { verificationLimiter } = require('../../middleware/security');

const router = require('express').Router();

const MAX_TITLE = 300;
const MAX_NOTE = 2000;

/** Stored title when the student sent only a screenshot. */
const SCREENSHOT_TITLE = 'Screenshot of a scholarship post';

const evidenceUpload = multer({
  storage: multer.memoryStorage(),
  // Vercel caps a whole request body at 4.5MB, so in practice the browser's
  // downscaling (to ~1MB each) is what keeps three images under it.
  limits: { fileSize: MAX_EVIDENCE_BYTES, files: MAX_EVIDENCE_FILES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_EVIDENCE_TYPES.includes(file.mimetype)) return cb(new Error('UNSUPPORTED_TYPE'));
    cb(null, true);
  }
});

/**
 * Accepts up to three `images` on a multipart submission. A JSON body passes
 * straight through untouched, so link-only clients are unaffected.
 */
const acceptImages = (req: Request, res: Response, next: NextFunction) => {
  evidenceUpload.array('images', MAX_EVIDENCE_FILES)(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const error =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Each image must be 4MB or smaller.'
          : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
            ? `Attach at most ${MAX_EVIDENCE_FILES} images, in the "images" field.`
            : 'We could not read that upload.';
      return res.status(400).json({ error });
    }
    if (err instanceof Error && err.message === 'UNSUPPORTED_TYPE') {
      return res.status(400).json({ error: 'Screenshots must be JPEG, PNG or WebP images.' });
    }
    next(err);
  });
};

/** Adds each request's attachment metadata, in one query for the whole list. */
const withAttachments = async <T extends VerificationRequestRow>(requests: T[]) => {
  const byRequest = await VerificationAttachment.listForRequests(requests.map(r => r.id));
  return requests.map(r => ({ ...r, attachments: byRequest.get(r.id) ?? [] }));
};

/** The student who asked, or any admin. */
const canView = async (request: VerificationRequestRow, userId: number): Promise<boolean> => {
  if (request.user_id === userId) return true;
  const viewer = await User.findById(userId);
  return viewer?.role === 'admin';
};

/** `verification/2026/09/<uuid>.jpg` — never anything the client chose. */
const newStorageKey = () => {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `verification/${now.getUTCFullYear()}/${month}/${randomUUID()}.jpg`;
};

/**
 * Validates `?limit=&offset=` for the queue.
 *
 * Both are rejected rather than silently clamped when they are nonsense — a
 * caller asking for `limit=abc` has a bug, and quietly returning page one would
 * hide it. A limit above the ceiling IS clamped, since asking for too much is a
 * reasonable thing a client might do.
 */
const parsePageParams = (
  limit: unknown,
  offset: unknown
): { limit: number; offset: number } | { error: string } => {
  const toInt = (value: unknown, fallback: number): number | null => {
    if (value === undefined) return fallback;
    if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
    return Number(value);
  };

  const parsedLimit = toInt(limit, DEFAULT_PAGE_SIZE);
  if (parsedLimit === null || parsedLimit === 0) {
    return { error: 'limit must be a positive integer.' };
  }

  const parsedOffset = toInt(offset, 0);
  if (parsedOffset === null) {
    return { error: 'offset must be a non-negative integer.' };
  }

  return { limit: Math.min(parsedLimit, MAX_PAGE_SIZE), offset: parsedOffset };
};

/**
 * Submit something to be checked.
 *
 * The important case is a link a student saw on social media that is NOT in our
 * catalogue, so `url` is the primary input and `scholarshipId` is optional.
 * The automated check runs inline and is returned immediately — the student
 * gets an answer in milliseconds while the human review is still queued.
 *
 * Screenshots are the other common case — a poster forwarded in a chat has no
 * link at all. Send the form as multipart with up to three `images`; each is
 * re-encoded (see utils/evidenceImage.ts) and written to object storage, and
 * only its metadata goes into Postgres, in the same transaction as the request.
 *
 * Rate limited per account (10 accepted submissions an hour), because each one
 * pings the team's Telegram group.
 */
router.post('/', isAuthenticated, verificationLimiter, acceptImages, async (req: Request, res: Response) => {
  const session = req.session as any;
  const { url, title, note, scholarshipId } = req.body ?? {};
  const files = ((req as any).files as Express.Multer.File[] | undefined) ?? [];

  const submittedUrl = typeof url === 'string' ? url.trim() : '';
  const submittedTitle = typeof title === 'string' ? title.trim() : '';
  const submittedNote = typeof note === 'string' ? note.trim() : '';

  // Multipart sends every field as a string, so an empty scholarshipId means "none".
  const hasScholarshipRef = scholarshipId !== undefined && scholarshipId !== null && scholarshipId !== '';

  // A scholarship reference alone is a complete request — "is the deadline on
  // this listing still right?" needs no link or title from the student. So is
  // a screenshot on its own.
  if (!submittedUrl && !submittedTitle && !hasScholarshipRef && files.length === 0) {
    return res.status(400).json({
      error: 'Send a link, a scholarship name or a screenshot — we need something to check.'
    });
  }
  if (submittedTitle.length > MAX_TITLE || submittedNote.length > MAX_NOTE) {
    return res.status(400).json({ error: 'That is longer than we can accept.' });
  }

  // Optional: the student is asking about something already in our catalogue.
  let scholarship = null;
  if (hasScholarshipRef) {
    const id = parseId(String(scholarshipId));
    if (id === null) {
      return res.status(400).json({ error: 'scholarshipId must be a positive integer.' });
    }
    scholarship = await Scholarship.getById(id);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }
  }

  // Fall back to the listing's own source when the student did not paste a link.
  // Asking "is this deadline still right?" about a scholarship we already hold is
  // a complete question, and we have its official URL right here — without this,
  // checkLink saw an empty string and answered "caution: no link was provided",
  // warning students off listings we had already classified as official.
  // Screenshots: refuse before doing any work if there is nowhere to put them,
  // then decode every one before storing any, so a bad third file saves nothing.
  const storage = files.length > 0 ? getStorage() : null;
  if (files.length > 0 && !storage) {
    return res.status(503).json({
      error: 'Screenshot uploads are not available right now. Please send a link or a name instead.'
    });
  }

  const images: ProcessedImage[] = [];
  for (const file of files) {
    try {
      images.push(await processEvidenceImage(file.buffer));
    } catch (err) {
      if (err instanceof InvalidImageError) return res.status(400).json({ error: err.message });
      throw err;
    }
  }

  const urlToCheck = submittedUrl || scholarship?.source_url?.trim() || '';
  const autoCheck = checkLink(urlToCheck, `${submittedTitle} ${submittedNote}`, {
    hasImages: images.length > 0
  });

  // Objects first, then rows. If the database write fails the objects are
  // removed again, so storage never holds files no row points at.
  const attachments: NewAttachment[] = [];
  const cleanUp = () =>
    Promise.allSettled(attachments.map(a => storage!.delete(a.storage_key)));

  let created;
  try {
    for (const image of images) {
      const key = newStorageKey();
      await storage!.put(key, image.data, image.mime);
      attachments.push({
        storage_key: key,
        mime: image.mime,
        width: image.width,
        height: image.height,
        size_bytes: image.data.length
      });
    }

    created = await VerificationRequest.create({
      user_id: session.userId,
      scholarship_id: scholarship?.id ?? null,
      submitted_url: submittedUrl || null,
      submitted_title: submittedTitle || scholarship?.title || submittedUrl || SCREENSHOT_TITLE,
      note: submittedNote || null,
      auto_check: autoCheck,
      attachments
    });
  } catch (err) {
    await cleanUp();
    throw err;
  }

  // Alert the review team after responding: a Telegram outage must not fail
  // a student's submission.
  const user = await User.findById(session.userId);
  background(
    'telegram alert',
    notifyNewRequest({
      id: created.id,
      title: created.submitted_title,
      url: created.submitted_url,
      note: created.note,
      riskLevel: autoCheck.level,
      findings: autoCheck.findings,
      submittedBy: user ? `${user.name} (${user.email})` : `user #${session.userId}`,
      imageCount: attachments.length
    })
  );

  const [request] = await withAttachments([created]);
  res.status(201).json({ request, autoCheck });
});

/**
 * The retention sweep, called daily by Vercel Cron (see vercel.json). Vercel
 * sends `Authorization: Bearer $CRON_SECRET`; with no secret configured the
 * endpoint is closed rather than open. Registered before `/:id` for clarity,
 * though the paths could not collide anyway.
 */
router.get('/attachments/purge', async (req: Request, res: Response) => {
  const secret = process.env.CRON_SECRET;
  const given = Buffer.from(req.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret ?? ''}`);

  if (!secret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json(await purgeExpiredAttachments());
});

/** The student's own requests — their inbox. */
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  const session = req.session as any;
  const [requests, unread] = await Promise.all([
    VerificationRequest.listForUser(session.userId),
    VerificationRequest.unreadCount(session.userId)
  ]);
  res.json({ requests: await withAttachments(requests), unread });
});

/**
 * The review queue. Admins only.
 *
 * Paged via `?limit=&offset=`. Both are optional and the response is still a
 * bare array, so callers that predate paging keep working — they just receive
 * the first page, which for this ordering is the oldest pending work.
 */
router.get('/all', isAdmin, async (req: Request, res: Response) => {
  const { status, limit, offset } = req.query;

  const page = parsePageParams(limit, offset);
  if ('error' in page) return res.status(400).json({ error: page.error });

  if (status !== undefined && !isStatus(status)) {
    return res.status(400).json({ error: 'Unknown status filter.' });
  }
  const filter = isStatus(status) ? status : undefined;
  res.json(await withAttachments(await VerificationRequest.listAll(filter, page)));
});

/** One request. The owner or any admin may read it. */
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Request id must be a positive integer.' });

  const request = await VerificationRequest.getById(id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const session = req.session as any;
  if (!(await canView(request, session.userId))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Opening your own answered request clears the unread badge.
  const isOwner = request.user_id === session.userId;
  if (isOwner && request.status === 'resolved' && !request.read_by_user) {
    await VerificationRequest.markRead(id, session.userId);
  }

  const [withFiles] = await withAttachments([request]);
  res.json(withFiles);
});

/**
 * One screenshot's bytes. Same access rule as the request itself — these can
 * show a student's name, phone number or private chat, so they are never
 * public and never cached by shared caches.
 */
router.get('/:id/attachments/:attachmentId', isAuthenticated, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const attachmentId = parseId(req.params.attachmentId);
  if (id === null || attachmentId === null) {
    return res.status(400).json({ error: 'Ids must be positive integers.' });
  }

  const request = await VerificationRequest.getById(id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const session = req.session as any;
  if (!(await canView(request, session.userId))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const attachment = await VerificationAttachment.getForRequest(id, attachmentId);
  const storage = getStorage();
  const data = attachment && storage ? await storage.get(attachment.storage_key) : null;
  if (!attachment || !data) {
    // Also what a screenshot removed by the retention sweep looks like.
    return res.status(404).json({ error: 'Attachment not found' });
  }

  res.set({
    'Content-Type': attachment.mime,
    'Content-Length': String(data.length),
    'Cache-Control': 'private, max-age=3600',
    'Content-Disposition': `inline; filename="request-${id}-${attachmentId}.jpg"`
  });
  res.status(200).send(data);
});

/** Record a review decision. Admins only. */
router.patch('/:id', isAdmin, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Request id must be a positive integer.' });

  const { status, verdict, response } = req.body ?? {};

  if (!isStatus(status)) {
    return res.status(400).json({ error: 'status must be pending, reviewing or resolved.' });
  }
  if (verdict !== undefined && verdict !== null && !isVerdict(verdict)) {
    return res.status(400).json({ error: 'verdict must be legitimate, scam, outdated or unverifiable.' });
  }
  // A resolved request is what the student reads, so it must actually say something.
  if (status === 'resolved' && !isVerdict(verdict)) {
    return res.status(400).json({ error: 'A resolved request needs a verdict.' });
  }

  const before = await VerificationRequest.getById(id);
  if (!before) return res.status(404).json({ error: 'Request not found' });

  const session = req.session as any;
  const updated = await VerificationRequest.review(id, session.userId, {
    status,
    verdict: isVerdict(verdict) ? verdict : null,
    admin_response: typeof response === 'string' && response.trim() ? response.trim() : null
  });

  if (!updated) return res.status(404).json({ error: 'Request not found' });

  // Confirming a listing we hold as legitimate is a human check of it, so the
  // scholarship's "Last verified" line updates too.
  if (status === 'resolved' && verdict === 'legitimate' && updated.scholarship_id) {
    await Scholarship.markVerified(updated.scholarship_id, session.userId);
  }

  // The in-app inbox already shows the answer as unread; the email brings the
  // student back to it. Only on the first resolution, so a corrected verdict
  // does not mail them twice.
  if (status === 'resolved' && before.status !== 'resolved' && updated.submitted_by_email) {
    background(
      'verdict email',
      sendVerdictEmail(updated.submitted_by_email, updated.submitted_by_name ?? 'there', updated.submitted_title)
    );
  }

  const [withFiles] = await withAttachments([updated]);
  res.json(withFiles);
});

module.exports = router;
