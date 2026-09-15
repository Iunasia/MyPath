import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, closeDb, insertScholarship, pool, registerAndLogin, resetDb } from './helpers';

/** Roles are only ever granted server-side, so tests promote directly. */
const signedInAdmin = async (email: string) => {
  const admin = await registerAndLogin({ email });
  await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [admin.id]);
  return admin;
};

const validCreate = (overrides: Record<string, unknown> = {}) => ({
  title: `New Scholarship ${Math.random().toString(36).slice(2, 8)}`,
  provider: 'Ministry of Education',
  description: 'A new scholarship added through the admin form.',
  application_link: 'https://moeys.gov.kh/scholarship',
  ...overrides
});

describe('Scholarships CRUD (admin)', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('POST /scholarships', () => {
    it('is refused when signed out', async () => {
      const res = await api().post('/scholarships').send(validCreate());
      assert.equal(res.status, 401);
    });

    it('is refused to students', async () => {
      const { client } = await registerAndLogin();
      const res = await client.post('/scholarships').send(validCreate());
      assert.equal(res.status, 403);
    });

    it('creates a listing and derives its provenance from the link', async () => {
      const admin = await signedInAdmin('create@test.com');
      const res = await admin.client.post('/scholarships').send(validCreate());

      assert.equal(res.status, 201);
      assert.equal(res.body.scholarship.source_type, 'official');
      assert.equal(res.body.scholarship.source_url, 'https://moeys.gov.kh/scholarship');
      assert.equal(res.body.scholarship.verified_status, 'verified');
      assert.ok(res.body.infoCheck, 'the created row has no information check');
    });

    it('rejects a listing with no title', async () => {
      const admin = await signedInAdmin('notitle@test.com');
      const res = await admin.client.post('/scholarships').send(validCreate({ title: '' }));
      assert.equal(res.status, 400);
    });

    it('rejects a non-http application link', async () => {
      const admin = await signedInAdmin('badlink@test.com');
      const res = await admin.client
        .post('/scholarships')
        .send(validCreate({ application_link: 'javascript:alert(1)' }));
      assert.equal(res.status, 400);
    });

    it('conflicts when the title already exists', async () => {
      const admin = await signedInAdmin('dupe@test.com');
      await admin.client.post('/scholarships').send(validCreate({ title: 'Same title' }));
      const res = await admin.client.post('/scholarships').send(validCreate({ title: 'Same title' }));
      assert.equal(res.status, 409);
    });
  });

  describe('PATCH /scholarships/:id', () => {
    it('is refused to students', async () => {
      const id = await insertScholarship();
      const { client } = await registerAndLogin();
      const res = await client.patch(`/scholarships/${id}`).send({ provider: 'Nope' });
      assert.equal(res.status, 403);
    });

    it('updates a field and records who did it', async () => {
      const id = await insertScholarship();
      const admin = await signedInAdmin('edit@test.com');

      const res = await admin.client.patch(`/scholarships/${id}`).send({ provider: 'New Provider' });
      assert.equal(res.status, 200);
      assert.equal(res.body.scholarship.provider, 'New Provider');
      assert.equal(res.body.scholarship.edited_by, admin.id);
    });

    it('recomputes provenance when the application link changes', async () => {
      const id = await insertScholarship();
      const admin = await signedInAdmin('relink@test.com');

      const res = await admin.client
        .patch(`/scholarships/${id}`)
        .send({ application_link: 'https://facebook.com/offer' });

      assert.equal(res.body.scholarship.source_type, 'social_media');
      assert.equal(res.body.scholarship.verified_status, 'flagged');
      assert.ok(res.body.scholarship.safety_warnings.length > 0);
    });

    it('writes a history entry with the changed fields', async () => {
      const id = await insertScholarship();
      const admin = await signedInAdmin('history@test.com');
      await admin.client.patch(`/scholarships/${id}`).send({ provider: 'Traceable' });

      const res = await admin.client.get(`/scholarships/${id}/history`);
      assert.equal(res.status, 200);
      assert.equal(res.body[0].action, 'update');
      assert.ok(res.body[0].changes.provider);
      assert.equal(res.body[0].actor_id, admin.id);
    });

    it('answers 400 when nothing is sent', async () => {
      const id = await insertScholarship();
      const admin = await signedInAdmin('empty@test.com');
      const res = await admin.client.patch(`/scholarships/${id}`).send({});
      assert.equal(res.status, 400);
    });

    it('answers 404 for an unknown id', async () => {
      const admin = await signedInAdmin('missing@test.com');
      const res = await admin.client.patch('/scholarships/999999').send({ provider: 'Ghost' });
      assert.equal(res.status, 404);
    });
  });

  describe('archive and restore', () => {
    it('hides an archived listing from students but keeps it for admins', async () => {
      const id = await insertScholarship({ title: 'Will be archived' });
      const admin = await signedInAdmin('archive@test.com');

      const archived = await admin.client.post(`/scholarships/${id}/archive`);
      assert.equal(archived.status, 200);
      assert.ok(archived.body.scholarship.archived_at);

      // Public list excludes it, public detail 404s.
      const publicList = await api().get('/scholarships');
      assert.equal(publicList.body.find((s: { id: number }) => s.id === id), undefined);
      assert.equal((await api().get(`/scholarships/${id}`)).status, 404);

      // An admin asking for archived rows still sees it.
      const adminList = await admin.client.get('/scholarships?includeArchived=1');
      assert.ok(adminList.body.find((s: { id: number }) => s.id === id));
    });

    it('restores an archived listing', async () => {
      const id = await insertScholarship();
      const admin = await signedInAdmin('restore@test.com');
      await admin.client.post(`/scholarships/${id}/archive`);

      const res = await admin.client.post(`/scholarships/${id}/restore`);
      assert.equal(res.status, 200);
      assert.equal(res.body.scholarship.archived_at, null);
      assert.equal((await api().get(`/scholarships/${id}`)).status, 200);
    });

    it('is refused to students', async () => {
      const id = await insertScholarship();
      const { client } = await registerAndLogin();
      assert.equal((await client.post(`/scholarships/${id}/archive`)).status, 403);
    });
  });

  describe('GET /scholarships/export', () => {
    it('is refused to students', async () => {
      const { client } = await registerAndLogin();
      assert.equal((await client.get('/scholarships/export')).status, 403);
    });

    it('returns a CSV with a header row for admins', async () => {
      await insertScholarship({ title: 'Exported' });
      const admin = await signedInAdmin('export@test.com');

      const res = await admin.client.get('/scholarships/export');
      assert.equal(res.status, 200);
      assert.match(res.headers['content-type'], /text\/csv/);
      assert.match(res.text.split('\r\n')[0], /^id,title,provider/);
      assert.match(res.text, /Exported/);
    });
  });
});
