import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  api,
  closeDb,
  insertCareer,
  insertMajor,
  insertUniversity,
  pool,
  registerAndLogin,
  resetDb
} from './helpers';

/** Roles are only ever granted server-side, so tests promote directly. */
const signedInAdmin = async (email: string) => {
  const admin = await registerAndLogin({ email });
  await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [admin.id]);
  return admin;
};

const suffix = () => Math.random().toString(36).slice(2, 8);

interface EntityConfig {
  label: string;
  base: string;
  key: 'career' | 'major' | 'university';
  naturalField: 'title' | 'name';
  insert: (overrides?: Record<string, unknown>) => Promise<number>;
  validCreate: (overrides?: Record<string, unknown>) => Record<string, unknown>;
}

const CAREERS: EntityConfig = {
  label: 'Careers',
  base: '/careers',
  key: 'career',
  naturalField: 'title',
  insert: insertCareer,
  validCreate: (o = {}) => ({
    title: `New Career ${suffix()}`,
    category: 'Technology',
    description: 'A career added through the admin form.',
    ...o
  })
};

const MAJORS: EntityConfig = {
  label: 'Majors',
  base: '/majors',
  key: 'major',
  naturalField: 'name',
  insert: insertMajor,
  validCreate: (o = {}) => ({
    name: `New Major ${suffix()}`,
    field: 'Technology',
    description: 'A major added through the admin form.',
    ...o
  })
};

const UNIVERSITIES: EntityConfig = {
  label: 'Universities',
  base: '/universities',
  key: 'university',
  naturalField: 'name',
  insert: insertUniversity,
  validCreate: (o = {}) => ({
    name: `New University ${suffix()}`,
    description: 'A university added through the admin form.',
    website: 'https://example.edu.kh',
    city: 'Phnom Penh',
    ...o
  })
};

const crudTests = ({ label, base, key, naturalField, insert, validCreate }: EntityConfig) => {
  describe(`${label} CRUD`, () => {
    it('refuses create when signed out', async () => {
      const res = await api().post(base).send(validCreate());
      assert.equal(res.status, 401);
    });

    it('refuses create to students', async () => {
      const { client } = await registerAndLogin();
      const res = await client.post(base).send(validCreate());
      assert.equal(res.status, 403);
    });

    it('creates a record', async () => {
      const admin = await signedInAdmin(`${key}-create@test.com`);
      const res = await admin.client.post(base).send(validCreate());
      assert.equal(res.status, 201);
      assert.ok(res.body[key]?.id, 'the created record is missing from the response');
      assert.equal(res.body[key].archived_at, null);
    });

    it('rejects a create with no required fields', async () => {
      const admin = await signedInAdmin(`${key}-invalid@test.com`);
      const res = await admin.client.post(base).send({});
      assert.equal(res.status, 400);
    });

    it('conflicts on a duplicate natural key', async () => {
      const admin = await signedInAdmin(`${key}-dupe@test.com`);
      const body = validCreate({ [naturalField]: `Duplicate ${suffix()}` });
      await admin.client.post(base).send(body);
      const res = await admin.client.post(base).send(body);
      assert.equal(res.status, 409);
    });

    it('edits a record and records who did it', async () => {
      const id = await insert();
      const admin = await signedInAdmin(`${key}-edit@test.com`);
      const res = await admin.client.patch(`${base}/${id}`).send({ description: 'Updated description' });

      assert.equal(res.status, 200);
      assert.equal(res.body[key].description, 'Updated description');
      assert.equal(res.body[key].edited_by, admin.id);
    });

    it('rejects an empty patch', async () => {
      const id = await insert();
      const admin = await signedInAdmin(`${key}-empty@test.com`);
      const res = await admin.client.patch(`${base}/${id}`).send({});
      assert.equal(res.status, 400);
    });

    it('answers 404 when editing an unknown record', async () => {
      const admin = await signedInAdmin(`${key}-missing@test.com`);
      const res = await admin.client.patch(`${base}/999999`).send({ description: 'Ghost' });
      assert.equal(res.status, 404);
    });

    it('archives: hidden from public, 404 on detail, visible to admins', async () => {
      const id = await insert();
      const admin = await signedInAdmin(`${key}-archive@test.com`);

      const archived = await admin.client.post(`${base}/${id}/archive`).send({ reason: 'test' });
      assert.equal(archived.status, 200);
      assert.ok(archived.body[key].archived_at);

      const publicList = await api().get(base);
      assert.equal(publicList.body.find((row: { id: number }) => row.id === id), undefined);
      assert.equal((await api().get(`${base}/${id}`)).status, 404);

      const adminList = await admin.client.get(`${base}?includeArchived=1`);
      assert.ok(adminList.body.find((row: { id: number }) => row.id === id));
    });

    it('restores an archived record', async () => {
      const id = await insert();
      const admin = await signedInAdmin(`${key}-restore@test.com`);
      await admin.client.post(`${base}/${id}/archive`);

      const res = await admin.client.post(`${base}/${id}/restore`);
      assert.equal(res.status, 200);
      assert.equal(res.body[key].archived_at, null);
      assert.equal((await api().get(`${base}/${id}`)).status, 200);
    });

    it('records a history entry for an edit', async () => {
      const id = await insert();
      const admin = await signedInAdmin(`${key}-history@test.com`);
      await admin.client.patch(`${base}/${id}`).send({ description: 'Traceable change' });

      const res = await admin.client.get(`${base}/${id}/history`);
      assert.equal(res.status, 200);
      assert.equal(res.body[0].action, 'update');
      assert.ok(res.body[0].changes.description);
    });

    it('exports CSV to admins only', async () => {
      const { client } = await registerAndLogin();
      assert.equal((await client.get(`${base}/export`)).status, 403);

      await insert();
      const admin = await signedInAdmin(`${key}-export@test.com`);
      const res = await admin.client.get(`${base}/export`);
      assert.equal(res.status, 200);
      assert.match(res.headers['content-type'], /text\/csv/);
    });
  });
};

