import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, closeDb, insertScholarship, pool, registerAndLogin, resetDb } from './helpers';
import { upsertTable } from '../seeds/upsert';

/** Roles are never granted over HTTP, so tests promote directly. */
const signedInAdmin = async () => {
  const admin = await registerAndLogin();
  await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [admin.id]);
  return admin;
};

const validInput = (overrides: Record<string, unknown> = {}) => ({
  title: 'CADT Merit Scholarship',
  provider: 'Cambodia Academy of Digital Technology',
  description: 'Full tuition for top applicants.',
  amount: '100% tuition',
  application_link: 'https://cadt.edu.kh/scholarship',
  deadline: '2026-11-30',
  documents: 'National ID\nHigh school transcript',
  ...overrides
});

/** A scholarship row as the importer produces it from the sheet. */
const sheetRow = (title: string) => ({
  title,
  provider: 'Test University',
  provider_type: 'university',
  description: 'From the sheet.',
  amount: '100% tuition',
  coverage: 'Full tuition',
  eligibility: 'Anyone',
  application_link: 'https://example.edu.kh/apply',
  country: 'Cambodia',
  source: 'example.edu.kh',
  source_url: 'https://example.edu.kh/apply',
  source_type: 'official',
  verified_status: 'verified',
  last_verified: null
});

const titles = async () =>
  (await pool.query('SELECT title FROM scholarships ORDER BY title')).rows.map(r => r.title);

