import { Request, Response } from 'express';
import VerificationRequest, { isStatus, isVerdict } from '../models/VerificationRequest';
import Scholarship from '../models/Scholarship';
import User from '../models/User';
import { isAuthenticated } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import { checkLink } from '../utils/linkCheck';
import { notifyNewRequest } from '../utils/telegram';
import { parseId } from '../utils/params';

const { verificationLimiter } = require('../../middleware/security');

const router = require('express').Router();

const MAX_TITLE = 300;
const MAX_NOTE = 2000;

/**
 * Submit something to be checked.
 *
 * The important case is a link a student saw on social media that is NOT in our
 * catalogue, so `url` is the primary input and `scholarshipId` is optional.
 * The automated check runs inline and is returned immediately — the student
 * gets an answer in milliseconds while the human review is still queued.
 *
 * Rate limited per account (10 accepted submissions an hour), because each one
 * pings the team's Telegram group.
 */
router.post('/', isAuthenticated, verificationLimiter, async (req: Request, res: Response) => {
  const session = req.session as any;
  const { url, title, note, scholarshipId } = req.body ?? {};

  const submittedUrl = typeof url === 'string' ? url.trim() : '';
  const submittedTitle = typeof title === 'string' ? title.trim() : '';
  const submittedNote = typeof note === 'string' ? note.trim() : '';

  const hasScholarshipRef = scholarshipId !== undefined && scholarshipId !== null;

  // A scholarship reference alone is a complete request — "is the deadline on
  // this listing still right?" needs no link or title from the student.
  if (!submittedUrl && !submittedTitle && !hasScholarshipRef) {
    return res
      .status(400)
      .json({ error: 'Send a link, a scholarship name, or both — we need something to check.' });
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

  const autoCheck = checkLink(submittedUrl, `${submittedTitle} ${submittedNote}`);

  const created = await VerificationRequest.create({
    user_id: session.userId,
    scholarship_id: scholarship?.id ?? null,
    submitted_url: submittedUrl || null,
    submitted_title: submittedTitle || scholarship?.title || submittedUrl,
    note: submittedNote || null,
    auto_check: autoCheck
  });

  // Alert the review team. Deliberately not awaited into the response path:
  // a Telegram outage must not fail a student's submission.
  const user = await User.findById(session.userId);
  void notifyNewRequest({
    id: created.id,
    title: created.submitted_title,
    url: created.submitted_url,
    note: created.note,
    riskLevel: autoCheck.level,
    findings: autoCheck.findings,
    submittedBy: user ? `${user.name} (${user.email})` : `user #${session.userId}`
  });

  res.status(201).json({ request: created, autoCheck });
});

/** The student's own requests — their inbox. */
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  const session = req.session as any;
  const [requests, unread] = await Promise.all([
    VerificationRequest.listForUser(session.userId),
    VerificationRequest.unreadCount(session.userId)
  ]);
  res.json({ requests, unread });
});

/** The review queue. Admins only. */
router.get('/all', isAdmin, async (req: Request, res: Response) => {
  const status = req.query.status;

  if (status === undefined) {
    return res.json(await VerificationRequest.listAll());
  }
  if (!isStatus(status)) {
    return res.status(400).json({ error: 'Unknown status filter.' });
  }
  res.json(await VerificationRequest.listAll(status));
});

/** One request. The owner or any admin may read it. */
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Request id must be a positive integer.' });

  const request = await VerificationRequest.getById(id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const session = req.session as any;
  const viewer = await User.findById(session.userId);
  const isOwner = request.user_id === session.userId;

  if (!isOwner && viewer?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Opening your own answered request clears the unread badge.
  if (isOwner && request.status === 'resolved' && !request.read_by_user) {
    await VerificationRequest.markRead(id, session.userId);
  }

  res.json(request);
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

  const session = req.session as any;
  const updated = await VerificationRequest.review(id, session.userId, {
    status,
    verdict: isVerdict(verdict) ? verdict : null,
    admin_response: typeof response === 'string' && response.trim() ? response.trim() : null
  });

  if (!updated) return res.status(404).json({ error: 'Request not found' });

  res.json(updated);
});

module.exports = router;