describe('Catalog CRUD (admin)', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  crudTests(CAREERS);
  crudTests(MAJORS);
  crudTests(UNIVERSITIES);

  describe('Universities extras', () => {
    it('derives source and slug from the website and name', async () => {
      const admin = await signedInAdmin('uni-derive@test.com');
      const res = await admin.client.post('/universities').send({
        name: 'Royal University of Phnom Penh',
        description: 'A public university.',
        website: 'https://rupp.edu.kh/',
        city: 'Phnom Penh'
      });

      assert.equal(res.status, 201);
      assert.equal(res.body.university.source, 'rupp.edu.kh');
      assert.equal(res.body.university.source_url, 'https://rupp.edu.kh/');
      assert.equal(res.body.university.slug, 'royal-university-of-phnom-penh');
    });

    it('rejects a slug that is already in use', async () => {
      const admin = await signedInAdmin('uni-slug@test.com');
      await admin.client.post('/universities').send({
        name: 'First University',
        slug: 'shared-slug',
        description: 'One.',
        website: 'https://one.edu.kh'
      });
      const res = await admin.client.post('/universities').send({
        name: 'Second University',
        slug: 'shared-slug',
        description: 'Two.',
        website: 'https://two.edu.kh'
      });
      assert.equal(res.status, 409);
    });

    it('still resolves an archived university by slug for admins via includeArchived', async () => {
      const id = await insertUniversity({ name: 'Slug Archive Test', slug: 'slug-archive-test' });
      const admin = await signedInAdmin('uni-slug-archive@test.com');
      await admin.client.post(`/universities/${id}/archive`);

      // Public slug lookup 404s; the admin list still carries it.
      assert.equal((await api().get('/universities/slug-archive-test')).status, 404);
      const list = await admin.client.get('/universities?includeArchived=1');
      assert.ok(list.body.find((row: { id: number }) => row.id === id));
    });
  });
});
