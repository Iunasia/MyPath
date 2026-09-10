import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, closeDb, insertScholarship, resetDb } from './helpers';

// Saving a scholarship is covered in saved.test.ts — the old
// POST /scholarships/:id/save and GET /dashboard were retired in favour of /saved.

describe('Scholarships API', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('GET /scholarships', () => {
    it('returns an empty array when there are none', async () => {
      const res = await api().get('/scholarships');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, []);
    });

    it('returns every scholarship', async () => {
      await insertScholarship({ title: 'One' });
      await insertScholarship({ title: 'Two' });

      const res = await api().get('/scholarships');
      assert.equal(res.status, 200);
      assert.equal(res.body.length, 2);
    });

    it('attaches an infoCheck to each item', async () => {
      await insertScholarship();
      const res = await api().get('/scholarships');
      assert.ok(res.body[0].infoCheck, 'infoCheck missing from list item');
    });

    it('orders by deadline, with undated entries last', async () => {
      await insertScholarship({ title: 'No deadline', deadline: null, deadline_note: 'Not announced' });
      await insertScholarship({ title: 'Later', deadline: new Date('2026-12-01T00:00:00Z') });
      await insertScholarship({ title: 'Sooner', deadline: new Date('2026-06-01T00:00:00Z') });

      const res = await api().get('/scholarships');
      assert.deepEqual(
        res.body.map((s: { title: string }) => s.title),
        ['Sooner', 'Later', 'No deadline']
      );
    });

    it('exposes the DMIL provenance fields', async () => {
      await insertScholarship();
      const [item] = (await api().get('/scholarships')).body;

      for (const field of ['source', 'source_url', 'source_type', 'verified_status', 'safety_warnings']) {
        assert.ok(field in item, `missing provenance field: ${field}`);
      }
    });

    it('never exposes a scholarship without its original source', async () => {
      await insertScholarship();
      const [item] = (await api().get('/scholarships')).body;
      assert.ok(item.source_url !== undefined);
    });
  });

  describe('GET /scholarships/:id', () => {
    it('returns the scholarship and its infoCheck', async () => {
      const id = await insertScholarship({ title: 'Techo Digital Talent' });

      const res = await api().get(`/scholarships/${id}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.scholarship.id, id);
      assert.equal(res.body.title, 'Techo Digital Talent');
      assert.ok(res.body.infoCheck);
    });

    it('returns 404 for an unknown id', async () => {
      const res = await api().get('/scholarships/999999');
      assert.equal(res.status, 404);
    });

    it('returns 4xx for a non-numeric id rather than crashing', async () => {
      const res = await api().get('/scholarships/not-a-number');
      assert.ok(
        res.status >= 400 && res.status < 500,
        `expected 4xx for a malformed id, got ${res.status}`
      );
    });

    it('serialises array columns as arrays', async () => {
      const id = await insertScholarship({
        documents: ['ID', 'Transcript'],
        safety_warnings: ['Link points to a social media post.']
      });

      const { body } = await api().get(`/scholarships/${id}`);
      assert.deepEqual(body.scholarship.documents, ['ID', 'Transcript']);
      assert.equal(body.scholarship.safety_warnings.length, 1);
    });
  });

  describe('infoCheck (DMIL)', () => {
    it('reports a flagged scholarship as risky', async () => {
      const id = await insertScholarship({
        verified_status: 'flagged',
        source_type: 'social_media',
        safety_warnings: ['Link points to a social media post rather than an official application page.']
      });

      const { body } = await api().get(`/scholarships/${id}`);
      assert.equal(body.infoCheck.isRisky, true, 'a flagged scholarship was reported as safe');
      assert.ok(
        body.infoCheck.reasons.length > 0,
        'flagged scholarship has no reasons in its infoCheck'
      );
    });

    it('reports a verified official scholarship as not risky', async () => {
      const id = await insertScholarship({
        verified_status: 'verified',
        source_type: 'official',
        safety_warnings: []
      });

      const { body } = await api().get(`/scholarships/${id}`);
      assert.equal(body.infoCheck.isRisky, false);
      assert.deepEqual(body.infoCheck.reasons, []);
    });

    it('surfaces the stored safety warnings', async () => {
      const warning = 'No official link listed in the source sheet — verify before applying.';
      const id = await insertScholarship({
        verified_status: 'unverified',
        source_type: 'unknown',
        source_url: '',
        application_link: '',
        safety_warnings: [warning]
      });

      const { body } = await api().get(`/scholarships/${id}`);
      assert.ok(
        body.infoCheck.reasons.includes(warning),
        `stored safety warning not surfaced; got ${JSON.stringify(body.infoCheck.reasons)}`
      );
    });
  });

  describe('Retired routes', () => {
    it('no longer serves POST /scholarships/:id/save — saving is POST /saved/scholarship/:id', async () => {
      const id = await insertScholarship();
      const res = await api().post(`/scholarships/${id}/save`);
      assert.equal(res.status, 404);
    });

    it('no longer serves GET /dashboard — use /auth/me and /saved', async () => {
      const res = await api().get('/dashboard');
      assert.equal(res.status, 404);
    });
  });
});
