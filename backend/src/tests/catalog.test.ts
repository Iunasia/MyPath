import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  api,
  closeDb,
  insertCareer,
  insertMajor,
  insertScholarship,
  insertUniversity,
  resetDb
} from './helpers';

describe('Catalog API (careers, majors, universities)', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('GET /careers', () => {
    it('returns an empty array when there are none', async () => {
      const res = await api().get('/careers');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, []);
    });

    it('returns careers ordered by category then title', async () => {
      await insertCareer({ title: 'Zoologist', category: 'Science' });
      await insertCareer({ title: 'Architect', category: 'Design' });
      await insertCareer({ title: 'Animator', category: 'Design' });

      const res = await api().get('/careers');
      assert.deepEqual(
        res.body.map((c: { title: string }) => c.title),
        ['Animator', 'Architect', 'Zoologist']
      );
    });

    it('returns list columns as arrays', async () => {
      await insertCareer({ required_skills: ['SQL', 'Python'], related_majors: ['Data Science'] });
      const [career] = (await api().get('/careers')).body;

      assert.deepEqual(career.required_skills, ['SQL', 'Python']);
      assert.deepEqual(career.related_majors, ['Data Science']);
    });

    it('returns null for fields the source sheet does not supply', async () => {
      await insertCareer({ average_salary: null });
      const [career] = (await api().get('/careers')).body;

      assert.equal(career.average_salary, null);
    });
  });

  describe('GET /careers/:id', () => {
    it('returns a single career', async () => {
      const id = await insertCareer({ title: 'Data Analyst' });
      const res = await api().get(`/careers/${id}`);

      assert.equal(res.status, 200, 'GET /careers/:id is not implemented');
      assert.equal(res.body.title ?? res.body.career?.title, 'Data Analyst');
    });

    it('returns 404 for an unknown id', async () => {
      const res = await api().get('/careers/999999');
      assert.equal(res.status, 404);
    });
  });

  describe('GET /majors', () => {
    it('returns majors ordered by field then name', async () => {
      await insertMajor({ name: 'Physics', field: 'Science' });
      await insertMajor({ name: 'Accounting', field: 'Business' });

      const res = await api().get('/majors');
      assert.equal(res.status, 200);
      assert.deepEqual(
        res.body.map((m: { name: string }) => m.name),
        ['Accounting', 'Physics']
      );
    });

    it('returns the related universities and scholarships as arrays', async () => {
      await insertMajor({ universities: ['CADT', 'RUPP'], related_scholarships: ['Techo'] });
      const [major] = (await api().get('/majors')).body;

      assert.deepEqual(major.universities, ['CADT', 'RUPP']);
      assert.deepEqual(major.related_scholarships, ['Techo']);
    });
  });

  describe('GET /majors/:id', () => {
    it('returns a single major', async () => {
      const id = await insertMajor({ name: 'Cybersecurity' });
      const res = await api().get(`/majors/${id}`);

      assert.equal(res.status, 200, 'GET /majors/:id is not implemented');
      assert.equal(res.body.name ?? res.body.major?.name, 'Cybersecurity');
    });

    it('returns 404 for an unknown id', async () => {
      const res = await api().get('/majors/999999');
      assert.equal(res.status, 404);
    });
  });

  describe('GET /universities', () => {
    it('returns universities ordered by name', async () => {
      await insertUniversity({ name: 'RUPP' });
      await insertUniversity({ name: 'CADT' });

      const res = await api().get('/universities');
      assert.equal(res.status, 200);
      assert.deepEqual(
        res.body.map((u: { name: string }) => u.name),
        ['CADT', 'RUPP']
      );
    });
  });

  describe('GET /universities/:id', () => {
    it('returns a single university', async () => {
      const id = await insertUniversity({ name: 'CADT' });
      const res = await api().get(`/universities/${id}`);

      assert.equal(res.status, 200, 'GET /universities/:id is not implemented');
      assert.equal(res.body.name ?? res.body.university?.name, 'CADT');
    });

    it('returns 404 for an unknown id', async () => {
      const res = await api().get('/universities/999999');
      assert.equal(res.status, 404);
    });

    it('also resolves a university by its slug', async () => {
      // The frontend links to /universities/cadt, so the slug has to work too.
      await insertUniversity({ name: 'Cambodia Academy of Digital Technology', slug: 'cadt' });
      const res = await api().get('/universities/cadt');

      assert.equal(res.status, 200, 'slug lookup is not supported');
      assert.equal(res.body.name, 'Cambodia Academy of Digital Technology');
    });

    it('returns 404 for an unknown slug', async () => {
      const res = await api().get('/universities/not-a-real-university');
      assert.equal(res.status, 404);
    });
  });

  describe('GET /', () => {
    it('returns counts for the home page', async () => {
      await insertScholarship();
      await insertScholarship();
      await insertUniversity();

      const res = await api().get('/');
      assert.equal(res.status, 200);
      assert.equal(res.body.scholarshipCount, 2);
      assert.equal(res.body.universityCount, 1);
    });
  });

  describe('Unknown routes', () => {
    it('returns 404 for a route that does not exist', async () => {
      const res = await api().get('/does-not-exist');
      assert.equal(res.status, 404);
    });
  });
});
