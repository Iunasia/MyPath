import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, closeDb, registerAndLogin, resetDb } from './helpers';

// A minimal valid 1x1 PNG, hardcoded so no binary fixture file is needed.
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

describe('Avatar API', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('PATCH /auth/me/avatar', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await api()
        .patch('/auth/me/avatar')
        .attach('avatar', TINY_PNG, { filename: 'a.png', contentType: 'image/png' });
      assert.equal(res.status, 401);
    });

    it('uploads and re-encodes the image, returning no image bytes in the body', async () => {
      const { client } = await registerAndLogin();

      const res = await client
        .patch('/auth/me/avatar')
        .attach('avatar', TINY_PNG, { filename: 'a.png', contentType: 'image/png' });

      assert.equal(res.status, 200);
      assert.ok(res.body.user.avatar_updated_at);
      assert.equal(res.body.user.avatar_data, undefined, 'response leaked raw image bytes');
      assert.equal(res.body.user.avatar_mime, undefined, 'response leaked internal mime field');
    });

    it('rejects an unsupported mime type with 400', async () => {
      const { client } = await registerAndLogin();

      const res = await client
        .patch('/auth/me/avatar')
        .attach('avatar', Buffer.from('not an image'), { filename: 'a.txt', contentType: 'text/plain' });

      assert.equal(res.status, 400);
    });

    it('rejects corrupt bytes with an image content-type with 400', async () => {
      const { client } = await registerAndLogin();

      const res = await client
        .patch('/auth/me/avatar')
        .attach('avatar', Buffer.from([0, 1, 2, 3]), { filename: 'a.png', contentType: 'image/png' });

      assert.equal(res.status, 400);
    });

    it('rejects a file over 3MB with 400', async () => {
      const { client } = await registerAndLogin();

      const res = await client
        .patch('/auth/me/avatar')
        .attach('avatar', Buffer.alloc(3 * 1024 * 1024 + 1), { filename: 'a.png', contentType: 'image/png' });

      assert.equal(res.status, 400);
    });

    it('rejects a request with no file with 400', async () => {
      const { client } = await registerAndLogin();

      const res = await client.patch('/auth/me/avatar');
      assert.equal(res.status, 400);
    });
  });

  describe('GET /auth/avatar/:id', () => {
    it('serves the re-encoded image as JPEG', async () => {
      const { client, id } = await registerAndLogin();
      await client
        .patch('/auth/me/avatar')
        .attach('avatar', TINY_PNG, { filename: 'a.png', contentType: 'image/png' });

      const res = await api().get(`/auth/avatar/${id}`);
      assert.equal(res.status, 200);
      assert.match(String(res.headers['content-type']), /image\/jpeg/);
      assert.ok(res.body.length > 0);
      assert.notEqual(res.body.length, TINY_PNG.length, 'image was stored as-is instead of being re-encoded');
    });

    it('returns 404 for a user with no avatar', async () => {
      const { id } = await registerAndLogin();
      const res = await api().get(`/auth/avatar/${id}`);
      assert.equal(res.status, 404);
    });

    it('returns 400 for a non-numeric id', async () => {
      const res = await api().get('/auth/avatar/not-a-number');
      assert.equal(res.status, 400);
    });

    it('honors conditional GET with If-None-Match', async () => {
      const { client, id } = await registerAndLogin();
      await client
        .patch('/auth/me/avatar')
        .attach('avatar', TINY_PNG, { filename: 'a.png', contentType: 'image/png' });

      const first = await api().get(`/auth/avatar/${id}`);
      const etag = first.headers['etag'];
      assert.ok(etag);

      const second = await api().get(`/auth/avatar/${id}`).set('If-None-Match', etag);
      assert.equal(second.status, 304);
    });

    it('is accessible without authentication', async () => {
      const { client, id } = await registerAndLogin();
      await client
        .patch('/auth/me/avatar')
        .attach('avatar', TINY_PNG, { filename: 'a.png', contentType: 'image/png' });

      const res = await api().get(`/auth/avatar/${id}`); // no cookie
      assert.equal(res.status, 200);
    });
  });

  describe('DELETE /auth/me/avatar', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await api().delete('/auth/me/avatar');
      assert.equal(res.status, 401);
    });

    it('removes an existing avatar', async () => {
      const { client, id } = await registerAndLogin();
      await client
        .patch('/auth/me/avatar')
        .attach('avatar', TINY_PNG, { filename: 'a.png', contentType: 'image/png' });

      const del = await client.delete('/auth/me/avatar');
      assert.equal(del.status, 200);

      const get = await api().get(`/auth/avatar/${id}`);
      assert.equal(get.status, 404);
    });

    it('is idempotent when no avatar exists', async () => {
      const { client } = await registerAndLogin();
      const res = await client.delete('/auth/me/avatar');
      assert.equal(res.status, 200);
    });
  });

  describe('cache-busting contract', () => {
    it('bumps avatar_updated_at on each upload', async () => {
      const { client } = await registerAndLogin();

      const first = await client
        .patch('/auth/me/avatar')
        .attach('avatar', TINY_PNG, { filename: 'a.png', contentType: 'image/png' });
      const firstTimestamp = new Date(first.body.user.avatar_updated_at).getTime();

      await new Promise((resolve) => setTimeout(resolve, 10));

      const second = await client
        .patch('/auth/me/avatar')
        .attach('avatar', TINY_PNG, { filename: 'b.png', contentType: 'image/png' });
      const secondTimestamp = new Date(second.body.user.avatar_updated_at).getTime();

      assert.ok(secondTimestamp > firstTimestamp);
    });
  });
});