describe('Admin scholarship management', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('POST /scholarships', () => {
    it('adds a listing and derives its provenance from the link', async () => {
      const admin = await signedInAdmin();
      const res = await admin.client.post('/scholarships').send(validInput());

      assert.equal(res.status, 201);
      const s = res.body.scholarship;
      assert.equal(s.origin, 'admin');
      assert.equal(s.created_by, admin.id);
      assert.equal(s.source, 'cadt.edu.kh');
      assert.equal(s.source_type, 'official');
      assert.equal(s.verified_status, 'verified');
      assert.equal(s.provider_type, 'university');
      assert.deepEqual(s.documents, ['National ID', 'High school transcript']);
      assert.equal(s.coverage, 'See official site');
      assert.equal(s.country, 'Cambodia');
      // Midnight in Phnom Penh, like a date typed into the sheet.
      assert.equal(new Date(s.deadline).toISOString(), '2026-11-29T17:00:00.000Z');
      assert.equal(res.body.infoCheck.isRisky, false);

      const listing = await api().get('/scholarships');
      assert.equal(listing.body.length, 1);
    });

    it('accepts a flagged link and returns its warnings', async () => {
      const admin = await signedInAdmin();
      const res = await admin.client
        .post('/scholarships')
        .send(validInput({ application_link: 'https://facebook.com/some-post' }));

      assert.equal(res.status, 201);
      assert.equal(res.body.scholarship.verified_status, 'flagged');
      assert.equal(res.body.infoCheck.isRisky, true);
      assert.ok(res.body.scholarship.safety_warnings.length > 0);
    });

    it('rejects missing required fields', async () => {
      const admin = await signedInAdmin();
      const res = await admin.client.post('/scholarships').send({ title: 'Only a title' });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /provider/);
    });

    it('rejects a link that is not a full URL', async () => {
      const admin = await signedInAdmin();
      const res = await admin.client
        .post('/scholarships')
        .send(validInput({ application_link: 'cadt.edu.kh' }));
      assert.equal(res.status, 400);
    });

    it('rejects a date that does not exist', async () => {
      const admin = await signedInAdmin();
      const res = await admin.client.post('/scholarships').send(validInput({ deadline: '2026-02-30' }));
      assert.equal(res.status, 400);
    });

    it('rejects an unknown opportunity type', async () => {
      const admin = await signedInAdmin();
      const res = await admin.client
        .post('/scholarships')
        .send(validInput({ opportunity_type: 'lottery' }));
      assert.equal(res.status, 400);
    });

    it('refuses a duplicate title with 409', async () => {
      await insertScholarship({ title: 'CADT Merit Scholarship' });
      const admin = await signedInAdmin();
      const res = await admin.client.post('/scholarships').send(validInput());
      assert.equal(res.status, 409);
    });

    it('is refused to students', async () => {
      const { client } = await registerAndLogin();
      const res = await client.post('/scholarships').send(validInput());
      assert.equal(res.status, 403);
    });

    it('is refused when signed out', async () => {
      const res = await api().post('/scholarships').send(validInput());
      assert.equal(res.status, 401);
    });
  });

  describe('DELETE /scholarships/:id', () => {
    it('removes the listing', async () => {
      const id = await insertScholarship();
      const admin = await signedInAdmin();

      const res = await admin.client.delete(`/scholarships/${id}`);
      assert.equal(res.status, 204);
      assert.equal((await api().get(`/scholarships/${id}`)).status, 404);
    });

    it("removes students' saves of it", async () => {
      const id = await insertScholarship();
      const student = await registerAndLogin();
      await student.client.post(`/saved/scholarship/${id}`);
      const admin = await signedInAdmin();

      await admin.client.delete(`/scholarships/${id}`);

      const { rows } = await pool.query(
        "SELECT 1 FROM saved_items WHERE item_type = 'scholarship' AND item_id = $1",
        [id]
      );
      assert.equal(rows.length, 0);
    });

    it('keeps verification requests about it, detached', async () => {
      const id = await insertScholarship();
      const student = await registerAndLogin();
      const created = await student.client
        .post('/verification-requests')
        .send({ scholarshipId: id, note: 'Still open?' });
      const admin = await signedInAdmin();

      await admin.client.delete(`/scholarships/${id}`);

      const { rows } = await pool.query('SELECT scholarship_id FROM verification_requests WHERE id = $1', [
        created.body.request.id
      ]);
      assert.equal(rows.length, 1);
      assert.equal(rows[0].scholarship_id, null);
    });

    it('returns 404 for an unknown scholarship', async () => {
      const admin = await signedInAdmin();
      assert.equal((await admin.client.delete('/scholarships/999999')).status, 404);
    });

    it('returns 400 for a malformed id', async () => {
      const admin = await signedInAdmin();
      assert.equal((await admin.client.delete('/scholarships/abc')).status, 400);
    });

    it('is refused to students', async () => {
      const id = await insertScholarship();
      const { client } = await registerAndLogin();
      assert.equal((await client.delete(`/scholarships/${id}`)).status, 403);
    });

    it('is refused when signed out', async () => {
      const id = await insertScholarship();
      assert.equal((await api().delete(`/scholarships/${id}`)).status, 401);
    });
  });

  describe('re-seeding', () => {
    it('does not bring back an imported listing an admin removed', async () => {
      await upsertTable(pool, 'scholarships', [sheetRow('Kept'), sheetRow('Taken down')]);
      const { rows } = await pool.query("SELECT id FROM scholarships WHERE title = 'Taken down'");
      const admin = await signedInAdmin();
      await admin.client.delete(`/scholarships/${rows[0].id}`);

      const summary = await upsertTable(pool, 'scholarships', [sheetRow('Kept'), sheetRow('Taken down')]);

      assert.deepEqual(await titles(), ['Kept']);
      assert.equal(summary.skipped, 1);
    });

    it('keeps a listing an admin added, though the sheet does not have it', async () => {
      const admin = await signedInAdmin();
      await admin.client.post('/scholarships').send(validInput({ title: 'Added in the app' }));

      await upsertTable(pool, 'scholarships', [sheetRow('From the sheet')]);

      assert.deepEqual(await titles(), ['Added in the app', 'From the sheet']);
    });

    it('imports a removed title again once an admin re-adds it', async () => {
      await upsertTable(pool, 'scholarships', [sheetRow('Back again')]);
      const { rows } = await pool.query("SELECT id FROM scholarships WHERE title = 'Back again'");
      const admin = await signedInAdmin();
      await admin.client.delete(`/scholarships/${rows[0].id}`);
      await admin.client.post('/scholarships').send(validInput({ title: 'Back again' }));

      const summary = await upsertTable(pool, 'scholarships', [sheetRow('Back again')]);

      assert.equal(summary.skipped, 0);
      const { rows: after } = await pool.query("SELECT origin FROM scholarships WHERE title = 'Back again'");
      assert.equal(after[0].origin, 'sheet', 'the sheet did not take the listing over');
    });

    it('does not remember removals of listings an admin added', async () => {
      const admin = await signedInAdmin();
      const created = await admin.client.post('/scholarships').send(validInput());
      await admin.client.delete(`/scholarships/${created.body.scholarship.id}`);

      const { rows } = await pool.query('SELECT 1 FROM removed_scholarships');
      assert.equal(rows.length, 0);
    });
  });
});
