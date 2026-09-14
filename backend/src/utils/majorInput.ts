import {
  collectFields,
  isPlainObject,
  readString,
  readStringArray,
  type FieldErrors,
} from './validation';

export interface MajorWrite {
  fields: Record<string, unknown>;
  errors: FieldErrors;
}

/** Validation for admin major create/edit. */
export const parseMajorWrite = (body: unknown, { partial }: { partial: boolean }): MajorWrite => {
  if (!isPlainObject(body)) return { fields: {}, errors: { body: 'Expected a JSON object.' } };

  return collectFields(
    [
      { key: 'name', required: true, read: () => readString(body, 'name', { min: 1, max: 200 }) },
      { key: 'field', read: () => readString(body, 'field', { max: 160 }) },
      { key: 'description', required: true, read: () => readString(body, 'description', { min: 1, max: 5000 }) },
      { key: 'duration', read: () => readString(body, 'duration', { max: 120 }) },
      { key: 'degree_type', read: () => readString(body, 'degree_type', { max: 120 }) },
      { key: 'subjects', read: () => readStringArray(body, 'subjects') },
      { key: 'personality_fit', read: () => readString(body, 'personality_fit', { max: 500 }) },
      { key: 'job_market_demand', read: () => readString(body, 'job_market_demand', { max: 300 }) },
      { key: 'related_careers', read: () => readStringArray(body, 'related_careers') },
      { key: 'universities', read: () => readStringArray(body, 'universities') },
      { key: 'related_scholarships', read: () => readStringArray(body, 'related_scholarships') }
    ],
    { partial, defaults: { field: 'Uncategorized' }, notNull: ['name', 'field', 'description'] }
  );
};
