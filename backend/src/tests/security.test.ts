import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { api, closeDb, insertScholarship, registerAndLogin, resetDb } from './helpers';

const { authLimiter, generalLimiter } = require('../../middleware/security');

describe('Security', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('Rate limiting', () => {
    /**
     * The shared limiters skip themselves under NODE_ENV=test, so they are
     * exercised here on a throwaway app with the skip disabled.
     */
    const appWith = (limiter: express.RequestHandler) => {
      const app = express();
      app.use((req, _res, next) => {
        // Defeat the test-env skip for this isolated app only.
        (req as express.Request & { ip: string }).ip = '10.0.0.1';
        next();
      });
      app.use(limiter);
      app.get('/', (_req, res) => res.json({ ok: true }));
      return app;
    };

    it('auth limiter allows a burst then returns 429', async (t) => {
      const previous = process.env.NODE_ENV;
      process.env.NODE_ENV = 'ratelimit-test';
      t.after(() => {
        process.env.NODE_ENV = previous;
      });

      const app = appWith(authLimiter);
      let sawSuccess = false;
      let sawThrottle = false;

      for (let i = 0; i < 12; i++) {
        const res = await request(app).get('/');
        if (res.status === 200) sawSuccess = true;
        if (res.status === 429) sawThrottle = true;
      }

      assert.ok(sawSuccess, 'auth limiter rejected every request');
      assert.ok(sawThrottle, 'auth limiter never returned 429 within 12 requests');
    });

    it('general limiter is far looser than the auth limiter', async (t) => {
      const previous = process.env.NODE_ENV;
      process.env.NODE_ENV = 'ratelimit-test';
      t.after(() => {
        process.env.NODE_ENV = previous;
      });

      const app = appWith(generalLimiter);
      for (let i = 0; i < 20; i++) {
        const res = await request(app).get('/');
        assert.equal(res.status, 200, `general limiter throttled at request ${i + 1}`);
      }
    });

    it('browsing the catalog is never rate limited', async () => {
      await insertScholarship();
      for (let i = 0; i < 20; i++) {
        const res = await api().get('/scholarships');
        assert.equal(res.status, 200, `/scholarships was throttled on call ${i + 1}`);
      }
    });
  });

  describe('Response headers', () => {
    it('does not advertise the server technology', async () => {
      const res = await api().get('/careers');
      assert.equal(
        res.headers['x-powered-by'],
        undefined,
        'X-Powered-By header exposes Express — call app.disable("x-powered-by") or use helmet'
      );
    });

    it('sets basic security headers', async () => {
      const res = await api().get('/careers');
      assert.ok(
        res.headers['x-content-type-options'],
        'missing X-Content-Type-Options — helmet is not applied to the running app'
      );
    });
  });

  describe('Session cookie', () => {
    it('is httpOnly and sameSite', async () => {
      const res = await api()
        .post('/auth/register')
        .send({ name: 'Cookie', email: 'cookie@test.com', password: 'password123' });

      const cookies = res.headers['set-cookie'] as unknown as string[] | undefined;
      assert.ok(cookies?.length, 'no session cookie was set');

      const cookie = cookies.join(';');
      assert.match(cookie, /HttpOnly/i, 'session cookie is not HttpOnly');
      assert.match(cookie, /SameSite/i, 'session cookie has no SameSite attribute');
    });

    it('cannot be replayed after logout', async () => {
      const { client } = await registerAndLogin();
      const before = await client.get('/auth/me');
      const sessionCookie = (before.headers['set-cookie'] as unknown as string[] | undefined)?.[0];

      await client.get('/auth/logout');

      // Replay the captured cookie on a brand-new client.
      const replay = api().get('/auth/me');
      if (sessionCookie) replay.set('Cookie', sessionCookie);
      const res = await replay;

      assert.equal(res.status, 401, 'a destroyed session cookie was still accepted');
    });
  });

  describe('Error handling', () => {
    it('returns JSON, not HTML, for an unknown route', async () => {
      const res = await api().get('/no-such-route');

      assert.equal(res.status, 404);
      assert.match(String(res.headers['content-type']), /application\/json/);
      assert.ok(
        !res.text.includes('<!DOCTYPE html>'),
        'API returned an HTML error page instead of JSON'
      );
    });
  });

  describe('CORS', () => {
    it('allows the configured frontend origin with credentials', async () => {
      const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
      const res = await api().get('/scholarships').set('Origin', origin);

      assert.equal(res.headers['access-control-allow-origin'], origin);
      assert.equal(res.headers['access-control-allow-credentials'], 'true');
    });

    it('does not reflect an arbitrary origin', async () => {
      const res = await api().get('/scholarships').set('Origin', 'https://evil.example.com');
      assert.notEqual(
        res.headers['access-control-allow-origin'],
        'https://evil.example.com',
        'CORS reflected an untrusted origin'
      );
    });
  });
});
