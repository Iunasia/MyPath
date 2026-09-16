import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, closeDb, registerAndLogin, resetDb } from './helpers';

describe('Profile API', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('PATCH /auth/me', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await api().patch('/auth/me').send({ name: 'New Name' });
      assert.equal(res.status, 401);
    });

    it('updates the name and returns the updated user', async () => {
      const { client } = await registerAndLogin({ name: 'Old Name' });

      const res = await client.patch('/auth/me').send({ name: 'New Name' });
      assert.equal(res.status, 200);
      assert.equal(res.body.user.name, 'New Name');
    });

    it('persists the change across requests', async () => {
      const { client } = await registerAndLogin({ name: 'Old Name' });
      await client.patch('/auth/me').send({ name: 'New Name' });

      const me = await client.get('/auth/me');
      assert.equal(me.status, 200);
      assert.equal(me.body.user.name, 'New Name');
    });

    it('rejects an empty name with 400', async () => {
      const { client } = await registerAndLogin();

      const res = await client.patch('/auth/me').send({ name: '' });
      assert.equal(res.status, 400);
      assert.ok(res.body.error);
    });

    it('rejects a whitespace-only name with 400', async () => {
      const { client } = await registerAndLogin();

      const res = await client.patch('/auth/me').send({ name: '   ' });
      assert.equal(res.status, 400);
    });

    it('rejects a missing name field with 400', async () => {
      const { client } = await registerAndLogin();

      const res = await client.patch('/auth/me').send({});
      assert.equal(res.status, 400);
    });

    it('rejects a name over the length limit with 400', async () => {
      const { client } = await registerAndLogin();

      const res = await client.patch('/auth/me').send({ name: 'x'.repeat(101) });
      assert.equal(res.status, 400);
    });

    it('never returns the password field', async () => {
      const { client } = await registerAndLogin();

      const res = await client.patch('/auth/me').send({ name: 'New Name' });
      assert.equal(res.status, 200);
      assert.equal(res.body.user.password, undefined, 'update leaked the password field');
      assert.ok(
        !JSON.stringify(res.body).includes('$2b$'),
        'response body contains a bcrypt hash'
      );
    });

    it("does not change other users' names", async () => {
      const a = await registerAndLogin({ name: 'User A' });
      const b = await registerAndLogin({ name: 'User B' });

      await a.client.patch('/auth/me').send({ name: 'User A Updated' });

      const meB = await b.client.get('/auth/me');
      assert.equal(meB.body.user.name, 'User B');
    });
  });
});
