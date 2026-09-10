import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  api,
  closeDb,
  insertCareer,
  insertMajor,
  insertScholarship,
  insertUniversity,
  pool,
  registerAndLogin,
  resetDb
} from './helpers';
import { applyMigrations } from '../seeds/schema';

describe('Saved items API', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('GET /saved', () => {
    it('requires authentication', async () => {
      const res = await api().get('/saved');
      assert.equal(res.status, 401);
    });

    it('starts empty for a new user', async () => {
      const { client } = await registerAndLogin();
      const res = await client.get('/saved');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, []);
    });
  });

  describe('POST /saved/:type/:id', () => {
    it('saves each of the four item types', async () => {
      const ids = {
        scholarship: await insertScholarship({ title: 'Techo' }),
        major: await insertMajor({ name: 'Computer Science' }),
        career: await insertCareer({ title: 'Data Analyst' }),
        university: await insertUniversity({ name: 'CADT' })
      };
      const { client } = await registerAndLogin();

      for (const [type, id] of Object.entries(ids)) {
        const res = await client.post(`/saved/${type}/${id}`);
        assert.equal(res.status, 201, `saving a ${type} failed`);
      }

      const saved = await client.get('/saved');
      assert.equal(saved.body.length, 4);
      assert.deepEqual(
        saved.body.map((i: { item_type: string }) => i.item_type).sort(),
        ['career', 'major', 'scholarship', 'university']
      );
    });

    it('returns a title and subtitle for rendering', async () => {
      const id = await insertMajor({ name: 'Cybersecurity', field: 'Technology' });
      const { client } = await registerAndLogin();
      await client.post(`/saved/major/${id}`);

      const [item] = (await client.get('/saved')).body;
      assert.equal(item.title, 'Cybersecurity');
      assert.equal(item.subtitle, 'Technology');
    });

    it('is idempotent', async () => {
      const id = await insertScholarship();
      const { client } = await registerAndLogin();

      await client.post(`/saved/scholarship/${id}`);
      await client.post(`/saved/scholarship/${id}`);

      const saved = await client.get('/saved');
      assert.equal(saved.body.length, 1);
    });

    it('requires authentication', async () => {
      const id = await insertScholarship();
      const res = await api().post(`/saved/scholarship/${id}`);
      assert.equal(res.status, 401);
    });

    it('rejects an unknown item type', async () => {
      const { client } = await registerAndLogin();
      const res = await client.post('/saved/spaceship/1');
      assert.equal(res.status, 400);
    });

    it('returns 404 when the item does not exist', async () => {
      const { client } = await registerAndLogin();
      const res = await client.post('/saved/major/999999');
      assert.equal(res.status, 404);
    });

    it('returns 400 for a non-numeric id', async () => {
      const { client } = await registerAndLogin();
      const res = await client.post('/saved/major/not-a-number');
      assert.equal(res.status, 400);
    });
  });

  describe('DELETE /saved/:type/:id', () => {
    it('removes a saved item', async () => {
      const id = await insertCareer();
      const { client } = await registerAndLogin();
      await client.post(`/saved/career/${id}`);

      const res = await client.delete(`/saved/career/${id}`);
      assert.equal(res.status, 204);

      const saved = await client.get('/saved');
      assert.deepEqual(saved.body, []);
    });

    it('succeeds even when the item was never saved', async () => {
      const id = await insertCareer();
      const { client } = await registerAndLogin();

      const res = await client.delete(`/saved/career/${id}`);
      assert.equal(res.status, 204);
    });

    it('requires authentication', async () => {
      const res = await api().delete('/saved/career/1');
      assert.equal(res.status, 401);
    });
  });

  describe('Isolation between users', () => {
    it('does not show one student the saved items of another', async () => {
      const id = await insertScholarship();
      const alice = await registerAndLogin({ email: 'alice-saved@test.com' });
      await alice.client.post(`/saved/scholarship/${id}`);

      const bob = await registerAndLogin({ email: 'bob-saved@test.com' });
      const res = await bob.client.get('/saved');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, [], "Bob can see Alice's saved items");
    });

    it("deleting one user's item leaves another's intact", async () => {
      const id = await insertScholarship();
      const alice = await registerAndLogin({ email: 'alice2@test.com' });
      const bob = await registerAndLogin({ email: 'bob2@test.com' });

      await alice.client.post(`/saved/scholarship/${id}`);
      await bob.client.post(`/saved/scholarship/${id}`);
      await bob.client.delete(`/saved/scholarship/${id}`);

      assert.equal((await alice.client.get('/saved')).body.length, 1);
      assert.equal((await bob.client.get('/saved')).body.length, 0);
    });
  });

  describe('Retiring saved_opportunities', () => {
    /** The scholarship-only table an older database may still have. */
    const createLegacyTable = () =>
      pool.query(`CREATE TABLE saved_opportunities (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scholarship_id INTEGER NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
        saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, scholarship_id)
      )`);

    const legacyTableExists = async () =>
      (await pool.query(`SELECT to_regclass('saved_opportunities') IS NOT NULL AS present`)).rows[0]
        .present as boolean;

    it('carries old saves into saved_items, then drops the table', async () => {
      const id = await insertScholarship();
      const { client, id: userId } = await registerAndLogin();

      await createLegacyTable();
      await pool.query('INSERT INTO saved_opportunities (user_id, scholarship_id) VALUES ($1, $2)', [
        userId,
        id
      ]);

      await applyMigrations(pool);

      const saved = (await client.get('/saved')).body;
      assert.equal(saved.length, 1, 'the old save was lost');
      assert.equal(saved[0].item_type, 'scholarship');
      assert.equal(saved[0].item_id, id);
      assert.equal(await legacyTableExists(), false, 'the retired table was not dropped');
    });

    it('does not duplicate a save present in both tables', async () => {
      const id = await insertScholarship();
      const { client, id: userId } = await registerAndLogin();
      await client.post(`/saved/scholarship/${id}`);

      await createLegacyTable();
      await pool.query('INSERT INTO saved_opportunities (user_id, scholarship_id) VALUES ($1, $2)', [
        userId,
        id
      ]);

      await applyMigrations(pool);

      assert.equal((await client.get('/saved')).body.length, 1);
    });
  });
});
