import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { api, closeDb, pool, registerAndLogin, resetDb } from './helpers';
import { getStorage, setStorageForTests } from '../utils/storage';
import { purgeExpiredAttachments } from '../utils/attachmentRetention';

const makeAdmin = async (userId: number): Promise<void> => {
  await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [userId]);
};

/** A real, decodable image — larger than the 2000px cap, carrying EXIF. */
const screenshot = (width = 3000, height = 1200) =>
  sharp({ create: { width, height, channels: 3, background: '#3366aa' } })
    .withMetadata({ exif: { IFD0: { Copyright: 'student-private' } } })
    .jpeg()
    .toBuffer();

const storageKeyOf = async (attachmentId: number): Promise<string> => {
  const { rows } = await pool.query('SELECT storage_key FROM verification_attachments WHERE id = $1', [
    attachmentId
  ]);
  return rows[0].storage_key;
};

describe('Verification request screenshots', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('POST /verification-requests with images', () => {
    it('accepts a screenshot on its own, re-encoded and returned as metadata only', async () => {
      const { client } = await registerAndLogin();

      const res = await client
        .post('/verification-requests')
        .field('note', 'Saw this poster in a Telegram group')
        .attach('images', await screenshot(), { filename: 'poster.jpg', contentType: 'image/jpeg' });

      assert.equal(res.status, 201);
      assert.equal(res.body.request.submitted_title, 'Screenshot of a scholarship post');
      assert.equal(res.body.request.attachments.length, 1);

      const [attachment] = res.body.request.attachments;
      assert.equal(attachment.mime, 'image/jpeg');
      assert.equal(attachment.width, 2000, 'long edge should be capped at 2000px');
      assert.equal(attachment.height, 800);
      assert.equal(attachment.storage_key, undefined, 'storage key leaked to the client');
      assert.ok(
        res.body.autoCheck.findings.some((f: string) => /screenshot/i.test(f)),
        'an image-only request should say the screenshot is what gets checked'
      );
    });

    it('stores the bytes in object storage with EXIF stripped, not in Postgres', async () => {
      const { client } = await registerAndLogin();
      const res = await client
        .post('/verification-requests')
        .attach('images', await screenshot(), { filename: 'a.jpg', contentType: 'image/jpeg' });

      const key = await storageKeyOf(res.body.request.attachments[0].id);
      assert.match(key, /^verification\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.jpg$/);

      const stored = await getStorage()!.get(key);
      assert.ok(stored, 'object missing from storage');
      const meta = await sharp(stored).metadata();
      assert.equal(meta.exif, undefined, 'EXIF survived re-encoding');
    });

    it('takes a link, text and up to three images together', async () => {
      const { client } = await registerAndLogin();
      const image = await screenshot(800, 600);

      const res = await client
        .post('/verification-requests')
        .field('url', 'https://www.facebook.com/share/p/abc123/')
        .field('title', 'Free study in Japan')
        .attach('images', image, { filename: '1.jpg', contentType: 'image/jpeg' })
        .attach('images', image, { filename: '2.jpg', contentType: 'image/jpeg' })
        .attach('images', image, { filename: '3.jpg', contentType: 'image/jpeg' });

      assert.equal(res.status, 201);
      assert.equal(res.body.request.attachments.length, 3);
      assert.equal(res.body.request.submitted_url, 'https://www.facebook.com/share/p/abc123/');
    });

    it('refuses a fourth image and saves nothing', async () => {
      const { client } = await registerAndLogin();
      const image = await screenshot(100, 100);

      let req = client.post('/verification-requests').field('title', 'Too many');
      for (let i = 0; i < 4; i++) {
        req = req.attach('images', image, { filename: `${i}.jpg`, contentType: 'image/jpeg' });
      }
      const res = await req;

      assert.equal(res.status, 400);
      const { rows } = await pool.query('SELECT count(*)::int AS n FROM verification_requests');
      assert.equal(rows[0].n, 0);
    });

    it('rejects a file type that is not an image', async () => {
      const { client } = await registerAndLogin();
      const res = await client
        .post('/verification-requests')
        .attach('images', Buffer.from('%PDF-1.4'), { filename: 'a.pdf', contentType: 'application/pdf' });
      assert.equal(res.status, 400);
    });

    it('rejects bytes that only claim to be an image, and stores nothing', async () => {
      const { client } = await registerAndLogin();
      const good = await screenshot(100, 100);

      const res = await client
        .post('/verification-requests')
        .attach('images', good, { filename: 'ok.jpg', contentType: 'image/jpeg' })
        .attach('images', Buffer.from('not really a png'), { filename: 'x.png', contentType: 'image/png' });

      assert.equal(res.status, 400);
      const { rows } = await pool.query('SELECT count(*)::int AS n FROM verification_attachments');
      assert.equal(rows[0].n, 0);
    });

    it('answers 503 when no storage is configured, but link-only requests still work', async t => {
      setStorageForTests(null);
      t.after(() => setStorageForTests(undefined));
      const { client } = await registerAndLogin();

      const withImage = await client
        .post('/verification-requests')
        .field('title', 'Poster')
        .attach('images', await screenshot(100, 100), { filename: 'a.jpg', contentType: 'image/jpeg' });
      assert.equal(withImage.status, 503);

      const linkOnly = await client.post('/verification-requests').send({ title: 'Just a name' });
      assert.equal(linkOnly.status, 201);
      assert.deepEqual(linkOnly.body.request.attachments, []);
    });
  });

  describe('GET /verification-requests/:id/attachments/:attachmentId', () => {
    const submitWithImage = async () => {
      const student = await registerAndLogin();
      const res = await student.client
        .post('/verification-requests')
        .attach('images', await screenshot(400, 300), { filename: 'a.jpg', contentType: 'image/jpeg' });
      return { student, request: res.body.request, attachment: res.body.request.attachments[0] };
    };

    it('serves the image to the student who sent it, privately', async () => {
      const { student, request, attachment } = await submitWithImage();

      const res = await student.client
        .get(`/verification-requests/${request.id}/attachments/${attachment.id}`)
        .buffer(true)
        .parse((r, cb) => {
          const chunks: Buffer[] = [];
          r.on('data', (c: Buffer) => chunks.push(c));
          r.on('end', () => cb(null, Buffer.concat(chunks)));
        });

      assert.equal(res.status, 200);
      assert.equal(res.headers['content-type'], 'image/jpeg');
      assert.match(res.headers['cache-control'], /private/);
      assert.equal((await sharp(res.body).metadata()).width, 400);
    });

    it('serves it to an admin', async () => {
      const { request, attachment } = await submitWithImage();
      const admin = await registerAndLogin();
      await makeAdmin(admin.id);

      const res = await admin.client.get(`/verification-requests/${request.id}/attachments/${attachment.id}`);
      assert.equal(res.status, 200);
    });

    it('refuses another student and anyone signed out', async () => {
      const { request, attachment } = await submitWithImage();
      const other = await registerAndLogin();

      const res = await other.client.get(`/verification-requests/${request.id}/attachments/${attachment.id}`);
      assert.equal(res.status, 403);

      const anon = await api().get(`/verification-requests/${request.id}/attachments/${attachment.id}`);
      assert.equal(anon.status, 401);
    });

    it('does not serve an attachment through a different request id', async () => {
      const first = await submitWithImage();
      const second = await first.student.client.post('/verification-requests').send({ title: 'Other' });

      const res = await first.student.client.get(
        `/verification-requests/${second.body.request.id}/attachments/${first.attachment.id}`
      );
      assert.equal(res.status, 404);
    });

    it('lists attachments in the student inbox and the admin queue', async () => {
      const { student } = await submitWithImage();
      const admin = await registerAndLogin();
      await makeAdmin(admin.id);

      const inbox = await student.client.get('/verification-requests');
      assert.equal(inbox.body.requests[0].attachments.length, 1);

      const queue = await admin.client.get('/verification-requests/all');
      assert.equal(queue.body[0].attachments.length, 1);
    });
  });

  describe('Retention', () => {
    it('deletes screenshots 90 days after the answer, keeping the request', async () => {
      const student = await registerAndLogin();
      const admin = await registerAndLogin();
      await makeAdmin(admin.id);

      const created = await student.client
        .post('/verification-requests')
        .attach('images', await screenshot(100, 100), { filename: 'a.jpg', contentType: 'image/jpeg' });
      const { id } = created.body.request;
      const attachmentId = created.body.request.attachments[0].id;
      const key = await storageKeyOf(attachmentId);

      await admin.client.patch(`/verification-requests/${id}`).send({ status: 'resolved', verdict: 'scam' });

      // Recently answered: kept.
      assert.deepEqual(await purgeExpiredAttachments(), { deleted: 0, failed: 0 });

      await pool.query(
        "UPDATE verification_requests SET reviewed_at = now() - interval '91 days' WHERE id = $1",
        [id]
      );
      assert.deepEqual(await purgeExpiredAttachments(), { deleted: 1, failed: 0 });

      assert.equal(await getStorage()!.get(key), null, 'object left behind in storage');
      const after = await student.client.get(`/verification-requests/${id}`);
      assert.equal(after.status, 200);
      assert.equal(after.body.verdict, 'scam');
      assert.deepEqual(after.body.attachments, []);
    });

    it('keeps the cron endpoint closed without the secret', async t => {
      const previous = process.env.CRON_SECRET;
      t.after(() => {
        if (previous === undefined) delete process.env.CRON_SECRET;
        else process.env.CRON_SECRET = previous;
      });

      delete process.env.CRON_SECRET;
      assert.equal((await api().get('/verification-requests/attachments/purge')).status, 401);

      process.env.CRON_SECRET = 'test-cron-secret';
      const wrong = await api()
        .get('/verification-requests/attachments/purge')
        .set('Authorization', 'Bearer nope');
      assert.equal(wrong.status, 401);

      const right = await api()
        .get('/verification-requests/attachments/purge')
        .set('Authorization', 'Bearer test-cron-secret');
      assert.equal(right.status, 200);
      assert.deepEqual(right.body, { deleted: 0, failed: 0 });
    });
  });
});
