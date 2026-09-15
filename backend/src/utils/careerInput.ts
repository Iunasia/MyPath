import {
  collectFields,
  isPlainObject,
  readString,
  readStringArray,
  type FieldErrors,
} from './validation';

export interface CareerWrite {
  fields: Record<string, unknown>;
  errors: FieldErrors;
}

/** Validation for admin career create/edit. */
export const parseCareerWrite = (body: unknown, { partial }: { partial: boolean }): CareerWrite => {
  if (!isPlainObject(body)) return { fields: {}, errors: { body: 'Expected a JSON object.' } };

  return collectFields(
    [
      { key: 'title', required: true, read: () => readString(body, 'title', { min: 1, max: 200 }) },
      { key: 'category', read: () => readString(body, 'category', { max: 160 }) },
      { key: 'description', required: true, read: () => readString(body, 'description', { min: 1, max: 5000 }) },
      { key: 'responsibilities', read: () => readString(body, 'responsibilities', { max: 3000 }) },
      { key: 'average_salary', read: () => readString(body, 'average_salary', { max: 200 }) },
      { key: 'growth_outlook', read: () => readString(body, 'growth_outlook', { max: 200 }) },
      { key: 'education_required', read: () => readString(body, 'education_required', { max: 300 }) },
      { key: 'personality_fit', read: () => readString(body, 'personality_fit', { max: 500 }) },
      { key: 'required_skills', read: () => readStringArray(body, 'required_skills') },
      { key: 'related_majors', read: () => readStringArray(body, 'related_majors') }
    ],
    { partial, defaults: { category: 'Uncategorized' }, notNull: ['title', 'category', 'description'] }
  );
};
