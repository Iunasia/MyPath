import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, closeDb, pool, registerAndLogin, resetDb } from './helpers';

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

    it('updates bio, location, website, date of birth, and gender', async () => {
      const { client } = await registerAndLogin();

      const res = await client.patch('/auth/me').send({
        name: 'Test Student',
        bio: 'I love learning.',
        location: 'Phnom Penh',
        website: 'https://example.com',
        date_of_birth: '2000-01-15',
        gender: 'other',
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.user.bio, 'I love learning.');
      assert.equal(res.body.user.location, 'Phnom Penh');
      assert.equal(res.body.user.website, 'https://example.com');
      assert.equal(res.body.user.gender, 'other');
      assert.ok(String(res.body.user.date_of_birth).startsWith('2000-01-15'));
    });

    it('clears an optional field when sent as an empty string', async () => {
      const { client } = await registerAndLogin();
      await client.patch('/auth/me').send({ name: 'Test Student', bio: 'Hello there' });

      const res = await client.patch('/auth/me').send({ name: 'Test Student', bio: '' });
      assert.equal(res.status, 200);
      assert.equal(res.body.user.bio, null);
    });

    it('rejects a website without a valid protocol with 400', async () => {
      const { client } = await registerAndLogin();
      const res = await client.patch('/auth/me').send({ name: 'Test Student', website: 'not-a-url' });
      assert.equal(res.status, 400);
    });

    it('rejects a date of birth in the future with 400', async () => {
      const { client } = await registerAndLogin();
      const futureYear = new Date().getFullYear() + 1;
      const res = await client
        .patch('/auth/me')
        .send({ name: 'Test Student', date_of_birth: `${futureYear}-01-01` });
      assert.equal(res.status, 400);
    });

    it('rejects a malformed date of birth with 400', async () => {
      const { client } = await registerAndLogin();
      const res = await client.patch('/auth/me').send({ name: 'Test Student', date_of_birth: 'not-a-date' });
      assert.equal(res.status, 400);
    });

    it('rejects an invalid gender value with 400', async () => {
      const { client } = await registerAndLogin();
      const res = await client.patch('/auth/me').send({ name: 'Test Student', gender: 'robot' });
      assert.equal(res.status, 400);
    });

    it('rejects a bio over the length limit with 400', async () => {
      const { client } = await registerAndLogin();
      const res = await client.patch('/auth/me').send({ name: 'Test Student', bio: 'x'.repeat(501) });
      assert.equal(res.status, 400);
    });
  });

  describe('PATCH /me/password', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await api()
        .patch('/auth/me/password')
        .send({ currentPassword: 'password123', newPassword: 'newpassword456' });
      assert.equal(res.status, 401);
    });

    it('rejects a wrong current password with 400', async () => {
      const { client } = await registerAndLogin({ password: 'password123' });
      const res = await client
        .patch('/auth/me/password')
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword456' });
      assert.equal(res.status, 400);
    });

    it('rejects a new password that is too short with 400', async () => {
      const { client } = await registerAndLogin({ password: 'password123' });
      const res = await client
        .patch('/auth/me/password')
        .send({ currentPassword: 'password123', newPassword: 'abc' });
      assert.equal(res.status, 400);
    });

    it('changes the password and allows logging in with the new one', async () => {
      const { client, user } = await registerAndLogin({ password: 'password123' });

      const res = await client
        .patch('/auth/me/password')
        .send({ currentPassword: 'password123', newPassword: 'newpassword456' });
      assert.equal(res.status, 200);

      const loginRes = await api().post('/auth/login').send({ email: user.email, password: 'newpassword456' });
      assert.equal(loginRes.status, 200);

      const oldLoginRes = await api().post('/auth/login').send({ email: user.email, password: 'password123' });
      assert.equal(oldLoginRes.status, 401);
    });

    it("rejects changing a Google-only account's password with 400", async () => {
      const { client, id } = await registerAndLogin({ password: 'password123' });
      await pool.query("UPDATE users SET password = NULL, auth_provider = 'google' WHERE id = $1", [id]);

      const res = await client
        .patch('/auth/me/password')
        .send({ currentPassword: 'password123', newPassword: 'newpassword456' });
      assert.equal(res.status, 400);
    });
  });
});
