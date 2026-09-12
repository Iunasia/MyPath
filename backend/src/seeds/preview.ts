import dotenv from 'dotenv';
dotenv.config();

import { DATA_DIR, importAll } from './sources';

/**
 * Dry run: parse the workbooks and print what would be inserted, without
 * touching the database.
 *
 *   npm run seed:preview              # reads src/seeds/data
 *   npm run seed:preview -- ../sheets # reads another directory
 *   npm run seed:preview -- --json    # full records as JSON
 */
const preview = async () => {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const dir = args.find(a => !a.startsWith('--')) ?? DATA_DIR;

  const { careers, majors, scholarships, universities, sheets } = await importAll(dir);

  if (asJson) {
    console.log(JSON.stringify({ careers, majors, scholarships, universities }, null, 2));
    return;
  }

  console.log(`Source directory: ${dir}\n`);

  if (sheets.length === 0) {
    console.log('No sheets with a recognizable header row were found.');
    return;
  }

  for (const sheet of sheets) {
    const label = sheet.entity === 'unrecognized' ? '⚠ unrecognized' : sheet.entity;
    console.log(`${sheet.file} → "${sheet.sheet}" [${label}]: ${sheet.imported} imported, ${sheet.skipped} skipped`);
  }

  console.log(`\n=== ${universities.length} UNIVERSITIES ===\n`);
  for (const record of universities) {
    console.log(`— ${record.name}  [${record.slug ?? 'no slug'}]`);
    console.log(`  type     : ${record.type ?? '—'}  |  city: ${record.city}`);
    console.log(`  website  : ${record.website || '—'}`);
    console.log(`  programs : ${record.programs.join(' | ') || '—'}`);
    console.log('');
  }

  console.log(`\n=== ${careers.length} CAREERS ===\n`);
  for (const record of careers) {
    console.log(`— ${record.title}  (${record.category})`);
    console.log(`  demand    : ${record.growth_outlook ?? '—'}`);
    console.log(`  salary    : ${record.average_salary ?? '— (not in sheet)'}`);
    console.log(`  education : ${record.education_required ?? '—'}`);
    console.log(`  skills    : ${record.required_skills.join(' | ') || '—'}`);
    console.log(`  majors    : ${record.related_majors.join(' | ') || '—'}`);
    console.log('');
  }

  console.log(`\n=== ${majors.length} MAJORS ===\n`);
  for (const record of majors) {
    console.log(`— ${record.name}  (${record.field})`);
    console.log(`  demand      : ${record.job_market_demand ?? '—'}`);
    console.log(`  subjects    : ${record.subjects.join(' | ') || '—'}`);
    console.log(`  careers     : ${record.related_careers.join(' | ') || '—'}`);
    console.log(`  universities: ${record.universities.join(' | ') || '—'}`);
    console.log(`  scholarships: ${record.related_scholarships.join(' | ') || '—'}`);
    console.log('');
  }

  console.log(`\n=== ${scholarships.length} SCHOLARSHIPS ===\n`);
  for (const record of scholarships) {
    console.log(`— ${record.title}  [${record.opportunity_type}]`);
    console.log(`  provider : ${record.provider} (${record.provider_type})`);
    console.log(`  level    : ${record.degree_level ?? '—'}`);
    console.log(`  amount   : ${record.amount}`);
    // Shown in the sheet's own timezone so it reads as written there.
    const when = record.deadline
      ? record.deadline.toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh', dateStyle: 'medium', timeStyle: 'short' })
      : '—';
    console.log(`  deadline : ${when}  note: ${record.deadline_note ?? '—'}`);
    console.log(`  documents: ${record.documents.join(' | ') || '—'}`);
    console.log(`  link     : ${record.source_url || '(none)'}  [${record.source_type}/${record.verified_status}]`);
    console.log(`  image    : ${record.image_url ?? '—'}`);
    if (record.safety_warnings.length) {
      console.log(`  warnings : ${record.safety_warnings.join(' | ')}`);
    }
    console.log('');
  }
};

preview().catch(err => {
  console.error('Preview failed:', err);
  process.exit(1);
});
