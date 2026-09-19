import { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import CampaignModel from '../models/Campaign';
import { isAdmin } from '../middleware/admin';
import { uploadMediaFile, deleteMediaFile } from '../config/storage';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB limit
  fileFilter: (_req, file, cb) => {
    const allowedExts = /jpeg|jpg|png|webp|gif|svg|mp4|webm/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype;
    if (allowedExts.test(ext) && (mime.startsWith('image/') || mime.startsWith('video/'))) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, WebP, GIF, SVG) and videos (MP4, WebM) are allowed'));
    }
  },
});

const router = Router();

// GET /campaigns - Public: returns all currently active campaigns
router.get('/', async (req: Request, res: Response) => {
  try {
    const campaigns = await CampaignModel.findActive();
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// GET /campaigns/admin - Admin only: returns all campaigns (active + inactive)
router.get('/admin', isAdmin, async (req: Request, res: Response) => {
  try {
    const campaigns = await CampaignModel.findAll();
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching admin campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// POST /campaigns - Admin only: create a new campaign
router.post('/', isAdmin, async (req: Request, res: Response) => {
  const { title, tagline, trigger_param, type, media_url, link_url, cta_text, countdown_seconds, is_active, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!media_url || !media_url.trim()) {
    return res.status(400).json({ error: 'Media URL is required' });
  }
  if (!link_url || !link_url.trim()) {
    return res.status(400).json({ error: 'Destination link URL is required' });
  }
  if (type && !['image', 'video'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "image" or "video"' });
  }

  try {
    const campaign = await CampaignModel.create({
      title,
      tagline,
      trigger_param,
      type: type || 'image',
      media_url,
      link_url,
      cta_text: cta_text || 'Learn More',
      countdown_seconds: countdown_seconds !== undefined ? Math.max(0, Number(countdown_seconds) || 0) : 3,
      is_active: is_active !== undefined ? is_active : true,
      priority: Number(priority) || 0,
    });
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// PATCH /campaigns/:id - Admin only: update campaign details or toggle status
router.patch('/:id', isAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid campaign ID' });
  }

  const { title, tagline, trigger_param, type, media_url, link_url, cta_text, countdown_seconds, is_active, priority } = req.body;

  if (type && !['image', 'video'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "image" or "video"' });
  }

  try {
    const campaign = await CampaignModel.update(id, {
      title,
      tagline,
      trigger_param,
      type,
      media_url,
      link_url,
      cta_text,
      countdown_seconds: countdown_seconds !== undefined ? Math.max(0, Number(countdown_seconds) || 0) : undefined,
      is_active,
      priority: priority !== undefined ? Number(priority) : undefined,
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// DELETE /campaigns/:id - Admin only: delete campaign
router.delete('/:id', isAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid campaign ID' });
  }

  try {
    const campaign = await CampaignModel.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Clean up uploaded media file from S3 or local disk
    if (campaign.media_url) {
      await deleteMediaFile(campaign.media_url);
    }

    await CampaignModel.delete(id);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// POST /campaigns/:id/track - Public: track click or impression
router.post('/:id/track', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  const { metric } = req.body;

  if (isNaN(id) || !['click', 'impression'].includes(metric)) {
    return res.status(400).json({ error: 'Invalid metric or campaign ID' });
  }

  try {
    await CampaignModel.track(id, metric);
    res.status(204).end();
  } catch (error) {
    console.error('Error tracking campaign metric:', error);
    res.status(500).json({ error: 'Failed to track campaign' });
  }
});

// POST /campaigns/resolve-url - Resolves shortened URLs (e.g. vt.tiktok.com, youtu.be)
router.post('/resolve-url', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await fetch(url.trim(), {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    res.json({ originalUrl: url, resolvedUrl: response.url });
  } catch (error) {
    console.error('Error resolving URL:', error);
    res.json({ originalUrl: url, resolvedUrl: url });
  }
});

// POST /campaigns/upload - Admin only: upload media file (image / video) directly
router.post(
  '/upload',
  isAdmin,
  (req: Request, res: Response, next: any) => {
    upload.single('file')(req, res, (err: any) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File exceeds 150MB limit. For larger videos, paste a YouTube or TikTok link.' });
      }
      if (err) {
        return res.status(400).json({ error: err.message || 'File upload error' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `campaign-${uniqueSuffix}${ext}`;
    const isVideo = file.mimetype.startsWith('video/');

    const host = req.get('host') || 'localhost:5000';
    const protocol =
      req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;

    try {
      const result = await uploadMediaFile(file.buffer, filename, file.mimetype, baseUrl);
      res.json({
        url: result.url,
        filename: result.filename,
        type: isVideo ? 'video' : 'image',
        storage: result.storage,
      });
    } catch (err: any) {
      console.error('Failed to upload media file:', err);
      res.status(500).json({ error: 'Failed to upload media file' });
    }
  }
);

export default router;
