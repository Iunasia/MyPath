import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api, closeDb, insertScholarship, pool, registerAndLogin, resetDb } from './helpers';
import { checkLink } from '../utils/linkCheck';

/** Promotes an existing account to admin — roles are never granted over HTTP. */
const makeAdmin = async (userId: number): Promise<void> => {
  await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [userId]);
};

describe('Verification requests (DMIL)', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('checkLink — the automated first pass', () => {
    it('passes a clean official link', () => {
      const result = checkLink('https://cadt.edu.kh/scholarship/', 'Techo Digital Talent');
      assert.equal(result.level, 'low');
      assert.equal(result.sourceType, 'official');
      assert.deepEqual(result.findings, []);
    });

    it('flags a social media post', () => {
      const result = checkLink('https://www.facebook.com/share/p/abc123/', 'Free scholarship');
      assert.equal(result.sourceType, 'social_media');
      assert.ok(result.findings.some(f => /social media/i.test(f)));
    });

    it('flags an upfront fee — the classic scholarship scam', () => {
      const result = checkLink(
        'https://scholarship-offer.xyz/apply',
        'Guaranteed scholarship! Pay a $50 processing fee via Telegram'
      );
      assert.equal(result.level, 'high');
      assert.ok(result.findings.some(f => /fee/i.test(f)));
      assert.ok(result.findings.some(f => /guaranteed/i.test(f)));
    });

    it('flags a throwaway domain and a link shortener', () => {
      assert.ok(checkLink('https://free-money.tk/x').findings.some(f => /throwaway/i.test(f)));
      assert.ok(checkLink('https://bit.ly/abc').findings.some(f => /shortened/i.test(f)));
    });

    it('flags a non-HTTPS link', () => {
      const result = checkLink('http://example.edu.kh/apply');
      assert.ok(result.findings.some(f => /HTTPS/i.test(f)));
    });

    it('never throws on a malformed URL', () => {
      const result = checkLink('not a url at all');
      assert.ok(result.findings.length > 0);
      assert.equal(result.hostname, null);
    });
  });

  describe('POST /verification-requests', () => {
    it('requires authentication', async () => {
      const res = await api().post('/verification-requests').send({ url: 'https://x.edu.kh' });
      assert.equal(res.status, 401);
    });

    it('accepts a link that is not in our catalogue', async () => {
      // The whole point: a student saw this somewhere else.
      const { client } = await registerAndLogin();
      const res = await client
        .post('/verification-requests')
        .send({ url: 'https://www.facebook.com/share/p/xyz/', title: '100% Free Scholarship' });

      assert.equal(res.status, 201);
      assert.equal(res.body.request.scholarship_id, null);
      assert.equal(res.body.request.status, 'pending');
      assert.ok(res.body.autoCheck, 'no automated check was returned');
    });

    it('returns the automated verdict immediately', async () => {
      const { client } = await registerAndLogin();
      const res = await client.post('/verification-requests').send({
        url: 'https://win-scholarship.xyz',
        note: 'They want a processing fee paid by Western Union'
      });

      assert.equal(res.body.autoCheck.level, 'high');
      assert.ok(res.body.autoCheck.findings.length > 0);
    });

    it('can reference a scholarship we already hold', async () => {
      const id = await insertScholarship({ title: 'Techo' });
      const { client } = await registerAndLogin();

      const res = await client
        .post('/verification-requests')
        .send({ scholarshipId: id, note: 'Is the deadline still right?' });

      assert.equal(res.status, 201);
      assert.equal(res.body.request.scholarship_id, id);
      assert.equal(res.body.request.submitted_title, 'Techo');
    });

    it('rejects an empty submission', async () => {
      const { client } = await registerAndLogin();
      const res = await client.post('/verification-requests').send({});
      assert.equal(res.status, 400);
    });

    it('returns 404 for an unknown scholarship id', async () => {
      const { client } = await registerAndLogin();
      const res = await client
        .post('/verification-requests')
        .send({ scholarshipId: 999999, title: 'x' });
      assert.equal(res.status, 404);
    });
  });

  describe('GET /verification-requests — the student inbox', () => {
    it('lists only the caller\'s own requests', async () => {
      const alice = await registerAndLogin({ email: 'alice-vr@test.com' });
      await alice.client.post('/verification-requests').send({ title: 'Alice asked this' });

      const bob = await registerAndLogin({ email: 'bob-vr@test.com' });
      const res = await bob.client.get('/verification-requests');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body.requests, []);
    });

    it('reports how many answers are unread', async () => {
      const student = await registerAndLogin({ email: 'unread@test.com' });
      const created = await student.client
        .post('/verification-requests')
        .send({ title: 'Check this' });

      const admin = await registerAndLogin({ email: 'admin-vr@test.com' });
      await makeAdmin(admin.id);
      await admin.client
        .patch(`/verification-requests/${created.body.request.id}`)
        .send({ status: 'resolved', verdict: 'scam', response: 'This one is fake.' });

      const inbox = await student.client.get('/verification-requests');
      assert.equal(inbox.body.unread, 1);
    });

    it('clears the unread flag once the student opens it', async () => {
      const student = await registerAndLogin({ email: 'read@test.com' });
      const created = await student.client
        .post('/verification-requests')
        .send({ title: 'Check this' });
      const id = created.body.request.id;

      const admin = await registerAndLogin({ email: 'admin-read@test.com' });
      await makeAdmin(admin.id);
      await admin.client
        .patch(`/verification-requests/${id}`)
        .send({ status: 'resolved', verdict: 'legitimate' });

      await student.client.get(`/verification-requests/${id}`);

      const inbox = await student.client.get('/verification-requests');
      assert.equal(inbox.body.unread, 0);
    });
  });

  describe('GET /verification-requests/:id', () => {
    it('does not let one student read another\'s request', async () => {
      const alice = await registerAndLogin({ email: 'alice-read@test.com' });
      const created = await alice.client
        .post('/verification-requests')
        .send({ title: 'Private question' });

      const bob = await registerAndLogin({ email: 'bob-read@test.com' });
      const res = await bob.client.get(`/verification-requests/${created.body.request.id}`);

      assert.equal(res.status, 403);
    });

    it('lets an admin read any request', async () => {
      const student = await registerAndLogin({ email: 'student-any@test.com' });
      const created = await student.client
        .post('/verification-requests')
        .send({ title: 'A question' });

      const admin = await registerAndLogin({ email: 'admin-any@test.com' });
      await makeAdmin(admin.id);
      const res = await admin.client.get(`/verification-requests/${created.body.request.id}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.submitted_title, 'A question');
    });
  });

  describe('GET /verification-requests/all — the review queue', () => {
    it('is refused to students', async () => {
      const { client } = await registerAndLogin();
      const res = await client.get('/verification-requests/all');
      assert.equal(res.status, 403);
    });

    it('is refused when signed out', async () => {
      const res = await api().get('/verification-requests/all');
      assert.equal(res.status, 401);
    });

    it('shows admins every request, pending first', async () => {
      const student = await registerAndLogin({ email: 'queue@test.com' });
      const first = await student.client.post('/verification-requests').send({ title: 'One' });
      await student.client.post('/verification-requests').send({ title: 'Two' });

      const admin = await registerAndLogin({ email: 'admin-queue@test.com' });
      await makeAdmin(admin.id);
      await admin.client
        .patch(`/verification-requests/${first.body.request.id}`)
        .send({ status: 'resolved', verdict: 'legitimate' });

      const res = await admin.client.get('/verification-requests/all');
      assert.equal(res.body.length, 2);
      assert.equal(res.body[0].status, 'pending', 'pending requests should sort first');
    });

    it('carries who submitted each request', async () => {
      const student = await registerAndLogin({ email: 'named@test.com', name: 'Sokha' });
      await student.client.post('/verification-requests').send({ title: 'Question' });

      const admin = await registerAndLogin({ email: 'admin-named@test.com' });
      await makeAdmin(admin.id);
      const [row] = (await admin.client.get('/verification-requests/all')).body;

      assert.equal(row.submitted_by_name, 'Sokha');
      assert.equal(row.submitted_by_email, 'named@test.com');
    });
  });

  describe('PATCH /verification-requests/:id — recording a decision', () => {
    const setup = async (email: string) => {
      const student = await registerAndLogin({ email: `s-${email}` });
      const created = await student.client
        .post('/verification-requests')
        .send({ title: 'Check this one' });
      const admin = await registerAndLogin({ email: `a-${email}` });
      await makeAdmin(admin.id);
      return { student, admin, id: created.body.request.id as number };
    };

    it('is refused to students', async () => {
      const { student, id } = await setup('refuse@test.com');
      const res = await student.client
        .patch(`/verification-requests/${id}`)
        .send({ status: 'resolved', verdict: 'scam' });

      assert.equal(res.status, 403);
    });

    it('records the verdict, the reviewer and the time', async () => {
      const { admin, id } = await setup('record@test.com');
      const res = await admin.client
        .patch(`/verification-requests/${id}`)
        .send({ status: 'resolved', verdict: 'scam', response: 'Asks for a fee. Not real.' });

      assert.equal(res.status, 200);
      assert.equal(res.body.verdict, 'scam');
      assert.equal(res.body.admin_response, 'Asks for a fee. Not real.');
      assert.equal(res.body.reviewed_by, admin.id);
      assert.ok(res.body.reviewed_at, 'reviewed_at was not stamped');
    });

    it('refuses to resolve without a verdict', async () => {
      const { admin, id } = await setup('noverdict@test.com');
      const res = await admin.client.patch(`/verification-requests/${id}`).send({ status: 'resolved' });

      assert.equal(res.status, 400);
    });

    it('allows claiming a request without resolving it', async () => {
      const { admin, id } = await setup('claim@test.com');
      const res = await admin.client.patch(`/verification-requests/${id}`).send({ status: 'reviewing' });

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'reviewing');
      assert.equal(res.body.reviewed_at, null);
    });

    it('rejects an unknown verdict', async () => {
      const { admin, id } = await setup('badverdict@test.com');
      const res = await admin.client
        .patch(`/verification-requests/${id}`)
        .send({ status: 'resolved', verdict: 'definitely-fake' });

      assert.equal(res.status, 400);
    });

    it('returns 404 for an unknown request', async () => {
      const admin = await registerAndLogin({ email: 'admin-404@test.com' });
      await makeAdmin(admin.id);
      const res = await admin.client
        .patch('/verification-requests/999999')
        .send({ status: 'resolved', verdict: 'scam' });

      assert.equal(res.status, 404);
    });
  });

  describe('Rate limiting submissions', () => {
    /**
     * The limiter skips itself under NODE_ENV=test, so this lifts the skip for
     * one test. It must stay the only such test in this file: the limiter's
     * counts live in memory for the whole run, and user ids restart at 1 after
     * every reset.
     */
    it('allows 10 accepted submissions an hour per account, then answers 429', async (t) => {
      // Registered before the skip is lifted, so the auth limiter stays out of it.
      const heavy = await registerAndLogin({ email: 'heavy@test.com' });
      const other = await registerAndLogin({ email: 'other@test.com' });

      const previousEnv = process.env.NODE_ENV;
      const previousToken = process.env.TELEGRAM_BOT_TOKEN;
      process.env.NODE_ENV = 'ratelimit-test';
      // Lifting the test env also lifts Telegram's test guard — never page the real group.
      delete process.env.TELEGRAM_BOT_TOKEN;
      t.after(() => {
        process.env.NODE_ENV = previousEnv;
        if (previousToken !== undefined) process.env.TELEGRAM_BOT_TOKEN = previousToken;
      });

      // Rejected submissions never reach Telegram, so they don't use up the budget.
      for (let i = 0; i < 3; i++) {
        const res = await heavy.client.post('/verification-requests').send({});
        assert.equal(res.status, 400);
      }

      for (let i = 1; i <= 10; i++) {
        const res = await heavy.client.post('/verification-requests').send({ title: `Question ${i}` });
        assert.equal(res.status, 201, `submission ${i} was refused`);
      }

      const blocked = await heavy.client.post('/verification-requests').send({ title: 'One too many' });
      assert.equal(blocked.status, 429);
      assert.ok(blocked.body.error, 'the 429 should carry a JSON error the page can show');

      // The budget belongs to the account, not the connection.
      const fine = await other.client.post('/verification-requests').send({ title: 'My first question' });
      assert.equal(fine.status, 201, "one student's limit blocked another student");
    });
  });
});
