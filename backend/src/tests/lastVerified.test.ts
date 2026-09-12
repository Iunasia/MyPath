import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, closeDb, insertScholarship, pool, registerAndLogin, resetDb } from './helpers';
import { upsertTable } from '../seeds/upsert';

/** Roles are never granted over HTTP, so tests promote directly. */
const signedInAdmin = async (email: string) => {
  const admin = await registerAndLogin({ email });
  await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [admin.id]);
  return admin;
};

const stampOf = async (id: number) => {
  const { rows } = await pool.query(
    'SELECT last_verified, last_verified_by FROM scholarships WHERE id = $1',
    [id]
  );
  return rows[0] as { last_verified: Date | null; last_verified_by: number | null };
};

/** A scholarship row as the importer produces it from the sheet. */
const sheetRow = (title: string, lastVerified: Date | null) => ({
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
  last_verified: lastVerified
});

describe('Last verified (MVP #8)', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('POST /scholarships/:id/verify', () => {
    it('stamps the time and the admin', async () => {
      const id = await insertScholarship();
      const admin = await signedInAdmin('checker@test.com');

      const res = await admin.client.post(`/scholarships/${id}/verify`);
      assert.equal(res.status, 200);
      assert.ok(res.body.scholarship.last_verified, 'last_verified was not stamped');
      assert.equal(res.body.scholarship.last_verified_by, admin.id);
      assert.ok(res.body.infoCheck.lastVerified, 'the Information Check does not carry the date');
    });

    it('shows on the public listing', async () => {
      const id = await insertScholarship();
      const admin = await signedInAdmin('public@test.com');
      await admin.client.post(`/scholarships/${id}/verify`);

      const { body } = await api().get(`/scholarships/${id}`);
      assert.ok(body.infoCheck.lastVerified);
    });

    it('is refused to students', async () => {
      const id = await insertScholarship();
      const { client } = await registerAndLogin();
      const res = await client.post(`/scholarships/${id}/verify`);
      assert.equal(res.status, 403);
    });

    it('is refused when signed out', async () => {
      const id = await insertScholarship();
      const res = await api().post(`/scholarships/${id}/verify`);
      assert.equal(res.status, 401);
    });

    it('returns 404 for an unknown scholarship', async () => {
      const admin = await signedInAdmin('missing@test.com');
      const res = await admin.client.post('/scholarships/999999/verify');
      assert.equal(res.status, 404);
    });

    it('returns 400 for a malformed id', async () => {
      const admin = await signedInAdmin('malformed@test.com');
      const res = await admin.client.post('/scholarships/abc/verify');
      assert.equal(res.status, 400);
    });
  });

  describe('resolving a verification request about a listing', () => {
    const askAbout = async (scholarshipId: number) => {
      const student = await registerAndLogin();
      const res = await student.client
        .post('/verification-requests')
        .send({ scholarshipId, note: 'Is this still right?' });
      return res.body.request.id as number;
    };

    it('stamps the listing when the verdict is legitimate', async () => {
      const id = await insertScholarship();
      const requestId = await askAbout(id);
      const admin = await signedInAdmin('legit@test.com');

      await admin.client
        .patch(`/verification-requests/${requestId}`)
        .send({ status: 'resolved', verdict: 'legitimate', response: 'Checked with the provider.' });

      const stamp = await stampOf(id);
      assert.ok(stamp.last_verified, 'resolving as legitimate did not stamp the listing');
      assert.equal(stamp.last_verified_by, admin.id);
    });

    it('leaves the listing alone for any other verdict', async () => {
      const id = await insertScholarship();
      const requestId = await askAbout(id);
      const admin = await signedInAdmin('outdated@test.com');

      await admin.client
        .patch(`/verification-requests/${requestId}`)
        .send({ status: 'resolved', verdict: 'outdated', response: 'The deadline moved.' });

      assert.equal((await stampOf(id)).last_verified, null);
    });

    it('still resolves a request about a link we do not hold', async () => {
      const student = await registerAndLogin();
      const created = await student.client
        .post('/verification-requests')
        .send({ url: 'https://example.org/offer', title: 'Some offer' });
      const admin = await signedInAdmin('nolisting@test.com');

      const res = await admin.client
        .patch(`/verification-requests/${created.body.request.id}`)
        .send({ status: 'resolved', verdict: 'legitimate' });
      assert.equal(res.status, 200);
    });
  });

  describe('re-seeding', () => {
    it('keeps an admin stamp when the sheet cell is blank', async () => {
      const id = await insertScholarship({ title: 'Kept' });
      const admin = await signedInAdmin('kept@test.com');
      await admin.client.post(`/scholarships/${id}/verify`);
      const before = await stampOf(id);

      await upsertTable(pool, 'scholarships', [sheetRow('Kept', null)]);

      const after = await stampOf(id);
      assert.ok(after.last_verified, 'a re-seed wiped the admin stamp');
      assert.equal(after.last_verified!.getTime(), before.last_verified!.getTime());
      assert.equal(after.last_verified_by, admin.id);
    });

    it('takes a newer date from the sheet, without a name', async () => {
      const id = await insertScholarship({ title: 'Newer' });
      const admin = await signedInAdmin('newer@test.com');
      await admin.client.post(`/scholarships/${id}/verify`);

      const sheetDate = new Date('2099-01-01T00:00:00Z');
      await upsertTable(pool, 'scholarships', [sheetRow('Newer', sheetDate)]);

      const after = await stampOf(id);
      assert.equal(after.last_verified!.getTime(), sheetDate.getTime());
      assert.equal(after.last_verified_by, null, 'the admin was credited with a date they did not record');
    });
  });
});
