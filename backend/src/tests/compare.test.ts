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
import { buildComparison } from '../utils/compare';

interface Row {
  key: string;
  values: unknown[];
  differs: boolean;
  missing: number[];
  common?: string[];
}
interface Note {
  itemId: number | null;
  level: string;
  text: string;
}

const row = (body: { rows: Row[] }, key: string): Row => {
  const found = body.rows.find(r => r.key === key);
  assert.ok(found, `no "${key}" row in the comparison`);
  return found;
};

/** Keeps fixtures clear of the "deadline has passed" warning. */
const FUTURE = new Date('2099-01-01T10:00:00Z');

describe('Compare', () => {
  before(resetDb);
  beforeEach(resetDb);
  after(closeDb);

  describe('GET /compare — validation', () => {
    it('is public', async () => {
      const a = await insertCareer();
      const b = await insertCareer();
      const res = await api().get(`/compare?type=career&ids=${a},${b}`);
      assert.equal(res.status, 200);
    });

    it('rejects an unknown type', async () => {
      const res = await api().get('/compare?type=spaceship&ids=1,2');
      assert.equal(res.status, 400);
    });

    it('needs at least two items', async () => {
      const a = await insertCareer();
      const res = await api().get(`/compare?type=career&ids=${a}`);
      assert.equal(res.status, 400);
    });

    it('counts a repeated id once', async () => {
      const a = await insertCareer();
      const res = await api().get(`/compare?type=career&ids=${a},${a}`);
      assert.equal(res.status, 400);
    });

    it('allows at most four', async () => {
      const res = await api().get('/compare?type=career&ids=1,2,3,4,5');
      assert.equal(res.status, 400);
    });

    it('rejects an id that is not a positive integer', async () => {
      const res = await api().get('/compare?type=career&ids=1,abc');
      assert.equal(res.status, 400);
    });

    it('answers 404 naming the ids that do not exist', async () => {
      const a = await insertCareer();
      const res = await api().get(`/compare?type=career&ids=${a},999999`);
      assert.equal(res.status, 404);
      assert.deepEqual(res.body.missing, [999999]);
    });

    it('accepts repeated ids= parameters too', async () => {
      const a = await insertCareer();
      const b = await insertCareer();
      const res = await api().get(`/compare?type=career&ids=${a}&ids=${b}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.items.length, 2);
    });
  });

  describe('scholarships', () => {
    it('returns the items in the order they were asked for', async () => {
      const first = await insertScholarship({ title: 'First' });
      const second = await insertScholarship({ title: 'Second' });

      const res = await api().get(`/compare?type=scholarship&ids=${second},${first}`);
      assert.equal(res.status, 200);
      assert.deepEqual(res.body.items.map((i: { id: number }) => i.id), [second, first]);
      assert.equal(res.body.items[0].title, 'Second');
    });

    it('lines every value up with the items', async () => {
      const a = await insertScholarship();
      const b = await insertScholarship();
      const c = await insertScholarship();

      const { body } = await api().get(`/compare?type=scholarship&ids=${a},${b},${c}`);
      for (const r of body.rows as Row[]) {
        assert.equal(r.values.length, 3, `"${r.key}" has the wrong number of values`);
      }
    });

    it('marks which rows differ', async () => {
      const a = await insertScholarship({ provider: 'CADT', amount: '100% tuition' });
      const b = await insertScholarship({ provider: 'AUPP', amount: '100% Tuition ' });

      const { body } = await api().get(`/compare?type=scholarship&ids=${a},${b}`);
      assert.equal(row(body, 'provider').differs, true);
      assert.equal(row(body, 'amount').differs, false, 'case and spacing should not count as a difference');
    });

    it('lists the items that leave a field blank, and says so', async () => {
      const a = await insertScholarship({ documents: ['ID', 'Transcript'] });
      const b = await insertScholarship({ documents: [] });

      const { body } = await api().get(`/compare?type=scholarship&ids=${a},${b}`);
      assert.deepEqual(row(body, 'documents').missing, [b]);
      assert.ok(
        (body.notes as Note[]).some(n => n.itemId === b && /documents/.test(n.text)),
        'no note about the missing documents'
      );
    });

    it('carries the Information Check for each scholarship', async () => {
      const a = await insertScholarship();
      const b = await insertScholarship();

      const { body } = await api().get(`/compare?type=scholarship&ids=${a},${b}`);
      assert.ok(body.items.every((i: { infoCheck?: unknown }) => i.infoCheck));
    });

    it('warns when a deadline has passed', async () => {
      const closed = await insertScholarship({ deadline: new Date('2020-01-01T10:00:00Z') });
      const open = await insertScholarship({ deadline: FUTURE });

      const { body } = await api().get(`/compare?type=scholarship&ids=${closed},${open}`);
      const notes = body.notes as Note[];
      assert.ok(
        notes.some(n => n.itemId === closed && n.level === 'warning' && /closed on 1 Jan 2020/.test(n.text)),
        `expected a closed-deadline warning; got ${JSON.stringify(notes)}`
      );
      assert.ok(!notes.some(n => n.itemId === open && /closed/.test(n.text)));
    });

    it('treats "Not announced" as information, not a blank', async () => {
      const vague = await insertScholarship({ deadline: null, deadline_note: 'Not announced' });
      const dated = await insertScholarship({ deadline: FUTURE });

      const { body } = await api().get(`/compare?type=scholarship&ids=${vague},${dated}`);
      const deadline = row(body, 'deadline');
      assert.deepEqual(deadline.missing, []);
      assert.deepEqual(deadline.values[0], { date: null, note: 'Not announced' });
      assert.ok((body.notes as Note[]).some(n => n.itemId === vague && /Not announced/.test(n.text)));
    });

    it('warns about a listing from a risky source', async () => {
      const risky = await insertScholarship({
        deadline: FUTURE,
        verified_status: 'flagged',
        source_type: 'social_media',
        safety_warnings: ['Link points to a social media post rather than an official application page.']
      });
      const safe = await insertScholarship({ deadline: FUTURE });

      const { body } = await api().get(`/compare?type=scholarship&ids=${risky},${safe}`);
      const notes = body.notes as Note[];
      assert.ok(notes.some(n => n.itemId === risky && n.level === 'warning' && /social media/.test(n.text)));
      assert.ok(!notes.some(n => n.itemId === safe && n.level === 'warning'));
    });

    it('does not count an empty warnings list as missing information', async () => {
      const a = await insertScholarship({ safety_warnings: [] });
      const b = await insertScholarship({ safety_warnings: [] });

      const { body } = await api().get(`/compare?type=scholarship&ids=${a},${b}`);
      assert.deepEqual(row(body, 'safety_warnings').missing, []);
    });
  });

  describe('careers, majors and universities', () => {
    it('finds the skills two careers share', async () => {
      const a = await insertCareer({ required_skills: ['Programming', 'SQL'] });
      const b = await insertCareer({ required_skills: ['sql', 'Statistics'] });

      const { body } = await api().get(`/compare?type=career&ids=${a},${b}`);
      assert.deepEqual(row(body, 'required_skills').common, ['SQL']);
    });

    it('says when none of the options list something', async () => {
      const a = await insertCareer({ average_salary: null });
      const b = await insertCareer({ average_salary: null });

      const { body } = await api().get(`/compare?type=career&ids=${a},${b}`);
      assert.ok(
        (body.notes as Note[]).some(n => n.itemId === null && /salary/.test(n.text)),
        'no note that neither career lists a salary'
      );
    });

    it('compares majors', async () => {
      const a = await insertMajor({ name: 'Computer Science', field: 'Technology' });
      const b = await insertMajor({ name: 'Accounting', field: 'Business' });

      const { body } = await api().get(`/compare?type=major&ids=${a},${b}`);
      assert.equal(body.type, 'major');
      assert.deepEqual(
        body.items.map((i: { title: string; subtitle: string }) => [i.title, i.subtitle]),
        [['Computer Science', 'Technology'], ['Accounting', 'Business']]
      );
    });

    it('compares universities', async () => {
      const a = await insertUniversity();
      const b = await insertUniversity();

      const res = await api().get(`/compare?type=university&ids=${a},${b}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.items[0].subtitle, 'Phnom Penh');
      assert.ok(row(res.body, 'tuition_range'));
    });
  });

  describe('buildComparison', () => {
    it('says "Neither" when two options both leave something out', () => {
      const result = buildComparison('career', [
        { id: 1, title: 'A', required_skills: ['X'], related_majors: [] },
        { id: 2, title: 'B', required_skills: ['Y'], related_majors: [] }
      ]);
      assert.ok(result.notes.some(n => n.text.startsWith('Neither of these lists an average salary')));
    });

    it('judges a passed deadline against the "now" it is given', () => {
      const scholarship = (id: number) => ({ id, title: `S${id}`, deadline: '2026-09-07T10:00:00.000Z' });
      const before = buildComparison('scholarship', [scholarship(1), scholarship(2)], new Date('2026-09-01'));
      const after = buildComparison('scholarship', [scholarship(1), scholarship(2)], new Date('2026-09-10'));

      assert.ok(!before.notes.some(n => /closed/.test(n.text)));
      assert.ok(after.notes.some(n => n.text === 'S1 closed on 7 Sep 2026.'));
    });
  });
});
