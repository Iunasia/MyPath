import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { agent, api, closeDb, registerAndLogin, resetDb } from './helpers';

describe('Auth API', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('POST /auth/register', () => {
    it('creates a user and returns 201 with the user object', async () => {
      const res = await api()
        .post('/auth/register')
        .send({ name: 'Sokha', email: 'sokha@test.com', password: 'password123' });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.email, 'sokha@test.com');
      assert.equal(res.body.user.name, 'Sokha');
      assert.equal(res.body.user.role, 'student');
      assert.ok(res.body.user.id);
    });

    it('never returns the password hash', async () => {
      const res = await api()
        .post('/auth/register')
        .send({ name: 'Sokha', email: 'sokha@test.com', password: 'password123' });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.password, undefined, 'register leaked the password field');
      assert.ok(
        !JSON.stringify(res.body).includes('$2b$'),
        'response body contains a bcrypt hash'
      );
    });

    it('starts an authenticated session', async () => {
      const client = agent();
      await client
        .post('/auth/register')
        .send({ name: 'Sokha', email: 'sokha@test.com', password: 'password123' });

      const me = await client.get('/auth/me');
      assert.equal(me.status, 200);
      assert.equal(me.body.user.email, 'sokha@test.com');
    });

    it('rejects a duplicate email with 400', async () => {
      const user = { name: 'Sokha', email: 'dupe@test.com', password: 'password123' };
      await api().post('/auth/register').send(user);

      const res = await api().post('/auth/register').send(user);
      assert.equal(res.status, 400);
      assert.ok(res.body.error);
    });

    it('rejects a request with no body', async () => {
      const res = await api().post('/auth/register').send({});
      assert.ok(
        res.status >= 400 && res.status < 500,
        `expected a 4xx for an empty body, got ${res.status}`
      );
    });

    it('ignores a client-supplied role and always creates a student', async () => {
      // Privilege escalation: role must never be taken from the request body.
      const res = await api()
        .post('/auth/register')
        .send({ name: 'Mallory', email: 'mallory@test.com', password: 'password123', role: 'admin' });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.role, 'student', 'client escalated its own role to admin');
    });

    it('refuses when already logged in', async () => {
      const { client } = await registerAndLogin();
      const res = await client
        .post('/auth/register')
        .send({ name: 'Other', email: 'other@test.com', password: 'password123' });

      assert.equal(res.status, 403);
    });
  });

  describe('POST /auth/login', () => {
    const user = { name: 'Sokha', email: 'login@test.com', password: 'password123' };

    beforeEach(async () => {
      await api().post('/auth/register').send(user);
    });

    it('accepts correct credentials', async () => {
      const res = await api()
        .post('/auth/login')
        .send({ email: user.email, password: user.password });

      assert.equal(res.status, 200);
      assert.equal(res.body.user.email, user.email);
    });

    it('never returns the password hash', async () => {
      const res = await api()
        .post('/auth/login')
        .send({ email: user.email, password: user.password });

      assert.equal(res.status, 200);
      assert.equal(res.body.user.password, undefined, 'login leaked the password hash');
      assert.ok(
        !JSON.stringify(res.body).includes('$2b$'),
        'login response contains a bcrypt hash'
      );
    });

    it('rejects a wrong password with 401', async () => {
      const res = await api()
        .post('/auth/login')
        .send({ email: user.email, password: 'wrong-password' });

      assert.equal(res.status, 401);
    });

    it('rejects an unknown email with 401', async () => {
      const res = await api()
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });

      assert.equal(res.status, 401);
    });

    it('gives the same error for a wrong password and an unknown user', async () => {
      // Distinct messages would let an attacker enumerate registered emails.
      const wrongPassword = await api()
        .post('/auth/login')
        .send({ email: user.email, password: 'wrong-password' });
      const unknownUser = await api()
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });

      assert.equal(wrongPassword.body.error, unknownUser.body.error);
    });
  });

  describe('GET /auth/me', () => {
    it('returns 401 when there is no session', async () => {
      const res = await api().get('/auth/me');
      assert.equal(res.status, 401);
    });

    it('returns the current user when logged in', async () => {
      const { client, user } = await registerAndLogin();
      const res = await client.get('/auth/me');

      assert.equal(res.status, 200);
      assert.equal(res.body.user.email, user.email);
      assert.equal(res.body.user.password, undefined);
    });

    it('is not rate limited by normal browsing', async (t) => {
      // The frontend calls /auth/me on every page load, so a brute-force
      // limiter scoped to the whole /auth router logs real users out after a
      // few navigations. The limiter skips itself under NODE_ENV=test, so it
      // is switched back on here — otherwise this test would pass vacuously.
      const { client } = await registerAndLogin();

      const previous = process.env.NODE_ENV;
      process.env.NODE_ENV = 'ratelimit-check';
      t.after(() => {
        process.env.NODE_ENV = previous;
      });

      for (let i = 0; i < 15; i++) {
        const res = await client.get('/auth/me');
        assert.equal(
          res.status,
          200,
          `/auth/me was throttled on call ${i + 1} — the brute-force limiter ` +
            'should cover only login and register, not session checks'
        );
      }
    });
  });

  describe('GET /auth/logout', () => {
    it('ends the session', async () => {
      const { client } = await registerAndLogin();
      assert.equal((await client.get('/auth/me')).status, 200);

      const res = await client.get('/auth/logout');
      assert.equal(res.status, 200);

      assert.equal((await client.get('/auth/me')).status, 401);
    });

    it('succeeds even with no active session', async () => {
      const res = await api().get('/auth/logout');
      assert.equal(res.status, 200);
    });
  });

  describe('GET /auth/google', () => {
    it('reports 503 when OAuth credentials are not configured', async () => {
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        return; // configured in this environment; redirect path is untestable offline
      }
      const res = await api().get('/auth/google');
      assert.equal(res.status, 503);
    });
  });
});
